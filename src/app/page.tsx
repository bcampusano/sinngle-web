// src/app/page.tsx (Server Component)
import { redirect } from 'next/navigation';

export default function Home() {
  // Por ahora, manda todo a /login
  redirect('/login');
}
