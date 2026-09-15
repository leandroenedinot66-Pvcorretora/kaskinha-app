import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function PUT(req, { params }) {
  const body = await req.json();
  const campos = {};
  if (body.nome !== undefined) campos.nome = body.nome;
  if (body.categoria !== undefined) campos.categoria = body.categoria;
  if (body.unidade !== undefined) campos.unidade = body.unidade;
  if (body.preco !== undefined) campos.preco = Number(body.preco);
  if (body.estoque !== undefined) campos.estoque = Number(body.estoque);
  if (body.estoqueMin !== undefined) campos.estoque_min = Number(body.estoqueMin);
  if (body.imagem !== undefined) campos.imagem = body.imagem;

  const { data, error } = await supabaseAdmin
    .from("produtos").update(campos).eq("id", params.id).select("*").single();
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ produto: data });
}

export async function DELETE(_req, { params }) {
  const { error } = await supabaseAdmin.from("produtos").delete().eq("id", params.id);
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
