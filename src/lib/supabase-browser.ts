import { createBrowserClient } from '@supabase/ssr'

export const supabaseBrowser = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      // 🔑 asegura que el code_verifier se guarde y se pueda leer en /auth/callback
      flowType: 'pkce',
      persistSession: true,
      detectSessionInUrl: true,
      autoRefreshToken: true,
    },
  }
)

// alias para que puedas seguir importando { supabase } en otras partes
export const supabase = supabaseBrowser

