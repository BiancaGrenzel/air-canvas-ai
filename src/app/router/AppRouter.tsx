import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { RootLayout } from '@/app/layouts'
import { ROUTES } from '@/app/router/routes'
import { HomePage } from '@/pages/home'
import { NotFoundPage } from '@/pages/not-found'
import { SettingsPage } from '@/pages/settings'
import { StudioPage } from '@/pages/studio'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<HomePage />} />
          <Route path={ROUTES.studio} element={<StudioPage />} />
          <Route path={ROUTES.settings} element={<SettingsPage />} />
          <Route path="/home" element={<Navigate to={ROUTES.home} replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
