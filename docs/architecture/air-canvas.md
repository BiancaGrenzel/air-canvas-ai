# AirCanvas

Freehand drawing surface driven by Gesture Engine **interaction states**.

## Rules

| Gesture state                  | AirCanvas action                  |
| ------------------------------ | --------------------------------- |
| `Drawing`                      | begin / continue stroke at cursor |
| `Hover` (or any non-`Drawing`) | end stroke                        |

## Features

- Brush thickness
- Color
- Eraser (`destination-out`)
- Clear canvas
- Export / download PNG

## Usage

```ts
import { createAirCanvas } from '@/air-canvas'

const air = createAirCanvas({ color: '#09090b', thickness: 4 })
air.attach(canvasElement)

air.handleInteraction({ state: 'Drawing', point: { x: 0.4, y: 0.5 } })
air.handleInteraction({ state: 'Drawing', point: { x: 0.42, y: 0.51 } })
air.handleInteraction({ state: 'Hover', point: { x: 0.42, y: 0.51 } })

air.setTool('eraser')
air.clear()
air.downloadPng('sketch.png')
```

Logic lives in `@/air-canvas` — no React inside the engine.
Presentation mounts `AirCanvasSurface` and forwards state + cursor points.
