import { assetUrl } from '@/lib/assets';
import { supabase } from './supabase';
import type { Quest } from '@/types/game';

const GUEST_STORAGE_KEY = 'dod_guest_push_user_id';

/**
 * Utility to convert VAPID public key string to Uint8Array for PushManager
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Get current user ID (Supabase Auth ID or persistent Guest Device ID)
 */
export async function getEffectiveUserId(): Promise<string> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.id) {
      return user.id;
    }
  } catch (e) {
    console.warn('Erro ao obter usuário autenticado:', e);
  }

  let guestId = localStorage.getItem(GUEST_STORAGE_KEY);
  if (!guestId) {
    guestId = 'guest_' + (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2));
    localStorage.setItem(GUEST_STORAGE_KEY, guestId);
  }
  return guestId;
}

/**
 * Calculate next scheduled ISO string in UTC for a specific HH:mm in America/Sao_Paulo (UTC-3)
 */
export function getNextScheduledUTC(scheduledTime: string): string {
  const [hStr, mStr] = (scheduledTime || '09:00').split(':');
  const targetH = parseInt(hStr, 10) || 9;
  const targetM = parseInt(mStr, 10) || 0;

  // Format current date in America/Sao_Paulo (YYYY-MM-DD)
  const now = new Date();
  const brasilDateFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' });
  const brasilDateStr = brasilDateFormatter.format(now); // "YYYY-MM-DD"

  // Get current hour & minute in Brazil
  const brasilTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const timeParts = brasilTimeFormatter.formatToParts(now);
  const currentH = parseInt(timeParts.find(p => p.type === 'hour')?.value || '0', 10);
  const currentM = parseInt(timeParts.find(p => p.type === 'minute')?.value || '0', 10);

  const currentTotal = currentH * 60 + currentM;
  const targetTotal = targetH * 60 + targetM;

  // Create Date object representing target time in Brazil
  const targetIsoStringToday = `${brasilDateStr}T${String(targetH).padStart(2, '0')}:${String(targetM).padStart(2, '0')}:00-03:00`;
  const targetDate = new Date(targetIsoStringToday);

  // If time has ALREADY strictly passed today in Brazil, schedule for tomorrow
  if (currentTotal > targetTotal) {
    targetDate.setDate(targetDate.getDate() + 1);
  }

  return targetDate.toISOString();
}

/**
 * Subscribe user browser/device to Web Push Notifications & save to Supabase
 */
export async function subscribeUserToPush(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Web Push não é suportado neste navegador.');
    return null;
  }

  try {
    // 1. Get or register Service Worker
    let registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      registration = await navigator.serviceWorker.register(assetUrl('sw.js'));
    }
    await navigator.serviceWorker.ready;

    // 2. Request Notification Permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Permissão de notificação negada.');
      return null;
    }

    // 3. Obtain push subscription
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      const DEFAULT_VAPID_PUBLIC_KEY = 'BLB9di3E6ZSB9kh10qK9ZLzHE67xVEtbZnKfc8SUQ8Z35TvDlvr6FfP7kwZMv9XkmlThwvQha_0wuV5zxb24E9w';
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || DEFAULT_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.error('VITE_VAPID_PUBLIC_KEY não configurada no .env');
        return null;
      }
      const convertedKey = urlBase64ToUint8Array(vapidPublicKey);

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey as unknown as BufferSource,
      });
    }

    // 4. Save PushSubscription to Supabase
    const userId = await getEffectiveUserId();
    const subJson = subscription.toJSON();
    const endpoint = subJson.endpoint;
    const p256dh = subJson.keys?.p256dh;
    const auth = subJson.keys?.auth;

    if (endpoint && p256dh && auth) {
      const { error } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: userId,
          endpoint,
          p256dh,
          auth,
        }, { onConflict: 'user_id' });

      if (error) {
        console.error('Erro ao salvar subscription no Supabase:', error.message);
      } else {
        console.log(`✅ Push subscription salva no Supabase para [${userId}].`);
      }
    }

    return subscription;
  } catch (error) {
    console.error('Erro ao inscrever usuário no Web Push:', error);
    return null;
  }
}

/**
 * Unsubscribe user from Web Push Notifications & remove from Supabase
 */
export async function unsubscribeUserFromPush(): Promise<boolean> {
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
      }
    }

    const userId = await getEffectiveUserId();
    await supabase
      .from('user_subscriptions')
      .delete()
      .eq('user_id', userId);
    return true;
  } catch (error) {
    console.error('Erro ao cancelar inscrição de push:', error);
    return false;
  }
}

/**
 * Sync single quest reminder to Supabase notifications table
 */
export async function syncQuestReminderToSupabase(quest: Quest, isDelete = false) {
  try {
    const userId = await getEffectiveUserId();

    // Delete existing pending notifications for this quest
    await supabase
      .from('notifications')
      .delete()
      .eq('quest_id', quest.id)
      .is('delivered_at', null);

    if (isDelete || !quest.reminderEnabled) {
      return;
    }

    const scheduledTime = quest.scheduledTime || '09:00';
    const scheduledAtUTC = getNextScheduledUTC(scheduledTime);

    const titleText = quest.type === 'habito'
      ? `🔥 Lembrete de Hábito: ${quest.title}`
      : `⚔️ Lembrete de Tarefa: ${quest.title}`;

    const bodyText = quest.description
      ? `${quest.description} (${scheduledTime} - Brasília)`
      : `Está na hora de cumprir sua missão no Dungeon of Discipline! (${scheduledTime})`;

    const { error } = await supabase
      .from('notifications')
      .insert({
        quest_id: quest.id,
        user_id: userId,
        title: titleText,
        body: bodyText,
        scheduled_at: scheduledAtUTC,
      });

    if (error) {
      console.error('Erro ao agendar notificação no Supabase:', error.message);
    } else {
      console.log(`✅ Lembrete da quest "${quest.title}" agendado no Supabase para ${scheduledTime}`);
    }
  } catch (err) {
    console.error('Erro ao sincronizar lembrete com o Supabase:', err);
  }
}

/**
 * Sync all active quests with reminders to Supabase
 */
export async function syncAllQuestsToSupabase(allQuests: Quest[]) {
  try {
    const userId = await getEffectiveUserId();
    const activeWithReminder = (allQuests || []).filter(q => q.reminderEnabled && !q.completed);
    
    // Clear old pending notifications for this user
    await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .is('delivered_at', null);

    if (activeWithReminder.length === 0) return;

    const records = activeWithReminder.map(quest => {
      const scheduledTime = quest.scheduledTime || '09:00';
      const scheduledAtUTC = getNextScheduledUTC(scheduledTime);
      const titleText = quest.type === 'habito'
        ? `🔥 Lembrete de Hábito: ${quest.title}`
        : `⚔️ Lembrete de Tarefa: ${quest.title}`;
      const bodyText = quest.description
        ? `${quest.description} (${scheduledTime} - Brasília)`
        : `Está na hora de cumprir sua missão no Dungeon of Discipline! (${scheduledTime})`;

      return {
        quest_id: quest.id,
        user_id: userId,
        title: titleText,
        body: bodyText,
        scheduled_at: scheduledAtUTC,
      };
    });

    const { error } = await supabase.from('notifications').insert(records);
    if (error) {
      console.error('Erro ao sincronizar lote de notificações:', error.message);
    } else {
      console.log(`✅ ${records.length} lembretes sincronizados com o Supabase.`);
    }
  } catch (err) {
    console.error('Erro no syncAllQuestsToSupabase:', err);
  }
}
