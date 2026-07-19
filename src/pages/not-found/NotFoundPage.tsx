import { Link } from 'react-router-dom'

import { ROUTES } from '@/app/router/routes'
import { Card, CardBody, CardHeader, buttonVariants } from '@/components'
import { cn } from '@/shared/lib'

export function NotFoundPage() {
  return (
    <Card className="max-w-lg">
      <CardHeader
        title="Page not found"
        description="The route you requested does not exist yet."
      />
      <CardBody>
        <Link
          to={ROUTES.home}
          className={cn(buttonVariants({ variant: 'primary' }))}
        >
          Back to home
        </Link>
      </CardBody>
    </Card>
  )
}
