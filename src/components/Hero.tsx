import { useState, useEffect } from 'react';
import { ArrowRight, Truck, Shield, RefreshCw, Sparkles, Star, Users, Package, Heart, ShoppingCart } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface HeroSettings {
  title: string;
  subtitle: string;
  badge_text: string;
  background_image_url: string;
  primary_button_text: string;
  primary_button_link: string;
  secondary_button_text: string;
  secondary_button_link: string;
  features: Array<{ icon: string; text: string }>;
  stats: Array<{ value: string; label: string; icon: string }>;
}

const iconMap: Record<string, React.ReactNode> = {
  truck: <Truck className="w-5 h-5" />,
  shield: <Shield className="w-5 h-5" />,
  refresh: <RefreshCw className="w-5 h-5" />,
};

const statsIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  users: Users,
  package: Package,
  star: Star,
  heart: Heart,
  'shopping-cart': ShoppingCart,
  truck: Truck,
};

export function Hero() {
  const [settings, setSettings] = useState<HeroSettings>({
    title: 'Discover Smart Shopping',
    subtitle: 'Curated treasures and premium finds at unbeatable prices. Experience luxury without the luxury price tag.',
    badge_text: '✨ Premium Quality at Thrifty Prices',
    background_image_url: 'https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=1920',
    primary_button_text: 'Shop Now',
    primary_button_link: '#products',
    secondary_button_text: 'View Collections',
    secondary_button_link: '#collections',
    features: [
      { icon: 'truck', text: 'Free Shipping' },
      { icon: 'shield', text: 'Secure Payment' },
      { icon: 'refresh', text: 'Easy Returns' },
    ],
    stats: [
      { value: '10K+', label: 'Happy Customers', icon: 'users' },
      { value: '500+', label: 'Products', icon: 'package' },
      { value: '4.9', label: 'Rating', icon: 'star' },
    ],
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetchHeroSettings();
    setIsLoaded(true);
  }, []);

  const fetchHeroSettings = async () => {
    try {
      const { data } = await supabase
        .from('hero_settings')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching hero settings:', error);
    }
  };

  const scrollToSection = (link: string) => {
    if (link.startsWith('#')) {
      const element = document.querySelector(link);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: window.innerHeight * 0.8, behavior: 'smooth' });
      }
    } else {
      window.location.href = link;
    }
  };

  // Use stats from settings, with fallback defaults
  const stats = settings.stats || [
    { value: '10K+', label: 'Happy Customers', icon: 'users' },
    { value: '500+', label: 'Products', icon: 'package' },
    { value: '4.9', label: 'Rating', icon: 'star' },
  ];

  return (
    <section
      className="relative bg-gradient-to-br from-emerald-900 via-teal-900 to-gray-900 text-white overflow-hidden"
      aria-label="Hero section"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${settings.background_image_url})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/95 via-teal-900/90 to-gray-900/95" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent" />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-48 md:w-72 lg:w-96 h-48 md:h-72 lg:h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 md:w-72 lg:w-96 h-48 md:h-72 lg:h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTR2Mkg0djJIMnYtNGgzNHptLTIgMHYySDI0di0yaDEwem0tMTAgMHYySDR2LTJoMjB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />

      {/* Main Content */}
      <div className="relative h-full flex flex-col justify-center min-h-[600px] md:min-h-[700px] lg:min-h-[85vh]">
        <div className={`container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 transition-all duration-1000 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-12">
            {/* Left Content */}
            <div className="flex-1 max-w-2xl space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-emerald-200 text-sm font-medium">{settings.badge_text}</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white">
                {settings.title}
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
                {settings.subtitle}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <button
                  onClick={() => scrollToSection(settings.primary_button_link)}
                  className="group px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-emerald-500/25 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {settings.primary_button_text}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => scrollToSection(settings.secondary_button_link)}
                  className="px-6 py-3 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 hover:border-white/50 transition-all duration-300"
                >
                  {settings.secondary_button_text}
                </button>
              </div>

              {/* Features */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-4">
                {settings.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400">
                      {iconMap[feature.icon] || <Shield className="w-4 h-4" />}
                    </div>
                    <span className="text-gray-300 text-sm font-medium">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Stats - Desktop */}
            <div className="hidden lg:flex flex-col gap-4 w-64">
              {stats.map((stat, index) => {
                const Icon = statsIconMap[stat.icon] || Users;
                return (
                  <div
                    key={index}
                    className="p-5 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 hover:bg-white/15 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                        <Icon className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">{stat.value}</div>
                        <div className="text-sm text-gray-400">{stat.label}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile Stats */}
          <div className="grid grid-cols-3 gap-3 mt-8 lg:hidden">
            {stats.map((stat, index) => {
              const Icon = statsIconMap[stat.icon] || Users;
              return (
                <div
                  key={index}
                  className="text-center p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10"
                >
                  <Icon className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <div className="text-lg font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-gray-400">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-t from-gray-50 to-transparent" />

    </section>
  );
}
