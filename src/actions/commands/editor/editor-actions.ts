import type { EditorActionPort } from '@/application/ports'

import { createActionDefinition } from '../../create-action-engine'
import type { ActionCommand } from '../../types'

export const EDITOR_ACTION_IDS = {
  toggleTerminal: 'vscode.toggle-terminal',
  saveFile: 'vscode.save-file',
} as const

export function createEditorActions(port: EditorActionPort): ActionCommand[] {
  return [
    {
      id: EDITOR_ACTION_IDS.toggleTerminal,
      definition: createActionDefinition({
        id: EDITOR_ACTION_IDS.toggleTerminal,
        name: 'Toggle Terminal',
        description: 'Show or hide the VS Code terminal.',
        domain: 'editor',
        enabled: true,
      }),
      execute: () => port.toggleTerminal(),
    },
    {
      id: EDITOR_ACTION_IDS.saveFile,
      definition: createActionDefinition({
        id: EDITOR_ACTION_IDS.saveFile,
        name: 'Save File',
        description: 'Save the active editor file.',
        domain: 'editor',
        enabled: true,
      }),
      execute: () => port.saveFile(),
    },
  ]
}
