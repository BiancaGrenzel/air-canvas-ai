import { Link } from 'react-router-dom'

import { ROUTES } from '@/app/router/routes'
import { Card, CardBody, CardHeader, buttonVariants } from '@/components'
import { useTranslation } from '@/i18n'
import { cn } from '@/shared/lib'

export function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <Card className="max-w-lg">
      <CardHeader
        title={t('notFound.title')}
        description={t('notFound.description')}
      />
      <CardBody>
        <Link
          to={ROUTES.home}
          className={cn(buttonVariants({ variant: 'primary' }))}
        >
          {t('notFound.backHome')}
        </Link>
      </CardBody>
    </Card>
  )
}
