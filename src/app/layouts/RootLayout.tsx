import { NavLink, Outlet } from 'react-router-dom'

import { ROUTES } from '@/app/router/routes'
import { Badge, Container } from '@/components'
import { cn } from '@/shared/lib'

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-ink text-ink-inverse'
      : 'text-ink-muted hover:bg-canvas-subtle hover:text-ink',
  )

export function RootLayout() {
  return (
    <div className="text-ink min-h-screen">
      <header className="border-border bg-surface/80 border-b backdrop-blur-md">
        <Container className="flex items-center justify-between gap-6 py-4">
          <div className="space-y-1">
            <Badge variant="outline">Open Source</Badge>
            <h1 className="font-display text-lg font-semibold tracking-tight">
              AirCanvas AI
            </h1>
          </div>

          <nav className="flex items-center gap-1">
            <NavLink to={ROUTES.home} className={navLinkClassName} end>
              Home
            </NavLink>
            <NavLink to={ROUTES.studio} className={navLinkClassName}>
              Studio
            </NavLink>
            <NavLink to={ROUTES.settings} className={navLinkClassName}>
              Settings
            </NavLink>
          </nav>
        </Container>
      </header>

      <main className="py-10">
        <Container>
          <Outlet />
        </Container>
      </main>
    </div>
  )
}
