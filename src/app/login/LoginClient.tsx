'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { supabaseBrowser } from '@/lib/supabase-browser'

// Fondo: gente conociéndose
const bgImages = [
  'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=1600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1600&auto=format&fit=crop',
]

export default function LoginClient() {
  const [index, setIndex] = useState(0)

  // Autoplay carrusel cada 5s
  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % bgImages.length)
    }, 5000)
    return () => window.clearInterval(id)
  }, [])

  const loginWith = async (provider: 'google' | 'facebook' | 'apple') => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const { error } = await supabaseBrowser.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${origin}/auth/callback` },
    })
    if (error) console.error('OAuth error:', error.message)
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-black text-white">
      {/* Visual side */}
      <div className="relative hidden lg:block overflow-hidden">
        {bgImages.map((src, i) => (
          <motion.img
            key={src}
            src={src}
            alt="Personas conociéndose"
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: i === index ? 1 : 0, scale: i === index ? 1 : 1.04 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
          />
        ))}

        {/* gradiente */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/30" />

        {/* ⬆️ Texto del banner ARRIBA */}
        <div className="absolute top-0 left-0 right-0 p-10">
          <motion.div
            key={`banner-${index}`}
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="backdrop-blur-sm bg-white/10 p-6 rounded-2xl border border-white/15 shadow-2xl"
          >
            <h2 className="text-3xl font-semibold">Conoce gente real en tu ciudad, Gratis</h2>
            <p className="text-white/85 mt-2">Únete en segundos.</p>
          </motion.div>
        </div>

        {/* Paginador */}
        <div className="absolute bottom-6 left-10 flex items-center gap-2">
          {bgImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 w-10 rounded-full transition-all ${i === index ? 'bg-white' : 'bg-white/40'}`}
              aria-label={`Ir a imagen ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Auth side */}
      <div className="relative flex items-center justify-center p-6 sm:p-10">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl opacity-40 bg-fuchsia-600" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full blur-3xl opacity-40 bg-cyan-500" />
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor">
                <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zm0 2.2L6 8v8l6 3.3 6-3.3V8l-6-2.8z" />
              </svg>
              <span className="text-2xl font-bold tracking-tight">SINNGLE</span>
            </Link>
            <p className="mt-2 text-white/70">Inicia sesión con un clic</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 sm:p-8 shadow-2xl space-y-4">
            <button
              type="button"
              onClick={() => loginWith('google')}
              className="w-full rounded-xl py-3 font-medium bg-white text-black hover:bg-white/90 transition"
            >
              Continuar con Google
            </button>

            <button
              type="button"
              onClick={() => loginWith('facebook')}
              className="w-full rounded-xl py-3 font-medium border border-white/15 bg-black/30 hover:border-white/30 transition"
            >
              Continuar con Facebook
            </button>

            <p className="text-xs text-white/60 text-center pt-2">
              Al continuar aceptas nuestros{' '}
              <Link href="#" className="underline underline-offset-2">Términos</Link> y{' '}
              <Link href="#" className="underline underline-offset-2">Política de Privacidad</Link>.
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-white/60">
            Protegido por reCAPTCHA · <Link href="#" className="underline underline-offset-2">Privacidad</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
