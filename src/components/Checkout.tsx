import { useState, useEffect } from 'react';
import { X, CreditCard, Loader2, Banknote, Wallet, Building2, Check, Lock, Truck, Shield } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { supabase } from '../lib/supabase';

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

const iconMap: Record<string, React.ReactNode> = {
  'credit-card': <CreditCard className="w-5 h-5" />,
  'banknote': <Banknote className="w-5 h-5" />,
  'wallet': <Wallet className="w-5 h-5" />,
  'building-2': <Building2 className="w-5 h-5" />,
};

export function Checkout({ isOpen, onClose }: CheckoutProps) {
  const { items, getTotalPrice, clearCart } = useCart();
  const { formatPrice, currency } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [step, setStep] = useState<'info' | 'payment' | 'review'>('info');
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.postalCode) newErrors.postalCode = 'Postal code is required';
    if (!formData.country) newErrors.country = 'Country is required';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 'info') {
      if (validateForm()) {
        setStep('payment');
      }
      return;
    }
    
    if (step === 'payment') {
      if (!selectedPaymentMethod) {
        alert('Please select a payment method');
        return;
      }
      setStep('review');
      return;
    }

    // Final submission
    setLoading(true);

    try {
      // Create customer
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert([{
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          shipping_address: {
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
            country: formData.country,
          },
        }])
        .select()
        .single();

      if (customerError) throw customerError;

      const newOrderNumber = `ORD-${Date.now()}`;
      const subtotal = getTotalPrice();
      const shipping = subtotal > 50 ? 0 : 4.99;
      const tax = subtotal * 0.1;
      const totalAmount = subtotal + shipping + tax;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          order_number: newOrderNumber,
          customer_id: customer.id,
          customer_email: formData.email,
          customer_name: `${formData.firstName} ${formData.lastName}`,
          subtotal: subtotal,
          shipping_amount: shipping,
          tax_amount: tax,
          total_amount: totalAmount,
          status: 'pending',
          payment_status: 'pending',
          currency_code: currency?.code || 'USD',
          shipping_address: {
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
            country: formData.country,
          },
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      for (const item of items) {
        await supabase.from('order_items').insert([{
          order_id: order.id,
          product_id: item.product.id,
          product_name: item.product.name,
          product_sku: item.product.sku,
          quantity: item.quantity,
          unit_price: item.product.base_price,
          total_price: item.product.base_price * item.quantity,
        }]);
      }

      setOrderNumber(newOrderNumber);
      setOrderComplete(true);
      clearCart();

    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error creating order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (orderComplete) {
      setOrderComplete(false);
      setStep('info');
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        postalCode: '',
        country: '',
        phone: '',
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  const subtotal = getTotalPrice();
  const shipping = subtotal > 50 ? 0 : 4.99;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  // Order Complete Screen
  if (orderComplete) {
    return (
      <>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in" />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center animate-scale-in shadow-2xl">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
            <p className="text-gray-600 mb-4">
              Thank you for your purchase. Your order has been received.
            </p>
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">Order Number</p>
              <p className="text-lg font-bold text-emerald-600">{orderNumber}</p>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              A confirmation email will be sent to {formData.email}
            </p>
            <button
              onClick={handleClose}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in" onClick={handleClose} />

      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl max-w-4xl w-full shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
              aria-label="Close checkout"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-4 sm:p-6 md:p-8">
              {/* Progress Steps */}
              <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
                {['info', 'payment', 'review'].map((s, i) => (
                  <div key={s} className="flex items-center">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-colors ${
                      step === s ? 'bg-emerald-600 text-white' :
                      ['info', 'payment', 'review'].indexOf(step) > i ? 'bg-emerald-100 text-emerald-600' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {['info', 'payment', 'review'].indexOf(step) > i ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : i + 1}
                    </div>
                    {i < 2 && (
                      <div className={`w-6 sm:w-12 h-0.5 mx-1 sm:mx-2 ${
                        ['info', 'payment', 'review'].indexOf(step) > i ? 'bg-emerald-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-5 gap-8">
                {/* Form Section */}
                <div className="md:col-span-3">
                  <form onSubmit={handleSubmit}>
                    {step === 'info' && (
                      <div className="space-y-6 animate-fade-in">
                        <h2 className="text-2xl font-bold text-gray-900">Shipping Information</h2>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={`input-field ${errors.email ? 'border-red-300 focus:ring-red-500' : ''}`}
                            placeholder="your@email.com"
                          />
                          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <input
                              type="text"
                              value={formData.firstName}
                              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                              className={`input-field ${errors.firstName ? 'border-red-300' : ''}`}
                            />
                            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <input
                              type="text"
                              value={formData.lastName}
                              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                              className={`input-field ${errors.lastName ? 'border-red-300' : ''}`}
                            />
                            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                          <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className={`input-field ${errors.address ? 'border-red-300' : ''}`}
                            placeholder="Street address"
                          />
                          {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                            <input
                              type="text"
                              value={formData.city}
                              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                              className={`input-field ${errors.city ? 'border-red-300' : ''}`}
                            />
                            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                            <input
                              type="text"
                              value={formData.postalCode}
                              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                              className={`input-field ${errors.postalCode ? 'border-red-300' : ''}`}
                            />
                            {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                            <input
                              type="text"
                              value={formData.country}
                              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                              className={`input-field ${errors.country ? 'border-red-300' : ''}`}
                            />
                            {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              className={`input-field ${errors.phone ? 'border-red-300' : ''}`}
                            />
                            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 'payment' && (
                      <div className="space-y-6 animate-fade-in">
                        <h2 className="text-2xl font-bold text-gray-900">Payment Method</h2>
                        
                        <div className="space-y-3">
                          {paymentMethods.map((method) => (
                            <label
                              key={method.id}
                              className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                selectedPaymentMethod === method.id
                                  ? 'border-emerald-500 bg-emerald-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name="paymentMethod"
                                value={method.id}
                                checked={selectedPaymentMethod === method.id}
                                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                className="mt-1 text-emerald-600 focus:ring-emerald-500"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={selectedPaymentMethod === method.id ? 'text-emerald-600' : 'text-gray-600'}>
                                    {iconMap[method.icon] || <CreditCard className="w-5 h-5" />}
                                  </span>
                                  <span className="font-semibold text-gray-900">{method.name}</span>
                                </div>
                                <p className="text-sm text-gray-500">{method.description}</p>
                              </div>
                            </label>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => setStep('info')}
                          className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                        >
                          ← Back to shipping
                        </button>
                      </div>
                    )}

                    {step === 'review' && (
                      <div className="space-y-6 animate-fade-in">
                        <h2 className="text-2xl font-bold text-gray-900">Review Order</h2>
                        
                        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                          <h3 className="font-semibold text-gray-900">Shipping Address</h3>
                          <p className="text-gray-600">
                            {formData.firstName} {formData.lastName}<br />
                            {formData.address}<br />
                            {formData.city}, {formData.postalCode}<br />
                            {formData.country}
                          </p>
                          <p className="text-gray-600">{formData.email}</p>
                          <p className="text-gray-600">{formData.phone}</p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4">
                          <h3 className="font-semibold text-gray-900 mb-2">Payment Method</h3>
                          <p className="text-gray-600">
                            {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setStep('payment')}
                          className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                        >
                          ← Back to payment
                        </button>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : step === 'review' ? (
                        <>
                          <Lock className="h-5 w-5" />
                          Place Order
                        </>
                      ) : (
                        'Continue'
                      )}
                    </button>
                  </form>
                </div>

                {/* Order Summary */}
                <div className="md:col-span-2">
                  <div className="bg-gray-50 rounded-2xl p-6 sticky top-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>

                    <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                      {items.map(item => (
                        <div key={item.product.id} className="flex gap-3">
                          <div className="relative">
                            <img
                              src={item.product.images[0] || 'https://via.placeholder.com/60'}
                              alt={item.product.name}
                              className="w-14 h-14 object-cover rounded-lg"
                            />
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-gray-700 text-white text-xs rounded-full flex items-center justify-center">
                              {item.quantity}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">
                              {item.product.name}
                            </p>
                            <p className="text-sm text-emerald-600 font-semibold">
                              {formatPrice(item.product.base_price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-gray-200 pt-4 space-y-2">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Shipping</span>
                        <span className={shipping === 0 ? 'text-emerald-600' : ''}>
                          {shipping === 0 ? 'Free' : formatPrice(shipping)}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Tax</span>
                        <span>{formatPrice(tax)}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-2 flex justify-between text-lg font-bold text-gray-900">
                        <span>Total</span>
                        <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                          {formatPrice(total)}
                        </span>
                      </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Lock className="w-4 h-4 text-emerald-600" />
                        <span>Secure SSL Encryption</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Truck className="w-4 h-4 text-emerald-600" />
                        <span>Free shipping over $50</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Shield className="w-4 h-4 text-emerald-600" />
                        <span>30-day money back guarantee</span>
                      </div>
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
