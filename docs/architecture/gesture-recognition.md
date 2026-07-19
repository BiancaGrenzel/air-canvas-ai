# Gesture Recognition

Named gestures with **name**, **description**, **confidence**, and **action**.

Built on top of the interaction Gesture Engine — does not replace it.

## Extensibility (no giant switch)

| Piece                         | Pattern  | Role                               |
| ----------------------------- | -------- | ---------------------------------- |
| `GestureDefinition`           | Data     | Serializable gesture config        |
| `GestureMatcher`              | Strategy | Detect from landmarks / states     |
| `GestureCommand` + bus        | Command  | Execute actions by `action` id     |
| `GestureDefinitionRepository` | Port     | Load/save definitions (JSON later) |

### Add a gesture without changing recognizer code

```ts
recognizer.registerMatcher({ type: 'my-matcher', match(ctx, params) { ... } })
recognizer.registerCommand(createCallbackCommandFactory('my-action', handler))
recognizer.registerDefinition({
  id: 'user-wave',
  name: 'Wave',
  description: 'User-defined wave',
  confidence: 0.65,
  action: 'my-action',
  matcher: { type: 'my-matcher', params: { threshold: 0.8 } },
})
```

Future: persist definitions as JSON and load via `GestureDefinitionRepository`.

## Usage

```ts
import { createGestureRecognizer } from '@/gesture'

const recognizer = createGestureRecognizer()

recognizer.onRecognized((match) => {
  console.log(match.definition.name, match.confidence)
})

await recognizer.update(interactionSnapshot, handPoses)
```
