import { expandCampaignMap, applyClassBonuses, canEquipClass, type HeroClass } from '../lib/campaign';
// ============================================
// DUNGEON OF DISCIPLINE - TYPE DEFINITIONS
// ============================================

// Rarity types for items and loot
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

// Item types - simplified: only equipment and special attacks
export type ItemType = 'weapon' | 'armor' | 'helmet' | 'boots' | 'accessory' | 'specialAttack';

// Quest difficulty levels
export type Difficulty = 'easy' | 'medium' | 'hard';

// Quest types - Simplified to 3 categories
export type QuestType = 'habito' | 'diaria' | 'meta';

// Recurrence patterns for scheduled quests
export type RecurrencePattern = 'daily' | 'weekly' | 'specific-days' | 'specific-dates';

// Days of week for recurrence
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 6 = Saturday

// Element types for combat system
export type ElementType = 'fire' | 'water' | 'lightning' | 'ice' | 'earth' | 'shadow' | 'light';

// Focus tags for Master AI
export type FocusTag = 'estudos' | 'trabalho' | 'saude' | 'fitness' | 'leitura' | 'produtividade' | 'criatividade' | 'organizacao' | null;

// ============================================
// PET SYSTEM
// ============================================

export type PetId =
  | 'lobo-arcano'
  | 'morcego-vampirico'
  | 'raposa-astral'
  | 'pantera-espectral'
  | 'coruja-ancestral'
  | 'salamandra-ignea'
  | 'guardiao-de-pedra'
  | 'drako-lendario'
  | 'fenix-celestial';

export interface Pet {
  id: PetId;
  name: string;
  description: string;
  icon: string;
  attackSprite: string;
  idleSprite: string;
  abilityIcon: string;
  color: string;
  abilityName: string;
  abilityDescription: string;
  chance: number;
  shardRarity: PetShardRarity;
  unlockCost: number;
}

export const PETS: Record<PetId, Pet> = {
  'lobo-arcano': {
    id: 'lobo-arcano',
    name: 'Lobo Sombrio',
    description: 'Um lobo sombrio envolto em energia arcana roxa.',
    icon: '🐺',
    idleSprite: '🐺',
    attackSprite: '🐾',
    abilityIcon: '⚡',
    color: '#a855f7', // purple-500
    abilityName: 'Mordida Crítica',
    abilityDescription: '5% de chance de atacar. Garante crítico (1.3x) no próximo ataque do player.',
    chance: 0.05,
    shardRarity: 'rare',
    unlockCost: 10,
  },
  'morcego-vampirico': {
    id: 'morcego-vampirico',
    name: 'Morcego Vampírico',
    description: 'Um morcego das sombras com sede de sangue.',
    icon: '🦇',
    idleSprite: '🦇',
    attackSprite: '🩸',
    abilityIcon: '❤️',
    color: '#ef4444', // red-500
    abilityName: 'Dreno de Sangue',
    abilityDescription: '5% de chance de atacar. Recupera 50% do dano causado no próximo ataque.',
    chance: 0.05,
    shardRarity: 'epic',
    unlockCost: 30,
  },
  'raposa-astral': {
    id: 'raposa-astral',
    name: 'Raposa Astral',
    description: 'Uma raposa cósmica que brilha com a luz das estrelas.',
    icon: '🦊',
    idleSprite: '🦊',
    attackSprite: '✨',
    abilityIcon: '🌟',
    color: '#3b82f6', // blue-500
    abilityName: 'Esquiva Estelar',
    abilityDescription: '5% de chance de atacar. Garante esquiva no próximo ataque inimigo.',
    chance: 0.05,
    shardRarity: 'rare',
    unlockCost: 10,
  },
  'pantera-espectral': {
    id: 'pantera-espectral',
    name: 'Pantera Espectral',
    description: 'Uma pantera silenciosa que se move entre sombras.',
    icon: '🐈‍⬛',
    idleSprite: '🐈‍⬛',
    attackSprite: '🌑',
    abilityIcon: '🌀',
    color: '#a855f7',
    abilityName: 'Sombra Veloz',
    abilityDescription: '5% de chance de atacar. Aumenta a chance de esquiva no próximo ataque inimigo.',
    chance: 0.05,
    shardRarity: 'epic',
    unlockCost: 30,
  },
  'coruja-ancestral': {
    id: 'coruja-ancestral',
    name: 'Coruja Ancestral',
    description: 'Uma coruja sábia que guia sua jornada.',
    icon: '🦉',
    idleSprite: '🦉',
    attackSprite: '📜',
    abilityIcon: '🔮',
    color: '#f59e0b',
    abilityName: 'Olhar Profético',
    abilityDescription: '5% de chance de atacar. Aumenta a chance de crítico no próximo ataque do player.',
    chance: 0.05,
    shardRarity: 'rare',
    unlockCost: 10,
  },
  'salamandra-ignea': {
    id: 'salamandra-ignea',
    name: 'Salamandra Ígnea',
    description: 'Uma criatura ardente que aquece o aço e o coração.',
    icon: '🦎',
    idleSprite: '🦎',
    attackSprite: '🔥',
    abilityIcon: '💥',
    color: '#ef4444',
    abilityName: 'Chama Viva',
    abilityDescription: '5% de chance de atacar. Aumenta o dano do próximo ataque do player.',
    chance: 0.05,
    shardRarity: 'epic',
    unlockCost: 30,
  },
  'guardiao-de-pedra': {
    id: 'guardiao-de-pedra',
    name: 'Guardião de Pedra',
    description: 'Um colosso que protege com a força da terra.',
    icon: '🪨',
    idleSprite: '🪨',
    attackSprite: '🛡️',
    abilityIcon: '🧱',
    color: '#22c55e',
    abilityName: 'Pele Rochosa',
    abilityDescription: '5% de chance de atacar. Reduz o dano do próximo ataque inimigo.',
    chance: 0.05,
    shardRarity: 'legendary',
    unlockCost: 50,
  },
  'drako-lendario': {
    id: 'drako-lendario',
    name: 'Drako Lendário',
    description: 'Um dragão jovem, mas já temível.',
    icon: '🐉',
    idleSprite: '🐉',
    attackSprite: '🔥',
    abilityIcon: '👑',
    color: '#ef4444',
    abilityName: 'Fúria Dracônica',
    abilityDescription: '5% de chance de atacar. Garante crítico no próximo ataque do player.',
    chance: 0.05,
    shardRarity: 'legendary',
    unlockCost: 50,
  },
  'fenix-celestial': {
    id: 'fenix-celestial',
    name: 'Fênix Celestial',
    description: 'Uma fênix que renasce nas chamas do destino.',
    icon: '🦅',
    idleSprite: '🦅',
    attackSprite: '✨',
    abilityIcon: '❤️',
    color: '#f59e0b',
    abilityName: 'Renascimento',
    abilityDescription: '5% de chance de atacar. Recupera parte da vida no próximo ataque do player.',
    chance: 0.05,
    shardRarity: 'legendary',
    unlockCost: 50,
  },
};

// ============================================
// ELEMENT SYSTEM
// ============================================

export interface ElementEffectiveness {
  strongAgainst: ElementType[];
  weakAgainst: ElementType[];
}

export const ELEMENT_MATCHUPS: Record<ElementType, ElementEffectiveness> = {
  fire: { strongAgainst: ['ice', 'earth'], weakAgainst: ['water', 'earth'] },
  water: { strongAgainst: ['fire', 'earth'], weakAgainst: ['lightning', 'ice'] },
  lightning: { strongAgainst: ['water', 'ice'], weakAgainst: ['earth', 'shadow'] },
  ice: { strongAgainst: ['water', 'earth'], weakAgainst: ['fire', 'lightning'] },
  earth: { strongAgainst: ['lightning', 'fire'], weakAgainst: ['water', 'ice'] },
  shadow: { strongAgainst: ['light', 'lightning'], weakAgainst: ['light', 'fire'] },
  light: { strongAgainst: ['shadow', 'earth'], weakAgainst: ['shadow', 'fire'] },
};

export function calculateElementMultiplier(attackerElement: ElementType, defenderElement: ElementType): number {
  const matchup = ELEMENT_MATCHUPS[attackerElement];
  if (matchup.strongAgainst.includes(defenderElement)) return 1.25;
  if (matchup.weakAgainst.includes(defenderElement)) return 0.75;
  return 1.0;
}

// ============================================
// SPECIAL ATTACK SYSTEM
// ============================================

export interface SpecialAttack {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  element: ElementType;
  damageMultiplier: number;
  cooldown: number;
  maxCooldown: number;
  icon: string;
  equipped: boolean;
}

// Multipliers based on rarity
export const SPECIAL_ATTACK_MULTIPLIERS: Record<Rarity, number> = {
  common: 1.2,
  rare: 1.4,
  epic: 1.6,
  mythic: 1.9,
  legendary: 2.3,
};

// Cooldowns based on rarity (in turns)
export const SPECIAL_ATTACK_COOLDOWNS: Record<Rarity, number> = {
  common: 8,
  rare: 7,
  epic: 6,
  mythic: 5,
  legendary: 4,
};

// Generate special attack names based on element and rarity
export function generateSpecialAttackName(element: ElementType, rarity: Rarity): string {
  const prefixes: Record<Rarity, string> = {
    common: 'Básico',
    rare: 'Avançado',
    epic: 'Poderoso',
    mythic: 'Mítico',
    legendary: 'Lendário',
  };
  
  const elementNames: Record<ElementType, string> = {
    fire: 'de Fogo',
    water: 'de Água',
    lightning: 'do Raio',
    ice: 'de Gelo',
    earth: 'da Terra',
    shadow: 'das Sombras',
    light: 'da Luz',
  };
  
  return `Ataque ${prefixes[rarity]} ${elementNames[element]}`;
}

