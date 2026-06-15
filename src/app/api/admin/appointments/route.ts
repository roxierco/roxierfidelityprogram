import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { AppointmentStatus } from '@/types';

const VALID_STATUSES: AppointmentStatus[] = ['pending', 'confirmed', 'cancelled', 'completed'];

function authenticate(req: NextRequest): boolean {
  const auth = req.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  return token === process.env.ADMIN_PASSWORD;
}

// ──────────────────────────────────────────────────────────
//  GET /api/admin/appointments?date=YYYY-MM-DD&status=pending
// ──────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  if (!authenticate(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const date = searchParams.get('date');
  const status = searchParams.get('status');

  let query = supabaseAdmin
    .from('appointments')
    .select('*, services(name)')
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true });

  if (date) query = query.eq('appointment_date', date);
  if (status) query = query.eq('status', status);

  const { data, error } = await query;

  if (error) {
    console.error('[admin GET]', error);
    return NextResponse.json({ error: 'Error al obtener citas' }, { status: 500 });
  }

  const appointments = (data ?? []).map((row) => ({
    ...row,
    service_name: (row.services as { name: string } | null)?.name ?? '',
  }));

  return NextResponse.json({ appointments });
}

// ──────────────────────────────────────────────────────────
//  PATCH /api/admin/appointments — actualizar status
//  Body: { id: string, status: AppointmentStatus }
// ──────────────────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  if (!authenticate(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  let body: { id?: string; status?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { id, status } = body;

  if (!id || !status) {
    return NextResponse.json({ error: 'Campos requeridos: id, status' }, { status: 400 });
  }

  if (!VALID_STATUSES.includes(status as AppointmentStatus)) {
    return NextResponse.json(
      { error: `Status inválido. Valores permitidos: ${VALID_STATUSES.join(', ')}` },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from('appointments')
    .update({ status })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) {
    console.error('[admin PATCH]', error);
    return NextResponse.json({ error: 'Error al actualizar la cita' }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 });
  }

  return NextResponse.json({ appointment: data });
}
