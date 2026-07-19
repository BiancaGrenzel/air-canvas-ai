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
import { useTranslation } from '@/i18n'
import { useSessionStore, useSettingsStore } from '@/store'

import { useStudioAirCanvas } from './useStudioAirCanvas'
import { useStudioCursorEngine } from './useStudioCursorEngine'
import { useStudioGestureEngine } from './useStudioGestureEngine'
import { useStudioGestureRecognition } from './useStudioGestureRecognition'
import { useStudioHandVision } from './useStudioHandVision'

export function StudioPage() {
  const {
    t,
    actionName,
    actionDescription,
    gestureName,
    gestureDescription,
    gestureEffect,
  } = useTranslation()
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
              {t('studio.title')}
            </h2>
            <Badge variant="neutral">
              {t('studio.session')}: {t(`sessionStatus.${sessionStatus}`)}
            </Badge>
            <Badge variant={isOpen ? 'success' : 'outline'}>
              {t('studio.camera')}: {t(`cameraStatus.${status}`)}
            </Badge>
            <Badge variant={visionRunning ? 'accent' : 'outline'}>
              {t('studio.vision')}:{' '}
              {visionRunning
                ? t('studio.visionRunning')
                : t('studio.visionIdle')}
            </Badge>
            <Badge
              variant={interactionState === 'Lost' ? 'outline' : 'success'}
            >
              {t('studio.state')}: {t(`interactionState.${interactionState}`)}
            </Badge>
          </div>
          <p className="text-ink-muted max-w-xl text-sm">
            {t('studio.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setHelpOpen(true)}>
            {t('studio.help')}
          </Button>
        </div>
      </div>

      <Panel
        title={t('studio.cameraTitle')}
        description={t('studio.cameraDesc')}
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
                {t('studio.openCamera')}
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
                {t('studio.closeCamera')}
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
              {t('studio.refreshDevices')}
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
                  ? t('studio.previewPlaceholder')
                  : t('studio.cameraUnsupported')}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-ink-secondary text-xs font-medium tracking-wide uppercase">
                {t('studio.device')}
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
                  <option value="">{t('studio.noDevices')}</option>
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
                <dt className="text-ink-muted text-xs">
                  {t('studio.permission')}
                </dt>
                <dd className="text-ink mt-1 font-medium">
                  {t(`cameraPermission.${permission}`)}
                </dd>
              </div>
              <div className="border-border bg-surface-muted rounded-md border px-3 py-2">
                <dt className="text-ink-muted text-xs">
                  {t('studio.resolution')}
                </dt>
                <dd className="text-ink mt-1 font-medium">
                  {formatCameraResolution(resolution)}
                </dd>
              </div>
              <div className="border-border bg-surface-muted rounded-md border px-3 py-2">
                <dt className="text-ink-muted text-xs">
                  {t('studio.reportedFps')}
                </dt>
                <dd className="text-ink mt-1 font-medium">
                  {reportedFps ?? '—'}
                </dd>
              </div>
              <div className="border-border bg-surface-muted rounded-md border px-3 py-2">
                <dt className="text-ink-muted text-xs">
                  {t('studio.actualFps')}
                </dt>
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
              <Tooltip content={t('studio.requestPermissionTip')}>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!isSupported || busy}
                  onClick={() => {
                    void request()
                  }}
                >
                  {t('studio.requestPermission')}
                </Button>
              </Tooltip>
            ) : null}
          </div>
        </div>
      </Panel>

      <Panel
        title={t('studio.gestureEngineTitle')}
        description={t('studio.gestureEngineDesc')}
      >
        <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div className="border-border bg-surface-muted rounded-md border px-3 py-2">
            <dt className="text-ink-muted text-xs">{t('studio.labelState')}</dt>
            <dd className="text-ink mt-1 font-medium">
              {t(`interactionState.${interactionState}`)}
            </dd>
          </div>
          <div className="border-border bg-surface-muted rounded-md border px-3 py-2">
            <dt className="text-ink-muted text-xs">{t('studio.labelPinch')}</dt>
            <dd className="text-ink mt-1 font-medium">
              {interactionFeatures?.pinch.active
                ? `${t('studio.yes')} · ${(interactionFeatures.pinch.strength * 100).toFixed(0)}%`
                : t('studio.no')}
            </dd>
          </div>
          <div className="border-border bg-surface-muted rounded-md border px-3 py-2">
            <dt className="text-ink-muted text-xs">
              {t('studio.labelPointer')}
            </dt>
            <dd className="text-ink mt-1 font-mono text-xs font-medium">
              {interactionFeatures?.pointer
                ? `${interactionFeatures.pointer.x.toFixed(2)}, ${interactionFeatures.pointer.y.toFixed(2)}`
                : '—'}
            </dd>
          </div>
          <div className="border-border bg-surface-muted rounded-md border px-3 py-2">
            <dt className="text-ink-muted text-xs">{t('studio.labelTrack')}</dt>
            <dd className="text-ink mt-1 font-medium">
              {primaryHand?.trackId ?? '—'}
            </dd>
          </div>
          <div className="border-border bg-surface-muted rounded-md border px-3 py-2">
            <dt className="text-ink-muted text-xs">
              {t('studio.labelCursor')}
            </dt>
            <dd className="text-ink mt-1 font-mono text-xs font-medium">
              {cursorPosition
                ? `${cursorPosition.x.toFixed(2)}, ${cursorPosition.y.toFixed(2)}`
                : '—'}
            </dd>
          </div>
        </dl>
      </Panel>

      <Panel
        title={t('studio.actionEngineTitle')}
        description={t('studio.actionEngineDesc')}
      >
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {actionCatalog.map((action) => (
            <li
              key={action.id}
              className="border-border bg-surface-muted flex items-start justify-between gap-2 rounded-md border px-3 py-2"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-ink text-sm font-medium">
                    {actionName(action.id)}
                  </p>
                  <Badge variant={action.enabled ? 'accent' : 'outline'}>
                    {t(`domain.${action.domain}`)}
                  </Badge>
                </div>
                <p className="text-ink-muted mt-1 text-xs">
                  {actionDescription(action.id)}
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
                  {t('studio.run')}
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel
        title={t('studio.gestureRecognitionTitle')}
        description={t('studio.gestureRecognitionDesc')}
      >
        <div className="space-y-4">
          <div className="border-accent/30 bg-accent-muted/40 space-y-2 rounded-md border px-4 py-3">
            <p className="text-ink text-sm font-medium">
              {t('studio.controlsGuideTitle')}
            </p>
            <ul className="text-ink-secondary list-disc space-y-1.5 pl-5 text-sm">
              <li>{t('studio.controlsGuideDraw')}</li>
              <li>{t('studio.controlsGuideStop')}</li>
              <li>{t('studio.controlsGuideEraseStroke')}</li>
              <li>{t('studio.controlsGuideClearAll')}</li>
            </ul>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,0.7fr)]">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-ink-muted text-xs font-medium tracking-wide uppercase">
                  {t('studio.lastMatch')}
                </span>
                {recognizedGesture ? (
                  <>
                    <Badge variant="accent">
                      {gestureName(recognizedGesture.definition.id)}
                    </Badge>
                    <span className="text-ink-secondary text-sm">
                      {(recognizedGesture.confidence * 100).toFixed(0)}% ·{' '}
                      {gestureEffect(recognizedGesture.definition.id) ||
                        recognizedGesture.definition.action}
                    </span>
                  </>
                ) : (
                  <span className="text-ink-muted text-sm">
                    {t('studio.noneYet')}
                  </span>
                )}
              </div>

              <p className="text-ink-muted text-xs font-medium tracking-wide uppercase">
                {t('studio.commandsListTitle')}
              </p>

              <ul className="space-y-2">
                {gestureDefinitions.map((definition) => (
                  <li
                    key={definition.id}
                    className="border-border bg-surface-muted rounded-md border px-3 py-2"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-ink text-sm font-medium">
                        {gestureName(definition.id)}
                      </p>
                      <Badge
                        variant={
                          definition.id === 'enter-drawing'
                            ? 'outline'
                            : 'accent'
                        }
                      >
                        {gestureEffect(definition.id)}
                      </Badge>
                      <span className="text-ink-muted text-xs">
                        ≥ {(definition.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-ink-muted mt-1 text-xs">
                      {gestureDescription(definition.id)}
                    </p>
                    <p className="text-ink-subtle mt-1 font-mono text-[11px]">
                      {definition.action}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-border bg-surface rounded-md border px-3 py-2">
              <p className="text-ink-muted mb-2 text-xs font-medium tracking-wide uppercase">
                {t('studio.actionLog')}
              </p>
              {gestureLog.length === 0 ? (
                <p className="text-ink-subtle text-sm">
                  {t('studio.actionLogEmpty')}
                </p>
              ) : (
                <ul className="space-y-1">
                  {gestureLog.map((entry, index) => (
                    <li
                      key={`${entry.kind}-${entry.gestureId}-${index}`}
                      className="text-ink-secondary font-mono text-xs"
                    >
                      {entry.kind === 'recognized'
                        ? t('studio.logRecognized', {
                            gesture: gestureName(entry.gestureId),
                            action:
                              gestureEffect(entry.gestureId) || entry.action,
                          })
                        : t('studio.logConfidence', {
                            gesture: gestureName(entry.gestureId),
                            confidence: (entry.confidence * 100).toFixed(0),
                          })}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </Panel>

      <Panel
        title={t('studio.airCanvasTitle')}
        description={t('studio.airCanvasDesc')}
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              variant={tool === 'brush' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setTool('brush')}
            >
              {t('studio.brush')}
            </Button>
            <Button
              variant={tool === 'eraser' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setTool('eraser')}
            >
              {t('studio.eraser')}
            </Button>
            <Button variant="ghost" size="sm" onClick={clearCanvas}>
              {t('studio.clear')}
            </Button>
            <Button variant="primary" size="sm" onClick={savePng}>
              {t('studio.savePng')}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <span className="text-ink-muted text-xs font-medium tracking-wide uppercase">
                {t('studio.thickness')}
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
                {t('studio.color')}
              </span>
              <div className="flex gap-1.5">
                {AIR_CANVAS_COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    aria-label={t('studio.colorAria', { color: preset })}
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
                aria-label={t('studio.customColorAria')}
              />
            </div>

            <Badge variant={strokeActive ? 'accent' : 'outline'}>
              {strokeActive ? t('studio.inking') : t('studio.idle')}
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
        title={t('studio.handLandmarkerTitle')}
        description={t('studio.handLandmarkerDesc')}
      >
        {hands.length === 0 ? (
          <p className="text-ink-muted text-sm">
            {isOpen ? t('studio.noHands') : t('studio.openCameraForVision')}
          </p>
        ) : (
          <ul className="space-y-3">
            {hands.map((hand, index) => (
              <li
                key={`${hand.handedness}-${index}`}
                className="border-border bg-surface-muted rounded-md border px-4 py-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="accent">
                    {t(`handedness.${hand.handedness}`)}
                  </Badge>
                  <span className="text-ink-secondary text-sm">
                    {t('studio.confidence', {
                      value: (hand.confidence * 100).toFixed(1),
                    })}
                  </span>
                  <span className="text-ink-muted text-sm">
                    {t('studio.landmarksCount', {
                      count: hand.landmarks.length,
                      total: HAND_LANDMARK_COUNT,
                    })}
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
        title={t('studio.cameraRefTitle')}
        description={t('studio.cameraRefDesc')}
        tone="muted"
      >
        <p className="text-ink-muted text-sm">{t('studio.cameraRefBody')}</p>
      </Panel>

      <Modal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        title={t('studio.helpTitle')}
        description={t('studio.helpDesc')}
        footer={
          <Button variant="primary" onClick={() => setHelpOpen(false)}>
            {t('studio.gotIt')}
          </Button>
        }
      >
        <div className="space-y-4 text-sm">
          <div className="space-y-1">
            <p className="text-ink font-medium">{t('studio.helpDrawTitle')}</p>
            <p className="text-ink-secondary">{t('studio.helpDrawBody')}</p>
          </div>
          <div className="space-y-1">
            <p className="text-ink font-medium">{t('studio.helpEraseTitle')}</p>
            <p className="text-ink-secondary">{t('studio.helpEraseBody')}</p>
          </div>
          <div className="space-y-1">
            <p className="text-ink font-medium">
              {t('studio.helpCommandsTitle')}
            </p>
            <p className="text-ink-secondary">{t('studio.helpCommandsBody')}</p>
          </div>
        </div>
      </Modal>
    </section>
  )
}
