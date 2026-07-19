# Gesture Engine

Transforms hand landmarks into **interaction states**. It does **not** recognize high-level custom gestures (open app, volume, etc.) — those layers come later.

## States

`Lost` → `Tracking` → `Hover` → `Pinch` → `Dragging` | `Drawing` → `Released` → …

## Patterns

| Pattern      | Where                                                       |
| ------------ | ----------------------------------------------------------- |
| **Strategy** | `GestureFeatureDetector` (presence, pinch, pointer, motion) |
| **Strategy** | `PinchMotionStrategy` (Dragging vs Drawing)                 |
| **State**    | `InteractionStateHandler` per state                         |

Add a new feature detector or replace a state handler without growing a giant `if` chain.

## Usage

```ts
import { createGestureEngine } from '@/gesture'

const engine = createGestureEngine()

engine.onStateChange((event) => {
  console.log(event.from, '→', event.to)
})

const snapshot = engine.update(handTrackingFrame)
// snapshot.primary?.state === 'Hover' | 'Pinch' | ...
```

## Extensibility

```ts
engine.registerFeatureDetector({
  id: 'open-palm',
  detect(ctx, draft) {
    // enrich features
  },
})

engine.registerStateHandler({
  id: 'Hover',
  update(ctx) {
    // custom transitions
    return null
  },
})
```
