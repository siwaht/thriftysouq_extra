import { useState, useEffect } from 'react';
import { ArrowRight, Truck, Shield, RefreshCw, Sparkles, Star, Users, Package } from 'lucide-react';
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
}

const iconMap: Record<string, React.ReactNode> = {
  truck: <Truck className="w-5 h-5" />,
  shield: <Shield className="w-5 h-5" />,
  refresh: <RefreshCw className="w-5 h-5" />,
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

  const stats = [
    { value: '10K+', label: 'Happy Customers', icon: Users },
    { value: '500+', label: 'Products', icon: Package },
    { value: '4.9', label: 'Rating', icon: Star },
  ];

  return (
    <section
      className="relative min-h-[600px] md:min-h-[700px] lg:min-h-[85vh] bg-gradient-to-br from-emerald-900 via-teal-900 to-gray-900 text-white overflow-hidden"
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
      <div className="relative h-full">
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 xl:col-span-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 mb-4 sm:mb-6 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                <span className="text-emerald-200 text-xs sm:text-sm font-medium">{settings.badge_text}</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
                <span className="bg-gradient-to-r from-white via-emerald-100 to-teal-100 bg-clip-text text-transparent">
                  {settings.title}
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-gray-300 leading-relaxed max-w-xl">
                {settings.subtitle}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-10">
                <button
                  onClick={() => scrollToSection(settings.primary_button_link)}
                  className="group px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  {settings.primary_button_text}
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => scrollToSection(settings.secondary_button_link)}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 hover:border-white/50 transition-all duration-300"
                >
                  {settings.secondary_button_text}
                </button>
              </div>

              {/* Features */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                {settings.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 sm:gap-3 group">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/30 transition-colors">
                      {iconMap[feature.icon] || <Shield className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </div>
                    <span className="text-gray-300 text-sm sm:text-base font-medium">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Stats - Desktop */}
            <div className="hidden lg:flex lg:col-span-5 xl:col-span-4 flex-col gap-4 items-end">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="w-full max-w-[200px] p-4 xl:p-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                        <Icon className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <div className="text-2xl xl:text-3xl font-bold text-white">{stat.value}</div>
                        <div className="text-xs xl:text-sm text-gray-400">{stat.label}</div>
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
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="text-center p-3 sm:p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/10"
                >
                  <Icon className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
                  <div className="text-lg sm:text-xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-gray-400">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-t from-gray-50 to-transparent" />

      {/* Scroll Indicator - Desktop only */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
        <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-white/30 rounded-full flex justify-center pt-1.5 sm:pt-2">
          <div className="w-1 h-2 sm:w-1.5 sm:h-3 bg-white/50 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}
