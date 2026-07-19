# Cursor Engine

Transforms a finger / pointer position into a smoothed virtual cursor.

## Pipeline

1. Optional **mirror** (X)
2. **Sensitivity** — scale offset from center
3. **Acceleration** — non-linear gain on distance from center
4. Map into **bounds**
5. **One Euro Filter** smoothing
6. Clamp to bounds

## Usage

```ts
import { createCursorEngine } from '@/cursor'

const cursor = createCursorEngine({
  sensitivity: 1.25,
  acceleration: 0.35,
  mirrored: true,
  bounds: { minX: 0, minY: 0, maxX: 1, maxY: 1 },
})

const point = cursor.update({ x: tipX, y: tipY, timestampMs })
```

No React. Feed index-tip or Gesture Engine `pointer` from the presentation layer.

## Tests

```bash
npm test
```
