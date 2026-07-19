# Canvas drawing module

Pure rendering layer for hand skeletons on HTML Canvas (no SVG).

## Responsibility

- Receive landmark data
- Draw **bones** (ossos), **joints** (juntas), **lines**, and **indicators**
- Never run AI / MediaPipe / vision logic

## Public API

```ts
import { createHandCanvasRenderer } from '@/canvas'

const renderer = createHandCanvasRenderer(canvasElement)

renderer.setSize(width, height)
renderer.draw({
  mirrored: true,
  hands: [
    {
      handedness: 'Right',
      confidence: 0.94,
      landmarks: [/* 21 normalized points */],
    },
  ],
})

renderer.clear()
```

React helper (presentation only):

```ts
import { HandSkeletonOverlay } from '@/canvas'

<HandSkeletonOverlay hands={hands} mirrored />
```

## Topology

Bone connections live in `domain` (`HAND_BONES`) so the drawer does not import MediaPipe.
