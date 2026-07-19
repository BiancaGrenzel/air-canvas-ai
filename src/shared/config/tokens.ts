/**
 * Design System tokens — TypeScript mirror of CSS @theme values.
 * Prefer Tailwind token classes in UI; use these for non-CSS contexts.
 */

export const colors = {
  canvas: '#f4f4f5',
  canvasSubtle: '#ececef',
  surface: '#ffffff',
  surfaceMuted: '#fafafa',
  ink: '#09090b',
  inkSecondary: '#3f3f46',
  inkMuted: '#71717a',
  inkSubtle: '#a1a1aa',
  inkInverse: '#fafafa',
  border: '#e4e4e7',
  borderStrong: '#d4d4d8',
  borderMuted: '#f4f4f5',
  accent: '#3b63f3',
  accentHover: '#2f54e0',
  accentMuted: '#eef2ff',
  accentForeground: '#ffffff',
  success: '#16a34a',
  successMuted: '#dcfce7',
  warning: '#ca8a04',
  warningMuted: '#fef9c3',
  danger: '#dc2626',
  dangerHover: '#b91c1c',
  dangerMuted: '#fee2e2',
  overlay: 'rgb(9 9 11 / 48%)',
  ring: '#3b63f3',
} as const

export const spacing = {
  0: '0px',
  px: '1px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
} as const

export const typography = {
  fonts: {
    sans: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
    display:
      "'Sora', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, monospace",
  },
  sizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
} as const

export const borders = {
  width: {
    default: '1px',
    thick: '2px',
  },
} as const

export const radius = {
  none: '0px',
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.25rem',
  full: '9999px',
} as const

export const shadows = {
  xs: '0 1px 2px rgb(9 9 11 / 4%)',
  sm: '0 1px 3px rgb(9 9 11 / 6%), 0 1px 2px rgb(9 9 11 / 4%)',
  md: '0 4px 12px rgb(9 9 11 / 8%)',
  lg: '0 12px 32px rgb(9 9 11 / 12%)',
  focus: '0 0 0 3px rgb(59 99 243 / 28%)',
} as const

export const tokens = {
  colors,
  spacing,
  typography,
  borders,
  radius,
  shadows,
} as const

export type ColorToken = keyof typeof colors
export type SpacingToken = keyof typeof spacing
export type RadiusToken = keyof typeof radius
export type ShadowToken = keyof typeof shadows
