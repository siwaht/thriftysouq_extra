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
      className="card-premium group cursor-pointer overflow-hidden transform hover:-translate-y-2 h-full flex flex-col"
      role="button"
      tabIndex={0}
      aria-label={`View ${product.name}`}
      onKeyDown={(e) => e.key === 'Enter' && onClick(product)}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
        <img
          src={product.images[0] || 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=400'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          loading="lazy"
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {hasDiscount && (
            <span className="px-3 py-1 bg-rose-500 text-white text-xs font-bold rounded-full shadow-lg animate-fade-in backdrop-blur-md bg-opacity-90">
              -{discountPercent}%
            </span>
          )}
          {product.is_featured && (
            <span className="px-3 py-1 bg-gold-500 text-white text-xs font-bold rounded-full shadow-lg backdrop-blur-md bg-opacity-90">
              Featured
            </span>
          )}
          {product.stock_quantity <= product.low_stock_threshold && product.stock_quantity > 0 && (
            <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
              Low Stock
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 p-2.5 rounded-full transition-all duration-300 ${isWishlisted
              ? 'bg-rose-500 text-white shadow-lg scale-110'
              : 'bg-white/80 backdrop-blur-md text-gray-600 hover:bg-white hover:text-rose-500 shadow-glass'
            } ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Quick add button */}
        {product.stock_quantity > 0 && (
          <button
            onClick={handleAddToCart}
            className={`absolute bottom-4 left-4 right-4 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${addedToCart
                ? 'bg-brand-500 text-white'
                : 'bg-white/95 backdrop-blur-xl text-brand-950 hover:bg-brand-600 hover:text-white'
              } ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            aria-label="Add to cart"
          >
            <ShoppingBag className="h-4 w-4" />
            {addedToCart ? 'Added to Cart' : 'Quick Add'}
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
      <div className="p-5 flex flex-col flex-grow">
        {/* Product name */}
        <h3 className="font-serif font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-brand-600 transition-colors text-lg">
          {product.name}
        </h3>

        {/* Short description */}
        <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed flex-grow">
          {product.short_description || 'Premium quality product'}
        </p>

        <div className="mt-auto">
          {/* Rating */}
          {product.review_count > 0 && (
            <div className="flex items-center gap-1.5 mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${i < Math.floor(product.average_rating)
                        ? 'fill-gold-400 text-gold-400'
                        : i < product.average_rating
                          ? 'fill-gold-400/50 text-gold-400'
                          : 'text-gray-200'
                      }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 font-medium">
                ({product.review_count})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-lg font-bold text-brand-900">
              {formatPrice(product.base_price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
