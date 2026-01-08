import { useState, useEffect } from 'react';
import { X, CreditCard, Loader2, Banknote, Wallet, Building2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { supabase } from '../lib/supabase';
import { loadStripe } from '@stripe/stripe-js';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  description: string;
  icon: string;
}

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Checkout({ isOpen, onClose }: CheckoutProps) {
  const { items, getTotalPrice, clearCart } = useCart();
  const { formatPrice, currency } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [stripePublicKey, setStripePublicKey] = useState<string>('');
  const [paypalClientId, setPaypalClientId] = useState<string>('');
  const [showPaymentUI, setShowPaymentUI] = useState(false);
  const [orderId, setOrderId] = useState<string>('');

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    phone: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadPaymentMethods();
      loadApiKeys();
    }
  }, [isOpen]);

  const loadPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      setPaymentMethods(data || []);
      if (data && data.length > 0) {
        setSelectedPaymentMethod(data[0].id);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  const loadApiKeys = async () => {
    try {
      const { data: stripeKey } = await supabase
        .from('api_keys')
        .select('key_public')
        .eq('provider', 'stripe')
        .eq('is_active', true)
        .maybeSingle();

      if (stripeKey) {
        setStripePublicKey(stripeKey.key_public);
      }

      const { data: paypalKey } = await supabase
        .from('api_keys')
        .select('key_public')
        .eq('provider', 'paypal')
        .eq('is_active', true)
        .maybeSingle();

      if (paypalKey) {
        setPaypalClientId(paypalKey.key_public);
      }
    } catch (error) {
      console.error('Error loading API keys:', error);
    }
  };

  const getPaymentIcon = (icon: string) => {
    switch (icon) {
      case 'banknote':
        return <Banknote className="w-5 h-5" />;
      case 'wallet':
        return <Wallet className="w-5 h-5" />;
      case 'building-2':
        return <Building2 className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: customer } = await supabase
        .from('customers')
        .insert([{
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
        }])
        .select()
        .single();

      if (!customer) throw new Error('Failed to create customer');

      const orderNumber = `ORD-${Date.now()}`;
      const totalAmount = getTotalPrice() * 1.1;

      const { data: order } = await supabase
        .from('orders')
        .insert([{
          order_number: orderNumber,
          customer_id: customer.id,
          total_amount: totalAmount,
          status: 'pending',
          payment_status: 'pending',
          currency_code: currency?.code || 'USD',
          shipping_address: JSON.stringify({
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
            country: formData.country,
          }),
        }])
        .select()
        .single();

      if (!order) throw new Error('Failed to create order');

      for (const item of items) {
        await supabase.from('order_items').insert([{
          order_id: order.id,
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.base_price,
        }]);
      }

      setOrderId(order.id);

      const selectedMethod = paymentMethods.find(m => m.id === selectedPaymentMethod);
      if (selectedMethod?.code === 'stripe' || selectedMethod?.code === 'paypal') {
        setShowPaymentUI(true);
      } else {
        setOrderComplete(true);
        clearCart();
        setTimeout(() => {
          setOrderComplete(false);
          onClose();
        }, 3000);
      }
    } catch (error) {
      alert('Error creating order: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleStripePayment = async () => {
    if (!stripePublicKey || !orderId) return;

    const stripe = await loadStripe(stripePublicKey);
    if (!stripe) return;

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        action: 'create_payment_intent',
        orderId,
        amount: getTotalPrice() * 1.1,
        currency: currency?.code || 'USD',
      }),
    });

    const { clientSecret } = await response.json();

    const { error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: {
          token: 'tok_visa',
        },
      },
    });

    if (!error) {
      setOrderComplete(true);
      clearCart();
      setTimeout(() => {
        setOrderComplete(false);
        onClose();
      }, 3000);
    }
  };

  if (!isOpen) return null;

  if (orderComplete) {
    return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50"></div>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-8 max-w-md text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Complete!</h2>
            <p className="text-gray-600">
              Thank you for your purchase. You will receive a confirmation email shortly.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose}></div>

      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-lg max-w-4xl w-full">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Checkout</h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={(e) =>
                            setFormData({ ...formData, firstName: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={(e) =>
                            setFormData({ ...formData, lastName: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.city}
                          onChange={(e) =>
                            setFormData({ ...formData, city: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.postalCode}
                          onChange={(e) =>
                            setFormData({ ...formData, postalCode: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.country}
                        onChange={(e) =>
                          setFormData({ ...formData, country: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Payment Method
                      </label>
                      <div className="space-y-2">
                        {paymentMethods.map((method) => (
                          <label
                            key={method.id}
                            className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              selectedPaymentMethod === method.id
                                ? 'border-emerald-600 bg-emerald-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="paymentMethod"
                              value={method.id}
                              checked={selectedPaymentMethod === method.id}
                              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                              className="mt-1"
                              required
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <div className={selectedPaymentMethod === method.id ? 'text-emerald-600' : 'text-gray-600'}>
                                  {getPaymentIcon(method.icon)}
                                </div>
                                <span className="font-medium text-gray-900">{method.name}</span>
                              </div>
                              <p className="text-sm text-gray-600">{method.description}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !selectedPaymentMethod}
                      className="w-full py-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-5 w-5" />
                          Complete Order
                        </>
                      )}
                    </button>
                  </form>
                </div>

                <div>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Order Summary
                    </h3>

                    <div className="space-y-3 mb-4">
                      {items.map(item => (
                        <div key={item.product.id} className="flex gap-3">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">
                              {item.product.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              Qty: {item.quantity} × {formatPrice(item.product.base_price)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-gray-700">
                        <span>Subtotal</span>
                        <span>{formatPrice(getTotalPrice())}</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Shipping</span>
                        <span>Free</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Tax</span>
                        <span>{formatPrice(getTotalPrice() * 0.1)}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between text-xl font-bold text-gray-900">
                        <span>Total</span>
                        <span>{formatPrice(getTotalPrice() * 1.1)}</span>
                      </div>
                    </div>

                    <div className="mt-4 text-xs text-gray-600">
                      <p>Currency: {currency?.name} ({currency?.code})</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
