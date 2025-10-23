'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';

function StartChatInner() {
  const router = useRouter();
  const sp = useSearchParams();

  useEffect(() => {
    (async () => {
      const to = sp.get('to');
      if (!to) { router.replace('/explore'); return; }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login'); return; }

      // ⚙️ Aquí luego implementaremos la lógica del chat 1:1 real:
      // const roomId = await ensureDmRoom(user.id, to);
      // router.replace(`/chat/${roomId}`);

      router.replace('/explore');
    })();
  }, [router, sp]);

  return <div className="p-6 text-white">Preparando chat…</div>;
}

export default function StartChatPage() {
  return (
    <Suspense fallback={<div className="p-6 text-white">Cargando chat…</div>}>
      <StartChatInner />
    </Suspense>
  );
}
