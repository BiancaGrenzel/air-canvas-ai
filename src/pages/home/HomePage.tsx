import { Link } from 'react-router-dom'

import { ROUTES } from '@/app/router/routes'
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  buttonVariants,
} from '@/components'
import { APP_DESCRIPTION, APP_NAME } from '@/shared/config'
import { cn } from '@/shared/lib'

export function HomePage() {
  return (
    <section className="space-y-8">
      <div className="space-y-4">
        <Badge variant="accent">Computer Vision Input</Badge>
        <h2 className="font-display text-ink max-w-2xl text-4xl font-semibold tracking-tight">
          {APP_NAME}
        </h2>
        <p className="text-ink-muted max-w-2xl text-base leading-relaxed">
          {APP_DESCRIPTION}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          to={ROUTES.studio}
          className={cn(buttonVariants({ variant: 'primary', size: 'lg' }))}
        >
          Open Studio
        </Link>
        <Link
          to={ROUTES.settings}
          className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
        >
          Settings
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader
            title="Hand tracking"
            description="MediaPipe Hand Landmarker ready for adapters."
          />
          <CardBody>
            Capture landmarks from any webcam without coupling UI to the browser
            APIs.
          </CardBody>
        </Card>
        <Card>
          <CardHeader
            title="Virtual cursor"
            description="Pointer control abstracted behind ports."
          />
          <CardBody>
            Move a cursor with your hands today — map to OS input when Tauri
            arrives.
          </CardBody>
        </Card>
        <Card>
          <CardHeader
            title="Gesture actions"
            description="Custom gestures for apps, media, and more."
          />
          <CardBody>
            Domain models and use cases stay host-agnostic for desktop
            migration.
          </CardBody>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" disabled>
          Coming soon
        </Button>
        <span className="text-ink-subtle text-xs">
          Tracking pipeline not wired yet
        </span>
      </div>
    </section>
  )
}
