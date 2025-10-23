'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase-browser'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const run = async () => {
      // 👇 pasar la URL completa con el code/state del callback
      const { data, error } = await supabaseBrowser.auth.exchangeCodeForSession(
        window.location.href
      )

      if (error) {
        console.error('exchangeCodeForSession error:', error)
        router.replace('/login')
        return
      }

      router.replace('/explore')
    }
    run()
  }, [router])

  return <p style={{ padding: 24 }}>Procesando acceso…</p>
}
