'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

/**
 * /chat/start?to=<user_id_destino>
 * - Verifica login
 * - (Opcional) aquí puedes crear/recuperar el chat 1:1 y redirigir al room
 * - Por ahora, si falta ?to, te devuelve a /explore
 */
export default function StartChatPage() {
  const router = useRouter();
  const sp = useSearchParams();

  useEffect(() => {
    (async () => {
      const to = sp.get('to');
      if (!to) { router.replace('/explore'); return; }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login'); return; }

      // TODO: aquí podrías crear/buscar el room DM y redirigir:
      // const roomId = await ensureDmRoom(user.id, to)
      // router.replace(`/chat/${roomId}`);

      // Por ahora, vuelve a explorar si aún no implementamos el DM:
      router.replace('/explore');
    })();
  }, [router, sp]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      Preparando chat…
    </div>
  );
}
