import type { MediaActionPort } from '@/application/ports'

import { createActionDefinition } from '../../create-action-engine'
import type { ActionCommand } from '../../types'

export const MEDIA_ACTION_IDS = {
  playPause: 'spotify.play-pause',
  next: 'spotify.next',
  previous: 'spotify.previous',
} as const

/**
 * Future Spotify / media actions — enabled once a real MediaActionPort is wired.
 */
export function createMediaActions(port: MediaActionPort): ActionCommand[] {
  return [
    {
      id: MEDIA_ACTION_IDS.playPause,
      definition: createActionDefinition({
        id: MEDIA_ACTION_IDS.playPause,
        name: 'Play / Pause',
        description: 'Toggle media playback (Spotify).',
        domain: 'media',
        enabled: true,
      }),
      execute: () => port.playPause(),
    },
    {
      id: MEDIA_ACTION_IDS.next,
      definition: createActionDefinition({
        id: MEDIA_ACTION_IDS.next,
        name: 'Next Track',
        description: 'Skip to the next track.',
        domain: 'media',
        enabled: true,
      }),
      execute: () => port.next(),
    },
    {
      id: MEDIA_ACTION_IDS.previous,
      definition: createActionDefinition({
        id: MEDIA_ACTION_IDS.previous,
        name: 'Previous Track',
        description: 'Go to the previous track.',
        domain: 'media',
        enabled: true,
      }),
      execute: () => port.previous(),
    },
  ]
}
