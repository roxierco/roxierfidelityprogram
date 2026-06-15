'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Appointment, AppointmentStatus } from '@/types';

const BLUE = '#2563eb';
const BORDER = '#e5e7eb';
const GRAY = '#6b7280';

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  pending: '#f59e0b',
  confirmed: '#10b981',
  cancelled: '#ef4444',
  completed: '#6366f1',
};

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Completada',
};

const s = {
  page: {
    minHeight: '100vh',
    background: '#f3f4f6',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  } as React.CSSProperties,
  nav: {
    background: BLUE,
    color: '#fff',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as React.CSSProperties,
  main: { maxWidth: 900, margin: '0 auto', padding: '24px 16px' } as React.CSSProperties,
  card: {
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,.1)',
    padding: '24px',
    marginBottom: 20,
  } as React.CSSProperties,
  input: {
    padding: '9px 12px',
    border: `1px solid ${BORDER}`,
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
  } as React.CSSProperties,
  select: {
    padding: '9px 12px',
    border: `1px solid ${BORDER}`,
    borderRadius: 8,
    fontSize: 14,
    background: '#fff',
    outline: 'none',
  } as React.CSSProperties,
  btnBlue: {
    padding: '9px 18px',
    background: BLUE,
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  } as React.CSSProperties,
  btnSmall: (color: string): React.CSSProperties => ({
    padding: '5px 12px',
    background: color,
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    marginLeft: 6,
  }),
  apptCard: (status: AppointmentStatus): React.CSSProperties => ({
    background: '#fff',
    borderRadius: 10,
    border: `2px solid ${STATUS_COLORS[status]}`,
    padding: '16px',
    marginBottom: 12,
  }),
  badge: (status: AppointmentStatus): React.CSSProperties => ({
    display: 'inline-block',
    padding: '2px 10px',
    background: STATUS_COLORS[status] + '22',
    color: STATUS_COLORS[status],
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
  }),
};

type ViewState = 'login' | 'dashboard';

