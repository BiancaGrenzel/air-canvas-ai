import type { OsActionPort } from '@/application/ports'

import { createActionDefinition } from '../../create-action-engine'
import type { ActionCommand } from '../../types'

export const OS_ACTION_IDS = {
  volumeUp: 'os.volume-up',
  mute: 'os.mute',
  openApp: 'os.open-app',
} as const

export function createOsActions(port: OsActionPort): ActionCommand[] {
  return [
    {
      id: OS_ACTION_IDS.volumeUp,
      definition: createActionDefinition({
        id: OS_ACTION_IDS.volumeUp,
        name: 'Volume Up',
        description: 'Increase system volume.',
        domain: 'os',
        enabled: true,
      }),
      async execute(context) {
        const current =
          typeof context?.params?.level === 'number'
            ? context.params.level
            : 0.5
        await port.setVolume(Math.min(1, current + 0.05))
      },
    },
    {
      id: OS_ACTION_IDS.mute,
      definition: createActionDefinition({
        id: OS_ACTION_IDS.mute,
        name: 'Mute',
        description: 'Mute system audio.',
        domain: 'os',
        enabled: true,
      }),
      execute: () => port.mute(),
    },
    {
      id: OS_ACTION_IDS.openApp,
      definition: createActionDefinition({
        id: OS_ACTION_IDS.openApp,
        name: 'Open App',
        description: 'Launch an application by id.',
        domain: 'os',
        enabled: true,
      }),
      async execute(context) {
        const appId =
          typeof context?.params?.appId === 'string'
            ? context.params.appId
            : 'unknown'
        await port.openApp(appId)
      },
    },
  ]
}
