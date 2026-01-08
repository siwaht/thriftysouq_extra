import { useState, useEffect } from 'react';
import { X, Star, ShoppingCart, Check, Minus, Plus, Heart, Share2, Truck, Shield, RefreshCw } from 'lucide-react';
import { Product, ProductReview, supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import { useCurrency } from '../contexts/CurrencyContext';

interface ProductDetailProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetail({ product, isOpen, onClose }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (product) {
      setSelectedImage(0);
      setQuantity(1);
      setActiveTab('description');
      loadReviews();
    }
  }, [product]);

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

  const loadReviews = async () => {
    if (!product) return;

    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', product.id)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: product.short_description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  };

  if (!isOpen || !product) return null;

  const hasDiscount = product.compare_at_price > 0;
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_at_price - product.base_price) / product.compare_at_price) * 100)
    : 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div 
            className="relative bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 p-2.5 bg-white/90 backdrop-blur-sm hover:bg-gray-100 rounded-full transition-colors shadow-lg"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="grid md:grid-cols-2 max-h-[90vh] overflow-y-auto">
              {/* Image Gallery */}
              <div className="p-6 md:p-8 bg-gray-50">
                <div className="sticky top-0">
                  {/* Main Image */}
                  <div className="aspect-square bg-white rounded-2xl overflow-hidden mb-4 shadow-inner">
                    <img
                      src={product.images[selectedImage] || product.images[0] || 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=600'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Thumbnail Gallery */}
                  {product.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-3">
                      {product.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`aspect-square bg-white rounded-xl overflow-hidden border-2 transition-all ${
                            selectedImage === index 
                              ? 'border-emerald-500 ring-2 ring-emerald-500/20' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${product.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6 md:p-8 overflow-y-auto">
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {hasDiscount && (
                    <span className="px-3 py-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-bold rounded-lg">
                      {discountPercent}% OFF
                    </span>
                  )}
                  {product.is_featured && (
                    <span className="px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-sm font-bold rounded-lg">
                      Featured
                    </span>
                  )}
                  {product.stock_quantity <= product.low_stock_threshold && product.stock_quantity > 0 && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-lg">
                      Only {product.stock_quantity} left
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  {product.name}
                </h1>

                {/* Rating */}
                {product.review_count > 0 && (
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(product.average_rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-gray-600 font-medium">
                      {product.average_rating.toFixed(1)}
                    </span>
                    <span className="text-gray-400">•</span>
                    <button 
                      onClick={() => setActiveTab('reviews')}
                      className="text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      {product.review_count} reviews
                    </button>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {formatPrice(product.base_price)}
                  </span>
                  {hasDiscount && (
                    <span className="text-xl text-gray-400 line-through">
                      {formatPrice(product.compare_at_price)}
                    </span>
                  )}
                </div>

                {/* Short Description */}
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {product.short_description || product.description.substring(0, 150)}
                </p>

                {/* Quantity & Add to Cart */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-700 font-medium">Quantity:</span>
                    <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 py-2.5 hover:bg-gray-100 transition-colors disabled:opacity-50"
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-6 py-2.5 font-semibold text-gray-900 border-x-2 border-gray-200">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                        className="px-4 py-2.5 hover:bg-gray-100 transition-colors disabled:opacity-50"
                        disabled={quantity >= product.stock_quantity}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="text-sm text-gray-500">
                      {product.stock_quantity} available
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleAddToCart}
                      disabled={product.stock_quantity === 0}
                      className={`flex-1 py-4 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                        addedToCart
                          ? 'bg-emerald-500 text-white'
                          : product.stock_quantity === 0
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5'
                      }`}
                    >
                      {addedToCart ? (
                        <>
                          <Check className="h-5 w-5" />
                          Added to Cart!
                        </>
                      ) : product.stock_quantity === 0 ? (
                        'Out of Stock'
                      ) : (
                        <>
                          <ShoppingCart className="h-5 w-5" />
                          Add to Cart
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setIsWishlisted(!isWishlisted)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isWishlisted
                          ? 'bg-rose-50 border-rose-200 text-rose-500'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={handleShare}
                      className="p-4 rounded-xl border-2 border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all"
                      aria-label="Share product"
                    >
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-3 mb-6 p-4 bg-gray-50 rounded-xl">
                  <div className="text-center">
                    <Truck className="h-5 w-5 mx-auto mb-1 text-emerald-600" />
                    <span className="text-xs text-gray-600">Free Shipping</span>
                  </div>
                  <div className="text-center">
                    <Shield className="h-5 w-5 mx-auto mb-1 text-emerald-600" />
                    <span className="text-xs text-gray-600">Secure Payment</span>
                  </div>
                  <div className="text-center">
                    <RefreshCw className="h-5 w-5 mx-auto mb-1 text-emerald-600" />
                    <span className="text-xs text-gray-600">30-Day Returns</span>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-4">
                  <div className="flex gap-6">
                    {(['description', 'specs', 'reviews'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 font-medium capitalize transition-colors relative ${
                          activeTab === tab
                            ? 'text-emerald-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {tab === 'reviews' ? `Reviews (${reviews.length})` : tab}
                        {activeTab === tab && (
                          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Content */}
                <div className="min-h-[200px]">
                  {activeTab === 'description' && (
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {product.description}
                      </p>
                    </div>
                  )}

                  {activeTab === 'specs' && (
                    <div>
                      {Object.keys(product.specifications || {}).length > 0 ? (
                        <dl className="space-y-3">
                          {Object.entries(product.specifications).map(([key, value]) => (
                            <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                              <dt className="text-gray-600 capitalize">
                                {key.replace(/_/g, ' ')}
                              </dt>
                              <dd className="text-gray-900 font-medium">{String(value)}</dd>
                            </div>
                          ))}
                        </dl>
                      ) : (
                        <p className="text-gray-500 text-center py-8">No specifications available</p>
                      )}
                    </div>
                  )}

                  {activeTab === 'reviews' && (
                    <div className="space-y-4">
                      {reviews.length > 0 ? (
                        reviews.map(review => (
                          <div key={review.id} className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                <span className="text-emerald-700 font-semibold">
                                  {review.customer_name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-gray-900">
                                    {review.customer_name}
                                  </span>
                                  {review.is_verified_purchase && (
                                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                      Verified
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-3.5 w-3.5 ${
                                          i < review.rating
                                            ? 'fill-amber-400 text-amber-400'
                                            : 'text-gray-200'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {new Date(review.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {review.title && (
                              <h4 className="font-semibold text-gray-900 mb-1">{review.title}</h4>
                            )}
                            <p className="text-gray-700 text-sm">{review.comment}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-8">No reviews yet</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
