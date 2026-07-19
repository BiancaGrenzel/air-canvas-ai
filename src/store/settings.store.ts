import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { colors } from '@/shared/config'

export type ThemePreference = 'light' | 'dark' | 'system'

export type AppSettings = {
  /** Cursor displacement multiplier (1 = 1:1 landmark mapping). */
  sensitivity: number
  /** Preferred camera capture FPS. */
  targetFps: number
  /** Brush thickness in CSS pixels. */
  thickness: number
  /** Brush color (CSS color string). */
  color: string
  theme: ThemePreference
  /** Mirror camera / landmarks / cursor on X. */
  mirrored: boolean
  showLandmarks: boolean
  showFps: boolean
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  sensitivity: 1.25,
  targetFps: 30,
  thickness: 4,
  color: colors.ink,
  theme: 'system',
  mirrored: true,
  showLandmarks: true,
  showFps: true,
}

export const SETTINGS_LIMITS = {
  sensitivity: { min: 0.5, max: 3, step: 0.05 },
  targetFps: { min: 15, max: 60, step: 1 },
  thickness: { min: 1, max: 32, step: 1 },
} as const

export const TARGET_FPS_PRESETS = [15, 24, 30, 60] as const

type SettingsState = AppSettings & {
  setSensitivity: (sensitivity: number) => void
  setTargetFps: (targetFps: number) => void
  setThickness: (thickness: number) => void
  setColor: (color: string) => void
  setTheme: (theme: ThemePreference) => void
  setMirrored: (mirrored: boolean) => void
  setShowLandmarks: (showLandmarks: boolean) => void
  setShowFps: (showFps: boolean) => void
  resetSettings: () => void
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_APP_SETTINGS,

      setSensitivity: (sensitivity) =>
        set({
          sensitivity: clamp(
            sensitivity,
            SETTINGS_LIMITS.sensitivity.min,
            SETTINGS_LIMITS.sensitivity.max,
          ),
        }),

      setTargetFps: (targetFps) =>
        set({
          targetFps: Math.round(
            clamp(
              targetFps,
              SETTINGS_LIMITS.targetFps.min,
              SETTINGS_LIMITS.targetFps.max,
            ),
          ),
        }),

      setThickness: (thickness) =>
        set({
          thickness: Math.round(
            clamp(
              thickness,
              SETTINGS_LIMITS.thickness.min,
              SETTINGS_LIMITS.thickness.max,
            ),
          ),
        }),

      setColor: (color) => set({ color }),

      setTheme: (theme) => set({ theme }),

      setMirrored: (mirrored) => set({ mirrored }),

      setShowLandmarks: (showLandmarks) => set({ showLandmarks }),

      setShowFps: (showFps) => set({ showFps }),

      resetSettings: () => set({ ...DEFAULT_APP_SETTINGS }),
    }),
    {
      name: 'air-canvas-settings',
      partialize: (state) => ({
        sensitivity: state.sensitivity,
        targetFps: state.targetFps,
        thickness: state.thickness,
        color: state.color,
        theme: state.theme,
        mirrored: state.mirrored,
        showLandmarks: state.showLandmarks,
        showFps: state.showFps,
      }),
    },
  ),
)
