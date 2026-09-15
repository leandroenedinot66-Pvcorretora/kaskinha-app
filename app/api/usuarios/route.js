import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
 
export async function POST(req) {
  const { usuario, senha } = await req.json();
 
  const { data, error } = await supabaseAdmin
    .from("usuarios")
    .select("id, nome, usuario, senha, papel")
    .ilike("usuario", usuario)
    .maybeSingle();
 
  console.log("DEBUG login — usuario recebido:", JSON.stringify(usuario));
  console.log("DEBUG login — erro do supabase:", error ? JSON.stringify(error) : "nenhum");
  console.log("DEBUG login — encontrou registro?:", data ? "sim" : "não");
  if (data) {
    console.log("DEBUG login — senha bate?:", data.senha === senha, "| senha banco:", JSON.stringify(data.senha), "| senha enviada:", JSON.stringify(senha));
  }
 
  if (error || !data || data.senha !== senha) {
    return NextResponse.json({ erro: "Usuário ou senha incorretos." }, { status: 401 });
  }
 
  const { senha: _s, ...usuarioSeguro } = data;
  return NextResponse.json({ usuario: usuarioSeguro });
}
