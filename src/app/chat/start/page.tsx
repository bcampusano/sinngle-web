'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Nav from '@/components/Nav';

type Msg = { id:number; user_id:string; body:string|null; created_at:string };

export default function ChatRoom({ params }:{ params:{ roomId:string } }){
  const roomId = params.roomId;
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);

  const scrollBottom = ()=> { listRef.current?.scrollTo({ top: listRef.current.scrollHeight }); };

  useEffect(()=>{ (async ()=>{
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { location.href='/login'; return; }

    // Cargar historial
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(500);
    setMsgs(data||[]);
    setLoading(false);
    setTimeout(scrollBottom, 50);

    // Suscripción realtime
    const ch = supabase
      .channel(`room:${roomId}`)
      .on('postgres_changes',
        { event:'INSERT', schema:'public', table:'messages', filter:`room_id=eq.${roomId}` },
        payload => {
          setMsgs(prev => [...prev, payload.new as Msg]);
          setTimeout(scrollBottom, 10);
        }
      ).subscribe();

    return ()=> { supabase.removeChannel(ch); };
  })(); },[roomId]);

  const send = async ()=>{
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !text.trim()) return;
    await supabase.from('messages').insert({ room_id: roomId, user_id: user.id, body: text.trim() });
    setText('');
  };

  if (loading) return <div className="min-h-screen bg-neutral-950 text-white p-6">Cargando…</div>;

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <Nav />
      <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-2">
        {msgs.map(m=>(
          <div key={m.id} className="max-w-[75%]">
            <div className="text-xs text-gray-500 mb-0.5">{new Date(m.created_at).toLocaleTimeString()}</div>
            <div className="bg-neutral-800 rounded-xl px-3 py-2">{m.body}</div>
          </div>
        ))}
        {msgs.length===0 && <p className="text-gray-500">Sin mensajes… ¡escribe el primero!</p>}
      </div>
      <div className="p-3 border-t border-neutral-800 flex gap-2">
        <input
          value={text}
          onChange={e=>setText(e.target.value)}
          placeholder="Escribe un mensaje…"
          className="flex-1 px-3 py-2 rounded bg-neutral-900 border border-neutral-800 outline-none"
          onKeyDown={e=>{ if(e.key==='Enter') send(); }}
        />
        <button onClick={send} className="px-4 py-2 rounded bg-red-500 hover:bg-red-600">Enviar</button>
      </div>
    </div>
  );
}
