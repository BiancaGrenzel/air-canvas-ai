export type AppLocale = 'en' | 'pt'

export const APP_LOCALES: readonly AppLocale[] = ['en', 'pt'] as const

export const LOCALE_HTML_LANG: Record<AppLocale, string> = {
  en: 'en',
  pt: 'pt-BR',
}
