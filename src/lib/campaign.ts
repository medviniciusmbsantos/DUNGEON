import type { Character, GameMap, GameState, Item, MapId, MapNode, MonsterSpawn, Rarity } from '../types/game';

export type HeroClass = 'mage' | 'ninja' | 'archer';
export const HERO_CLASSES = {
  mage: { name: 'Mago', icon: '🧙', weapon: 'Cajado', description: 'Magia poderosa: +2 ataque e +15 de vida.', attack: 2, hp: 15, crit: 0, dodge: 0 },
  ninja: { name: 'Ninja', icon: '🥷', weapon: 'Katana', description: 'Golpes precisos: +6% crítico e +4% esquiva.', attack: 0, hp: 0, crit: 0.06, dodge: 0.04 },
  archer: { name: 'Arqueiro', icon: '🏹', weapon: 'Arco', description: 'Caçador ágil: +1 ataque e +6% esquiva.', attack: 1, hp: 0, crit: 0, dodge: 0.06 },
} as const;
export const SUBMAP_DAYS = [3, 5, 7, 10, 14, 18, 21, 25, 28, 32, 35, 39, 42, 46, 49];
export const submapDays = (mapId: MapId, area: number) => SUBMAP_DAYS[(Number(mapId.slice(3)) - 1) * 3 + area];
export const REGIONS = [
  ['Trilha dos Sussurros', 'Ruínas Enraizadas', 'Coração da Floresta'],
  ['Dunas Errantes', 'Necrópole Solar', 'Templo das Cinzas'],
  ['Passagem da Geada', 'Cavernas de Cristal', 'Cidadela do Inverno'],
  ['Campos de Obsidiana', 'Forja Esquecida', 'Cratera do Despertar'],
  ['Margem do Vazio', 'Labirinto dos Ecos', 'Trono do Abismo'],
];
const BOSSES = [
  ['Matriarca dos Espinhos', 'Guardião das Raízes', 'Rei da Floresta Sombria'],
  ['Escorpião Imperial', 'Faraó das Areias', 'Fênix de Cinzas'],
  ['Yeti Ancestral', 'Serpente Glacial', 'Rainha do Inverno'],
  ['Colosso de Obsidiana', 'Mestre da Forja', 'Dragão da Caldeira'],
  ['Sentinela do Vazio', 'Tecelã de Pesadelos', 'Soberano do Abismo'],
];
const MOBS = [
  [['Broto Corrompido', '🌱'], ['Aranha da Névoa', '🕷️'], ['Lobo das Sombras', '🐺']],
  [['Escaravelho de Bronze', '🪲'], ['Cobra das Dunas', '🐍'], ['Múmia Errante', '🧟']],
  [['Lobo da Neve', '🐺'], ['Morcego de Gelo', '🦇'], ['Golem de Cristal', '🧊']],
  [['Salamandra de Lava', '🦎'], ['Gárgula de Obsidiana', '🗿'], ['Elemental de Magma', '🔥']],
  [['Espectro Faminto', '👻'], ['Olho do Vazio', '👁️'], ['Cavaleiro Esquecido', '💀']],
];
const TIERS: Rarity[] = ['common', 'rare', 'epic', 'legendary', 'mythic'];
const WEAPON_NAMES = {
  mage: ['Cajado Aprendiz', 'Cajado das Raízes', 'Cetro Glacial', 'Cajado da Fênix', 'Orbe do Infinito'],
  ninja: ['Katana de Treino', 'Lâmina do Crepúsculo', 'Katana da Geada', 'Lâmina Vulcânica', 'Garras do Vazio'],
  archer: ['Arco de Freixo', 'Arco do Guardião', 'Arco de Cristal', 'Arco das Brasas', 'Arco das Estrelas'],
};
export const dayKey = (now = Date.now()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
export function classWeapon(heroClass: HeroClass, tier: number, id: string = crypto.randomUUID()): Item {
  const t = Math.max(0, Math.min(4, Math.floor(tier)));
  return { id, name: WEAPON_NAMES[heroClass][t], type: 'weapon', rarity: TIERS[t], icon: HERO_CLASSES[heroClass].icon,
    classRequirement: heroClass, description: `Arma exclusiva de ${HERO_CLASSES[heroClass].name}.`,
    stats: { attack: [3, 7, 12, 18, 25][t] }, levelRequirement: [1, 3, 5, 8, 12][t],
    durability: 100, maxDurability: 100, upgradeLevel: 0 };
}
export function canEquipClass(character: Pick<Character, 'heroClass'>, item: Item): boolean {
  return !item.classRequirement || item.classRequirement === character.heroClass;
}
export function expandCampaignMap(base: GameMap): GameMap {
  const region = Number(base.id.slice(3)) - 1;
  const nodes: MapNode[] = [];
  for (let area = 0; area < 3; area++) {
    for (let step = 0; step < 5; step++) {
      const stage = area * 5 + step + 1;
      const isBoss = step === 4;
      // Difficulty grows within the region, independently of the player's current gear.
      const power = region * 3 + area;
      const attack = 3 + power * 1.8 + step * 0.4;
      const mob = MOBS[region][(area + step) % 3];
      const spawn: MonsterSpawn = {
        name: isBoss ? BOSSES[region][area] : mob[0], image: isBoss ? ['🌳', '🦂', '❄️', '🐉', '👑'][region] : mob[1],
        hp: Math.round((isBoss ? 75 : 24) + power * (isBoss ? 16 : 7) + step * 3),
        damageMin: Math.round(attack), damageMax: Math.round(attack + 2), defense: 1 + Math.floor(power / 2),
        dodge: isBoss ? 5 : 2, critChance: isBoss ? 6 : 3,
        xp: Math.round((isBoss ? 35 : 10) + power * 5),
        goldMin: (isBoss ? 24 : 6) + power * 3, goldMax: (isBoss ? 34 : 10) + power * 3, chance: 65,
        drops: { common: [classWeapon((['mage', 'ninja', 'archer'] as const)[(area + step) % 3], Math.min(region, 1), `template-${base.id}-${stage}`)] },
      };
      const alternate: MonsterSpawn = { ...spawn, name: MOBS[region][(area + step + 1) % 3][0], image: MOBS[region][(area + step + 1) % 3][1], hp: Math.round(spawn.hp * 0.85), damageMin: Math.max(1, spawn.damageMin - 1), chance: 35 };
      nodes.push({ id: `${base.id}-stage${stage}`, stage, area, requiredDays: isBoss ? submapDays(base.id, area) : 1,
        name: isBoss ? BOSSES[region][area] : `${REGIONS[region][area]} · ${step + 1}`, currentEnemy: null,
        possibleSpawns: isBoss ? [{ ...spawn, chance: 100 }] : [spawn, alternate],
        difficulty: isBoss ? 'boss' : step < 2 ? 'easy' : 'medium', isBoss, isUnlocked: stage === 1, isCompleted: false });
    }
  }
  return { ...base, nodes, campaignVersion: 2, activityDays: [], areaActivityDays: {}, targetDays: SUBMAP_DAYS.slice(region * 3, region * 3 + 3).reduce((a, b) => a + b, 0) };
}
export function activeDays(map: GameMap, today = dayKey(), area = 0): number {
  const days = map.areaActivityDays?.[area] || [];
  const unlocked = map.isUnlocked && map.nodes.some(n => (n.area || 0) === area && n.isUnlocked);
  return new Set([...days, ...(unlocked ? [today] : [])]).size;
}
export function entryBlock(map: GameMap, node: MapNode, today = dayKey()): string | null {
  if (!map.isUnlocked || !node.isUnlocked) return 'Conclua a etapa anterior para desbloquear.';
  if (!node.isCompleted && activeDays(map, today, node.area || 0) < (node.requiredDays || 1)) return `Boss disponível no ${node.requiredDays}º dia de exploração (${activeDays(map, today, node.area || 0)} dias registrados).`;
  return null;
}
export function migrateCampaignMaps(saved: Record<MapId, GameMap> | undefined, fresh: Record<MapId, GameMap>): Record<MapId, GameMap> {
  for (const id of Object.keys(fresh) as MapId[]) {
    const old = saved?.[id];
    if (!old) continue;
    const legacy = old.campaignVersion !== 2;
    const wasCleared = legacy && old.nodes?.every(n => n.isCompleted);
    fresh[id] = { ...fresh[id], isUnlocked: id === 'map1' || old.isUnlocked, activityDays: old.activityDays || [], areaActivityDays: old.areaActivityDays || {},
      nodes: fresh[id].nodes.map((node, i) => {
        const prev = old.nodes?.find(n => n.id === node.id);
        const completed = Boolean(wasCleared || prev?.isCompleted);
        return { ...node, isCompleted: completed, isUnlocked: completed || i === 0 || Boolean(prev?.isUnlocked) || Boolean(old.nodes?.[i - 1]?.isCompleted) };
      }) };
  }
  return fresh;
}
export function finishCampaignNode(state: GameState, mapId: MapId, nodeId: string, today = dayKey()): GameState {
  const map = state.maps[mapId];
  const index = map.nodes.findIndex(n => n.id === nodeId);
  const node = map.nodes[index];
  // Only a real victory in this encounter can advance the campaign.
  if (!node || node.isCompleted || entryBlock(map, node, today) || state.currentMapId !== mapId || state.currentNodeId !== nodeId || !state.combat || state.combat.bossHp > 0 || state.combat.playerHp <= 0) return state;
  const nodes = map.nodes.map((n, i) => i === index ? { ...n, isCompleted: true } : i === index + 1 ? { ...n, isUnlocked: true } : n);
  const maps = { ...state.maps, [mapId]: { ...map, nodes, areaActivityDays: { ...map.areaActivityDays, [node.area || 0]: [...new Set([...(map.areaActivityDays?.[node.area || 0] || []), today])] } } };
  const nextId = `map${Number(mapId.slice(3)) + 1}` as MapId;
  if (nodes.every(n => n.isCompleted) && maps[nextId]) maps[nextId] = { ...maps[nextId], isUnlocked: true };
  // First-clear class loot makes each boss meaningful; replays cannot duplicate it.
  const baseLoot = node.isBoss && state.character.heroClass ? classWeapon(state.character.heroClass, Math.min(4, Number(mapId.slice(3)) - 1)) : null;
  const loot = baseLoot ? { ...baseLoot, name: `${baseLoot.name} · ${node.name}`,
    description: `Troféu exclusivo obtido ao derrotar ${node.name}.`,
    stats: { ...baseLoot.stats, attack: (baseLoot.stats.attack || 0) + (node.area || 0) + 1 } } : null;
  return { ...state, maps, totalBossesDefeated: state.totalBossesDefeated + (node.isBoss ? 1 : 0),
    inventory: loot ? { ...state.inventory, items: [...state.inventory.items, loot] } : state.inventory,
    lootOverlay: loot ? { title: 'Boss derrotado · Arma da sua classe', rewards: [{ type: 'item', item: loot }] } : state.lootOverlay };
}

export const MARKET_PRICES = [60, 180, 420, 900, 1800];
export const ARMOR_PRICES = [45, 140, 320, 700, 1400];
export const SELL_FEE = 2;
export const EXCHANGE_FEE = 25;
export function itemValue(item: Item): number {
  // Resale never exceeds 25% of the matching shop tier, even after upgrades.
  const tier = Math.max(0, TIERS.indexOf(item.rarity));
  return Math.floor((item.type === 'armor' ? ARMOR_PRICES[tier] : MARKET_PRICES[tier]) * 0.25);
}
export function marketCatalog(heroClass: HeroClass): { item: Item; price: number }[] {
  return [
    ...MARKET_PRICES.map((price, tier) => ({ item: classWeapon(heroClass, tier, `market-${heroClass}-${tier}`), price })),
    ...ARMOR_PRICES.map((price, tier) => ({ price, item: {
      id: `market-armor-${tier}`, name: ['Colete do Viajante', 'Armadura do Guardião', 'Couraça Glacial', 'Égide Vulcânica', 'Armadura Astral'][tier],
      type: 'armor' as const, rarity: TIERS[tier], icon: '🛡️', description: 'Proteção para qualquer classe.',
      stats: { defense: [3, 6, 10, 15, 22][tier], hpBonus: [12, 25, 45, 70, 100][tier] },
      levelRequirement: [1, 3, 5, 8, 12][tier], durability: 100, maxDurability: 100, upgradeLevel: 0,
    } })),
  ];
}
export type MarketAction = { type: 'buy'; tier: number } | { type: 'sell'; itemId: string } | { type: 'exchange'; itemId: string };
export function marketBlock(state: GameState, action: MarketAction): string | null {
  if (!state.character.heroClass) return 'Escolha sua classe antes de negociar.';
  if (state.combat?.isActive) return 'Finalize o combate antes de negociar.';
  if (action.type === 'buy') {
    const offer = marketCatalog(state.character.heroClass)[action.tier];
    if (!offer) return 'Oferta inválida.';
    if (state.character.level < offer.item.levelRequirement) return `Requer nível ${offer.item.levelRequirement}.`;
    return state.economy.coins < offer.price ? `Requer ${offer.price} de ouro.` : null;
  }
  const item = state.inventory.items.find(i => i.id === action.itemId);
  if (!item || Object.values(state.character.equipped).some(i => i?.id === item.id)) return 'Selecione um item desequipado.';
  if (action.type === 'exchange' && (item.type !== 'weapon' || !item.classRequirement || item.classRequirement === state.character.heroClass)) return 'Troque uma arma de outra classe.';
  if (item.gemSlot) return 'Remova a gema antes de negociar.';
  const fee = action.type === 'sell' ? SELL_FEE : EXCHANGE_FEE;
  return state.economy.coins < fee ? `Requer ${fee} de ouro para a taxa.` : null;
}
export function transactMarket(state: GameState, action: MarketAction): GameState {
  if (marketBlock(state, action)) return state;
  const heroClass = state.character.heroClass!;
  let items = [...state.inventory.items];
  let delta = 0;
  let spent = 0;
  let earned = 0;
  let message = '';
  if (action.type === 'buy') {
    const offer = marketCatalog(heroClass)[action.tier];
    items.push({ ...offer.item, id: crypto.randomUUID() });
    delta = -offer.price; spent = offer.price; message = `Comprou ${offer.item.name} por ${spent} ouro`;
  } else {
    const item = items.find(i => i.id === action.itemId)!;
    items = items.filter(i => i.id !== item.id);
    if (action.type === 'sell') {
      earned = itemValue(item); spent = SELL_FEE; delta = earned - spent;
      message = `Vendeu ${item.name}: +${earned} ouro, taxa ${spent}`;
    } else {
      const tier = Math.max(0, TIERS.indexOf(item.rarity));
      items.push(classWeapon(heroClass, tier));
      delta = -EXCHANGE_FEE; spent = EXCHANGE_FEE;
      message = `Trocou ${item.name} por arma de ${HERO_CLASSES[heroClass].name}: ${spent} ouro`;
    }
  }
  return { ...state, inventory: { ...state.inventory, items }, economy: { ...state.economy, coins: state.economy.coins + delta,
    totalCoinsSpent: state.economy.totalCoinsSpent + spent, totalCoinsEarned: state.economy.totalCoinsEarned + earned },
    marketHistory: [{ id: crypto.randomUUID(), at: Date.now(), text: message }, ...(state.marketHistory || [])].slice(0, 50) };
}
