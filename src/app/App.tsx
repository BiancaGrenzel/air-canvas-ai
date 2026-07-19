import { AppRouter } from '@/app/router'

import { useApplyTheme } from './useApplyTheme'

export function App() {
  useApplyTheme()
  return <AppRouter />
}
