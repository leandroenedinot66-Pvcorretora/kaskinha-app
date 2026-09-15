import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function DELETE(_req, { params }) {
  const { error } = await supabaseAdmin.from("usuarios").delete().eq("id", params.id);
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
