import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { CustomerCardClient } from "./CustomerCardClient";
import { isGoogleWalletConfigured } from "@/lib/google-wallet";
import { isAppleWalletConfigured } from "@/lib/apple-wallet";

export default async function CustomerCardPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; customerId: string }>;
  searchParams: Promise<{ card?: string }>;
}) {
  const { slug, customerId } = await params;
  const { card: cardId } = await searchParams;

  const supabase = createAdminClient();

  const { data: customer } = await supabase
    .from("end_customers")
    .select("id, full_name, current_stamps, total_visits, rewards_redeemed, cashback_balance, business_id")
    .eq("id", customerId)
    .single();

  if (!customer) notFound();

  const { data: business } = await supabase
    .from("businesses")
    .select("name, slug")
    .eq("id", customer.business_id)
    .single();

  if (!business || business.slug !== slug) notFound();

  let card = null;
  if (cardId) {
    const { data } = await supabase
      .from("loyalty_cards")
      .select("id, title, stamps_required, reward_text, color_primary, color_background, text_color, logo_url, bg_type, color_gradient_end, gradient_direction, bg_image_url, bg_image_position, stamp_icon, card_type, coupon_value, max_uses, cashback_percent")
      .eq("id", cardId)
      .eq("business_id", customer.business_id)
      .single();
    card = data;
  }
  if (!card) {
    const { data } = await supabase
      .from("loyalty_cards")
      .select("id, title, stamps_required, reward_text, color_primary, color_background, text_color, logo_url, bg_type, color_gradient_end, gradient_direction, bg_image_url, bg_image_position, stamp_icon, card_type, coupon_value, max_uses, cashback_percent")
      .eq("business_id", customer.business_id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    card = data;
  }

  // Siempre incluir cardId en el QR aunque la URL no lo traiga — si el cliente
  // abre la tarjeta sin ?card= (bookmark, WhatsApp sin param), el QR debe seguir
  // teniendo el card correcto para que el scanner pueda enviar el push de Apple Wallet.
  const resolvedCardId = cardId ?? (card as { id?: string } | null)?.id ?? null;
  const cardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/c/${slug}/u/${customerId}${resolvedCardId ? `?card=${resolvedCardId}` : ""}`;

  return (
    <CustomerCardClient
      customer={customer}
      card={card}
      business={business}
      cardUrl={cardUrl}
      cardId={resolvedCardId ?? undefined}
      googleWalletEnabled={isGoogleWalletConfigured()}
      appleWalletEnabled={isAppleWalletConfigured()}
      vapidPublicKey={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY}
    />
  );
}
