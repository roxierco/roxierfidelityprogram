import { NextRequest, NextResponse } from 'next/server';
import { getAvailableSlots } from '@/lib/availability';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const date = searchParams.get('date');
  const serviceId = searchParams.get('service_id');

  if (!date || !serviceId) {
    return NextResponse.json(
      { error: 'Parámetros requeridos: date, service_id' },
      { status: 400 }
    );
  }

  // Validar formato YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Formato de fecha inválido. Usa YYYY-MM-DD' }, { status: 400 });
  }

  try {
    const slots = await getAvailableSlots(date, serviceId);
    return NextResponse.json({ slots });
  } catch (err) {
    console.error('[availability] Error:', err);
    return NextResponse.json({ error: 'Error al obtener disponibilidad' }, { status: 500 });
  }
}
