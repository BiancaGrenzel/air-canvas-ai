import { useMemo } from 'react'

import { useSettingsStore } from '@/store'

import {
  createTranslator,
  translateActionDescription,
  translateActionName,
  translateGestureDescription,
  translateGestureEffect,
  translateGestureName,
  type TranslateParams,
} from './translate'
import type { AppLocale } from './types'

export function useTranslation() {
  const locale = useSettingsStore((state) => state.locale)

  return useMemo(() => {
    const t = createTranslator(locale)
    return {
      locale,
      t,
      actionName: (id: string) => translateActionName(locale, id),
      actionDescription: (id: string) => translateActionDescription(locale, id),
      gestureName: (id: string) => translateGestureName(locale, id),
      gestureDescription: (id: string) =>
        translateGestureDescription(locale, id),
      gestureEffect: (id: string) => translateGestureEffect(locale, id),
    }
  }, [locale])
}

export type TranslationApi = {
  locale: AppLocale
  t: (key: string, params?: TranslateParams) => string
  actionName: (id: string) => string
  actionDescription: (id: string) => string
  gestureName: (id: string) => string
  gestureDescription: (id: string) => string
  gestureEffect: (id: string) => string
}
