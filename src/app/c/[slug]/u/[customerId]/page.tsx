import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { CustomerCardClient } from "./CustomerCardClient";

export default async function CustomerCardPage({
  params,
}: {
  params: Promise<{ slug: string; customerId: string }>;
}) {
  const { slug, customerId } = await params;
  const supabase = createAdminClient();

  const { data: customer } = await supabase
    .from("end_customers")
    .select("id, full_name, current_stamps, total_visits, rewards_redeemed, business_id")
    .eq("id", customerId)
    .single();

  if (!customer) notFound();

  const { data: business } = await supabase
    .from("businesses")
    .select("name, slug")
    .eq("id", customer.business_id)
    .single();

  if (!business || business.slug !== slug) notFound();

  const { data: card } = await supabase
    .from("loyalty_cards")
    .select("title, stamps_required, reward_text, color_primary, color_background, text_color, logo_url")
    .eq("business_id", customer.business_id)
    .maybeSingle();

  const cardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/c/${slug}/u/${customerId}`;

  return (
    <CustomerCardClient
      customer={customer}
      card={card}
      business={business}
      cardUrl={cardUrl}
    />
  );
}
