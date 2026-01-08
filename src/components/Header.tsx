import { ShoppingBag, Search, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useCurrency } from '../contexts/CurrencyContext';

interface HeaderProps {
  onCartClick: () => void;
  onCategoryClick: (slug: string | null) => void;
  onSearch: (query: string) => void;
}

export function Header({ onCartClick, onCategoryClick, onSearch }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { getTotalItems } = useCart();
  const { currency, currencies, setCurrency } = useCurrency();

  const categories = [
    { name: 'Jewelry', slug: 'jewelry' },
    { name: 'Watches', slug: 'watches' },
    { name: 'Clothing', slug: 'clothing' },
    { name: 'Accessories', slug: 'accessories' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/95" role="banner">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <div className="flex items-center gap-4 sm:gap-8 lg:gap-12">
            <button
              onClick={() => {
                onCategoryClick(null);
                setSearchQuery('');
              }}
              className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 tracking-tight whitespace-nowrap"
              aria-label="Go to homepage"
            >
              ThriftySouq
            </button>

            <div className="hidden lg:flex items-center gap-6">
              <button
                onClick={() => onCategoryClick(null)}
                className="text-gray-600 hover:text-emerald-600 transition-all duration-200 font-medium text-sm tracking-wide"
              >
                All
              </button>
              {categories.map(category => (
                <button
                  key={category.slug}
                  onClick={() => onCategoryClick(category.slug)}
                  className="text-gray-600 hover:text-emerald-600 transition-all duration-200 font-medium text-sm tracking-wide"
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center flex-1 max-w-xs lg:max-w-md mx-4 lg:mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for treasures..."
                  className="w-full px-4 py-2.5 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all duration-200 text-sm"
                  aria-label="Search products"
                />
                <Search className="absolute left-3.5 top-3 h-5 w-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
              </div>
            </form>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <select
              value={currency?.code || 'USD'}
              onChange={(e) => {
                const selected = currencies.find(c => c.code === e.target.value);
                if (selected) setCurrency(selected);
              }}
              className="hidden sm:block bg-gray-50 border border-gray-200 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Select currency"
            >
              {currencies.map(curr => (
                <option key={curr.id} value={curr.code}>
                  {curr.code}
                </option>
              ))}
            </select>

            <button
              onClick={onCartClick}
              className="relative p-2 sm:p-2.5 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all duration-200"
              aria-label={`Shopping cart with ${getTotalItems()} items`}
            >
              <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                  {getTotalItems()}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white animate-slide-up">
          <div className="px-4 py-4 space-y-3">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-4 py-3 pl-11 pr-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 focus:bg-white transition-all text-sm"
                  aria-label="Search products"
                />
                <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
              </div>
            </form>

            <div className="sm:hidden mb-4">
              <label className="block text-xs font-medium text-gray-500 mb-2">Currency</label>
              <select
                value={currency?.code || 'USD'}
                onChange={(e) => {
                  const selected = currencies.find(c => c.code === e.target.value);
                  if (selected) setCurrency(selected);
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {currencies.map(curr => (
                  <option key={curr.id} value={curr.code}>
                    {curr.code} - {curr.symbol}
                  </option>
                ))}
              </select>
            </div>

            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs font-medium text-gray-500 mb-2 px-3">Categories</p>
              <button
                onClick={() => {
                  onCategoryClick(null);
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2.5 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors font-medium"
              >
                All Products
              </button>
              {categories.map(category => (
                <button
                  key={category.slug}
                  onClick={() => {
                    onCategoryClick(category.slug);
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2.5 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors font-medium"
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
