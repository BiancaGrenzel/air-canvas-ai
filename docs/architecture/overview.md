# AirCanvas AI — Architecture

Clean Architecture layout inside a single Vite app, prepared for a future Tauri desktop shell.

## Dependency rule

```
app / pages / components
        ↓
application (use cases + ports)
        ↓
domain (entities, value objects)
        ↑
infrastructure (MediaPipe, TF.js, browser/Tauri adapters)
```

- `domain` must not import React, DOM, MediaPipe, TensorFlow.js, or Tauri.
- `application` depends only on `domain` and port interfaces.
- `infrastructure` implements ports; swap `web` adapters for `tauri` later.
- `app` is the composition root (providers, router, store wiring).

## Module facades

Presentation-facing facades under `@/vision`, `@/camera`, `@/gesture`, `@/cursor`, and `@/canvas` coordinate UI with application use cases without leaking adapter details.
