import { useState, useEffect } from 'react';
import { Save, Eye, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface HeroSettings {
  id: string;
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
  is_active: boolean;
}

export function AdminHeroSettings() {
  const [settings, setSettings] = useState<HeroSettings>({
    id: '',
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
    is_active: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('hero_settings')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();

    if (data) {
      setSettings(data);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (settings.id) {
        await supabase
          .from('hero_settings')
          .update({
            title: settings.title,
            subtitle: settings.subtitle,
            badge_text: settings.badge_text,
            background_image_url: settings.background_image_url,
            primary_button_text: settings.primary_button_text,
            primary_button_link: settings.primary_button_link,
            secondary_button_text: settings.secondary_button_text,
            secondary_button_link: settings.secondary_button_link,
            features: settings.features,
            gradient_colors: settings.gradient_colors,
            updated_at: new Date().toISOString(),
          })
          .eq('id', settings.id);
      }
      alert('Hero settings saved successfully!');
    } catch (error) {
      alert('Failed to save settings: ' + (error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const updateFeature = (index: number, field: 'icon' | 'text', value: string) => {
    const newFeatures = [...settings.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setSettings({ ...settings, features: newFeatures });
  };

  const addFeature = () => {
    setSettings({
      ...settings,
      features: [...settings.features, { icon: 'check', text: 'New Feature' }],
    });
  };

  const removeFeature = (index: number) => {
    setSettings({
      ...settings,
      features: settings.features.filter((_, i) => i !== index),
    });
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hero Section Settings</h1>
          <p className="text-gray-600 mt-1">Customize your homepage hero section</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            <Eye className="w-5 h-5" />
            {showPreview ? 'Hide' : 'Show'} Preview
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Content</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Badge Text</label>
                <input
                  type="text"
                  value={settings.badge_text}
                  onChange={(e) => setSettings({ ...settings, badge_text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Main Title</label>
                <input
                  type="text"
                  value={settings.title}
                  onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <textarea
                  value={settings.subtitle}
                  onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Buttons</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Button Text</label>
                <input
                  type="text"
                  value={settings.primary_button_text}
                  onChange={(e) => setSettings({ ...settings, primary_button_text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Button Link</label>
                <input
                  type="text"
                  value={settings.primary_button_link}
                  onChange={(e) => setSettings({ ...settings, primary_button_link: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Button Text</label>
                <input
                  type="text"
                  value={settings.secondary_button_text}
                  onChange={(e) => setSettings({ ...settings, secondary_button_text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Button Link</label>
                <input
                  type="text"
                  value={settings.secondary_button_link}
                  onChange={(e) => setSettings({ ...settings, secondary_button_link: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Feature Highlights</h2>
              <button
                onClick={addFeature}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Add Feature
              </button>
            </div>

            <div className="space-y-3">
              {settings.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={feature.icon}
                    onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                    placeholder="Icon name"
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    value={feature.text}
                    onChange={(e) => updateFeature(index, 'text', e.target.value)}
                    placeholder="Feature text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <button
                    onClick={() => removeFeature(index)}
                    className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Background & Design</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <ImageIcon className="w-4 h-4 inline mr-1" />
                  Background Image URL
                </label>
                <input
                  type="url"
                  value={settings.background_image_url}
                  onChange={(e) => setSettings({ ...settings, background_image_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="https://example.com/image.jpg"
                />
                {settings.background_image_url && (
                  <img
                    src={settings.background_image_url}
                    alt="Background preview"
                    className="mt-2 w-full h-32 object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x200?text=Invalid+Image+URL';
                    }}
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gradient Colors</label>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-600">From</label>
                    <input
                      type="text"
                      value={settings.gradient_colors.from}
                      onChange={(e) => setSettings({
                        ...settings,
                        gradient_colors: { ...settings.gradient_colors, from: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="e.g., emerald-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Via</label>
                    <input
                      type="text"
                      value={settings.gradient_colors.via}
                      onChange={(e) => setSettings({
                        ...settings,
                        gradient_colors: { ...settings.gradient_colors, via: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="e.g., teal-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">To</label>
                    <input
                      type="text"
                      value={settings.gradient_colors.to}
                      onChange={(e) => setSettings({
                        ...settings,
                        gradient_colors: { ...settings.gradient_colors, to: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="e.g., gray-900"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Use Tailwind CSS color classes</p>
              </div>
            </div>
          </div>

          {showPreview && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Live Preview</h2>
              <div className={`relative bg-gradient-to-br from-${settings.gradient_colors.from} via-${settings.gradient_colors.via} to-${settings.gradient_colors.to} text-white rounded-lg overflow-hidden`}>
                <div className="absolute inset-0">
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-20"
                    style={{ backgroundImage: `url(${settings.background_image_url})` }}
                  ></div>
                </div>

                <div className="relative p-8">
                  <div className="inline-block mb-2 px-3 py-1 bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 rounded-full">
                    <span className="text-emerald-300 text-xs">{settings.badge_text}</span>
                  </div>

                  <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white via-emerald-100 to-teal-100 bg-clip-text text-transparent">
                    {settings.title}
                  </h1>

                  <p className="text-sm text-gray-200 mb-4">
                    {settings.subtitle}
                  </p>

                  <div className="flex gap-2 mb-4">
                    <button className="px-4 py-2 text-xs bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg">
                      {settings.primary_button_text}
                    </button>
                    <button className="px-4 py-2 text-xs bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-lg">
                      {settings.secondary_button_text}
                    </button>
                  </div>

                  <div className="flex gap-4 text-xs">
                    {settings.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <span className="text-emerald-400">✓</span>
                        <span className="text-gray-300">{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
