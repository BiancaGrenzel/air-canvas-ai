import type { PropsWithChildren } from 'react'

import { CameraProvider } from '@/camera'

export function AppProviders({ children }: PropsWithChildren) {
  return <CameraProvider>{children}</CameraProvider>
}
