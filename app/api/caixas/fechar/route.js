import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req) {
  const { caixaId, valorInformado, fechadoPor } = await req.json();
  if (!caixaId) return NextResponse.json({ erro: "Nenhum caixa selecionado." }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("caixas")
    .update({
      status: "fechado",
      valor_informado: Number(valorInformado) || 0,
      fechado_por: fechadoPor,
      fechado_em: new Date().toISOString(),
    })
    .eq("id", caixaId)
    .eq("status", "aberto")
    .select("*")
    .maybeSingle();

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  if (!data) {
    return NextResponse.json(
      { erro: "Esse caixa já não está mais aberto — pode já ter sido fechado ou excluído em outro aparelho. A tela vai atualizar sozinha." },
      { status: 404 }
    );
  }
  return NextResponse.json({ caixa: data });
}
