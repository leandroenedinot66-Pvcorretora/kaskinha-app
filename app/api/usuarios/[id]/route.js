import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function DELETE(_req, { params }) {
  const { data: alvo } = await supabaseAdmin.from("usuarios").select("papel").eq("id", params.id).maybeSingle();

  if (alvo?.papel === "admin") {
    const { count } = await supabaseAdmin
      .from("usuarios")
      .select("id", { count: "exact", head: true })
      .eq("papel", "admin");
    if ((count || 0) <= 1) {
      return NextResponse.json(
        { erro: "Não é possível excluir o único administrador restante. Crie outro administrador antes de excluir este." },
        { status: 400 }
      );
    }
  }

  const { error } = await supabaseAdmin.from("usuarios").delete().eq("id", params.id);
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
