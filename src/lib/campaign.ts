import type { Character, GameMap, GameState, Item, MapId, MapNode, MonsterSpawn, Rarity } from '../types/game';

export type HeroClass = 'mage' | 'ninja' | 'archer';
export const HERO_CLASSES = {
  mage: { name: 'Mago', icon: '🧙', weapon: 'Cajado', description: '+4% dano e +2% vida. Magia consistente.', damageMultiplier: 1.04, healthMultiplier: 1.02, crit: 0, dodge: 0 },
  ninja: { name: 'Ninja', icon: '🥷', weapon: 'Katana', description: '+8% crítico e +2% esquiva. Golpes precisos.', damageMultiplier: 1, healthMultiplier: 1, crit: 0.08, dodge: 0.02 },
  archer: { name: 'Arqueiro', icon: '🏹', weapon: 'Arco', description: '+2% dano, +4% crítico e +2% esquiva.', damageMultiplier: 1.02, healthMultiplier: 1, crit: 0.04, dodge: 0.02 },
} as const;
export function applyClassBonuses(heroClass: HeroClass | undefined, attack: number, hp: number) {
  const hero = heroClass ? HERO_CLASSES[heroClass] : undefined;
  return { attack: attack * (hero?.damageMultiplier || 1), maxHp: Math.round(hp * (hero?.healthMultiplier || 1)),
    crit: hero?.crit || 0, dodge: hero?.dodge || 0 };
}
export const DAILY_ROUTE_ENERGY = 8;
export const CAMPAIGN_VERSION = 3;
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
    stats: { attack: [3, 10, 22, 40, 65][t] }, levelRequirement: [1, 5, 12, 25, 40][t],
    durability: 100, maxDurability: 100, upgradeLevel: 0 };
}
export function canEquipClass(character: Pick<Character, 'heroClass'>, item: Item): boolean {
  return !item.classRequirement || item.classRequirement === character.heroClass;
}
export const submapEnergy = (mapId: MapId, area: number) => submapDays(mapId, area) * DAILY_ROUTE_ENERGY;
export function requiredStageWins(mapId: MapId, area: number, step: number): number {
  if (step === 4) return 1;
  const encounters = submapEnergy(mapId, area) - 1;
  return Math.floor(encounters / 4) + (step < encounters % 4 ? 1 : 0);
}
export function expandCampaignMap(base: GameMap): GameMap {
  const region = Number(base.id.slice(3)) - 1;
  const nodes: MapNode[] = [];
  for (let area = 0; area < 3; area++) {
    const submap = region * 3 + area;
    for (let step = 0; step < 5; step++) {
      const stage = area * 5 + step + 1;
      const isBoss = step === 4;
      const power = submap * 5 + step;
      const species = MOBS[region][step % 3];
      const rank = ['Batedor', 'Caçador', 'Veterano', 'Elite'][step] || 'Chefe';
      // Later encounter pools always start above the strongest earlier pool.
      const spawn: MonsterSpawn = {
        name: isBoss ? BOSSES[region][area] : `${species[0]} ${rank} · ${REGIONS[region][area]}`,
        image: isBoss ? ['🌳', '🦂', '❄️', '🐉', '👑'][region] : species[1],
        hp: 42 + power * 10 + submap * 10 + (isBoss ? 8 : 0),
        damageMin: 4 + power * 0.7 + submap * 0.25,
        damageMax: 6 + power * 0.7 + submap * 0.25,
        defense: 0.6 + power * 0.22,
        dodge: Math.min(8, 2 + submap * 0.3), critChance: isBoss ? 10 : 4,
        xp: 12 + power * 2 + (isBoss ? 15 : 0),
        goldMin: 9 + power * 2 + (isBoss ? 10 : 0), goldMax: 13 + power * 2 + (isBoss ? 15 : 0), chance: 65,
        drops: { common: [classWeapon((['mage', 'ninja', 'archer'] as const)[(area + step) % 3], 0, `template-${base.id}-${stage}`)] },
      };
      const dropClass = (['mage', 'ninja', 'archer'] as const)[(area + step) % 3];
      if (region >= 1) spawn.drops!.rare = [classWeapon(dropClass, 1, `rare-${base.id}-${stage}`)];
      if (region >= 2) spawn.drops!.epic = [classWeapon(dropClass, 2, `epic-${base.id}-${stage}`)];
      if (isBoss && region >= 3) spawn.drops!.legendary = [classWeapon(dropClass, 3, `legendary-${base.id}-${stage}`)];
      const alternate: MonsterSpawn = { ...spawn, name: `${species[0]} ${rank} Furioso · ${REGIONS[region][area]}`,
        hp: spawn.hp + 2, damageMin: spawn.damageMin + 0.1, damageMax: spawn.damageMax + 0.1, chance: 35 };
      nodes.push({ id: `${base.id}-stage${stage}`, stage, area, requiredWins: requiredStageWins(base.id, area, step), wins: 0,
        name: isBoss ? BOSSES[region][area] : `${rank} · ${REGIONS[region][area]}`, currentEnemy: null,
        possibleSpawns: isBoss ? [{ ...spawn, chance: 100 }] : [spawn, alternate],
        difficulty: isBoss ? 'boss' : step < 2 ? 'medium' : 'hard', isBoss, isUnlocked: stage === 1, isCompleted: false });
    }
  }
  return { ...base, nodes, campaignVersion: CAMPAIGN_VERSION, targetDays: SUBMAP_DAYS.slice(region * 3, region * 3 + 3).reduce((a, b) => a + b, 0) };
}
export function entryBlock(map: GameMap, node: MapNode): string | null {
  if (!map.isUnlocked || !node.isUnlocked) return 'Vença os encontros da etapa anterior para desbloquear.';
  return null;
}
export function routeProgress(map: GameMap, area: number) {
  const nodes = map.nodes.filter(n => n.area === area);
  return { completed: nodes.reduce((sum, n) => sum + Math.min(n.wins || 0, n.requiredWins || 1), 0),
    total: nodes.reduce((sum, n) => sum + (n.requiredWins || 1), 0) };
}
export function migrateCampaignMaps(saved: Record<MapId, GameMap> | undefined, fresh: Record<MapId, GameMap>): Record<MapId, GameMap> {
  for (const id of Object.keys(fresh) as MapId[]) {
    const old = saved?.[id];
    if (!old) continue;
    const wasCleared = old.nodes?.length > 0 && old.nodes.every(n => n.isCompleted);
    const nodes = fresh[id].nodes.map(node => {
      const prev = old.nodes?.find(n => n.id === node.id);
      const completed = Boolean(wasCleared || prev?.isCompleted);
      const wins = completed ? node.requiredWins! : Math.min(Math.max(0, Math.floor(prev?.wins || 0)), node.requiredWins!);
      return { ...node, wins, isCompleted: completed || wins === node.requiredWins, lastVictoryId: prev?.lastVictoryId };
    });
    fresh[id] = { ...fresh[id], isUnlocked: id === 'map1' || Boolean(old.isUnlocked),
      nodes: nodes.map((node, i) => ({ ...node, isUnlocked: i === 0 || node.isCompleted || nodes[i - 1]?.isCompleted })) };
  }
  return fresh;
}
export function finishCampaignNode(state: GameState, mapId: MapId, nodeId: string): GameState {
  const map = state.maps[mapId];
  const index = map.nodes.findIndex(n => n.id === nodeId);
  const node = map.nodes[index];
  const encounterId = state.combat?.encounterId;
  if (!node || node.isCompleted || entryBlock(map, node) || state.currentMapId !== mapId || state.currentNodeId !== nodeId || !encounterId || encounterId === node.lastVictoryId || !state.combat || state.combat.isActive || state.combat.bossHp > 0 || state.combat.playerHp <= 0) return state;
  const wins = Math.min(node.requiredWins || 1, (node.wins || 0) + 1);
  const completed = wins >= (node.requiredWins || 1);
  const nodes = map.nodes.map((n, i) => i === index ? { ...n, wins, isCompleted: completed, lastVictoryId: encounterId } : completed && i === index + 1 ? { ...n, isUnlocked: true } : n);
  const maps = { ...state.maps, [mapId]: { ...map, nodes } };
  const nextId = `map${Number(mapId.slice(3)) + 1}` as MapId;
  if (nodes.every(n => n.isCompleted) && maps[nextId]) maps[nextId] = { ...maps[nextId], isUnlocked: true };
  const baseLoot = node.isBoss && completed && state.character.heroClass ? classWeapon(state.character.heroClass, Math.min(4, Number(mapId.slice(3)) - 1)) : null;
  const loot = baseLoot ? { ...baseLoot, name: `${baseLoot.name} · ${node.name}`,
    description: `Troféu exclusivo obtido ao derrotar ${node.name}.`,
    stats: { ...baseLoot.stats, attack: (baseLoot.stats.attack || 0) + (node.area || 0) + 1 } } : null;
  return { ...state, maps, totalBossesDefeated: state.totalBossesDefeated + (node.isBoss && completed ? 1 : 0),
    inventory: loot ? { ...state.inventory, items: [...state.inventory.items, loot] } : state.inventory,
    lootOverlay: loot ? { title: 'Boss derrotado · Arma da sua classe', rewards: [{ type: 'item', item: loot }] } : state.lootOverlay };
}

