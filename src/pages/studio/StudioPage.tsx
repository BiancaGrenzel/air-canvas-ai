import { useMemo, useRef, useState } from 'react'

import { AirCanvasSurface, AIR_CANVAS_COLOR_PRESETS } from '@/air-canvas'
import {
  CameraPreview,
  useCamera,
  useCameraDevices,
  useCameraPermission,
} from '@/camera'
import { HandSkeletonOverlay } from '@/canvas'
import { Badge, Button, Modal, Panel, Tooltip } from '@/components'
import { formatCameraResolution, HAND_LANDMARK_COUNT } from '@/domain'
import { useSessionStore, useSettingsStore } from '@/store'

import { useStudioAirCanvas } from './useStudioAirCanvas'
import { useStudioCursorEngine } from './useStudioCursorEngine'
import { useStudioGestureEngine } from './useStudioGestureEngine'
import { useStudioGestureRecognition } from './useStudioGestureRecognition'
import { useStudioHandVision } from './useStudioHandVision'

export function StudioPage() {
  const sessionStatus = useSessionStore((state) => state.status)
  const mirrored = useSettingsStore((s) => s.mirrored)
  const showLandmarks = useSettingsStore((s) => s.showLandmarks)
  const showFps = useSettingsStore((s) => s.showFps)
  const targetFps = useSettingsStore((s) => s.targetFps)
  const [helpOpen, setHelpOpen] = useState(false)
  const [preferredDeviceId, setPreferredDeviceId] = useState<string | null>(
    null,
  )
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const {
    status,
    isOpen,
    resolution,
    reportedFps,
    actualFps,
    errorMessage,
    activeDeviceId,
    open,
    close,
    switchDevice,
  } = useCamera()

  const { devices, refresh: refreshDevices } = useCameraDevices()
  const { permission, isSupported, request } = useCameraPermission()
  const {
    hands,
    results: visionResults,
    running: visionRunning,
    error: visionError,
  } = useStudioHandVision(videoRef, isOpen)

  const {
    state: interactionState,
    features: interactionFeatures,
    primary: primaryHand,
    snapshot: interactionSnapshot,
  } = useStudioGestureEngine(visionResults, isOpen && visionRunning)

  const { position: cursorPosition } = useStudioCursorEngine(
    interactionFeatures?.pointer ?? null,
    visionResults?.timestampMs ?? 0,
    isOpen && visionRunning && interactionState !== 'Lost',
  )

  const {
    engine: airCanvas,
    tool,
    color,
    thickness,
    strokeActive,
    setTool,
    setColor,
    setThickness,
    clear: clearCanvas,
    savePng,
    canvasActionPort,
  } = useStudioAirCanvas(
    interactionState,
    cursorPosition,
    isOpen && visionRunning,
  )

  const {
    lastMatch: recognizedGesture,
    log: gestureLog,
    definitions: gestureDefinitions,
    actionCatalog,
    dispatchAction,
  } = useStudioGestureRecognition(
    interactionSnapshot,
    visionResults,
    isOpen && visionRunning,
    canvasActionPort,
  )

  const selectedDeviceId = useMemo(() => {
    if (activeDeviceId) return activeDeviceId
    if (preferredDeviceId) return preferredDeviceId
    return devices[0]?.deviceId ?? ''
  }, [activeDeviceId, preferredDeviceId, devices])

  const busy =
    status === 'starting' || status === 'stopping' || status === 'requesting'

  const handleOpen = async () => {
    if (permission !== 'granted') {
      await request()
    }
    await open({
      ...(selectedDeviceId ? { deviceId: selectedDeviceId } : {}),
      frameRate: targetFps,
    })
  }

  const handleDeviceChange = (deviceId: string) => {
    setPreferredDeviceId(deviceId)
    if (isOpen) {
      void switchDevice(deviceId, { frameRate: targetFps })
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Studio
            </h2>
            <Badge variant="neutral">session: {sessionStatus}</Badge>
            <Badge variant={isOpen ? 'success' : 'outline'}>
              camera: {status}
            </Badge>
            <Badge variant={visionRunning ? 'accent' : 'outline'}>
              vision: {visionRunning ? 'running' : 'idle'}
            </Badge>
            <Badge
              variant={interactionState === 'Lost' ? 'outline' : 'success'}
            >
              state: {interactionState}
            </Badge>
          </div>
          <p className="text-ink-muted max-w-xl text-sm">
            Camera + Hand Landmarker are isolated modules. UI only consumes
            results — AI never imports React.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setHelpOpen(true)}>
            Help
          </Button>
        </div>
      </div>

      <Panel
        title="Camera"
        description="Open a webcam, switch devices, and inspect stream metrics."
        action={
          <div className="flex flex-wrap gap-2">
            {!isOpen ? (
              <Button
                variant="primary"
                size="sm"
                disabled={!isSupported || busy}
                onClick={() => {
                  void handleOpen()
                }}
              >
                Open camera
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => {
                  void close()
                }}
              >
                Close camera
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() => {
                void refreshDevices()
              }}
            >
              Refresh devices
            </Button>
          </div>
        }
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
          <div className="border-border bg-ink relative overflow-hidden rounded-md border">
            {isOpen ? (
              <div className="relative aspect-video">
                <CameraPreview
                  ref={videoRef}
                  className="aspect-video"
                  mirrored={mirrored}
                />
                {showLandmarks ? (
                  <HandSkeletonOverlay hands={hands} mirrored={mirrored} />
                ) : null}
                {showFps ? (
                  <div className="bg-ink/70 text-ink-inverse pointer-events-none absolute top-2 left-2 z-20 rounded-md px-2 py-1 font-mono text-[11px] backdrop-blur-sm">
                    {reportedFps ?? '—'} / {actualFps ?? '—'} fps
                  </div>
                ) : null}
                {cursorPosition ? (
                  <div
                    className="border-accent-foreground bg-accent pointer-events-none absolute z-10 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 shadow-md"
                    style={{
                      left: `${cursorPosition.x * 100}%`,
                      top: `${cursorPosition.y * 100}%`,
                    }}
                    aria-hidden
                  />
                ) : null}
              </div>
            ) : (
              <div className="text-ink-subtle flex aspect-video items-center justify-center text-sm">
                {isSupported
                  ? 'Camera preview will appear here'
                  : 'Camera is not supported in this environment'}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-ink-secondary text-xs font-medium tracking-wide uppercase">
                Device
              </span>
              <select
                className="border-border bg-surface text-ink focus:shadow-focus w-full rounded-md border px-3 py-2 text-sm outline-none"
                value={selectedDeviceId}
                disabled={busy || devices.length === 0}
                onChange={(event) => {
                  const deviceId = event.target.value
                  if (!deviceId) return
                  handleDeviceChange(deviceId)
                }}
              >
                {devices.length === 0 ? (
                  <option value="">No devices</option>
                ) : (
                  devices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label}
                    </option>
                  ))
                )}
              </select>
            </label>

            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div className="border-border bg-surface-muted rounded-md border px-3 py-2">
                <dt className="text-ink-muted text-xs">Permission</dt>
                <dd className="text-ink mt-1 font-medium capitalize">
                  {permission}
                </dd>
              </div>
              <div className="border-border bg-surface-muted rounded-md border px-3 py-2">
                <dt className="text-ink-muted text-xs">Resolution</dt>
                <dd className="text-ink mt-1 font-medium">
                  {formatCameraResolution(resolution)}
                </dd>
              </div>
              <div className="border-border bg-surface-muted rounded-md border px-3 py-2">
                <dt className="text-ink-muted text-xs">Reported FPS</dt>
                <dd className="text-ink mt-1 font-medium">
                  {reportedFps ?? '—'}
                </dd>
              </div>
              <div className="border-border bg-surface-muted rounded-md border px-3 py-2">
                <dt className="text-ink-muted text-xs">Actual FPS</dt>
                <dd className="text-ink mt-1 font-medium">
                  {actualFps ?? '—'}
                </dd>
              </div>
            </dl>

            {errorMessage ? (
              <p className="bg-danger-muted text-danger rounded-md px-3 py-2 text-sm">
                {errorMessage}
              </p>
            ) : null}

            {permission === 'prompt' ? (
              <Tooltip content="Asks the browser for webcam access">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!isSupported || busy}
                  onClick={() => {
                    void request()
                  }}
                >
                  Request permission
                </Button>
              </Tooltip>
            ) : null}
          </div>
        </div>
      </Panel>

      <Panel
        title="Gesture Engine"
        description="Landmarks → interaction states (not high-level gestures)."
      >
        <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div className="border-border bg-surface-muted rounded-md border px-3 py-2">
            <dt className="text-ink-muted text-xs">State</dt>
            <dd className="text-ink mt-1 font-medium">{interactionState}</dd>
          </div>
          <div className="border-border bg-surface-muted rounded-md border px-3 py-2">
            <dt className="text-ink-muted text-xs">Pinch</dt>
            <dd className="text-ink mt-1 font-medium">
              {interactionFeatures?.pinch.active
                ? `yes · ${(interactionFeatures.pinch.strength * 100).toFixed(0)}%`
                : 'no'}
            </dd>
          </div>
          <div className="border-border bg-surface-muted rounded-md border px-3 py-2">
            <dt className="text-ink-muted text-xs">Pointer</dt>
            <dd className="text-ink mt-1 font-mono text-xs font-medium">
              {interactionFeatures?.pointer
                ? `${interactionFeatures.pointer.x.toFixed(2)}, ${interactionFeatures.pointer.y.toFixed(2)}`
                : '—'}
            </dd>
          </div>
          <div className="border-border bg-surface-muted rounded-md border px-3 py-2">
            <dt className="text-ink-muted text-xs">Track</dt>
            <dd className="text-ink mt-1 font-medium">
              {primaryHand?.trackId ?? '—'}
            </dd>
          </div>
          <div className="border-border bg-surface-muted rounded-md border px-3 py-2">
            <dt className="text-ink-muted text-xs">Cursor</dt>
            <dd className="text-ink mt-1 font-mono text-xs font-medium">
              {cursorPosition
                ? `${cursorPosition.x.toFixed(2)}, ${cursorPosition.y.toFixed(2)}`
                : '—'}
            </dd>
          </div>
        </dl>
      </Panel>

      <Panel
        title="Action Engine"
        description="Command Pattern actions — canvas now; Spotify, PowerPoint, VS Code, OS later."
      >
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {actionCatalog.map((action) => (
            <li
              key={action.id}
              className="border-border bg-surface-muted flex items-start justify-between gap-2 rounded-md border px-3 py-2"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-ink text-sm font-medium">{action.name}</p>
                  <Badge variant={action.enabled ? 'accent' : 'outline'}>
                    {action.domain}
                  </Badge>
                </div>
                <p className="text-ink-muted mt-1 text-xs">
                  {action.description}
                </p>
                <p className="text-ink-subtle mt-1 font-mono text-[11px]">
                  {action.id}
                </p>
              </div>
              {action.enabled && action.domain === 'canvas' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void dispatchAction(action.id)
                  }}
                >
                  Run
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel
        title="Gesture Recognition"
        description="Named gestures with confidence + Action Engine commands."
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,0.7fr)]">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-ink-muted text-xs font-medium tracking-wide uppercase">
                Last match
              </span>
              {recognizedGesture ? (
                <>
                  <Badge variant="accent">
                    {recognizedGesture.definition.name}
                  </Badge>
                  <span className="text-ink-secondary text-sm">
                    {(recognizedGesture.confidence * 100).toFixed(0)}% ·{' '}
                    {recognizedGesture.definition.action}
                  </span>
                </>
              ) : (
                <span className="text-ink-muted text-sm">None yet</span>
              )}
            </div>

            <ul className="space-y-2">
              {gestureDefinitions.map((definition) => (
                <li
                  key={definition.id}
                  className="border-border bg-surface-muted rounded-md border px-3 py-2"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-ink text-sm font-medium">
                      {definition.name}
                    </p>
                    <Badge variant="outline">{definition.action}</Badge>
                    <span className="text-ink-muted text-xs">
                      ≥ {(definition.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-ink-muted mt-1 text-xs">
                    {definition.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-border bg-surface rounded-md border px-3 py-2">
            <p className="text-ink-muted mb-2 text-xs font-medium tracking-wide uppercase">
              Action log
            </p>
            {gestureLog.length === 0 ? (
              <p className="text-ink-subtle text-sm">
                Try open palm, fist, victory, or a quick pinch tap.
              </p>
            ) : (
              <ul className="space-y-1">
                {gestureLog.map((line, index) => (
                  <li
                    key={`${line}-${index}`}
                    className="text-ink-secondary font-mono text-xs"
                  >
                    {line}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Panel>

      <Panel
        title="AirCanvas"
        description="Drawing starts on Gesture state Drawing and stops on Hover. Pinch + move to ink."
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              variant={tool === 'brush' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setTool('brush')}
            >
              Brush
            </Button>
            <Button
              variant={tool === 'eraser' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setTool('eraser')}
            >
              Eraser
            </Button>
            <Button variant="ghost" size="sm" onClick={clearCanvas}>
              Clear
            </Button>
            <Button variant="primary" size="sm" onClick={savePng}>
              Save PNG
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <span className="text-ink-muted text-xs font-medium tracking-wide uppercase">
                Thickness
              </span>
              <input
                type="range"
                min={1}
                max={32}
                value={thickness}
                onChange={(event) => {
                  setThickness(Number(event.target.value))
                }}
                className="accent-accent w-32"
              />
              <span className="text-ink font-mono text-xs">{thickness}px</span>
            </label>

            <div className="flex items-center gap-2">
              <span className="text-ink-muted text-xs font-medium tracking-wide uppercase">
                Color
              </span>
              <div className="flex gap-1.5">
                {AIR_CANVAS_COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    aria-label={`Color ${preset}`}
                    onClick={() => setColor(preset)}
                    className={[
                      'size-7 rounded-md border transition-transform',
                      color === preset
                        ? 'border-ink scale-110'
                        : 'border-border hover:scale-105',
                    ].join(' ')}
                    style={{ backgroundColor: preset }}
                  />
                ))}
              </div>
              <input
                type="color"
                value={color === '#ffffff' ? '#ffffff' : color}
                onChange={(event) => setColor(event.target.value)}
                className="border-border h-7 w-9 cursor-pointer rounded-md border bg-transparent"
                aria-label="Custom color"
              />
            </div>

            <Badge variant={strokeActive ? 'accent' : 'outline'}>
              {strokeActive ? 'inking' : 'idle'}
            </Badge>
          </div>

          <div className="border-border relative aspect-video overflow-hidden rounded-md border bg-white">
            <AirCanvasSurface engine={airCanvas} />
            {cursorPosition && isOpen ? (
              <div
                className="border-accent-foreground bg-accent pointer-events-none absolute z-10 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 shadow-md"
                style={{
                  left: `${cursorPosition.x * 100}%`,
                  top: `${cursorPosition.y * 100}%`,
                }}
                aria-hidden
              />
            ) : null}
          </div>
        </div>
      </Panel>

      <Panel
        title="Hand Landmarker"
        description="MediaPipe Tasks Vision — up to 2 hands, 21 landmarks, handedness, confidence."
      >
        {hands.length === 0 ? (
          <p className="text-ink-muted text-sm">
            {isOpen
              ? 'No hands detected yet. Show one or two hands to the camera.'
              : 'Open the camera to start vision.'}
          </p>
        ) : (
          <ul className="space-y-3">
            {hands.map((hand, index) => (
              <li
                key={`${hand.handedness}-${index}`}
                className="border-border bg-surface-muted rounded-md border px-4 py-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="accent">{hand.handedness}</Badge>
                  <span className="text-ink-secondary text-sm">
                    confidence {(hand.confidence * 100).toFixed(1)}%
                  </span>
                  <span className="text-ink-muted text-sm">
                    {hand.landmarks.length}/{HAND_LANDMARK_COUNT} landmarks
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}

        {visionError ? (
          <p className="bg-danger-muted text-danger mt-3 rounded-md px-3 py-2 text-sm">
            {visionError}
          </p>
        ) : null}
      </Panel>

      <Panel
        title="Camera reference"
        description="Skeleton overlay on the live camera feed."
        tone="muted"
      >
        <p className="text-ink-muted text-sm">
          Use the camera preview above for tracking feedback. Ink is painted on
          the AirCanvas surface — pinch and move to enter Drawing.
        </p>
      </Panel>

      <Modal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        title="Studio help"
        description="Camera → Vision → Gesture → Cursor → AirCanvas."
        footer={
          <Button variant="primary" onClick={() => setHelpOpen(false)}>
            Got it
          </Button>
        }
      >
        <p>
          Pinch and drag to reach the Drawing state. AirCanvas starts inking at
          the cursor and stops when you return to Hover. Use eraser, thickness,
          color, clear, and Save PNG from the toolbar.
        </p>
      </Modal>
    </section>
  )
}
