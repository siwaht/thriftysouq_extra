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
      className="relative min-h-[600px] md:min-h-[700px] lg:min-h-[85vh] bg-hero-gradient text-white overflow-hidden"
      aria-label="Hero section"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 transform scale-105 animate-float"
          style={{ backgroundImage: `url(${settings.background_image_url})`, animationDuration: '30s' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-950/95 via-brand-900/80 to-brand-950/95 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/90 via-transparent to-black/20" />
      </div>

      {/* Main Content */}
      <div className="relative h-full flex flex-col justify-center">
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 transition-all duration-1000 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-glass hover:bg-white/15 transition-colors">
                <Sparkles className="w-4 h-4 text-gold-400" />
                <span className="text-brand-50 text-sm font-medium tracking-wide shadow-black drop-shadow-md">{settings.badge_text}</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight">
                <span className="block text-white drop-shadow-lg">
                  {settings.title}
                </span>
                <span className="block mt-2 bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 bg-clip-text text-transparent italic drop-shadow-sm">
                  Finds
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl text-brand-100/90 leading-relaxed max-w-2xl font-light">
                {settings.subtitle}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => scrollToSection(settings.primary_button_link)}
                  className="btn-gold group flex items-center justify-center gap-2"
                >
                  {settings.primary_button_text}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => scrollToSection(settings.secondary_button_link)}
                  className="px-8 py-3 bg-white/10 backdrop-blur-md border border-white/40 text-white font-medium rounded-full
                           hover:bg-white/20 hover:border-white/60 transition-all duration-300"
                >
                  {settings.secondary_button_text}
                </button>
              </div>

              {/* Features */}
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-8 border-t border-white/10">
                {settings.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 text-gold-400">
                      {iconMap[feature.icon] || <Shield className="w-5 h-5" />}
                    </div>
                    <span className="text-brand-50 text-sm font-medium">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Stats - Desktop */}
            <div className="hidden lg:flex lg:col-span-5 xl:col-span-4 flex-col gap-5 items-end">
              {stats.map((stat, index) => {
                const Icon = statsIconMap[stat.icon] || Users;
                return (
                  <div
                    key={index}
                    className="w-full max-w-[240px] p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 shadow-glass group hover:bg-white/15 transition-all duration-300 hover:-translate-x-2"
                    style={{ animationDelay: `${index * 0.15}s` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-gold-500/20 transition-colors">
                        <Icon className="w-6 h-6 text-gold-400" />
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-white tracking-tight">{stat.value}</div>
                        <div className="text-sm text-brand-200 font-medium">{stat.label}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
