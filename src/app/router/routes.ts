export const ROUTES = {
  home: '/',
  studio: '/studio',
  settings: '/settings',
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]
