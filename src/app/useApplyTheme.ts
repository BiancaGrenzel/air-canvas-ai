import { useEffect } from 'react'

import { useSettingsStore, type ThemePreference } from '@/store'

function resolveTheme(theme: ThemePreference): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }
  return theme
}

function applyResolvedTheme(resolved: 'light' | 'dark') {
  const root = document.documentElement
  root.classList.toggle('dark', resolved === 'dark')
  root.style.colorScheme = resolved
}

/**
 * Applies Zustand theme preference to `<html>` (light / dark / system).
 */
export function useApplyTheme() {
  const theme = useSettingsStore((state) => state.theme)

  useEffect(() => {
    const sync = () => applyResolvedTheme(resolveTheme(theme))
    sync()

    if (theme !== 'system') return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [theme])
}
