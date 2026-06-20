import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isGoogleWalletConfigured, upsertLoyaltyClass } from "@/lib/google-wallet";

export async function POST(req: NextRequest) {
  if (!isGoogleWalletConfigured()) {
    return NextResponse.json({ ok: true }); // silencioso si no está configurado
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { cardId } = await req.json();
  if (!cardId) return NextResponse.json({ error: "Falta cardId" }, { status: 400 });

  const admin = createAdminClient();

  const { data: card } = await admin
    .from("loyalty_cards")
    .select("id, title, color_primary, color_background, logo_url, stamps_required, reward_text, business_id")
    .eq("id", cardId)
    .single();

  if (!card) return NextResponse.json({ error: "Tarjeta no encontrada" }, { status: 404 });

  const { data: business } = await admin
    .from("businesses")
    .select("name")
    .eq("id", card.business_id)
    .eq("owner_id", user.id)
    .single();

  if (!business) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  try {
    await upsertLoyaltyClass(card, business.name);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Google Wallet sync-class error:", err);
    return NextResponse.json({ error: "Error al sincronizar" }, { status: 500 });
  }
}
