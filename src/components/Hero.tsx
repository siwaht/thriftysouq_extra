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

    // Listen for custom event when hero settings are updated from admin
    const handleHeroUpdate = () => {
      fetchHeroSettings();
    };
    window.addEventListener('heroSettingsUpdated', handleHeroUpdate);

    const channel = supabase
      .channel('hero_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hero_settings',
        },
        () => {
          fetchHeroSettings();
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('heroSettingsUpdated', handleHeroUpdate);
      supabase.removeChannel(channel);
    };
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
      className="relative bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 text-white overflow-hidden font-sans"
      aria-label="Hero section"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url(${settings.background_image_url})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-950/80 via-brand-900/60 to-brand-950/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent to-transparent" />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 md:w-96 lg:w-[500px] h-64 md:h-96 lg:h-[500px] bg-accent-500/20 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-64 md:w-96 lg:w-[500px] h-64 md:h-96 lg:h-[500px] bg-brand-500/30 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
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
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-lg">
                <Sparkles className="w-4 h-4 text-accent-400" />
                <span className="text-accent-100 text-sm font-medium tracking-wide">{settings.badge_text}</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-medium leading-tight text-white tracking-tight">
                {settings.title}
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-gray-300 leading-relaxed font-light mt-4">
                {settings.subtitle}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  onClick={() => scrollToSection(settings.primary_button_link)}
                  className="group px-8 py-4 bg-gradient-to-r from-accent-600 to-accent-500 text-white font-medium rounded-xl shadow-glow hover:shadow-glow-lg transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                >
                  {settings.primary_button_text}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => scrollToSection(settings.secondary_button_link)}
                  className="px-8 py-4 bg-white/5 backdrop-blur-xl border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  {settings.secondary_button_text}
                </button>
              </div>

              {/* Features */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-4">
                {settings.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center text-accent-400 shadow-inner-soft">
                      {iconMap[feature.icon] || <Shield className="w-5 h-5" />}
                    </div>
                    <span className="text-gray-300 text-sm font-medium tracking-wide">{feature.text}</span>
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
                    className="p-5 bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 transition-all duration-300 shadow-elegant"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-accent-500/20 to-transparent rounded-xl flex items-center justify-center border border-accent-500/30">
                        <Icon className="w-6 h-6 text-accent-400" />
                      </div>
                      <div>
                        <div className="text-2xl font-serif font-medium text-white">{stat.value}</div>
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
                  className="text-center p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-soft"
                >
                  <Icon className="w-6 h-6 text-accent-400 mx-auto mb-2" />
                  <div className="text-lg font-serif font-medium text-white">{stat.value}</div>
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
