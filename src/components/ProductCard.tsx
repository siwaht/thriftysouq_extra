import { Star, ShoppingBag, Heart } from 'lucide-react';
import { useState } from 'react';
import { Product } from '../lib/supabase';
import { useCurrency } from '../contexts/CurrencyContext';
import { useCart } from '../contexts/CartContext';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const hasDiscount = product.compare_at_price > 0;
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_at_price - product.base_price) / product.compare_at_price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock_quantity > 0) {
      addToCart(product, 1);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 1500);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <article
      onClick={() => onClick(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-emerald-200 shadow-sm hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-500 transform hover:-translate-y-1"
      role="button"
      tabIndex={0}
      aria-label={`View ${product.name}`}
      onKeyDown={(e) => e.key === 'Enter' && onClick(product)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <img
          src={product.images[0] || 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=400'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {hasDiscount && (
            <span className="px-2.5 py-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold rounded-lg shadow-lg animate-fade-in">
              -{discountPercent}%
            </span>
          )}
          {product.is_featured && (
            <span className="px-2.5 py-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-bold rounded-lg shadow-lg">
              Featured
            </span>
          )}
          {product.stock_quantity <= product.low_stock_threshold && product.stock_quantity > 0 && (
            <span className="px-2.5 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold rounded-lg shadow-lg">
              Low Stock
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 p-2.5 rounded-full transition-all duration-300 ${
            isWishlisted 
              ? 'bg-rose-500 text-white shadow-lg' 
              : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-rose-500 shadow-md'
          } ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Quick add button */}
        {product.stock_quantity > 0 && (
          <button
            onClick={handleAddToCart}
            className={`absolute bottom-3 left-3 right-3 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              addedToCart
                ? 'bg-emerald-500 text-white'
                : 'bg-white/95 backdrop-blur-sm text-gray-900 hover:bg-emerald-500 hover:text-white shadow-lg'
            } ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            aria-label="Add to cart"
          >
            <ShoppingBag className="h-4 w-4" />
            {addedToCart ? 'Added!' : 'Quick Add'}
          </button>
        )}

        {/* Out of stock overlay */}
        {product.stock_quantity === 0 && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <span className="px-4 py-2 bg-white/20 backdrop-blur-md text-white text-sm font-semibold rounded-lg border border-white/30">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Product name */}
        <h3 className="font-semibold text-gray-900 mb-1.5 line-clamp-1 group-hover:text-emerald-600 transition-colors text-lg">
          {product.name}
        </h3>

        {/* Short description */}
        <p className="text-sm text-gray-500 mb-3 line-clamp-2 leading-relaxed">
          {product.short_description || 'Premium quality product'}
        </p>

        {/* Rating */}
        {product.review_count > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.average_rating)
                      ? 'fill-amber-400 text-amber-400'
                      : i < product.average_rating
                      ? 'fill-amber-400/50 text-amber-400'
                      : 'text-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 font-medium">
              {product.average_rating.toFixed(1)}
            </span>
            <span className="text-sm text-gray-400">
              ({product.review_count})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            {formatPrice(product.base_price)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.compare_at_price)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
