import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req) {
  const { valorInicial, abertoPor } = await req.json();

  const { data: existente } = await supabaseAdmin
    .from("caixas").select("id").eq("status", "aberto").maybeSingle();
  if (existente) {
    return NextResponse.json({ erro: "Já existe um caixa aberto." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("caixas")
    .insert({ status: "aberto", valor_inicial: Number(valorInicial) || 0, aberto_por: abertoPor })
    .select("*").single();
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ caixa: data });
}
