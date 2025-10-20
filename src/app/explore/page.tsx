'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Nav from '@/components/Nav';

type Profile = {
  id: string;
  user_id: string;
  handle: string | null;
  name: string | null;
  city: string | null;
  avatar_url: string | null;
  last_active_at: string | null;
};

export default function ExplorePage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [me, setMe] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');

  // Crea el perfil si no existe y carga datos
  const ensureProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = '/login'; return; }

    const fullName =
      (user.user_metadata?.full_name as string) ||
      (user.user_metadata?.name as string) ||
      user.email?.split('@')[0] ||
      'Usuario';

    const avatar =
      (user.user_metadata?.avatar_url as string) ||
      (user.user_metadata?.picture as string) ||
      null;

    const { data: existing } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!existing) {
      const { data: created } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          name: fullName,
          handle: user.email?.split('@')[0] ?? null,
          avatar_url: avatar,
          city: null,
        })
        .select()
        .single();
      setMe(created ?? null);
      setName(created?.name ?? '');
      setCity(created?.city ?? '');
    } else {
      setMe(existing);
      setName(existing.name ?? '');
      setCity(existing.city ?? '');
      // refrescar si faltan datos
      if (!existing.avatar_url && avatar) {
        await supabase.from('profiles').update({ avatar_url: avatar }).eq('id', existing.id);
      }
    }
  };

  const loadProfiles = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id,user_id,handle,name,city,avatar_url,last_active_at')
      .order('last_active_at', { ascending: false })
      .limit(100);
    setProfiles(data ?? []);
  };

  useEffect(() => {
    (async () => {
      await ensureProfile();
      await loadProfiles();
      setLoading(false);
    })();
  }, []);

  const saveProfile = async () => {
    if (!me) return;
    setSaving(true);
    await supabase.from('profiles').update({ name: name || null, city: city || null }).eq('id', me.id);
    await loadProfiles();
    setSaving(false);
  };

  const uploadAvatar = async (file: File) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !file) return;

    const ext = file.name.split('.').pop();
    const path = `${user.id}/${Date.now()}.${ext}`;

    // Subir al bucket 'avatars'
    const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });
    if (upErr) { alert('Error subiendo imagen'); return; }

    // Obtener URL pública
    const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);

    // Guardar en el perfil
    await supabase.from('profiles').update({ avatar_url: pub.publicUrl }).eq('id', me!.id);
    // refrescar
    const meNew = { ...me!, avatar_url: pub.publicUrl };
    setMe(meNew);
    await loadProfiles();
  };

  if (loading) return <div className="min-h-screen bg-neutral-950 text-white p-6">Cargando…</div>;

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Nav />

      <main className="p-6 max-w-5xl mx-auto space-y-8">
        {/* Mi perfil (editor) */}
        {me && (
          <section className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
            <h2 className="text-lg font-semibold mb-3">Mi perfil</h2>
            <div className="flex items-center gap-4">
              <div
                className="w-20 h-20 rounded-lg bg-neutral-700 shrink-0"
                style={{
                  backgroundImage: me.avatar_url ? `url(${me.avatar_url})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <label className="text-sm">
                <span className="px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700 cursor-pointer inline-block">
                  Cambiar foto
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); }}
                />
              </label>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                value={name}
                onChange={(e)=>setName(e.target.value)}
                placeholder="Tu nombre"
                className="px-3 py-2 rounded bg-neutral-900 border border-neutral-800 outline-none"
              />
              <input
                value={city || ''}
                onChange={(e)=>setCity(e.target.value)}
                placeholder="Tu ciudad"
                className="px-3 py-2 rounded bg-neutral-900 border border-neutral-800 outline-none"
              />
            </div>

            <div className="mt-3">
              <button
                onClick={saveProfile}
                disabled={saving}
                className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 disabled:opacity-60"
              >
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </section>
        )}

        {/* Grid de perfiles */}
        <section>
          <h3 className="text-sm text-gray-400 mb-3">Explorar personas</h3>
          {profiles.length === 0 ? (
            <p className="text-center text-gray-500">Aún no hay perfiles registrados.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {profiles.map((p) => (
                <a
                  key={p.id}
                  href={`/chat/start?to=${p.user_id}`} // DM al tocar
                  className="bg-neutral-900 p-4 rounded-xl hover:bg-neutral-800 transition block"
                >
                  <div
                    className="aspect-square rounded-lg mb-3 bg-neutral-700"
                    style={{
                      backgroundImage: p.avatar_url ? `url(${p.avatar_url})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  <h2 className="font-semibold">{p.name || p.handle || 'Usuario'}</h2>
                  <p className="text-sm text-gray-400">{p.city || '—'}</p>
                </a>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
