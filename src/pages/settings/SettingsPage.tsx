import type { ReactNode } from 'react'

import { AIR_CANVAS_COLOR_PRESETS } from '@/air-canvas'
import { Button, Panel } from '@/components'
import { cn } from '@/shared/lib'
import {
  SETTINGS_LIMITS,
  TARGET_FPS_PRESETS,
  useSettingsStore,
  type ThemePreference,
} from '@/store'

const themes: ThemePreference[] = ['light', 'dark', 'system']

function SettingRow({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1">
        <p className="text-ink text-sm font-medium">{label}</p>
        {description ? (
          <p className="text-ink-muted text-xs">{description}</p>
        ) : null}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-7 w-12 rounded-full transition-colors',
        checked ? 'bg-accent' : 'bg-border-strong',
      )}
    >
      <span
        className={cn(
          'bg-surface absolute top-0.5 left-0.5 size-6 rounded-full shadow-sm transition-transform',
          checked && 'translate-x-5',
        )}
      />
    </button>
  )
}

export function SettingsPage() {
  const sensitivity = useSettingsStore((s) => s.sensitivity)
  const targetFps = useSettingsStore((s) => s.targetFps)
  const thickness = useSettingsStore((s) => s.thickness)
  const color = useSettingsStore((s) => s.color)
  const theme = useSettingsStore((s) => s.theme)
  const mirrored = useSettingsStore((s) => s.mirrored)
  const showLandmarks = useSettingsStore((s) => s.showLandmarks)
  const showFps = useSettingsStore((s) => s.showFps)

  const setSensitivity = useSettingsStore((s) => s.setSensitivity)
  const setTargetFps = useSettingsStore((s) => s.setTargetFps)
  const setThickness = useSettingsStore((s) => s.setThickness)
  const setColor = useSettingsStore((s) => s.setColor)
  const setTheme = useSettingsStore((s) => s.setTheme)
  const setMirrored = useSettingsStore((s) => s.setMirrored)
  const setShowLandmarks = useSettingsStore((s) => s.setShowLandmarks)
  const setShowFps = useSettingsStore((s) => s.setShowFps)
  const resetSettings = useSettingsStore((s) => s.resetSettings)

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Settings
          </h2>
          <p className="text-ink-muted max-w-xl text-sm">
            Preferences persist in the browser via Zustand. Changes apply to
            Studio immediately where possible; camera FPS applies on the next
            open.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={resetSettings}>
          Reset defaults
        </Button>
      </div>

      <Panel
        title="Cursor"
        description="How the virtual pointer responds to hand motion."
      >
        <div className="space-y-5">
          <SettingRow
            label="Sensitivity"
            description={`${SETTINGS_LIMITS.sensitivity.min}–${SETTINGS_LIMITS.sensitivity.max}`}
          >
            <label className="flex items-center gap-3">
              <input
                type="range"
                min={SETTINGS_LIMITS.sensitivity.min}
                max={SETTINGS_LIMITS.sensitivity.max}
                step={SETTINGS_LIMITS.sensitivity.step}
                value={sensitivity}
                onChange={(event) => setSensitivity(Number(event.target.value))}
                className="accent-accent w-40"
              />
              <span className="text-ink w-12 font-mono text-xs tabular-nums">
                {sensitivity.toFixed(2)}
              </span>
            </label>
          </SettingRow>

          <SettingRow
            label="Mirroring"
            description="Flip X to match a mirrored webcam preview."
          >
            <Toggle
              label="Mirroring"
              checked={mirrored}
              onChange={setMirrored}
            />
          </SettingRow>
        </div>
      </Panel>

      <Panel
        title="Camera & vision"
        description="Capture rate and on-preview overlays."
      >
        <div className="space-y-5">
          <SettingRow
            label="Target FPS"
            description="Requested camera frame rate (device may clamp)."
          >
            <div className="flex flex-wrap items-center gap-2">
              {TARGET_FPS_PRESETS.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  size="sm"
                  variant={targetFps === preset ? 'secondary' : 'outline'}
                  onClick={() => setTargetFps(preset)}
                >
                  {preset}
                </Button>
              ))}
              <label className="flex items-center gap-2">
                <input
                  type="number"
                  min={SETTINGS_LIMITS.targetFps.min}
                  max={SETTINGS_LIMITS.targetFps.max}
                  value={targetFps}
                  onChange={(event) =>
                    setTargetFps(Number(event.target.value) || targetFps)
                  }
                  className="border-border bg-surface text-ink focus:shadow-focus w-16 rounded-md border px-2 py-1.5 font-mono text-sm outline-none"
                />
              </label>
            </div>
          </SettingRow>

          <SettingRow
            label="Show landmarks"
            description="Skeleton overlay on the camera preview."
          >
            <Toggle
              label="Show landmarks"
              checked={showLandmarks}
              onChange={setShowLandmarks}
            />
          </SettingRow>

          <SettingRow
            label="Show FPS"
            description="Display reported and actual FPS on the preview."
          >
            <Toggle label="Show FPS" checked={showFps} onChange={setShowFps} />
          </SettingRow>
        </div>
      </Panel>

      <Panel
        title="Drawing"
        description="Default brush used by AirCanvas and canvas actions."
      >
        <div className="space-y-5">
          <SettingRow label="Thickness" description="Brush width in pixels.">
            <label className="flex items-center gap-3">
              <input
                type="range"
                min={SETTINGS_LIMITS.thickness.min}
                max={SETTINGS_LIMITS.thickness.max}
                step={SETTINGS_LIMITS.thickness.step}
                value={thickness}
                onChange={(event) => setThickness(Number(event.target.value))}
                className="accent-accent w-40"
              />
              <span className="text-ink w-12 font-mono text-xs tabular-nums">
                {thickness}px
              </span>
            </label>
          </SettingRow>

          <SettingRow label="Color" description="Default brush color.">
            <div className="flex flex-wrap items-center gap-2">
              {AIR_CANVAS_COLOR_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  aria-label={`Color ${preset}`}
                  onClick={() => setColor(preset)}
                  className={cn(
                    'size-7 rounded-md border transition-transform',
                    color === preset
                      ? 'border-ink scale-110'
                      : 'border-border hover:scale-105',
                  )}
                  style={{ backgroundColor: preset }}
                />
              ))}
              <input
                type="color"
                value={/^#[0-9a-fA-F]{6}$/.test(color) ? color : '#09090b'}
                onChange={(event) => setColor(event.target.value)}
                className="border-border h-7 w-9 cursor-pointer rounded-md border bg-transparent"
                aria-label="Custom color"
              />
            </div>
          </SettingRow>
        </div>
      </Panel>

      <Panel title="Appearance" description="UI theme preference.">
        <SettingRow label="Theme" description="Stored locally with the rest.">
          <div className="flex flex-wrap gap-2">
            {themes.map((value) => (
              <Button
                key={value}
                type="button"
                variant={theme === value ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setTheme(value)}
                className="capitalize"
              >
                {value}
              </Button>
            ))}
          </div>
        </SettingRow>
      </Panel>
    </section>
  )
}
