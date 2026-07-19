import type {
  EditorActionPort,
  MediaActionPort,
  OsActionPort,
  PresentationActionPort,
} from '@/application/ports'

/**
 * No-op adapters — keep Action Engine registerable before native integrations exist.
 */
export function createNoopMediaActionPort(): MediaActionPort {
  const unsupported = async () => {
    throw new Error(
      'MediaActionPort is not configured yet (Spotify coming later).',
    )
  }
  return {
    play: unsupported,
    pause: unsupported,
    playPause: unsupported,
    next: unsupported,
    previous: unsupported,
    setVolume: unsupported,
  }
}

export function createNoopPresentationActionPort(): PresentationActionPort {
  const unsupported = async () => {
    throw new Error(
      'PresentationActionPort is not configured yet (PowerPoint coming later).',
    )
  }
  return {
    nextSlide: unsupported,
    previousSlide: unsupported,
    startSlideshow: unsupported,
    exitSlideshow: unsupported,
  }
}

export function createNoopEditorActionPort(): EditorActionPort {
  const unsupported = async () => {
    throw new Error(
      'EditorActionPort is not configured yet (VS Code coming later).',
    )
  }
  return {
    toggleTerminal: unsupported,
    toggleSidebar: unsupported,
    saveFile: unsupported,
    commandPalette: unsupported,
  }
}

export function createNoopOsActionPort(): OsActionPort {
  const unsupported = async () => {
    throw new Error(
      'OsActionPort is not configured yet (Tauri/OS coming later).',
    )
  }
  return {
    setVolume: unsupported,
    mute: unsupported,
    openApp: unsupported,
    showDesktop: unsupported,
  }
}