export default function AdminPage() {
  const [view, setView] = useState<ViewState>('login');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [appointments, setAppointments] = useState<(Appointment & { service_name: string })[]>([]);
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchAppointments = useCallback(
    async (tok: string, date?: string, status?: string) => {
      setListLoading(true);
      setListError('');
      try {
        const params = new URLSearchParams();
        if (date) params.set('date', date);
        if (status) params.set('status', status);
        const qs = params.toString() ? `?${params}` : '';

        const res = await fetch(`/api/admin/appointments${qs}`, {
          headers: { Authorization: `Bearer ${tok}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Error');
        setAppointments(data.appointments ?? []);
      } catch (e: unknown) {
        setListError(e instanceof Error ? e.message : 'Error al cargar citas');
      } finally {
        setListLoading(false);
      }
    },
    []
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await fetch('/api/admin/appointments', {
        headers: { Authorization: `Bearer ${password}` },
      });
      if (!res.ok) throw new Error('Contraseña incorrecta');
      setToken(password);
      setView('dashboard');
      fetchAppointments(password);
    } catch (e: unknown) {
      setLoginError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoginLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'dashboard' && token) {
      fetchAppointments(token, filterDate, filterStatus);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterDate, filterStatus]);

  const updateStatus = async (id: string, status: AppointmentStatus) => {
    setUpdating(id);
    try {
      const res = await fetch('/api/admin/appointments', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? 'Error');
      }
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Error al actualizar');
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (d: string) => {
    if (!d) return '';
    const [y, m, day] = d.split('-');
    return `${parseInt(day)}/${parseInt(m)}/${y}`;
  };

  // ── LOGIN ──
  if (view === 'login') {
    return (
      <div
        style={{
          ...s.page,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 4px 24px rgba(0,0,0,.1)',
            padding: '40px 36px',
            width: '100%',
            maxWidth: 360,
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 36 }}>🦷</div>
            <h1 style={{ fontSize: 20, fontWeight: 700, marginTop: 8 }}>Panel de Administración</h1>
            <p style={{ color: GRAY, fontSize: 14, marginTop: 4 }}>Clínica Dental</p>
          </div>
          <form onSubmit={handleLogin}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ ...s.input, width: '100%', boxSizing: 'border-box', marginBottom: 16 }}
              autoFocus
            />
            {loginError && (
              <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 12 }}>{loginError}</p>
            )}
            <button
              type="submit"
              style={{ ...s.btnBlue, width: '100%', padding: '11px', fontSize: 15 }}
              disabled={loginLoading || !password}
            >
              {loginLoading ? 'Verificando…' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── DASHBOARD ──
  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <div>
          <span style={{ fontWeight: 700, fontSize: 18 }}>🦷 Clínica Dental</span>
          <span style={{ marginLeft: 12, fontSize: 14, opacity: 0.8 }}>Panel Admin</span>
        </div>
        <button
          onClick={() => { setToken(''); setView('login'); setPassword(''); }}
          style={{ background: 'rgba(255,255,255,.15)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 14 }}
        >
          Salir
        </button>
      </nav>

      <div style={s.main}>
        {/* Filtros */}
        <div style={s.card}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: GRAY }}>
                Fecha
              </label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                style={s.input}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: GRAY }}>
                Estatus
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={s.select}
              >
                <option value="">Todos</option>
                <option value="pending">Pendiente</option>
                <option value="confirmed">Confirmada</option>
                <option value="completed">Completada</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>
            <button
              style={s.btnBlue}
              onClick={() => fetchAppointments(token, filterDate, filterStatus)}
            >
              Buscar
            </button>
            {(filterDate || filterStatus) && (
              <button
                style={{ ...s.btnBlue, background: '#6b7280' }}
                onClick={() => { setFilterDate(''); setFilterStatus(''); fetchAppointments(token); }}
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Lista de citas */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>
              Citas {appointments.length > 0 && `(${appointments.length})`}
            </h2>
          </div>

          {listLoading && (
            <p style={{ textAlign: 'center', color: GRAY, padding: '40px 0' }}>Cargando citas…</p>
          )}

          {listError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', color: '#dc2626', marginBottom: 16 }}>
              {listError}
            </div>
          )}

          {!listLoading && !listError && appointments.length === 0 && (
            <div style={{ ...s.card, textAlign: 'center', color: GRAY, padding: '48px 24px' }}>
              No se encontraron citas
            </div>
          )}

          {appointments.map((appt) => (
            <div key={appt.id} style={s.apptCard(appt.status)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: 16 }}>{appt.patient_name}</span>
                    <span style={s.badge(appt.status)}>{STATUS_LABELS[appt.status]}</span>
                  </div>
                  <div style={{ color: GRAY, fontSize: 14, marginTop: 4 }}>
                    📅 {formatDate(appt.appointment_date)} &nbsp;🕐 {appt.appointment_time} hrs
                  </div>
                  <div style={{ color: '#374151', fontSize: 14, marginTop: 2 }}>
                    🦷 {appt.service_name}
                  </div>
                  <div style={{ color: GRAY, fontSize: 13, marginTop: 4 }}>
                    ✉ {appt.patient_email} &nbsp;📱 {appt.patient_phone}
                  </div>
                  {appt.notes && (
                    <div style={{ color: GRAY, fontSize: 13, marginTop: 2, fontStyle: 'italic' }}>
                      Notas: {appt.notes}
                    </div>
                  )}
                  <div style={{ marginTop: 6 }}>
                    <span style={{ fontSize: 12, color: GRAY }}>Código: </span>
                    <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>
                      {appt.confirmation_code}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, flexWrap: 'wrap' }}>
                  {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                    <button
                      style={s.btnSmall('#10b981')}
                      disabled={updating === appt.id}
                      onClick={() => updateStatus(appt.id, 'completed')}
                    >
                      ✓ Completada
                    </button>
                  )}
                  {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                    <button
                      style={s.btnSmall('#ef4444')}
                      disabled={updating === appt.id}
                      onClick={() => {
                        if (confirm(`¿Cancelar la cita de ${appt.patient_name}?`)) {
                          updateStatus(appt.id, 'cancelled');
                        }
                      }}
                    >
                      ✕ Cancelar
                    </button>
                  )}
                  {appt.status === 'pending' && (
                    <button
                      style={s.btnSmall(BLUE)}
                      disabled={updating === appt.id}
                      onClick={() => updateStatus(appt.id, 'confirmed')}
                    >
                      Confirmar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
