import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req) {
  const { usuario, senha } = await req.json();

  const { data, error } = await supabaseAdmin
    .from("usuarios")
    .select("id, nome, usuario, senha, papel")
    .ilike("usuario", usuario)
    .maybeSingle();

  if (error || !data || data.senha !== senha) {
    return NextResponse.json({ erro: "Usuário ou senha incorretos." }, { status: 401 });
  }

  const { senha: _s, ...usuarioSeguro } = data;
  return NextResponse.json({ usuario: usuarioSeguro });
}
