'use client';
import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function StartDM(){
  const params = useSearchParams();
  const router = useRouter();

  useEffect(()=>{ (async ()=>{
    const toUserId = params.get('to');
    if (!toUserId) { router.replace('/explore'); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace('/login'); return; }

    // crea room dm
    const { data: room } = await supabase.from('rooms')
      .insert({ type:'dm', creator_id: user.id })
      .select().single();

    // agrega miembros
    await supabase.from('room_members').insert([
      { room_id: room!.id, user_id: user.id },
      { room_id: room!.id, user_id: toUserId }
    ]);

    router.replace(`/chat/${room!.id}`);
  })(); },[params, router]);

  return <div className="p-6 text-white bg-neutral-950 min-h-screen">Creando chat…</div>;
}
