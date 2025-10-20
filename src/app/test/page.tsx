'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from('profiles').select('*').limit(1);
      if (error) setError(error.message);
      else setData(data);
    };
    load();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Conexión con Supabase</h1>
      {error ? (
        <p style={{ color: 'red' }}>❌ Error: {error}</p>
      ) : (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  );
}
