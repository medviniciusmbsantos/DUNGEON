import { assetUrl } from '@/lib/assets';
import { useEffect, useState, useCallback } from 'react';
import type { GameState, Quest, DayOfWeek } from '@/types/game';
import { 
  subscribeUserToPush, 
  unsubscribeUserFromPush, 
  syncAllQuestsToSupabase 
} from '@/lib/pushNotifications';

const NOTIFIED_STORAGE_KEY = 'dod_notified_quests_cache';

/**
 * Request notification permission and subscribe device to Web Push
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('Este navegador não suporta notificações.');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await subscribeUserToPush();
    }
    return permission;
  } catch (error) {
    console.error('Erro ao solicitar permissão de notificação:', error);
    return 'denied';
  }
}

/**
 * Get current Notification permission status
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Robust Brazil Date & Time Extraction (America/Sao_Paulo timezone)
 */
function getBrazilDateTime() {
  const now = new Date();

  const dateFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' });
  const dateStr = dateFormatter.format(now);

  const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  
  const timeParts = timeFormatter.formatToParts(now);
  const hoursStr = timeParts.find(p => p.type === 'hour')?.value.padStart(2, '0') || '00';
  const minutesStr = timeParts.find(p => p.type === 'minute')?.value.padStart(2, '0') || '00';
  const timeStr = `${hoursStr}:${minutesStr}`;

  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  const dayOfWeekStr = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', weekday: 'short' }).format(now);
  const dayMap: Record<string, DayOfWeek> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const dayOfWeek = dayMap[dayOfWeekStr] ?? (now.getDay() as DayOfWeek);

  return { dateStr, timeStr, dayOfWeek, hours, minutes };
}

function getNotifiedCache(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(NOTIFIED_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function markAsNotified(key: string) {
  try {
    const cache = getNotifiedCache();
    cache[key] = true;
    localStorage.setItem(NOTIFIED_STORAGE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.error('Erro ao salvar cache de notificações', e);
  }
}

/**
 * Dispatch notification in foreground using ServiceWorker or Notification API
 */
async function sendForegroundNotification(title: string, body: string, tag: string) {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration && 'showNotification' in registration) {
        await registration.showNotification(title, {
          body,
          icon: assetUrl('icon.png'),
          badge: assetUrl('icon.png'),
          tag,
          vibrate: [200, 100, 200],
          renotify: true,
          data: { url: new URL(import.meta.env.BASE_URL, window.location.href).href },
        } as any);
        return;
      }
    } catch (err) {
      console.warn('Falha no ServiceWorker.showNotification, tentando fallback:', err);
    }
  }

  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        body,
        icon: assetUrl('icon.png'),
        tag,
      });
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (err) {
      console.error('Falha ao disparar Notification:', err);
    }
  }
}

export function useNotificationScheduler(quests?: GameState['quests']) {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(getNotificationPermission);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const requestPermission = useCallback(async () => {
    setIsSubscribing(true);
    try {
      const result = await requestNotificationPermission();
      setPermission(result);
      if (result === 'granted' && quests) {
        const allQuests: Quest[] = [
          ...(quests.habito || []),
          ...(quests.diaria || []),
          ...(quests.meta || []),
        ];
        await syncAllQuestsToSupabase(allQuests);
      }
      return result;
    } finally {
      setIsSubscribing(false);
    }
  }, [quests]);

  const toggleNotifications = useCallback(async (enabled: boolean) => {
    setIsSubscribing(true);
    try {
      if (enabled) {
        const result = await requestPermission();
        return result === 'granted';
      } else {
        await unsubscribeUserFromPush();
        return false;
      }
    } finally {
      setIsSubscribing(false);
    }
  }, [requestPermission]);

  // Foreground checker loop (instant triggers when app is open)
  useEffect(() => {
    if (!quests) return;
    if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') return;

    const checkAndSendNotifications = async () => {
      const { dateStr, dayOfWeek, hours, minutes } = getBrazilDateTime();
      const currentTotalMinutes = hours * 60 + minutes;
      const notifiedCache = getNotifiedCache();

      const allQuests: Quest[] = [
        ...(quests.habito || []),
        ...(quests.diaria || []),
        ...(quests.meta || []),
      ];

      for (const quest of allQuests) {
        if (!quest.reminderEnabled) continue;
        if (quest.completed) continue;
        if (!quest.scheduledTime) continue;

        const [targetHStr, targetMStr] = quest.scheduledTime.split(':');
        const targetH = parseInt(targetHStr, 10);
        const targetM = parseInt(targetMStr, 10);
        if (isNaN(targetH) || isNaN(targetM)) continue;

        const targetTotalMinutes = targetH * 60 + targetM;

        // Trigger if current time has reached target time today
        if (currentTotalMinutes < targetTotalMinutes) continue;

        if (quest.type === 'habito') {
          if (quest.habitDays && quest.habitDays.length > 0 && !quest.habitDays.includes(dayOfWeek)) {
            continue;
          }
        }

        const notificationKey = `${quest.id}_${dateStr}_${quest.scheduledTime}`;
        if (notifiedCache[notificationKey]) continue;

        markAsNotified(notificationKey);

        const titleText = quest.type === 'habito' 
          ? `🔥 Lembrete de Hábito: ${quest.title}`
          : `⚔️ Lembrete de Tarefa: ${quest.title}`;
        
        const bodyText = quest.description 
          ? `${quest.description} (${quest.scheduledTime} - Horário de Brasília)`
          : `Está na hora de cumprir seu objetivo no Dungeon of Discipline! (${quest.scheduledTime})`;

        await sendForegroundNotification(titleText, bodyText, notificationKey);
      }
    };

    checkAndSendNotifications();
    const interval = setInterval(checkAndSendNotifications, 10000);
    return () => clearInterval(interval);
  }, [quests]);

  // Sync active reminders to Supabase Web Push whenever quests change
  useEffect(() => {
    if (!quests) return;
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      subscribeUserToPush().then(() => {
        const allQuests: Quest[] = [
          ...(quests.habito || []),
          ...(quests.diaria || []),
          ...(quests.meta || []),
        ];
        syncAllQuestsToSupabase(allQuests);
      }).catch(err => console.warn('Erro na sincronização de push:', err));
    }
  }, [quests]);

  return {
    permission,
    isSubscribing,
    requestPermission,
    toggleNotifications,
  };
}
