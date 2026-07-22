import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { formatMXN } from "@/lib/utils";
import type { CashbackTxType } from "@/types/database";

interface TxRow {
  id: string;
  type: CashbackTxType;
  amount: number;
  purchase_amount: number | null;
  balance_after: number;
  created_at: string;
  end_customers: { full_name: string } | null;
}

const TYPE_META: Record<CashbackTxType, { label: string; color: string; sign: string }> = {
  earned: { label: "Acumulado", color: "text-green-400", sign: "+" },
  redeemed: { label: "Redimido", color: "text-magenta", sign: "−" },
  expired: { label: "Expirado", color: "text-mist", sign: "−" },
  adjustment: { label: "Ajuste", color: "text-yellow-400", sign: "" },
};

function fecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function CashbackPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/fidelity/login");

  const admin = createAdminClient();
  const { data: business } = await admin
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .single();
  if (!business) redirect("/fidelity/login");

  const [{ data: txs }, { data: customers }, { data: cashbackCard }] = await Promise.all([
    admin
      .from("cashback_transactions")
      .select("id, type, amount, purchase_amount, balance_after, created_at, end_customers(full_name)")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false })
      .limit(200),
    admin
      .from("end_customers")
      .select("cashback_balance")
      .eq("business_id", business.id),
    admin
      .from("loyalty_cards")
      .select("id")
      .eq("business_id", business.id)
      .eq("card_type", "cashback")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle(),
  ]);

  const transactions = (txs ?? []) as unknown as TxRow[];
  const saldoVigente = (customers ?? []).reduce((s, c) => s + Number(c.cashback_balance ?? 0), 0);
  const clientesConSaldo = (customers ?? []).filter((c) => Number(c.cashback_balance ?? 0) > 0).length;

  const totalAcreditado = transactions
    .filter((t) => t.type === "earned")
    .reduce((s, t) => s + Number(t.amount), 0);
  const totalRedimido = transactions
    .filter((t) => t.type === "redeemed")
    .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);

  return (
    <div className="animate-fade-up space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-paper">Cashback</h1>
        <p className="mt-1 text-mist">Movimientos y saldo de cashback de tus clientes.</p>
      </div>

      {!cashbackCard ? (
        <div className="card text-center py-12">
          <Icon name="cashback" className="mx-auto mb-3 h-10 w-10 text-magenta" />
          <h3 className="text-lg font-bold text-paper">Aún no tienes una tarjeta de cashback</h3>
          <p className="mx-auto mt-2 max-w-md text-mist text-sm">
            Ve a <strong className="text-paper">Mis tarjetas</strong> y crea una tarjeta tipo{" "}
            <strong className="text-paper">Cashback</strong> para empezar a devolver un % de cada compra a tus clientes.
          </p>
        </div>
      ) : (
        <>
          {/* Resumen */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Saldo vigente (todos)" value={formatMXN(saldoVigente)} accent="#16A34A" />
            <Stat label="Clientes con saldo" value={clientesConSaldo.toString()} />
            <Stat
              label="Acumulado / Redimido"
              value={`${formatMXN(totalAcreditado)} / ${formatMXN(totalRedimido)}`}
              small
            />
          </div>

          {/* Historial */}
          <div className="card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-paper">Movimientos recientes</h2>
              <span className="text-xs text-mist">{transactions.length} movimiento{transactions.length !== 1 ? "s" : ""}</span>
            </div>

            {transactions.length === 0 ? (
              <p className="text-sm text-mist py-6 text-center">
                Todavía no hay movimientos. Escanea la tarjeta de un cliente y registra una compra para empezar.
              </p>
            ) : (
              <div className="space-y-1.5">
                {transactions.map((t) => {
                  const meta = TYPE_META[t.type];
                  return (
                    <div key={t.id} className="flex items-center gap-3 rounded-xl bg-near-black px-3 py-2.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-paper truncate">
                          {t.end_customers?.full_name ?? "Cliente"}
                        </p>
                        <p className="text-xs text-mist">
                          {meta.label}
                          {t.type === "earned" && t.purchase_amount != null && (
                            <span> · compra {formatMXN(Number(t.purchase_amount))}</span>
                          )}
                          {" · "}
                          {fecha(t.created_at)}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-sm font-bold tabular-nums ${meta.color}`}>
                          {meta.sign}{formatMXN(Math.abs(Number(t.amount)))}
                        </p>
                        <p className="text-[11px] text-mist tabular-nums">Saldo: {formatMXN(Number(t.balance_after))}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, accent, small }: { label: string; value: string; accent?: string; small?: boolean }) {
  return (
    <div className="card">
      <p className="text-sm text-mist">{label}</p>
      <p className={`mt-2 font-extrabold ${small ? "text-xl" : "text-3xl"}`} style={{ color: accent ?? "var(--paper)" }}>
        {value}
      </p>
    </div>
  );
}
