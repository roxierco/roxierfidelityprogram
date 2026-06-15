import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('services')
    .select('id, name, duration_minutes, price, description')
    .eq('is_active', true)
    .order('price', { ascending: true });

  if (error) {
    console.error('[services GET]', error);
    return NextResponse.json({ error: 'Error al obtener servicios' }, { status: 500 });
  }

  return NextResponse.json({ services: data ?? [] });
}
