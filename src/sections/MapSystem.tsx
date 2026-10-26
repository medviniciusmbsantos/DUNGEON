import { assetUrl } from '@/lib/assets';
import { entryBlock, submapDays, submapEnergy, routeProgress } from '@/lib/campaign';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Lock,
  Crown,
  ChevronLeft,
  ChevronRight,
  Skull,
  Swords,
  AlertTriangle,
  Zap,
  Heart,
  ScrollText,
  Check,
  Package
} from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { MapId } from '@/types/game';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface MapSystemProps {
  onEnterCombat: (mapId: MapId, nodeId: string) => void;
  onExit: () => void;
  initialMapId?: MapId;
  initialSubmapIndex?: number | null;
  onSubmapChange?: (index: number | null) => void;
  onBackToWorldMap?: () => void;
}

const mapThemes: Record<MapId, {
  name: string;
  line1: string;
  line2: string;
  color: string;
  borderColor: string;
  bgImage: string;
}> = {
  map1: {
    name: 'Floresta Sombria',
    line1: 'FLORESTA',
    line2: 'SOMBRIA',
    color: '#15803d',
    borderColor: 'border-emerald-700/50',
    bgImage: assetUrl('dark_forest_bg.jpg'),
  },
  map2: {
    name: 'Deserto das Cinzas',
    line1: 'DESERTO DAS',
    line2: 'CINZAS',
    color: '#d97706',
    borderColor: 'border-amber-500/40',
    bgImage: assetUrl('ancient_crypt_bg.jpg'),
  },
  map3: {
    name: 'Tundra Congelada',
    line1: 'TUNDRA',
    line2: 'CONGELADA',
    color: '#38bdf8',
    borderColor: 'border-sky-500/40',
    bgImage: assetUrl('lava_volcano_bg.jpg'),
  },
  map4: {
    name: 'Terras Vulcânicas',
    line1: 'TERRAS',
    line2: 'VULCÂNICAS',
    color: '#ef4444',
    borderColor: 'border-red-500/40',
    bgImage: assetUrl('void_abyss_bg.jpg'),
  },
  map5: {
    name: 'Abismo',
    line1: 'ABISMO',
    line2: 'MORTAL',
    color: '#a855f7',
    borderColor: 'border-purple-500/40',
    bgImage: assetUrl('dragon_nest_bg.jpg'),
  },
};

const difficultyLabels: Record<string, string> = {
  easy: 'Fácil',
  medium: 'Média',
  hard: 'Difícil',
  extreme: 'Extrema',
  boss: 'BOSS',
};

