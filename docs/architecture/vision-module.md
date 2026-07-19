# Vision module

Isolated Hand Landmarker orchestration using MediaPipe Tasks Vision.

## Public API

```ts
import { createHandVision } from '@/vision'

const vision = createHandVision({
  frameProvider: { getFrame: () => videoElement },
})

const unsubscribe = vision.onResults((results) => {
  // hands[], landmarks (21), handedness, confidence
})

await vision.start()
vision.stop()
unsubscribe()
```

Only `start`, `stop`, and `onResults` are exposed on the controller.
The factory accepts dependencies (frame provider, optional landmarker port).

## Rules

- No React inside `@/vision`
- No rendering / canvas drawing inside vision processing
- Screens subscribe to results; they never call MediaPipe directly
- `HandLandmarkerPort` enables fakes/tests and future runtimes (Tauri)

## Layers

| Layer                             | Role                                                                     |
| --------------------------------- | ------------------------------------------------------------------------ |
| `domain`                          | `Landmark`, `HandPose`, `HandTrackingFrame`, `Handedness`, `VisionError` |
| `application/ports`               | `HandLandmarkerPort`                                                     |
| `infrastructure/vision/mediapipe` | MediaPipe Tasks Vision adapter                                           |
| `infrastructure/vision/fake`      | Deterministic adapter for tests                                          |
| `vision`                          | `createHandVision` loop + listeners                                      |

## Testing

```ts
import { createHandVision } from '@/vision'
import { createFakeHandLandmarkerAdapter } from '@/infrastructure/vision'

const vision = createHandVision({
  frameProvider: { getFrame: () => canvas },
  landmarker: createFakeHandLandmarkerAdapter(),
})
```
