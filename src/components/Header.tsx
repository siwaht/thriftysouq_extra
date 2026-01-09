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
      className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
          ? 'glass backdrop-blur-md shadow-soft-lg'
          : 'bg-transparent py-2'
        }`}
      role="banner"
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex items-center justify-between h-20 sm:h-24">
          {/* Logo and Categories */}
          <div className="flex items-center gap-6 sm:gap-10 lg:gap-16">
            <button
              onClick={() => {
                onCategoryClick(null);
                setSearchQuery('');
                onSearch('');
              }}
              className="flex items-center gap-3 group"
              aria-label="Go to homepage"
            >
              <div className="relative w-12 h-12 flex items-center justify-center">
                <div className="absolute inset-0 bg-brand-600 rounded-xl rotate-3 group-hover:rotate-6 transition-transform duration-300 opacity-20"></div>
                <div className="absolute inset-0 bg-brand-600 rounded-xl -rotate-3 group-hover:-rotate-6 transition-transform duration-300 opacity-20"></div>
                <div className="relative w-full h-full bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-600/30 group-hover:shadow-brand-600/50 transition-all">
                  <span className="text-white font-serif font-bold text-2xl group-hover:scale-110 transition-transform">T</span>
                </div>
              </div>
              <span className="hidden sm:block text-2xl font-serif font-bold text-brand-950 tracking-tight group-hover:text-brand-700 transition-colors">
                ThriftySouq
              </span>
            </button>

            {/* Desktop Categories */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={() => {
                  onCategoryClick(null);
                  setSearchQuery('');
                  onSearch('');
                }}
                className="px-5 py-2.5 text-gray-600 hover:text-brand-700 hover:bg-brand-50 rounded-full transition-all duration-300 font-medium text-sm"
              >
                All Products
              </button>
              {categories.map(category => (
                <button
                  key={category.slug}
                  onClick={() => onCategoryClick(category.slug)}
                  className="px-5 py-2.5 text-gray-600 hover:text-brand-700 hover:bg-brand-50 rounded-full transition-all duration-300 font-medium text-sm flex items-center gap-2"
                >
                  <span className="text-base filter saturate-150">{category.emoji}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-4 lg:mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className={`relative group transition-all duration-300 ${searchFocused ? 'scale-105' : 'hover:scale-[1.02]'}`}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search for treasures..."
                  className={`w-full px-5 py-3 pl-12 pr-10 bg-white/80 border rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-transparent transition-all duration-300 text-sm shadow-sm ${searchFocused ? 'bg-white shadow-soft-lg ring-2 ring-brand-500/20' : 'border-gray-200/60 hover:border-brand-300/50 hover:bg-white'
                    }`}
                  aria-label="Search products"
                />
                <Search className={`absolute left-4 top-3.5 h-5 w-5 transition-colors duration-300 ${searchFocused ? 'text-brand-600' : 'text-gray-400 group-hover:text-brand-500'}`} />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-4 top-3 p-0.5 text-gray-400 hover:text-brand-600 rounded-full hover:bg-brand-50 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Currency Selector */}
            <div className="relative hidden sm:block">
              <select
                value={currency?.code || 'USD'}
                onChange={(e) => {
                  const selected = currencies.find(c => c.code === e.target.value);
                  if (selected) setCurrency(selected);
                }}
                className="appearance-none bg-white/50 border border-gray-200/60 rounded-full pl-4 pr-10 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500 hover:bg-white hover:border-brand-300 transition-all cursor-pointer shadow-sm"
                aria-label="Select currency"
              >
                {currencies.map(curr => (
                  <option key={curr.id} value={curr.code}>
                    {curr.symbol} {curr.code}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Cart Button */}
            <button
              onClick={onCartClick}
              className="relative p-3 text-gray-600 hover:text-brand-700 hover:bg-brand-50 rounded-full transition-all duration-300 group"
              aria-label={`Shopping cart with ${getTotalItems()} items`}
            >
              <ShoppingBag className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
              {getTotalItems() > 0 && (
                <span className="absolute top-0 right-0 bg-gold-gradient text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg shadow-gold-500/30 animate-scale-in border-2 border-white">
                  {getTotalItems() > 9 ? '9+' : getTotalItems()}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-3 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
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
        <div className="lg:hidden absolute top-full left-0 right-0 border-t border-gray-100 bg-white/95 backdrop-blur-xl shadow-soft-lg animate-fade-in-up origin-top">
          <div className="px-5 py-6 space-y-6">
            {/* Mobile Search */}
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-5 py-3.5 pl-12 pr-10 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-gray-50/50 focus:bg-white transition-all text-sm font-medium"
                  aria-label="Search products"
                />
                <Search className="absolute left-4 top-3.5 h-6 w-6 text-gray-400" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-4 top-3.5 p-0.5 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </form>

            {/* Mobile Currency Selector */}
            <div className="sm:hidden">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Currency</label>
              <select
                value={currency?.code || 'USD'}
                onChange={(e) => {
                  const selected = currencies.find(c => c.code === e.target.value);
                  if (selected) setCurrency(selected);
                }}
                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {currencies.map(curr => (
                  <option key={curr.id} value={curr.code}>
                    {curr.symbol} {curr.code} - {curr.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile Categories */}
            <div className="border-t border-gray-100 pt-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-1">Collections</p>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    onCategoryClick(null);
                    setMobileMenuOpen(false);
                    setSearchQuery('');
                    onSearch('');
                  }}
                  className="w-full text-left px-5 py-3.5 text-gray-700 hover:bg-brand-50 hover:text-brand-700 rounded-2xl transition-colors font-medium flex items-center gap-4 group"
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">🛍️</span>
                  All Products
                </button>
                {categories.map(category => (
                  <button
                    key={category.slug}
                    onClick={() => {
                      onCategoryClick(category.slug);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-5 py-3.5 text-gray-700 hover:bg-brand-50 hover:text-brand-700 rounded-2xl transition-colors font-medium flex items-center gap-4 group"
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">{category.emoji}</span>
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
