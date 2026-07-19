export type Handedness = 'Left' | 'Right' | 'Unknown'

export function parseHandedness(value: string | undefined | null): Handedness {
  if (!value) return 'Unknown'
  const normalized = value.trim().toLowerCase()
  if (normalized === 'left') return 'Left'
  if (normalized === 'right') return 'Right'
  return 'Unknown'
}
