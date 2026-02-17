import { useState, useEffect } from 'react';
import { supabase, Product } from '../lib/supabase';
import { ProductCard } from './ProductCard';
import { Package, RefreshCw, Sparkles, ShoppingBag } from 'lucide-react';

// Fallback demo products when database is empty
const DEMO_PRODUCTS: Product[] = [
  { id: 'demo-1', name: 'Diamond Solitaire Ring', slug: 'diamond-solitaire-ring', description: 'Stunning 1-carat diamond solitaire ring set in 18K white gold. A timeless piece of elegance that captures light beautifully.', short_description: '1-carat diamond in 18K white gold', category_id: '', base_price: 2499.99, compare_at_price: 3499.99, sku: 'JWL-DSR-001', stock_quantity: 15, low_stock_threshold: 3, images: ['https://images.pexels.com/photos/10983783/pexels-photo-10983783.jpeg?auto=compress&cs=tinysrgb&w=600'], specifications: {}, is_featured: true, is_active: true, average_rating: 4.8, review_count: 24, created_at: '', updated_at: '' },
  { id: 'demo-2', name: 'Pearl Necklace Set', slug: 'pearl-necklace-set', description: 'Elegant freshwater pearl necklace with matching earrings. Perfect for formal occasions and special events.', short_description: 'Freshwater pearl necklace & earrings', category_id: '', base_price: 349.99, compare_at_price: 499.99, sku: 'JWL-PNS-002', stock_quantity: 30, low_stock_threshold: 5, images: ['https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=600'], specifications: {}, is_featured: true, is_active: true, average_rating: 4.6, review_count: 18, created_at: '', updated_at: '' },
  { id: 'demo-3', name: 'Chronograph Sport Watch', slug: 'chronograph-sport-watch', description: 'Premium stainless steel chronograph with sapphire crystal. Water resistant to 100m with Swiss movement.', short_description: 'Stainless steel chronograph, 100m WR', category_id: '', base_price: 599.99, compare_at_price: 899.99, sku: 'WCH-CSW-001', stock_quantity: 25, low_stock_threshold: 5, images: ['https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=600'], specifications: {}, is_featured: true, is_active: true, average_rating: 4.9, review_count: 32, created_at: '', updated_at: '' },
  { id: 'demo-4', name: 'Classic Leather Watch', slug: 'classic-leather-watch', description: 'Minimalist design with genuine Italian leather strap. Swiss quartz movement for precision timekeeping.', short_description: 'Minimalist Swiss quartz leather watch', category_id: '', base_price: 299.99, compare_at_price: 449.99, sku: 'WCH-CLW-002', stock_quantity: 35, low_stock_threshold: 7, images: ['https://images.pexels.com/photos/125779/pexels-photo-125779.jpeg?auto=compress&cs=tinysrgb&w=600'], specifications: {}, is_featured: true, is_active: true, average_rating: 4.7, review_count: 28, created_at: '', updated_at: '' },
  { id: 'demo-5', name: 'Silk Evening Dress', slug: 'silk-evening-dress', description: 'Luxurious silk evening dress with hand-finished details. Available in midnight blue for elegant occasions.', short_description: 'Luxurious silk evening dress', category_id: '', base_price: 459.99, compare_at_price: 699.99, sku: 'CLT-SED-001', stock_quantity: 12, low_stock_threshold: 3, images: ['https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg?auto=compress&cs=tinysrgb&w=600'], specifications: {}, is_featured: true, is_active: true, average_rating: 4.6, review_count: 20, created_at: '', updated_at: '' },
  { id: 'demo-6', name: 'Designer Leather Handbag', slug: 'designer-leather-handbag', description: 'Premium full-grain leather handbag with gold hardware. Spacious interior with multiple compartments.', short_description: 'Full-grain leather with gold hardware', category_id: '', base_price: 549.99, compare_at_price: 799.99, sku: 'ACC-DLH-001', stock_quantity: 15, low_stock_threshold: 3, images: ['https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=600'], specifications: {}, is_featured: true, is_active: true, average_rating: 4.8, review_count: 26, created_at: '', updated_at: '' },
  { id: 'demo-7', name: 'Cashmere Sweater', slug: 'cashmere-sweater', description: '100% pure cashmere crew neck sweater. Incredibly soft and warm, perfect for cooler evenings.', short_description: '100% pure cashmere crew neck', category_id: '', base_price: 199.99, compare_at_price: 299.99, sku: 'CLT-CSW-002', stock_quantity: 40, low_stock_threshold: 8, images: ['https://images.pexels.com/photos/6311652/pexels-photo-6311652.jpeg?auto=compress&cs=tinysrgb&w=600'], specifications: {}, is_featured: false, is_active: true, average_rating: 4.4, review_count: 14, created_at: '', updated_at: '' },
  { id: 'demo-8', name: 'Aviator Sunglasses', slug: 'aviator-sunglasses', description: 'Classic aviator sunglasses with polarized lenses and lightweight titanium frame for all-day comfort.', short_description: 'Polarized aviator with titanium frame', category_id: '', base_price: 159.99, compare_at_price: 229.99, sku: 'ACC-AVS-002', stock_quantity: 50, low_stock_threshold: 10, images: ['https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg?auto=compress&cs=tinysrgb&w=600'], specifications: {}, is_featured: false, is_active: true, average_rating: 4.6, review_count: 19, created_at: '', updated_at: '' },
  { id: 'demo-9', name: 'Rose Gold Ladies Watch', slug: 'rose-gold-ladies-watch', description: 'Elegant rose gold ladies watch with mother of pearl dial and mesh bracelet. A statement piece.', short_description: 'Rose gold with mother of pearl dial', category_id: '', base_price: 399.99, compare_at_price: 549.99, sku: 'WCH-RGL-003', stock_quantity: 18, low_stock_threshold: 4, images: ['https://images.pexels.com/photos/2783873/pexels-photo-2783873.jpeg?auto=compress&cs=tinysrgb&w=600'], specifications: {}, is_featured: false, is_active: true, average_rating: 4.8, review_count: 15, created_at: '', updated_at: '' },
  { id: 'demo-10', name: 'Gold Chain Bracelet', slug: 'gold-chain-bracelet', description: 'Delicate 14K gold chain bracelet with adjustable clasp. Everyday luxury that pairs with anything.', short_description: '14K gold chain bracelet', category_id: '', base_price: 189.99, compare_at_price: 249.99, sku: 'JWL-GCB-003', stock_quantity: 45, low_stock_threshold: 8, images: ['https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=600'], specifications: {}, is_featured: false, is_active: true, average_rating: 4.5, review_count: 12, created_at: '', updated_at: '' },
  { id: 'demo-11', name: 'Tailored Blazer', slug: 'tailored-blazer', description: 'Slim-fit tailored blazer in premium Italian wool. Perfect for business or evening wear.', short_description: 'Slim-fit Italian wool blazer', category_id: '', base_price: 349.99, compare_at_price: 499.99, sku: 'CLT-TBL-003', stock_quantity: 22, low_stock_threshold: 5, images: ['https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=600'], specifications: {}, is_featured: false, is_active: true, average_rating: 4.5, review_count: 11, created_at: '', updated_at: '' },
  { id: 'demo-12', name: 'Silk Scarf Collection', slug: 'silk-scarf-collection', description: 'Hand-printed pure silk scarf in vibrant patterns. Made in Italy with artisan craftsmanship.', short_description: 'Hand-printed Italian silk scarf', category_id: '', base_price: 129.99, compare_at_price: 189.99, sku: 'ACC-SSC-004', stock_quantity: 28, low_stock_threshold: 5, images: ['https://images.pexels.com/photos/6044266/pexels-photo-6044266.jpeg?auto=compress&cs=tinysrgb&w=600'], specifications: {}, is_featured: false, is_active: true, average_rating: 4.5, review_count: 10, created_at: '', updated_at: '' },
];

