import React, { createContext, useContext, useState, useEffect } from 'react'
import type { Context } from '../../../shared/types'

interface ContextsContextValue {
  contexts: Context[]
  addContext: (name: string) => Promise<Context>
  deleteContext: (id: string) => Promise<void>
}

const ContextsContext = createContext<ContextsContextValue | null>(null)

export function ContextsProvider({ children }: { children: React.ReactNode }) {
  const [contexts, setContexts] = useState<Context[]>([])

  useEffect(() => {
    window.api.getContexts().then(setContexts)
  }, [])

  async function addContext(name: string): Promise<Context> {
    const newCtx = await window.api.addContext(name)
    setContexts((prev) => [...prev, newCtx])
    return newCtx
  }

  async function deleteContext(id: string): Promise<void> {
    await window.api.deleteContext(id)
    setContexts((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <ContextsContext.Provider value={{ contexts, addContext, deleteContext }}>
      {children}
    </ContextsContext.Provider>
  )
}

export function useContexts(): ContextsContextValue {
  const ctx = useContext(ContextsContext)
  if (!ctx) throw new Error('useContexts must be used within ContextsProvider')
  return ctx
}
