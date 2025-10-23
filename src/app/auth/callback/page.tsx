'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase-browser'

export default function AuthCallback() {
  const router = useRouter()
  const search = useSearchParams()

  useEffect(() => {
    const run = async () => {
      const code = search.get('code')
      console.log('OAuth callback code:', code)

      const { data, error } = await supabaseBrowser.auth.exchangeCodeForSession()

      console.log('exchangeCodeForSession error:', error)
      console.log('exchangeCodeForSession session:', data?.session)

      if (error) {
        // Si hay error, vuelve a /login (pero deja el log para verlo en la consola del navegador)
        router.replace('/login')
        return
      }

      // Éxito: ve a la página autenticada
      router.replace('/explore')
    }
    run()
  }, [router, search])

  return <p style={{ padding: 24 }}>Procesando acceso…</p>
}

