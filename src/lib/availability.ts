import { supabaseAdmin } from './supabase';
import type { TimeSlot } from '../types';

export async function getAvailableSlots(date: string, serviceId: string): Promise<TimeSlot[]> {
  // 1. Fecha bloqueada?
  const { data: blocked } = await supabaseAdmin
    .from('blocked_dates')
    .select('id')
    .eq('date', date)
    .maybeSingle();

  if (blocked) return [];

  // 2. Horario del día (0=Dom, 1=Lun … 6=Sáb)
  // Se agrega T12:00:00 para evitar desfases de zona horaria al parsear
  const dayOfWeek = new Date(`${date}T12:00:00`).getDay();

  const { data: schedule } = await supabaseAdmin
    .from('schedule')
    .select('start_time, end_time')
    .eq('day_of_week', dayOfWeek)
    .eq('is_active', true)
    .maybeSingle();

  if (!schedule) return [];

  // 3. Duración del servicio
  const { data: service } = await supabaseAdmin
    .from('services')
    .select('duration_minutes')
    .eq('id', serviceId)
    .maybeSingle();

  if (!service) return [];

  // 4. Generar todos los slots posibles
  const allSlots = generateSlots(schedule.start_time, schedule.end_time, service.duration_minutes);

  // 5. Citas ya ocupadas
  const { data: appointments } = await supabaseAdmin
    .from('appointments')
    .select('appointment_time')
    .eq('appointment_date', date)
    .in('status', ['pending', 'confirmed']);

  const occupiedTimes = new Set((appointments ?? []).map((a) => a.appointment_time));

  // 6. Si es hoy, bloquear slots dentro de la próxima hora
  const today = new Date().toISOString().split('T')[0];
  const isToday = date === today;
  const cutoffMs = isToday ? Date.now() + 60 * 60 * 1000 : null;

  return allSlots.map((time) => {
    if (occupiedTimes.has(time)) return { time, available: false };

    if (cutoffMs !== null) {
      const slotMs = new Date(`${date}T${time}:00`).getTime();
      if (slotMs <= cutoffMs) return { time, available: false };
    }

    return { time, available: true };
  });
}

function generateSlots(startTime: string, endTime: string, durationMinutes: number): string[] {
  const slots: string[] = [];
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  let current = startH * 60 + startM;
  const end = endH * 60 + endM;

  while (current + durationMinutes <= end) {
    const h = Math.floor(current / 60).toString().padStart(2, '0');
    const m = (current % 60).toString().padStart(2, '0');
    slots.push(`${h}:${m}`);
    current += durationMinutes;
  }

  return slots;
}
