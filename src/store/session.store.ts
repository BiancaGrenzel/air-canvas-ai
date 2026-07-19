import { create } from 'zustand'

export type SessionStatus = 'idle' | 'ready' | 'tracking' | 'paused' | 'error'

type SessionState = {
  status: SessionStatus
  setStatus: (status: SessionStatus) => void
  reset: () => void
}

const initialStatus: SessionStatus = 'idle'

export const useSessionStore = create<SessionState>((set) => ({
  status: initialStatus,
  setStatus: (status) => set({ status }),
  reset: () => set({ status: initialStatus }),
}))
