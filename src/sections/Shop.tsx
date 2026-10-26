import { assetUrl } from '@/lib/assets';
import { Market } from './Market';
import { useState } from 'react';
import { 
  Coins, 
  Hammer,
  Lock,
  Store,
  ChevronDown,
  Filter,
  Info,
  Plus,
} from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { cn } from '@/lib/utils';
import type { Rarity } from '@/types/game';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  FORGE_SUCCESS_CHANCES,
  FORGE_BASE_COSTS, 
  FORGE_RARITY_MULTIPLIERS 
} from '@/types/game';

const rarityColors: Record<Rarity, { border: string; bg: string; text: string; shadow: string; glow: string }> = {
  common: { border: 'border-gray-500/60', bg: 'bg-gray-500/10', text: 'text-gray-400', shadow: 'shadow-gray-500/20', glow: 'shadow-gray-500/10' },
  rare: { border: 'border-blue-500/60', bg: 'bg-blue-500/10', text: 'text-blue-400', shadow: 'shadow-blue-500/20', glow: 'shadow-blue-500/20' },
  epic: { border: 'border-purple-500/60', bg: 'bg-purple-500/10', text: 'text-purple-400', shadow: 'shadow-purple-500/20', glow: 'shadow-purple-500/30' },
  legendary: { border: 'border-yellow-500/60', bg: 'bg-yellow-500/10', text: 'text-yellow-400', shadow: 'shadow-yellow-500/20', glow: 'shadow-yellow-500/40' },
  mythic: { border: 'border-red-500/60', bg: 'bg-red-500/10', text: 'text-red-400', shadow: 'shadow-red-500/20', glow: 'shadow-red-500/50' },
};

// Shard text color mapping matching rarity border colors
const shardTextColor: Record<Rarity, string> = {
  common: 'text-gray-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-amber-400',
  mythic: 'text-red-400',
};

// 3D Crystal Gem Vector Component matching exact screenshot design
function CrystalIcon({ rarity }: { rarity: Rarity }) {
  if (rarity === 'common') {
    return (
      <svg className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" viewBox="0 0 100 120" fill="none">
        <defs>
          <linearGradient id="c_common_main" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#d1d5db" />
            <stop offset="100%" stopColor="#6b7280" />
          </linearGradient>
          <linearGradient id="c_common_light" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#e5e7eb" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <polygon points="50,5 82,35 50,115 18,35" fill="url(#c_common_main)" />
        <polygon points="50,5 82,35 50,48 18,35" fill="url(#c_common_light)" />
        <polygon points="50,5 18,35 50,115" fill="#f3f4f6" fillOpacity="0.4" />
        <line x1="50" y1="5" x2="50" y2="115" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.6" />
      </svg>
    );
  }

  if (rarity === 'rare') {
    return (
      <svg className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" viewBox="0 0 100 120" fill="none">
        <defs>
          <linearGradient id="c_rare_main" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>
          <linearGradient id="c_rare_light" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <polygon points="50,5 82,35 50,115 18,35" fill="url(#c_rare_main)" />
        <polygon points="50,5 82,35 50,48 18,35" fill="url(#c_rare_light)" />
        <polygon points="50,5 18,35 50,115" fill="#bfdbfe" fillOpacity="0.35" />
        <line x1="50" y1="5" x2="50" y2="115" stroke="#93c5fd" strokeWidth="1.5" strokeOpacity="0.7" />
      </svg>
    );
  }

  if (rarity === 'epic') {
    return (
      <svg className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" viewBox="0 0 100 120" fill="none">
        <defs>
          <linearGradient id="c_epic_main" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="50%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#581c87" />
          </linearGradient>
          <linearGradient id="c_epic_light" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e9d5ff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <polygon points="50,5 82,35 50,115 18,35" fill="url(#c_epic_main)" />
        <polygon points="50,5 82,35 50,48 18,35" fill="url(#c_epic_light)" />
        <polygon points="50,5 18,35 50,115" fill="#f5d0fe" fillOpacity="0.35" />
        <line x1="50" y1="5" x2="50" y2="115" stroke="#e9d5ff" strokeWidth="1.5" strokeOpacity="0.7" />
      </svg>
    );
  }

  // Legendary (Gold / Amber)
  return (
    <svg className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" viewBox="0 0 100 120" fill="none">
      <defs>
        <linearGradient id="c_leg_main" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="50%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
        <linearGradient id="c_leg_light" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <polygon points="50,5 82,35 50,115 18,35" fill="url(#c_leg_main)" />
      <polygon points="50,5 82,35 50,48 18,35" fill="url(#c_leg_light)" />
      <polygon points="50,5 18,35 50,115" fill="#fef9c3" fillOpacity="0.4" />
      <line x1="50" y1="5" x2="50" y2="115" stroke="#fef08a" strokeWidth="1.5" strokeOpacity="0.8" />
    </svg>
  );
}

