/**
 * Operating system control port (Tauri / native — future).
 */
export interface OsActionPort {
  setVolume: (level: number) => Promise<void>
  mute: () => Promise<void>
  openApp: (appId: string) => Promise<void>
  showDesktop: () => Promise<void>
}
