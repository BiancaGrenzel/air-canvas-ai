import { createActionDefinition } from '../create-action-engine'
import type { ActionCommand } from '../types'
import {
  EDITOR_ACTION_IDS,
  MEDIA_ACTION_IDS,
  OS_ACTION_IDS,
  PRESENTATION_ACTION_IDS,
} from './ids'

/**
 * Catalog entries for future domains — disabled until real ports are wired.
 */
export function createFutureActionPlaceholders(): ActionCommand[] {
  const noop = async () => undefined

  const stub = (
    id: string,
    name: string,
    description: string,
    domain: ActionCommand['definition']['domain'],
  ): ActionCommand => ({
    id,
    definition: createActionDefinition({
      id,
      name,
      description,
      domain,
      enabled: false,
    }),
    execute: noop,
  })

  return [
    stub(
      MEDIA_ACTION_IDS.playPause,
      'Play / Pause',
      'Spotify playback toggle (coming soon).',
      'media',
    ),
    stub(
      MEDIA_ACTION_IDS.next,
      'Next Track',
      'Spotify next track (coming soon).',
      'media',
    ),
    stub(
      PRESENTATION_ACTION_IDS.nextSlide,
      'Next Slide',
      'PowerPoint next slide (coming soon).',
      'presentation',
    ),
    stub(
      EDITOR_ACTION_IDS.toggleTerminal,
      'Toggle Terminal',
      'VS Code terminal (coming soon).',
      'editor',
    ),
    stub(
      OS_ACTION_IDS.mute,
      'Mute',
      'System mute (coming soon via Tauri).',
      'os',
    ),
  ]
}
