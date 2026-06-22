import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { fullSeed } from './seed'

const KEY = 'entrevelas:db:v1'

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) { /* ignore */ }
  const seed = fullSeed()
  localStorage.setItem(KEY, JSON.stringify(seed))
  return seed
}

function save(db) {
  localStorage.setItem(KEY, JSON.stringify(db))
}

const uid = (p) => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`

const StoreCtx = createContext(null)

export function StoreProvider({ children }) {
  const [db, setDb] = useState(load)

  useEffect(() => { save(db) }, [db])

  const update = useCallback((fn) => {
    setDb((prev) => {
      const next = fn(structuredClone(prev))
      return next
    })
  }, [])

  // ---- Generic collection helpers ----
  const addTo = useCallback((coll, item, prefix) => {
    const withId = { id: item.id || uid(prefix || coll.slice(0, 3)), ...item }
    update((d) => { d[coll] = [...(d[coll] || []), withId]; return d })
    return withId.id
  }, [update])

  const updateIn = useCallback((coll, id, patch) => {
    update((d) => {
      d[coll] = (d[coll] || []).map((x) => (x.id === id ? { ...x, ...patch } : x))
      return d
    })
  }, [update])

  const removeFrom = useCallback((coll, id) => {
    update((d) => { d[coll] = (d[coll] || []).filter((x) => x.id !== id); return d })
  }, [update])

  // ---- Domain helpers ----
  const insumosById = useMemo(() => {
    const m = {}
    for (const i of db.insumos || []) m[i.id] = i
    return m
  }, [db.insumos])

  const modelosById = useMemo(() => {
    const m = {}
    for (const x of db.modelos || []) m[x.id] = x
    return m
  }, [db.modelos])

  // Ajusta stock y registra movimiento de inventario (trazabilidad)
  const consumirInsumo = useCallback((insumoId, cantidad, ordenId, notas) => {
    update((d) => {
      d.insumos = (d.insumos || []).map((i) =>
        i.id === insumoId ? { ...i, stock_actual: Math.max(0, (i.stock_actual || 0) - cantidad) } : i
      )
      const ins = (d.insumos || []).find((i) => i.id === insumoId)
      d.movimientos = [
        ...(d.movimientos || []),
        {
          id: uid('mov'), insumo_id: insumoId, orden_id: ordenId || null,
          tipo: 'salida', cantidad, unidad: ins?.unidad_minima || 'gr',
          fecha: new Date().toISOString(), notas: notas || '',
        },
      ]
      return d
    })
  }, [update])

  const setConfig = useCallback((patch) => {
    update((d) => { d.config = { ...d.config, ...patch }; return d })
  }, [update])

  const nextOrderNumber = useCallback(() => {
    const nums = (db.ordenes || [])
      .map((o) => parseInt((o.numero_orden || '').replace(/\D/g, ''), 10))
      .filter((n) => !Number.isNaN(n))
    const max = nums.length ? Math.max(...nums) : 0
    return `OP-${String(max + 1).padStart(3, '0')}`
  }, [db.ordenes])

  const resetDb = useCallback(() => {
    const seed = fullSeed()
    setDb(seed)
  }, [])

  const value = {
    db, update, uid,
    addTo, updateIn, removeFrom,
    insumosById, modelosById,
    consumirInsumo, setConfig, nextOrderNumber, resetDb,
  }

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export function useStore() {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
