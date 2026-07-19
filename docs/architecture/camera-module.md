# Camera module

Isolated webcam access following dependency inversion.

## Layers

| Layer                        | Responsibility                                                              |
| ---------------------------- | --------------------------------------------------------------------------- |
| `domain`                     | `CameraDevice`, `CameraResolution`, `CameraError`, permission/session enums |
| `application/ports`          | `CameraPort`, `CameraPreviewBinder`, `CameraAdapter`                        |
| `infrastructure/camera/web`  | MediaDevices adapter + FPS meter                                            |
| `infrastructure/camera/fake` | In-memory adapter for tests                                                 |
| `camera`                     | Service, provider, hooks, `CameraPreview`                                   |

## Rule

Screens and pages **must not** call `navigator.mediaDevices`.
They use `@/camera` hooks / components only.

## Hooks

```tsx
import {
  useCamera,
  useCameraDevices,
  useCameraPermission,
  useCameraVideoRef,
  CameraPreview,
} from '@/camera'
```

## Testing

Inject a fake adapter via the provider:

```tsx
import { CameraProvider, createCameraService } from '@/camera'
import { createFakeCameraAdapter } from '@/infrastructure/camera'

<CameraProvider adapter={createFakeCameraAdapter()} />
// or
<CameraProvider service={createCameraService(createFakeCameraAdapter())} />
```