export const MARKET_PRICES = [160, 1600, 12000, 75000, 350000];
export const ARMOR_PRICES = [130, 1300, 10000, 60000, 280000];
export const SELL_FEE = 2;
export const EXCHANGE_FEE = 25;
export const MARKET_BOSSES = [0, 1, 4, 8, 12];
export const exchangeFee = (item: Item) => Math.max(EXCHANGE_FEE, Math.floor(MARKET_PRICES[Math.max(0, TIERS.indexOf(item.rarity))] * 0.1));
export const campCost = (maxHp: number) => Math.max(8, Math.ceil(maxHp * 0.08));
export function restAtCamp(state: GameState): GameState {
  const cost = campCost(state.character.maxHp);
  if (state.combat?.isActive || state.character.hp <= 0 || state.character.hp >= state.character.maxHp || state.economy.coins < cost) return state;
  return { ...state, character: { ...state.character, hp: state.character.maxHp },
    economy: { ...state.economy, coins: state.economy.coins - cost, totalCoinsSpent: state.economy.totalCoinsSpent + cost },
    showRestOverlay: true, restDetails: { prevHp: state.character.hp, newHp: state.character.maxHp, healAmount: state.character.maxHp - state.character.hp } };
}
export function itemValue(item: Item): number {
  // Resale never exceeds 25% of the matching shop tier, even after upgrades.
  const tier = Math.max(0, TIERS.indexOf(item.rarity));
  return Math.floor((item.type === 'armor' ? ARMOR_PRICES[tier] : MARKET_PRICES[tier]) * 0.12);
}
export function marketCatalog(heroClass: HeroClass): { item: Item; price: number }[] {
  return [
    ...MARKET_PRICES.map((price, tier) => ({ item: classWeapon(heroClass, tier, `market-${heroClass}-${tier}`), price })),
    ...ARMOR_PRICES.map((price, tier) => ({ price, item: {
      id: `market-armor-${tier}`, name: ['Colete do Viajante', 'Armadura do Guardião', 'Couraça Glacial', 'Égide Vulcânica', 'Armadura Astral'][tier],
      type: 'armor' as const, rarity: TIERS[tier], icon: '🛡️', description: 'Proteção para qualquer classe.',
      stats: { defense: [2, 5, 9, 14, 22][tier], hpBonus: [12, 30, 60, 100, 160][tier] },
      levelRequirement: [1, 5, 12, 25, 40][tier], durability: 100, maxDurability: 100, upgradeLevel: 0,
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
    const requiredBosses = MARKET_BOSSES[action.tier % 5];
    if (state.totalBossesDefeated < requiredBosses) return `Requer ${requiredBosses} bosses únicos derrotados.`;
    if (state.character.level < offer.item.levelRequirement) return `Requer nível ${offer.item.levelRequirement}.`;
    return state.economy.coins < offer.price ? `Requer ${offer.price} de ouro.` : null;
  }
  const item = state.inventory.items.find(i => i.id === action.itemId);
  if (!item || Object.values(state.character.equipped).some(i => i?.id === item.id)) return 'Selecione um item desequipado.';
  if (action.type === 'exchange' && (item.type !== 'weapon' || !item.classRequirement || item.classRequirement === state.character.heroClass)) return 'Troque uma arma de outra classe.';
  if (item.gemSlot) return 'Remova a gema antes de negociar.';
  const fee = action.type === 'sell' ? SELL_FEE : exchangeFee(item);
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
      delta = -exchangeFee(item); spent = exchangeFee(item);
      message = `Trocou ${item.name} por arma de ${HERO_CLASSES[heroClass].name}: ${spent} ouro`;
    }
  }
  return { ...state, inventory: { ...state.inventory, items }, economy: { ...state.economy, coins: state.economy.coins + delta,
    totalCoinsSpent: state.economy.totalCoinsSpent + spent, totalCoinsEarned: state.economy.totalCoinsEarned + earned },
    marketHistory: [{ id: crypto.randomUUID(), at: Date.now(), text: message }, ...(state.marketHistory || [])].slice(0, 50) };
}
