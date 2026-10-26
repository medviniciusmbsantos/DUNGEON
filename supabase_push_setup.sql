-- ============================================
-- TABELAS SUPABASE PARA WEB PUSH EM 2º PLANO
-- ============================================

-- 1. Tabela para armazenar as inscrições de Web Push dos dispositivos
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  endpoint TEXT UNIQUE NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela para armazenar o agendamento dos hábitos/tarefas
CREATE TABLE IF NOT EXISTS public.habit_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quest_id TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_time TEXT NOT NULL, -- Formato HH:mm
  habit_days JSONB, -- Array de dias [0, 1, 2, 3, 4, 5, 6]
  quest_type TEXT DEFAULT 'habito',
  reminder_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_reminders ENABLE ROW LEVEL SECURITY;

-- Políticas para acesso anônimo e autenticado
CREATE POLICY "Permitir leitura/escrita para todos em push_subscriptions"
ON public.push_subscriptions FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir leitura/escrita para todos em habit_reminders"
ON public.habit_reminders FOR ALL USING (true) WITH CHECK (true);
