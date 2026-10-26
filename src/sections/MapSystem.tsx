import { assetUrl } from '@/lib/assets';
import { entryBlock, REGIONS, submapDays, submapEnergy, routeProgress } from '@/lib/campaign';
import { useEffect, useMemo, useState } from 'react';
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
  ChevronUp,
  Package
} from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { MapId, MapNode } from '@/types/game';
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

export function MapSystem({ onEnterCombat, onExit, initialMapId = 'map1', onBackToWorldMap }: MapSystemProps) {
  const { gameState } = useGame();
  const { maps, character } = gameState;
  const [selectedMapId, setSelectedMapId] = useState<MapId>(initialMapId);
  const [selectedArea, setSelectedArea] = useState(() => maps[initialMapId].nodes.find(n => n.isUnlocked && !n.isCompleted)?.area || 0);
  const [showEnergyWarning, setShowEnergyWarning] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showMissions, setShowMissions] = useState(false);
  const [showEnemies, setShowEnemies] = useState(false);
  const [showRewardsModal, setShowRewardsModal] = useState(false);

  const currentMap = maps[selectedMapId];
  const areaNodes = currentMap.nodes.filter(n => (n.area || 0) === selectedArea);
  const theme = mapThemes[selectedMapId];
  const mapIds: MapId[] = ['map1', 'map2', 'map3', 'map4', 'map5'];
  const currentMapIndex = mapIds.indexOf(selectedMapId);

  useEffect(() => {
    const firstAvailable = currentMap.nodes.filter(n => (n.area || 0) === selectedArea).find(n => n.isUnlocked && !n.isCompleted);
    const firstUnlocked = currentMap.nodes.filter(n => (n.area || 0) === selectedArea).find(n => n.isUnlocked);
    setSelectedNodeId(firstAvailable?.id || firstUnlocked?.id || currentMap.nodes.find(n => (n.area || 0) === selectedArea)?.id || null);
  }, [selectedMapId, selectedArea, currentMap.nodes]);

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return currentMap.nodes.find(n => n.isUnlocked) || currentMap.nodes[0] || null;
    return currentMap.nodes.find(n => n.id === selectedNodeId) || currentMap.nodes[0] || null;
  }, [currentMap.nodes, selectedNodeId]);

  const handleSelectStage = (node: MapNode) => {
    if (!node.isUnlocked) return;
    setSelectedNodeId(node.id);
  };

  const handleStartStage = () => {
    if (!selectedNode) return;
    if (entryBlock(currentMap, selectedNode)) return;

    if (!gameState.settings?.infiniteEnergy && character.energy < 1) {
      setShowEnergyWarning(true);
      return;
    }

    onEnterCombat(selectedMapId, selectedNode.id);
  };

  // Node positions along a smooth organic curved trail
  const nodePositions = useMemo(() => {
    return [
      { nodeId: areaNodes[0]?.id || 'node1', x: 18, y: 55 },
      { nodeId: areaNodes[1]?.id || 'node2', x: 36, y: 54 },
      { nodeId: areaNodes[2]?.id || 'node3', x: 53, y: 48 },
      { nodeId: areaNodes[3]?.id || 'node4', x: 69, y: 42 },
      { nodeId: areaNodes[4]?.id || 'node5', x: 85, y: 35 }, // Boss Final node
    ];
  }, [areaNodes]);

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
            onClick={onBackToWorldMap || onExit}
            className="flex items-center gap-0.5 text-yellow-400 hover:text-yellow-300 transition-colors text-sm font-medium font-cinzel"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Mapa Mundo</span>
          </button>

          {/* Title Stacked with Map Switcher Arrows (< Title >) */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                if (currentMapIndex > 0) setSelectedMapId(mapIds[currentMapIndex - 1]);
                  setSelectedArea(0);
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
                {theme.line1}<br />{theme.line2}
              </h1>
              <div className="flex items-center justify-center gap-1.5 mt-0.5">
                <div className="w-4 h-[1px] bg-[#2d2d44]" />
                <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">
                  Mapa {selectedMapId.replace('map', '')} de 5
                </span>
                <div className="w-4 h-[1px] bg-[#2d2d44]" />
              </div>
            </div>

            <button
              onClick={() => {
                if (currentMapIndex < mapIds.length - 1 && maps[mapIds[currentMapIndex + 1]]?.isUnlocked) {
                  setSelectedMapId(mapIds[currentMapIndex + 1]);
                  setSelectedArea(0);
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

        <section className="rounded-xl border border-purple-500/30 bg-[#101018] p-3 space-y-3">
          <p className="text-sm text-purple-200">{routeProgress(currentMap, selectedArea).completed}/{routeProgress(currentMap, selectedArea).total} vitórias · meta ~{submapEnergy(selectedMapId, selectedArea)} energias · {currentMap.nodes.filter(n => n.isCompleted).length}/15 etapas</p>
          <p className="text-xs text-gray-400">Vença os encontros para alcançar o boss. A meta inclui uma reserva para descanso e eventos, mantendo as regras originais de energia.</p>
          <div className="grid grid-cols-3 gap-2">{REGIONS[Number(selectedMapId.slice(3)) - 1].map((name, index) => <button key={name} onClick={() => setSelectedArea(index)} className={`rounded-lg border p-2 text-left text-xs ${selectedArea === index ? 'border-purple-400 bg-purple-500/20 text-white' : 'border-white/10 text-gray-400'}`}>
            <span className="block font-bold">{index + 1}. {name}</span>
            <span>{routeProgress(currentMap, index).completed}/{routeProgress(currentMap, index).total} vitórias · ~{submapDays(selectedMapId, index)} dias</span>
          </button>)}</div>
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

            {/* STAGE NODES ON MAP */}
            {areaNodes.map((node, idx) => {
              const pos = nodePositions[idx] || { x: 20 + idx * 15, y: 50 };
              const isSelected = selectedNode?.id === node.id;
              const isLocked = !node.isUnlocked;
              const isCompleted = node.isCompleted && node.isUnlocked;
              const isBoss = node.isBoss;

              return (
                <div
                  key={node.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 select-none z-10"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                >
                  {isBoss ? (
                    /* BOSS FINAL PORTAL NODE */
                    <button
                      onClick={() => handleSelectStage(node)}
                      disabled={isLocked}
                      className={cn(
                        "flex flex-col items-center group transition-transform duration-200 relative",
                        isLocked ? "cursor-not-allowed opacity-75" : "cursor-pointer hover:scale-105",
                        isSelected && "scale-110 z-30"
                      )}
                    >
                      <div
                        className={cn(
                          "w-14 h-18 rounded-xl border-2 flex flex-col items-center justify-center p-1 relative overflow-hidden backdrop-blur-md transition-all shadow-xl",
                          /* Selected State (Darker Blue) */
                          isSelected && "border-blue-400 bg-blue-950/95 ring-4 ring-blue-500/60 shadow-[0_0_25px_rgba(37,99,235,0.8)] text-blue-100",
                          /* Completed State (Darker Forest Green) */
                          !isSelected && isCompleted && "border-emerald-600 bg-emerald-950/90 text-emerald-200 shadow-[0_0_15px_rgba(6,95,70,0.6)]",
                          /* Unlocked & Uncompleted State */
                          !isSelected && !isCompleted && !isLocked && "border-purple-400 bg-purple-950/80 text-purple-200 ring-2 ring-purple-400/40",
                          /* Locked State */
                          isLocked && "border-purple-900/60 bg-[#120a1c]/90 text-purple-400/60"
                        )}
                      >
                        <Crown className={cn("w-4 h-4 mb-0.5", isSelected ? "text-blue-300" : isLocked ? "text-purple-500/50" : "text-purple-300")} />
                        <span className="text-[7.5px] font-black uppercase font-cinzel text-center leading-tight">
                          BOSS<br />DA ÁREA
                        </span>
                        {isLocked ? (
                          <div className="mt-0.5 bg-black/60 rounded-full p-0.5 border border-purple-500/30">
                            <Lock className="w-2.5 h-2.5 text-purple-400/80" />
                          </div>
                        ) : isCompleted ? (
                          <Check className="w-3 h-3 text-emerald-400 mt-0.5" />
                        ) : null}
                      </div>

                      {/* Selection Arrow Below Boss Node - Strictly Centered */}
                      {isSelected && (
                        <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 w-5 h-5 flex items-center justify-center z-30 pointer-events-none">
                          <motion.div
                            animate={{ y: [0, 3, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="text-blue-400 flex items-center justify-center"
                          >
                            <ChevronUp className="w-5 h-5 drop-shadow-[0_0_8px_rgba(59,130,246,0.9)]" />
                          </motion.div>
                        </div>
                      )}
                    </button>
                  ) : (
                    /* REGULAR COMPACT STAGE NODE (1, 2, 3, 4) */
                    <div className="flex flex-col items-center relative">
                      <button
                        onClick={() => handleSelectStage(node)}
                        disabled={isLocked}
                        className={cn(
                          "w-10 h-10 rounded-full border-2 flex items-center justify-center font-black text-base transition-all duration-200 shadow-lg relative",

                          /* Selected State (Darker Blue) */
                          isSelected && "border-blue-300 bg-blue-700 text-white font-black ring-4 ring-blue-600/60 shadow-[0_0_22px_rgba(29,78,216,0.95)] scale-110 z-30",

                          /* Completed State (Darker Forest Green) */
                          !isSelected && isCompleted && "border-emerald-600 bg-emerald-900 text-emerald-100 shadow-[0_0_12px_rgba(6,95,70,0.6)]",

                          /* Unlocked & Uncompleted State */
                          !isSelected && !isCompleted && !isLocked && "border-slate-500/70 bg-gray-900/90 text-slate-200 hover:scale-105",

                          /* Locked State */
                          isLocked && "border-gray-700 bg-gray-900/90 text-gray-500 cursor-not-allowed opacity-75"
                        )}
                      >
                        {isCompleted && !isSelected ? (
                          <div className="flex items-center justify-center gap-0.5">
                            <span>{node.stage}</span>
                          </div>
                        ) : (
                          <span>{node.stage}</span>
                        )}

                        {/* Selection Arrow Below Circle Node - Strictly Centered */}
                        {isSelected && (
                          <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 w-5 h-5 flex items-center justify-center z-30 pointer-events-none">
                            <motion.div
                              animate={{ y: [0, 3, 0] }}
                              transition={{ duration: 1, repeat: Infinity }}
                              className="text-blue-400 flex items-center justify-center"
                            >
                              <ChevronUp className="w-5 h-5 drop-shadow-[0_0_8px_rgba(59,130,246,0.9)]" />
                            </motion.div>
                          </div>
                        )}
                      </button>

                      {/* Locked Badge Icon Below */}
                      {isLocked && (
                        <div className="mt-1">
                          <Lock className="w-3 h-3 text-gray-500" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

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
                {selectedNode?.name || 'Escolha uma etapa'}
              </h3>
              <p className="text-xs text-cyan-300">{selectedNode?.wins || 0}/{selectedNode?.requiredWins || 1} vitórias nesta etapa</p>
              <p className="text-[11px] font-bold text-yellow-400">
                Dificuldade: {difficultyLabels[selectedNode?.difficulty || 'medium']}
              </p>
              <p className="text-[10px] text-gray-400 leading-snug pt-0.5">
                {selectedNode ? entryBlock(currentMap, selectedNode) || 'Explore, derrote inimigos e prepare-se para o boss desta área.' : 'Selecione uma etapa.'}
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
                    <span>INICIAR ETAPA</span>
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
              Inimigos — {selectedNode?.isBoss ? 'Boss da área' : `Etapa ${selectedNode?.stage ?? 1}`}
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
              Recompensas Possíveis — Etapa {selectedNode?.stage ?? 1}
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
