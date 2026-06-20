import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { businessId, title, message } = await req.json();

  if (!businessId || !title?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
  }
  if (title.length > 80 || message.length > 500) {
    return NextResponse.json({ error: "Texto demasiado largo" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Verificar ownership
  const { data: biz } = await admin
    .from("businesses")
    .select("id")
    .eq("id", businessId)
    .eq("owner_id", user.id)
    .single();
  if (!biz) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { data: promo, error } = await admin
    .from("promotions")
    .insert({ business_id: businessId, title: title.trim(), message: message.trim() })
    .select("id, title, message, is_active, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ promo });
}
