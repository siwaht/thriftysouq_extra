import { useState, useEffect } from 'react';
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

export function Hero() {
  const [settings, setSettings] = useState<HeroSettings>({
    title: 'Discover Smart Shopping',
    subtitle: 'Curated treasures and premium finds at unbeatable prices.',
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

  useEffect(() => {
    fetchHeroSettings();
  }, []);

  const fetchHeroSettings = async () => {
    const { data } = await supabase
      .from('hero_settings')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();

    if (data) {
      setSettings(data);
    }
  };

  const scrollToSection = (link: string) => {
    if (link.startsWith('#')) {
      const element = document.querySelector(link);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.location.href = link;
    }
  };

  return (
    <div className={`relative bg-gradient-to-br from-${settings.gradient_colors.from} via-${settings.gradient_colors.via} to-${settings.gradient_colors.to} text-white overflow-hidden`}>
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${settings.background_image_url})` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/80 to-teal-900/80"></div>
      </div>

      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-700"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-36">
        <div className="max-w-4xl">
          <div className="inline-block mb-4 px-4 py-2 bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 rounded-full">
            <span className="text-emerald-300 text-sm font-medium">{settings.badge_text}</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight bg-gradient-to-r from-white via-emerald-100 to-teal-100 bg-clip-text text-transparent">
            {settings.title}
          </h1>

          <p className="text-xl md:text-2xl mb-10 text-gray-200 leading-relaxed max-w-2xl">
            {settings.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => scrollToSection(settings.primary_button_link)}
              className="group px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 transform hover:-translate-y-1"
            >
              <span className="flex items-center justify-center gap-2">
                {settings.primary_button_text}
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
            <button
              onClick={() => scrollToSection(settings.secondary_button_link)}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 hover:border-white/50 transition-all duration-300"
            >
              {settings.secondary_button_text}
            </button>
          </div>

          <div className="mt-12 flex items-center gap-8 text-sm">
            {settings.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-300">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 to-transparent"></div>
    </div>
  );
}