export function Shop() {
  const { gameState, upgradeItem } = useGame();
  const { economy, inventory, character } = gameState;
  const [castleTab, setCastleTab] = useState<'forja' | 'loja'>('forja');
  const [selectedForgeItemId, setSelectedForgeItemId] = useState<string | null>(null);
  const [equipmentFilter, setEquipmentFilter] = useState<string>('todos');
  const [confirmUpgrade, setConfirmUpgrade] = useState(false);
  const [anvilImgError, setAnvilImgError] = useState(false);
  const [showItemPickerModal, setShowItemPickerModal] = useState(false);

  const allAvailableItems = [
    ...inventory.items,
    ...(character.equipped.weapon ? [character.equipped.weapon] : []),
    ...(character.equipped.armor ? [character.equipped.armor] : []),
    ...(character.equipped.helmet ? [character.equipped.helmet] : []),
    ...(character.equipped.boots ? [character.equipped.boots] : []),
    ...(character.equipped.accessory ? [character.equipped.accessory] : []),
  ].filter((item, idx, self) => self.findIndex(i => i.id === item.id) === idx);

  const selectedForgeItem = allAvailableItems.find(i => i.id === selectedForgeItemId) || null;

  // Calculate costs and success chance
  const nextLevel = selectedForgeItem ? selectedForgeItem.upgradeLevel + 1 : 1;
  const goldCost = selectedForgeItem 
    ? (FORGE_BASE_COSTS[nextLevel]?.gold || 25) * FORGE_RARITY_MULTIPLIERS[selectedForgeItem.rarity]
    : 0;
  const shardCost = selectedForgeItem 
    ? (FORGE_BASE_COSTS[nextLevel]?.shards || 1)
    : 0;
  const successChance = selectedForgeItem 
    ? (FORGE_SUCCESS_CHANCES[selectedForgeItem.upgradeLevel] ?? 100)
    : 0;

  const handleUpgrade = () => {
    if (!selectedForgeItemId) return;
    setConfirmUpgrade(true);
  };

  const executeUpgrade = () => {
    if (!selectedForgeItemId) return;
    upgradeItem(selectedForgeItemId);
    setConfirmUpgrade(false);
  };

  // Filtered equipment list for Forja selection
  const filteredEquipment = allAvailableItems.filter(item => {
    if (equipmentFilter === 'armas') return item.type === 'weapon';
    if (equipmentFilter === 'armaduras') return item.type === 'armor' || item.type === 'helmet' || item.type === 'boots';
    if (equipmentFilter === 'acessorios') return item.type === 'accessory';
    return true;
  });

  const handleSlotBoxClick = () => {
    const el = document.getElementById('equipamentos-grid');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setShowItemPickerModal(true);
  };


  return (
    <div className="space-y-2.5 pt-10 pb-6 px-1">
      {/* Header Title (Clean without subtitle description) */}
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-md pt-2 pb-2 border-b border-white/5 md:relative md:top-auto md:z-auto md:bg-transparent md:backdrop-blur-none md:pt-0 md:pb-0 md:px-0 md:border-none">
        <h2 className="text-2xl font-bold text-white font-cinzel">CASTELO</h2>
      </div>

      {/* COMPACT Switcher Tab Buttons: [ 🔨 Forja ] | [ 🏪 Loja ] */}
      <div className="max-w-[260px] mx-auto grid grid-cols-2 gap-1 bg-[#0c0c16] border border-[#232338] rounded-xl p-1 shadow-md">
        <button
          onClick={() => setCastleTab('forja')}
          className={cn(
            "py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200",
            castleTab === 'forja'
              ? "bg-[#25133d] border border-purple-500/50 text-white shadow-md shadow-purple-900/30"
              : "text-gray-400 hover:text-white bg-transparent"
          )}
        >
          <Hammer className="w-3.5 h-3.5 text-purple-400" />
          <span>Forja</span>
        </button>
        <button
          onClick={() => setCastleTab('loja')}
          className={cn(
            "py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200",
            castleTab === 'loja'
              ? "bg-[#25133d] border border-purple-500/50 text-white shadow-md shadow-purple-900/30"
              : "text-gray-400 hover:text-white bg-transparent"
          )}
        >
          <Store className="w-3.5 h-3.5 text-purple-400" />
          <span>Loja</span>
        </button>
      </div>

      {castleTab === 'forja' ? (
        /* FORJA VIEW */
        <div className="space-y-2.5">
          
          {/* Economy Shards Header Container */}
          <div className="card-dungeon p-2.5 sm:p-3 bg-[#0a0a12] border border-[#232338] rounded-2xl space-y-2 shadow-xl">
            {/* Top Gold Total Badge */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div>
                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">OURO TOTAL</p>
                <p className="text-base sm:text-lg font-black text-amber-400 font-mono leading-tight">{economy.coins}</p>
              </div>
            </div>

            {/* 4 Shards Grid side-by-side (COMUM, RARO, ÉPICO, LENDÁRIO) */}
            <div className="grid grid-cols-4 gap-1.5 xs:gap-2">
              {/* COMUM */}
              <div className="bg-[#0c0c16] border border-gray-600/50 rounded-xl p-1.5 sm:p-2 flex flex-col items-center justify-center text-center">
                <CrystalIcon rarity="common" />
                <span className="text-[8px] font-black uppercase text-gray-400 tracking-wider font-cinzel mt-1">COMUM</span>
                <span className="text-xs font-bold text-white font-mono mt-0.5">{economy?.shards?.common || 0}</span>
              </div>
              {/* RARO */}
              <div className="bg-[#0c0c16] border border-blue-500/50 rounded-xl p-1.5 sm:p-2 flex flex-col items-center justify-center text-center">
                <CrystalIcon rarity="rare" />
                <span className="text-[8px] font-black uppercase text-blue-400 tracking-wider font-cinzel mt-1">RARO</span>
                <span className="text-xs font-bold text-blue-400 font-mono mt-0.5">{economy?.shards?.rare || 0}</span>
              </div>
              {/* ÉPICO */}
              <div className="bg-[#0c0c16] border border-purple-500/50 rounded-xl p-1.5 sm:p-2 flex flex-col items-center justify-center text-center">
                <CrystalIcon rarity="epic" />
                <span className="text-[8px] font-black uppercase text-purple-400 tracking-wider font-cinzel mt-1">ÉPICO</span>
                <span className="text-xs font-bold text-purple-400 font-mono mt-0.5">{economy?.shards?.epic || 0}</span>
              </div>
              {/* LENDÁRIO */}
              <div className="bg-[#0c0c16] border border-amber-500/50 rounded-xl p-1.5 sm:p-2 flex flex-col items-center justify-center text-center">
                <CrystalIcon rarity="legendary" />
                <span className="text-[8px] font-black uppercase text-amber-400 tracking-wider font-cinzel mt-1">LENDÁRIO</span>
                <span className="text-xs font-bold text-amber-400 font-mono mt-0.5">{economy?.shards?.legendary || 0}</span>
              </div>
            </div>
          </div>

          {/* FORJA ANCESTRAL Main Card */}
          <div className="card-dungeon p-3.5 sm:p-5 bg-gradient-to-r from-[#140b08] via-[#0c0c16] to-[#0a0a12] border border-[#232338] rounded-2xl space-y-4 relative overflow-hidden shadow-2xl">
            <div className="flex flex-row items-center justify-between gap-2.5 xs:gap-3 sm:gap-4">
              
              {/* Left: Fiery Anvil Image */}
              <div className="relative shrink-0 w-28 xs:w-36 sm:w-48 aspect-square rounded-2xl overflow-hidden bg-black/60 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-950/40">
                {!anvilImgError ? (
                  <img 
                    src={assetUrl('forja_anvil.png?v=2')}
                    alt="Forja Ancestral" 
                    className="w-full h-full object-cover opacity-95 scale-105"
                    onError={() => setAnvilImgError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-b from-amber-950/60 to-black flex items-center justify-center">
                    <Hammer className="w-14 h-14 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
              </div>

              {/* Right: FORJA ANCESTRAL Title + Quote + Arrow + Slot */}
              <div className="flex-1 flex flex-col justify-between self-stretch min-w-0">
                <div>
                  <h3 className="text-sm xs:text-base sm:text-xl font-black text-amber-500 font-cinzel tracking-wider uppercase">
                    FORJA ANCESTRAL
                  </h3>
                  <p className="text-[10px] xs:text-[11px] sm:text-xs text-gray-400 italic mt-0.5 leading-tight">
                    "O poder reside no aço refinado, não apenas no portador."
                  </p>
                </div>

                <div className="flex items-center gap-2 xs:gap-3 mt-2 sm:mt-4">
                  {/* Arrow Indicator */}
                  <div className="flex items-center text-amber-500/60 text-base xs:text-lg font-black tracking-tighter shrink-0">
                    ›››
                  </div>

                  {/* CLICKABLE Equipment Slot Box */}
                  <button
                    onClick={handleSlotBoxClick}
                    title="Clique para escolher um equipamento para refinar"
                    className={cn(
                      "w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center relative transition-all p-1.5 text-center shrink-0 cursor-pointer group/slot",
                      selectedForgeItem
                        ? `${rarityColors[selectedForgeItem.rarity].border} ${rarityColors[selectedForgeItem.rarity].bg} border-solid shadow-lg hover:scale-105`
                        : "border-amber-500/50 bg-black/40 hover:border-amber-500/80 hover:bg-amber-500/10 hover:scale-105"
                    )}
                  >
                    {selectedForgeItem ? (
                      <>
                        <span className="text-2xl xs:text-3xl sm:text-4xl drop-shadow">{selectedForgeItem.icon}</span>
                        {selectedForgeItem.upgradeLevel > 0 && (
                          <div className="absolute -top-1.5 -left-1.5 bg-yellow-500 text-black text-[8px] xs:text-[9px] font-black px-1 rounded shadow">
                            +{selectedForgeItem.upgradeLevel}
                          </div>
                        )}
                        <span className="text-[9px] xs:text-[10px] font-bold text-white truncate max-w-full mt-1">
                          {selectedForgeItem.name}
                        </span>
                        {/* Clear selection button */}
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedForgeItemId(null);
                          }}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow hover:bg-red-700"
                        >
                          ✕
                        </div>
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5 xs:w-6 xs:h-6 text-amber-400 mb-1 group-hover/slot:scale-110 transition-transform" />
                        <span className="text-[8px] xs:text-[9px] font-bold text-amber-400 font-cinzel leading-tight uppercase">
                          INSIRA UM EQUIPAMENTO
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Display Chance de Melhoria & Gasto de Ouro */}
            {selectedForgeItem && (
              <div className="bg-[#0a0a14] border border-[#2d2d44] rounded-xl p-2.5 flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-1.5 font-mono">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-400">Custo: {goldCost} Ouro</span>
                  <span className={cn("ml-1 font-bold", shardTextColor[selectedForgeItem.rarity])}>
                    • {shardCost} {shardCost === 1 ? 'Cristal' : 'Cristais'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-400 font-medium">Chance:</span>
                  <span className={cn("font-mono font-black", successChance > 50 ? "text-green-400" : "text-yellow-400")}>
                    {successChance}%
                  </span>
                </div>
              </div>
            )}

            {/* ORANGE Action Button */}
            <Button
              onClick={handleUpgrade}
              disabled={!selectedForgeItem}
              className={cn(
                "w-full py-3.5 text-xs sm:text-sm font-black rounded-xl transition-all shadow-lg font-cinzel tracking-wider uppercase border-b-4",
                selectedForgeItem
                  ? "bg-orange-600 hover:bg-orange-500 text-white border-orange-800 shadow-orange-600/30 active:scale-98 cursor-pointer"
                  : "bg-[#181826] text-gray-500 border-gray-800 cursor-not-allowed opacity-80"
              )}
            >
              {selectedForgeItem 
                ? `Refinar Equipamento (+${selectedForgeItem.upgradeLevel} → +${selectedForgeItem.upgradeLevel + 1})` 
                : 'Selecione um equipamento para começar'}
            </Button>
          </div>

          {/* EQUIPAMENTOS Selection Section */}
          <div id="equipamentos-grid" className="card-dungeon p-3.5 bg-[#0a0a12] border border-[#232338] rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black tracking-wider text-white uppercase font-cinzel">
                EQUIPAMENTOS
              </h3>

              <div className="flex items-center gap-2">
                {/* Dropdown Filter */}
                <div className="relative">
                  <select
                    value={equipmentFilter}
                    onChange={(e) => setEquipmentFilter(e.target.value)}
                    className="bg-[#12121c] border border-[#232338] text-xs font-bold text-gray-300 rounded-lg px-2.5 py-1 pr-6 appearance-none focus:outline-none focus:border-purple-500"
                  >
                    <option value="todos">Todos</option>
                    <option value="armas">Armas</option>
                    <option value="armaduras">Armaduras</option>
                    <option value="acessorios">Acessórios</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Filter Icon button */}
                <button className="w-7 h-7 rounded-lg bg-[#12121c] border border-[#232338] flex items-center justify-center text-gray-400 hover:text-white">
                  <Filter className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Horizontal Scroll Row of Selectable Equipment Cards */}
            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-purple-600/40">
              {filteredEquipment.map((item) => {
                const rarity = rarityColors[item.rarity as Rarity] || rarityColors.common;
                const isSelected = selectedForgeItemId === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedForgeItemId(isSelected ? null : item.id)}
                    className={cn(
                      "min-w-[105px] xs:min-w-[115px] p-2.5 rounded-xl border-2 flex flex-col items-center justify-center gap-1 relative transition-all duration-200 shrink-0",
                      isSelected 
                        ? "border-amber-500 bg-amber-500/20 ring-2 ring-amber-500/30 scale-102"
                        : `${rarity.border} ${rarity.bg} hover:scale-102`
                    )}
                  >
                    <div className="relative">
                      <span className="text-2xl sm:text-3xl drop-shadow">{item.icon}</span>
                      {item.upgradeLevel > 0 && (
                        <div className="absolute -top-1.5 -left-2 bg-yellow-500 text-black text-[8px] font-black px-1 rounded shadow">
                          +{item.upgradeLevel}
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-white truncate max-w-full text-center mt-0.5">
                      {item.name}
                    </span>
                    <span className={cn('text-[9px] font-medium capitalize', rarity.text)}>
                      {item.rarity}
                    </span>
                  </button>
                );
              })}

              {/* Disabled Blocked Special Attack Slot */}
              <div className="min-w-[105px] xs:min-w-[115px] p-2.5 rounded-xl border-2 border-dashed border-[#232338] bg-[#12121c]/50 opacity-50 flex flex-col items-center justify-center gap-1 shrink-0">
                <Lock className="w-5 h-5 text-gray-500" />
                <span className="text-[10px] text-gray-500 font-bold mt-0.5 text-center leading-tight">Especial Bloqueado</span>
              </div>
            </div>

            {/* Bottom Tip Bar */}
            <div className="flex items-center gap-1.5 p-2 bg-[#12121e]/80 border border-white/5 rounded-xl text-[10px] text-gray-400">
              <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Dica: Itens de maior raridade têm mais chances de obter atributos melhores na forja!</span>
            </div>
          </div>

        </div>
      ) : (
        <Market />
      )}

      {/* Item Picker Modal when clicking INSIRA UM EQUIPAMENTO */}
      <Dialog open={showItemPickerModal} onOpenChange={setShowItemPickerModal}>
        <DialogContent className="bg-[#10101c] border-[#2d2d44] text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-cinzel text-lg flex items-center gap-2">
              <Hammer className="w-5 h-5 text-amber-400" />
              Escolha um Equipamento
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-xs text-gray-400">
              Selecione o item que deseja refinar na Forja Ancestral:
            </p>
            <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
              {allAvailableItems.map((item) => {
                const colors = rarityColors[item.rarity as Rarity] || rarityColors.common;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedForgeItemId(item.id);
                      setShowItemPickerModal(false);
                    }}
                    className={cn(
                      "p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-center transition-all hover:scale-102",
                      colors.border,
                      colors.bg
                    )}
                  >
                    <span className="text-3xl">{item.icon}</span>
                    <span className="text-xs font-bold text-white truncate max-w-full">{item.name}</span>
                    <span className="text-[10px] text-yellow-500 font-mono">+{item.upgradeLevel}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Upgrade Dialog */}
      <Dialog open={confirmUpgrade} onOpenChange={(open) => { if (!open) setConfirmUpgrade(false); }}>
        <DialogContent className="bg-[#1a1a2e] border-[#2d2d44] text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-cinzel text-xl">Confirmar melhoria</DialogTitle>
          </DialogHeader>
          {selectedForgeItem && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-black/30 border border-white/10 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{selectedForgeItem.icon}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{selectedForgeItem.name}</p>
                    <p className="text-[10px] text-gray-400 uppercase">
                      +{selectedForgeItem.upgradeLevel} → +{Math.min(10, selectedForgeItem.upgradeLevel + 1)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/30 border border-white/10 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Ouro</p>
                  <p className="text-sm font-mono text-yellow-400">
                    {goldCost}
                  </p>
                </div>
                <div className="bg-black/30 border border-white/10 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Cristais</p>
                  <p className={cn("text-sm font-mono font-bold", shardTextColor[selectedForgeItem.rarity])}>
                    {shardCost}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={executeUpgrade}
                  disabled={
                    selectedForgeItem.upgradeLevel >= 10 || 
                    economy.coins < goldCost || 
                    (economy?.shards?.[selectedForgeItem.rarity] || 0) < shardCost
                  }
                  className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-bold"
                >
                  Confirmar
                </Button>
                <Button
                  onClick={() => setConfirmUpgrade(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
