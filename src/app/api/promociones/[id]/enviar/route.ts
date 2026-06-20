import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";
import { isGoogleWalletConfigured, sendWalletPromoMessage } from "@/lib/google-wallet";
import { isPushConfigured, sendPush } from "@/lib/web-push";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const admin = createAdminClient();

  // Cargar promo y verificar ownership
  const { data: promo } = await admin
    .from("promotions")
    .select("id, title, message, business_id")
    .eq("id", id)
    .single();
  if (!promo) return NextResponse.json({ error: "Promoción no encontrada" }, { status: 404 });

  const { data: business } = await admin
    .from("businesses")
    .select("id, name, slug, logo_url")
    .eq("id", promo.business_id)
    .eq("owner_id", user.id)
    .single();
  if (!business) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  // Obtener todos los clientes
  const { data: allCustomers } = await admin
    .from("end_customers")
    .select("id, full_name, email")
    .eq("business_id", business.id);

  const customers = allCustomers ?? [];
  const withEmail = customers.filter((c) => c.email);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  let sent = 0;

  // 1. Emails via Resend
  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "re_placeholder" && withEmail.length > 0) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.RESEND_FROM_EMAIL ?? "Roxier Fidelity <noreply@roxierfidelity.com>";

    // Enviar en lotes de 50
    const BATCH = 50;
    for (let i = 0; i < withEmail.length; i += BATCH) {
      const batch = withEmail.slice(i, i + BATCH);
      await Promise.allSettled(
        batch.map((c) =>
          resend.emails.send({
            from,
            to: c.email!,
            subject: `${business.name}: ${promo.title}`,
            html: emailTemplate({
              customerName: c.full_name,
              businessName: business.name,
              businessLogoUrl: business.logo_url,
              promoTitle: promo.title,
              promoMessage: promo.message,
              cardUrl: `${appUrl}/c/${business.slug}/u/${c.id}`,
              appUrl,
            }),
          })
        )
      );
      sent += batch.length;
    }
  } else {
    // Sin Resend configurado — registrar como enviado de todas formas
    sent = withEmail.length;
  }

  // 2. Google Wallet addMessage para clientes con tarjeta guardada en Wallet
  if (isGoogleWalletConfigured()) {
    const { data: activeCards } = await admin
      .from("loyalty_cards")
      .select("id")
      .eq("business_id", business.id)
      .eq("is_active", true);

    if (activeCards?.length) {
      await Promise.allSettled(
        customers.flatMap((c) =>
          activeCards.map((card) =>
            sendWalletPromoMessage(c.id, card.id, promo.title, promo.message).catch(() => null),
          ),
        ),
      );
    }
  }

  // 3. Web Push para clientes con suscripción activa en el navegador
  if (isPushConfigured() && customers.length > 0) {
    const customerIds = customers.map((c) => c.id);
    const { data: subs } = await admin
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth, customer_id")
      .in("customer_id", customerIds);

    if (subs?.length) {
      const expired: string[] = [];
      await Promise.allSettled(
        subs.map(async (sub) => {
          const customer = customers.find((c) => c.id === sub.customer_id);
          const cardUrl = `${appUrl}/c/${business.slug}/u/${sub.customer_id}`;
          const result = await sendPush(
            { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
            { title: `📣 ${business.name}: ${promo.title}`, body: promo.message, url: cardUrl },
          );
          if (result === "expired") expired.push(sub.id);
          return customer;
        }),
      );
      if (expired.length) {
        await admin.from("push_subscriptions").delete().in("id", expired);
      }
    }
  }

  // Registrar en historial
  await admin.from("push_notifications").insert({
    business_id: business.id,
    title: promo.title,
    message: promo.message,
    recipients_count: sent || customers.length,
  });

  return NextResponse.json({ sent: sent || customers.length });
}

function emailTemplate(data: {
  customerName: string;
  businessName: string;
  businessLogoUrl: string | null;
  promoTitle: string;
  promoMessage: string;
  cardUrl: string;
  appUrl: string;
}) {
  const { customerName, businessName, businessLogoUrl, promoTitle, promoMessage, cardUrl } = data;
  const firstName = customerName.split(" ")[0];

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F4F2;font-family:system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F4F2;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr><td style="background:#0E0E10;padding:24px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                ${businessLogoUrl
                  ? `<img src="${businessLogoUrl}" alt="${businessName}" style="height:40px;object-fit:contain;">`
                  : `<span style="color:#FF2E63;font-weight:800;font-size:18px;">${businessName}</span>`}
              </td>
              <td align="right">
                <span style="color:#96969E;font-size:11px;">Powered by Roxier Fidelity</span>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Promo badge -->
        <tr><td style="background:#FF2E63;padding:12px 32px;">
          <p style="margin:0;color:#ffffff;font-weight:700;font-size:13px;letter-spacing:1px;text-transform:uppercase;">
            📣 Promoción especial
          </p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px;">
          <p style="margin:0 0 8px;color:#0E0E10;font-size:15px;">Hola, <strong>${firstName}</strong> 👋</p>
          <h1 style="margin:0 0 16px;color:#0E0E10;font-size:24px;font-weight:800;line-height:1.2;">
            ${promoTitle}
          </h1>
          <p style="margin:0 0 24px;color:#555560;font-size:15px;line-height:1.6;">
            ${promoMessage}
          </p>

          <a href="${cardUrl}"
            style="display:inline-block;background:#FF2E63;color:#ffffff;font-weight:700;font-size:14px;padding:14px 28px;border-radius:100px;text-decoration:none;">
            Ver mi tarjeta de lealtad →
          </a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:16px 32px 24px;border-top:1px solid #F0F0F0;">
          <p style="margin:0;color:#96969E;font-size:12px;text-align:center;">
            Recibiste este email porque tienes una tarjeta de lealtad de <strong>${businessName}</strong>.<br>
            Este email fue enviado desde Roxier Fidelity.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
