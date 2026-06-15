import { Resend } from 'resend';
import type { Appointment } from '../types';

const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_FROM = process.env.EMAIL_FROM ?? 'Clínica Dental <no-reply@example.com>';

// Normaliza un teléfono mexicano a formato E.164 (+52XXXXXXXXXX)
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  // Ya tiene código de país
  if (digits.startsWith('52') && digits.length === 12) return `+${digits}`;
  if (digits.startsWith('521') && digits.length === 13) return `+${digits}`;

  // 10 dígitos — agregar +52
  if (digits.length === 10) return `+52${digits}`;

  // 10 dígitos con 1 al inicio (formato LADA MX antiguo)
  if (digits.length === 11 && digits.startsWith('1')) return `+52${digits}`;

  return `+52${digits}`;
}

// ──────────────────────────────────────────────────────────
//  EMAIL
// ──────────────────────────────────────────────────────────

export async function sendConfirmationEmail(appointment: Appointment & { service_name: string }) {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px">
      <h2 style="color:#2563eb">✅ Cita confirmada</h2>
      <p>Hola <strong>${appointment.patient_name}</strong>,</p>
      <p>Tu cita en la clínica dental ha sido registrada exitosamente.</p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0">
        <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280">Servicio</td>
            <td style="padding:8px;border-bottom:1px solid #e5e7eb"><strong>${appointment.service_name}</strong></td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280">Fecha</td>
            <td style="padding:8px;border-bottom:1px solid #e5e7eb"><strong>${formatDate(appointment.appointment_date)}</strong></td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280">Hora</td>
            <td style="padding:8px;border-bottom:1px solid #e5e7eb"><strong>${appointment.appointment_time} hrs</strong></td></tr>
        <tr><td style="padding:8px;color:#6b7280">Código de confirmación</td>
            <td style="padding:8px"><strong style="color:#2563eb;font-size:18px">${appointment.confirmation_code}</strong></td></tr>
      </table>
      <p style="color:#6b7280;font-size:14px">
        Por favor llega 5 minutos antes de tu cita. Si necesitas cancelar, contáctanos lo antes posible.
      </p>
      <p style="color:#6b7280;font-size:13px">— Equipo de la Clínica Dental</p>
    </div>
  `;

  await resend.emails.send({
    from: EMAIL_FROM,
    to: appointment.patient_email,
    subject: `Cita confirmada — ${formatDate(appointment.appointment_date)} a las ${appointment.appointment_time}`,
    html,
  });
}

export async function sendReminderEmail(appointment: Appointment & { service_name: string }) {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px">
      <h2 style="color:#2563eb">⏰ Recordatorio de cita</h2>
      <p>Hola <strong>${appointment.patient_name}</strong>,</p>
      <p>Te recordamos que tienes una cita <strong>mañana</strong> en la clínica dental.</p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0">
        <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280">Servicio</td>
            <td style="padding:8px;border-bottom:1px solid #e5e7eb"><strong>${appointment.service_name}</strong></td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280">Fecha</td>
            <td style="padding:8px;border-bottom:1px solid #e5e7eb"><strong>${formatDate(appointment.appointment_date)}</strong></td></tr>
        <tr><td style="padding:8px;color:#6b7280">Hora</td>
            <td style="padding:8px"><strong>${appointment.appointment_time} hrs</strong></td></tr>
      </table>
      <p style="color:#6b7280;font-size:14px">
        Código de confirmación: <strong>${appointment.confirmation_code}</strong>
      </p>
      <p style="color:#6b7280;font-size:13px">— Equipo de la Clínica Dental</p>
    </div>
  `;

  await resend.emails.send({
    from: EMAIL_FROM,
    to: appointment.patient_email,
    subject: `Recordatorio: cita mañana ${formatDate(appointment.appointment_date)} a las ${appointment.appointment_time}`,
    html,
  });
}

// ──────────────────────────────────────────────────────────
//  WHATSAPP (Twilio REST API — sin SDK)
// ──────────────────────────────────────────────────────────

async function sendWhatsApp(to: string, body: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID!;
  const authToken = process.env.TWILIO_AUTH_TOKEN!;
  const from = process.env.TWILIO_WHATSAPP_FROM!; // "whatsapp:+14155238886"

  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: from.startsWith('whatsapp:') ? from : `whatsapp:${from}`,
        To: `whatsapp:${normalizePhone(to)}`,
        Body: body,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Twilio error ${res.status}: ${err}`);
  }
}

export async function sendWhatsAppConfirmation(appointment: Appointment & { service_name: string }) {
  const body =
    `✅ *Cita confirmada — Clínica Dental*\n\n` +
    `Hola ${appointment.patient_name}, tu cita ha sido registrada.\n\n` +
    `📋 *Servicio:* ${appointment.service_name}\n` +
    `📅 *Fecha:* ${formatDate(appointment.appointment_date)}\n` +
    `🕐 *Hora:* ${appointment.appointment_time} hrs\n` +
    `🔑 *Código:* ${appointment.confirmation_code}\n\n` +
    `Por favor llega 5 minutos antes. ¡Te esperamos!`;

  await sendWhatsApp(appointment.patient_phone, body);
}

export async function sendWhatsAppReminder(appointment: Appointment & { service_name: string }) {
  const body =
    `⏰ *Recordatorio — Clínica Dental*\n\n` +
    `Hola ${appointment.patient_name}, te recordamos tu cita de mañana.\n\n` +
    `📋 *Servicio:* ${appointment.service_name}\n` +
    `📅 *Fecha:* ${formatDate(appointment.appointment_date)}\n` +
    `🕐 *Hora:* ${appointment.appointment_time} hrs\n\n` +
    `¡Te esperamos! 😊`;

  await sendWhatsApp(appointment.patient_phone, body);
}

// ──────────────────────────────────────────────────────────
//  Helpers
// ──────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ];
  return `${parseInt(day)} de ${months[parseInt(month) - 1]} de ${year}`;
}
