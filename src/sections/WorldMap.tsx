import { assetUrl } from '@/lib/assets';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Castle, 
  Trees, 
  Flame, 
  Snowflake, 
  Skull, 
  Sparkles, 
  ChevronLeft, 
  ShieldAlert, 
  Compass, 
  Lock 
} from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import type { MapId } from '@/types/game';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface WorldMapProps {
  onSelectMap: (mapId: MapId) => void;
  onNavigateToCastle: () => void;
  onClose: () => void;
}

interface BiomeHotspot {
  id: MapId | 'castle';
  name: string;
  subtitle: string;
  icon: any;
  color: string;
  borderColor: string;
  glowColor: string;
  top: string;
  left: string;
  width: string;
  height: string;
  requiredLevel: number;
}

const HOTSPOTS: BiomeHotspot[] = [
  {
    id: 'castle',
    name: 'Castelo',
    subtitle: 'Fortaleza Central',
    icon: Castle,
    color: 'from-amber-500/20 to-yellow-500/10',
    borderColor: 'border-yellow-400/60',
    glowColor: 'rgba(234, 179, 8, 0.4)',
    top: '3%',
    left: '32%',
    width: '36%',
    height: '14%',
    requiredLevel: 1,
  },
  {
    id: 'map1',
    name: 'Floresta Sombria',
    subtitle: 'Nível sugerido 1+',
    icon: Trees,
    color: 'from-emerald-900/30 to-green-600/20',
    borderColor: 'border-emerald-500/60',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    top: '30%',
    left: '4%',
    width: '45%',
    height: '15%',
    requiredLevel: 1,
  },
  {
    id: 'map2',
    name: 'Deserto das Cinzas',
    subtitle: 'Nível sugerido 6+',
    icon: Flame,
    color: 'from-amber-900/30 to-orange-600/20',
    borderColor: 'border-amber-500/60',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    top: '30%',
    left: '52%',
    width: '44%',
    height: '15%',
    requiredLevel: 6,
  },
  {
    id: 'map3',
    name: 'Tundra Congelada',
    subtitle: 'Nível sugerido 11+',
    icon: Snowflake,
    color: 'from-sky-900/30 to-blue-600/20',
    borderColor: 'border-sky-400/60',
    glowColor: 'rgba(56, 189, 248, 0.4)',
    top: '50%',
    left: '25%',
    width: '50%',
    height: '15%',
    requiredLevel: 11,
  },
  {
    id: 'map4',
    name: 'Terras Vulcânicas',
    subtitle: 'Nível sugerido 16+',
    icon: Flame,
    color: 'from-red-900/30 to-rose-600/20',
    borderColor: 'border-red-500/60',
    glowColor: 'rgba(239, 68, 68, 0.4)',
    top: '74%',
    left: '4%',
    width: '45%',
    height: '16%',
    requiredLevel: 16,
  },
  {
    id: 'map5',
    name: 'Abismo',
    subtitle: 'Nível sugerido 21+',
    icon: Skull,
    color: 'from-purple-900/30 to-indigo-600/20',
    borderColor: 'border-purple-500/60',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    top: '68%',
    left: '52%',
    width: '44%',
    height: '32%',
    requiredLevel: 21,
  },
];

