import type { PresentationActionPort } from '@/application/ports'

import { createActionDefinition } from '../../create-action-engine'
import type { ActionCommand } from '../../types'

export const PRESENTATION_ACTION_IDS = {
  nextSlide: 'powerpoint.next-slide',
  previousSlide: 'powerpoint.previous-slide',
} as const

export function createPresentationActions(
  port: PresentationActionPort,
): ActionCommand[] {
  return [
    {
      id: PRESENTATION_ACTION_IDS.nextSlide,
      definition: createActionDefinition({
        id: PRESENTATION_ACTION_IDS.nextSlide,
        name: 'Next Slide',
        description: 'Advance the presentation.',
        domain: 'presentation',
        enabled: true,
      }),
      execute: () => port.nextSlide(),
    },
    {
      id: PRESENTATION_ACTION_IDS.previousSlide,
      definition: createActionDefinition({
        id: PRESENTATION_ACTION_IDS.previousSlide,
        name: 'Previous Slide',
        description: 'Go back one slide.',
        domain: 'presentation',
        enabled: true,
      }),
      execute: () => port.previousSlide(),
    },
  ]
}
