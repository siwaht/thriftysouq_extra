import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: apiKeyData } = await supabase
      .from('api_keys')
      .select('key_public, key_secret, environment')
      .eq('provider', 'paypal')
      .eq('is_active', true)
      .maybeSingle();

    if (!apiKeyData) {
      throw new Error('PayPal API key not configured');
    }

    const baseUrl = apiKeyData.environment === 'production'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

    const getAccessToken = async () => {
      const auth = btoa(`${apiKeyData.key_public}:${apiKeyData.key_secret}`);
      const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });
      const data = await response.json();
      return data.access_token;
    };

    const { action, orderId, amount, currency = 'USD' } = await req.json();

    if (action === 'create_order') {
      const accessToken = await getAccessToken();

      const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              currency_code: currency,
              value: amount.toFixed(2),
            },
            reference_id: orderId,
          }],
        }),
      });

      const paypalOrder = await response.json();

      await supabase.from('payment_transactions').insert([{
        order_id: orderId,
        payment_method: 'paypal',
        transaction_id: paypalOrder.id,
        amount,
        currency,
        status: 'pending',
        metadata: { paypal_order: paypalOrder },
      }]);

      return new Response(
        JSON.stringify({ orderId: paypalOrder.id }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    } else if (action === 'capture_order') {
      const { paypalOrderId } = await req.json();
      const accessToken = await getAccessToken();

      const response = await fetch(`${baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const captureData = await response.json();
      const status = captureData.status === 'COMPLETED' ? 'completed' : 'failed';

      await supabase
        .from('payment_transactions')
        .update({
          status,
          processed_at: new Date().toISOString(),
          metadata: { capture_data: captureData },
        })
        .eq('transaction_id', paypalOrderId);

      if (status === 'completed') {
        await supabase
          .from('orders')
          .update({ payment_status: 'paid' })
          .eq('id', orderId);
      }

      return new Response(
        JSON.stringify({ status, captureData }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    } else if (action === 'refund') {
      const { captureId, refundAmount } = await req.json();
      const accessToken = await getAccessToken();

      const response = await fetch(`${baseUrl}/v2/payments/captures/${captureId}/refund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: refundAmount ? {
            value: refundAmount.toFixed(2),
            currency_code: currency,
          } : undefined,
        }),
      });

      const refundData = await response.json();

      await supabase
        .from('payment_transactions')
        .update({ status: 'refunded' })
        .eq('transaction_id', captureId);

      return new Response(
        JSON.stringify({ success: true, refundData }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    throw new Error('Invalid action');
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});