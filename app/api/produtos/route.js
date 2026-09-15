import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("produtos")
    .select("*")
    .order("nome", { ascending: true });
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ produtos: data });
}

export async function POST(req) {
  const body = await req.json();
  const { nome, categoria, unidade, preco, estoque, estoqueMin, imagem } = body;
  if (!nome || preco === undefined) {
    return NextResponse.json({ erro: "Preencha nome e preço." }, { status: 400 });
  }
  const { data, error } = await supabaseAdmin
    .from("produtos")
    .insert({
      nome, categoria: categoria || "Sorvetes", unidade: unidade || "un",
      preco: Number(preco) || 0, estoque: Number(estoque) || 0,
      estoque_min: Number(estoqueMin) || 0, imagem: imagem || null,
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ produto: data });
}
