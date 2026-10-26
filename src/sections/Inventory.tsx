import { CharacterPortrait } from '@/components/CharacterPortrait';
import { ItemArtwork } from '@/components/ItemArtwork';
import { canEquipClass, HERO_CLASSES } from '@/lib/campaign';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sword, 
  Shield, 
  Info, 
  X,
  ChevronUp,
  Package,
  Zap,
  Flame,
  Gem,
  Heart,
  Swords,
  Wind,
  Star as StarIcon,
  User,
  Plus
} from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { cn } from '@/lib/utils';
import type { Item, SpecialAttack } from '@/types/game';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const getEffectiveItemLevelRequirement = (item: Item): number => {
  const raw = Number((item as any).levelRequirement);
  if (Number.isFinite(raw) && raw > 0) return Math.floor(raw);

  const byRarity: Record<Item['rarity'], number> = {
    common: 2,
    rare: 3,
    epic: 5,
    legendary: 8,
    mythic: 12,
  };
  return byRarity[item.rarity] ?? 0;
};

const rarityColors: Record<string, { border: string; bg: string; text: string; glow: string }> = {
  common: { 
    border: 'border-gray-500', 
    bg: 'bg-gray-500/10', 
    text: 'text-gray-400',
    glow: ''
  },
  rare: { 
    border: 'border-blue-500', 
    bg: 'bg-blue-500/10', 
    text: 'text-blue-400',
    glow: 'shadow-blue-500/30'
  },
  epic: { 
    border: 'border-purple-500', 
    bg: 'bg-purple-500/10', 
    text: 'text-purple-400',
    glow: 'shadow-purple-500/40'
  },
  legendary: { 
    border: 'border-yellow-500', 
    bg: 'bg-yellow-500/10', 
    text: 'text-yellow-400',
    glow: 'shadow-yellow-500/50'
  },
  mythic: { 
    border: 'border-red-500', 
    bg: 'bg-red-500/10', 
    text: 'text-red-400',
    glow: 'shadow-red-500/60'
  },
};

const elementIcons: Record<string, string> = {
  fire: '🔥', water: '💧', lightning: '⚡', ice: '❄️',
  earth: '🌍', shadow: '🌑', light: '✨',
};

const VERTICAL_SLOTS: Array<{ type: 'helmet' | 'armor' | 'boots' | 'weapon' | 'accessory'; label: string; defaultIcon: string }> = [
  { type: 'helmet', label: 'Capacete', defaultIcon: '🪖' },
  { type: 'armor', label: 'Armadura', defaultIcon: '🛡️' },
  { type: 'boots', label: 'Bota', defaultIcon: '👢' },
  { type: 'weapon', label: 'Arma', defaultIcon: '⚔️' },
  { type: 'accessory', label: 'Acessório', defaultIcon: '💍' },
];

interface ItemCardProps {
  item: Item;
  onClick: () => void;
  isEquipped?: boolean;
}

function ItemCard({ item, onClick, isEquipped }: ItemCardProps) {
  const rarity = rarityColors[item.rarity];
  
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'relative aspect-square rounded-xl border-2 flex flex-col items-center justify-center gap-1 p-2',
        'transition-all duration-200 bg-[#12121c]',
        rarity.border,
        isEquipped && 'ring-2 ring-green-500 ring-offset-2 ring-offset-[#1a1a2e]',
        rarity.glow && `shadow-lg ${rarity.glow}`
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <ItemArtwork item={item} className="w-3/4 max-w-24" />
      {item.upgradeLevel > 0 && (
        <div className="absolute top-1 left-1 bg-yellow-500 text-black text-[9px] font-black px-1 rounded shadow-md z-10">
          +{item.upgradeLevel}
        </div>
      )}
      {isEquipped && (
        <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-green-500 rounded-full z-10" />
      )}
      <span className="text-[10px] font-bold text-white truncate max-w-full">
        {item.name}
      </span>
      <span className={cn('text-[9px] font-medium capitalize', rarity.text)}>
        {item.rarity}
      </span>
    </motion.button>
  );
}

interface SpecialAttackCardProps {
  attack: SpecialAttack;
  onClick: () => void;
  isEquipped?: boolean;
}

