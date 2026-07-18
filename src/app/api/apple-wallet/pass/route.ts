import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAppleWalletConfigured, generateLoyaltyPass } from "@/lib/apple-wallet";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest) {
  if (!isAppleWalletConfigured()) {
    return new NextResponse("Apple Wallet not configured", { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get("customerId");
  const cardId = searchParams.get("cardId");

  if (!customerId || !cardId || !UUID.test(customerId) || !UUID.test(cardId)) {
    return new NextResponse("Invalid parameters", { status: 400 });
  }

  const admin = createAdminClient();

  const { data: customer } = await admin
    .from("end_customers")
    .select("id, full_name, current_stamps, cashback_balance, business_id")
    .eq("id", customerId)
    .single();

  if (!customer) return new NextResponse("Not found", { status: 404 });

  const [{ data: card }, { data: business }] = await Promise.all([
    admin
      .from("loyalty_cards")
      .select("title, stamps_required, reward_text, color_primary, color_background, text_color, logo_url, apple_wallet_strip_url, card_type, coupon_value, cashback_percent")
      .eq("id", cardId)
      .eq("business_id", customer.business_id)
      .eq("is_active", true)
      .single(),
    admin
      .from("businesses")
      .select("name, slug, logo_url")
      .eq("id", customer.business_id)
      .single(),
  ]);

  if (!card || !business) return new NextResponse("Not found", { status: 404 });

  const cardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/c/${business.slug}/u/${customerId}?card=${cardId}`;

  try {
    const passBuffer = await generateLoyaltyPass({
      customerId,
      cardId,
      customerName: customer.full_name,
      businessName: business.name,
      cardTitle: card.title,
      currentStamps: customer.current_stamps,
      stampsRequired: card.stamps_required,
      rewardText: card.reward_text,
      cardUrl,
      colorBackground: card.color_background ?? "#14141e",
      colorPrimary: card.color_primary ?? "#e100ff",
      colorText: card.text_color ?? "#ffffff",
      // El logo de la tarjeta manda; si no tiene, cae al logo del negocio.
      // Si ninguno tiene logo, el pase simplemente no muestra logo (diseño sin logo).
      logoUrl: card.logo_url ?? business.logo_url ?? null,
      stripUrl: card.apple_wallet_strip_url ?? null,
      cardType: card.card_type ?? "sellos",
      cashbackBalance: Number(customer.cashback_balance ?? 0),
      cashbackPercent: Number(card.cashback_percent ?? 0),
      couponValue: card.coupon_value ?? null,
    });

    return new NextResponse(new Uint8Array(passBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Content-Disposition": 'attachment; filename="loyalty.pkpass"',
        "Content-Length": String(passBuffer.length),
      },
    });
  } catch (err) {
    console.error("[apple-wallet] pass generation error:", err);
    return new NextResponse("Failed to generate pass", { status: 500 });
  }
}
