import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Usa i cookie invece del localStorage
        getAll() {
          const pairs = document.cookie.split(';')
          const cookies: { name: string; value: string }[] = []
          for (const pair of pairs) {
            const [name, value] = pair.trim().split('=')
            if (name && value) {
              cookies.push({ name, value: decodeURIComponent(value) })
            }
          }
          return cookies
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            let cookie = `${name}=${encodeURIComponent(value)}`
            if (options?.path) cookie += `; path=${options.path}`
            if (options?.maxAge) cookie += `; max-age=${options.maxAge}`
            if (options?.domain) cookie += `; domain=${options.domain}`
            if (options?.secure) cookie += `; secure`
            if (options?.sameSite) cookie += `; samesite=${options.sameSite}`
            document.cookie = cookie
          }
        },
      },
    }
  )
}
