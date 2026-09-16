import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { enviarPushParaTodos } from "@/lib/push";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const inicio = searchParams.get("inicio");
  const fim = searchParams.get("fim");

  let query = supabaseAdmin.from("vendas").select("*").order("data", { ascending: false });
  if (inicio) query = query.gte("data", `${inicio}T00:00:00`);
  if (fim) query = query.lte("data", `${fim}T23:59:59`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ vendas: data });
}

export async function POST(req) {
  const { itens, total, formaPagamento, caixaId, operador } = await req.json();

  if (!itens?.length) {
    return NextResponse.json({ erro: "Carrinho vazio." }, { status: 400 });
  }

  // confere se o caixa informado está mesmo aberto
  const { data: caixa } = await supabaseAdmin
    .from("caixas").select("id, status").eq("id", caixaId).maybeSingle();
  if (!caixa || caixa.status !== "aberto") {
    return NextResponse.json({ erro: "Não há caixa aberto para esta venda." }, { status: 400 });
  }

  const { data: venda, error: erroVenda } = await supabaseAdmin
    .from("vendas")
    .insert({ itens, total, forma_pagamento: formaPagamento, caixa_id: caixaId, operador })
    .select("*").single();
  if (erroVenda) return NextResponse.json({ erro: erroVenda.message }, { status: 500 });

  // dá baixa no estoque de cada item vendido e junta os que cruzaram o mínimo
  const produtosBaixos = [];
  for (const item of itens) {
    const { data: produto } = await supabaseAdmin
      .from("produtos").select("*").eq("id", item.produtoId).maybeSingle();
    if (!produto) continue;

    const novoEstoque = Math.max(0, +(produto.estoque - item.qtd).toFixed(3));
    await supabaseAdmin.from("produtos").update({ estoque: novoEstoque }).eq("id", produto.id);

    const cruzouOMinimo = produto.estoque > produto.estoque_min && novoEstoque <= produto.estoque_min;
    if (cruzouOMinimo || novoEstoque <= produto.estoque_min) {
      produtosBaixos.push({ nome: produto.nome, estoque: novoEstoque, unidade: produto.unidade });
    }
  }

  if (produtosBaixos.length > 0) {
    const lista = produtosBaixos.map((p) => `${p.nome} (restam ${p.estoque}${p.unidade === "kg" ? "kg" : ""})`).join(", ");
    await enviarPushParaTodos("Estoque baixo na Kaskinha", lista);
  }

  return NextResponse.json({ venda });
}
