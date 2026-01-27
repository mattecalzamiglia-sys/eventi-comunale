import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Client admin con service role key per operazioni privilegiate
// ATTENZIONE: usare solo lato server, mai esporre al client
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase admin credentials')
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
