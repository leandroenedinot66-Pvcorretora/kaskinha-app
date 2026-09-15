import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("caixas")
    .select("*")
    .order("aberto_em", { ascending: false });
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ caixas: data });
}
