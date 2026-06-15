'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Service, TimeSlot } from '@/types';

const BLUE = '#2563eb';
const BLUE_DARK = '#1d4ed8';
const BLUE_LIGHT = '#eff6ff';
const GRAY = '#6b7280';
const BORDER = '#e5e7eb';

const s = {
  page: {
    minHeight: '100vh',
    background: '#f9fafb',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: '16px',
  } as React.CSSProperties,
  card: {
    maxWidth: 600,
    margin: '0 auto',
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 1px 3px rgba(0,0,0,.1)',
    overflow: 'hidden',
  } as React.CSSProperties,
  header: {
    background: BLUE,
    color: '#fff',
    padding: '24px 28px 20px',
  } as React.CSSProperties,
  body: { padding: '28px 28px 32px' } as React.CSSProperties,
  stepBar: {
    display: 'flex',
    gap: 8,
    marginBottom: 28,
  } as React.CSSProperties,
  stepDot: (active: boolean, done: boolean): React.CSSProperties => ({
    flex: 1,
    height: 4,
    borderRadius: 4,
    background: done ? BLUE : active ? BLUE : BORDER,
    opacity: active ? 1 : done ? 1 : 0.35,
    transition: 'all .3s',
  }),
  title: { fontSize: 20, fontWeight: 700, marginBottom: 6 } as React.CSSProperties,
  subtitle: { fontSize: 14, opacity: 0.8 } as React.CSSProperties,
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 6,
  } as React.CSSProperties,
  input: {
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${BORDER}`,
    borderRadius: 8,
    fontSize: 15,
    outline: 'none',
    boxSizing: 'border-box',
  } as React.CSSProperties,
  textarea: {
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${BORDER}`,
    borderRadius: 8,
    fontSize: 15,
    outline: 'none',
    resize: 'vertical',
    minHeight: 80,
    boxSizing: 'border-box',
  } as React.CSSProperties,
  field: { marginBottom: 18 } as React.CSSProperties,
  btnPrimary: {
    display: 'block',
    width: '100%',
    padding: '12px',
    background: BLUE,
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 8,
  } as React.CSSProperties,
  btnSecondary: {
    display: 'block',
    width: '100%',
    padding: '11px',
    background: 'transparent',
    color: BLUE,
    border: `1.5px solid ${BLUE}`,
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 10,
  } as React.CSSProperties,
  serviceCard: (selected: boolean): React.CSSProperties => ({
    border: `2px solid ${selected ? BLUE : BORDER}`,
    borderRadius: 12,
    padding: '16px',
    cursor: 'pointer',
    marginBottom: 10,
    background: selected ? BLUE_LIGHT : '#fff',
    transition: 'all .2s',
  }),
  slotGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
    gap: 8,
    marginTop: 12,
  } as React.CSSProperties,
  slotBtn: (available: boolean, selected: boolean): React.CSSProperties => ({
    padding: '9px 4px',
    borderRadius: 8,
    border: `1.5px solid ${selected ? BLUE : available ? BORDER : '#f3f4f6'}`,
    background: selected ? BLUE : available ? '#fff' : '#f9fafb',
    color: selected ? '#fff' : available ? '#111' : GRAY,
    fontSize: 14,
    fontWeight: selected ? 700 : 400,
    cursor: available ? 'pointer' : 'not-allowed',
    opacity: available ? 1 : 0.5,
    transition: 'all .15s',
    textAlign: 'center',
  }),
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: `1px solid ${BORDER}`,
    fontSize: 15,
  } as React.CSSProperties,
  successBox: {
    textAlign: 'center',
    padding: '16px 0',
  } as React.CSSProperties,
  codeBox: {
    background: BLUE_LIGHT,
    border: `2px dashed ${BLUE}`,
    borderRadius: 12,
    padding: '20px',
    margin: '20px 0',
    textAlign: 'center',
  } as React.CSSProperties,
  errorMsg: {
    color: '#dc2626',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 14,
    marginBottom: 16,
  } as React.CSSProperties,
};

type Step = 1 | 2 | 3 | 4;

interface BookingState {
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
}

const EMPTY: BookingState = {
  serviceId: '', serviceName: '', servicePrice: 0, serviceDuration: 0,
  date: '', time: '', name: '', email: '', phone: '', notes: '',
};

const MIN_DATE = new Date().toISOString().split('T')[0];

