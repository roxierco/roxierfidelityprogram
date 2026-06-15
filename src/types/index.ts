export interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
  description?: string;
  is_active: boolean;
}

export interface Schedule {
  id: string;
  day_of_week: number; // 0 = Domingo, 1 = Lunes … 6 = Sábado
  start_time: string;  // "09:00"
  end_time: string;    // "18:00"
  is_active: boolean;
}

export interface BlockedDate {
  id: string;
  date: string;      // "YYYY-MM-DD"
  reason?: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Appointment {
  id: string;
  service_id: string;
  service_name?: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  appointment_date: string; // "YYYY-MM-DD"
  appointment_time: string; // "HH:MM"
  notes?: string;
  status: AppointmentStatus;
  confirmation_code: string;
  created_at: string;
}

export interface BookingForm {
  service_id: string;
  date: string;
  time: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  notes?: string;
}

export interface TimeSlot {
  time: string;       // "HH:MM"
  available: boolean;
}
