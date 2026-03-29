import { createClient, SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

let supabase: SupabaseClient

if (url && anonKey) {
  supabase = createClient(url, anonKey)
} else {
  console.error(
    'Supabase credentials missing! Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY as environment variables.'
  )
  // Create a dummy client that won't crash the app
  supabase = createClient('https://placeholder.supabase.co', 'placeholder')
}

export { supabase }
