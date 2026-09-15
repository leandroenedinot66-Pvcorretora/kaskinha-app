import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req) {
  const { caixaId, valorInformado, fechadoPor } = await req.json();

  const { data, error } = await supabaseAdmin
    .from("caixas")
    .update({
      status: "fechado",
      valor_informado: Number(valorInformado) || 0,
      fechado_por: fechadoPor,
      fechado_em: new Date().toISOString(),
    })
    .eq("id", caixaId)
    .select("*").single();
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ caixa: data });
}
