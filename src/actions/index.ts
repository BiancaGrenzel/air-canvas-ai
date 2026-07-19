/**
 * Action Engine — execute named actions via Command Pattern.
 *
 * Canvas actions today; Spotify / PowerPoint / VS Code / OS later
 * through dedicated ports + adapters.
 */

export {
  createActionDefinition,
  createActionEngine,
} from './create-action-engine'

export { createGestureCommandFactoriesFromActions } from './gesture-bridge'

export {
  CANVAS_ACTION_IDS,
  createCanvasActions,
  type CreateCanvasActionsOptions,
} from './commands/canvas/canvas-actions'

export {
  MEDIA_ACTION_IDS,
  createMediaActions,
} from './commands/media/media-actions'

export {
  PRESENTATION_ACTION_IDS,
  createPresentationActions,
} from './commands/presentation/presentation-actions'

export {
  EDITOR_ACTION_IDS,
  createEditorActions,
} from './commands/editor/editor-actions'

export { OS_ACTION_IDS, createOsActions } from './commands/os/os-actions'

export { createFutureActionPlaceholders } from './commands/future-placeholders'

export { createAirCanvasActionAdapter } from './adapters/air-canvas.adapter'

export {
  createNoopEditorActionPort,
  createNoopMediaActionPort,
  createNoopOsActionPort,
  createNoopPresentationActionPort,
} from './adapters/noop-ports'

export type {
  ActionCommand,
  ActionContext,
  ActionDefinition,
  ActionDomain,
  ActionEngine,
  CreateActionEngineOptions,
} from './types'
