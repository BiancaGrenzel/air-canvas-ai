/**
 * Gesture module
 *
 * 1) Interaction engine — landmarks → states (Lost/Hover/Pinch/…)
 * 2) Recognition — named gestures → Command Pattern actions
 */

export {
  createGestureEngine,
  type CreateGestureEngineOptions,
  type GestureEngine,
} from './engine'

export {
  createDefaultFeatureDetectors,
  createMotionDetector,
  createPinchDetector,
  createPointerDetector,
  createPresenceDetector,
  runFeatureDetectors,
  type FeatureDetectorContext,
  type GestureFeatureDetector,
  type MutableGestureFeatures,
  type PinchDetectorOptions,
} from './features'

export {
  createDefaultStateHandlers,
  createDragDrawingStrategy,
  createDraggingState,
  createDrawingState,
  createHoverState,
  createLostState,
  createPinchState,
  createReleasedState,
  createTrackingState,
  type CreateStateHandlersOptions,
  type DragDrawingStrategyOptions,
  type InteractionStateHandler,
  type InteractionTrackContext,
  type PinchMotionStrategy,
} from './state'

export {
  createBuiltinGestureDefinitions,
  createCallbackCommandFactory,
  createDefaultGestureMatchers,
  createDefaultMatcherRegistry,
  createFistMatcher,
  createGestureCommandBus,
  createGestureMatcherRegistry,
  createGestureRecognizer,
  createInteractionEnterMatcher,
  createInteractionHoldMatcher,
  createLogCommandFactory,
  createNoopCommandFactory,
  createOpenPalmMatcher,
  createPinchTapMatcher,
  createRockMatcher,
  createVictoryMatcher,
  type CreateGestureRecognizerOptions,
  type GestureCommand,
  type GestureCommandBus,
  type GestureCommandContext,
  type GestureCommandFactory,
  type GestureMatchScore,
  type GestureMatcher,
  type GestureMatcherRegistry,
  type GestureRecognitionContext,
  type GestureRecognizedListener,
  type GestureRecognizer,
} from './recognition'
