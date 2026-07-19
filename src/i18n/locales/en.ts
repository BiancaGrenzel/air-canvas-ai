/**
 * English UI copy — source of truth for message shape.
 */
export const en = {
  app: {
    name: 'AirCanvas AI',
    description:
      'Transform any webcam into a computer input device using computer vision.',
    openSource: 'Open Source',
    badgeVision: 'Computer Vision Input',
  },
  nav: {
    home: 'Home',
    studio: 'Studio',
    settings: 'Settings',
  },
  home: {
    openStudio: 'Open Studio',
    settings: 'Settings',
    cardTrackingTitle: 'Hand tracking',
    cardTrackingDesc: 'MediaPipe Hand Landmarker ready for adapters.',
    cardTrackingBody:
      'Capture landmarks from any webcam without coupling UI to the browser APIs.',
    cardCursorTitle: 'Virtual cursor',
    cardCursorDesc: 'Pointer control abstracted behind ports.',
    cardCursorBody:
      'Move a cursor with your hands today — map to OS input when Tauri arrives.',
    cardGesturesTitle: 'Gesture actions',
    cardGesturesDesc: 'Custom gestures for apps, media, and more.',
    cardGesturesBody:
      'Domain models and use cases stay host-agnostic for desktop migration.',
    comingSoon: 'Coming soon',
    pipelineHint: 'Tracking pipeline not wired yet',
  },
  notFound: {
    title: 'Page not found',
    description: 'The route you requested does not exist yet.',
    backHome: 'Back to home',
  },
  settings: {
    title: 'Settings',
    subtitle:
      'Preferences persist in the browser via Zustand. Changes apply to Studio immediately where possible; camera FPS applies on the next open.',
    reset: 'Reset defaults',
    cursorTitle: 'Cursor',
    cursorDesc: 'How the virtual pointer responds to hand motion.',
    sensitivity: 'Sensitivity',
    mirroring: 'Mirroring',
    mirroringDesc: 'Flip X to match a mirrored webcam preview.',
    cameraTitle: 'Camera & vision',
    cameraDesc: 'Capture rate and on-preview overlays.',
    targetFps: 'Target FPS',
    targetFpsDesc: 'Requested camera frame rate (device may clamp).',
    showLandmarks: 'Show landmarks',
    showLandmarksDesc: 'Skeleton overlay on the camera preview.',
    showFps: 'Show FPS',
    showFpsDesc: 'Display reported and actual FPS on the preview.',
    drawingTitle: 'Drawing',
    drawingDesc: 'Default brush used by AirCanvas and canvas actions.',
    thickness: 'Thickness',
    thicknessDesc: 'Brush width in pixels.',
    color: 'Color',
    colorDesc: 'Default brush color.',
    colorAria: 'Color {color}',
    customColorAria: 'Custom color',
    appearanceTitle: 'Appearance',
    appearanceDesc: 'Theme and language preferences.',
    theme: 'Theme',
    themeDesc: 'Stored locally with the rest.',
    language: 'Language',
    languageDesc: 'UI language for the whole app.',
  },
  theme: {
    light: 'Light',
    dark: 'Dark',
    system: 'System',
  },
  locale: {
    en: 'English',
    pt: 'Português',
  },
  studio: {
    title: 'Studio',
    subtitle:
      'Camera + Hand Landmarker are isolated modules. UI only consumes results — AI never imports React.',
    help: 'Help',
    session: 'session',
    camera: 'camera',
    vision: 'vision',
    state: 'state',
    visionRunning: 'running',
    visionIdle: 'idle',
    cameraTitle: 'Camera',
    cameraDesc: 'Open a webcam, switch devices, and inspect stream metrics.',
    openCamera: 'Open camera',
    closeCamera: 'Close camera',
    refreshDevices: 'Refresh devices',
    previewPlaceholder: 'Camera preview will appear here',
    cameraUnsupported: 'Camera is not supported in this environment',
    device: 'Device',
    noDevices: 'No devices',
    permission: 'Permission',
    resolution: 'Resolution',
    reportedFps: 'Reported FPS',
    actualFps: 'Actual FPS',
    requestPermission: 'Request permission',
    requestPermissionTip: 'Asks the browser for webcam access',
    gestureEngineTitle: 'Gesture Engine',
    gestureEngineDesc:
      'Landmarks → interaction states (not high-level gestures).',
    labelState: 'State',
    labelPinch: 'Pinch',
    labelPointer: 'Pointer',
    labelTrack: 'Track',
    labelCursor: 'Cursor',
    yes: 'yes',
    no: 'no',
    actionEngineTitle: 'Action Engine',
    actionEngineDesc:
      'Command Pattern actions — canvas now; Spotify, PowerPoint, VS Code, OS later.',
    run: 'Run',
    gestureRecognitionTitle: 'Gesture Recognition',
    gestureRecognitionDesc:
      'Named gestures with confidence + Action Engine commands.',
    lastMatch: 'Last match',
    noneYet: 'None yet',
    actionLog: 'Action log',
    actionLogEmpty: 'Try open palm, fist, victory, or a quick pinch tap.',
    airCanvasTitle: 'AirCanvas',
    airCanvasDesc:
      'Drawing starts on Gesture state Drawing and stops on Hover. Pinch + move to ink.',
    brush: 'Brush',
    eraser: 'Eraser',
    clear: 'Clear',
    savePng: 'Save PNG',
    thickness: 'Thickness',
    color: 'Color',
    colorAria: 'Color {color}',
    customColorAria: 'Custom color',
    inking: 'inking',
    idle: 'idle',
    handLandmarkerTitle: 'Hand Landmarker',
    handLandmarkerDesc:
      'MediaPipe Tasks Vision — up to 2 hands, 21 landmarks, handedness, confidence.',
    noHands: 'No hands detected yet. Show one or two hands to the camera.',
    openCameraForVision: 'Open the camera to start vision.',
    confidence: 'confidence {value}%',
    landmarksCount: '{count}/{total} landmarks',
    cameraRefTitle: 'Camera reference',
    cameraRefDesc: 'Skeleton overlay on the live camera feed.',
    cameraRefBody:
      'Use the camera preview above for tracking feedback. Ink is painted on the AirCanvas surface — pinch and move to enter Drawing.',
    helpTitle: 'Studio help',
    helpDesc: 'Camera → Vision → Gesture → Cursor → AirCanvas.',
    helpBody:
      'Pinch and drag to reach the Drawing state. AirCanvas starts inking at the cursor and stops when you return to Hover. Use eraser, thickness, color, clear, and Save PNG from the toolbar.',
    gotIt: 'Got it',
    logRecognized: '{gesture} → {action}',
    logConfidence: '{gesture} · {confidence}%',
  },
  cameraStatus: {
    idle: 'idle',
    requesting: 'requesting',
    starting: 'starting',
    open: 'open',
    stopping: 'stopping',
    error: 'error',
  },
  cameraPermission: {
    granted: 'granted',
    denied: 'denied',
    prompt: 'prompt',
    unsupported: 'unsupported',
  },
  sessionStatus: {
    idle: 'idle',
    ready: 'ready',
    tracking: 'tracking',
    paused: 'paused',
    error: 'error',
  },
  interactionState: {
    Lost: 'Lost',
    Tracking: 'Tracking',
    Hover: 'Hover',
    Pinch: 'Pinch',
    Dragging: 'Dragging',
    Drawing: 'Drawing',
    Released: 'Released',
  },
  handedness: {
    Left: 'Left',
    Right: 'Right',
    Unknown: 'Unknown',
  },
  domain: {
    canvas: 'canvas',
    media: 'media',
    presentation: 'presentation',
    editor: 'editor',
    os: 'os',
    system: 'system',
  },
  action: {
    'canvas.set-color': {
      name: 'Change Color',
      description: 'Set brush color or cycle the palette.',
    },
    'canvas.clear': {
      name: 'Clear Canvas',
      description: 'Erase all strokes from the drawing surface.',
    },
    'canvas.save': {
      name: 'Save Image',
      description: 'Export the canvas as a PNG file.',
    },
    'spotify.play-pause': {
      name: 'Play / Pause',
      description: 'Spotify playback toggle (coming soon).',
    },
    'spotify.next': {
      name: 'Next Track',
      description: 'Spotify next track (coming soon).',
    },
    'powerpoint.next-slide': {
      name: 'Next Slide',
      description: 'PowerPoint next slide (coming soon).',
    },
    'vscode.toggle-terminal': {
      name: 'Toggle Terminal',
      description: 'VS Code terminal (coming soon).',
    },
    'os.mute': {
      name: 'Mute',
      description: 'System mute (coming soon via Tauri).',
    },
  },
  gesture: {
    'open-palm': {
      name: 'Open Palm',
      description: 'Clear the AirCanvas drawing surface.',
    },
    fist: {
      name: 'Fist',
      description: 'Cycle brush color.',
    },
    victory: {
      name: 'Victory',
      description: 'Save the canvas as PNG.',
    },
    'pinch-tap': {
      name: 'Pinch Tap',
      description: 'Quick pinch to change brush color.',
    },
    'enter-drawing': {
      name: 'Start Drawing',
      description: 'Entered the Drawing interaction state.',
    },
  },
} as const

/** Deep-map literal strings → `string` so other locales can diverge in wording. */
type DeepStringify<T> = {
  [K in keyof T]: T[K] extends string
    ? string
    : T[K] extends object
      ? DeepStringify<T[K]>
      : T[K]
}

export type Messages = DeepStringify<typeof en>
