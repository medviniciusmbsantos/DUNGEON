// Supabase Edge Function — envia push notifications pendentes
// Runtime: Deno (Supabase Edge Functions)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

// Variáveis de ambiente (definidas em Edge Functions → Secrets)
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY")!;
const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;

// Cliente Supabase com service_role (ignora RLS)
const supabase = createClient(supabaseUrl, serviceRoleKey);

// Configura Web-Push com chaves VAPID
webpush.setVapidDetails(
  "mailto:notifications@dungeonofdiscipline.com",
  vapidPublicKey,
  vapidPrivateKey,
);

Deno.serve(async (_req: Request) => {
  try {
    const now = new Date().toISOString();

    // 1. Busca notificações pendentes cuja data/hora agendada já chegou
    const { data: pending, error: fetchErr } = await supabase
      .from("notifications")
      .select("id, user_id, quest_id, title, body, scheduled_at")
      .is("delivered_at", null)
      .lte("scheduled_at", now);

    if (fetchErr) {
      console.error("Erro ao buscar notificações pendentes:", fetchErr);
      return new Response(JSON.stringify({ error: fetchErr.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!pending || pending.length === 0) {
      return new Response(JSON.stringify({ message: "Nenhuma notificação pendente", sent: 0 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    let sentCount = 0;
    let failedCount = 0;

    // 2. Itera sobre cada notificação pendente
    for (const note of pending) {
      // Busca a subscription de push do usuário
      const { data: sub, error: subErr } = await supabase
        .from("user_subscriptions")
        .select("endpoint, p256dh, auth")
        .eq("user_id", note.user_id)
        .single();

      if (subErr || !sub) {
        console.warn(`Usuário ${note.user_id} não possui push subscription ativa.`);
        // Marca como entregue para não reprocessar indefinidamente
        await supabase
          .from("notifications")
          .update({ delivered_at: new Date().toISOString() })
          .eq("id", note.id);
        continue;
      }

      const payload = JSON.stringify({
        title: note.title || "⚔️ Lembrete de Missão",
        body: note.body || "Hora de progredir no Dungeon of Discipline!",
        icon: "/icon.png",
        badge: "/icon.png",
        tag: `quest-${note.quest_id}`,
        url: "/",
        questId: note.quest_id,
      });

      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payload,
          {
            TTL: 3600, // 1 hora de retenção no servidor push caso o celular esteja offline
            urgency: "high",
          }
        );

        // Marca notificação como entregue
        await supabase
          .from("notifications")
          .update({ delivered_at: new Date().toISOString() })
          .eq("id", note.id);

        sentCount++;
        console.log(`✅ Push enviado com sucesso para notificação ${note.id}`);
      } catch (pushErr: any) {
        failedCount++;
        console.error(`❌ Erro ao enviar push para notificação ${note.id}:`, pushErr);

        // Se a subscription expirou ou foi revogada (HTTP 410 Gone ou 404 Not Found), remove do banco
        if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
          console.log(`🧹 Removendo subscription expirada do usuário ${note.user_id}`);
          await supabase
            .from("user_subscriptions")
            .delete()
            .eq("user_id", note.user_id);
        }

        // Marca a notificação como processada para não travar a fila
        await supabase
          .from("notifications")
          .update({ delivered_at: new Date().toISOString() })
          .eq("id", note.id);
      }
    }

    return new Response(
      JSON.stringify({
        status: "success",
        processed: pending.length,
        sent: sentCount,
        failed: failedCount,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error("Erro fatal na Edge Function:", err);
    return new Response(JSON.stringify({ error: err.message || String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
