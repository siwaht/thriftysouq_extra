import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface ThemeColors {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface ThemePreset {
  name: string;
  label: string;
  colors: ThemeColors;
  gradient: { from: string; to: string };
}

export const themePresets: ThemePreset[] = [
  {
    name: 'emerald',
    label: 'Emerald (Default)',
    colors: {
      50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac',
      400: '#4ade80', 500: '#10b981', 600: '#059669', 700: '#047857',
      800: '#065f46', 900: '#064e40', 950: '#022c22',
    },
    gradient: { from: '#059669', to: '#0d9488' },
  },
  {
    name: 'purple',
    label: 'Purple',
    colors: {
      50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe',
      400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 700: '#7e22ce',
      800: '#6b21a8', 900: '#581c87', 950: '#3b0764',
    },
    gradient: { from: '#9333ea', to: '#7c3aed' },
  },
  {
    name: 'blue',
    label: 'Blue',
    colors: {
      50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
      400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8',
      800: '#1e40af', 900: '#1e3a8a', 950: '#172554',
    },
    gradient: { from: '#2563eb', to: '#4f46e5' },
  },
  {
    name: 'orange',
    label: 'Orange',
    colors: {
      50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74',
      400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c',
      800: '#9a3412', 900: '#7c2d12', 950: '#431407',
    },
    gradient: { from: '#ea580c', to: '#dc2626' },
  },
  {
    name: 'amber',
    label: 'Golden Yellow',
    colors: {
      50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d',
      400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309',
      800: '#92400e', 900: '#78350f', 950: '#451a03',
    },
    gradient: { from: '#d97706', to: '#ea580c' },
  },
  {
    name: 'rose',
    label: 'Rose Pink',
    colors: {
      50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af',
      400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c',
      800: '#9f1239', 900: '#881337', 950: '#4c0519',
    },
    gradient: { from: '#e11d48', to: '#db2777' },
  },
  {
    name: 'teal',
    label: 'Teal',
    colors: {
      50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4',
      400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e',
      800: '#115e59', 900: '#134e4a', 950: '#042f2e',
    },
    gradient: { from: '#0d9488', to: '#059669' },
  },
  {
    name: 'indigo',
    label: 'Indigo',
    colors: {
      50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc',
      400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca',
      800: '#3730a3', 900: '#312e81', 950: '#1e1b4e',
    },
    gradient: { from: '#4f46e5', to: '#7c3aed' },
  },
];

const THEME_STORAGE_KEY = 'thriftysouq-theme';

interface ThemeContextType {
  currentTheme: ThemePreset;
  setTheme: (themeName: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyThemeToDOM(theme: ThemePreset) {
  const root = document.documentElement;
  const c = theme.colors;
  root.style.setProperty('--brand-50', c[50]);
  root.style.setProperty('--brand-100', c[100]);
  root.style.setProperty('--brand-200', c[200]);
  root.style.setProperty('--brand-300', c[300]);
  root.style.setProperty('--brand-400', c[400]);
  root.style.setProperty('--brand-500', c[500]);
  root.style.setProperty('--brand-600', c[600]);
  root.style.setProperty('--brand-700', c[700]);
  root.style.setProperty('--brand-800', c[800]);
  root.style.setProperty('--brand-900', c[900]);
  root.style.setProperty('--brand-950', c[950]);
  root.style.setProperty('--brand-gradient-from', theme.gradient.from);
  root.style.setProperty('--brand-gradient-to', theme.gradient.to);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemePreset>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    const found = themePresets.find(t => t.name === saved);
    return found || themePresets[0];
  });

  useEffect(() => {
    applyThemeToDOM(currentTheme);
  }, [currentTheme]);

  const setTheme = (themeName: string) => {
    const preset = themePresets.find(t => t.name === themeName);
    if (preset) {
      setCurrentTheme(preset);
      localStorage.setItem(THEME_STORAGE_KEY, themeName);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
