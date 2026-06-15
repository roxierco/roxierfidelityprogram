import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAvailableSlots } from '@/lib/availability';
import {
  sendConfirmationEmail,
  sendWhatsAppConfirmation,
} from '@/lib/notifications';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// ──────────────────────────────────────────────────────────
//  POST /api/appointments — crear cita
// ──────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  let body: Record<string, string>;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { service_id, date, time, patient_name, patient_email, patient_phone, notes } = body;

  if (!service_id || !date || !time || !patient_name || !patient_email || !patient_phone) {
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
  }

  // Verificar que el slot siga disponible
  const slots = await getAvailableSlots(date, service_id);
  const slot = slots.find((s) => s.time === time);

  if (!slot || !slot.available) {
    return NextResponse.json(
      { error: 'El horario seleccionado ya no está disponible. Por favor elige otro.' },
      { status: 409 }
    );
  }

  const confirmation_code = generateCode();

  const { data: appointment, error } = await supabaseAdmin
    .from('appointments')
    .insert({
      service_id,
      patient_name,
      patient_email,
      patient_phone,
      appointment_date: date,
      appointment_time: time,
      notes: notes ?? null,
      status: 'pending',
      confirmation_code,
    })
    .select('*, services(name)')
    .single();

  if (error || !appointment) {
    console.error('[appointments POST]', error);
    return NextResponse.json({ error: 'No se pudo crear la cita' }, { status: 500 });
  }

  const enriched = {
    ...appointment,
    service_name: (appointment.services as { name: string } | null)?.name ?? '',
  };

  // Notificaciones en paralelo — si fallan no bloquean la respuesta
  Promise.allSettled([
    sendConfirmationEmail(enriched),
    sendWhatsAppConfirmation(enriched),
  ]).then((results) => {
    results.forEach((r) => {
      if (r.status === 'rejected') console.error('[notifications]', r.reason);
    });
  });

  return NextResponse.json(
    { confirmation_code, appointment_id: appointment.id },
    { status: 201 }
  );
}

// ──────────────────────────────────────────────────────────
//  GET /api/appointments?code=XXXXXXXX — buscar por código
// ──────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Parámetro requerido: code' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('appointments')
    .select('*, services(name)')
    .eq('confirmation_code', code.toUpperCase())
    .maybeSingle();

  if (error) {
    console.error('[appointments GET]', error);
    return NextResponse.json({ error: 'Error al buscar la cita' }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 });
  }

  return NextResponse.json({
    ...data,
    service_name: (data.services as { name: string } | null)?.name ?? '',
  });
}
