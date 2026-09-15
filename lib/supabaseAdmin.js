import { createClient } from "@supabase/supabase-js";

// Este cliente só roda no servidor (dentro das rotas /app/api/*).
// Usa a SERVICE ROLE KEY, que tem acesso total ao banco — por isso
// NUNCA deve ser exposta ao navegador (não usar NEXT_PUBLIC_ aqui).
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);