export function MapSystem({ onEnterCombat, onExit, initialMapId = 'map1', initialSubmapIndex = null, onSubmapChange, onBackToWorldMap }: MapSystemProps) {
  const { gameState } = useGame();
  const { maps, character } = gameState;
  const [selectedMapId, setSelectedMapId] = useState<MapId>(initialMapId);
  const [selectedArea, setSelectedArea] = useState<number | null>(initialSubmapIndex);
  const [showEnergyWarning, setShowEnergyWarning] = useState(false);
  const [showMissions, setShowMissions] = useState(false);
  const [showEnemies, setShowEnemies] = useState(false);
  const [showRewardsModal, setShowRewardsModal] = useState(false);

  const currentMap = maps[selectedMapId];
  const areaIndex = selectedArea ?? 0;
  const areaNodes = currentMap.nodes.filter(n => (n.area || 0) === areaIndex);
  const theme = mapThemes[selectedMapId];
  const mapIds: MapId[] = ['map1', 'map2', 'map3', 'map4', 'map5'];
  const currentMapIndex = mapIds.indexOf(selectedMapId);

  const chooseSubmap = (index: number | null) => { setSelectedArea(index); onSubmapChange?.(index); };
  const selectedNode = areaNodes[0];
  const currentSubmap = currentMap.submaps?.find(submap => submap.index === areaIndex);
  const progress = routeProgress(currentMap, areaIndex);
  const encounterNumber = Math.min((selectedNode?.wins || 0) + 1, selectedNode?.requiredWins || 1);
  const fraction = Math.min(1, (selectedNode?.wins || 0) / Math.max(1, (selectedNode?.requiredWins || 1) - 1));

  const handleStartStage = () => {
    if (!selectedNode) return;
    if (entryBlock(currentMap, selectedNode)) return;

    if (!gameState.settings?.infiniteEnergy && character.energy < 1) {
      setShowEnergyWarning(true);
      return;
    }

    onEnterCombat(selectedMapId, selectedNode.id);
  };

  const energyCost = 1;

  const stagePossibleRewards = useMemo(() => {
    if (!selectedNode) return [];
    return [
      { id: 'gold', name: 'Ouro', icon: '🪙', rarity: 'Comum' },
      { id: 'crystal_green', name: 'Cristal Verde', icon: '🟩', rarity: 'Raro' },
      { id: 'crystal_purple', name: 'Cristal Roxo', icon: '🟪', rarity: 'Épico' },
      { id: 'book', name: 'Grimório Raro', icon: '📖', rarity: 'Raro' },
    ];
  }, [selectedNode]);

  if (selectedArea === null) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-[#0a0a0f] overflow-y-auto">
      <div className="max-w-md mx-auto min-h-screen px-3 py-3 space-y-4 pb-8">
        <button onClick={onBackToWorldMap || onExit} className="flex items-center gap-1 text-yellow-400 font-cinzel text-sm"><ChevronLeft className="h-5 w-5" />Mapa Mundo</button>
        <header className="text-center py-2"><h1 className="font-cinzel text-2xl font-black" style={{ color: theme.color }}>{currentMap.name}</h1><p className="text-sm text-gray-400 mt-2">Escolha um dos 3 submapas para explorar</p></header>
        {(currentMap.submaps || []).map(submap => {
          const node = currentMap.nodes.find(n => n.id === submap.id)!;
          const locked = !currentMap.isUnlocked || !node.isUnlocked;
          const completed = node.isCompleted;
          return <button key={submap.id} data-submap-entry={submap.id} disabled={locked} onClick={() => chooseSubmap(submap.index)} className={cn('relative block w-full overflow-hidden rounded-2xl border text-left shadow-xl', locked ? 'border-white/10 opacity-60 cursor-not-allowed' : 'border-purple-500/40 hover:border-purple-400')}>
            <div className="absolute inset-0 bg-cover" style={{ backgroundImage: `url(${theme.bgImage})`, backgroundPosition: `${25 + submap.index * 25}% 50%` }} />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/40" />
            <div className="relative p-5 space-y-2"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-cinzel font-bold text-white">{submap.name}</h2>{locked ? <Lock className="w-5 h-5 text-gray-400" /> : completed ? <Check className="w-5 h-5 text-emerald-400" /> : <Swords className="w-5 h-5 text-purple-300" />}</div><p className="text-xs text-amber-300 flex items-center gap-2"><Crown className="w-4 h-4 shrink-0" />Boss: {submap.bossName}</p><p className="text-xs text-gray-300">{node.wins || 0}/{submap.encounterCount} encontros vencidos · ~{submapDays(selectedMapId, submap.index)} dias</p><p className="text-xs text-purple-200">{locked ? 'Conclua o submapa anterior para entrar' : completed ? 'Submapa concluído · Revisitar' : 'Entrar no submapa'}</p></div>
          </button>;
        })}
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#0a0a0f] overflow-y-auto"
    >
      <div className="max-w-md mx-auto min-h-screen px-3 py-3 flex flex-col space-y-3 pb-8">

        {/* ═══════ HEADER ═══════ */}
        <div className="flex items-center justify-between pt-1 pb-1">
          {/* Voltar */}
          <button
            onClick={() => chooseSubmap(null)}
            className="flex items-center gap-0.5 text-yellow-400 hover:text-yellow-300 transition-colors text-sm font-medium font-cinzel"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Submapas</span>
          </button>

          {/* Title Stacked with Map Switcher Arrows (< Title >) */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                if (currentMapIndex > 0) setSelectedMapId(mapIds[currentMapIndex - 1]);
                  chooseSubmap(null);
              }}
              disabled={currentMapIndex === 0}
              className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              title="Mapa Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center">
              <h1
                className="text-xl sm:text-2xl font-black font-cinzel tracking-wider uppercase leading-tight drop-shadow-[0_0_12px_rgba(21,128,61,0.5)]"
                style={{ color: theme.color }}
              >
                {currentSubmap?.name || currentMap.name}
              </h1>
              <div className="flex items-center justify-center gap-1.5 mt-0.5">
                <div className="w-4 h-[1px] bg-[#2d2d44]" />
                <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">
                  {currentMap.name}
                </span>
                <div className="w-4 h-[1px] bg-[#2d2d44]" />
              </div>
            </div>

            <button
              onClick={() => {
                if (currentMapIndex < mapIds.length - 1 && maps[mapIds[currentMapIndex + 1]]?.isUnlocked) {
                  setSelectedMapId(mapIds[currentMapIndex + 1]);
                  chooseSubmap(null);
                }
              }}
              disabled={currentMapIndex === mapIds.length - 1 || !maps[mapIds[currentMapIndex + 1]]?.isUnlocked}
              className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              title="Próximo Mapa"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Missões Button */}
          <button
            onClick={() => setShowMissions(true)}
            className="flex flex-col items-center justify-center bg-[#141420] border border-[#2a2a3e] rounded-xl px-2.5 py-1.5 hover:bg-[#1f1f30] transition-all group"
          >
            <ScrollText className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] text-gray-300 font-medium mt-0.5">Missões</span>
          </button>
        </div>

        <section className="rounded-xl border border-purple-500/30 bg-[#101018] p-3 space-y-2">
          <p className="text-sm text-purple-200">{progress.completed}/{progress.total} encontros vencidos · meta ~{submapEnergy(selectedMapId, areaIndex)} energias</p>
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden"><div className="h-full bg-purple-500" style={{ width: `${progress.completed / progress.total * 100}%` }} /></div>
          <p className="text-xs text-gray-400">Explore o submapa e avance a cada vitória até enfrentar {currentSubmap?.bossName}.</p>
        </section>

        {/* ═══════ STATS BAR (VIDA & ENERGIA) ═══════ */}
        <div className="grid grid-cols-2 gap-2">
          {/* VIDA */}
          <div className="bg-[#101018] rounded-xl p-2.5 border border-[#202030]">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500/20" />
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-wider font-cinzel">VIDA</span>
              </div>
              <span className="text-[11px] font-mono font-bold text-gray-300">
                {Math.round(character.hp)}/{character.maxHp}
              </span>
            </div>
            <div className="h-2 bg-black/80 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-lime-500 to-green-400 rounded-full"
                style={{ width: `${Math.min(100, Math.max(0, (character.hp / character.maxHp) * 100))}%` }}
              />
            </div>
          </div>

          {/* ENERGIA */}
          <div className="bg-[#101018] rounded-xl p-2.5 border border-[#202030]">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500/20" />
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-wider font-cinzel">ENERGIA</span>
              </div>
              <span className="text-[11px] font-mono font-bold text-gray-300">
                {character.energy}/{character.maxEnergy}
              </span>
            </div>
            <div className="h-2 bg-black/80 rounded-full overflow-hidden border border-white/5 mb-1">
              <div
                className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full"
                style={{ width: `${Math.min(100, Math.max(0, (character.energy / character.maxEnergy) * 100))}%` }}
              />
            </div>
            <div className="flex items-center gap-1 justify-between">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all duration-300",
                      i < Math.floor(character.energyFragments)
                        ? "bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]"
                        : "bg-cyan-950/40 border border-cyan-800/30"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ MAP CANVAS CARD ═══════ */}
        <div className={cn('rounded-2xl border overflow-hidden relative shadow-2xl bg-[#0e0e16]', theme.borderColor)}>
          {/* Map Canvas Background (NO PROGRESS BAR) */}
          <div className="relative h-[290px] sm:h-[320px] rounded-xl overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${theme.bgImage})` }}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/50 pointer-events-none" />

            {/* Fine & Regular Dashed Trail SVG */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Background dark stroke for contrast */}
              <path
                d="M 18 55 C 24 55, 30 55, 36 54 C 42 52, 47 50, 53 48 C 59 45, 64 43, 69 42 C 75 39, 80 37, 85 35"
                fill="none"
                stroke="rgba(0, 0, 0, 0.5)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              {/* Very fine & regular dashed line */}
              <path
                d="M 18 55 C 24 55, 30 55, 36 54 C 42 52, 47 50, 53 48 C 59 45, 64 43, 69 42 C 75 39, 80 37, 85 35"
                fill="none"
                stroke="rgba(245, 158, 11, 0.85)"
                strokeWidth="0.7"
                strokeDasharray="1.8 1.8"
                strokeLinecap="round"
              />
            </svg>

            {!selectedNode?.isBoss && !selectedNode?.isCompleted && <div data-current-encounter className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-2" style={{ left: `${18 + 60 * fraction}%`, top: `${55 - 20 * fraction}%` }}><span className="w-10 h-10 rounded-full border-2 border-blue-300 bg-blue-900 flex items-center justify-center font-bold ring-4 ring-blue-500/30">{encounterNumber}</span><span className="text-[9px] px-2 py-1 rounded bg-black/80 text-blue-100">Você está aqui</span></div>}
            <button data-final-boss onClick={handleStartStage} disabled={!selectedNode?.isBoss || (!gameState.settings?.infiniteEnergy && character.energy < energyCost)} title={currentSubmap?.bossName} className={cn('absolute left-[85%] top-[35%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 border-2 rounded-xl p-2 z-10', selectedNode?.isBoss ? 'border-purple-400 bg-purple-950 text-purple-100 ring-2 ring-purple-500/40' : 'border-purple-900 bg-black/80 text-purple-400/70')}><Crown className="w-5 h-5" /><span className="text-[9px] font-cinzel">BOSS FINAL</span>{selectedNode?.isCompleted ? <Check className="w-3 h-3 text-emerald-400" /> : !selectedNode?.isBoss ? <Lock className="w-3 h-3" /> : null}</button>

            {/* Bottom Right Overlay: "Ver inimigos" */}
            <button
              onClick={() => setShowEnemies(true)}
              className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur-sm border border-white/15 rounded-lg px-2.5 py-1.5 text-[11px] text-gray-200 flex items-center gap-1 hover:bg-black transition-all shadow-md z-20"
            >
              <Skull className="w-3.5 h-3.5 text-red-400" />
              Ver inimigos
            </button>
          </div>
        </div>

        {/* ═══════ STAGE DETAILS CARD (NO INIMIGOS ROW) ═══════ */}
        <div className="bg-[#101018] border border-[#202030] rounded-2xl p-3.5 shadow-xl">
          <div className="grid grid-cols-2 gap-3">

            {/* LEFT COLUMN: Title, Difficulty, Description */}
            <div className="space-y-1.5">
              <h3 className="text-base font-black font-cinzel text-white uppercase tracking-wide">
                {selectedNode?.possibleSpawns[0]?.name || currentSubmap?.name}
              </h3>
              <p className="text-xs text-cyan-300">Encontro {encounterNumber} de {progress.total}</p>
              <p className="text-[11px] font-bold text-yellow-400">
                Dificuldade: {difficultyLabels[selectedNode?.difficulty || 'medium']}
              </p>
              <p className="text-[10px] text-gray-400 leading-snug pt-0.5">
                {selectedNode ? entryBlock(currentMap, selectedNode) || 'Continue explorando este submapa até alcançar seu boss final.' : 'Explore este submapa.'}
              </p>
            </div>

            {/* RIGHT COLUMN: Rewards, Energy Cost & Start Button */}
            <div className="space-y-2 flex flex-col justify-between">

              {/* RECOMPENSAS POSSÍVEIS */}
              <div>
                <div className="text-[9px] font-black text-green-400 uppercase tracking-widest font-cinzel mb-1">
                  RECOMPENSAS POSSÍVEIS
                </div>
                <div className="grid grid-cols-4 gap-1 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-black/60 border border-amber-500/30 flex items-center justify-center text-sm" title="Ouro">
                    🪙
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-black/60 border border-emerald-500/30 flex items-center justify-center text-sm" title="Cristal Verde">
                    🟩
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-black/60 border border-purple-500/30 flex items-center justify-center text-sm" title="Cristal Roxo">
                    🟪
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-black/60 border border-blue-500/30 flex items-center justify-center text-sm" title="Livro Raro">
                    📖
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowRewardsModal(true)}
                    className="text-[9px] text-gray-300 hover:text-white flex items-center gap-0.5 bg-[#181824] border border-white/10 rounded px-1.5 py-0.5"
                  >
                    <Package className="w-2.5 h-2.5 text-yellow-400" />
                    Ver todas
                  </button>
                </div>
              </div>

              {/* CUSTO DE ENERGIA & INICIAR ETAPA (Completed stages CAN be repeated!) */}
              <div>
                <div className="text-[8px] font-bold text-blue-400 uppercase tracking-wider font-cinzel mb-0.5">
                  CUSTO DE ENERGIA
                </div>
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
                    <span className="text-lg font-black text-white font-mono">{energyCost}</span>
                  </div>

                  <Button
                    onClick={handleStartStage}
                    disabled={!selectedNode || !!entryBlock(currentMap, selectedNode) || (!gameState.settings?.infiniteEnergy && character.energy < energyCost)}
                    className={cn(
                      "h-9 px-2.5 text-[11px] font-black font-cinzel tracking-wider rounded-xl transition-all shadow-lg flex items-center gap-1",
                      selectedNode?.isUnlocked
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30 active:scale-95"
                        : "bg-gray-800 text-gray-500 cursor-not-allowed opacity-60"
                    )}
                  >
                    <Swords className="w-3.5 h-3.5" />
                    <span>{selectedNode?.isBoss ? 'ENFRENTAR BOSS' : 'EXPLORAR SUBMAPA'}</span>
                  </Button>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* ═══════ MODALS ═══════ */}

      {/* Energy Warning */}
      <Dialog open={showEnergyWarning} onOpenChange={setShowEnergyWarning}>
        <DialogContent className="bg-[#141420] border-[#2a2a3e] text-white max-w-xs text-center rounded-2xl p-4">
          <DialogHeader>
            <DialogTitle className="font-cinzel text-lg text-red-500 flex items-center justify-center gap-2">
              <Zap className="w-5 h-5" />
              Sem Energia!
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
            <p className="text-gray-300 text-xs mb-4">
              Você está exausto aventureiro! Recupere suas energias completando tarefas e resgatando as missões diárias.
            </p>
            <Button
              onClick={() => setShowEnergyWarning(false)}
              className="w-full btn-primary h-9 text-xs"
            >
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Missões Modal */}
      <Dialog open={showMissions} onOpenChange={setShowMissions}>
        <DialogContent className="bg-[#141420] border-[#2a2a3e] text-white max-w-xs rounded-2xl p-4">
          <DialogHeader>
            <DialogTitle className="font-cinzel text-lg flex items-center gap-2">
              <ScrollText className="w-5 h-5 text-purple-400" />
              Missões do Mapa
            </DialogTitle>
          </DialogHeader>
          <div className="text-xs text-gray-400 py-3 text-center">
            As missões específicas para esta dungeon serão adicionadas em breve.
          </div>
        </DialogContent>
      </Dialog>

      {/* Enemies Modal */}
      <Dialog open={showEnemies} onOpenChange={setShowEnemies}>
        <DialogContent className="bg-[#141420] border-[#2a2a3e] text-white max-w-sm rounded-2xl p-4">
          <DialogHeader>
            <DialogTitle className="font-cinzel text-base flex items-center gap-2">
              <Skull className="w-4 h-4 text-red-400" />
              Inimigos — {selectedNode?.isBoss ? 'Boss da área' : `Encontro ${encounterNumber}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
            {(selectedNode?.possibleSpawns || []).map((s) => (
              <div key={s.name} className="flex items-center justify-between gap-2 bg-black/40 border border-white/10 rounded-xl px-2.5 py-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center text-xl flex-shrink-0">
                    {s.image}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-white truncate text-xs">{s.name}</div>
                    <div className="text-[9px] text-gray-400 truncate font-mono">
                      HP {s.hp} • Dano {s.damageMin}-{s.damageMax} • XP {s.xp}
                    </div>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-gray-400 flex-shrink-0 font-mono">
                  {s.chance}%
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Rewards Modal */}
      <Dialog open={showRewardsModal} onOpenChange={setShowRewardsModal}>
        <DialogContent className="bg-[#141420] border-[#2a2a3e] text-white max-w-sm rounded-2xl p-4">
          <DialogHeader>
            <DialogTitle className="font-cinzel text-base flex items-center gap-2">
              <Package className="w-4 h-4 text-yellow-400" />
              Recompensas Possíveis — Encontro {encounterNumber}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 max-h-[50vh] overflow-y-auto py-1">
            {stagePossibleRewards.map((reward) => (
              <div key={reward.id} className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl p-2">
                <div className="text-2xl flex-shrink-0">{reward.icon}</div>
                <div>
                  <div className="font-bold text-xs text-white">{reward.name}</div>
                  <div className="text-[9px] text-gray-400 capitalize">{reward.rarity}</div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

    </motion.div>
  );
}
