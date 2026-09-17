import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const BUCKET = "produtos-fotos";

export async function POST(req) {
  const { dataUrl } = await req.json();
  if (!dataUrl || !dataUrl.startsWith("data:image")) {
    return NextResponse.json({ erro: "Imagem inválida." }, { status: 400 });
  }

  const base64 = dataUrl.split(",")[1];
  const buffer = Buffer.from(base64, "base64");
  const nomeArquivo = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(nomeArquivo, buffer, { contentType: "image/jpeg", upsert: false });

  if (error) {
    return NextResponse.json(
      { erro: `Não foi possível enviar a foto (${error.message}). Confirme se o bucket "${BUCKET}" existe no Supabase Storage e está público.` },
      { status: 500 }
    );
  }

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(nomeArquivo);
  return NextResponse.json({ url: data.publicUrl });
}
