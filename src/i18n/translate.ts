import { en, type Messages } from './locales/en'
import { pt } from './locales/pt'
import type { AppLocale } from './types'

const catalogs: Record<AppLocale, Messages> = {
  en,
  pt,
}

export type TranslateParams = Record<string, string | number>

type NamedCopy = { readonly name: string; readonly description: string }

function getByPath(source: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((current, segment) => {
    if (current && typeof current === 'object' && segment in current) {
      return (current as Record<string, unknown>)[segment]
    }
    return undefined
  }, source)
}

function interpolate(template: string, params?: TranslateParams): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    params[key] === undefined ? `{${key}}` : String(params[key]),
  )
}

function lookupNamed(
  locale: AppLocale,
  group: 'action' | 'gesture',
  id: string,
): NamedCopy | undefined {
  const primary = (catalogs[locale][group] as Record<string, NamedCopy>)[id]
  if (primary) return primary
  return (catalogs.en[group] as Record<string, NamedCopy>)[id]
}

export function translate(
  locale: AppLocale,
  key: string,
  params?: TranslateParams,
): string {
  const primary = getByPath(catalogs[locale], key)
  const fallback = getByPath(catalogs.en, key)
  const value =
    typeof primary === 'string'
      ? primary
      : typeof fallback === 'string'
        ? fallback
        : key
  return interpolate(value, params)
}

export function createTranslator(locale: AppLocale) {
  return (key: string, params?: TranslateParams) =>
    translate(locale, key, params)
}

export function translateActionName(locale: AppLocale, id: string): string {
  return lookupNamed(locale, 'action', id)?.name ?? id
}

export function translateActionDescription(
  locale: AppLocale,
  id: string,
): string {
  return lookupNamed(locale, 'action', id)?.description ?? id
}

export function translateGestureName(locale: AppLocale, id: string): string {
  return lookupNamed(locale, 'gesture', id)?.name ?? id
}

export function translateGestureDescription(
  locale: AppLocale,
  id: string,
): string {
  return lookupNamed(locale, 'gesture', id)?.description ?? id
}
