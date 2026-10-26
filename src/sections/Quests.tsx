import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Check, 
  Trash2,
  MoreVertical,
  Pencil,
  Zap, 
  Calendar, 
  Clock,
  Target,
  Flame,
  Sparkles,
  ChevronDown,
  ChevronRight,
  BarChart2,
  Info,
  Gift,
  Bell,
  BellRing
} from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { requestNotificationPermission } from '@/hooks/useNotificationScheduler';
import { subscribeUserToPush } from '@/lib/pushNotifications';
import { cn } from '@/lib/utils';
import type { Quest, Difficulty, QuestType, DayOfWeek } from '@/types/game';
import { getBrazilDate, getBrazilDateStringFromDate } from '@/types/game';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

function rollStreakChestRarity(days: number): 'common' | 'rare' | 'epic' | 'legendary' {
  if (days === 7) return 'common';
  if (days === 14) return 'rare';
  if (days === 28) return 'epic';
  if (days === 365) return 'legendary';
  
  if (days >= 42 && days <= 150) {
    return Math.random() < 0.70 ? 'rare' : 'epic';
  }
  
  if (days >= 175 && days <= 300) {
    return Math.random() < 0.60 ? 'epic' : 'rare';
  }
  
  if (days === 325) {
    return Math.random() < 0.80 ? 'epic' : 'legendary';
  }
  
  return 'rare';
}

function getChestImagePath(rarity: 'common' | 'rare' | 'epic' | 'legendary'): string {
  switch (rarity) {
    case 'common': return '/chests/common.png';
    case 'rare': return '/chests/rare.png';
    case 'epic': return '/chests/epic.png';
    case 'legendary': return '/chests/legendary.png';
    default: return '/chests/common.png';
  }
}

const STREAK_REWARDS = [
  { days: 7, title: 'Baú Comum', titleUnlocked: 'Portador da Chama', defaultRarity: 'common' as const, gold: 150, crystals: 25, energy: 2 },
  { days: 14, title: 'Baú Raro', titleUnlocked: 'Discipulo da Forja', defaultRarity: 'rare' as const, gold: 350, crystals: 50, energy: 4 },
  { days: 28, title: 'Baú Épico', titleUnlocked: 'Guerreiro Incansável', defaultRarity: 'epic' as const, gold: 750, crystals: 100, energy: 7 },
  { days: 42, title: 'Baú Misto (42d)', titleUnlocked: 'Cavaleiro da Persistência', defaultRarity: 'rare' as const, gold: 1100, crystals: 130, energy: 8, chanceInfo: '70% Raro / 30% Épico' },
  { days: 56, title: 'Baú Misto (56d)', titleUnlocked: 'Forjado na Disciplina', defaultRarity: 'rare' as const, gold: 1400, crystals: 160, energy: 9, chanceInfo: '70% Raro / 30% Épico' },
  { days: 70, title: 'Baú Misto (70d)', titleUnlocked: 'Mestre da Forja', defaultRarity: 'rare' as const, gold: 1800, crystals: 200, energy: 10, chanceInfo: '70% Raro / 30% Épico' },
  { days: 100, title: 'Baú Misto (100d)', titleUnlocked: 'Senhor da Constância', defaultRarity: 'rare' as const, gold: 2500, crystals: 280, energy: 12, chanceInfo: '70% Raro / 30% Épico' },
  { days: 125, title: 'Baú Misto (125d)', defaultRarity: 'rare' as const, gold: 3000, crystals: 330, energy: 14, chanceInfo: '70% Raro / 30% Épico' },
  { days: 150, title: 'Baú Misto (150d)', titleUnlocked: 'Lenda', defaultRarity: 'rare' as const, gold: 3600, crystals: 400, energy: 16, chanceInfo: '70% Raro / 30% Épico' },
  { days: 175, title: 'Baú Superior (175d)', defaultRarity: 'epic' as const, gold: 4200, crystals: 450, energy: 18, chanceInfo: '60% Épico / 40% Raro' },
  { days: 200, title: 'Baú Superior (200d)', titleUnlocked: 'Eterno', defaultRarity: 'epic' as const, gold: 5000, crystals: 520, energy: 20, chanceInfo: '60% Épico / 40% Raro' },
  { days: 225, title: 'Baú Superior (225d)', defaultRarity: 'epic' as const, gold: 5800, crystals: 600, energy: 22, chanceInfo: '60% Épico / 40% Raro' },
  { days: 250, title: 'Baú Superior (250d)', defaultRarity: 'epic' as const, gold: 6800, crystals: 700, energy: 24, chanceInfo: '60% Épico / 40% Raro' },
  { days: 275, title: 'Baú Superior (275d)', defaultRarity: 'epic' as const, gold: 7800, crystals: 800, energy: 26, chanceInfo: '60% Épico / 40% Raro' },
  { days: 300, title: 'Baú Superior (300d)', defaultRarity: 'epic' as const, gold: 9000, crystals: 950, energy: 28, chanceInfo: '60% Épico / 40% Raro' },
  { days: 325, title: 'Baú Mítico (325d)', defaultRarity: 'epic' as const, gold: 11000, crystals: 1200, energy: 30, chanceInfo: '80% Épico / 20% Lendário' },
  { days: 365, title: 'Baú Lendário (365d)', titleUnlocked: 'Ascendido', defaultRarity: 'legendary' as const, gold: 15000, crystals: 2000, energy: 50, chanceInfo: '100% Lendário' },
];

