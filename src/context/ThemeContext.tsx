import React, { createContext, useContext, useState, useEffect } from 'react';

export type BrightColor = 'cyan' | 'emerald' | 'amber' | 'violet' | 'coral';
export type BrightBackgroundStyle = 'pure-white' | 'warm-solar' | 'fresh-mint' | 'electric-sky' | 'soft-silver';

export interface BrightThemeConfig {
  id: BrightColor;
  label: string;
  tagline: string;
  dotColor: string;
  primaryHex: string;
  primaryClass: string;
  primaryHoverClass: string;
  textClass: string;
  bgLightClass: string;
  borderClass: string;
  ringClass: string;
  gradient: string;
  badgeBg: string;
  badgeText: string;
}

export interface BrightBgConfig {
  id: BrightBackgroundStyle;
  label: string;
  subtitle: string;
  previewBg: string;
  description: string;
}

export const BRIGHT_THEMES: Record<BrightColor, BrightThemeConfig> = {
  cyan: {
    id: 'cyan',
    label: 'Electric Cyan',
    tagline: 'Vibrant Azure & High-Tech Blue',
    dotColor: '#0284c7',
    primaryHex: '#0284c7',
    primaryClass: 'bg-sky-600 hover:bg-sky-700 text-white',
    primaryHoverClass: 'hover:bg-sky-700',
    textClass: 'text-sky-600',
    bgLightClass: 'bg-sky-50',
    borderClass: 'border-sky-200',
    ringClass: 'focus:ring-sky-500',
    gradient: 'from-sky-500 via-cyan-500 to-blue-600',
    badgeBg: 'bg-sky-100',
    badgeText: 'text-sky-800',
  },
  emerald: {
    id: 'emerald',
    label: 'Radiant Emerald',
    tagline: 'Fresh Mint & Industrial Vitality',
    dotColor: '#10b981',
    primaryHex: '#059669',
    primaryClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    primaryHoverClass: 'hover:bg-emerald-700',
    textClass: 'text-emerald-600',
    bgLightClass: 'bg-emerald-50',
    borderClass: 'border-emerald-200',
    ringClass: 'focus:ring-emerald-500',
    gradient: 'from-emerald-500 via-teal-500 to-emerald-600',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
  },
  amber: {
    id: 'amber',
    label: 'Solar Amber',
    tagline: 'Warm Sunburst & High-Visibility Gold',
    dotColor: '#f59e0b',
    primaryHex: '#d97706',
    primaryClass: 'bg-amber-600 hover:bg-amber-700 text-white',
    primaryHoverClass: 'hover:bg-amber-700',
    textClass: 'text-amber-600',
    bgLightClass: 'bg-amber-50',
    borderClass: 'border-amber-200',
    ringClass: 'focus:ring-amber-500',
    gradient: 'from-amber-500 via-orange-500 to-amber-600',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-900',
  },
  violet: {
    id: 'violet',
    label: 'Neon Violet',
    tagline: 'Electric Indigo & Modern Cyber Edge',
    dotColor: '#8b5cf6',
    primaryHex: '#7c3aed',
    primaryClass: 'bg-purple-600 hover:bg-purple-700 text-white',
    primaryHoverClass: 'hover:bg-purple-700',
    textClass: 'text-purple-600',
    bgLightClass: 'bg-purple-50',
    borderClass: 'border-purple-200',
    ringClass: 'focus:ring-purple-500',
    gradient: 'from-purple-500 via-indigo-500 to-violet-600',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-900',
  },
  coral: {
    id: 'coral',
    label: 'Lively Coral',
    tagline: 'Warm Energy & High-Contrast Precision',
    dotColor: '#e11d48',
    primaryHex: '#e11d48',
    primaryClass: 'bg-rose-600 hover:bg-rose-700 text-white',
    primaryHoverClass: 'hover:bg-rose-700',
    textClass: 'text-rose-600',
    bgLightClass: 'bg-rose-50',
    borderClass: 'border-rose-200',
    ringClass: 'focus:ring-rose-500',
    gradient: 'from-rose-500 via-pink-500 to-rose-600',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-900',
  },
};

