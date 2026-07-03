import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAppleWalletConfigured, generateLoyaltyPass, verifyAuthToken } from "@/lib/apple-wallet";

// Apple descarga el pass actualizado tras recibir una notificación push
export async function GET(req: NextRequest, { params }: { params: Promise<{ passTypeId: string; serialNumber: string }> }) {
  const { serialNumber } = await params;

  const auth = req.headers.get("authorization")?.replace("ApplePass ", "");

  // serialNumber = "{customerId}-{cardId}", cada UUID tiene 4 guiones internos → separador es el 5to guión
  const dashIdx = serialNumber.indexOf("-", serialNumber.indexOf("-", serialNumber.indexOf("-", serialNumber.indexOf("-", serialNumber.indexOf("-") + 1) + 1) + 1) + 1) + 1;
  const customerId = serialNumber.slice(0, dashIdx - 1);
  const cardId = serialNumber.slice(dashIdx);

  if (!auth || !verifyAuthToken(auth, customerId, cardId)) {
    return new NextResponse(null, { status: 401 });
  }

  if (!isAppleWalletConfigured()) return new NextResponse(null, { status: 503 });

  const admin = createAdminClient();

  const [{ data: customer }, { data: card }] = await Promise.all([
    admin.from("end_customers").select("id, full_name, current_stamps, business_id").eq("id", customerId).single(),
    admin.from("loyalty_cards").select("id, title, stamps_required, reward_text, color_primary, color_background, text_color, apple_wallet_strip_url").eq("id", cardId).single(),
  ]);

  if (!customer || !card) return new NextResponse(null, { status: 404 });

  const { data: business } = await admin.from("businesses").select("name, slug, logo_url").eq("id", customer.business_id).single();
  if (!business) return new NextResponse(null, { status: 404 });

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
      logoUrl: business.logo_url ?? null,
      stripUrl: card.apple_wallet_strip_url ?? null,
    });

    return new NextResponse(new Uint8Array(passBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Last-Modified": new Date().toUTCString(),
      },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
