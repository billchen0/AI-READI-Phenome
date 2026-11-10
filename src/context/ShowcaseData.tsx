import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { PreviewPayload } from '../types'

type DataState = {
  mode: 'documentation' | 'local'
  status: 'loading' | 'ready' | 'unavailable'
  data?: PreviewPayload
}

const Context = createContext<DataState>({ mode: 'documentation', status: 'ready' })

export function ShowcaseData({ children }: { children: ReactNode }) {
  const localEnabled = import.meta.env.DEV && import.meta.env.VITE_AI_READI_LOCAL === '1'
  const [state, setState] = useState<DataState>({
    mode: localEnabled ? 'local' : 'documentation',
    status: localEnabled ? 'loading' : 'ready',
  })

  useEffect(() => {
    if (!localEnabled) return
    const controller = new AbortController()

    async function loadRecording() {
      try {
        const response = await fetch('/__local_preview', {
          signal: controller.signal,
          cache: 'no-store',
        })
        if (!response.ok) throw new Error('Local recording unavailable')
        const data: PreviewPayload = await response.json()
        if (
          !data.modalities ||
          typeof data.modalities !== 'object' ||
          Array.isArray(data.modalities)
        ) {
          throw new Error('Invalid recording payload')
        }
        if (!controller.signal.aborted) setState({ mode: 'local', status: 'ready', data })
      } catch {
        if (!controller.signal.aborted) setState({ mode: 'local', status: 'unavailable' })
      }
    }

    void loadRecording()
    return () => controller.abort()
  }, [localEnabled])

  return <Context.Provider value={state}>{children}</Context.Provider>
}

export const useShowcaseData = () => useContext(Context)
