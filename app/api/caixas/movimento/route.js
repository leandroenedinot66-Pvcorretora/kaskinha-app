import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("movimentos_caixa").select("*").order("data", { ascending: false });
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ movimentos: data });
}

export async function POST(req) {
  const body = await req.json();
  const caixaId = body.caixaId;
  const tipo = body.tipo;
  const valor = Number(body.valor) || 0;
  const motivo = (body.motivo || "").trim();
  const usuarioLogin = (body.usuario || "").trim();
  const senha = (body.senha || "").trim();

  if (!caixaId || !["sangria", "reforco"].includes(tipo) || valor <= 0) {
    return NextResponse.json({ erro: "Dados inválidos para o movimento de caixa." }, { status: 400 });
  }

  // Reautentica: só confirma o movimento se a senha do administrador
  // informada agora bater — mesmo que o funcionário esteja usando o
  // aparelho já logado, ele não sabe essa senha.
  const { data: admin, error: erroAdmin } = await supabaseAdmin
    .from("usuarios")
    .select("id, nome, senha, papel")
    .ilike("usuario", usuarioLogin)
    .maybeSingle();

  if (erroAdmin || !admin || admin.papel !== "admin" || admin.senha !== senha) {
    return NextResponse.json({ erro: "Senha de administrador incorreta." }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("movimentos_caixa")
    .insert({ caixa_id: caixaId, tipo, valor, motivo, feito_por: admin.nome })
    .select("*")
    .single();

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ movimento: data });
}
