import { useState, useEffect } from 'react';
import { ArrowRight, Truck, Shield, RefreshCw, Sparkles } from 'lucide-react';
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
  gradient_colors: {
    from: string;
    via: string;
    to: string;
  };
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
    gradient_colors: {
      from: 'emerald-900',
      via: 'teal-900',
      to: 'gray-900',
    },
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
        // Scroll to products section
        window.scrollTo({ top: window.innerHeight * 0.8, behavior: 'smooth' });
      }
    } else {
      window.location.href = link;
    }
  };

  return (
    <section
      className="relative min-h-[90vh] sm:min-h-[85vh] bg-gradient-to-br from-emerald-900 via-teal-900 to-gray-900 text-white overflow-hidden flex items-center"
      aria-label="Hero section"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 scale-105"
          style={{ 
            backgroundImage: `url(${settings.background_image_url})`,
            transform: 'scale(1.05)',
          }}
          role="img"
          aria-label="Background image"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 via-teal-900/80 to-gray-900/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 via-transparent to-transparent" />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-emerald-500/10 to-transparent rounded-full" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTR2Mkg0djJIMnYtNGgzNHptLTIgMHYySDI0di0yaDEwem0tMTAgMHYySDR2LTJoMjB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />

      {/* Content */}
      <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full animate-fade-in">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-emerald-200 text-sm font-medium">{settings.badge_text}</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <span className="bg-gradient-to-r from-white via-emerald-100 to-teal-100 bg-clip-text text-transparent">
              {settings.title}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl md:text-2xl mb-10 text-gray-300 leading-relaxed max-w-2xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {settings.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <button
              onClick={() => scrollToSection(settings.primary_button_link)}
              className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-emerald-500/30 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              {settings.primary_button_text}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => scrollToSection(settings.secondary_button_link)}
              className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 hover:border-white/50 transition-all duration-300"
            >
              {settings.secondary_button_text}
            </button>
          </div>

          {/* Features */}
          <div className="flex flex-wrap items-center gap-6 sm:gap-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            {settings.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-emerald-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/30 transition-colors">
                  {iconMap[feature.icon] || <Shield className="w-5 h-5" />}
                </div>
                <span className="text-gray-300 font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats (optional decorative element) */}
        <div className="hidden lg:flex absolute right-8 top-1/2 -translate-y-1/2 flex-col gap-6">
          <div className="text-center p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
            <div className="text-3xl font-bold text-white">10K+</div>
            <div className="text-sm text-gray-400">Happy Customers</div>
          </div>
          <div className="text-center p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
            <div className="text-3xl font-bold text-white">500+</div>
            <div className="text-sm text-gray-400">Products</div>
          </div>
          <div className="text-center p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
            <div className="text-3xl font-bold text-white">4.9</div>
            <div className="text-sm text-gray-400">Rating</div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent" />

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden sm:block">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-white/50 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}
