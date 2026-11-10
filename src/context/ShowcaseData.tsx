import { createContext, useContext, type ReactNode } from 'react'
import { SYNTHETIC_SHOWCASE } from '../data/synthetic'

const Context = createContext(SYNTHETIC_SHOWCASE)

export function ShowcaseData({ children }: { children: ReactNode }) {
  return <Context.Provider value={SYNTHETIC_SHOWCASE}>{children}</Context.Provider>
}

export const useShowcaseData = () => useContext(Context)
