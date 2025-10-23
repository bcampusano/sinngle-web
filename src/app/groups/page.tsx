'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-browser';
import Nav from '@/components/Nav';

type Group = { id: string; title: string | null; created_at: string };

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { location.href = '/login'; return; }
      await load();
      setLoading(false);
    })();
  }, []);

  const load = async () => {
    const { data, error } = await supabase
      .from('rooms')
      .select('id,title,created_at')
      .eq('type', 'group')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) {
      console.error('Error cargando grupos:', error.message);
      return;
    }
    setGroups(data || []);
  };

  const createGroup = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !title.trim()) return;

    const { data: room, error } = await supabase
      .from('rooms')
      .insert({ type: 'group', title, creator_id: user.id })
      .select()
      .single();

    if (error) {
      alert('No se pudo crear el grupo: ' + error.message);
      return;
    }

    // creador entra automáticamente
    await supabase.from('room_members').upsert(
      { room_id: room!.id, user_id: user.id },
      { onConflict: 'room_id,user_id' }
    );

    location.href = `/chat/${room!.id}`;
  };

  const join = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { location.href = '/login'; return; }

    // ¿ya es miembro? (room_members no tiene 'id', usamos room_id)
    const { data: existing, error: existErr } = await supabase
      .from('room_members')
      .select('room_id')
      .eq('room_id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existErr) {
      console.error('Error comprobando membresía:', existErr.message);
      alert('Error comprobando membresía: ' + existErr.message);
      return;
    }

    if (!existing) {
      const { error } = await supabase
        .from('room_members')
        .upsert(
          { room_id: id, user_id: user.id },     // evita duplicados
          { onConflict: 'room_id,user_id' }
        );

      if (error) {
        console.error('No se pudo unir:', error.message);
        alert('No se pudo unir: ' + error.message);
        return;
      }
    }

    location.href = `/chat/${id}`;
  };

  if (loading) return <div className="min-h-screen bg-neutral-950 text-white p-6">Cargando…</div>;

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Nav />
      <main className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Hoy salida a X discoteca"
            className="flex-1 px-3 py-2 rounded bg-neutral-900 border border-neutral-800 outline-none"
          />
          <button onClick={createGroup} className="px-4 py-2 rounded bg-red-500 hover:bg-red-600">
            Crear
          </button>
        </div>

        <div className="space-y-2">
          {groups.map((g) => (
            <div key={g.id} className="flex items-center justify-between p-4 rounded-xl bg-neutral-900 border border-neutral-800">
              <div>
                <div className="font-semibold">{g.title || 'Grupo'}</div>
                <div className="text-xs text-gray-400">{new Date(g.created_at).toLocaleString()}</div>
              </div>
              <button onClick={() => join(g.id)} className="px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700">
                Unirme
              </button>
            </div>
          ))}
          {groups.length === 0 && <p className="text-center text-gray-500">Aún no hay grupos, ¡crea el primero!</p>}
        </div>
      </main>
    </div>
  );
}
