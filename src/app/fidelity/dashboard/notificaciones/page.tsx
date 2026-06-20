import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function NotificacionesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const admin = createAdminClient();
  const { data: business } = await admin
    .from("businesses")
    .select("id")
    .eq("owner_id", user!.id)
    .single();

  const { data: notifs } = await admin
    .from("push_notifications")
    .select("id, title, message, recipients_count, sent_at")
    .eq("business_id", business!.id)
    .order("sent_at", { ascending: false });

  const list = notifs ?? [];

  return (
    <div className="animate-fade-up">
      <h1 className="text-3xl font-extrabold text-paper">Notificaciones</h1>
      <p className="mt-1 text-mist">
        Historial de emails enviados a tus clientes desde Promociones.
      </p>

      {list.length === 0 ? (
        <div className="card mt-8 py-12 text-center">
          <div className="text-4xl mb-3">📭</div>
          <p className="font-semibold text-paper mb-1">Sin envíos aún</p>
          <p className="text-sm text-mist">
            Ve a <strong>Promociones</strong> y presiona &quot;Enviar a clientes&quot; para mandar tu primera campaña.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {list.map((n) => (
            <div key={n.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-paper">{n.title}</h4>
                  <p className="mt-1 text-sm text-mist leading-relaxed">{n.message}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <span className="block text-sm font-bold text-paper">{n.recipients_count}</span>
                  <span className="text-xs text-mist">enviados</span>
                </div>
              </div>
              <p className="mt-3 text-xs text-mist opacity-60">
                {new Date(n.sent_at).toLocaleDateString("es-MX", {
                  day: "numeric", month: "short", year: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
