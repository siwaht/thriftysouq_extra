import { useState } from 'react';
import { Check, Palette, Monitor } from 'lucide-react';
import { useTheme, themePresets, ThemePreset } from '../../contexts/ThemeContext';

export function AdminTheme() {
  const { currentTheme, setTheme } = useTheme();
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);

  const activeThemeName = previewTheme || currentTheme.name;

  const handleApply = (themeName: string) => {
    setTheme(themeName);
    setPreviewTheme(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <div className="p-2 rounded-xl" style={{ background: `linear-gradient(135deg, ${currentTheme.gradient.from}, ${currentTheme.gradient.to})` }}>
            <Palette className="h-6 w-6 text-white" />
          </div>
          Store Theme
        </h1>
        <p className="text-gray-500 mt-2">Customize the look and feel of your store by choosing a color theme.</p>
      </div>

      {/* Current Theme */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Monitor className="h-5 w-5 text-gray-400" />
          Current Theme
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            {[currentTheme.colors[400], currentTheme.colors[500], currentTheme.colors[600], currentTheme.colors[700]].map((color, i) => (
              <div key={i} className="w-8 h-8 rounded-lg" style={{ backgroundColor: color }} />
            ))}
          </div>
          <span className="text-lg font-medium text-gray-700">{currentTheme.label}</span>
        </div>
      </div>

      {/* Theme Grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose a Theme</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {themePresets.map((preset) => (
            <ThemeCard
              key={preset.name}
              preset={preset}
              isActive={activeThemeName === preset.name}
              isCurrent={currentTheme.name === preset.name}
              onSelect={() => handleApply(preset.name)}
            />
          ))}
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <button
              className="px-6 py-3 text-white font-medium rounded-xl shadow-lg transition-all"
              style={{ background: `linear-gradient(135deg, ${currentTheme.gradient.from}, ${currentTheme.gradient.to})` }}
            >
              Primary Button
            </button>
            <button
              className="px-6 py-3 border-2 font-medium rounded-xl transition-all"
              style={{ borderColor: currentTheme.colors[300], color: currentTheme.colors[700] }}
            >
              Secondary Button
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: currentTheme.colors[100], color: currentTheme.colors[800] }}>
              Badge
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: currentTheme.colors[50], color: currentTheme.colors[700] }}>
              Tag
            </span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full w-2/3 rounded-full" style={{ background: `linear-gradient(90deg, ${currentTheme.colors[500]}, ${currentTheme.colors[400]})` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ThemeCard({ preset, isActive, isCurrent, onSelect }: {
  preset: ThemePreset;
  isActive: boolean;
  isCurrent: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`relative p-4 rounded-2xl border-2 transition-all duration-200 text-left group hover:shadow-lg ${
        isActive ? 'border-gray-900 shadow-md' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {isCurrent && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: preset.colors[500] }}>
          <Check className="h-3.5 w-3.5 text-white" />
        </div>
      )}

      {/* Color swatches */}
      <div className="flex gap-1 mb-3">
        {[preset.colors[300], preset.colors[400], preset.colors[500], preset.colors[600], preset.colors[700]].map((color, i) => (
          <div key={i} className="flex-1 h-10 rounded-lg first:rounded-l-xl last:rounded-r-xl" style={{ backgroundColor: color }} />
        ))}
      </div>

      {/* Gradient preview */}
      <div className="h-8 rounded-lg mb-3" style={{ background: `linear-gradient(135deg, ${preset.gradient.from}, ${preset.gradient.to})` }} />

      <p className="font-medium text-gray-900 text-sm">{preset.label}</p>
      {isCurrent && <p className="text-xs text-gray-500 mt-0.5">Currently active</p>}
    </button>
  );
}
