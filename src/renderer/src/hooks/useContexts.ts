import { useState, useEffect } from 'react'
import type { Context } from '../../../shared/types'

export function useContexts() {
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

  return { contexts, addContext, deleteContext }
}
