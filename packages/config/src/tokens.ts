/**
 * AllDocs "Studio" design tokens.
 * Single source of truth, transcribed from 04-design-system.md (Studio theme).
 * Flat color only — NO gradients. Warm cream canvas, yellow accent, orange shapes.
 */

/** Brand colors — only three hues: yellow, orange (shapes only), black. */
export const brand = {
  accent: '#FFD60A', // yellow — CTAs, accent dots, highlights
  accentHover: '#F5C400',
  shapeOrange: '#FF8A3D', // oversized decorative circles/blobs
  shapeYellow: '#FFE08A', // secondary soft shapes, badge backgrounds
} as const;

/** Light mode (default — the whole product lives here). */
export const light = {
  bgPage: '#F5F2EB', // warm cream
  bgSurface: '#FFFFFF', // cards, tool tiles, modals
  bgElevated: '#FBF9F4', // subtle tinted panels, code blocks
  textPrimary: '#1D1D1F', // near-black headlines
  textSecondary: '#6E6B66', // body copy, warm gray
  textMuted: '#A3A098',
  border: '#E8E3D8', // hairlines on cream
  borderCard: '#EFEBE2',
  accent: '#FFD60A',
  accentHover: '#F5C400',
  success: '#30D158',
  danger: '#FF453A',
  warning: '#FF9F0A',
  info: '#0A84FF',
  dropzoneActiveFill: '#FFF7D6', // soft yellow tint on active dropzone
} as const;

/** Dark mode (app chrome / settings only — landing stays light). */
export const dark = {
  bgDark: '#161617',
  bgDarkCard: '#1F1F21',
  borderDark: '#2E2E30',
  textOnDark: '#F5F5F7',
  textDim: '#98989D',
  accent: '#FFD60A', // unchanged — pops on black
} as const;

export const typography = {
  fontDisplay: '"Archivo", "Helvetica Neue", "SF Pro Display", Arial, sans-serif',
  fontBody: '"Inter", "Helvetica Neue", system-ui, sans-serif',
  fontMono: '"SF Mono", "JetBrains Mono", monospace',
  headlineTracking: '-0.02em',
  eyebrowTracking: '0.08em',
} as const;

export const radius = {
  sm: '10px', // inputs, small cards
  md: '16px', // tool tiles
  lg: '24px', // feature cards, panels
  pill: '999px', // buttons, badges, chips
} as const;

/** Soft, warm shadows — never colored. */
export const shadow = {
  card: '0 2px 6px rgba(29,29,31,.05), 0 16px 40px rgba(29,29,31,.07)',
  float: '0 24px 60px rgba(29,29,31,.12)',
} as const;

/** 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128 */
export const spacing = [4, 8, 12, 16, 24, 32, 48, 64, 96, 128] as const;

export const tokens = {
  brand,
  light,
  dark,
  typography,
  radius,
  shadow,
  spacing,
} as const;

export type Tokens = typeof tokens;
