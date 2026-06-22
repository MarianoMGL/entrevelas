// Cliente Supabase — listo para conectar.
// En esta versión la app persiste en localStorage (ver store.jsx).
// Cuando tengan un proyecto Supabase: define las variables de entorno
//   VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY (ver .env.example)
// y migra el store para leer/escribir contra estas tablas (ver schema.sql).
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anon)

export const supabase = isSupabaseConfigured ? createClient(url, anon) : null