interface ProductGridProps {
  categorySlug: string | null;
  searchQuery: string;
  onProductClick: (product: Product) => void;
}

export function ProductGrid({ categorySlug, searchQuery, onProductClick }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, [categorySlug, searchQuery]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!supabase) {
        console.warn('Supabase client not initialized, using demo products');
        setProducts(!categorySlug && !searchQuery ? DEMO_PRODUCTS : []);
        setLoading(false);
        return;
      }

      let query = supabase
        .from('products')
        .select('*, categories!inner(slug)')
        .eq('is_active', true);

      if (categorySlug) {
        query = query.eq('categories.slug', categorySlug);
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,short_description.ilike.%${searchQuery}%`);
      }

      query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      setProducts(data && data.length > 0 ? data : (!categorySlug && !searchQuery ? DEMO_PRODUCTS : []));
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-brand-200 rounded-full animate-spin border-t-brand-600" />
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-brand-600" />
        </div>
        <p className="mt-4 text-gray-500 font-medium">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
        <p className="text-gray-500 mb-6">{error}</p>
        <button
          onClick={loadProducts}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-24 h-24 bg-gradient-to-br from-brand-50 to-brand-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <ShoppingBag className="w-12 h-12 text-brand-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          {searchQuery ? `No results for "${searchQuery}"` : 'No products available'}
        </h3>
        <p className="text-gray-500 max-w-md mx-auto mb-8">
          {searchQuery 
            ? 'Try adjusting your search terms or browse our categories for more options.'
            : 'Check back soon for new arrivals and exciting collections!'}
        </p>
        {searchQuery && (
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-brand-500/25 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Browse All Products
          </button>
        )}
      </div>
    );
  }

  const featuredProducts = products.filter(p => p.is_featured);
  const regularProducts = products.filter(p => !p.is_featured);

  const getCategoryTitle = () => {
    if (searchQuery) return `Search Results for "${searchQuery}"`;
    if (categorySlug) {
      const titles: Record<string, string> = {
        jewelry: '💎 Jewelry Collection',
        watches: '⌚ Watches Collection',
        clothing: '👔 Clothing Collection',
        accessories: '👜 Accessories Collection',
      };
      return titles[categorySlug] || categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
    }
    return null;
  };

  const categoryTitle = getCategoryTitle();

  return (
    <div className="space-y-12" id="products">
      {/* Category/Search Header */}
      {categoryTitle && (
        <div className="text-center animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{categoryTitle}</h2>
          <p className="text-gray-500">{products.length} products found</p>
        </div>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && !searchQuery && !categorySlug && (
        <section className="animate-fade-in-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Products</h2>
              <p className="text-gray-500">Handpicked just for you</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ProductCard
                  product={product}
                  onClick={onProductClick}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All Products */}
      {regularProducts.length > 0 && (
        <section className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {featuredProducts.length > 0 && !searchQuery && !categorySlug && (
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/25">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">All Products</h2>
                <p className="text-gray-500">Browse our complete collection</p>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {regularProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${(index + featuredProducts.length) * 0.05}s` }}
              >
                <ProductCard
                  product={product}
                  onClick={onProductClick}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Show featured in search/category view */}
      {(searchQuery || categorySlug) && featuredProducts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featuredProducts.map((product, index) => (
            <div
              key={product.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ProductCard
                product={product}
                onClick={onProductClick}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