export const BRIGHT_BACKGROUNDS: Record<BrightBackgroundStyle, BrightBgConfig> = {
  'pure-white': {
    id: 'pure-white',
    label: 'Studio White',
    subtitle: 'Crisp, luminous pure white canvas',
    previewBg: 'bg-white border-slate-300',
    description: 'Clean medical/scientific high-clarity background',
  },
  'electric-sky': {
    id: 'electric-sky',
    label: 'Electric Sky',
    subtitle: 'Soft azure & bright atmospheric daylight',
    previewBg: 'bg-sky-100 border-sky-300',
    description: 'Invigorating bright daylight sky backdrop',
  },
  'warm-solar': {
    id: 'warm-solar',
    label: 'Solar Ivory',
    subtitle: 'Sunlit warm golden glow',
    previewBg: 'bg-amber-100 border-amber-300',
    description: 'Warm, welcoming daylight with sunny gradients',
  },
  'fresh-mint': {
    id: 'fresh-mint',
    label: 'Mint Vitality',
    subtitle: 'Invigorating spring mint light',
    previewBg: 'bg-emerald-100 border-emerald-300',
    description: 'Fresh ecological and factory wellness background',
  },
  'soft-silver': {
    id: 'soft-silver',
    label: 'Platinum Slate',
    subtitle: 'Modern high-tech industrial silver',
    previewBg: 'bg-slate-100 border-slate-300',
    description: 'Subtle technical slate with ultra-clean contrast',
  },
};

interface ThemeContextType {
  brightColor: BrightColor;
  setBrightColor: (color: BrightColor) => void;
  bgStyle: BrightBackgroundStyle;
  setBgStyle: (style: BrightBackgroundStyle) => void;
  themeConfig: BrightThemeConfig;
  bgConfig: BrightBgConfig;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [brightColor, setBrightColorState] = useState<BrightColor>(() => {
    try {
      const saved = localStorage.getItem('machinemind_bright_color');
      if (saved && (saved === 'cyan' || saved === 'emerald' || saved === 'amber' || saved === 'violet' || saved === 'coral')) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'cyan';
  });

  const [bgStyle, setBgStyleState] = useState<BrightBackgroundStyle>(() => {
    try {
      const saved = localStorage.getItem('machinemind_bg_style');
      if (saved && (saved === 'pure-white' || saved === 'warm-solar' || saved === 'fresh-mint' || saved === 'electric-sky' || saved === 'soft-silver')) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'electric-sky'; // Default to beautiful bright electric-sky
  });

  // Permanently remove any legacy 'dark' class
  useEffect(() => {
    try {
      document.documentElement.classList.remove('dark');
      localStorage.removeItem('machinemind_theme');
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('machinemind_bright_color', brightColor);
      document.documentElement.setAttribute('data-bright-theme', brightColor);
    } catch {
      // ignore
    }
  }, [brightColor]);

  useEffect(() => {
    try {
      localStorage.setItem('machinemind_bg_style', bgStyle);
      document.documentElement.setAttribute('data-bg-style', bgStyle);
    } catch {
      // ignore
    }
  }, [bgStyle]);

  const setBrightColor = (color: BrightColor) => {
    setBrightColorState(color);
  };

  const setBgStyle = (style: BrightBackgroundStyle) => {
    setBgStyleState(style);
  };

  const themeConfig = BRIGHT_THEMES[brightColor];
  const bgConfig = BRIGHT_BACKGROUNDS[bgStyle];

  return (
    <ThemeContext.Provider 
      value={{ 
        brightColor, 
        setBrightColor, 
        bgStyle, 
        setBgStyle, 
        themeConfig, 
        bgConfig 
      }}
    >
      <div data-bright-theme={brightColor} data-bg-style={bgStyle}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
