import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req) {
  const sub = await req.json();
  if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
    return NextResponse.json({ erro: "Inscrição inválida." }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("push_subscriptions")
    .upsert(
      { endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth },
      { onConflict: "endpoint" }
    );

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
