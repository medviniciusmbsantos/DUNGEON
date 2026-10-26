import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Heart,
  Lock,
  RotateCcw,
  Settings,
  Skull,
  Sparkles,
  Star,
  Sword,
  Target,
  X,
  Zap,
} from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PETS, getBrazilDate } from '@/types/game';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

interface DashboardProps {
  onEnterDungeon: () => void;
}

export function Dashboard({ onEnterDungeon }: DashboardProps) {
  const {
    gameState,
    resetProgress,
    restCharacter,
    recoverEnergy,
    selectPet,
    unlockPet,
    startUnlockingChest,
    collectChestRewards,
    claimDailyMission
  } = useGame();
  const { character, recoveryMode, selectedPetId, economy, unlockedPets, playerProfile } = gameState;
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showPetSelector, setShowPetSelector] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [avatarOk, setAvatarOk] = useState(true);
  const [isResting, setIsResting] = useState(false);
  const [sleepOverlay, setSleepOverlay] = useState<'in' | 'out' | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const handleRecoverEnergy = () => {
    recoverEnergy();
    setShowSettings(false);
  };

  const handleRest = () => {
    if ((!gameState.settings?.infiniteEnergy && character.energy < 1) || isResting) return;

    setIsResting(true);
    setSleepOverlay('in');

    window.setTimeout(() => {
      restCharacter();
      setSleepOverlay('out');
    }, 2000);
    window.setTimeout(() => {
      setSleepOverlay(null);
      setIsResting(false);
    }, 3500);
  };

  const hpPercent = (character.hp / character.maxHp) * 100;
  const isLowHp = hpPercent < 50;

  const handleReset = () => {
    if (resetStep === 1) {
      setResetStep(2);
    } else {
      resetProgress();
      setShowResetConfirm(false);
      setResetStep(1);
      window.location.reload();
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const formatTimeHM = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const brazilNow = getBrazilDate();
  const nextBrazilMidnight = new Date(brazilNow);
  nextBrazilMidnight.setHours(24, 0, 0, 0);
  const dailyResetInMs = Math.max(0, nextBrazilMidnight.getTime() - brazilNow.getTime());

  const dailyMissions = (gameState.dailyMissions?.missions || [])
    .slice()
    .sort((a, b) => a.slot - b.slot);

  const missionIcon = (kind: string) => {
    switch (kind) {
      case 'login':
        return Zap;
      case 'defeatEnemies':
        return Sword;
      case 'openChests':
        return Lock;
      case 'dealCrits':
        return Star;
      case 'completeTasks':
      case 'completeTasksPercent':
        return Target;
      case 'earnGold':
        return Sparkles;
      case 'upgradeItem':
      case 'upgradeToLevel':
        return Star;
      case 'dismantleItems':
        return Skull;
      default:
        return Target;
    }
  };

  const rarityColors = {
    common: 'border-gray-500 text-gray-400 bg-gray-500/10',
    rare: 'border-blue-500 text-blue-400 bg-blue-500/10',
    epic: 'border-purple-500 text-purple-400 bg-purple-500/10',
    legendary: 'border-yellow-500 text-yellow-400 bg-yellow-500/10',
  };

  const chestImages: Record<string, string> = {
    common: '/chests/common.png',
    rare: '/chests/rare.png',
    epic: '/chests/epic.png',
    legendary: '/chests/legendary.png',
  };

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-2 pt-9 pb-4"
      >
        {/* Top Section: Profile (Left 50%) + Resources (Right 50%) */}
        <div className="grid grid-cols-2 gap-2 h-[350px]">

          {/* LEFT COLUMN: Profile (50%) */}
          <motion.div variants={itemVariants} className="col-span-1 card-dungeon p-0 flex flex-col h-full overflow-hidden bg-black/40">
            <div className="flex flex-col h-full">
              {/* Expanded Avatar - Increased height to take more space */}
              <div className="flex-1 w-full relative">
                <img
                  key={(playerProfile?.avatarUrl || 'fallback') + (avatarOk ? ':ok' : ':fallback')}
                  src={
                    playerProfile?.avatarUrl && avatarOk
                      ? playerProfile.avatarUrl
                      : "https://img.freepik.com/free-photo/view-gnome-creature-nature_23-2150756358.jpg"
                  }
                  alt="Avatar"
                  className="w-full h-full object-cover opacity-90"
                  onError={() => setAvatarOk(false)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              </div>

              {/* Content below the avatar */}
              <div className="p-2 pt-1 flex flex-col shrink-0 justify-end gap-0.5 bg-black/40 backdrop-blur-sm border-t border-white/5">
                <div className="flex flex-col mb-0.5 overflow-hidden">
                  <h2 className="text-xs font-bold text-white font-cinzel truncate">
                    {character.name || 'A'}
                  </h2>
                  <p className="text-purple-400 font-bold uppercase tracking-widest text-[6px] truncate font-cinzel -mt-0.5">
                    {recoveryMode ? 'Em Recuperação' : 'Persistente'}
                  </p>
                </div>

                <div className="space-y-1.5">
                  {/* HP Bar */}
                  <div>
                    <div className="flex justify-between items-center mb-0.5">
                      <div className="flex items-center gap-1">
                        <Heart className={cn("w-2 h-2", isLowHp ? "text-red-500 animate-pulse" : "text-green-500")} />
                        <span className="text-[8px] font-black text-white/70 uppercase tracking-tighter font-cinzel">HP</span>
                      </div>
                      <span className="text-[8px] font-bold text-green-400 font-cinzel">
                        {Math.round(character.hp)} / {character.maxHp}
                      </span>
                    </div>
                    <div className="h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                      <motion.div
                        className="h-full bg-gradient-to-r from-green-600 to-green-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${(character.hp / character.maxHp) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Level/XP Bar */}
                  <div>
                    <div className="flex justify-between items-center mb-0.5">
                      <div className="flex items-center gap-1">
                        <Star className="w-2 h-2 text-yellow-500" />
                        <span className="text-[8px] font-black text-white/70 uppercase tracking-tighter font-cinzel">NÍVEL {character.level}</span>
                      </div>
                      <span className="text-[8px] font-bold text-purple-400 font-cinzel">
                        {character.xp} / {character.maxXp}
                      </span>
                    </div>
                    <div className="h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-600 to-purple-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${(character.xp / character.maxXp) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Pet Info Line */}
                  <button
                    onClick={() => setShowPetSelector(true)}
                    className="flex items-center gap-1 bg-black/60 p-1 rounded-md border border-white/10 w-full group hover:border-purple-500/30 transition-all"
                  >
                    <div className="w-5 h-5 rounded-sm bg-white/5 flex items-center justify-center text-xs group-hover:scale-110 transition-transform">
                      {selectedPetId ? PETS[selectedPetId].icon : '🐾'}
                    </div>
                    <div className="text-left overflow-hidden">
                      <h4 className="text-[8px] font-bold text-purple-400 font-cinzel truncate">
                        {selectedPetId ? PETS[selectedPetId].name : 'Pet'}
                      </h4>
                      <p className="text-[6px] text-gray-500 font-bold uppercase">Lvl 1</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Resources (50%) */}
          <div className="col-span-1 flex flex-col h-full gap-2">

            {/* Energy Card */}
            <motion.div variants={itemVariants} className="card-dungeon p-2 bg-gradient-to-br from-yellow-900/10 to-transparent flex-[0.8] flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500/20" />
                <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest font-cinzel">ENERGIA</span>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-xl font-black text-white tracking-tight leading-none">{character.energy}</span>
                <span className="text-xl font-black text-white tracking-tight leading-none">/ {character.maxEnergy}</span>
              </div>
              <div className="mt-3 px-0.5">
                <div className="h-4 bg-black/40 rounded-full overflow-hidden border border-white/5">
                  <motion.div
                    className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${(character.energy / character.maxEnergy) * 100}%` }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Fragments Card */}
            <motion.div variants={itemVariants} className="card-dungeon p-2 bg-gradient-to-br from-purple-900/10 to-transparent flex-[0.8]">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest font-cinzel">FRAGMENTOS</span>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-xl font-black text-white tracking-tight leading-none">{Math.floor(character.energyFragments)}</span>
                <span className="text-xl font-black text-white tracking-tight leading-none">/ 5</span>
              </div>
              <div className="flex gap-2.5 mb-1.5 px-1">
                {[...Array(5)].map((_, i) => {
                  const isFilled = i < Math.floor(character.energyFragments);
                  return (
                    <div
                      key={i}
                      className={cn(
                        "w-4 h-6 rounded-[1px] border transition-all duration-300",
                        isFilled
                          ? "bg-cyan-500 border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                          : "bg-cyan-900/10 border-white/5"
                      )}
                      style={{
                        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                        transform: 'rotate(30deg)'
                      }}
                    />
                  );
                })}
              </div>
              <p className="text-[6px] text-gray-400 font-bold tracking-tight leading-none uppercase">a cada 5 fragmentos você ganha +1 energia</p>
            </motion.div>

            {/* Rest Card - Fixed height to align with bottom of profile */}
            <motion.div variants={itemVariants} className="card-dungeon p-0 overflow-hidden group relative flex-1 min-h-0">
              <div className="grid grid-cols-2 h-full">
                {/* Left: Image */}
                <div className="relative overflow-hidden border-r border-white/5">
                  <img
                    src="/campfire.png"
                    alt="Campfire"
                    className="w-full h-full object-cover contrast-105 saturate-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
                </div>

                {/* Right: Content */}
                <div className="relative z-10 p-2 flex flex-col h-full text-center">
                  <div className="w-full flex items-start justify-start">
                    <h3 className="text-[7px] font-bold text-white font-cinzel tracking-widest uppercase">ACAMPAMENTO</h3>
                  </div>

                  <div className="flex-1" />

                  <div className="w-full flex flex-col items-center gap-1">
                    <div className="flex items-center justify-center gap-1.5">
                      <Zap className="w-3 h-3 text-yellow-500/70" />
                      <span className="text-[5px] text-gray-400 font-bold tracking-tight uppercase">Custo: 1 Energia</span>
                    </div>
                    <Button
                      onClick={handleRest}
                      disabled={(!gameState.settings?.infiniteEnergy && character.energy < 1) || isResting}
                      className="bg-orange-500/10 hover:bg-orange-500/20 text-white h-7 w-full rounded-sm border border-orange-500/30 flex items-center justify-center group/rest py-0 mt-0.5"
                    >
                      {isResting ? (
                        <span className="text-[8px] animate-pulse font-cinzel">...</span>
                      ) : (
                        <span className="text-[7px] font-black uppercase font-cinzel tracking-widest">Descansar</span>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Missões Diárias Section */}
        <motion.div variants={itemVariants} className="card-dungeon p-1.5">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-[9px] font-bold text-white font-cinzel tracking-widest uppercase">MISSÕES DIÁRIAS</h3>
            <span className="text-[5px] text-gray-500 font-bold uppercase">{formatTimeHM(dailyResetInMs)}</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {dailyMissions.map(mission => {
              const Icon = missionIcon(mission.kind);
              const isClaimable = mission.completed && !mission.claimed;
              const pct = mission.target > 0 ? Math.min(100, Math.floor((mission.progress / mission.target) * 100)) : 0;
              const progressLabel = mission.kind === 'completeTasksPercent'
                ? `(${mission.progress}/${mission.target}%)`
                : `(${mission.progress}/${mission.target})`;

              return (
                <div
                  key={mission.id}
                  className={cn(
                    "p-1.5 rounded-sm border flex items-center gap-2 h-9 text-left",
                    isClaimable ? "border-green-500/60 bg-black/35" : "border-white/5 bg-black/40",
                    mission.claimed && "bg-black/60 opacity-60"
                  )}
                >
                  <Icon className={cn(
                    "w-3 h-3 flex-shrink-0",
                    mission.kind === 'login' ? "text-yellow-500" : "text-gray-500"
                  )} />

                  <div className="flex-1 flex flex-col justify-center gap-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1 min-w-0">
                        <p className="text-[6px] font-bold text-gray-400 truncate leading-none font-cinzel tracking-widest">
                          {mission.title}
                        </p>
                        <span className="text-[6px] font-black text-gray-500 leading-none font-cinzel flex-shrink-0">
                          {progressLabel}
                        </span>
                      </div>

                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        {mission.reward.type === 'energy' ? (
                          <>
                            <Zap className="w-2.5 h-2.5 text-yellow-400" />
                            <span className="text-yellow-400 font-black text-[7px] font-cinzel">{mission.reward.amount}</span>
                          </>
                        ) : (
                          <>
                            <div
                              className="w-[5px] h-[7px] bg-cyan-500 border border-cyan-400 shadow-[0_0_4px_rgba(34,211,238,0.5)]"
                              style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', transform: 'rotate(30deg)' }}
                            />
                            <span className="text-cyan-400 font-black text-[7px] font-cinzel">{mission.reward.amount}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {!mission.completed ? (
                      <div className="h-0.5 bg-black/60 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${pct}%` }} />
                      </div>
                    ) : (
                      <div className="flex items-center justify-end">
                        {isClaimable ? (
                          <Button
                            onClick={() => claimDailyMission(mission.id)}
                            className="h-3 px-1.5 text-[6px] font-black uppercase rounded-[1px] bg-green-600 hover:bg-green-700 text-white font-cinzel"
                          >
                            RESGATAR
                          </Button>
                        ) : (
                          <Button
                            disabled
                            className="h-3 px-1.5 text-[6px] font-black uppercase rounded-[1px] bg-green-700 text-white font-cinzel opacity-100"
                          >
                            COMPLETA
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Baús Section */}
        <motion.div variants={itemVariants} className="card-dungeon p-1 flex flex-col justify-center min-h-[22px]">
          <div className="flex items-center justify-between mb-0.5 px-2">
            <h3 className="text-[8px] font-bold text-white font-cinzel tracking-widest uppercase">BAÚS</h3>
            <span className="text-[5px] text-gray-500 font-bold uppercase tracking-widest font-cinzel"></span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 px-2">
            {gameState.chests.map((chest, index) => (
              <div key={index} className="flex flex-col items-center gap-0.5">
                <div
                  className={cn(
                    "w-full aspect-[10/7] rounded-sm border p-0 transition-all duration-300 flex flex-col items-center justify-center relative overflow-hidden",
                    chest
                      ? rarityColors[chest.rarity]
                      : "border-dashed border-white/5 bg-white/[0.01]"
                  )}
                >
                  {chest ? (
                    <>
                      <motion.img
                        src={chestImages[chest.rarity] || chestImages.common}
                        alt="Baú"
                        className="absolute inset-0 w-full h-full object-cover"
                        animate={chest.status === 'unlocking' ? { y: [0, -1, 0] } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                        draggable={false}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    </>
                  ) : (
                    <div className="opacity-10">
                      <Skull className="w-2 h-2" />
                    </div>
                  )}
                </div>
                {chest && (
                  <Button
                    onClick={() => {
                      if (chest.status === 'locked') startUnlockingChest(index);
                      else if (chest.status === 'unlocked') collectChestRewards(index);
                    }}
                    className={cn(
                      "w-full h-4 text-[7px] font-black uppercase rounded-sm transition-all p-0 font-cinzel overflow-hidden flex items-center justify-center leading-none",
                      chest.status === 'locked' && "bg-purple-900/50 border border-purple-500/40 text-white hover:bg-purple-800/60",
                      chest.status === 'unlocking' && "bg-gray-800 border border-gray-600 text-white",
                      chest.status === 'unlocked' && "bg-green-600 hover:bg-green-700 text-white shadow-sm"
                    )}
                  >
                    {chest.status === 'unlocking' ? (
                      <div className="flex items-center justify-center gap-0.5 w-full h-full px-0.5">
                        <Clock className="text-white shrink-0" style={{ width: '8px', height: '8px', minWidth: '8px', minHeight: '8px', color: '#ffffff' }} />
                        <span className="text-white font-mono text-[7px] font-bold leading-none">
                          {chest.unlockStartedAt ? formatTime(Math.max(0, chest.unlockDuration - (now - chest.unlockStartedAt))) : '--:--'}
                        </span>
                      </div>
                    ) : (chest.status === 'locked' ? 'Desbloquear' : 'Abrir')}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* FOOTER: Static Enter Dungeon Button */}
        <motion.div variants={itemVariants} className="pt-0">
          <motion.button
            onClick={onEnterDungeon}
            className="w-full h-[52px] rounded-2xl bg-gradient-to-r from-yellow-700 via-yellow-500 to-yellow-700 p-[2px] shadow-[0_0_30px_rgba(245,158,11,0.2)] group active:scale-95 transition-all"
          >
            <div className="w-full h-full bg-[#0a0a0a] rounded-[14px] flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-yellow-500/5 group-hover:bg-yellow-500/10 transition-colors" />
              <div className="flex items-center gap-2.5 relative z-10">
                <Sword className="w-4 h-4 text-yellow-500 group-hover:rotate-12 transition-transform" />
                <span className="text-base font-black text-white font-cinzel tracking-widest group-hover:text-yellow-400 uppercase">EXPLORAR MAPA</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 relative z-10">
                <Zap className="w-3 h-3 text-yellow-500/70" />
                <span className="text-[9px] font-bold text-gray-500 tracking-tight uppercase">Custo: 1 Energia</span>
              </div>
            </div>
          </motion.button>
        </motion.div>

        {/* Settings / Recover Energy Dialog */}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="bg-[#1a1a2e] border-[#2d2d44] text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="font-cinzel text-xl flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-400" />
                Configurações
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Energia do Personagem</p>
                    <p className="text-xs text-gray-500">Recuperar todas as energias agora?</p>
                  </div>
                </div>
                <Button
                  onClick={handleRecoverEnergy}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold h-10 px-4 rounded-lg shadow-lg"
                >
                  Recuperar
                </Button>
              </div>

              <Button
                onClick={() => setShowResetConfirm(true)}
                variant="ghost"
                className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Resetar Progresso
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Pet Selector Dialog */}
        <Dialog open={showPetSelector} onOpenChange={setShowPetSelector}>
          <DialogContent className="bg-transparent border-none text-white p-0 shadow-none w-[100dvw] h-[100dvh] max-w-none top-0 left-0 translate-x-0 translate-y-0 sm:w-full sm:h-auto sm:max-w-3xl sm:top-[50%] sm:left-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%]">
            <div className="relative w-full h-full sm:h-auto sm:rounded-2xl border-2 border-purple-500/60 bg-black/80 shadow-[0_0_80px_rgba(168,85,247,0.25)] overflow-hidden flex flex-col">
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.25),transparent_55%)]" />

              <div className="sticky top-0 z-20 bg-black/70 backdrop-blur-md border-b border-white/10 px-4 py-3 sm:px-6 sm:py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-9 h-9 rounded-full border border-purple-500/40 bg-purple-500/10 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4.5 h-4.5 text-purple-400" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-2xl font-black font-cinzel tracking-widest text-white truncate">PETS</h2>
                      <p className="text-[10px] sm:text-xs text-gray-400 truncate">
                        Colete fragmentos para desbloquear e escolher seu pet.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPetSelector(false)}
                    className="w-9 h-9 rounded-xl border border-white/10 bg-black/40 hover:bg-black/60 flex items-center justify-center shrink-0"
                  >
                    <X className="w-4 h-4 text-gray-300" />
                  </button>
                </div>
              </div>

              <div className="relative flex-1 overflow-auto px-4 pt-4 pb-28 sm:px-6 sm:pb-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {Object.values(PETS).map((pet) => {
                    const isUnlocked = (unlockedPets || []).includes(pet.id);
                    const isActive = selectedPetId === pet.id;
                    const have = economy.petShards || 0;
                    const need = pet.unlockCost;
                    const canUnlock = !isUnlocked && have >= need;
                    const progress = Math.min(1, need > 0 ? have / need : 0);

                    return (
                      <motion.button
                        key={pet.id}
                        onClick={() => {
                          if (isUnlocked) {
                            selectPet(isActive ? null : pet.id);
                            setShowPetSelector(false);
                            return;
                          }
                          if (canUnlock) {
                            unlockPet(pet.id);
                            selectPet(pet.id);
                          }
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "relative rounded-xl border overflow-hidden text-left p-2 sm:p-3 transition-all",
                          isActive ? "border-purple-400 bg-purple-500/10" : "border-white/10 bg-black/40 hover:border-white/20",
                          !isUnlocked && "opacity-90"
                        )}
                        style={{ boxShadow: isActive ? `0 0 24px ${pet.color}33` : undefined }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[10px] sm:text-[11px] font-black font-cinzel truncate" style={{ color: pet.color }}>
                              {pet.name}
                            </p>
                            <p className="text-[8px] sm:text-[9px] text-gray-500 font-black uppercase tracking-widest">
                              {isUnlocked ? (isActive ? 'Ativo' : 'Desbloqueado') : 'Bloqueado'}
                            </p>
                          </div>
                          <div className="text-xl sm:text-2xl">{pet.icon}</div>
                        </div>

                        {!isUnlocked && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-white/10 bg-black/55 flex items-center justify-center">
                              <Lock className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-gray-300/80" />
                            </div>
                          </div>
                        )}

                        <div className="mt-8 sm:mt-10 space-y-1.5 sm:space-y-2">
                          <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-black">
                            <span className="text-gray-400 uppercase tracking-widest">Fragmentos</span>
                            <span className="text-gray-300 font-mono">
                              {Math.min(have, need)}/{need}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-white/5 border border-white/10 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.floor(progress * 100)}%`,
                                background: pet.color,
                              }}
                            />
                          </div>

                          {canUnlock ? (
                            <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-green-400">
                              Clique para desbloquear
                            </div>
                          ) : (
                            <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500">
                              {!isUnlocked ? 'Bloqueado' : 'Disponível'}
                            </div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 z-20 bg-black/75 backdrop-blur-md border-t border-white/10 px-4 py-3 sm:px-6 sm:py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0">
                      <div className="text-xl">🧩</div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-purple-300 font-black uppercase tracking-widest truncate">
                        Fragmentos de Pet
                      </p>
                      <p className="text-[10px] text-gray-500 font-bold leading-tight truncate">
                        {(economy.petShards || 0)} disponíveis
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Coleção</p>
                    <p className="text-sm font-black font-mono text-gray-200">
                      {(unlockedPets || []).length}/{Object.keys(PETS).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reset Confirmation Dialog */}
        <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
          <DialogContent className="bg-[#1a1a2e] border-[#2d2d44] text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="font-cinzel text-xl flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-red-400" />
                Confirmar Reset?
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-400 font-semibold mb-2">⚠️ Atenção!</p>
                <p className="text-gray-300 text-sm">
                  Isso irá apagar todo o seu progresso, equipamentos e nível. Skins e conquistas cosméticas serão mantidas.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => setShowResetConfirm(false)}
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-400"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleReset}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  RESETAR TUDO
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
      {sleepOverlay && (
        <motion.div
          className="fixed inset-0 z-[140] bg-black pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: sleepOverlay === 'in' ? 1 : 0 }}
          transition={{ duration: sleepOverlay === 'in' ? 2 : 1.5, ease: 'easeInOut' }}
        />
      )}
    </>
  );
}
