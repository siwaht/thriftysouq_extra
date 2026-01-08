import { ShoppingBag, Search, Menu, X, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const { getTotalItems } = useCart();
  const { currency, currencies, setCurrency } = useCurrency();

  const categories = [
    { name: 'Jewelry', slug: 'jewelry', emoji: '💎' },
    { name: 'Watches', slug: 'watches', emoji: '⌚' },
    { name: 'Clothing', slug: 'clothing', emoji: '👔' },
    { name: 'Accessories', slug: 'accessories', emoji: '👜' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    setSearchFocused(false);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    onSearch('');
  };

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-lg shadow-lg shadow-gray-200/50 border-b border-gray-100' 
          : 'bg-white border-b border-gray-100'
      }`} 
      role="banner"
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo and Categories */}
          <div className="flex items-center gap-4 sm:gap-8 lg:gap-12">
            <button
              onClick={() => {
                onCategoryClick(null);
                setSearchQuery('');
                onSearch('');
              }}
              className="flex items-center gap-2 group"
              aria-label="Go to homepage"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-shadow">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="hidden sm:block text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                ThriftySouq
              </span>
            </button>

            {/* Desktop Categories */}
            <div className="hidden lg:flex items-center gap-1">
              <button
                onClick={() => {
                  onCategoryClick(null);
                  setSearchQuery('');
                  onSearch('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 font-medium text-sm"
              >
                All Products
              </button>
              {categories.map(category => (
                <button
                  key={category.slug}
                  onClick={() => onCategoryClick(category.slug)}
                  className="px-4 py-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 font-medium text-sm flex items-center gap-1.5"
                >
                  <span>{category.emoji}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-4 lg:mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className={`relative transition-all duration-300 ${searchFocused ? 'scale-105' : ''}`}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search for treasures..."
                  className={`w-full px-4 py-2.5 pl-11 pr-10 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all duration-200 text-sm ${
                    searchFocused ? 'border-emerald-300 shadow-lg shadow-emerald-100' : 'border-gray-200'
                  }`}
                  aria-label="Search products"
                />
                <Search className={`absolute left-3.5 top-3 h-5 w-5 transition-colors ${searchFocused ? 'text-emerald-600' : 'text-gray-400'}`} />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-2.5 p-0.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Currency Selector */}
            <div className="relative hidden sm:block">
              <select
                value={currency?.code || 'USD'}
                onChange={(e) => {
                  const selected = currencies.find(c => c.code === e.target.value);
                  if (selected) setCurrency(selected);
                }}
                className="appearance-none bg-gray-50 border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Select currency"
              >
                {currencies.map(curr => (
                  <option key={curr.id} value={curr.code}>
                    {curr.symbol} {curr.code}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Cart Button */}
            <button
              onClick={onCartClick}
              className="relative p-2.5 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all duration-200 group"
              aria-label={`Shopping cart with ${getTotalItems()} items`}
            >
              <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg animate-scale-in">
                  {getTotalItems() > 9 ? '9+' : getTotalItems()}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white animate-slide-up">
          <div className="px-4 py-4 space-y-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-4 py-3 pl-11 pr-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 focus:bg-white transition-all text-sm"
                  aria-label="Search products"
                />
                <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-3 p-0.5 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </form>

            {/* Mobile Currency Selector */}
            <div className="sm:hidden">
              <label className="block text-xs font-medium text-gray-500 mb-2">Currency</label>
              <select
                value={currency?.code || 'USD'}
                onChange={(e) => {
                  const selected = currencies.find(c => c.code === e.target.value);
                  if (selected) setCurrency(selected);
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {currencies.map(curr => (
                  <option key={curr.id} value={curr.code}>
                    {curr.symbol} {curr.code} - {curr.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile Categories */}
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Categories</p>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    onCategoryClick(null);
                    setMobileMenuOpen(false);
                    setSearchQuery('');
                    onSearch('');
                  }}
                  className="w-full text-left px-4 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors font-medium flex items-center gap-3"
                >
                  <span className="text-lg">🛍️</span>
                  All Products
                </button>
                {categories.map(category => (
                  <button
                    key={category.slug}
                    onClick={() => {
                      onCategoryClick(category.slug);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors font-medium flex items-center gap-3"
                  >
                    <span className="text-lg">{category.emoji}</span>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
