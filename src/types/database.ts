/**
 * Tipos de la base de datos.
 * Reflejan las tablas definidas en supabase/schema.sql.
 * Tenerlos aquí da autocompletado y previene errores en todo el código.
 */

export type BusinessStatus = "trial" | "active" | "suspended" | "cancelled";
export type BusinessPlan = "basico" | "pro" | "empresarial";

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  email: string;
  phone: string | null;
  status: BusinessStatus;
  plan: BusinessPlan;
  monthly_price: number;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyCard {
  id: string;
  business_id: string;
  title: string;
  description: string | null;
  logo_url: string | null;
  color_primary: string;
  color_background: string;
  text_color: string;
  stamps_required: number;
  reward_text: string;
  is_active: boolean;
  // Personalización avanzada del fondo
  bg_type: "solid" | "gradient" | "image";
  color_gradient_end: string | null;
  gradient_direction: string | null;
  bg_image_url: string | null;
  bg_image_position: "top" | "center" | "bottom" | "cover" | null;
  created_at: string;
  updated_at: string;
}

export type Gender = "masculino" | "femenino" | "otro" | "prefiero_no_decir";

export interface EndCustomer {
  id: string;
  business_id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  birth_date: string | null;
  gender: Gender | null;
  current_stamps: number;
  total_visits: number;
  rewards_redeemed: number;
  apple_pass_serial: string | null;
  google_pass_id: string | null;
  enrolled_at: string;
  last_visit_at: string | null;
}

export interface Promotion {
  id: string;
  business_id: string;
  title: string;
  message: string;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

export interface PushNotification {
  id: string;
  business_id: string;
  title: string;
  message: string;
  recipients_count: number;
  sent_at: string;
}

/** Métricas calculadas para el dashboard del negocio. */
export interface DashboardMetrics {
  totalCustomers: number;
  visitsThisMonth: number;
  rewardsRedeemed: number;
  newCustomers: number;
  returningCustomers: number;
  estimatedRevenue: number;
}
