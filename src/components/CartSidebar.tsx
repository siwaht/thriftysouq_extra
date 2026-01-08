import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useCurrency } from '../contexts/CurrencyContext';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export function CartSidebar({ isOpen, onClose, onCheckout }: CartSidebarProps) {
  const { items, updateQuantity, removeFromCart, getTotalPrice, getTotalItems } = useCart();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const subtotal = getTotalPrice();
  const shipping = subtotal > 50 ? 0 : 4.99;
  const total = subtotal + shipping;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Shopping Cart</h2>
              <p className="text-sm text-gray-500">{getTotalItems()} items</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart Items */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 text-center mb-6">
              Looks like you haven't added any items to your cart yet.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.map(item => (
                <div 
                  key={item.product.id} 
                  className="flex gap-4 bg-gray-50 p-4 rounded-2xl group hover:bg-gray-100 transition-colors"
                >
                  <div className="relative">
                    <img
                      src={item.product.images[0] || 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=200'}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-xl"
                    />
                    {item.product.compare_at_price > 0 && (
                      <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-rose-500 text-white text-[10px] font-bold rounded">
                        SALE
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1 truncate">
                      {item.product.name}
                    </h3>
                    <p className="text-sm text-emerald-600 font-semibold mb-3">
                      {formatPrice(item.product.base_price)}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1.5 hover:bg-gray-100 rounded-l-lg transition-colors disabled:opacity-50"
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>

                        <span className="w-8 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1.5 hover:bg-gray-100 rounded-r-lg transition-colors disabled:opacity-50"
                          disabled={item.quantity >= item.product.stock_quantity}
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 p-6 space-y-4 bg-gray-50">
              {/* Free Shipping Progress */}
              {subtotal < 50 && (
                <div className="bg-emerald-50 rounded-xl p-3">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-emerald-700">
                      Add {formatPrice(50 - subtotal)} more for free shipping!
                    </span>
                    <span className="text-emerald-600 font-medium">
                      {Math.round((subtotal / 50) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-emerald-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((subtotal / 50) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={`font-medium ${shipping === 0 ? 'text-emerald-600' : ''}`}>
                    {shipping === 0 ? 'Free' : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={onCheckout}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 group"
              >
                Proceed to Checkout
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onClose}
                className="w-full py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
              >
                Continue Shopping
              </button>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-4 pt-2 text-xs text-gray-500">
                <span>🔒 Secure Checkout</span>
                <span>•</span>
                <span>💳 All Cards Accepted</span>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
