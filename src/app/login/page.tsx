'use client';

import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';

export default function LoginPage() {
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/explore'
      }
    });
    if (error) console.error('Error al iniciar sesión:', error.message);
  };

  useEffect(() => {
    // Si ya está logueado, lo redirigimos automáticamente
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.href = '/explore';
    });
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-neutral-950 text-white">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Bienvenido a Sinngle 💘</h1>
        <p className="text-gray-400">Conecta con personas reales cerca de ti</p>
        <button
          onClick={handleLogin}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl transition-all font-semibold"
        >
          Iniciar sesión con Google
        </button>
      </div>
    </div>
  );
}
