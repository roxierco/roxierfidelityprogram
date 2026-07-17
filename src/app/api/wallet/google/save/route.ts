import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  isGoogleWalletConfigured,
  upsertLoyaltyClass,
  upsertLoyaltyObject,
  upsertCashbackClass,
  upsertCashbackObject,
  generateSaveLink,
} from "@/lib/google-wallet";

export async function POST(req: NextRequest) {
  if (!isGoogleWalletConfigured()) {
    return NextResponse.json({ error: "Google Wallet no está configurado" }, { status: 503 });
  }

  const { customerId, cardId } = await req.json();

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!customerId || !cardId || !uuidRegex.test(customerId) || !uuidRegex.test(cardId)) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: customer } = await admin
    .from("end_customers")
    .select("id, full_name, current_stamps, cashback_balance, business_id")
    .eq("id", customerId)
    .single();

  if (!customer) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });

  const { data: business } = await admin
    .from("businesses")
    .select("name, slug")
    .eq("id", customer.business_id)
    .single();

  if (!business) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { data: card } = await admin
    .from("loyalty_cards")
    .select("id, title, color_primary, color_background, logo_url, stamps_required, reward_text, card_type")
    .eq("id", cardId)
    .eq("business_id", customer.business_id)
    .single();

  if (!card) return NextResponse.json({ error: "Tarjeta no encontrada" }, { status: 404 });

  const cardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/c/${business.slug}/u/${customerId}?card=${cardId}`;

  try {
    let objectId: string | undefined;

    if (card.card_type === "cashback") {
      await upsertCashbackClass(card, business.name);
      objectId = await upsertCashbackObject({
        customerId,
        cardId,
        customerName: customer.full_name,
        balance: Number(customer.cashback_balance ?? 0),
        cardUrl,
      });
    } else {
      await upsertLoyaltyClass(card, business.name);
      objectId = await upsertLoyaltyObject({
        customerId,
        cardId,
        customerName: customer.full_name,
        currentStamps: customer.current_stamps,
        stampsRequired: card.stamps_required,
        rewardText: card.reward_text,
        cardUrl,
      });
    }

    const saveUrl = generateSaveLink(objectId!);
    return NextResponse.json({ saveUrl });
  } catch (err) {
    console.error("Google Wallet error:", err);
    return NextResponse.json({ error: "Error al generar el pase" }, { status: 500 });
  }
}
