import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17';

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
      .select('key_secret')
      .eq('provider', 'stripe')
      .eq('is_active', true)
      .maybeSingle();

    if (!apiKeyData) {
      throw new Error('Stripe API key not configured');
    }

    const stripe = new Stripe(apiKeyData.key_secret, {
      apiVersion: '2024-12-18.acacia',
    });

    const { action, orderId, amount, currency = 'USD' } = await req.json();

    if (action === 'create_payment_intent') {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        metadata: { orderId },
      });

      await supabase.from('payment_transactions').insert([{
        order_id: orderId,
        payment_method: 'stripe',
        transaction_id: paymentIntent.id,
        amount,
        currency,
        status: 'pending',
        metadata: { payment_intent: paymentIntent },
      }]);

      return new Response(
        JSON.stringify({
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    } else if (action === 'confirm_payment') {
      const { paymentIntentId } = await req.json();
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      const status = paymentIntent.status === 'succeeded' ? 'completed' : 'failed';

      await supabase
        .from('payment_transactions')
        .update({
          status,
          processed_at: new Date().toISOString(),
        })
        .eq('transaction_id', paymentIntentId);

      if (status === 'completed') {
        await supabase
          .from('orders')
          .update({ payment_status: 'paid' })
          .eq('id', orderId);
      }

      return new Response(
        JSON.stringify({ status, paymentIntent }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    } else if (action === 'refund') {
      const { paymentIntentId, refundAmount } = await req.json();

      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: refundAmount ? Math.round(refundAmount * 100) : undefined,
      });

      await supabase
        .from('payment_transactions')
        .update({ status: 'refunded' })
        .eq('transaction_id', paymentIntentId);

      return new Response(
        JSON.stringify({ success: true, refund }),
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