export default function BookingPage() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<BookingState>(EMPTY);
  const [services, setServices] = useState<Service[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');

  // Cargar servicios
  useEffect(() => {
    fetch('/api/services')
      .then((r) => r.json())
      .then((d) => setServices(d.services ?? []))
      .catch(() => setServices([]));
  }, []);

  // Cargar slots cuando cambia fecha o servicio
  const fetchSlots = useCallback(async (date: string, serviceId: string) => {
    if (!date || !serviceId) return;
    setSlotsLoading(true);
    setSlots([]);
    try {
      const r = await fetch(`/api/availability?date=${date}&service_id=${serviceId}`);
      const d = await r.json();
      setSlots(d.slots ?? []);
    } catch {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (step === 2 && form.date && form.serviceId) {
      fetchSlots(form.date, form.serviceId);
    }
  }, [step, form.date, form.serviceId, fetchSlots]);

  const set = (key: keyof BookingState, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const goNext = () => {
    setError('');
    setStep((s) => (s + 1) as Step);
  };

  const goBack = () => {
    setError('');
    setStep((s) => (s - 1) as Step);
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: form.serviceId,
          date: form.date,
          time: form.time,
          patient_name: form.name,
          patient_email: form.email,
          patient_phone: form.phone,
          notes: form.notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error al confirmar la cita');
      setConfirmationCode(data.confirmation_code);
      setStep(4);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = ['Servicio', 'Fecha y hora', 'Tus datos', 'Confirmar'];

  const formatDateEs = (d: string) => {
    if (!d) return '';
    const [y, m, day] = d.split('-');
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${parseInt(day)} ${months[parseInt(m) - 1]} ${y}`;
  };

  if (confirmationCode && step === 4) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <div style={s.header}>
            <div style={s.title}>Clínica Dental</div>
          </div>
          <div style={s.body}>
            <div style={s.successBox}>
              <div style={{ fontSize: 56 }}>🦷</div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 8 }}>
                ¡Cita agendada!
              </h2>
              <p style={{ color: GRAY, marginBottom: 4 }}>
                Recibirás un correo y WhatsApp de confirmación.
              </p>
              <div style={s.codeBox}>
                <p style={{ color: GRAY, fontSize: 13, marginBottom: 4 }}>Tu código de confirmación</p>
                <p style={{ fontSize: 28, fontWeight: 800, color: BLUE, letterSpacing: 4 }}>
                  {confirmationCode}
                </p>
                <p style={{ color: GRAY, fontSize: 12, marginTop: 4 }}>Guárdalo para cualquier consulta</p>
              </div>
              <div style={{ ...s.summaryRow, borderTop: `1px solid ${BORDER}` }}>
                <span style={{ color: GRAY }}>Servicio</span>
                <span style={{ fontWeight: 600 }}>{form.serviceName}</span>
              </div>
              <div style={s.summaryRow}>
                <span style={{ color: GRAY }}>Fecha</span>
                <span style={{ fontWeight: 600 }}>{formatDateEs(form.date)}</span>
              </div>
              <div style={{ ...s.summaryRow, borderBottom: 'none' }}>
                <span style={{ color: GRAY }}>Hora</span>
                <span style={{ fontWeight: 600 }}>{form.time} hrs</span>
              </div>
              <button
                onClick={() => { setForm(EMPTY); setConfirmationCode(''); setStep(1); }}
                style={{ ...s.btnSecondary, marginTop: 24 }}
              >
                Agendar otra cita
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.header}>
          <div style={s.title}>Clínica Dental</div>
          <div style={s.subtitle}>Agenda tu cita en línea</div>
        </div>

        <div style={s.body}>
          {/* Step indicator */}
          <div style={s.stepBar}>
            {([1, 2, 3, 4] as Step[]).map((n) => (
              <div key={n} style={s.stepDot(step === n, step > n)} />
            ))}
          </div>
          <p style={{ fontSize: 13, color: GRAY, marginBottom: 20 }}>
            Paso {step} de 4 — <strong>{stepLabels[step - 1]}</strong>
          </p>

          {error && <div style={s.errorMsg}>{error}</div>}

          {/* ── PASO 1: Servicio ── */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Elige un servicio</h2>
              {services.length === 0 && (
                <p style={{ color: GRAY, textAlign: 'center', padding: '32px 0' }}>
                  Cargando servicios…
                </p>
              )}
              {services.map((svc) => (
                <div
                  key={svc.id}
                  style={s.serviceCard(form.serviceId === svc.id)}
                  onClick={() => {
                    set('serviceId', svc.id);
                    set('serviceName', svc.name);
                    set('servicePrice', svc.price);
                    set('serviceDuration', svc.duration_minutes);
                    set('time', '');
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>{svc.name}</div>
                      {svc.description && (
                        <div style={{ color: GRAY, fontSize: 13, marginTop: 2 }}>{svc.description}</div>
                      )}
                      <div style={{ color: GRAY, fontSize: 13, marginTop: 4 }}>
                        ⏱ {svc.duration_minutes} min
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: BLUE, whiteSpace: 'nowrap', marginLeft: 12 }}>
                      ${svc.price.toLocaleString('es-MX')}
                    </div>
                  </div>
                </div>
              ))}
              <button
                style={{ ...s.btnPrimary, opacity: form.serviceId ? 1 : 0.5 }}
                disabled={!form.serviceId}
                onClick={goNext}
              >
                Continuar
              </button>
            </div>
          )}

          {/* ── PASO 2: Fecha y hora ── */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Elige fecha y hora</h2>
              <div style={s.field}>
                <label style={s.label}>Fecha</label>
                <input
                  type="date"
                  min={MIN_DATE}
                  value={form.date}
                  onChange={(e) => { set('date', e.target.value); set('time', ''); }}
                  style={s.input}
                />
              </div>

              {form.date && (
                <div>
                  <label style={s.label}>Horario disponible</label>
                  {slotsLoading && (
                    <p style={{ color: GRAY, textAlign: 'center', padding: '20px 0' }}>
                      Cargando horarios…
                    </p>
                  )}
                  {!slotsLoading && slots.length === 0 && (
                    <p style={{ color: GRAY, textAlign: 'center', padding: '20px 0' }}>
                      No hay horarios disponibles para este día.
                    </p>
                  )}
                  {!slotsLoading && slots.length > 0 && (
                    <div style={s.slotGrid}>
                      {slots.map((slot) => (
                        <button
                          key={slot.time}
                          disabled={!slot.available}
                          onClick={() => set('time', slot.time)}
                          style={s.slotBtn(slot.available, form.time === slot.time)}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button
                style={{ ...s.btnPrimary, marginTop: 24, opacity: form.date && form.time ? 1 : 0.5 }}
                disabled={!form.date || !form.time}
                onClick={goNext}
              >
                Continuar
              </button>
              <button style={s.btnSecondary} onClick={goBack}>Regresar</button>
            </div>
          )}

          {/* ── PASO 3: Datos personales ── */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Tus datos</h2>
              <div style={s.field}>
                <label style={s.label}>Nombre completo *</label>
                <input
                  type="text"
                  placeholder="María García López"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  style={s.input}
                />
              </div>
              <div style={s.field}>
                <label style={s.label}>Correo electrónico *</label>
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  style={s.input}
                />
              </div>
              <div style={s.field}>
                <label style={s.label}>Teléfono (WhatsApp) *</label>
                <input
                  type="tel"
                  placeholder="55 1234 5678"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  style={s.input}
                />
              </div>
              <div style={s.field}>
                <label style={s.label}>Notas adicionales (opcional)</label>
                <textarea
                  placeholder="Alergias, motivo de consulta, etc."
                  value={form.notes}
                  onChange={(e) => set('notes', e.target.value)}
                  style={s.textarea}
                />
              </div>
              <button
                style={{
                  ...s.btnPrimary,
                  opacity: form.name && form.email && form.phone ? 1 : 0.5,
                }}
                disabled={!form.name || !form.email || !form.phone}
                onClick={goNext}
              >
                Continuar
              </button>
              <button style={s.btnSecondary} onClick={goBack}>Regresar</button>
            </div>
          )}

          {/* ── PASO 4: Resumen y confirmar ── */}
          {step === 4 && !confirmationCode && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Resumen de tu cita</h2>

              {[
                ['Servicio', form.serviceName],
                ['Fecha', formatDateEs(form.date)],
                ['Hora', `${form.time} hrs`],
                ['Duración', `${form.serviceDuration} min`],
                ['Precio', `$${form.servicePrice.toLocaleString('es-MX')} MXN`],
                ['Nombre', form.name],
                ['Correo', form.email],
                ['Teléfono', form.phone],
                ...(form.notes ? [['Notas', form.notes]] : []),
              ].map(([label, value]) => (
                <div key={label} style={s.summaryRow}>
                  <span style={{ color: GRAY }}>{label}</span>
                  <span style={{ fontWeight: 600, maxWidth: '60%', textAlign: 'right' }}>{value}</span>
                </div>
              ))}

              <p style={{ color: GRAY, fontSize: 13, margin: '16px 0 20px' }}>
                Al confirmar recibirás un correo y un mensaje de WhatsApp con los detalles.
              </p>

              <button
                style={{ ...s.btnPrimary, opacity: loading ? 0.7 : 1 }}
                disabled={loading}
                onClick={handleConfirm}
              >
                {loading ? 'Confirmando…' : 'Confirmar cita'}
              </button>
              <button style={s.btnSecondary} disabled={loading} onClick={goBack}>
                Regresar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
