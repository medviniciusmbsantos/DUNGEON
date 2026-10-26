// supabase/functions/send_reminders.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webPush from "npm:web-push";

// VAPID keys – set these in Supabase env vars (same as client side)
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
const VAPID_SUBJECT = "mailto:you@example.com"; // adjust if needed

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.warn("VAPID keys not set – push notifications will not work.");
}

webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

// Supabase client – uses service role key for privileged read/write
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_ANON_KEY") ?? "",
);

// Helper: Brazil time (America/Sao_Paulo) in minutes
function getBrazilMinutes(): number {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const hour = parseInt(parts.find(p => p.type === "hour")?.value ?? "0", 10);
  const minute = parseInt(parts.find(p => p.type === "minute")?.value ?? "0", 10);
  return hour * 60 + minute;
}

// Main handler – runs on each request (triggered by cron)
serve(async (_req) => {
  // Pull all active reminders that have a scheduled_time <= current Brazil time
  const brazilMinutes = getBrazilMinutes();

  const { data: reminders, error } = await supabase
    .from("habit_reminders")
    .select("*, push_subscriptions(endpoint, p256dh, auth)")
    .eq("reminder_enabled", true);

  if (error) {
    console.error("Supabase fetch error", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  if (!reminders?.length) {
    return new Response(JSON.stringify({ status: "no reminders" }), { status: 200 });
  }

  for (const reminder of reminders) {
    // Parse scheduled_time (HH:mm)
    const [hStr, mStr] = (reminder.scheduled_time as string).split(":");
    const targetMinutes = parseInt(hStr, 10) * 60 + parseInt(mStr, 10);
    if (brazilMinutes < targetMinutes) continue; // not yet time

    // Habit day filter (if habit)
    if (reminder.quest_type === "habito" && Array.isArray(reminder.habit_days)) {
      const dayOfWeekStr = new Intl.DateTimeFormat("en-US", { timeZone: "America/Sao_Paulo", weekday: "short" }).format(new Date());
      const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      const today = map[dayOfWeekStr] ?? new Date().getDay();
      if (!reminder.habit_days.includes(today)) continue;
    }

    const subs = reminder.push_subscriptions as Array<{ endpoint: string; p256dh: string; auth: string }>;
    const payload = JSON.stringify({
      title: reminder.quest_type === "habito" ? `🔥 Lembrete de Hábito: ${reminder.title}` : `⚔️ Lembrete de Tarefa: ${reminder.title}`,
      body: reminder.description ? `${reminder.description} (${reminder.scheduled_time} - Brasília)` : `É hora de cumprir ${reminder.title}`,
      url: "/",
    });

    for (const sub of subs) {
      try {
        await webPush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload,
        );
      } catch (e) {
        console.warn("Web push failed for subscription", sub.endpoint, e);
      }
    }
  }

  return new Response(JSON.stringify({ status: "sent" }), { status: 200 });
});
