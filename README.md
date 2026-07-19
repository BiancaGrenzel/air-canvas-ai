# AirCanvas AI

Transform any webcam into a computer input device using computer vision.

Hand tracking, virtual cursor control, and canvas drawing — built as a professional open-source foundation prepared for a future Tauri desktop app.

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- Zustand
- React Router
- ESLint + Prettier
- Husky + lint-staged + Commitlint
- EditorConfig

## Getting started

```bash
npm install
npm run dev
```

## Scripts

| Command                | Description                         |
| ---------------------- | ----------------------------------- |
| `npm run dev`          | Start Vite dev server               |
| `npm run build`        | Typecheck and production build      |
| `npm run preview`      | Preview production build            |
| `npm run lint`         | Run ESLint                          |
| `npm run lint:fix`     | Run ESLint with autofix             |
| `npm run format`       | Format with Prettier                |
| `npm run format:check` | Check Prettier formatting           |
| `npm run typecheck`    | TypeScript project references check |

## Path aliases

`@/` maps to `src/`.

Examples:

- `@/components`
- `@/hooks`
- `@/vision`
- `@/camera`
- `@/gesture`
- `@/cursor`
- `@/canvas`
- `@/shared`
- `@/domain`
- `@/application`
- `@/infrastructure`
- `@/store`

## Architecture

See [docs/architecture/overview.md](docs/architecture/overview.md).

## License

To be defined.
