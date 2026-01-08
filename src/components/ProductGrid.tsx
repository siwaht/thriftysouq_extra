import { useState, useEffect } from 'react';
import { supabase, Product } from '../lib/supabase';
import { ProductCard } from './ProductCard';
import { Package, RefreshCw, Sparkles } from 'lucide-react';

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

      setProducts(data || []);
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
          <div className="w-16 h-16 border-4 border-emerald-200 rounded-full animate-spin border-t-emerald-600" />
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-emerald-600" />
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
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
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
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {searchQuery ? `No results for "${searchQuery}"` : 'No products available'}
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          {searchQuery 
            ? 'Try adjusting your search terms or browse our categories.'
            : 'Check back soon for new arrivals!'}
        </p>
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
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
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
