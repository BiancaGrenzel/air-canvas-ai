import { AppRouter } from '@/app/router'
import { useApplyLocale } from '@/i18n'

import { useApplyTheme } from './useApplyTheme'

export function App() {
  useApplyTheme()
  useApplyLocale()
  return <AppRouter />
}
