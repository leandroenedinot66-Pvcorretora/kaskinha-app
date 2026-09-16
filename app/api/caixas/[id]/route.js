import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Exclui um caixa (aberto ou fechado). As vendas que estavam ligadas a
// esse caixa NÃO são apagadas — só perdem o vínculo com o caixa, pra
// nunca perder histórico de vendas por engano.
export async function DELETE(req, { params }) {
  const { id } = params;
  await supabaseAdmin.from("vendas").update({ caixa_id: null }).eq("caixa_id", id);
  const { error } = await supabaseAdmin.from("caixas").delete().eq("id", id);
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
