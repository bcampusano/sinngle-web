import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

type CookieOptions = {
  path?: string
  domain?: string
  maxAge?: number
  expires?: Date
  httpOnly?: boolean
  secure?: boolean
  sameSite?: 'lax' | 'strict' | 'none'
}

export function createSupabaseServer() {
  const cookieStore = cookies() // Next 15: devuelve una Promise-like; usamos await dentro

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string): Promise<string | undefined> {
          const store = await cookieStore
          return store.get(name)?.value
        },
        async set(name: string, value: string, options?: CookieOptions): Promise<void> {
          const store = await cookieStore
          // usamos options para que no marque "unused" y para respetar expiración, etc.
          store.set({ name, value, ...(options ?? {}) })
        },
        async remove(name: string, options?: CookieOptions): Promise<void> {
          const store = await cookieStore
          // remover usando maxAge: 0 (mantiene compatibilidad con la firma y usa options)
          store.set({ name, value: '', ...(options ?? {}), maxAge: 0 })
        },
      },
    }
  )
}