export function generateSpecialAttack(element: ElementType, rarity: Rarity): SpecialAttack {
  return {
    id: `special-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: generateSpecialAttackName(element, rarity),
    description: `Um ataque especial ${rarity} de elemento ${element}.`,
    rarity,
    element,
    damageMultiplier: SPECIAL_ATTACK_MULTIPLIERS[rarity],
    cooldown: 0,
    maxCooldown: SPECIAL_ATTACK_COOLDOWNS[rarity],
    icon: '⚡',
    equipped: false,
  };
}

// ============================================
// ITEM SYSTEM - WITH BALANCING
// ============================================

// Rarity multipliers for item stats
export const ITEM_RARITY_MULTIPLIERS: Record<Rarity, number> = {
  common: 1.0,
  rare: 1.2,
  epic: 1.5,
  legendary: 2.0,
  mythic: 2.5,
};

// Soft cap for total damage bonus (300% of base)
export const MAX_DAMAGE_BONUS_PERCENT = 300;

// Balance limit for stat calculation
export const STAT_BALANCE_LIMIT = {
  attack: 200,
  defense: 150,
  hpBonus: 500,
  critChance: 0.25, // 25% max from items
  dodgeChance: 0.15, // 15% max from items
};

// Gem types for socketing into items
export type GemType = 'ruby' | 'sapphire' | 'emerald' | 'diamond' | 'amethyst';

export interface Gem {
  id: string;
  name: string;
  type: GemType;
  rarity: Rarity;
  description: string;
  icon: string;
  stats: {
    attack?: number;
    defense?: number;
    hpBonus?: number;
    xpBonus?: number;
    critChance?: number;
    dodgeChance?: number;
  };
}

// ============================================
// MAP SYSTEM - Path of Exile style progression
// ============================================

export type MapId = 'map1' | 'map2' | 'map3' | 'map4' | 'map5';

export type DungeonEventType = 'combat' | 'chest' | 'merchant' | 'sanctuary';
export type EventChestRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type SanctuaryBuffType = 'attack' | 'defense' | 'gold' | 'xp';
export type PetShardRarity = 'rare' | 'epic' | 'legendary';

export interface ActiveSanctuaryBuff {
  type: SanctuaryBuffType;
  remainingCombats: number;
}

export type DungeonEventRewardType =
  | 'gold'
  | 'forgeShard'
  | 'energyFragment'
  | 'petShard'
  | 'item'
  | 'protectionStone';

export interface DungeonEventReward {
  type: DungeonEventRewardType;
  amount?: number;
  rarity?: Rarity;
  item?: Item;
}

export interface MerchantOffer {
  id: string;
  title: string;
  description: string;
  price: number;
  reward: DungeonEventReward;
}

export type DungeonEvent =
  | {
      type: 'chest';
      chestRarity: EventChestRarity;
      rewards: DungeonEventReward[];
      mapId: MapId;
      nodeId: string;
      stage: number;
    }
  | {
      type: 'merchant';
      offers: MerchantOffer[];
      mapId: MapId;
      nodeId: string;
      stage: number;
    }
  | {
      type: 'sanctuary';
      mapId: MapId;
      nodeId: string;
      stage: number;
    };

// Monster spawn data from spreadsheet
export interface MonsterSpawn {
  name: string;
  image: string;
  hp: number;
  damageMin: number;
  damageMax: number;
  defense: number; // value
  dodge: number; // percentage (0-100)
  critChance: number; // percentage (0-100)
  xp: number;
  goldMin: number;
  goldMax: number;
  chance: number; // percentage (0-100)
  drops?: {
    common?: Item[];
    rare?: Item[];
    epic?: Item[];
    legendary?: Item[];
  };
}

// Stage data with possible monster spawns
export interface StageData {
  stage: number;
  spawns: MonsterSpawn[];
}

// Global drop probabilities
export const GLOBAL_DROP_RATES = {
  common: 12,
  rare: 4,
  epic: 1,
  legendary: 0.2,
};

export interface MapNode {
  requiredWins?: number;
  wins?: number;
  lastVictoryId?: string;
  area?: number;
  requiredDays?: number;
  id: string;
  stage: number;
  name: string;
  // Current enemy (spawned when entering combat)
  currentEnemy: SpawnedEnemy | null;
  // Possible spawns for this stage (from spreadsheet)
  possibleSpawns: MonsterSpawn[];
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme' | 'boss';
  isBoss: boolean;
  isUnlocked: boolean;
  isCompleted: boolean;
}

// Enemy currently in combat (spawned from possibleSpawns)
export interface SpawnedEnemy {
  name: string;
  image: string;
  maxHp: number;
  currentHp: number;
  damageMin: number;
  damageMax: number;
  defense: number;
  dodge: number;
  critChance: number;
  xp: number;
  gold: number;
  isBoss?: boolean;
  drops?: {
    common?: Item[];
    rare?: Item[];
    epic?: Item[];
    legendary?: Item[];
  };
}

export interface GameMap {
  campaignVersion?: number;
  activityDays?: string[];
  areaActivityDays?: Record<number, string[]>;
  targetDays?: number;
  id: MapId;
  name: string;
  description: string;
  theme: string;
  nodes: MapNode[];
  isUnlocked: boolean;
  requiredLevel: number;
}

// ============================================
// MONSTER DATA FROM SPREADSHEET - EXACT VALUES
// ============================================

// Stage 1 Monsters
const RATO: MonsterSpawn = { 
  name: 'Rato', image: '🐀', hp: 55, damageMin: 8, damageMax: 11, defense: 2, dodge: 5, critChance: 3, xp: 14, goldMin: 10, goldMax: 15, chance: 40,
  drops: {
    common: [
      { id: 'sword-rato', name: 'Espada Rústica do Rato', description: 'Uma espada feita de restos metálicos.', type: 'weapon', rarity: 'common', icon: '🗡️', stats: { attack: 2 }, durability: 50, maxDurability: 50, levelRequirement: 1, upgradeLevel: 0 },
      { id: 'armor-rato', name: 'Couro Rasgado do Rato', description: 'Um peitoral de couro remendado.', type: 'armor', rarity: 'common', icon: '🛡️', stats: { defense: 2 }, durability: 50, maxDurability: 50, levelRequirement: 1, upgradeLevel: 0 }
    ]
  }
};

const RATO_PEQUENO: MonsterSpawn = { 
  name: 'Rato Pequeno', image: '🐁', hp: 40, damageMin: 6, damageMax: 9, defense: 1, dodge: 4, critChance: 2, xp: 9, goldMin: 6, goldMax: 10, chance: 60,
  drops: {
    common: [
      { id: 'dagger-rato-p', name: 'Adaga Improvisada', description: 'Uma adaga pequena mas afiada.', type: 'weapon', rarity: 'common', icon: '🔪', stats: { attack: 1 }, durability: 40, maxDurability: 40, levelRequirement: 1, upgradeLevel: 0 },
      { id: 'rag-rato-p', name: 'Trapo Costurado', description: 'Um pedaço de pano reforçado.', type: 'armor', rarity: 'common', icon: '👕', stats: { defense: 1 }, durability: 40, maxDurability: 40, levelRequirement: 1, upgradeLevel: 0 }
    ]
  }
};

const OURICO: MonsterSpawn = {
  name: 'Ouriço', image: '🦔', hp: 75, damageMin: 9, damageMax: 12, defense: 3, dodge: 4, critChance: 3, xp: 20, goldMin: 8, goldMax: 13, chance: 40,
  drops: {
    common: [
      { id: 'spear-ourico', name: 'Lança de Espinhos', description: 'Uma lança coberta de espinhos afiados.', type: 'weapon', rarity: 'common', icon: '🗡️', stats: { attack: 3 }, durability: 70, maxDurability: 70, levelRequirement: 3, upgradeLevel: 0 },
      { id: 'armor-ourico', name: 'Armadura Espinhosa', description: 'Uma armadura que protege e fere quem se aproxima.', type: 'armor', rarity: 'common', icon: '🛡️', stats: { defense: 3 }, durability: 70, maxDurability: 70, levelRequirement: 3, upgradeLevel: 0 }
    ],
    rare: [
      { id: 'spear-ourico-rare', name: 'Lança de Espinhos Reforçada', description: 'Espinhos mais longos e resistentes.', type: 'weapon', rarity: 'rare', icon: '🗡️', stats: { attack: 5 }, durability: 110, maxDurability: 110, levelRequirement: 4, upgradeLevel: 0 },
      { id: 'armor-ourico-rare', name: 'Couraça de Espinhos', description: 'Uma couraça reforçada com placas espinhosas.', type: 'armor', rarity: 'rare', icon: '🛡️', stats: { defense: 5 }, durability: 110, maxDurability: 110, levelRequirement: 4, upgradeLevel: 0 }
    ]
  }
};

const COELHO: MonsterSpawn = { 
  name: 'Coelho', image: '🐇', hp: 90, damageMin: 11, damageMax: 15, defense: 3, dodge: 10, critChance: 5, xp: 24, goldMin: 14, goldMax: 20, chance: 70,
  drops: {
    common: [
      { id: 'sword-coelho', name: 'Lâmina Ágil do Coelho', description: 'Uma lâmina leve e veloz.', type: 'weapon', rarity: 'common', icon: '⚔️', stats: { attack: 4 }, durability: 80, maxDurability: 80, levelRequirement: 5, upgradeLevel: 0 },
      { id: 'armor-coelho', name: 'Peitoral Leve do Coelho', description: 'Um peitoral que não limita os movimentos.', type: 'armor', rarity: 'common', icon: '🛡️', stats: { defense: 4 }, durability: 80, maxDurability: 80, levelRequirement: 5, upgradeLevel: 0 }
    ],
    rare: [
      { id: 'sword-coelho-rare', name: 'Lâmina Ágil Reforçada', description: 'Uma versão superior da lâmina do coelho.', type: 'weapon', rarity: 'rare', icon: '⚔️', stats: { attack: 7 }, durability: 120, maxDurability: 120, levelRequirement: 6, upgradeLevel: 0 },
      { id: 'armor-coelho-rare', name: 'Peitoral Leve Reforçado', description: 'Proteção aprimorada para exploradores.', type: 'armor', rarity: 'rare', icon: '🛡️', stats: { defense: 7 }, durability: 120, maxDurability: 120, levelRequirement: 6, upgradeLevel: 0 }
    ]
  }
};

const GAMBA: MonsterSpawn = {
  name: 'Gambá', image: '🦨', hp: 105, damageMin: 13, damageMax: 17, defense: 4, dodge: 6, critChance: 6, xp: 31, goldMin: 16, goldMax: 23, chance: 40,
  drops: {
    common: [
      { id: 'dagger-gamba', name: 'Adaga Tóxica', description: 'Uma adaga com resíduos tóxicos.', type: 'weapon', rarity: 'common', icon: '🗡️', stats: { attack: 5 }, durability: 110, maxDurability: 110, levelRequirement: 6, upgradeLevel: 0 },
      { id: 'cloak-gamba', name: 'Manto Resistente', description: 'Um manto que resiste a danos e sujeira.', type: 'armor', rarity: 'common', icon: '🛡️', stats: { defense: 5 }, durability: 110, maxDurability: 110, levelRequirement: 6, upgradeLevel: 0 }
    ],
    rare: [
      { id: 'blade-gamba-rare', name: 'Lâmina Venenosa', description: 'Uma lâmina refinada com essência de veneno.', type: 'weapon', rarity: 'rare', icon: '⚔️', stats: { attack: 8 }, durability: 160, maxDurability: 160, levelRequirement: 7, upgradeLevel: 0 },
      { id: 'armor-gamba-rare', name: 'Armadura Antitóxica', description: 'Proteção projetada contra toxinas.', type: 'armor', rarity: 'rare', icon: '🛡️', stats: { defense: 8 }, durability: 160, maxDurability: 160, levelRequirement: 7, upgradeLevel: 0 }
    ]
  }
};

const ESQUILO: MonsterSpawn = { 
  name: 'Esquilo', image: '🐿️', hp: 120, damageMin: 15, damageMax: 19, defense: 5, dodge: 12, critChance: 8, xp: 38, goldMin: 20, goldMax: 28, chance: 70,
  drops: {
    common: [
      { id: 'sword-esquilo', name: 'Espada Afiada do Esquilo', description: 'Uma espada balanceada.', type: 'weapon', rarity: 'common', icon: '🗡️', stats: { attack: 6 }, durability: 140, maxDurability: 140, levelRequirement: 8, upgradeLevel: 0 },
      { id: 'armor-esquilo', name: 'Armadura de Couro Flexível', description: 'Proteção de couro de alta qualidade.', type: 'armor', rarity: 'common', icon: '🛡️', stats: { defense: 6 }, durability: 140, maxDurability: 140, levelRequirement: 8, upgradeLevel: 0 }
    ],
    rare: [
      { id: 'sword-esquilo-rare', name: 'Espada Afiada Reforjada', description: 'Reforjada em chamas sagradas.', type: 'weapon', rarity: 'rare', icon: '🗡️', stats: { attack: 9 }, durability: 180, maxDurability: 180, levelRequirement: 9, upgradeLevel: 0 },
      { id: 'armor-esquilo-rare', name: 'Armadura Flexível Reforçada', description: 'Proteção reforçada com couro flexível.', type: 'armor', rarity: 'rare', icon: '🛡️', stats: { defense: 9 }, durability: 180, maxDurability: 180, levelRequirement: 9, upgradeLevel: 0 }
    ]
  }
};

const RAPOSA: MonsterSpawn = {
  name: 'Raposa', image: '🦊', hp: 145, damageMin: 18, damageMax: 23, defense: 7, dodge: 15, critChance: 10, xp: 46, goldMin: 25, goldMax: 34, chance: 30,
  drops: {
    rare: [
      { id: 'blade-raposa-rare', name: 'Lâmina da Raposa', description: 'Uma lâmina ágil e mortal.', type: 'weapon', rarity: 'rare', icon: '⚔️', stats: { attack: 10 }, durability: 220, maxDurability: 220, levelRequirement: 10, upgradeLevel: 0 },
      { id: 'armor-raposa-rare', name: 'Armadura da Raposa', description: 'Proteção leve e resistente.', type: 'armor', rarity: 'rare', icon: '🛡️', stats: { defense: 10 }, durability: 220, maxDurability: 220, levelRequirement: 10, upgradeLevel: 0 }
    ],
    epic: [
      { id: 'blade-raposa-epic', name: 'Lâmina da Raposa Sombria', description: 'Uma lâmina envolta em sombras.', type: 'weapon', rarity: 'epic', icon: '🗡️', stats: { attack: 12 }, durability: 280, maxDurability: 280, levelRequirement: 11, upgradeLevel: 0 },
      { id: 'armor-raposa-epic', name: 'Manto da Raposa Sombria', description: 'Um manto que confunde os olhos inimigos.', type: 'armor', rarity: 'epic', icon: '🛡️', stats: { defense: 12 }, durability: 280, maxDurability: 280, levelRequirement: 11, upgradeLevel: 0 }
    ]
  }
};

const ESQUILO_ELITE: MonsterSpawn = { 
  name: 'Esquilo Elite', image: '🐿️', hp: 155, damageMin: 21, damageMax: 26, defense: 8, dodge: 16, critChance: 12, xp: 60, goldMin: 28, goldMax: 38, chance: 70,
  drops: {
    epic: [
      { id: 'sword-elite-epic', name: 'Lâmina Reluzente da Floresta', description: 'Uma lâmina rara que brilha em combate.', type: 'weapon', rarity: 'epic', icon: '✨', stats: { attack: 13 }, durability: 260, maxDurability: 260, levelRequirement: 12, upgradeLevel: 0 },
      { id: 'armor-elite-epic', name: 'Armadura Selvagem Ancestral', description: 'Armadura ancestral usada por guerreiros da floresta.', type: 'armor', rarity: 'epic', icon: '🌿', stats: { defense: 13 }, durability: 260, maxDurability: 260, levelRequirement: 12, upgradeLevel: 0 }
    ]
  }
};

const RATO_GIGANTE: MonsterSpawn = { 
  name: 'Rato Gigante', image: '🐀', hp: 180, damageMin: 25, damageMax: 30, defense: 7, dodge: 8, critChance: 10, xp: 75, goldMin: 35, goldMax: 48, chance: 7.5,
  drops: {
    epic: [
      { id: 'axe-gigante-epic', name: 'Machado do Rato Gigante', description: 'Um machado brutal feito para esmagar.', type: 'weapon', rarity: 'epic', icon: '🪓', stats: { attack: 14 }, durability: 300, maxDurability: 300, levelRequirement: 13, upgradeLevel: 0 },
      { id: 'armor-gigante-epic', name: 'Couraça do Rato Gigante', description: 'Uma couraça pesada e resistente.', type: 'armor', rarity: 'epic', icon: '🛡️', stats: { defense: 14 }, durability: 300, maxDurability: 300, levelRequirement: 13, upgradeLevel: 0 }
    ]
  }
};

const URSO_ANCESTRAL: MonsterSpawn = { 
  name: 'Urso Ancestral', image: '🐻', hp: 230, damageMin: 30, damageMax: 36, defense: 10, dodge: 5, critChance: 18, xp: 110, goldMin: 80, goldMax: 120, chance: 100,
  drops: {
    epic: [
      { id: 'sword-urso-epic', name: 'Espada do Urso Ancestral', description: 'Uma lâmina pesada e brutal.', type: 'weapon', rarity: 'epic', icon: '🗡️', stats: { attack: 16 }, durability: 360, maxDurability: 360, levelRequirement: 15, upgradeLevel: 0 },
      { id: 'armor-urso-epic', name: 'Armadura do Urso Ancestral', description: 'Uma armadura feita de ossos e couro.', type: 'armor', rarity: 'epic', icon: '🛡️', stats: { defense: 16 }, durability: 360, maxDurability: 360, levelRequirement: 15, upgradeLevel: 0 }
    ]
  }
};

// Map 1: Floresta Sombria
const MAP1_STAGES: StageData[] = [
  {
    stage: 1,
    spawns: [
      { ...RATO_PEQUENO, chance: 70 },
      { ...RATO, chance: 30 },
    ],
  },
  {
    stage: 2,
    spawns: [
      { ...RATO, chance: 30, drops: { common: RATO.drops?.common } },
      { ...OURICO, chance: 40 },
      { ...COELHO, chance: 30 },
    ],
  },
  {
    stage: 3,
    spawns: [
      { ...COELHO, chance: 30 },
      { ...GAMBA, chance: 40 },
      { ...ESQUILO, chance: 30 },
    ],
  },
  {
    stage: 4,
    spawns: [
      { ...ESQUILO, chance: 42.5 },
      { ...RAPOSA, chance: 30 },
      { ...ESQUILO_ELITE, chance: 20 },
      { ...RATO_GIGANTE, chance: 7.5 },
    ],
  },
  {
    stage: 5,
    spawns: [
      { ...URSO_ANCESTRAL, chance: 100 },
    ],
  },
];

// Map 2: Cripta Antiga
const MAP2_STAGES: StageData[] = [
  {
    stage: 1,
    spawns: [
      { name: 'Ouriço', image: '🦔', hp: 95, damageMin: 8, damageMax: 11, defense: 4, dodge: 3, critChance: 2, xp: 18, goldMin: 4, goldMax: 10, chance: 70 },
      { name: 'Esquilo de Elite', image: '🐿', hp: 110, damageMin: 8, damageMax: 10, defense: 4, dodge: 4, critChance: 4, xp: 18, goldMin: 4, goldMax: 10, chance: 30 },
    ],
  },
  {
    stage: 2,
    spawns: [
      { name: 'Castor', image: '🦫', hp: 100, damageMin: 8, damageMax: 11, defense: 4, dodge: 3, critChance: 2, xp: 20, goldMin: 6, goldMax: 16, chance: 70 },
      { name: 'Ouriço', image: '🦔', hp: 95, damageMin: 8, damageMax: 11, defense: 4, dodge: 3, critChance: 2, xp: 18, goldMin: 6, goldMax: 16, chance: 30 },
    ],
  },
  {
    stage: 3,
    spawns: [
      { name: 'Raposa', image: '🦊', hp: 120, damageMin: 9, damageMax: 12, defense: 5, dodge: 4, critChance: 5, xp: 24, goldMin: 10, goldMax: 24, chance: 70 },
      { name: 'Castor', image: '🦫', hp: 100, damageMin: 8, damageMax: 11, defense: 4, dodge: 3, critChance: 2, xp: 20, goldMin: 10, goldMax: 24, chance: 30 },
    ],
  },
  {
    stage: 4,
    spawns: [
      { name: 'Lobo Alfa', image: '🐺', hp: 150, damageMin: 10, damageMax: 13, defense: 6, dodge: 3, critChance: 8, xp: 28, goldMin: 16, goldMax: 40, chance: 70 },
      { name: 'Urso Jovem', image: '🐻', hp: 230, damageMin: 14, damageMax: 18, defense: 8, dodge: 3, critChance: 10, xp: 40, goldMin: 16, goldMax: 40, chance: 5 },
      { name: 'Raposa', image: '🦊', hp: 120, damageMin: 9, damageMax: 12, defense: 5, dodge: 4, critChance: 5, xp: 24, goldMin: 16, goldMax: 40, chance: 25 },
    ],
  },
  {
    stage: 5,
    spawns: [
      { name: 'Leão', image: '🦁', hp: 360, damageMin: 26, damageMax: 35, defense: 8, dodge: 2, critChance: 15, xp: 90, goldMin: 80, goldMax: 120, chance: 100 },
    ],
  },
];

// Map 3: Vulcão Ardente
const MAP3_STAGES: StageData[] = [
  {
    stage: 1,
    spawns: [
      { name: 'Gambá', image: '🦨', hp: 130, damageMin: 11, damageMax: 15, defense: 5, dodge: 3, critChance: 4, xp: 30, goldMin: 4, goldMax: 10, chance: 70 },
      { name: 'Lobo Alfa', image: '🐺', hp: 150, damageMin: 10, damageMax: 13, defense: 6, dodge: 3, critChance: 8, xp: 28, goldMin: 4, goldMax: 10, chance: 30 },
    ],
  },
  {
    stage: 2,
    spawns: [
      { name: 'Morcego', image: '🦇', hp: 140, damageMin: 12, damageMax: 16, defense: 5, dodge: 4, critChance: 6, xp: 32, goldMin: 6, goldMax: 16, chance: 70 },
      { name: 'Gambá', image: '🦨', hp: 130, damageMin: 11, damageMax: 15, defense: 5, dodge: 3, critChance: 4, xp: 30, goldMin: 6, goldMax: 16, chance: 30 },
    ],
  },
  {
    stage: 3,
    spawns: [
      { name: 'Águia', image: '🦅', hp: 170, damageMin: 13, damageMax: 17, defense: 6, dodge: 4, critChance: 7, xp: 36, goldMin: 10, goldMax: 24, chance: 70 },
      { name: 'Morcego', image: '🦇', hp: 140, damageMin: 12, damageMax: 16, defense: 5, dodge: 4, critChance: 6, xp: 32, goldMin: 10, goldMax: 24, chance: 30 },
    ],
  },
  {
    stage: 4,
    spawns: [
      { name: 'Gorila Bravo', image: '🦍', hp: 200, damageMin: 14, damageMax: 18, defense: 6, dodge: 5, critChance: 10, xp: 40, goldMin: 16, goldMax: 40, chance: 70 },
      { name: 'Ent', image: '🌲', hp: 330, damageMin: 21, damageMax: 28, defense: 9, dodge: 3, critChance: 12, xp: 60, goldMin: 16, goldMax: 40, chance: 5 },
      { name: 'Águia', image: '🦅', hp: 170, damageMin: 13, damageMax: 17, defense: 6, dodge: 4, critChance: 7, xp: 36, goldMin: 16, goldMax: 40, chance: 25 },
    ],
  },
  {
    stage: 5,
    spawns: [
      { name: 'Leão Ancestral', image: '🦁', hp: 520, damageMin: 38, damageMax: 50, defense: 9, dodge: 3, critChance: 20, xp: 130, goldMin: 80, goldMax: 120, chance: 100 },
    ],
  },
];

// Map 4: Abismo Infernal
const MAP4_STAGES: StageData[] = [
  {
    stage: 1,
    spawns: [
      { name: 'Cabra', image: '🐐', hp: 180, damageMin: 15, damageMax: 20, defense: 5, dodge: 4, critChance: 6, xp: 40, goldMin: 4, goldMax: 10, chance: 70 },
      { name: 'Gorila Bravo', image: '🦍', hp: 200, damageMin: 14, damageMax: 18, defense: 6, dodge: 5, critChance: 10, xp: 40, goldMin: 4, goldMax: 10, chance: 30 },
    ],
  },
  {
    stage: 2,
    spawns: [
      { name: 'Carneiro', image: '🐏', hp: 220, damageMin: 18, damageMax: 24, defense: 7, dodge: 3, critChance: 8, xp: 45, goldMin: 6, goldMax: 16, chance: 70 },
      { name: 'Cabra', image: '🐐', hp: 180, damageMin: 15, damageMax: 20, defense: 5, dodge: 4, critChance: 6, xp: 40, goldMin: 6, goldMax: 16, chance: 30 },
    ],
  },
  {
    stage: 3,
    spawns: [
      { name: 'Bisão', image: '🦬', hp: 240, damageMin: 18, damageMax: 24, defense: 7, dodge: 3, critChance: 10, xp: 48, goldMin: 10, goldMax: 24, chance: 70 },
      { name: 'Carneiro', image: '🐏', hp: 220, damageMin: 18, damageMax: 24, defense: 7, dodge: 3, critChance: 8, xp: 45, goldMin: 10, goldMax: 24, chance: 30 },
    ],
  },
  {
    stage: 4,
    spawns: [
      { name: 'Touro de Elite', image: '🐂', hp: 260, damageMin: 20, damageMax: 26, defense: 7, dodge: 5, critChance: 12, xp: 52, goldMin: 16, goldMax: 40, chance: 70 },
      { name: 'Bisão Gigante', image: '🦬', hp: 480, damageMin: 32, damageMax: 40, defense: 10, dodge: 3, critChance: 15, xp: 80, goldMin: 16, goldMax: 40, chance: 5 },
      { name: 'Bisão', image: '🦬', hp: 240, damageMin: 18, damageMax: 24, defense: 7, dodge: 3, critChance: 10, xp: 48, goldMin: 16, goldMax: 40, chance: 25 },
    ],
  },
  {
    stage: 5,
    spawns: [
      { name: 'Gorila Rei', image: '🦍', hp: 750, damageMin: 54, damageMax: 75, defense: 11, dodge: 4, critChance: 25, xp: 170, goldMin: 80, goldMax: 120, chance: 100 },
    ],
  },
];

// Map 5: Ninho do Dragão
const MAP5_STAGES: StageData[] = [
  {
    stage: 1,
    spawns: [
      { name: 'Cervo', image: '🦌', hp: 320, damageMin: 25, damageMax: 35, defense: 8, dodge: 2, critChance: 10, xp: 70, goldMin: 4, goldMax: 10, chance: 70 },
      { name: 'Touro de Elite', image: '🐂', hp: 260, damageMin: 20, damageMax: 26, defense: 7, dodge: 5, critChance: 12, xp: 52, goldMin: 4, goldMax: 10, chance: 30 },
    ],
  },
  {
    stage: 2,
    spawns: [
      { name: 'Lhama', image: '🦙', hp: 380, damageMin: 26, damageMax: 36, defense: 9, dodge: 2, critChance: 12, xp: 75, goldMin: 6, goldMax: 16, chance: 70 },
      { name: 'Cervo', image: '🦌', hp: 320, damageMin: 25, damageMax: 35, defense: 8, dodge: 2, critChance: 10, xp: 70, goldMin: 6, goldMax: 16, chance: 30 },
    ],
  },
  {
    stage: 3,
    spawns: [
      { name: 'Girafa', image: '🦒', hp: 420, damageMin: 28, damageMax: 38, defense: 9, dodge: 2, critChance: 15, xp: 80, goldMin: 10, goldMax: 24, chance: 70 },
      { name: 'Lhama', image: '🦙', hp: 380, damageMin: 26, damageMax: 36, defense: 9, dodge: 2, critChance: 12, xp: 75, goldMin: 10, goldMax: 24, chance: 30 },
    ],
  },
  {
    stage: 4,
    spawns: [
      { name: 'Leopardo Veloz', image: '🐆', hp: 470, damageMin: 30, damageMax: 40, defense: 8, dodge: 4, critChance: 18, xp: 85, goldMin: 16, goldMax: 40, chance: 70 },
      { name: 'Rino Real', image: '🦏', hp: 800, damageMin: 50, damageMax: 65, defense: 12, dodge: 2, critChance: 20, xp: 120, goldMin: 16, goldMax: 40, chance: 5 },
      { name: 'Girafa', image: '🦒', hp: 420, damageMin: 28, damageMax: 38, defense: 9, dodge: 2, critChance: 15, xp: 80, goldMin: 16, goldMax: 40, chance: 25 },
    ],
  },
  {
    stage: 5,
    spawns: [
      { name: 'Elefante', image: '🐘', hp: 1400, damageMin: 90, damageMax: 125, defense: 13, dodge: 3, critChance: 30, xp: 260, goldMin: 80, goldMax: 120, chance: 100 },
    ],
  },
];

// All map data
const MAP_STAGES: Record<MapId, StageData[]> = {
  map1: MAP1_STAGES,
  map2: MAP2_STAGES,
  map3: MAP3_STAGES,
  map4: MAP4_STAGES,
  map5: MAP5_STAGES,
};

// Spawn a monster based on weighted chances
export function spawnMonster(stageData: StageData): SpawnedEnemy {
  const roll = Math.random() * 100;
  let cumulativeChance = 0;
  
  for (const spawn of stageData.spawns) {
    cumulativeChance += spawn.chance;
    if (roll <= cumulativeChance) {
      const goldReward = spawn.goldMin + Math.floor(Math.random() * (spawn.goldMax - spawn.goldMin + 1));
      
      return {
        name: spawn.name,
        image: spawn.image,
        maxHp: spawn.hp,
        currentHp: spawn.hp,
        damageMin: spawn.damageMin,
        damageMax: spawn.damageMax,
        defense: spawn.defense,
        dodge: spawn.dodge,
        critChance: spawn.critChance,
        xp: spawn.xp,
        gold: goldReward,
        isBoss: stageData.stage % 5 === 0, // Stage 5 is boss
        drops: spawn.drops,
      };
    }
  }
  
  // Fallback to first spawn
  const fallback = stageData.spawns[0];
  const fallbackGold = fallback.goldMin + Math.floor(Math.random() * (fallback.goldMax - fallback.goldMin + 1));
  
  return {
    name: fallback.name,
    image: fallback.image,
    maxHp: fallback.hp,
    currentHp: fallback.hp,
    damageMin: fallback.damageMin,
    damageMax: fallback.damageMax,
    defense: fallback.defense,
    dodge: fallback.dodge,
    critChance: fallback.critChance,
    xp: fallback.xp,
    gold: fallbackGold,
    isBoss: stageData.stage % 5 === 0,
    drops: fallback.drops,
  };
}

// Calculate if a monster drops an item based on global rates
export function calculateMonsterDrop(enemy: SpawnedEnemy): Item | null {
  if (!enemy.drops) return null;

  const roll = Math.random() * 100;
  
  // Check rarities from highest to lowest
  // Legendary (3% - only boss)
  if (enemy.isBoss && enemy.drops.legendary && roll <= GLOBAL_DROP_RATES.legendary) {
    const drops = enemy.drops.legendary;
    return { ...drops[Math.floor(Math.random() * drops.length)], id: `drop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
  }
  
  // Epic (5%)
  if (enemy.drops.epic && roll <= GLOBAL_DROP_RATES.epic) {
    const drops = enemy.drops.epic;
    return { ...drops[Math.floor(Math.random() * drops.length)], id: `drop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
  }
  
  // Rare (7%)
  if (enemy.drops.rare && roll <= GLOBAL_DROP_RATES.rare) {
    const drops = enemy.drops.rare;
    return { ...drops[Math.floor(Math.random() * drops.length)], id: `drop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
  }
  
  // Common (15%)
  if (enemy.drops.common && roll <= GLOBAL_DROP_RATES.common) {
    const drops = enemy.drops.common;
    return { ...drops[Math.floor(Math.random() * drops.length)], id: `drop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
  }

  return null;
}

// Generate a complete map with nodes
export function generateMap(mapId: MapId): GameMap {
  const mapNames: Record<MapId, { name: string; description: string; theme: string }> = {
    map1: { name: 'Floresta Sombria', description: 'Uma floresta infestada de criaturas sombrias.', theme: 'green' },
    map2: { name: 'Deserto das Cinzas', description: 'Vastos desertos escaldantes e ruínas antigas.', theme: 'amber' },
    map3: { name: 'Tundra Congelada', description: 'Montanhas gélidas cobertas por neve e gelo.', theme: 'blue' },
    map4: { name: 'Terras Vulcânicas', description: 'Fendas incandescentes e rios de lava escaldante.', theme: 'red' },
    map5: { name: 'Abismo', description: 'O vórtex abissal das sombras profundas.', theme: 'purple' },
  };
  
  const stages = MAP_STAGES[mapId];
  const nodes: MapNode[] = [];
  
  for (let i = 0; i < 5; i++) {
    const stageData = stages[i];
    const isBoss = i === 4;
    
    nodes.push({
      id: `${mapId}-stage${i + 1}`,
      stage: i + 1,
      name: isBoss ? 'BOSS' : `Etapa ${i + 1}`,
      currentEnemy: null, // Will be spawned when entering combat
      possibleSpawns: stageData.spawns,
      difficulty: isBoss ? 'boss' : ['easy', 'medium', 'hard', 'extreme'][i] as 'easy' | 'medium' | 'hard' | 'extreme',
      isBoss,
      isUnlocked: i === 0, // Only first stage unlocked initially
      isCompleted: false,
    });
  }
  
  return expandCampaignMap({
    id: mapId,
    ...mapNames[mapId],
    nodes,
    isUnlocked: mapId === 'map1', // Only map 1 unlocked initially
    requiredLevel: (parseInt(mapId.replace('map', '')) - 1) * 5 + 1,
  });
}

// Generate all 5 maps
export function generateAllMaps(): Record<MapId, GameMap> {
  return {
    map1: generateMap('map1'),
    map2: generateMap('map2'),
    map3: generateMap('map3'),
    map4: generateMap('map4'),
    map5: generateMap('map5'),
  };
}

// ============================================
// CENTRAL STATS RECALCULATION
// ============================================

// Calculate total equipment bonuses from all equipped items
export function calculateEquipmentBonuses(equipped: Character['equipped']): Character['equipmentBonuses'] {
  const bonuses: Character['equipmentBonuses'] = {
    attack: 0,
    defense: 0,
    maxHp: 0,
    dodgeChance: 0,
    critChance: 0,
    xpBonus: 0,
    coinBonus: 0,
  };

  const equipmentSlots = ['weapon', 'armor', 'helmet', 'boots', 'accessory'] as const;

  equipmentSlots.forEach(slot => {
    const item = equipped[slot];
    if (item && 'stats' in item) {
      // Forge upgrade bonus: +0.5 per upgrade level (e.g., +10 adds +5 to base stat)
      const upgradeBonus = item.upgradeLevel * 0.5;

      // Add item stats with upgrade bonus
      if (item.stats.attack !== undefined) bonuses.attack += item.stats.attack + upgradeBonus;
      if (item.stats.defense !== undefined) bonuses.defense += item.stats.defense + upgradeBonus;
      if (item.stats.hpBonus !== undefined) bonuses.maxHp += item.stats.hpBonus + (upgradeBonus * 2); // HP scales more
      
      bonuses.dodgeChance += (item.stats.dodgeChance || 0);
      bonuses.critChance += (item.stats.critChance || 0);
      bonuses.xpBonus += item.stats.xpBonus || 0;
      bonuses.coinBonus += item.stats.coinBonus || 0;

      // Add gem stats
      if (item.gemSlot) {
        bonuses.attack += item.gemSlot.stats.attack || 0;
        bonuses.defense += item.gemSlot.stats.defense || 0;
        bonuses.maxHp += item.gemSlot.stats.hpBonus || 0;
        bonuses.dodgeChance += item.gemSlot.stats.dodgeChance || 0;
        bonuses.critChance += item.gemSlot.stats.critChance || 0;
        bonuses.xpBonus += item.gemSlot.stats.xpBonus || 0;
      }
    }
  });

  return bonuses;
}

// Central function to recalculate all player stats
// Call this after: equip item, unequip item, level up
export function recalculatePlayerStats(character: Character): Character {
  const level = Number(character.level) || 0;
  const slots = ['weapon', 'armor', 'helmet', 'boots', 'accessory'] as const;
  const byRarity: Record<Rarity, number> = {
    common: 2,
    rare: 3,
    epic: 5,
    legendary: 8,
    mythic: 12,
  };

  const effectiveEquipped = { ...(character.equipped || {}) } as Character['equipped'];
  for (const slot of slots) {
    const item = effectiveEquipped[slot];
    if (!item) continue;
    const reqRaw = Number((item as any).levelRequirement);
    const req = Number.isFinite(reqRaw) && reqRaw > 0 ? Math.floor(reqRaw) : (byRarity[item.rarity] ?? 0);
    if (req > level || !canEquipClass(character, item)) {
      delete (effectiveEquipped as any)[slot];
    }
  }

  // Calculate equipment bonuses
  const equipmentBonuses = calculateEquipmentBonuses(effectiveEquipped);

  // Calculate total stats (base + equipment)
  // Keep decimals for "accumulated rounding" logic during combat
  const hero = applyClassBonuses(character.heroClass, character.baseStats.attack + equipmentBonuses.attack, character.baseStats.maxHp + equipmentBonuses.maxHp);
  const totalStats = {
    attack: hero.attack,
    defense: character.baseStats.defense + equipmentBonuses.defense,
    maxHp: hero.maxHp, // HP stays rounded for visual clarity
    dodgeChance: Math.min(character.baseStats.dodgeChance + equipmentBonuses.dodgeChance + (hero?.dodge || 0), 0.35), // 35% cap
    critChance: Math.min(character.baseStats.critChance + equipmentBonuses.critChance + (hero?.crit || 0), 0.40), // 40% cap
    critMultiplier: character.baseStats.critMultiplier, // 150% base
  };

  // Update current HP to not exceed new max
  const currentHp = Math.min(character.hp, totalStats.maxHp);

  // Update legacy fields for backward compatibility
  const legacyStats = {
    totalAttack: totalStats.attack,
    totalDefense: totalStats.defense,
    totalDodgeChance: totalStats.dodgeChance,
    totalCritChance: totalStats.critChance,
    itemHpBonus: equipmentBonuses.maxHp,
    itemXpBonus: equipmentBonuses.xpBonus,
    itemCoinBonus: equipmentBonuses.coinBonus,
    ...character.progression,
  };

  return {
    ...character,
    hp: currentHp,
    maxHp: totalStats.maxHp,
    equipmentBonuses,
    totalStats,
    // Legacy fields
    baseAttack: character.baseStats.attack,
    baseDefense: character.baseStats.defense,
    baseDodgeChance: character.baseStats.dodgeChance,
    baseCritChance: character.baseStats.critChance,
    stats: legacyStats,
  };
}

// Level up - increases base stats with fixed values
export function levelUpCharacter(character: Character): Character {
  const newLevel = character.level + 1;
  
  // Increase base stats with fixed values
  const newBaseStats = {
    attack: character.baseStats.attack + 0.5, // +0.5 attack per level
    defense: character.baseStats.defense + 0.5, // +0.5 defense per level
    maxHp: character.baseStats.maxHp + 5, // +5 HP per level
    dodgeChance: Math.min(character.baseStats.dodgeChance + 0.003, 0.35), // +0.3% per level
    critChance: Math.min(character.baseStats.critChance + 0.003, 0.40), // +0.3% per level
    critMultiplier: character.baseStats.critMultiplier, // stays at 1.5 (150%)
  };

  const updatedCharacter: Character = {
    ...character,
    level: newLevel,
    baseStats: newBaseStats,
    // Reset XP and set new max
    xp: 0,
    maxXp: calculateXpForLevel(newLevel),
  };

  // Recalculate total stats with new base stats
  return recalculatePlayerStats(updatedCharacter);
}

export interface Item {
  classRequirement?: HeroClass;
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: Rarity;
  icon: string;
  element?: ElementType;
  stats: {
    attack?: number;
    defense?: number;
    hpBonus?: number;
    xpBonus?: number;
    coinBonus?: number;
    critChance?: number;
    dodgeChance?: number;
  };
  durability: number;
  maxDurability: number;
  levelRequirement: number;
  upgradeLevel: number; // Current upgrade level (+0 to +10)
  gemSlot?: Gem | null; // Gem socket for this item
  // Item stat variation (for display)
  statVariation?: number; // Percentage variation from base (e.g., +15%, -10%)
}

// Generate item with random stat variation (10% to 20% variation)
export function generateItemWithVariation(baseItem: Item): Item {
  const variation = (Math.random() * 0.3) - 0.1; // -10% to +20%
  const variationPercent = Math.round(variation * 100);
  
  const variedStats = { ...baseItem.stats };
  
  // Apply variation to numeric stats
  if (variedStats.attack !== undefined) {
    variedStats.attack = Math.max(1, Math.round(variedStats.attack * (1 + variation)));
  }
  if (variedStats.defense !== undefined) {
    variedStats.defense = Math.max(0, Math.round(variedStats.defense * (1 + variation)));
  }
  if (variedStats.hpBonus !== undefined) {
    variedStats.hpBonus = Math.max(0, Math.round(variedStats.hpBonus * (1 + variation)));
  }
  if (variedStats.xpBonus !== undefined) {
    variedStats.xpBonus = Math.max(0, Math.round(variedStats.xpBonus * (1 + variation)));
  }
  if (variedStats.coinBonus !== undefined) {
    variedStats.coinBonus = Math.max(0, Math.round(variedStats.coinBonus * (1 + variation)));
  }
  if (variedStats.critChance !== undefined) {
    variedStats.critChance = Math.max(0, variedStats.critChance * (1 + variation));
  }
  if (variedStats.dodgeChance !== undefined) {
    variedStats.dodgeChance = Math.max(0, variedStats.dodgeChance * (1 + variation));
  }
  
  return {
    ...baseItem,
    stats: variedStats,
    statVariation: variationPercent,
  };
}

// Calculate effective item bonus with soft cap
export function calculateEffectiveBonus(
  baseBonus: number,
  currentTotal: number,
  balanceLimit: number
): number {
  // Soft cap formula: BonusReal = BonusBase × (1 - (AtributoAtual / LimiteBalanceamento))
  const reductionFactor = Math.max(0, 1 - (currentTotal / balanceLimit));
  return Math.max(0, Math.round(baseBonus * reductionFactor));
}

// Calculate total attack with 300% cap
export function calculateCappedAttack(baseAttack: number, itemBonus: number): number {
  const maxBonus = baseAttack * (MAX_DAMAGE_BONUS_PERCENT / 100);
  const effectiveBonus = Math.min(itemBonus, maxBonus);
  return Math.round(baseAttack + effectiveBonus);
}

// ============================================
// LOOTBOX SYSTEM
// ============================================

export interface Lootbox {
  id: string;
  name: string;
  rarity: Rarity;
  price: number;
  description: string;
  dropRates: {
    common: number;
    rare: number;
    epic: number;
    legendary: number;
    mythic: number;
  };
  icon: string;
  specialAttackChance: number;
}

export const LOOTBOX_TYPES: Lootbox[] = [
  {
    id: 'common-box',
    name: 'Caixa de Explorador',
    rarity: 'common',
    price: 1000,
    description: 'Contém itens básicos para aventuras.',
    dropRates: { common: 70, rare: 25, epic: 4, legendary: 0.9, mythic: 0.1 },
    icon: '📦',
    specialAttackChance: 5,
  },
  {
    id: 'rare-box',
    name: 'Baú do Guerreiro',
    rarity: 'rare',
    price: 6000,
    description: 'Itens de qualidade superior.',
    dropRates: { common: 30, rare: 50, epic: 15, legendary: 4, mythic: 1 },
    icon: '🎁',
    specialAttackChance: 10,
  },
  {
    id: 'epic-box',
    name: 'Cofre do Herói',
    rarity: 'epic',
    price: 22000,
    description: 'Equipamentos épicos aguardam!',
    dropRates: { common: 10, rare: 35, epic: 40, legendary: 12, mythic: 3 },
    icon: '🏆',
    specialAttackChance: 20,
  },
  {
    id: 'legendary-box',
    name: 'Relíquia Lendária',
    rarity: 'legendary',
    price: 95000,
    description: 'Poder lendário em suas mãos.',
    dropRates: { common: 0, rare: 15, epic: 40, legendary: 35, mythic: 10 },
    icon: '👑',
    specialAttackChance: 35,
  },
];

// ============================================
// QUEST SYSTEM - EXPANDED
// ============================================

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  difficulty: Difficulty;
  energyReward: number;
  checkpoints?: { id: string; title: string; completed: boolean }[];
  completed: boolean;
  createdAt: number;
  completedAt?: number;
  expiresAt?: number;
  scheduledDate?: string; // YYYY-MM-DD format
  scheduledTime?: string; // HH:mm format (optional)
  reminderEnabled?: boolean; // Send browser notification reminder
  isEmergency?: boolean;
  suggestedByMaster?: boolean;
  focusTag?: FocusTag;
  // For habit quests: days of week when habit appears
  habitDays?: DayOfWeek[];
  // For meta quests: progress tracking
  metaProgress?: {
    current: number;
    target: number;
  };
}

// Quest drop chances by difficulty (%)
export const QUEST_DROP_CHANCES: Record<Difficulty, number> = {
  easy: 2,
  medium: 3,
  hard: 4,
};

// Difficulty configuration with rewards and emojis
export const DIFFICULTY_CONFIG: Record<Difficulty, { 
  label: string; 
  emoji: string;
  xpMultiplier: number; 
  coinMultiplier: number; 
  hpMultiplier: number;
  color: string;
  bgColor: string;
  borderColor: string;
  dropChance: number;
}> = {
  easy: { 
    label: 'Fácil', 
    emoji: '🟢',
    xpMultiplier: 1, 
    coinMultiplier: 1, 
    hpMultiplier: 1,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500',
    dropChance: 2,
  },
  medium: { 
    label: 'Médio', 
    emoji: '🔵',
    xpMultiplier: 1.3, 
    coinMultiplier: 1.3, 
    hpMultiplier: 1.3,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500',
    dropChance: 3,
  },
  hard: { 
    label: 'Difícil', 
    emoji: '🟣',
    xpMultiplier: 1.6, 
    coinMultiplier: 1.6, 
    hpMultiplier: 1.6,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500',
    dropChance: 4,
  },
};

// ============================================
// CALENDAR SYSTEM
// ============================================

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  type: 'quest' | 'reminder' | 'deadline';
  questId?: string;
}

export interface WeeklyGoal {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  category: FocusTag;
  weekStart: string; // YYYY-MM-DD
  weekEnd: string; // YYYY-MM-DD
  completed: boolean;
  xpReward: number;
  coinReward: number;
  hpPenalty: number;
}

// Daily progress record for streak calculation
export interface DailyProgress {
  date: string; // YYYY-MM-DD
  completedTasks: number;
  streakCounted: boolean;
  extraEnergyGained: number; // New field to track daily limit (max 5)
}

export interface CalendarState {
  events: CalendarEvent[];
  weeklyGoals: WeeklyGoal[];
  dailyProgress: DailyProgress[]; // Track daily completion for streak
  lastDailyReset: string;
  lastWeeklyReset: string;
}

// Brazil timezone helpers
export function getBrazilDate(): Date {
  const now = new Date();
  // Brazil is UTC-3 - use explicit timezone conversion
  const brazilString = now.toLocaleString('en-US', { 
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  return new Date(brazilString);
}

export function getBrazilDateString(): string {
  const now = new Date();
  // Format directly to YYYY-MM-DD using Brazil timezone
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(now);
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;
  return `${year}-${month}-${day}`;
}

// Get Brazil date string from a specific date (for calendar)
export function getBrazilDateStringFromDate(date: Date): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;
  return `${year}-${month}-${day}`;
}

export function isNewDay(lastReset: string): boolean {
  const today = getBrazilDateString();
  return lastReset !== today;
}

export function isNewWeek(lastReset: string): boolean {
  const brazilDate = getBrazilDate();
  const currentWeekStart = getWeekStart(brazilDate);
  return lastReset !== currentWeekStart;
}

export function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  const weekStart = new Date(d.setDate(diff));
  return weekStart.toISOString().split('T')[0];
}

export function getWeekEnd(date: Date): string {
  const weekStart = new Date(getWeekStart(date));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  return weekEnd.toISOString().split('T')[0];
}

// ============================================
// PLAYER PROFILE SYSTEM (Discipline Master)
// ============================================

export interface PlayerProfile {
  dailyFreeHours: number;
  workSchedule: 'fulltime' | 'parttime' | 'student' | 'flexible' | 'unemployed';
  energyLevel: 'low' | 'medium' | 'high';
  mainGoal: string;
  biggestDifficulty: string;
  habitToBuild: string;
  habitToEliminate: string;
  preferredQuestTime: 'morning' | 'afternoon' | 'evening' | 'night';
  averageCompletionRate: number;
  consecutiveFailures: number;
  difficultyPreference: 'easier' | 'balanced' | 'challenging';
  autoAdjustEnabled: boolean;
  avatarUrl?: string;
  // Focus system
  activeFocusTag: FocusTag;
  focusHistory: {
    tag: FocusTag;
    startDate: string;
    endDate?: string;
  }[];
  // Memory system
  questHistory: {
    questType: string;
    completed: boolean;
    timestamp: number;
  }[];
  preferredQuestTypes: string[];
  difficultQuestTypes: string[];
  unlockedTitles?: string[];
  activeTitle?: string;
}

export const DEFAULT_PLAYER_PROFILE: PlayerProfile = {
  dailyFreeHours: 4,
  workSchedule: 'flexible',
  energyLevel: 'medium',
  mainGoal: '',
  biggestDifficulty: '',
  habitToBuild: '',
  habitToEliminate: '',
  preferredQuestTime: 'evening',
  averageCompletionRate: 0.5,
  consecutiveFailures: 0,
  difficultyPreference: 'balanced',
  autoAdjustEnabled: true,
  activeFocusTag: null,
  focusHistory: [],
  questHistory: [],
  preferredQuestTypes: [],
  difficultQuestTypes: [],
};

// ============================================
// DISCIPLINE MASTER CHAT SYSTEM
// ============================================

export interface ChatMessage {
  id: string;
  role: 'master' | 'player';
  content: string;
  timestamp: number;
  suggestedQuest?: Quest;
  actions?: { label: string; type: 'accept' | 'adjust' | 'reject' | 'generate' | 'intervention' }[];
  context?: {
    questTitle?: string;
    questDescription?: string;
    focusTag?: FocusTag;
  };
}

// ============================================
// CHARACTER SYSTEM
// ============================================

export interface Character {
  heroClass?: HeroClass;
  name: string;
  level: number;
  xp: number;
  maxXp: number;
  // Lobby HP - real character state
  hp: number;
  maxHp: number;
  // Energy system - limits gameplay
  energy: number;
  maxEnergy: number;
  energyFragments: number; // 0 to 5
  // Currency
  gold: number;
  totalGoldEarned: number;
  // Base stats - increased only by level up
  baseStats: {
    attack: number;
    defense: number;
    maxHp: number;
    dodgeChance: number; // percentage (0-1)
    critChance: number; // percentage (0-1)
    critMultiplier: number; // e.g., 1.5 for 150%
  };
  // Equipment bonuses - from items
  equipmentBonuses: {
    attack: number;
    defense: number;
    maxHp: number;
    dodgeChance: number;
    critChance: number;
    xpBonus: number;
    coinBonus: number;
  };
  // Total stats - base + equipment (calculated)
  totalStats: {
    attack: number;
    defense: number;
    maxHp: number;
    dodgeChance: number;
    critChance: number;
    critMultiplier: number;
  };
  // Legacy fields for backward compatibility
  baseAttack: number;
  baseDefense: number;
  baseDodgeChance: number;
  baseCritChance: number;
  equipped: {
    weapon?: Item;
    armor?: Item;
    helmet?: Item;
    boots?: Item;
    accessory?: Item;
    specialAttack?: SpecialAttack;
  };
  element?: ElementType;
  // Progression stats
  progression: {
    streak: number;
    maxStreak: number;
    daysSurvived: number;
    totalDeaths: number;
    bossesDefeated: number;
    totalXpEarned: number;
    totalCoinsEarned: number;
    totalGoldEarned: number;
    dungeonsAttempted: number;
    dungeonsWon: number;
    totalDamageDealt: number;
    totalDamageTaken: number;
    criticalHits: number;
    dodges: number;
  };
  // Legacy stats for backward compatibility
  stats: {
    totalAttack: number;
    totalDefense: number;
    totalDodgeChance: number;
    totalCritChance: number;
    itemHpBonus: number;
    itemXpBonus: number;
    itemCoinBonus: number;
    streak: number;
    maxStreak: number;
    daysSurvived: number;
    totalDeaths: number;
    bossesDefeated: number;
    totalXpEarned: number;
    totalCoinsEarned: number;
    dungeonsAttempted: number;
    dungeonsWon: number;
    totalDamageDealt: number;
    totalDamageTaken: number;
    criticalHits: number;
    dodges: number;
  };
}

// ============================================
// LEVEL UP SYSTEM
// ============================================

// Calculate XP needed for next level: 50 × level^1.6
// Progressão exponencial para ~6 meses de gameplay
// Level 1: 50, Level 2: 120, Level 5: 480, Level 10: 1400, Level 20: 4200
export function calculateXpForLevel(level: number): number {
  return Math.floor(50 * Math.pow(level, 1.6));
}

// Calculate cumulative XP needed to reach a certain level from level 1
export function calculateCumulativeXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += calculateXpForLevel(i);
  }
  return total;
}

// Get total accumulated XP from character state
export function getCharacterTotalXp(character: { level: number; xp: number }): number {
  return calculateCumulativeXpForLevel(character.level) + character.xp;
}

// Get level and remaining XP from a total amount of XP
export function getLevelFromTotalXp(totalXp: number): { level: number; xp: number; maxXp: number } {
  let level = 1;
  let remainingXp = totalXp;
  
  while (remainingXp >= calculateXpForLevel(level)) {
    remainingXp -= calculateXpForLevel(level);
    level++;
  }
  
  return {
    level,
    xp: remainingXp,
    maxXp: calculateXpForLevel(level)
  };
}

// Recalculate character stats based on a specific level
export function setCharacterToLevel(character: Character, targetLevel: number, currentXp: number): Character {
  // Start from base stats (Level 1)
  let baseStats = {
    attack: 6,
    defense: 1,
    maxHp: 100,
    dodgeChance: 0.03,
    critChance: 0.05,
    critMultiplier: 1.5,
  };

  // Apply level up bonuses for each level beyond 1
  for (let i = 1; i < targetLevel; i++) {
    baseStats.attack += 0.5;
    baseStats.defense += 0.5;
    baseStats.maxHp += 5;
    baseStats.dodgeChance = Math.min(baseStats.dodgeChance + 0.003, 0.35);
    baseStats.critChance = Math.min(baseStats.critChance + 0.003, 0.40);
  }

  const updated: Character = {
    ...character,
    level: targetLevel,
    xp: currentXp,
    maxXp: calculateXpForLevel(targetLevel),
    baseStats,
    hp: 999999, // Will be capped to totalStats.maxHp in recalculatePlayerStats
  };

  return recalculatePlayerStats(updated);
}

// Calculate stat increases on level up
export function calculateLevelUpStats(character: Character): Partial<Character> {
  const newLevel = character.level + 1;
  
  return {
    level: newLevel,
    maxHp: Math.floor(character.maxHp * 1.05), // +5% HP
    baseAttack: Math.floor(character.baseAttack * 1.03), // +3% Attack
    baseDefense: Math.floor(character.baseDefense * 1.03), // +3% Defense
    baseCritChance: Math.min(character.baseCritChance + 0.005, 0.5), // +0.5% Crit (max 50%)
  };
}

// ============================================
// DUNGEON & COMBAT SYSTEM
// ============================================

// ============================================
// ADAPTIVE BOSS SYSTEM
// ============================================

// Boss scaling factors
export const BOSS_SCALING = {
  // After 3 consecutive wins: +15% HP, +10% DPS, +5% dodge
  winStreakHpBonus: 0.15,
  winStreakDpsBonus: 0.10,
  winStreakDodgeBonus: 0.05,
  // After loss: -5% base difficulty
  lossDifficultyReduction: 0.05,
  // General scaling per consecutive win
  scalingPerWin: 0.05,
};

export interface Boss {
  id: string;
  name: string;
  title: string;
  hp: number;
  maxHp: number;
  level: number;
  floor: number;
  baseAttack: number;
  element: ElementType;
  image: string;
  isDefeated: boolean;
  // Boss intelligence (unlocked after first encounter)
  intelligence?: {
    encountered: boolean;
    encountersCount: number;
    estimatedDPS: number; // Damage per turn
    dodgeChance: number;
    difficultyRating: 'easy' | 'medium' | 'hard';
    dangerIndex: number; // (DPS × HP) / Player Power
    playerWins: number;
    playerLosses: number;
    // Adaptive scaling
    consecutiveWins: number;
    scalingMultiplier: number; // 1 + (consecutiveWins × 0.05)
  };
}

// Calculate adaptive boss stats based on player performance
export function calculateAdaptiveBossStats(
  baseHp: number,
  baseAttack: number,
  baseDodge: number,
  consecutiveWins: number
): { hp: number; attack: number; dodgeChance: number; scalingMultiplier: number } {
  const scalingMultiplier = 1 + (consecutiveWins * BOSS_SCALING.scalingPerWin);
  
  // Apply bonuses after 3 consecutive wins
  let hpMultiplier = 1;
  let attackMultiplier = 1;
  let dodgeMultiplier = 1;
  
  if (consecutiveWins >= 3) {
    const extraWins = consecutiveWins - 2;
    hpMultiplier = 1 + (BOSS_SCALING.winStreakHpBonus * extraWins);
    attackMultiplier = 1 + (BOSS_SCALING.winStreakDpsBonus * extraWins);
    dodgeMultiplier = 1 + (BOSS_SCALING.winStreakDodgeBonus * extraWins);
  }
  
  return {
    hp: Math.floor(baseHp * scalingMultiplier * hpMultiplier),
    attack: Math.floor(baseAttack * scalingMultiplier * attackMultiplier),
    dodgeChance: Math.min(0.25, baseDodge * scalingMultiplier * dodgeMultiplier),
    scalingMultiplier,
  };
}

export interface CombatState {
  encounterId?: string;
  playerHp: number; // Combat HP - starts at lobby HP
  bossHp: number;
  maxPlayerHp: number; // Same as lobby max HP
  maxBossHp: number;
  isActive: boolean;
  turn: number;
  lastAction?: 'player' | 'boss';
  specialCooldown: number;
  maxSpecialCooldown: number;
  logs: string[];
  playerBleedTurns?: number;
  playerPoisonTurns?: number;
  equippedSpecialAttack?: SpecialAttack;
  specialAttackCooldown: number;
  lastDamageDealt?: number; // For animation
  damageTakenInCurrentBattle: number; // Track total damage to calculate lobby penalty after fight
  playerAttackRemainder?: number; // For fractional damage accumulation
  playerDefenseRemainder?: number; // For fractional defense accumulation
  droppedItem?: Item | null;
  xpReward?: number;
  goldReward?: number;
  // Floor progression (legacy)
  showFloorComplete?: boolean;
  // Pet Combat State
  petAction?: {
    petId: PetId;
    type: 'attack' | 'ability';
    target: 'boss' | 'player';
    value?: number;
    icon: string;
  };
  nextPlayerAttackCrit?: boolean;
  nextPlayerHealMultiplier?: number;
  nextPlayerDodge?: boolean;
}

export interface CombatResult {
  playerWon: boolean;
  playerDamage: number;
  bossDamage: number;
  playerDodged: boolean;
  bossDodged: boolean;
  playerCrit: boolean;
  bossCrit: boolean;
  turns: number;
  hpLost: number;
}

// ============================================
// INVENTORY SYSTEM
// ============================================

export interface Inventory {
  items: Item[];
  gems: Gem[];
  specialAttacks: SpecialAttack[];
  lootboxes: { lootbox: Lootbox; quantity: number }[];
  maxSlots: number;
  consumables?: {
    protectionStones: number;
  };
}

// ============================================
// ECONOMY SYSTEM
// ============================================

export interface Economy {
  coins: number;
  shards: {
    common: number;
    rare: number;
    epic: number;
    legendary: number;
    mythic: number;
  };
  petShards?: number;
  totalCoinsEarned: number;
  totalCoinsSpent: number;
}

// ============================================
// SHOP SYSTEM
// ============================================

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: 'skin' | 'effect' | 'boost' | 'special';
  price: number;
  icon: string;
  owned: boolean;
  element?: ElementType;
}

// ============================================
// DEATH & HISTORY SYSTEM
// ============================================

export interface DeathRecord {
  id: string;
  date: number;
  daysSurvived: number;
  floorReached: number;
  bossesDefeated: number;
  totalXp: number;
  cause: string;
}

export interface RunHistory {
  deaths: DeathRecord[];
  bestRuns: {
    maxDays: number;
    maxFloor: number;
    maxBosses: number;
    maxCoins: number;
  };
}

// ============================================
// ============================================
// CHEST SYSTEM
// ============================================

export type ChestRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface DungeonChest {
  id: string;
  rarity: ChestRarity;
  status: 'locked' | 'unlocking' | 'unlocked';
  unlockStartedAt?: number; // timestamp
  unlockDuration: number; // in milliseconds
  pendingRewards?: DungeonEventReward[];
}

export const CHEST_UNLOCK_TIMES: Record<ChestRarity, number> = {
  common: 2 * 60 * 60 * 1000, // 2 hours
  rare: 8 * 60 * 60 * 1000, // 8 hours
  epic: 16 * 60 * 60 * 1000, // 16 hours
  legendary: 24 * 60 * 60 * 1000, // 24 hours
};

// ============================================
// DAILY MISSIONS
// ============================================

export type DailyMissionRarity = 'login' | 'common' | 'uncommon' | 'special';

export type DailyMissionKind =
  | 'login'
  | 'defeatEnemies'
  | 'openChests'
  | 'dealCrits'
  | 'completeTasks'
  | 'earnGold'
  | 'upgradeItem'
  | 'obtainItem'
  | 'findMerchant'
  | 'obtainRareItem'
  | 'completeTasksPercent'
  | 'upgradeToLevel'
  | 'dismantleItems'
  | 'findSanctuary'
  | 'openEpicChest'
  | 'obtainEpicItem'
  | 'findSpecialEvents';

export type DailyMissionRewardType = 'energy' | 'energyFragment';

export interface DailyMission {
  id: string;
  slot: 1 | 2 | 3 | 4;
  day: string; // YYYY-MM-DD (Brazil)
  rarity: DailyMissionRarity;
  kind: DailyMissionKind;
  title: string;
  target: number;
  progress: number;
  reward: {
    type: DailyMissionRewardType;
    amount: number;
  };
  params?: Record<string, any>;
  completed: boolean;
  claimed: boolean;
}

export interface DailyMissionsState {
  lastReset: string; // YYYY-MM-DD (Brazil)
  missions: DailyMission[];
}

// GAME STATE
// ============================================

export interface GameState {
  forgeNotice?: { title: string; kind: 'success' | 'error' };
  marketHistory?: { id: string; at: number; text: string }[];
  character: Character;
  selectedPetId: PetId | null;
  unlockedPets: PetId[];
  // Map system
  maps: Record<MapId, GameMap>;
  currentMapId: MapId | null;
  currentNodeId: string | null;
  totalBossesDefeated: number;
  // Legacy dungeon (kept for backward compatibility)
  dungeon: {
    currentFloor: number;
    maxFloorReached: number;
    currentBoss: Boss;
    bossesDefeated: number;
    entryCostPercent: number;
  };
  combat: CombatState | null;
  inventory: Inventory;
  economy: Economy;
  quests: {
    habito: Quest[];
    diaria: Quest[];
    meta: Quest[];
  };
  calendar: CalendarState;
  dailyMissions: DailyMissionsState;
  shop: ShopItem[];
  ownedLootboxes: { lootboxId: string; quantity: number }[];
  history: RunHistory;
  playerProfile: PlayerProfile;
  chatHistory: ChatMessage[];
  recoveryMode: boolean;
  lastLogin: number;
  createdAt: number; // Added to track real days survived
  gameStarted: boolean;
  showProfileSetup: boolean;
  isInitialScreen: boolean; // Added to handle start screen
  showLevelUp: boolean; // Flag to show level up UI
  showRestOverlay: boolean; // Flag to show rest overlay
  restDetails: {
    prevHp: number;
    newHp: number;
    healAmount: number;
  } | null;
  unlockedSkins: string[];
  achievements: string[];
  chests: (DungeonChest | null)[]; // 4 slots for chests
  dungeonEvent: DungeonEvent | null;
  sanctuaryBuff: ActiveSanctuaryBuff | null;
  lootOverlay: {
    title: string;
    rewards: DungeonEventReward[];
  } | null;
  settings: {
    infiniteEnergy: boolean;
    doubleTaskEnergyCap: boolean;
    autoQuestRewards: boolean;
  };
  // Debug logs
  debugLogs: string[];
}

// ============================================
// COMBAT CALCULATION HELPERS
// ============================================

export function calculateDamage(baseAttack: number, variance: number = 0.15): number {
  const minMultiplier = 1 - variance;
  const maxMultiplier = 1 + variance;
  const randomMultiplier = minMultiplier + Math.random() * (maxMultiplier - minMultiplier);
  return Math.max(1, Math.round(baseAttack * randomMultiplier));
}

export function attemptDodge(dodgeChance: number): boolean {
  return Math.random() < dodgeChance;
}

export function attemptCrit(critChance: number): boolean {
  return Math.random() < critChance;
}

export function getRarityFromDropTable(dropRates: Record<Rarity, number>): Rarity {
  const roll = Math.random() * 100;
  let cumulative = 0;
  
  const rarities: Rarity[] = ['mythic', 'legendary', 'epic', 'rare', 'common'];
  
  for (const rarity of rarities) {
    cumulative += dropRates[rarity];
    if (roll <= cumulative) return rarity;
  }
  
  return 'common';
}

// Calculate special attack damage with elemental multiplier
export function calculateSpecialAttackDamage(
  baseAttack: number, 
  specialAttack: SpecialAttack, 
  bossElement: ElementType
): number {
  const baseDamage = calculateDamage(baseAttack, 0.1);
  const rarityMultiplier = specialAttack.damageMultiplier;
  const elementalMultiplier = calculateElementMultiplier(specialAttack.element, bossElement);
  
  return Math.max(1, Math.round(baseDamage * rarityMultiplier * elementalMultiplier));
}

// ============================================
// BOSS INTELLIGENCE SYSTEM
// ============================================

// Calculate boss danger index and difficulty rating
export function calculateBossDifficulty(
  boss: Boss, 
  playerAttack: number, 
  playerDefense: number, 
  playerMaxHp: number
): { dangerIndex: number; difficultyRating: 'easy' | 'medium' | 'hard' } {
  const bossDPS = boss.baseAttack;
  const bossTotalPower = bossDPS * boss.maxHp;
  const playerPower = (playerAttack + playerDefense) * playerMaxHp;
  
  const dangerIndex = playerPower > 0 ? bossTotalPower / playerPower : 999;
  
  let difficultyRating: 'easy' | 'medium' | 'hard';
  if (dangerIndex < 0.5) {
    difficultyRating = 'easy';
  } else if (dangerIndex < 1.0) {
    difficultyRating = 'medium';
  } else {
    difficultyRating = 'hard';
  }
  
  return { dangerIndex, difficultyRating };
}

// Get difficulty emoji and color
export function getDifficultyDisplay(rating: 'easy' | 'medium' | 'hard'): { 
  emoji: string; 
  color: string; 
  bgColor: string;
  label: string;
} {
  switch (rating) {
    case 'easy':
      return { emoji: '🟢', color: 'text-green-400', bgColor: 'bg-green-500/20', label: 'Fácil' };
    case 'medium':
      return { emoji: '🟡', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', label: 'Médio' };
    case 'hard':
      return { emoji: '🔴', color: 'text-red-400', bgColor: 'bg-red-500/20', label: 'Difícil' };
  }
}
