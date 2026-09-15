import webpush from "web-push";
import { supabaseAdmin } from "./supabaseAdmin";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:contato@exemplo.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Envia uma notificação push para todos os celulares/navegadores inscritos.
export async function enviarPushParaTodos(titulo, corpo) {
  const { data: inscricoes, error } = await supabaseAdmin
    .from("push_subscriptions")
    .select("*");

  if (error || !inscricoes?.length) return;

  const payload = JSON.stringify({ title: titulo, body: corpo });

  await Promise.all(
    inscricoes.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload
        );
      } catch (err) {
        // inscrição expirada/inválida (usuário desinstalou, trocou de navegador etc.)
        if (err.statusCode === 404 || err.statusCode === 410) {
          await supabaseAdmin.from("push_subscriptions").delete().eq("id", sub.id);
        }
      }
    })
  );
}
