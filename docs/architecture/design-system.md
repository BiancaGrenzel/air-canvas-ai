# Design System

Custom Tailwind-based design system for AirCanvas AI.

Inspired by the restraint of OpenAI, Linear, Raycast, and Vercel:
near-black ink, cool neutrals, a single electric accent, tight radius, and soft single-layer elevation.

## Tokens

Defined in `src/index.css` (`@theme`) and mirrored in `src/shared/config/tokens.ts`.

| Token group | Examples                                                           |
| ----------- | ------------------------------------------------------------------ |
| Colors      | `canvas`, `surface`, `ink`, `accent`, `danger`                     |
| Spacing     | `1`–`24` scale                                                     |
| Typography  | `font-sans`, `font-display`, `font-mono`                           |
| Borders     | `border`, `border-strong`                                          |
| Radius      | `rounded-sm` … `rounded-xl`                                        |
| Shadows     | `shadow-xs`, `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-focus` |

## Components

Import from `@/components`:

- `Button` / `buttonVariants`
- `IconButton`
- `Badge`
- `Container`
- `Card` (+ `CardHeader`, `CardBody`, `CardFooter`)
- `Panel`
- `Modal`
- `Tooltip`

```tsx
import { Button, Badge, Panel } from '@/components'

<Button variant="primary">Open Studio</Button>
<Badge variant="accent">Beta</Badge>
```