function SpecialAttackCard({ attack, onClick, isEquipped }: SpecialAttackCardProps) {
  const rarity = rarityColors[attack.rarity];
  
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'relative aspect-square rounded-xl border-2 flex flex-col items-center justify-center gap-1 p-2',
        'transition-all duration-200 bg-[#12121c]',
        rarity.border,
        isEquipped && 'ring-2 ring-orange-500 ring-offset-2 ring-offset-[#1a1a2e]',
        rarity.glow && `shadow-lg ${rarity.glow}`
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="text-2xl sm:text-3xl">{elementIcons[attack.element]}</span>
      <span className="text-[10px] text-gray-400 font-mono font-bold">×{attack.damageMultiplier}</span>
      {isEquipped && (
        <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-orange-500 rounded-full" />
      )}
      <div className={cn('text-[9px] font-medium capitalize', rarity.text)}>
        {attack.rarity}
      </div>
    </motion.button>
  );
}

export function Inventory() {
  const { 
    gameState, 
    equipItem, 
    unequipItem, 
    equipSpecialAttack, 
    unequipSpecialAttack
  } = useGame();
  const { character, inventory } = gameState;
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedSpecialAttack, setSelectedSpecialAttack] = useState<SpecialAttack | null>(null);
  const [selectedSpecialSlot, setSelectedSpecialSlot] = useState(false);
  const [equipBlocked, setEquipBlocked] = useState<{ itemName: string; requiredLevel: number } | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'armaduras' | 'acessorios' | 'itens' | 'materiais'>('all');

  const equippedItems = character.equipped;

  const getUpgradedStat = (base: number | undefined, level: number, statKey: string) => {
    if (base === undefined) return null;
    const multiplier = statKey === 'hpBonus' ? 2.0 : 0.5;
    const upgradeBonus = level * multiplier;
    const total = base + upgradeBonus;
    return {
      base: base,
      total: total,
      diff: total - base
    };
  };

  const StatRow = ({ icon: Icon, label, base, level, statKey, color, isPercent = false }: any) => {
    const stat = getUpgradedStat(base, level, statKey);
    if (!stat) return null;

    return (
      <div className={cn("flex items-center justify-between p-1.5 rounded-lg bg-black/20", color)}>
        <div className="flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5" />
          <span className="text-[11px] font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-1 font-mono">
          <span className="text-gray-400 text-[10px]">{base.toFixed(1).replace(/\.0$/, '')}{isPercent ? '%' : ''}</span>
          {stat.diff > 0 && (
            <span className="text-[9px] text-green-400 font-bold">+{stat.diff.toFixed(1).replace(/\.0$/, '')}{isPercent ? '%' : ''}</span>
          )}
          <span className="text-xs font-bold ml-1">
            {stat.total.toFixed(1).replace(/\.0$/, '')}{isPercent ? '%' : ''}
          </span>
        </div>
      </div>
    );
  };

  const equippedIds = new Set([
    equippedItems.weapon?.id,
    equippedItems.armor?.id,
    equippedItems.helmet?.id,
    equippedItems.boots?.id,
    equippedItems.accessory?.id,
  ].filter(Boolean));

  const allUnequippedItems = inventory.items.filter(item => !equippedIds.has(item.id));

  const filteredInventoryItems = allUnequippedItems.filter(item => {
    if (categoryFilter === 'armaduras') {
      return item.type === 'armor' || item.type === 'helmet' || item.type === 'boots';
    }
    if (categoryFilter === 'acessorios') {
      return item.type === 'accessory';
    }
    if (categoryFilter === 'itens') {
      return item.type === 'weapon';
    }
    return true;
  });

  const handleEquip = (item: Item) => {
    const requiredLevel = getEffectiveItemLevelRequirement(item);
    if ((Number(character.level) || 0) < requiredLevel) {
      setSelectedItem(null);
      setEquipBlocked({ itemName: item.name, requiredLevel });
      return;
    }
    equipItem(item);
    setSelectedItem(null);
  };

  const handleUnequip = (type: Item['type']) => {
    unequipItem(type);
    setSelectedSlot(null);
  };

  const handleEquipSpecial = (attack: SpecialAttack) => {
    equipSpecialAttack(attack);
    setSelectedSpecialAttack(null);
  };

  const handleUnequipSpecial = () => {
    unequipSpecialAttack();
    setSelectedSpecialSlot(false);
  };

  return (
    <div className="game-page space-y-5 py-5 sm:py-8">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-md pt-2 pb-4 border-b border-white/5 md:relative md:top-auto md:z-auto md:bg-transparent md:backdrop-blur-none md:pt-0 md:pb-0 md:px-0 md:border-none">
        <h2 className="text-2xl font-bold text-white font-cinzel mb-1">INVENTÁRIO</h2>
        <p className="text-xs text-gray-400">
          Gerencie seus equipamentos e ataques especiais
        </p>
      </div>

      {/* Hero Showcase & Attributes Section - COMPACT ATRIBUTOS & EXPANDED CHARACTER */}
      <div className="card-dungeon p-2.5 xs:p-3 sm:p-4 bg-[#0a0a12] border border-[#232338] rounded-2xl shadow-xl overflow-hidden">
        <div className="flex flex-row items-stretch justify-between gap-2 sm:gap-3">
          
          {/* Column 1: Vertical Equipment Slots (Capacete -> Armadura -> Bota -> Arma -> Acessório) */}
          <div className="flex flex-col justify-between gap-1.5 shrink-0 py-0.5">
            {VERTICAL_SLOTS.map(({ type, label, defaultIcon }) => {
              const item = equippedItems[type];
              const rarity = item ? rarityColors[item.rarity] : null;

              return (
                <button
                  key={type}
                  onClick={() => item && setSelectedSlot(type)}
                  title={item ? `${item.name} (${label})` : `Slot de ${label} (Vazio)`}
                  className={cn(
                    "w-9 h-9 xs:w-10 xs:h-10 sm:w-11 sm:h-11 rounded-xl border flex flex-col items-center justify-center relative transition-all duration-200 group",
                    item 
                      ? `${rarity?.border} ${rarity?.bg} shadow-md border-2 hover:scale-105` 
                      : "border-[#252538] bg-[#12121c]/80 hover:border-purple-500/50"
                  )}
                >
                  {item ? (
                    <>
                      <ItemArtwork item={item} className="w-full" />
                      {item.upgradeLevel > 0 && (
                        <div className="absolute -top-1 -left-1 bg-yellow-500 text-black text-[8px] font-black px-0.5 rounded shadow border border-black/40">
                          +{item.upgradeLevel}
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-xs xs:text-sm opacity-35 group-hover:opacity-60 transition-opacity">
                      {defaultIcon}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Column 2: Character Avatar Showcase (EXPANDED TO FULL CARD HEIGHT) */}
          <div className="relative flex-1 self-stretch rounded-2xl overflow-hidden bg-gradient-to-b from-purple-900/20 via-black/40 to-black/80 border border-purple-500/20 shadow-[0_0_25px_rgba(168,85,247,0.2)] flex items-center justify-center min-h-[220px] sm:min-h-[260px]">
            <CharacterPortrait heroClass={character.heroClass} className="absolute inset-0 h-full w-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c14] via-transparent to-transparent opacity-75" />

            {/* Pedestal Circle outline */}
            <div className="absolute bottom-1 w-24 xs:w-32 sm:w-40 h-5 rounded-full bg-purple-500/20 border border-purple-400/30 blur-[2px]" />
          </div>

          {/* Column 3: ATRIBUTOS Box (SHRUNK & COMPACT SLIM COLUMN) */}
          <div className="w-[110px] xs:w-[120px] sm:w-[140px] shrink-0 bg-[#0c0c16] border border-[#1e1e2e] rounded-xl p-1.5 xs:p-2 flex flex-col justify-between self-stretch shadow-inner">
            <div className="flex items-center justify-between border-b border-white/5 pb-1 mb-1">
              <span className="text-[9px] sm:text-[10px] font-black tracking-wider text-gray-300 uppercase font-cinzel">ATRIBUTOS</span>
              <Info className="w-2.5 h-2.5 text-gray-500 cursor-pointer" />
            </div>

            {/* ATK */}
            <div className="space-y-0.5">
              <div className="flex justify-between items-center text-[9px] xs:text-[10px]">
                <span className="flex items-center gap-0.5 text-red-400 font-bold"><Swords className="w-2.5 h-2.5" /> ATK</span>
                <span className="font-mono font-bold text-white">{(character.totalStats?.attack || character.stats.totalAttack).toFixed(1).replace(/\.0$/, '')}</span>
              </div>
              <div className="h-1 bg-[#181826] rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min(100, ((character.totalStats?.attack || character.stats.totalAttack) / 100) * 100)}%` }} />
              </div>
            </div>

            {/* DEF */}
            <div className="space-y-0.5">
              <div className="flex justify-between items-center text-[9px] xs:text-[10px]">
                <span className="flex items-center gap-0.5 text-blue-400 font-bold"><Shield className="w-2.5 h-2.5" /> DEF</span>
                <span className="font-mono font-bold text-white">{(character.totalStats?.defense || character.stats.totalDefense).toFixed(1).replace(/\.0$/, '')}</span>
              </div>
              <div className="h-1 bg-[#181826] rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, ((character.totalStats?.defense || character.stats.totalDefense) / 100) * 100)}%` }} />
              </div>
            </div>

            {/* HP */}
            <div className="space-y-0.5">
              <div className="flex justify-between items-center text-[9px] xs:text-[10px]">
                <span className="flex items-center gap-0.5 text-green-400 font-bold"><Heart className="w-2.5 h-2.5" /> HP</span>
                <span className="font-mono font-bold text-white">{character.totalStats?.maxHp || character.maxHp}</span>
              </div>
              <div className="h-1 bg-[#181826] rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(100, ((character.totalStats?.maxHp || character.maxHp) / 500) * 100)}%` }} />
              </div>
            </div>

            {/* CRIT */}
            <div className="space-y-0.5">
              <div className="flex justify-between items-center text-[9px] xs:text-[10px]">
                <span className="flex items-center gap-0.5 text-amber-400 font-bold"><StarIcon className="w-2.5 h-2.5" /> CRIT</span>
                <span className="font-mono font-bold text-white">{Math.round((character.totalStats?.critChance || character.stats.totalCritChance) * 100)}%</span>
              </div>
              <div className="h-1 bg-[#181826] rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, (character.totalStats?.critChance || character.stats.totalCritChance) * 100)}%` }} />
              </div>
            </div>

            {/* ESQ */}
            <div className="space-y-0.5">
              <div className="flex justify-between items-center text-[9px] xs:text-[10px]">
                <span className="flex items-center gap-0.5 text-cyan-400 font-bold"><Wind className="w-2.5 h-2.5" /> ESQ</span>
                <span className="font-mono font-bold text-white">{Math.round((character.totalStats?.dodgeChance || character.stats.totalDodgeChance) * 100)}%</span>
              </div>
              <div className="h-1 bg-[#181826] rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${Math.min(100, (character.totalStats?.dodgeChance || character.stats.totalDodgeChance) * 100)}%` }} />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Main Tabs (Equipamentos vs Ataques Especiais) */}
      <Tabs defaultValue="equipment" className="w-full">
        <TabsList className="bg-[#12121e] border border-[#232338] h-10 w-full flex rounded-xl p-1">
          <TabsTrigger value="equipment" className="flex-1 data-[state=active]:bg-[#2c1a4d] data-[state=active]:border data-[state=active]:border-purple-500/40 data-[state=active]:text-white text-xs font-bold px-2 py-1 rounded-lg transition-all">
            <Sword className="w-3.5 h-3.5 mr-1 text-purple-400" />
            Equipamentos
          </TabsTrigger>
          <TabsTrigger value="special" className="flex-1 data-[state=active]:bg-[#361c18] data-[state=active]:border data-[state=active]:border-orange-500/40 data-[state=active]:text-white text-xs font-bold px-2 py-1 rounded-lg transition-all">
            <Zap className="w-3.5 h-3.5 mr-1 text-orange-400" />
            Ataques Especiais ({inventory.specialAttacks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="equipment" className="mt-3 space-y-4">
          {/* INVENTÁRIO Grid Section matching screenshot */}
          <div className="card-dungeon p-3.5 bg-[#0a0a12] border border-[#232338] rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Package className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-black tracking-wider text-white uppercase font-cinzel">
                  INVENTÁRIO ({allUnequippedItems.length} itens)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-mono font-bold">{allUnequippedItems.length} itens</span>
                <button className="w-6 h-6 rounded-md bg-[#161626] border border-[#2d2d44] flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {filteredInventoryItems.length === 0 ? (
              <div className="text-center py-10 px-4 bg-[#080810] border border-dashed border-[#1e1e2e] rounded-xl flex flex-col items-center justify-center space-y-2">
                {/* Pixel/Vector Chest Graphic */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 opacity-80 flex items-center justify-center">
                  <svg viewBox="0 0 64 64" fill="none" className="w-full h-full drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
                    <rect x="8" y="24" width="48" height="32" rx="4" fill="#1e1e2e" stroke="#3b3b54" strokeWidth="3"/>
                    <rect x="8" y="16" width="48" height="12" rx="3" fill="#2d2d44" stroke="#4a4a68" strokeWidth="3"/>
                    <rect x="28" y="28" width="8" height="10" rx="2" fill="#eab308" stroke="#713f12" strokeWidth="2"/>
                    <circle cx="32" cy="33" r="1.5" fill="#000"/>
                  </svg>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-gray-300">Seu inventário está vazio</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Complete tarefas para ganhar itens!</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 min-[360px]:grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3 w-full">
                {filteredInventoryItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onClick={() => setSelectedItem(item)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Bottom Category Filter Buttons matching screenshot */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
            {[
              { id: 'all', label: 'Personagem', icon: User },
              { id: 'armaduras', label: 'Armaduras', icon: Shield },
              { id: 'acessorios', label: 'Acessórios', icon: Gem },
              { id: 'itens', label: 'Itens', icon: Package },
              { id: 'materiais', label: 'Materiais', icon: Flame },
            ].map(cat => {
              const Icon = cat.icon;
              const isActive = categoryFilter === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id as any)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 shrink-0 transition-all shadow-sm",
                    isActive
                      ? "bg-purple-600 border-purple-500 text-white shadow-purple-600/30"
                      : "bg-[#12121c] border-[#232338] text-gray-400 hover:bg-[#1a1a2e] hover:text-white"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

        </TabsContent>

        <TabsContent value="special" className="mt-3 space-y-4">
          {/* Equipped Special Attack */}
          <motion.div 
            className="card-dungeon p-4 bg-[#0a0a12] border border-[#232338] rounded-2xl"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
          >
            <h3 className="text-xs font-black tracking-wider text-white uppercase font-cinzel mb-3 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-orange-400" />
              Ataque Especial Equipado
            </h3>
            
            {equippedItems.specialAttack ? (
              <div className="bg-gradient-to-r from-orange-900/30 via-[#161625] to-transparent rounded-xl p-3.5 border border-orange-500/30">
                <div className="flex items-center gap-3">
                  <div className="text-4xl drop-shadow-md">{elementIcons[equippedItems.specialAttack.element]}</div>
                  <div>
                    <h4 className={cn('text-lg font-bold font-cinzel', rarityColors[equippedItems.specialAttack.rarity].text)}>
                      {equippedItems.specialAttack.name}
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">{equippedItems.specialAttack.description}</p>
                    <div className="flex gap-3 mt-1.5 text-xs font-mono font-bold">
                      <span className="text-orange-400">Dano: ×{equippedItems.specialAttack.damageMultiplier}</span>
                      <span className="text-cyan-400">Cooldown: {equippedItems.specialAttack.maxCooldown} turnos</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-[#080810] rounded-xl border border-dashed border-[#1e1e2e] text-gray-500 space-y-1.5">
                <Zap className="w-9 h-9 mx-auto opacity-50 text-orange-400" />
                <p className="text-xs font-bold text-gray-300">Nenhum ataque especial equipado</p>
                <p className="text-[11px] text-gray-500">Abra lootboxes para conseguir ataques especiais!</p>
              </div>
            )}
          </motion.div>

          {/* Special Attacks Inventory */}
          <motion.div 
            className="card-dungeon p-4 bg-[#0a0a12] border border-[#232338] rounded-2xl"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-xs font-black tracking-wider text-white uppercase font-cinzel mb-3 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-red-400" />
              Ataques Especiais Disponíveis
            </h3>
            
            {inventory.specialAttacks.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <Zap className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-xs font-bold text-gray-300">Você não tem ataques especiais</p>
                <p className="text-[11px] text-gray-500">Abra lootboxes para conseguir!</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5">
                {inventory.specialAttacks.map((attack) => (
                  <SpecialAttackCard
                    key={attack.id}
                    attack={attack}
                    isEquipped={attack.equipped}
                    onClick={() => setSelectedSpecialAttack(attack)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Item Detail Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="bg-[#12121c] border-[#252538] text-white max-w-sm rounded-2xl">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="font-cinzel text-lg flex items-center gap-3">
                  <ItemArtwork item={selectedItem} className="w-24" />
                  <div>
                    <span className={rarityColors[selectedItem.rarity].text}>
                      {selectedItem.name}
                    </span>
                    {selectedItem.upgradeLevel > 0 && (
                      <span className="ml-2 text-yellow-500 font-black">+{selectedItem.upgradeLevel}</span>
                    )}
                  </div>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-3 mt-3 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className={cn(
                    'inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
                    rarityColors[selectedItem.rarity].bg,
                    rarityColors[selectedItem.rarity].text
                  )}>
                    {selectedItem.rarity}
                  </div>
                  <div className={cn(
                    "inline-block px-2.5 py-0.5 rounded-full text-xs font-medium",
                    (Number(character.level) || 0) >= getEffectiveItemLevelRequirement(selectedItem)
                      ? "bg-green-500/10 text-green-400"
                      : "bg-red-500/10 text-red-400"
                  )}>
                    Requer nível {getEffectiveItemLevelRequirement(selectedItem)}
                  </div>
                </div>
                
                <p className="text-gray-400 leading-relaxed">{selectedItem.description}</p>
                
                <div className="space-y-1.5">
                  <h4 className="font-bold text-gray-300">Status:</h4>
                  <div className="flex flex-col gap-1">
                    <StatRow 
                      icon={Sword} 
                      label="Ataque" 
                      base={selectedItem.stats.attack} 
                      level={selectedItem.upgradeLevel} 
                      statKey="attack"
                      color="text-red-400" 
                    />
                    <StatRow 
                      icon={Shield} 
                      label="Defesa" 
                      base={selectedItem.stats.defense} 
                      level={selectedItem.upgradeLevel} 
                      statKey="defense"
                      color="text-blue-400" 
                    />
                    <StatRow 
                      icon={Heart} 
                      label="HP" 
                      base={selectedItem.stats.hpBonus} 
                      level={selectedItem.upgradeLevel} 
                      statKey="hpBonus"
                      color="text-green-400" 
                    />
                  </div>
                </div>
                
                <div className="pt-2 flex gap-2">
                  <Button
                    disabled={!canEquipClass(character, selectedItem) || character.level < selectedItem.levelRequirement}
                    onClick={() => handleEquip(selectedItem)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 font-bold h-9 text-xs"
                  >
                    <ChevronUp className="w-4 h-4 mr-1.5" />
                    {selectedItem.classRequirement && !canEquipClass(character, selectedItem) ? `Exclusivo: ${HERO_CLASSES[selectedItem.classRequirement].name}` : character.level < selectedItem.levelRequirement ? `Requer nível ${selectedItem.levelRequirement}` : 'Equipar'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Level Blocked Modal */}
      <Dialog open={!!equipBlocked} onOpenChange={() => setEquipBlocked(null)}>
        <DialogContent className="bg-[#12121c] border-[#252538] text-white max-w-sm rounded-2xl">
          {equipBlocked && (
            <>
              <DialogHeader>
                <DialogTitle className="font-cinzel text-lg flex items-center gap-2">
                  <X className="w-5 h-5 text-red-400" />
                  Não é possível equipar
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-3 mt-2 text-xs">
                <p className="text-gray-300 font-bold">{equipBlocked.itemName}</p>
                <p className="text-gray-400">
                  Seu nível: <span className="text-white font-bold">{character.level}</span> · Requerido:{' '}
                  <span className="text-red-400 font-bold">{equipBlocked.requiredLevel}</span>
                </p>

                <Button
                  onClick={() => setEquipBlocked(null)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-9 text-xs"
                >
                  Entendi
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Equipped Item Modal */}
      <Dialog open={!!selectedSlot} onOpenChange={() => setSelectedSlot(null)}>
        <DialogContent className="bg-[#12121c] border-[#252538] text-white max-w-md max-h-[90vh] overflow-y-auto rounded-2xl">
          {selectedSlot && equippedItems[selectedSlot as keyof typeof equippedItems] && (
            <>
              {(() => {
                const item = equippedItems[selectedSlot as keyof typeof equippedItems] as Item;
                return (
                  <>
                    <DialogHeader>
                      <DialogTitle className="font-cinzel text-lg flex items-center gap-3">
                        <ItemArtwork item={item} className="w-24" />
                        <div>
                          <span className={rarityColors[item.rarity].text}>
                            {item.name}
                          </span>
                          {item.upgradeLevel > 0 && (
                            <span className="ml-2 text-yellow-500 font-black">+{item.upgradeLevel}</span>
                          )}
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span className="text-[11px] text-green-400 font-bold">Equipado</span>
                          </div>
                        </div>
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-3 mt-3 text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className={cn(
                          'inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
                          rarityColors[item.rarity].bg,
                          rarityColors[item.rarity].text
                        )}>
                          {item.rarity}
                        </div>
                        <div className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-gray-300">
                          Requer nível {getEffectiveItemLevelRequirement(item)}
                        </div>
                      </div>
                      
                      <p className="text-gray-400">{item.description}</p>
                      
                      <div className="bg-[#181826] rounded-xl p-2.5 space-y-1.5">
                        <h4 className="text-xs font-bold text-gray-300 flex items-center gap-1">
                          <Sword className="w-3.5 h-3.5" />
                          Atributos do Item
                        </h4>
                        <div className="flex flex-col gap-1">
                          <StatRow 
                            icon={Sword} 
                            label="Ataque" 
                            base={item.stats.attack} 
                            level={item.upgradeLevel} 
                            statKey="attack"
                            color="text-red-400" 
                          />
                          <StatRow 
                            icon={Shield} 
                            label="Defesa" 
                            base={item.stats.defense} 
                            level={item.upgradeLevel} 
                            statKey="defense"
                            color="text-blue-400" 
                          />
                          <StatRow 
                            icon={Heart} 
                            label="HP" 
                            base={item.stats.hpBonus} 
                            level={item.upgradeLevel} 
                            statKey="hpBonus"
                            color="text-green-400" 
                          />
                        </div>
                      </div>
                      
                      <div className="pt-2 flex gap-2">
                        <Button
                          onClick={() => handleUnequip(selectedSlot as Item['type'])}
                          variant="outline"
                          className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10 font-bold h-9 text-xs"
                        >
                          <X className="w-3.5 h-3.5 mr-1.5" />
                          Desequipar
                        </Button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Special Attack Detail Modal */}
      <Dialog open={!!selectedSpecialAttack} onOpenChange={() => setSelectedSpecialAttack(null)}>
        <DialogContent className="bg-[#12121c] border-[#252538] text-white max-w-sm rounded-2xl">
          {selectedSpecialAttack && (
            <>
              <DialogHeader>
                <DialogTitle className="font-cinzel text-lg flex items-center gap-3">
                  <span className="text-3xl">{elementIcons[selectedSpecialAttack.element]}</span>
                  <span className={rarityColors[selectedSpecialAttack.rarity].text}>
                    {selectedSpecialAttack.name}
                  </span>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-3 mt-3 text-xs">
                <div className={cn(
                  'inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
                  rarityColors[selectedSpecialAttack.rarity].bg,
                  rarityColors[selectedSpecialAttack.rarity].text
                )}>
                  {selectedSpecialAttack.rarity}
                </div>
                
                <p className="text-gray-400">{selectedSpecialAttack.description}</p>
                
                <div className="pt-2 flex gap-2">
                  <Button
                    onClick={() => handleEquipSpecial(selectedSpecialAttack)}
                    disabled={selectedSpecialAttack.equipped}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 font-bold h-9 text-xs"
                  >
                    <Zap className="w-3.5 h-3.5 mr-1.5" />
                    {selectedSpecialAttack.equipped ? 'Equipado' : 'Equipar'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Equipped Special Attack Modal */}
      <Dialog open={selectedSpecialSlot} onOpenChange={() => setSelectedSpecialSlot(false)}>
        <DialogContent className="bg-[#12121c] border-[#252538] text-white max-w-sm rounded-2xl">
          {equippedItems.specialAttack && (
            <>
              <DialogHeader>
                <DialogTitle className="font-cinzel text-lg flex items-center gap-3">
                  <span className="text-3xl">{elementIcons[equippedItems.specialAttack.element]}</span>
                  <span className={rarityColors[equippedItems.specialAttack.rarity].text}>
                    {equippedItems.specialAttack.name}
                  </span>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-3 mt-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
                  <span className="text-orange-400 font-bold">Equipado</span>
                </div>
                
                <p className="text-gray-400">{equippedItems.specialAttack.description}</p>
                
                <div className="pt-2 flex gap-2">
                  <Button
                    onClick={handleUnequipSpecial}
                    variant="outline"
                    className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10 font-bold h-9 text-xs"
                  >
                    <X className="w-3.5 h-3.5 mr-1.5" />
                    Desequipar
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
