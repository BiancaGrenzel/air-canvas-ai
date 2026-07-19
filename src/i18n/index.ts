/**
 * Lightweight i18n — English + Portuguese, driven by Settings locale.
 */

export type { AppLocale } from './types'
export { APP_LOCALES, LOCALE_HTML_LANG } from './types'

export { en } from './locales/en'
export type { Messages } from './locales/en'
export { pt } from './locales/pt'

export {
  createTranslator,
  translate,
  translateActionDescription,
  translateActionName,
  translateGestureDescription,
  translateGestureName,
} from './translate'
export type { TranslateParams } from './translate'

export { useApplyLocale } from './useApplyLocale'
export { useTranslation } from './useTranslation'
export type { TranslationApi } from './useTranslation'
