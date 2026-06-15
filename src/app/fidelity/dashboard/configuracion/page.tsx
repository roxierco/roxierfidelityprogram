import { createClient } from "@/lib/supabase/server";
import { formatMXN } from "@/lib/utils";
import { ActivarSuscripcion } from "./ActivarSuscripcion";
import { LogoUpload } from "./LogoUpload";
import type { Business } from "@/types/database";

/**
 * Configuración de la cuenta del negocio.
 * Muestra el plan, estado, y permite activar la suscripción de pago.
 */
export default async function ConfiguracionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", user!.id)
    .single();

  const business = data as Business;

  const estadoLabel: Record<string, string> = {
    trial: "Periodo de prueba",
    active: "Activo",
    suspended: "Suspendido",
    cancelled: "Cancelado",
  };

  return (
    <div className="animate-fade-up max-w-2xl">
      <h1 className="text-3xl font-extrabold text-paper">Configuración</h1>
      <p className="mt-1 text-mist">Tu cuenta y suscripción.</p>

      {/* Logo del negocio */}
      <div className="card mt-8">
        <h3 className="font-bold text-paper mb-1">Logo del negocio</h3>
        <p className="text-sm text-mist mb-4">
          Aparece junto al nombre en el sidebar y le da identidad a tu marca.
        </p>
        <LogoUpload currentLogoUrl={business.logo_url ?? null} businessId={business.id} />
      </div>

      <div className="card mt-4 space-y-4">
        <Row label="Negocio" value={business.name} />
        <Row label="Correo" value={business.email} />
        <Row label="Plan" value={business.plan} />
        <Row label="Mensualidad" value={formatMXN(business.monthly_price)} />
        <Row label="Estado" value={estadoLabel[business.status] ?? business.status} />
      </div>

      {business.status !== "active" && (
        <div className="card mt-6">
          <h3 className="font-bold text-paper">Activa tu suscripción</h3>
          <p className="mt-1 text-sm text-mist">
            Paga {formatMXN(business.monthly_price)} al mes con tarjeta vía Mercado Pago.
            Puedes cancelar cuando quieras.
          </p>
          <div className="mt-4">
            <ActivarSuscripcion />
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-surface-border pb-3 last:border-0 last:pb-0">
      <span className="text-mist">{label}</span>
      <span className="font-semibold capitalize text-paper">{value}</span>
    </div>
  );
}
