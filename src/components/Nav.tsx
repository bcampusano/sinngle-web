'use client';
import Link from 'next/link';
import { supabase } from '@/lib/supabase-browser';

export default function Nav(){
  const logout = async ()=>{
    await supabase.auth.signOut();
    location.href = '/login';
  };
  return (
    <header className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-950 text-white">
      <Link href="/explore" className="text-xl font-bold">Sinngle 💘</Link>
      <nav className="flex gap-3 text-sm">
        <Link href="/explore" className="px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700">Explorar</Link>
        <Link href="/groups" className="px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700">Grupos</Link>
        <button onClick={logout} className="px-3 py-2 rounded bg-red-500 hover:bg-red-600">Cerrar sesión</button>
      </nav>
    </header>
  );
}
