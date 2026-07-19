import { useEffect } from 'react'

import { useSettingsStore } from '@/store'

import { translate } from './translate'
import { LOCALE_HTML_LANG } from './types'

/**
 * Syncs `<html lang>` and document meta with the persisted locale.
 */
export function useApplyLocale() {
  const locale = useSettingsStore((state) => state.locale)

  useEffect(() => {
    document.documentElement.lang = LOCALE_HTML_LANG[locale]
    document.title = translate(locale, 'app.name')

    const meta = document.querySelector('meta[name="description"]')
    if (meta) {
      meta.setAttribute('content', translate(locale, 'app.description'))
    }
  }, [locale])
}
