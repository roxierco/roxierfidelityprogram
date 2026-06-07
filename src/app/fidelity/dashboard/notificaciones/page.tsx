import { createClient } from "@/lib/supabase/server";
import type { PushNotification } from "@/types/database";

/**
 * Notificaciones push. El negocio puede enviar mensajes manuales
 * a sus clientes cuando quiera (no por ubicación, según el brief).
 * El envío real a los wallets se conecta en la Fase 4.
 */
export default async function NotificacionesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user!.id)
    .single();

  const { data: notifs } = await supabase
    .from("push_notifications")
    .select("*")
    .eq("business_id", business!.id)
    .order("sent_at", { ascending: false });

  const list = (notifs ?? []) as PushNotification[];

  return (
    <div className="animate-fade-up">
      <h1 className="text-3xl font-extrabold text-paper">Notificaciones</h1>
      <p className="mt-1 text-mist">
        Envía mensajes a la pantalla de tus clientes cuando quieras.
      </p>

      <div className="card mt-8">
        <h3 className="mb-4 font-bold text-paper">Nueva notificación</h3>
        <div className="space-y-4">
          <input className="input" placeholder="Título (ej: ¡Oferta de hoy!)" />
          <textarea className="input min-h-24" placeholder="Mensaje para tus clientes..." />
          <button className="btn-primary">Enviar a todos mis clientes</button>
        </div>
      </div>

      {list.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-3 font-bold text-paper">Historial</h3>
          <div className="space-y-3">
            {list.map((n) => (
              <div key={n.id} className="card">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-paper">{n.title}</h4>
                  <span className="text-xs text-mist">{n.recipients_count} enviadas</span>
                </div>
                <p className="mt-1 text-sm text-mist">{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
