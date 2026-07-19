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
import { useTranslation } from '@/i18n'
import { cn } from '@/shared/lib'

export function HomePage() {
  const { t } = useTranslation()

  return (
    <section className="space-y-8">
      <div className="space-y-4">
        <Badge variant="accent">{t('app.badgeVision')}</Badge>
        <h2 className="font-display text-ink max-w-2xl text-4xl font-semibold tracking-tight">
          {t('app.name')}
        </h2>
        <p className="text-ink-muted max-w-2xl text-base leading-relaxed">
          {t('app.description')}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          to={ROUTES.studio}
          className={cn(buttonVariants({ variant: 'primary', size: 'lg' }))}
        >
          {t('home.openStudio')}
        </Link>
        <Link
          to={ROUTES.settings}
          className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
        >
          {t('home.settings')}
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader
            title={t('home.cardTrackingTitle')}
            description={t('home.cardTrackingDesc')}
          />
          <CardBody>{t('home.cardTrackingBody')}</CardBody>
        </Card>
        <Card>
          <CardHeader
            title={t('home.cardCursorTitle')}
            description={t('home.cardCursorDesc')}
          />
          <CardBody>{t('home.cardCursorBody')}</CardBody>
        </Card>
        <Card>
          <CardHeader
            title={t('home.cardGesturesTitle')}
            description={t('home.cardGesturesDesc')}
          />
          <CardBody>{t('home.cardGesturesBody')}</CardBody>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" disabled>
          {t('home.comingSoon')}
        </Button>
        <span className="text-ink-subtle text-xs">
          {t('home.pipelineHint')}
        </span>
      </div>
    </section>
  )
}
