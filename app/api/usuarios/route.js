import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("usuarios")
    .select("id, nome, usuario, papel")
    .order("criado_em", { ascending: true });
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ usuarios: data });
}

export async function POST(req) {
  const body = await req.json();
  const nome = (body.nome || "").trim();
  const usuario = (body.usuario || "").trim();
  const senha = (body.senha || "").trim();
  const papel = body.papel;
  if (!nome || !usuario || !senha) {
    return NextResponse.json({ erro: "Preencha nome, usuário e senha." }, { status: 400 });
  }
  const { data, error } = await supabaseAdmin
    .from("usuarios")
    .insert({ nome, usuario, senha, papel: papel === "admin" ? "admin" : "funcionario" })
    .select("id, nome, usuario, papel")
    .single();
  if (error) {
    const msg = error.code === "23505" ? "Já existe um usuário com esse login." : error.message;
    return NextResponse.json({ erro: msg }, { status: 400 });
  }
  return NextResponse.json({ usuario: data });
}
