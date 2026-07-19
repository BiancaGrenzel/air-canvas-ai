# Action Engine

Executes named actions through the **Command Pattern**.

## Today

| Action id          | Behavior                |
| ------------------ | ----------------------- |
| `canvas.set-color` | Set / cycle brush color |
| `canvas.clear`     | Clear AirCanvas         |
| `canvas.save`      | Export PNG              |

## Tomorrow (ports ready)

| Domain       | Port                     | Examples                 |
| ------------ | ------------------------ | ------------------------ |
| Media        | `MediaActionPort`        | Spotify play/pause, next |
| Presentation | `PresentationActionPort` | PowerPoint slides        |
| Editor       | `EditorActionPort`       | VS Code terminal / save  |
| OS           | `OsActionPort`           | Volume, open app (Tauri) |

Placeholder actions are registered as `enabled: false` until adapters exist.

## Architecture

```
Gesture Recognizer ──action id──▶ Action Engine ──▶ ActionCommand
                                         │
                         CanvasActionPort / MediaActionPort / …
                                         │
                              AirCanvas / Spotify / Tauri adapters
```

No giant switch — commands are registered in a map by id.

## Usage

```ts
import {
  createActionEngine,
  createCanvasActions,
  createAirCanvasActionAdapter,
} from '@/actions'

const port = createAirCanvasActionAdapter(() => airCanvas)
const engine = createActionEngine({
  commands: createCanvasActions(port),
})

await engine.dispatch('canvas.clear', { source: 'ui' })
```

Bridge to gestures:

```ts
createGestureRecognizer({
  commandFactories: createGestureCommandFactoriesFromActions(
    engine,
    canvasCommands,
  ),
})
```