const BIOME_THEME_COLORS: Record<MapId, { text: string; bg: string; border: string }> = {
  map1: { text: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/40' },
  map2: { text: 'text-orange-400', bg: 'bg-orange-500/15', border: 'border-orange-500/40' },
  map3: { text: 'text-cyan-400', bg: 'bg-cyan-500/15', border: 'border-cyan-500/40' },
  map4: { text: 'text-red-500', bg: 'bg-red-500/15', border: 'border-red-500/40' },
  map5: { text: 'text-purple-400', bg: 'bg-purple-500/15', border: 'border-purple-500/40' },
};

export function WorldMap({ onSelectMap, onNavigateToCastle, onClose }: WorldMapProps) {
  const { gameState } = useGame();
  const { character, maps } = gameState;
  const [pendingMapId, setPendingMapId] = useState<MapId | null>(null);

  const handleHotspotClick = (hotspot: BiomeHotspot) => {
    if (hotspot.id === 'castle') {
      onNavigateToCastle();
      return;
    }
    setPendingMapId(hotspot.id as MapId);
  };

  const handleConfirmExplore = () => {
    if (pendingMapId && maps[pendingMapId].isUnlocked) {
      const selected = pendingMapId;
      setPendingMapId(null);
      onSelectMap(selected);
    }
  };

  const selectedMapData = pendingMapId ? maps[pendingMapId] : null;
  const pendingHotspot = HOTSPOTS.find(h => h.id === pendingMapId);

  return (
    <div className="relative w-full h-dvh bg-black flex flex-col items-center select-none overflow-y-auto">
      {/* Header bar */}
      <div className="sticky top-0 z-40 w-full max-w-2xl bg-black/85 backdrop-blur-md border-b border-yellow-500/30 px-4 py-3 flex items-center justify-between shadow-lg">
        <Button
          onClick={onClose}
          variant="outline"
          size="sm"
          className="bg-black/60 border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/20 hover:text-white flex items-center gap-1 font-cinzel text-xs"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar
        </Button>
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-yellow-400 animate-spin-slow" />
          <h1 className="text-lg md:text-xl font-bold font-cinzel text-white tracking-wider">
            MAPA MUNDO
          </h1>
        </div>
        <div className="w-16" />
      </div>

      {/* Map Image Container */}
      <div className="relative w-full max-w-2xl px-2 py-4 flex justify-center">
        <div className="relative w-full rounded-2xl overflow-hidden border-2 border-yellow-500/40 shadow-[0_0_50px_rgba(245,158,11,0.15)] bg-black">
          {/* Main Visual Map Image */}
          <img
            src={assetUrl('world_map.jpg')}
            alt="Mapa Mundo - Dungeon of Discipline"
            className="w-full h-auto object-cover block rounded-xl"
          />

          {/* Hotspot overlays */}
          {HOTSPOTS.map((hotspot) => {
            const Icon = hotspot.icon;
            const isCastle = hotspot.id === 'castle';
            const mapObj = !isCastle ? maps[hotspot.id as MapId] : null;
            const isUnlocked = isCastle || (mapObj ? mapObj.isUnlocked : character.level >= hotspot.requiredLevel);

            return (
              <motion.button
                key={hotspot.id}
                onClick={() => handleHotspotClick(hotspot)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  top: hotspot.top,
                  left: hotspot.left,
                  width: hotspot.width,
                  height: hotspot.height,
                }}
                className={`absolute z-20 rounded-xl transition-all duration-300 group flex items-center justify-center p-1 cursor-pointer outline-none focus:ring-2 focus:ring-yellow-400/80 ${
                  isUnlocked ? 'opacity-100' : 'opacity-80'
                }`}
              >
                {/* Background glow box that illuminates on hover */}
                <div
                  className={`absolute inset-0 rounded-xl border-2 ${hotspot.borderColor} bg-gradient-to-br ${hotspot.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_20px_var(--glow)]`}
                  style={{ ['--glow' as any]: hotspot.glowColor }}
                />

                {/* Subtle continuous indicator ring */}
                <div className="relative z-10 flex flex-col items-center justify-center w-full h-full text-center">
                  {/* Subtle pulsing icon badge */}
                  <div className={`p-1.5 rounded-full border border-white/20 bg-black/60 backdrop-blur-sm group-hover:bg-black/90 group-hover:border-yellow-400 group-hover:scale-110 transition-all shadow-md flex items-center justify-center`}>
                    {isUnlocked ? (
                      <Icon className={`w-5 h-5 ${isCastle ? 'text-yellow-400 animate-pulse' : 'text-white group-hover:text-yellow-400'}`} />
                    ) : (
                      <Lock className="w-4 h-4 text-gray-400" />
                    )}
                  </div>

                  {/* Tooltip badge text appearing on hover / touch */}
                  <div className="mt-1 px-2 py-0.5 rounded-md bg-black/85 border border-yellow-500/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg">
                    <span className="text-[11px] font-bold font-cinzel text-yellow-300 tracking-wider whitespace-nowrap block">
                      {hotspot.name}
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Confirmation Modal for Biome Selection */}
      <Dialog open={!!pendingMapId} onOpenChange={(open) => !open && setPendingMapId(null)}>
        <DialogContent className="bg-[#121220] border-2 border-yellow-500/50 text-white max-w-md rounded-2xl shadow-[0_0_40px_rgba(245,158,11,0.2)]">
          <DialogHeader>
            <DialogTitle className="font-cinzel text-xl text-yellow-400 flex items-center gap-2">
              <Compass className="w-5 h-5 text-yellow-400" />
              Confirmar Exploração
            </DialogTitle>
          </DialogHeader>

          {selectedMapData && pendingHotspot && (() => {
            const theme = pendingMapId ? BIOME_THEME_COLORS[pendingMapId] : { text: 'text-yellow-400', bg: 'bg-yellow-500/15', border: 'border-yellow-500/40' };
            return (
              <div className="space-y-4 py-2">
                <div className={`bg-black/50 border ${theme.border} rounded-xl p-4 flex items-center gap-4`}>
                  <div className={`p-3 rounded-full ${theme.bg} border ${theme.border} ${theme.text} shrink-0`}>
                    <pendingHotspot.icon className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold font-cinzel ${theme.text}`}>
                      {selectedMapData.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {selectedMapData.description}
                    </p>
                    <p className="text-[11px] font-mono text-yellow-400/90 mt-1">
                      Nível recomendado: {pendingHotspot.requiredLevel}
                    </p>
                  </div>
                </div>

                {character.level < pendingHotspot.requiredLevel && (
                  <div className="bg-red-500/10 border border-red-500/40 rounded-lg p-3 text-xs text-red-300 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 shrink-0 text-red-400" />
                    <span>Aviso: Seu nível ({character.level}) é inferior ao recomendado ({pendingHotspot.requiredLevel}).</span>
                  </div>
                )}

                {!selectedMapData.isUnlocked && <p className="text-sm text-amber-300">Derrote os três bosses e conclua todas as etapas da região anterior para desbloquear.</p>}
                <p className="text-center text-sm font-cinzel text-gray-300 tracking-wide">
                  Deseja explorar <span className={`${theme.text} font-bold`}>{selectedMapData.name}</span>?
                </p>

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => setPendingMapId(null)}
                    variant="outline"
                    className="flex-1 bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 py-5 font-cinzel"
                  >
                    CANCELAR
                  </Button>
                  <Button
                    disabled={!selectedMapData.isUnlocked}
                    onClick={handleConfirmExplore}
                    className="flex-1 btn-primary py-5 font-cinzel bg-gradient-to-r from-yellow-600 to-amber-500 text-black font-bold tracking-wider hover:brightness-110"
                  >
                    <Sparkles className="w-4 h-4 mr-1" />
                    EXPLORAR MAPA
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
