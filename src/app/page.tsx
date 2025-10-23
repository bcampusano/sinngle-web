import { redirect } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabase-server'

export default async function Home() {
  const supabase = createSupabaseServer()
  const { data: { session } } = await supabase.auth.getSession()
    console.log('SSR getSession =>', session)

  if (session) redirect('/explore')
  redirect('/login')
}
