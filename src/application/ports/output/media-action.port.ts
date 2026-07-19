/**
 * Media control port (Spotify and other players — future).
 */
export interface MediaActionPort {
  play: () => Promise<void>
  pause: () => Promise<void>
  playPause: () => Promise<void>
  next: () => Promise<void>
  previous: () => Promise<void>
  setVolume: (level: number) => Promise<void>
}
