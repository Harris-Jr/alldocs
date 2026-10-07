import type { Config } from 'tailwindcss';
import { light, dark, brand, radius, shadow } from '@alldocs/config/tokens';

/**
 * Tailwind theme wired to the Studio design tokens.
 * Flat color only — no gradient utilities. Warm cream + yellow + orange shapes.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        page: light.bgPage,
        surface: light.bgSurface,
        elevated: light.bgElevated,
        'text-primary': light.textPrimary,
        'text-secondary': light.textSecondary,
        'text-muted': light.textMuted,
        accent: {
          DEFAULT: brand.accent,
          hover: brand.accentHover,
        },
        'shape-orange': brand.shapeOrange,
        'shape-yellow': brand.shapeYellow,
        success: light.success,
        danger: light.danger,
        warning: light.warning,
        info: light.info,
        border: light.border,
        'border-card': light.borderCard,
        // dark section palette (app chrome / settings only)
        'dark-bg': dark.bgDark,
        'dark-card': dark.bgDarkCard,
        'dark-border': dark.borderDark,
        'dark-text': dark.textOnDark,
        'dark-dim': dark.textDim,
      },
      fontFamily: {
        display: ['var(--font-display)', 'Archivo', 'Helvetica Neue', 'Arial', 'sans-serif'],
        body: ['var(--font-body)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'SF Mono', 'JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm: radius.sm,
        md: radius.md,
        lg: radius.lg,
        pill: radius.pill,
      },
      boxShadow: {
        card: shadow.card,
        float: shadow.float,
      },
      letterSpacing: {
        headline: '-0.02em',
        eyebrow: '0.08em',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        float: 'float 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