const difficultyConfig: Record<Difficulty, { color: string; bg: string; label: string; border: string; emoji: string }> = {
  easy: { color: 'text-emerald-400', bg: 'bg-emerald-500/20', label: 'Fácil', border: 'border-emerald-500', emoji: '🟢' },
  medium: { color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Médio', border: 'border-blue-500', emoji: '🔵' },
  hard: { color: 'text-purple-400', bg: 'bg-purple-500/20', label: 'Difícil', border: 'border-purple-500', emoji: '🟣' },
};

interface QuestCardProps {
  quest: Quest;
  onComplete?: () => void;
  onEdit: () => void;
  onRequestDelete: () => void;
  rewardFragments: number;
  onToggleCheckpoint?: (checkpointId: string) => void;
}

function QuestCard({ quest, onComplete, onEdit, onRequestDelete, rewardFragments, onToggleCheckpoint }: QuestCardProps) {
  const diff = difficultyConfig[quest.difficulty];
  
  const checkpoints = quest.checkpoints || [];
  const hasCheckpoints = checkpoints.length > 0;
  const completedCheckpoints = hasCheckpoints ? checkpoints.filter(c => c.completed).length : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, x: -100 }}
      className={cn(
        'card-dungeon p-4 relative overflow-hidden',
        quest.completed && 'opacity-50'
      )}
    >
      {/* Difficulty Indicator */}
      <div className={cn(
        'absolute left-0 top-0 bottom-0 w-1',
        diff.border
      )} />

      <div className="flex items-start gap-4 pl-3">
        {onComplete && !hasCheckpoints ? (
          <motion.button
            onClick={onComplete}
            disabled={quest.completed}
            className={cn(
              'w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all',
              quest.completed
                ? 'bg-green-500 border-green-500'
                : 'border-gray-500 hover:border-green-500 hover:bg-green-500/20'
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {quest.completed && <Check className="w-5 h-5 text-white" />}
          </motion.button>
        ) : (
          <div className="w-8 h-8" />
        )}

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className={cn(
              'font-semibold',
              quest.completed ? 'text-gray-500 line-through' : 'text-white'
            )}>
              {quest.title}
            </h4>
            <span className={cn('text-xs px-2 py-0.5 rounded', diff.bg, diff.color)}>
              {diff.label}
            </span>
            {quest.type === 'diaria' && (
              <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Diária
              </span>
            )}
            {quest.type === 'habito' && (
              <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 flex items-center gap-1">
                <Flame className="w-3 h-3" />
                Hábito
              </span>
            )}
            {quest.type === 'meta' && (
              <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 flex items-center gap-1">
                <Target className="w-3 h-3" />
                Meta
              </span>
            )}
            {quest.scheduledDate && (
              <span className="text-xs px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {quest.scheduledDate.split('-').reverse().join('/')}
              </span>
            )}
            {quest.scheduledTime && (
              <span className="text-xs px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/40 text-amber-300 flex items-center gap-1 font-mono font-bold">
                <Clock className="w-3 h-3" />
                {quest.scheduledTime}
              </span>
            )}
            {quest.reminderEnabled && (
              <span className="text-xs px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/40 text-purple-300 flex items-center gap-1 font-semibold" title="Lembrete por notificação ativo">
                <BellRing className="w-3 h-3 text-purple-400 animate-pulse" />
                Lembrete
              </span>
            )}
            {quest.suggestedByMaster && (
              <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Mestre
              </span>
            )}
            {quest.focusTag && (
              <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-400">
                🎯 {quest.focusTag}
              </span>
            )}
          </div>
          
          <p className={cn(
            'text-sm mb-3',
            quest.completed ? 'text-gray-600' : 'text-gray-400'
          )}>
            {quest.description}
          </p>

          {hasCheckpoints && (
            <div className="space-y-1.5 mb-3">
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                {completedCheckpoints}/{checkpoints.length} checkpoints
              </div>
              <div className="space-y-1">
                {checkpoints.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onToggleCheckpoint?.(c.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-1 rounded border text-left transition-colors",
                      c.completed
                        ? "bg-green-500/10 border-green-500/20 text-green-300"
                        : "bg-black/30 border-white/10 text-gray-300 hover:bg-white/5"
                    )}
                  >
                    <span className={cn("w-3 h-3 rounded-sm border flex items-center justify-center shrink-0", c.completed ? "border-green-500 bg-green-500/30" : "border-gray-600")}>
                      {c.completed ? <Check className="w-2.5 h-2.5 text-green-300" /> : null}
                    </span>
                    <span className={cn("text-[11px] font-semibold", c.completed && "line-through opacity-70")}>{c.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {quest.type === 'habito' && (quest.habitDays || []).length > 0 && (
            <div className="text-[11px] text-orange-400 mb-3">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
                .filter((_, idx) => (quest.habitDays || []).includes(idx as DayOfWeek))
                .join(' • ')}
            </div>
          )}

          {/* Rewards */}
          <div className="flex items-center gap-4 flex-wrap">
            {rewardFragments > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                  <span className="text-[10px]">💎</span>
                  <span className="text-xs font-bold">+{rewardFragments} Frag.</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.button
              className="p-2 text-gray-500 hover:text-gray-300 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <MoreVertical className="w-5 h-5" />
            </motion.button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#1a1a2e] border-[#2d2d44] text-white">
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                onEdit();
              }}
              className="cursor-pointer"
            >
              <Pencil className="w-4 h-4 text-gray-300" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onSelect={(e) => {
                e.preventDefault();
                onRequestDelete();
              }}
              className="cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}

interface QuestsProps {}

export function Quests({}: QuestsProps) {
  const { gameState, createQuest, addQuest, completeQuest, deleteQuest, updateQuest, toggleQuestCheckpoint, setGameState } = useGame();
  const { playerProfile } = gameState;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [showCompletedHabitos, setShowCompletedHabitos] = useState(false);
  const [showCompletedDiarias, setShowCompletedDiarias] = useState(false);
  const [showCompletedMetas, setShowCompletedMetas] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Quest | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [editQuestDraft, setEditQuestDraft] = useState({
    title: '',
    description: '',
    difficulty: 'medium' as Difficulty,
    scheduledDate: '',
    scheduledTime: '',
    reminderEnabled: false,
    habitDays: [] as DayOfWeek[],
    metaTarget: 100,
    energyReward: 0,
    isMultitask: false,
    checkpointTitles: [] as string[],
  });
  const [newQuest, setNewQuest] = useState({
    title: '',
    description: '',
    type: 'diaria' as QuestType,
    difficulty: 'medium' as Difficulty,
    scheduledDate: '',
    scheduledTime: '',
    reminderEnabled: false,
    habitDays: [] as DayOfWeek[],
    metaTarget: 100,
    energyReward: 0,
    isMultitask: false,
    checkpointTitles: [] as string[],
  });
  const [checkpointText, setCheckpointText] = useState('');
  const [editCheckpointText, setEditCheckpointText] = useState('');
  const [claimedStreakRewards, setClaimedStreakRewards] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('dod_claimed_streak_rewards');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [selectedChestReward, setSelectedChestReward] = useState<typeof STREAK_REWARDS[0] | null>(null);
  const [showChestModal, setShowChestModal] = useState(false);
  const [showStreakInfoModal, setShowStreakInfoModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showStreakRewards, setShowStreakRewards] = useState(false);

  const saveClaimedStreakRewards = (newClaimed: number[]) => {
    setClaimedStreakRewards(newClaimed);
    try {
      localStorage.setItem('dod_claimed_streak_rewards', JSON.stringify(newClaimed));
    } catch (e) {
      console.error('Failed to save claimed streak rewards', e);
    }
  };

  const handleClaimChest = (reward: typeof STREAK_REWARDS[0]) => {
    const currentStreak = gameState.character.stats.streak || 0;
    if (claimedStreakRewards.includes(reward.days)) return;
    if (currentStreak < reward.days) return;

    const rolledRarity = rollStreakChestRarity(reward.days);

    const nextClaimed = [...claimedStreakRewards, reward.days];
    saveClaimedStreakRewards(nextClaimed);

    setGameState(prev => {
      const updatedChar = { ...prev.character };
      updatedChar.gold = (updatedChar.gold || 0) + reward.gold;
      updatedChar.energy = Math.min(updatedChar.maxEnergy, updatedChar.energy + reward.energy);

      const updatedEconomy = { ...prev.economy };
      const currentShards = updatedEconomy.shards ? { ...updatedEconomy.shards } : { common: 0, rare: 0, epic: 0, legendary: 0, mythic: 0 };
      currentShards[rolledRarity] = (currentShards[rolledRarity] || 0) + 1;
      updatedEconomy.shards = currentShards;

      const nextProfile = { ...prev.playerProfile };
      if (reward.titleUnlocked) {
        const existingTitles = nextProfile.unlockedTitles || [];
        if (!existingTitles.includes(reward.titleUnlocked)) {
          const nextTitles = [...existingTitles, reward.titleUnlocked];
          nextProfile.unlockedTitles = nextTitles;
          nextProfile.activeTitle = reward.titleUnlocked;
          try {
            localStorage.setItem('dod_unlocked_titles', JSON.stringify(nextTitles));
          } catch (e) {
            console.error(e);
          }
        }
      }

      return {
        ...prev,
        character: updatedChar,
        economy: updatedEconomy,
        playerProfile: nextProfile,
      };
    });
  };

  const todayStr = getBrazilDateStringFromDate(new Date());
  const currentDayOfWeek = getBrazilDate().getDay() as DayOfWeek;
  const autoRewardsEnabled = !!gameState.settings?.autoQuestRewards;
  const dailyCapEnergy = gameState.settings?.doubleTaskEnergyCap ? 10 : 5;
  const weightByDifficulty: Record<Difficulty, number> = { easy: 1.0, medium: 1.3, hard: 1.6 };

  const getRewardFragmentsForQuest = (quest: Quest): number => {
    if (quest.completed) return 0;

    const dailyProg = gameState.calendar.dailyProgress.find(dp => dp.date === todayStr);
    const currentExtraEnergy = dailyProg?.extraEnergyGained || 0;
    const remainingEnergyBudget = Math.max(0, dailyCapEnergy - currentExtraEnergy);
    const remainingFragmentsBudget = remainingEnergyBudget * 5;

    const fragmentsFromManual = Math.max(0, Math.floor((quest.energyReward || 0) * 5));
    if (!autoRewardsEnabled || quest.type === 'meta') {
      return Math.max(0, Math.min(fragmentsFromManual, Math.floor(remainingFragmentsBudget)));
    }

    if (quest.type === 'habito' && !quest.habitDays?.includes(currentDayOfWeek)) return 0;

    const todaysHabits = gameState.quests.habito
      .filter(h => h.habitDays?.includes(currentDayOfWeek))
      .filter(h => !gameState.quests.diaria.find(q => q.id === `daily-${h.id}-${todayStr}`)?.completed);

    const todaysManualDiarias = gameState.quests.diaria
      .filter(q =>
        (q.scheduledDate === todayStr || getBrazilDateStringFromDate(new Date(q.createdAt)) === todayStr) &&
        !q.id.startsWith('daily-') &&
        !q.completed
      );

    const tasksForTodayBase: Quest[] = [...todaysHabits, ...todaysManualDiarias];
    const weightSource = quest.type === 'diaria' && quest.id.startsWith('daily-')
      ? gameState.quests.habito.find(h => `daily-${h.id}-${todayStr}` === quest.id) || quest
      : quest;
    const totalWeight = tasksForTodayBase.reduce((sum, q) => sum + (weightByDifficulty[q.difficulty] || 0), 0);
    const w = weightByDifficulty[weightSource.difficulty] || 0;
    if (totalWeight <= 0 || w <= 0) return 0;
    return Math.max(0, Math.floor((w / totalWeight) * remainingFragmentsBudget));
  };

  const getHabitDailyQuest = (habit: Quest) => {
    const dailyId = `daily-${habit.id}-${todayStr}`;
    return gameState.quests.diaria.find(q => q.id === dailyId);
  };

  const buildHabitDisplayQuest = (habit: Quest): Quest => {
    const daily = getHabitDailyQuest(habit);
    const baseCheckpoints = habit.checkpoints || [];
    const nextCheckpoints = daily?.checkpoints
      ? daily.checkpoints
      : baseCheckpoints.map(c => ({ ...c, completed: false }));
    return {
      ...habit,
      completed: Boolean(daily?.completed),
      checkpoints: nextCheckpoints.length > 0 ? nextCheckpoints : undefined,
    };
  };

  const addEnergyReward = (delta: number) => {
    setNewQuest(prev => {
      const current = Math.round(prev.energyReward * 100);
      const next = current + Math.round(delta * 100);
      const clamped = Math.min(1000, Math.max(0, next));
      return { ...prev, energyReward: clamped / 100 };
    });
  };

  const setEnergyReward = (value: number) => {
    setNewQuest(prev => {
      const normalized = Math.round(value * 100);
      const clamped = Math.min(1000, Math.max(0, normalized));
      return { ...prev, energyReward: clamped / 100 };
    });
  };

  const handleQuestClick = (quest: Quest) => {
    setSelectedQuest(quest);
    setShowQuestModal(true);
  };

  const startEditQuest = (quest: Quest) => {
    setEditingQuest(quest);
    setEditQuestDraft({
      title: quest.title,
      description: quest.description,
      difficulty: quest.difficulty || 'medium',
      scheduledDate: quest.scheduledDate || '',
      scheduledTime: quest.scheduledTime || '',
      reminderEnabled: quest.reminderEnabled || false,
      habitDays: quest.habitDays || [],
      metaTarget: quest.metaProgress?.target ?? 100,
      energyReward: quest.energyReward || 0,
      isMultitask: (quest.checkpoints || []).length > 0,
      checkpointTitles: (quest.checkpoints || []).map(c => c.title),
    });
    setEditCheckpointText('');
    setIsEditDialogOpen(true);
  };

  const applyEditQuest = () => {
    if (!editingQuest) return;
    if (!editQuestDraft.title.trim()) return;

    const isHabit = editingQuest.type === 'habito';
    if (isHabit && editQuestDraft.habitDays.length === 0) return;
    if (editQuestDraft.isMultitask && editQuestDraft.checkpointTitles.length === 0) return;
    const nextScheduledDate = isHabit ? undefined : (editQuestDraft.scheduledDate || undefined);
    const nextScheduledTime = editQuestDraft.scheduledTime || undefined;
    const nextHabitDays = isHabit ? editQuestDraft.habitDays : undefined;
    const nextMetaTarget = editingQuest.type === 'meta' ? editQuestDraft.metaTarget : undefined;

    updateQuest(editingQuest.id, editingQuest.type, {
      title: editQuestDraft.title.trim(),
      description: editQuestDraft.description,
      difficulty: editQuestDraft.difficulty,
      energyReward: autoRewardsEnabled && editingQuest.type !== 'meta' ? 0 : editQuestDraft.energyReward,
      scheduledDate: nextScheduledDate,
      scheduledTime: nextScheduledTime,
      reminderEnabled: editQuestDraft.reminderEnabled,
      habitDays: nextHabitDays,
      metaTarget: nextMetaTarget,
      checkpointTitles: editQuestDraft.isMultitask ? editQuestDraft.checkpointTitles : [],
    });

    setIsEditDialogOpen(false);
    setEditingQuest(null);
  };

  const handleCompleteFromModal = () => {
    if (selectedQuest) {
      completeQuest(selectedQuest.id, selectedQuest.type);
      setShowQuestModal(false);
      setSelectedQuest(null);
    }
  };

  const handleCreateQuest = () => {
    if (!newQuest.title) return;
    if (newQuest.type === 'habito' && newQuest.habitDays.length === 0) return;
    if (newQuest.isMultitask && newQuest.checkpointTitles.length === 0) return;
    
    const quest = createQuest(
      newQuest.title,
      newQuest.description,
      newQuest.type,
      newQuest.difficulty,
      false, // isEmergency
      false, // suggestedByMaster
      newQuest.type === 'habito' ? undefined : (newQuest.scheduledDate || undefined),
      playerProfile.activeFocusTag,
      newQuest.type === 'habito' ? newQuest.habitDays : undefined,
      newQuest.type === 'meta' ? newQuest.metaTarget : undefined,
      autoRewardsEnabled && newQuest.type !== 'meta' ? 0 : newQuest.energyReward,
      newQuest.isMultitask ? newQuest.checkpointTitles : undefined,
      newQuest.scheduledTime || undefined,
      newQuest.reminderEnabled
    );
    
    addQuest(quest);
    setNewQuest({ 
      title: '', 
      description: '', 
      type: 'diaria', 
      difficulty: 'medium',
      scheduledDate: '',
      scheduledTime: '',
      reminderEnabled: false,
      habitDays: [],
      metaTarget: 100,
      energyReward: 0,
      isMultitask: false,
      checkpointTitles: [],
    });
    setCheckpointText('');
    setIsDialogOpen(false);
  };

  // Helper to filter quests: active or completed today
  const filterQuests = (quests: Quest[]) => {
    return quests.filter(q => {
      if (!q.completed) return true;
      const completedDate = getBrazilDateStringFromDate(new Date(q.completedAt || q.createdAt));
      return completedDate === todayStr;
    });
  };

  const activeHabitos = gameState.quests.habito;
  const activeDiarias = filterQuests(gameState.quests.diaria).filter(q => !q.completed && !q.id.startsWith('daily-'));
  const completedDiarias = filterQuests(gameState.quests.diaria).filter(q => q.completed && !q.id.startsWith('daily-'));
  const activeMetas = filterQuests(gameState.quests.meta).filter(q => !q.completed);
  const completedMetas = filterQuests(gameState.quests.meta).filter(q => q.completed);

  const scheduledHabitsToday = activeHabitos.filter(h => h.habitDays?.includes(currentDayOfWeek));
  const completedHabitsToday = scheduledHabitsToday.filter(h => getHabitDailyQuest(h)?.completed);
  const pendingHabitsTodayCount = Math.max(0, scheduledHabitsToday.length - completedHabitsToday.length);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3 pt-10 pb-6"
    >
      {/* Header */}
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-md pt-2 pb-4 border-b border-white/5 md:relative md:top-auto md:z-auto md:bg-transparent md:backdrop-blur-none md:pt-0 md:pb-0 md:px-0 md:border-none">
        <h2 className="text-2xl font-bold text-white font-cinzel mb-3">Tarefas</h2>

        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">Cálculo automático</p>
            <p className="text-xs text-gray-500 truncate">Distribui fragmentos automaticamente por dificuldade • Energia: {gameState.character.energy}</p>
          </div>
          <Switch
            checked={!!gameState.settings?.autoQuestRewards}
            onCheckedChange={(checked) => {
              setGameState(prev => ({
                ...prev,
                settings: {
                  ...(prev.settings || { infiniteEnergy: false, doubleTaskEnergyCap: false, autoQuestRewards: true }),
                  autoQuestRewards: checked,
                },
              }));
            }}
          />
        </div>
        
        {/* Top Action Buttons: Nova Tarefa (Left), Calendário (Middle), Estatísticas (Right) */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* 1. Nova Tarefa (Left Primary Action) */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <motion.button
                className="px-3.5 py-1.5 text-xs bg-purple-600 hover:bg-purple-700 font-bold rounded-lg text-white flex items-center gap-1.5 transition-colors shadow-md shadow-purple-600/20"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Tarefa</span>
              </motion.button>
            </DialogTrigger>
            <DialogContent className="bg-[#1a1a2e] border-[#2d2d44] text-white w-[calc(100vw-1.5rem)] sm:max-w-md max-h-[85vh] overflow-y-auto overflow-x-hidden p-3 sm:p-4 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] focus:outline-none">
              <DialogHeader className="pb-1">
                <DialogTitle className="font-cinzel text-lg">
                  Criar Nova Tarefa
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-3 mt-2 w-full min-w-0">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block font-medium">Título da Tarefa</label>
                  <Input
                    placeholder="Ex: Treino de perna, Estudar React..."
                    value={newQuest.title}
                    onChange={(e) => setNewQuest(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-black/40 border-gray-700 h-9 text-xs sm:text-sm px-3"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-gray-400 mb-1 block font-medium">Descrição (opcional)</label>
                  <Textarea
                    placeholder="Detalhes sobre a tarefa..."
                    value={newQuest.description}
                    onChange={(e) => setNewQuest(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-black/40 border-gray-700 resize-none h-16 text-xs sm:text-sm p-2.5"
                  />
                </div>

                <div className="flex items-center justify-between gap-2 bg-black/30 border border-white/10 rounded-lg p-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">Multitarefa</p>
                    <p className="text-[10px] text-gray-500 truncate">Checkpoints múltiplos</p>
                  </div>
                  <Switch
                    checked={newQuest.isMultitask}
                    onCheckedChange={(checked) => {
                      setNewQuest(prev => ({
                        ...prev,
                        isMultitask: checked,
                        checkpointTitles: checked ? prev.checkpointTitles : [],
                      }));
                      setCheckpointText('');
                    }}
                  />
                </div>

                {newQuest.isMultitask && (
                  <div className="bg-black/30 border border-white/10 rounded-lg p-2.5 space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Novo checkpoint..."
                        value={checkpointText}
                        onChange={(e) => setCheckpointText(e.target.value)}
                        className="bg-black/40 border-gray-700 h-8 text-xs px-2"
                      />
                      <Button
                        type="button"
                        className="bg-purple-600 hover:bg-purple-700 h-8 px-3 text-xs"
                        onClick={() => {
                          const title = checkpointText.trim();
                          if (!title) return;
                          setNewQuest(prev => ({ ...prev, checkpointTitles: [...prev.checkpointTitles, title] }));
                          setCheckpointText('');
                        }}
                      >
                        Adicionar
                      </Button>
                    </div>

                    <div className="space-y-1">
                      {newQuest.checkpointTitles.map((t, idx) => (
                        <div key={`${t}-${idx}`} className="flex items-center justify-between gap-2 bg-black/40 border border-white/10 rounded px-2 py-1">
                          <span className="text-[11px] text-gray-300 truncate">{t}</span>
                          <button
                            type="button"
                            className="text-red-400 hover:text-red-300 text-[10px] font-bold shrink-0"
                            onClick={() => setNewQuest(prev => ({ ...prev, checkpointTitles: prev.checkpointTitles.filter((_, i) => i !== idx) }))}
                          >
                            Remover
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Tipo e Dificuldade lado a lado */}
                <div className="grid grid-cols-2 gap-2 w-full">
                  <div className="min-w-0">
                    <label className="text-xs text-gray-400 mb-1 block font-medium">Tipo</label>
                    <Select
                      value={newQuest.type}
                      onValueChange={(v) => {
                        const nextType = v as QuestType;
                        setNewQuest(prev => ({
                          ...prev,
                          type: nextType,
                          scheduledDate: nextType === 'habito' ? '' : prev.scheduledDate,
                          habitDays: nextType === 'habito' ? prev.habitDays : [],
                        }));
                      }}
                    >
                      <SelectTrigger className="bg-[#16213e] border-[#2d2d44] text-white h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a2e] border-[#2d2d44]">
                        <SelectItem value="habito" className="text-white text-xs">
                          <div className="flex items-center gap-1.5">
                            <Flame className="w-3.5 h-3.5 text-orange-400" />
                            Hábito
                          </div>
                        </SelectItem>
                        <SelectItem value="diaria" className="text-white text-xs">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                            Diária
                          </div>
                        </SelectItem>
                        <SelectItem value="meta" className="text-white text-xs">
                          <div className="flex items-center gap-1.5">
                            <Target className="w-3.5 h-3.5 text-purple-400" />
                            Meta
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="min-w-0">
                    <label className="text-xs text-gray-400 mb-1 block font-medium">Dificuldade</label>
                    <Select
                      value={newQuest.difficulty}
                      onValueChange={(v) => setNewQuest(prev => ({ ...prev, difficulty: v as Difficulty }))}
                    >
                      <SelectTrigger className="bg-[#16213e] border-[#2d2d44] text-white h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a2e] border-[#2d2d44]">
                        {Object.entries(difficultyConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key} className="text-white text-xs">
                            <div className="flex items-center gap-1.5">
                              <span>{config.emoji}</span>
                              {config.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {newQuest.type === 'habito' && (
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-400 block font-medium">Dias da Semana</label>
                    <div className="flex flex-wrap gap-1.5">
                      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, idx) => {
                        const dayVal = idx as DayOfWeek;
                        const isSelected = newQuest.habitDays.includes(dayVal);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              setNewQuest(prev => ({
                                ...prev,
                                habitDays: isSelected 
                                  ? prev.habitDays.filter(d => d !== dayVal)
                                  : [...prev.habitDays, dayVal]
                              }));
                            }}
                            className={cn(
                              "px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all border",
                              isSelected 
                                ? "bg-orange-500 border-orange-400 text-white shadow-sm" 
                                : "bg-black/40 border-gray-700 text-gray-400"
                            )}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Meta Target - Only shows when type is 'meta' */}
                {newQuest.type === 'meta' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-2.5"
                  >
                    <label className="text-xs text-purple-400 mb-1 block flex items-center gap-1.5 font-medium">
                      <Target className="w-3.5 h-3.5" />
                      Meta (quantidade)
                    </label>
                    <Input
                      type="number"
                      value={newQuest.metaTarget}
                      onChange={(e) => setNewQuest({ ...newQuest, metaTarget: parseInt(e.target.value) || 100 })}
                      className="bg-[#16213e] border-purple-500/50 text-white h-8 text-xs"
                      min={1}
                    />
                  </motion.div>
                )}

                {/* Agendamento de Data e Horário lado a lado */}
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-2.5 space-y-2 w-full">
                  <div className="grid grid-cols-2 gap-2 w-full">
                    {newQuest.type !== 'habito' && (
                      <div className="min-w-0">
                        <label className="text-xs text-cyan-400 mb-1 block flex items-center gap-1 font-medium truncate">
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                          Dia (opcional)
                        </label>
                        <Input
                          type="date"
                          value={newQuest.scheduledDate}
                          onChange={(e) => setNewQuest(prev => ({ ...prev, scheduledDate: e.target.value }))}
                          className="bg-[#16213e] border-cyan-500/50 text-white h-8 text-xs px-1.5"
                        />
                      </div>
                    )}

                    <div className={newQuest.type === 'habito' ? 'col-span-2 min-w-0' : 'min-w-0'}>
                      <label className="text-xs text-cyan-400 mb-1 block flex items-center gap-1 font-medium truncate">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        Horário (opcional)
                      </label>
                      <Input
                        type="time"
                        value={newQuest.scheduledTime}
                        onChange={(e) => setNewQuest(prev => ({ ...prev, scheduledTime: e.target.value }))}
                        className="bg-[#16213e] border-cyan-500/50 text-white h-8 text-xs px-1.5"
                      />
                    </div>
                  </div>
                </div>

                {/* Notificação de Lembrete Switch */}
                <div className="bg-purple-950/40 border border-purple-500/40 rounded-lg p-2.5 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-purple-300 flex items-center gap-1.5 truncate">
                        <Bell className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        Lembrete por Notificação
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">
                        Notificar no celular/navegador no horário agendado
                      </p>
                    </div>
                    <Switch
                      checked={newQuest.reminderEnabled}
                      onCheckedChange={async (checked) => {
                        let defaultTime = newQuest.scheduledTime;
                        if (checked) {
                          if (!defaultTime) {
                            const nowBRT = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
                            defaultTime = nowBRT;
                          }
                          const perm = await requestNotificationPermission();
                          if (perm === 'denied') {
                            alert('As notificações estão bloqueadas no seu navegador. Por favor, permita notificações nas configurações do seu dispositivo/navegador para receber os lembretes.');
                          } else {
                            await subscribeUserToPush();
                          }
                        }
                        setNewQuest(prev => ({ ...prev, reminderEnabled: checked, scheduledTime: defaultTime }));
                      }}
                    />
                  </div>
                  {newQuest.reminderEnabled && (
                    <p className="text-[9px] text-purple-300/80 pt-1 border-t border-purple-500/20 leading-tight">
                      ⏰ Horário de Brasília (BRT). No iPhone/iOS, adicione o aplicativo à <b>Tela de Início</b> para receber em 2º plano.
                    </p>
                  )}
                </div>

                {(!autoRewardsEnabled || newQuest.type === 'meta') && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <label className="text-sm text-yellow-500 mb-2 block flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Ganho de Energia
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max="10"
                              value={newQuest.energyReward}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                if (!isNaN(val)) {
                                  setEnergyReward(val);
                                } else if (e.target.value === '') {
                                  setEnergyReward(0);
                                }
                              }}
                              className="w-16 bg-black/40 border border-yellow-500/30 rounded-lg px-2 py-1 text-right font-black text-yellow-500 focus:outline-none focus:border-yellow-500 transition-colors"
                            />
                            <span className="text-sm font-black text-yellow-500">NRG</span>
                          </div>
                          <div className="text-[10px] text-purple-400 font-bold mt-1">
                            ≈ {Math.floor(newQuest.energyReward * 5)} Fragmentos
                          </div>
                        </div>
                      </div>
                    </label>
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-yellow-500/10 border-yellow-500/30 text-yellow-500 h-8 w-8 p-0"
                        onClick={() => addEnergyReward(-0.2)}
                      >
                        -
                      </Button>
                      <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden relative">
                        <div 
                          className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all" 
                          style={{ width: `${Math.min(100, (newQuest.energyReward / 10) * 100)}%` }}
                        />
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-yellow-500/10 border-yellow-500/30 text-yellow-500 h-8 w-8 p-0"
                        onClick={() => addEnergyReward(0.2)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateQuest}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Tarefa
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* 2. Calendário (Middle) */}
          <motion.button
            onClick={() => setShowCalendar(true)}
            className="px-3 py-1.5 text-xs bg-[#1a1a2e] border border-[#2d2d44] rounded-md text-gray-300 hover:bg-[#252542] flex items-center gap-1.5 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>Calendário</span>
          </motion.button>

          {/* 3. Estatísticas (Right) */}
          <motion.button
            onClick={() => setShowStatsModal(true)}
            className="px-3 py-1.5 text-xs bg-[#1a1a2e] border border-[#2d2d44] rounded-md text-gray-300 hover:bg-[#252542] flex items-center gap-1.5 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Estatísticas</span>
          </motion.button>
        </div>
      </div>

      {/* Active Focus Tag */}
      {playerProfile.activeFocusTag && (
        <motion.div 
          className="card-dungeon p-4 flex items-center gap-4 bg-gradient-to-r from-purple-900/30 to-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
            <Target className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Foco Ativo</p>
            <p className="text-xl font-bold text-purple-400">
              🎯 {playerProfile.activeFocusTag}
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-gray-500">Quests relacionadas</p>
            <p className="text-sm text-purple-400">+XP bônus</p>
          </div>
        </motion.div>
      )}

      {/* Streak & Collapsible Chest Rewards Card */}
      <motion.div 
        className="card-dungeon p-4 relative overflow-hidden bg-[#0c0c14] border border-[#232338] rounded-2xl shadow-xl transition-all"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Main Bar */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Streak Info */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(249,115,22,0.25)]">
              <Flame className="w-6 h-6 sm:w-7 sm:h-7 text-orange-500 fill-orange-500/20" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Streak Atual</p>
              <p className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {gameState.character.stats.streak} <span className="text-xs font-normal text-gray-300">dias</span>
              </p>
              <p className="text-[11px] text-gray-400 font-semibold mt-0.5">
                Melhor streak: <span className="text-orange-400 font-bold">{gameState.character.stats.maxStreak} dias</span>
              </p>
            </div>
          </div>

          {/* Toggle Recompensas Button */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => setShowStreakRewards(prev => !prev)}
              className={cn(
                "px-3.5 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-2 shadow-md relative",
                showStreakRewards
                  ? "bg-purple-600 border-purple-500 text-white shadow-purple-600/30"
                  : "bg-[#181826] border-[#2d2d44] text-purple-300 hover:bg-[#232338] hover:text-white"
              )}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Gift className="w-4 h-4 text-amber-400" />
              <span>Recompensas</span>

              {/* Unclaimed Reward Indicator Dot */}
              {STREAK_REWARDS.some(r => (gameState.character.stats.streak || 0) >= r.days && !claimedStreakRewards.includes(r.days)) && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}

              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-300", showStreakRewards && "rotate-180")} />
            </motion.button>
          </div>
        </div>

        {/* Collapsible Chest Rewards Track */}
        <AnimatePresence>
          {showStreakRewards && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="overflow-hidden space-y-2 pt-2 border-t border-[#222234]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-black tracking-wider text-purple-400 uppercase font-cinzel">
                    TRILHA DE BAÚS E TÍTULOS
                  </span>
                  <button
                    onClick={() => setShowStreakInfoModal(true)}
                    className="text-gray-400 hover:text-white transition-colors"
                    title="Informações sobre recompensas"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-[9px] text-gray-500 font-mono hidden sm:inline">
                  ← Deslize para ver todos os 17 marcos →
                </span>
              </div>

              {/* Scrollable Track */}
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-purple-600/40 scrollbar-track-black/40 pt-3 pb-2 px-1 rounded-xl bg-black/30 border border-white/5">
                <div className="min-w-[1280px] relative px-4 pb-1">
                  {/* Progress Line */}
                  <div className="absolute left-6 right-6 top-[2.75rem] h-1.5 bg-[#181826] rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-600 via-purple-500 via-amber-400 to-yellow-300 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, ((gameState.character.stats.streak || 0) / 365) * 100)}%` }}
                    />
                  </div>

                  {/* Chest Items */}
                  <div className="flex justify-between items-end relative z-10">
                    {STREAK_REWARDS.map((reward) => {
                      const isClaimed = claimedStreakRewards.includes(reward.days);
                      const isUnlocked = (gameState.character.stats.streak || 0) >= reward.days;
                      const imageSrc = getChestImagePath(reward.defaultRarity);

                      return (
                        <div key={reward.days} className="flex flex-col items-center group relative min-w-[55px]">
                          <button
                            onClick={() => {
                              setSelectedChestReward(reward);
                              setShowChestModal(true);
                            }}
                            className={cn(
                              "relative transition-all duration-300 flex flex-col items-center",
                              isUnlocked && !isClaimed && "hover:scale-110 cursor-pointer animate-bounce",
                              isClaimed && "opacity-85 cursor-pointer",
                              !isUnlocked && "opacity-60 grayscale-[30%] hover:scale-105 cursor-pointer"
                            )}
                          >
                            {/* Glowing ring for available */}
                            {isUnlocked && !isClaimed && (
                              <div className="absolute inset-0 bg-amber-400/40 rounded-full blur-md animate-ping" />
                            )}

                            <img
                              src={imageSrc}
                              alt={reward.title}
                              className="w-11 h-11 sm:w-13 sm:h-13 object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] relative z-10"
                            />

                            {/* Claimed Checkmark Badge */}
                            {isClaimed && (
                              <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-0.5 border border-black shadow-md z-20">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}

                            {/* Title badge indicator */}
                            {reward.titleUnlocked && (
                              <div className="absolute -bottom-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-[8px] text-black font-black px-1 rounded-full z-20 uppercase tracking-tighter shadow-sm border border-black/40">
                                Título
                              </div>
                            )}
                          </button>

                          {/* Node Dot */}
                          <div 
                            className={cn(
                              "w-3 h-3 rounded-full border-2 mt-1.5 relative z-10 transition-colors",
                              isClaimed ? "bg-green-500 border-green-300" : isUnlocked ? "bg-amber-400 border-amber-200 shadow-[0_0_8px_rgba(251,191,36,0.8)]" : "bg-[#141420] border-gray-600"
                            )}
                          />

                          {/* Days Label */}
                          <span className={cn(
                            "text-[10px] font-mono font-bold mt-0.5",
                            isClaimed ? "text-green-400" : isUnlocked ? "text-amber-300" : "text-gray-400"
                          )}>
                            {reward.days}d
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Subtitle */}
              <p className="text-[10px] text-gray-400 text-center italic tracking-wide pt-1">
                Mantenha seu streak para conquistar títulos lendários e baús épicos!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Quest Tabs */}
      <Tabs defaultValue="diaria" className="w-full">
        <TabsList className="bg-[#1a1a2e] border border-[#2d2d44] w-full flex">
          <TabsTrigger value="habito" className="flex-1 data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400 text-[10px] sm:text-xs">
            <Flame className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="truncate">Hábitos ({pendingHabitsTodayCount})</span>
          </TabsTrigger>
          <TabsTrigger value="diaria" className="flex-1 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 text-[10px] sm:text-xs">
            <Calendar className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="truncate">Diárias ({activeDiarias.length})</span>
          </TabsTrigger>
          <TabsTrigger value="meta" className="flex-1 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-[10px] sm:text-xs">
            <Target className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="truncate">Metas ({activeMetas.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="habito" className="mt-4 space-y-4">
          <AnimatePresence mode="popLayout">
            {activeHabitos.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 text-gray-500"
              >
                <Flame className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum hábito configurado</p>
                <p className="text-sm">Crie hábitos que se repetem nos dias escolhidos!</p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {activeHabitos
                  .filter((habit) => {
                    const isScheduledToday = habit.habitDays?.includes(currentDayOfWeek);
                    if (!isScheduledToday) return true;
                    const dailyId = `daily-${habit.id}-${todayStr}`;
                    const dailyQuest = gameState.quests.diaria.find(q => q.id === dailyId);
                    return !dailyQuest?.completed;
                  })
                  .map((habit) => {
                    const isScheduledToday = habit.habitDays?.includes(currentDayOfWeek);
                    const displayQuest = buildHabitDisplayQuest(habit);
                    const hasCheckpoints = (displayQuest.checkpoints || []).length > 0;

                    return (
                      <QuestCard
                        key={habit.id}
                        quest={displayQuest}
                        onComplete={isScheduledToday && !hasCheckpoints ? () => completeQuest(habit.id, 'habito') : undefined}
                        onToggleCheckpoint={isScheduledToday && hasCheckpoints ? (checkpointId) => toggleQuestCheckpoint(habit.id, 'habito', checkpointId) : undefined}
                        onEdit={() => startEditQuest(habit)}
                        onRequestDelete={() => setPendingDelete(habit)}
                        rewardFragments={getRewardFragmentsForQuest(habit)}
                      />
                    );
                  })}

                {activeHabitos.some(h => h.habitDays?.includes(currentDayOfWeek) && gameState.quests.diaria.find(q => q.id === `daily-${h.id}-${todayStr}`)?.completed) && (
                  <div className="mt-6 border-t border-[#2d2d44] pt-4">
                    <button
                      onClick={() => setShowCompletedHabitos(!showCompletedHabitos)}
                      className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors w-full group"
                    >
                      {showCompletedHabitos ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      <span className="font-bold uppercase tracking-widest text-[10px]">
                        Concluídos Hoje ({activeHabitos.filter(h => h.habitDays?.includes(currentDayOfWeek) && gameState.quests.diaria.find(q => q.id === `daily-${h.id}-${todayStr}`)?.completed).length})
                      </span>
                    </button>

                    {showCompletedHabitos && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-3 mt-4"
                      >
                        {activeHabitos
                          .filter(h => h.habitDays?.includes(currentDayOfWeek) && gameState.quests.diaria.find(q => q.id === `daily-${h.id}-${todayStr}`)?.completed)
                          .map((habit) => (
                            <QuestCard
                              key={habit.id}
                              quest={{ ...buildHabitDisplayQuest(habit), completed: true }}
                              onComplete={() => {}}
                              onEdit={() => startEditQuest(habit)}
                              onRequestDelete={() => setPendingDelete(habit)}
                              rewardFragments={getRewardFragmentsForQuest(habit)}
                            />
                          ))}
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="diaria" className="mt-4 space-y-4">
          <AnimatePresence mode="popLayout">
            {activeDiarias.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 text-gray-500"
              >
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma tarefa diária ativa</p>
                <p className="text-sm">Crie uma nova tarefa para começar!</p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {activeDiarias.map((quest) => {
                  const hasCheckpoints = (quest.checkpoints || []).length > 0;
                  return (
                    <QuestCard
                      key={quest.id}
                      quest={quest}
                      onComplete={!hasCheckpoints ? () => completeQuest(quest.id, 'diaria') : undefined}
                      onToggleCheckpoint={hasCheckpoints ? (checkpointId) => toggleQuestCheckpoint(quest.id, 'diaria', checkpointId) : undefined}
                      onEdit={() => startEditQuest(quest)}
                      onRequestDelete={() => setPendingDelete(quest)}
                      rewardFragments={getRewardFragmentsForQuest(quest)}
                    />
                  );
                })}
              </div>
            )}
            
            {completedDiarias.length > 0 && (
              <div className="mt-6 border-t border-[#2d2d44] pt-4">
                <button 
                  onClick={() => setShowCompletedDiarias(!showCompletedDiarias)}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors w-full group"
                >
                  {showCompletedDiarias ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <span className="font-bold uppercase tracking-widest text-[10px]">Concluídas Hoje ({completedDiarias.length})</span>
                </button>
                
                {showCompletedDiarias && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3 mt-4"
                  >
                    {completedDiarias.map((quest) => (
                      <QuestCard
                        key={quest.id}
                        quest={quest}
                        onEdit={() => startEditQuest(quest)}
                        onRequestDelete={() => setPendingDelete(quest)}
                        rewardFragments={getRewardFragmentsForQuest(quest)}
                      />
                    ))}
                  </motion.div>
                )}
              </div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="meta" className="mt-4 space-y-4">
          <AnimatePresence mode="popLayout">
            {activeMetas.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 text-gray-500"
              >
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma meta configurada</p>
                <p className="text-sm">Crie metas maiores para focar!</p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {activeMetas.map((quest) => {
                  const hasCheckpoints = (quest.checkpoints || []).length > 0;
                  return (
                    <QuestCard
                      key={quest.id}
                      quest={quest}
                      onComplete={!hasCheckpoints ? () => completeQuest(quest.id, 'meta') : undefined}
                      onToggleCheckpoint={hasCheckpoints ? (checkpointId) => toggleQuestCheckpoint(quest.id, 'meta', checkpointId) : undefined}
                      onEdit={() => startEditQuest(quest)}
                      onRequestDelete={() => setPendingDelete(quest)}
                      rewardFragments={getRewardFragmentsForQuest(quest)}
                    />
                  );
                })}
              </div>
            )}
            
            {completedMetas.length > 0 && (
              <div className="mt-6 border-t border-[#2d2d44] pt-4">
                <button 
                  onClick={() => setShowCompletedMetas(!showCompletedMetas)}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors w-full group"
                >
                  {showCompletedMetas ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <span className="font-bold uppercase tracking-widest text-[10px]">Concluídas Hoje ({completedMetas.length})</span>
                </button>
                
                {showCompletedMetas && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3 mt-4"
                  >
                    {completedMetas.map((quest) => (
                      <QuestCard
                        key={quest.id}
                        quest={quest}
                        onEdit={() => startEditQuest(quest)}
                        onRequestDelete={() => setPendingDelete(quest)}
                        rewardFragments={getRewardFragmentsForQuest(quest)}
                      />
                    ))}
                  </motion.div>
                )}
              </div>
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>

      {/* Calendar Dialog */}
      <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
        <DialogContent className="bg-[#1a1a2e] border-[#2d2d44] text-white max-w-2xl max-h-[100vh] overflow-hidden p-0">
          <DialogHeader className="p-6 pb-4 border-b border-[#2d2d44]">
            <DialogTitle className="font-cinzel text-xl flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              Calendário de Tarefas
            </DialogTitle>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[calc(100vh-120px)] p-6 pt-4">
            <CalendarView 
              quests={gameState.quests}
              onSelectDate={(date) => setSelectedDate(date)}
              selectedDate={selectedDate}
              onQuestClick={handleQuestClick}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Quest Management Modal */}
      <Dialog open={showQuestModal} onOpenChange={setShowQuestModal}>
        <DialogContent className="bg-[#1a1a2e] border-[#2d2d44] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="font-cinzel text-xl">
              📜 {selectedQuest?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedQuest && (
            <div className="space-y-4 mt-4">
              <div className="bg-[#16213e] rounded-lg p-4 space-y-2">
                <p className="text-gray-400 text-sm">{selectedQuest.description || 'Sem descrição'}</p>
                <div className="flex items-center gap-4 text-sm">
                  {getRewardFragmentsForQuest(selectedQuest) > 0 && (
                    <span className="text-purple-300">💎 +{getRewardFragmentsForQuest(selectedQuest)} fragmentos</span>
                  )}
                  <span className="text-cyan-400">⚡ Energia: {gameState.character.energy}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{difficultyConfig[selectedQuest.difficulty].emoji}</span>
                  <span className="text-gray-400 text-sm">{difficultyConfig[selectedQuest.difficulty].label}</span>
                </div>
                {selectedQuest.type !== 'habito' && selectedQuest.scheduledDate && (
                  <p className="text-orange-400 text-sm">📅 {selectedQuest.scheduledDate.split('-').reverse().join('/')}</p>
                )}
                {selectedQuest.type === 'habito' && (selectedQuest.habitDays || []).length > 0 && (
                  <p className="text-orange-400 text-sm">
                    🔁 {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
                      .filter((_, idx) => (selectedQuest.habitDays || []).includes(idx as DayOfWeek))
                      .join(' • ')}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {selectedQuest.type !== 'habito' && !selectedQuest.completed && (selectedQuest.checkpoints || []).length === 0 && (
                  <Button
                    onClick={handleCompleteFromModal}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Concluir
                  </Button>
                )}
                <Button
                  onClick={() => startEditQuest(selectedQuest)}
                  variant="outline"
                  className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button
                  onClick={() => setPendingDelete(selectedQuest)}
                  variant="outline"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </Button>
                <Button
                  onClick={() => setShowQuestModal(false)}
                  variant="outline"
                  className="border-gray-600 text-gray-400 col-span-full"
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) setEditingQuest(null);
        }}
      >
        <DialogContent className="bg-[#1a1a2e] border-[#2d2d44] text-white w-[calc(100vw-1.5rem)] sm:max-w-md max-h-[85vh] overflow-y-auto overflow-x-hidden p-3 sm:p-4 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] focus:outline-none">
          <DialogHeader className="pb-1">
            <DialogTitle className="font-cinzel text-lg">Editar Tarefa</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2 w-full min-w-0">
            <div>
              <label className="text-xs text-gray-400 mb-1 block font-medium">Nome</label>
              <Input
                value={editQuestDraft.title}
                onChange={(e) => setEditQuestDraft(prev => ({ ...prev, title: e.target.value }))}
                className="bg-black/40 border-gray-700 h-9 text-xs sm:text-sm px-3"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block font-medium">Descrição (opcional)</label>
              <Textarea
                value={editQuestDraft.description}
                onChange={(e) => setEditQuestDraft(prev => ({ ...prev, description: e.target.value }))}
                className="bg-black/40 border-gray-700 resize-none h-16 text-xs sm:text-sm p-2.5"
              />
            </div>

            <div className="flex items-center justify-between gap-2 bg-black/30 border border-white/10 rounded-lg p-2.5">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">Multitarefa</p>
                <p className="text-[10px] text-gray-500 truncate">Checkpoints múltiplos</p>
              </div>
              <Switch
                checked={editQuestDraft.isMultitask}
                onCheckedChange={(checked) => {
                  setEditQuestDraft(prev => ({
                    ...prev,
                    isMultitask: checked,
                    checkpointTitles: checked ? prev.checkpointTitles : [],
                  }));
                  setEditCheckpointText('');
                }}
              />
            </div>

            {editQuestDraft.isMultitask && (
              <div className="bg-black/30 border border-white/10 rounded-lg p-2.5 space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Novo checkpoint..."
                    value={editCheckpointText}
                    onChange={(e) => setEditCheckpointText(e.target.value)}
                    className="bg-black/40 border-gray-700 h-8 text-xs px-2"
                  />
                  <Button
                    type="button"
                    className="bg-purple-600 hover:bg-purple-700 h-8 px-3 text-xs"
                    onClick={() => {
                      const title = editCheckpointText.trim();
                      if (!title) return;
                      setEditQuestDraft(prev => ({ ...prev, checkpointTitles: [...prev.checkpointTitles, title] }));
                      setEditCheckpointText('');
                    }}
                  >
                    Adicionar
                  </Button>
                </div>

                <div className="space-y-1">
                  {editQuestDraft.checkpointTitles.map((t, idx) => (
                    <div key={`${t}-${idx}`} className="flex items-center justify-between gap-2 bg-black/40 border border-white/10 rounded px-2 py-1">
                      <span className="text-[11px] text-gray-300 truncate">{t}</span>
                      <button
                        type="button"
                        className="text-red-400 hover:text-red-300 text-[10px] font-bold shrink-0"
                        onClick={() => setEditQuestDraft(prev => ({ ...prev, checkpointTitles: prev.checkpointTitles.filter((_, i) => i !== idx) }))}
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-xs text-gray-400 mb-1 block font-medium">Dificuldade</label>
              <Select
                value={editQuestDraft.difficulty}
                onValueChange={(v) => setEditQuestDraft(prev => ({ ...prev, difficulty: v as Difficulty }))}
              >
                <SelectTrigger className="bg-[#16213e] border-[#2d2d44] text-white h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a2e] border-[#2d2d44]">
                  {Object.entries(difficultyConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key} className="text-white text-xs">
                      <div className="flex items-center gap-1.5">
                        <span>{config.emoji}</span>
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {editingQuest?.type === 'habito' ? (
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 block font-medium">Dias da Semana</label>
                <div className="flex flex-wrap gap-1.5">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, idx) => {
                    const dayVal = idx as DayOfWeek;
                    const isSelected = editQuestDraft.habitDays.includes(dayVal);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          setEditQuestDraft(prev => ({
                            ...prev,
                            habitDays: isSelected
                              ? prev.habitDays.filter(d => d !== dayVal)
                              : [...prev.habitDays, dayVal],
                          }));
                        }}
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all border",
                          isSelected
                            ? "bg-orange-500 border-orange-400 text-white shadow-sm"
                            : "bg-black/40 border-gray-700 text-gray-400"
                        )}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-2.5 space-y-2 w-full">
              <div className="grid grid-cols-2 gap-2 w-full">
                {editingQuest?.type !== 'habito' && (
                  <div className="min-w-0">
                    <label className="text-xs text-cyan-400 mb-1 block flex items-center gap-1 font-medium truncate">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      Dia (opcional)
                    </label>
                    <Input
                      type="date"
                      value={editQuestDraft.scheduledDate}
                      onChange={(e) => setEditQuestDraft(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      className="bg-[#16213e] border-cyan-500/50 text-white h-8 text-xs px-1.5"
                    />
                  </div>
                )}

                <div className={editingQuest?.type === 'habito' ? 'col-span-2 min-w-0' : 'min-w-0'}>
                  <label className="text-xs text-cyan-400 mb-1 block flex items-center gap-1 font-medium truncate">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    Horário (opcional)
                  </label>
                  <Input
                    type="time"
                    value={editQuestDraft.scheduledTime}
                    onChange={(e) => setEditQuestDraft(prev => ({ ...prev, scheduledTime: e.target.value }))}
                    className="bg-[#16213e] border-cyan-500/50 text-white h-8 text-xs px-1.5"
                  />
                </div>
              </div>
            </div>

            {/* Notificação de Lembrete Switch (Edit Modal) */}
            <div className="bg-purple-950/40 border border-purple-500/40 rounded-lg p-2.5 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-purple-300 flex items-center gap-1.5 truncate">
                    <Bell className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    Lembrete por Notificação
                  </p>
                  <p className="text-[10px] text-gray-400 truncate">
                    Notificar no celular/navegador no horário agendado
                  </p>
                </div>
                <Switch
                  checked={editQuestDraft.reminderEnabled}
                  onCheckedChange={async (checked) => {
                    let defaultTime = editQuestDraft.scheduledTime;
                    if (checked) {
                      if (!defaultTime) {
                        const nowBRT = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
                        defaultTime = nowBRT;
                      }
                      const perm = await requestNotificationPermission();
                      if (perm === 'denied') {
                        alert('As notificações estão bloqueadas no seu navegador. Por favor, permita notificações nas configurações do seu dispositivo/navegador para receber os lembretes.');
                      } else {
                        await subscribeUserToPush();
                      }
                    }
                    setEditQuestDraft(prev => ({ ...prev, reminderEnabled: checked, scheduledTime: defaultTime }));
                  }}
                />
              </div>
              {editQuestDraft.reminderEnabled && (
                <p className="text-[9px] text-purple-300/80 pt-1 border-t border-purple-500/20 leading-tight">
                  ⏰ Horário de Brasília (BRT). No iPhone/iOS, adicione o aplicativo à <b>Tela de Início</b> para receber em 2º plano.
                </p>
              )}
            </div>

            {editingQuest?.type === 'meta' && (
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                <label className="text-sm text-purple-400 mb-2 block flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Meta (quantidade)
                </label>
                <Input
                  type="number"
                  value={editQuestDraft.metaTarget}
                  onChange={(e) => setEditQuestDraft(prev => ({ ...prev, metaTarget: parseInt(e.target.value) || 100 }))}
                  className="bg-[#16213e] border-purple-500/50 text-white"
                  min={1}
                />
              </div>
            )}

            {(!autoRewardsEnabled || editingQuest?.type === 'meta') && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <label className="text-sm text-yellow-500 mb-2 block flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Ganho de Energia
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="10"
                          value={editQuestDraft.energyReward}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val)) {
                              setEditQuestDraft(prev => ({ ...prev, energyReward: Math.min(10, Math.max(0, val)) }));
                            } else if (e.target.value === '') {
                              setEditQuestDraft(prev => ({ ...prev, energyReward: 0 }));
                            }
                          }}
                          className="w-16 bg-black/40 border border-yellow-500/30 rounded-lg px-2 py-1 text-right font-black text-yellow-500 focus:outline-none focus:border-yellow-500 transition-colors"
                        />
                        <span className="text-sm font-black text-yellow-500">NRG</span>
                      </div>
                      <div className="text-[10px] text-purple-400 font-bold mt-1">
                        ≈ {Math.floor(editQuestDraft.energyReward * 5)} Fragmentos
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={applyEditQuest}
                className="bg-purple-600 hover:bg-purple-700 flex-1"
              >
                Salvar
              </Button>
              <Button
                onClick={() => setIsEditDialogOpen(false)}
                variant="outline"
                className="border-gray-600 text-gray-400"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent className="bg-[#1a1a2e] border-[#2d2d44] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Excluir {pendingDelete?.type === 'habito' ? 'hábito' : 'tarefa'}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#2d2d44] bg-transparent text-gray-300 hover:bg-[#16213e]">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (!pendingDelete) return;
                deleteQuest(pendingDelete.id, pendingDelete.type);
                setPendingDelete(null);
                if (selectedQuest?.id === pendingDelete.id) {
                  setShowQuestModal(false);
                  setSelectedQuest(null);
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Chest Reward Modal */}
      <Dialog open={showChestModal} onOpenChange={setShowChestModal}>
        <DialogContent className="bg-[#12121c] border-[#252538] text-white max-w-sm rounded-2xl p-5 text-center">
          {selectedChestReward && (
            <div className="space-y-4 py-2">
              <div className="relative inline-block">
                <img
                  src={getChestImagePath(selectedChestReward.defaultRarity)}
                  alt={selectedChestReward.title}
                  className="w-24 h-24 mx-auto object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                />
                {claimedStreakRewards.includes(selectedChestReward.days) && (
                  <div className="absolute top-0 right-0 bg-green-500 text-white rounded-full p-1 border-2 border-black">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xl font-bold font-cinzel text-purple-300">
                  {selectedChestReward.title}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Milestone de {selectedChestReward.days} dias de streak ininterrupto!
                </p>

                {selectedChestReward.chanceInfo && (
                  <span className="inline-block bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full mt-2">
                    🎲 Sorteio: {selectedChestReward.chanceInfo}
                  </span>
                )}
              </div>

              {/* Unlocked Title Badge */}
              {selectedChestReward.titleUnlocked && (
                <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/40 rounded-xl p-2.5 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 shadow-inner">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Título: "{selectedChestReward.titleUnlocked}"</span>
                </div>
              )}

              {/* Rewards List */}
              <div className="bg-black/40 border border-white/10 rounded-xl p-3 grid grid-cols-2 gap-2 text-left text-xs font-semibold">
                <div className="flex items-center gap-1.5 text-amber-400">
                  <span>🪙</span> +{selectedChestReward.gold} Ouro
                </div>
                <div className="flex items-center gap-1.5 text-purple-400">
                  <span>💎</span> +{selectedChestReward.crystals} Cristais
                </div>
                <div className="flex items-center gap-1.5 text-cyan-400">
                  <span>⚡</span> +{selectedChestReward.energy} Energia
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span>📦</span> 1x Baú
                </div>
              </div>

              {/* Action Button */}
              {claimedStreakRewards.includes(selectedChestReward.days) ? (
                <Button disabled className="w-full bg-green-950/60 border border-green-500/40 text-green-300 h-10 font-bold">
                  ✓ Recompensa Já Resgatada
                </Button>
              ) : (gameState.character.stats.streak || 0) >= selectedChestReward.days ? (
                <Button
                  onClick={() => {
                    handleClaimChest(selectedChestReward);
                    setShowChestModal(false);
                  }}
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black h-10 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                >
                  <Gift className="w-4 h-4 mr-1.5" />
                  Resgatar Recompensa!
                </Button>
              ) : (
                <Button disabled className="w-full bg-gray-800/80 border border-gray-700 text-gray-400 h-10 text-xs">
                  🔒 Requer {selectedChestReward.days} dias (Faltam {selectedChestReward.days - (gameState.character.stats.streak || 0)} dias)
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Streak Info Modal */}
      <Dialog open={showStreakInfoModal} onOpenChange={setShowStreakInfoModal}>
        <DialogContent className="bg-[#141420] border-[#2a2a3e] text-white max-w-md rounded-2xl p-5 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-cinzel text-lg flex items-center gap-2 text-purple-400">
              <Flame className="w-5 h-5 text-orange-500" />
              Títulos & Recompensas de Streak
            </DialogTitle>
          </DialogHeader>
          <div className="text-xs text-gray-300 space-y-3 py-2 leading-relaxed">
            <p>
              🔥 <strong>Mantenha a consistência:</strong> Conclua suas tarefas diariamente para manter e evoluir seu streak contínuo!
            </p>

            <div className="bg-black/40 border border-white/10 rounded-xl p-3 space-y-2">
              <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider font-cinzel flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Títulos Conquistáveis:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-gray-300">
                <div>• <strong>7 dias:</strong> Portador da Chama</div>
                <div>• <strong>14 dias:</strong> Discipulo da Forja</div>
                <div>• <strong>28 dias:</strong> Guerreiro Incansável</div>
                <div>• <strong>42 dias:</strong> Cavaleiro da Persistência</div>
                <div>• <strong>56 dias:</strong> Forjado na Disciplina</div>
                <div>• <strong>70 dias:</strong> Mestre da Forja</div>
                <div>• <strong>100 dias:</strong> Senhor da Constância</div>
                <div>• <strong>150 dias:</strong> Lenda</div>
                <div>• <strong>200 dias:</strong> Eterno</div>
                <div>• <strong>365 dias:</strong> Ascendido</div>
              </div>
            </div>

            <div className="bg-black/40 border border-white/10 rounded-xl p-3 space-y-1 text-[11px] text-gray-300">
              <h4 className="text-[11px] font-bold text-purple-400 uppercase tracking-wider font-cinzel">
                🎲 Sorteio de Baús:
              </h4>
              <p>• <strong>42d a 150d:</strong> 70% Raro / 30% Épico</p>
              <p>• <strong>175d a 300d:</strong> 60% Épico / 40% Raro</p>
              <p>• <strong>325d:</strong> 80% Épico / 20% Lendário</p>
              <p>• <strong>365d:</strong> 100% Lendário</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Statistics Modal */}
      <Dialog open={showStatsModal} onOpenChange={setShowStatsModal}>
        <DialogContent className="bg-[#12121c] border-[#252538] text-white max-w-md rounded-2xl p-5">
          <DialogHeader>
            <DialogTitle className="font-cinzel text-lg flex items-center gap-2 text-emerald-400">
              <BarChart2 className="w-5 h-5" />
              Estatísticas de Produtividade
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Streak & Consistência */}
            <div className="bg-black/40 border border-white/10 rounded-xl p-3.5 space-y-2">
              <h4 className="text-xs font-bold text-orange-400 font-cinzel flex items-center gap-1.5">
                <Flame className="w-4 h-4" />
                Consistência & Streak
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#181826] p-2.5 rounded-lg border border-white/5">
                  <span className="text-gray-400 text-[10px] block">Streak Atual</span>
                  <span className="text-lg font-black text-white">{gameState.character.stats.streak} dias</span>
                </div>
                <div className="bg-[#181826] p-2.5 rounded-lg border border-white/5">
                  <span className="text-gray-400 text-[10px] block">Recorde Máximo</span>
                  <span className="text-lg font-black text-orange-400">{gameState.character.stats.maxStreak} dias</span>
                </div>
              </div>
            </div>

            {/* Quadro de Tarefas */}
            <div className="bg-black/40 border border-white/10 rounded-xl p-3.5 space-y-2">
              <h4 className="text-xs font-bold text-cyan-400 font-cinzel flex items-center gap-1.5">
                <Target className="w-4 h-4" />
                Resumo de Tarefas
              </h4>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-[#181826] p-2 rounded-lg border border-white/5">
                  <span className="text-orange-400 text-[10px] font-bold block">Hábitos</span>
                  <span className="text-base font-black text-white">{activeHabitos.length}</span>
                </div>
                <div className="bg-[#181826] p-2 rounded-lg border border-white/5">
                  <span className="text-cyan-400 text-[10px] font-bold block">Diárias</span>
                  <span className="text-base font-black text-white">{activeDiarias.length}</span>
                </div>
                <div className="bg-[#181826] p-2 rounded-lg border border-white/5">
                  <span className="text-purple-400 text-[10px] font-bold block">Metas</span>
                  <span className="text-base font-black text-white">{activeMetas.length}</span>
                </div>
              </div>
            </div>

            {/* Recompensas de Streak Resgatadas */}
            <div className="bg-black/40 border border-white/10 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-purple-300 block">Baús de Streak Resgatados</span>
                <span className="text-[10px] text-gray-400">Milestones atingidos</span>
              </div>
              <span className="text-lg font-black text-amber-400 font-mono">
                {claimedStreakRewards.length} / {STREAK_REWARDS.length}
              </span>
            </div>

            <Button
              onClick={() => setShowStatsModal(false)}
              className="w-full bg-[#1e1e2d] hover:bg-[#28283d] text-gray-200 border border-white/10 h-9 text-xs"
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

// Calendar View Component
interface CalendarViewProps {
  quests: { habito: Quest[]; diaria: Quest[]; meta: Quest[] };
  onSelectDate: (date: string) => void;
  selectedDate: string | null;
  onQuestClick: (quest: Quest) => void;
}

function CalendarView({ quests, onSelectDate, selectedDate, onQuestClick }: CalendarViewProps) {
  // Use Brazil timezone for calendar
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    // Format to Brazil date
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const parts = formatter.formatToParts(now);
    const year = parseInt(parts.find(p => p.type === 'year')?.value || '2024');
    const month = parseInt(parts.find(p => p.type === 'month')?.value || '1') - 1;
    const day = parseInt(parts.find(p => p.type === 'day')?.value || '1');
    return new Date(year, month, day);
  });
  
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  
  // Helper to get Brazil date string from year, month, day
  const getBrazilDateStr = (year: number, month: number, day: number): string => {
    const date = new Date(year, month, day);
    return getBrazilDateStringFromDate(date);
  };
  
  const getQuestsForDate = (dateStr: string) => {
    const allQuests = [...quests.habito, ...quests.diaria, ...quests.meta];
    return allQuests.filter(q => {
      if (q.scheduledDate === dateStr) return true;
      if (q.type === 'diaria' && !q.completed) {
        // Use Brazil timezone for quest date comparison
        const questDate = getBrazilDateStringFromDate(new Date(q.createdAt));
        return questDate === dateStr;
      }
      if (q.type === 'habito' && Array.isArray(q.habitDays) && q.habitDays.length > 0) {
        const [yearStr, monthStr, dayStr] = dateStr.split('-');
        const year = parseInt(yearStr);
        const month = parseInt(monthStr);
        const day = parseInt(dayStr);
        if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return false;
        const dateForTz = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
        const weekday = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', weekday: 'short' })
          .format(dateForTz);
        const dayMap: Record<string, DayOfWeek> = {
          Sun: 0,
          Mon: 1,
          Tue: 2,
          Wed: 3,
          Thu: 4,
          Fri: 5,
          Sat: 6,
        };
        const dow = dayMap[weekday];
        if (dow === undefined) return false;
        return q.habitDays.includes(dow);
      }
      return false;
    });
  };
  
  const getDifficultyColor = (difficulty: Difficulty) => {
    return difficultyConfig[difficulty].bg.replace('/20', '/40');
  };
  
  const renderDay = (day: number) => {
    // CRITICAL: Use Brazil timezone for date string
    const dateStr = getBrazilDateStr(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dayQuests = getQuestsForDate(dateStr);
    const isSelected = selectedDate === dateStr;
    
    return (
      <motion.button
        key={day}
        onClick={() => onSelectDate(dateStr)}
        className={cn(
          'aspect-square p-2 rounded-lg border transition-all text-left relative',
          isSelected ? 'border-purple-500 bg-purple-500/20' : 'border-[#2d2d44] hover:border-purple-500/50',
          dayQuests.length > 0 && !isSelected && 'bg-[#16213e]'
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="text-sm font-medium">{day}</span>
        
        {dayQuests.length > 0 && (
          <div className="absolute bottom-1 left-1 right-1 flex gap-0.5 flex-wrap">
            {dayQuests.slice(0, 3).map((q, i) => (
              <div 
                key={i} 
                className={cn(
                  'w-2 h-2 rounded-full',
                  q.completed ? 'bg-green-500' : getDifficultyColor(q.difficulty)
                )}
              />
            ))}
            {dayQuests.length > 3 && (
              <span className="text-[8px] text-gray-500">+{dayQuests.length - 3}</span>
            )}
          </div>
        )}
      </motion.button>
    );
  };
  
  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="p-2 hover:bg-[#16213e] rounded-lg transition-colors"
        >
          ←
        </button>
        <span className="font-semibold text-lg">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </span>
        <button 
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="p-2 hover:bg-[#16213e] rounded-lg transition-colors"
        >
          →
        </button>
      </div>
      
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
          <div key={d}>{d}</div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => renderDay(i + 1))}
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-2 text-xs pt-2 border-t border-[#2d2d44]">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-gray-400">Concluída</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-400/40" />
          <span className="text-gray-400">🟩 Muito Fácil</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400/40" />
          <span className="text-gray-400">🟢 Fácil</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-400/40" />
          <span className="text-gray-400">🔵 Normal</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-purple-400/40" />
          <span className="text-gray-400">🟣 Difícil</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-400/40" />
          <span className="text-gray-400">🔴 Muito Difícil</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-yellow-400/40" />
          <span className="text-gray-400">🟡 Meta</span>
        </div>
      </div>
      
      {/* Selected Date Quests */}
      {selectedDate && (
        <div className="mt-4 p-4 bg-[#16213e] rounded-lg">
          <h4 className="font-semibold mb-3">
            Tarefas de {selectedDate.split('-').reverse().join('/')}
          </h4>
          <p className="text-xs text-gray-500 mb-2">Clique em uma tarefa para gerenciar</p>
          {getQuestsForDate(selectedDate).length === 0 ? (
            <p className="text-gray-500 text-sm">Nenhuma tarefa para este dia</p>
          ) : (
            <div className="space-y-2">
              {getQuestsForDate(selectedDate).map(q => (
                <button
                  key={q.id}
                  onClick={() => onQuestClick(q)}
                  className="w-full flex items-center gap-2 p-3 bg-[#1a1a2e] rounded hover:bg-[#252542] transition-colors text-left"
                >
                  <span className="text-lg">{difficultyConfig[q.difficulty].emoji}</span>
                  <span className={cn('flex-1', q.completed && 'line-through text-gray-500')}>
                    {q.title}
                  </span>
                  {q.completed ? (
                    <span className="text-green-400 text-xs">✓ Concluída</span>
                  ) : (
                    <span className="text-gray-500 text-xs">NRG: +{q.energyReward.toFixed(2).replace(/\.?0+$/, '')}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
