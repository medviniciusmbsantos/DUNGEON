import type { GameState, Item } from '../types/game';

const GOLD = [0, 30, 60, 100, 160, 240, 360, 520, 720, 950, 1200];
const MULTIPLIER = { common: 1, rare: 4, epic: 12, legendary: 50, mythic: 200 };
const CHANCE = [100, 95, 90, 85, 80, 70, 60, 50, 40, 30];
export function forgeCost(item: Item) {
  const level = Math.min(10, item.upgradeLevel + 1);
  return { gold: GOLD[level] * MULTIPLIER[item.rarity], shards: Math.ceil(level / 3), chance: CHANCE[item.upgradeLevel] || 0 };
}
export const dismantleYield = (item: Item) => 1 + Math.floor(item.upgradeLevel / 3);
export function dismantleBlock(state: GameState, itemId: string): string | null {
  if (state.combat?.isActive) return 'Finalize o combate antes de desmantelar.';
  if (Object.values(state.character.equipped).some(i => i?.id === itemId)) return 'Desequipe este item antes de desmantelar.';
  return state.inventory.items.some(i => i.id === itemId) ? null : 'Item não encontrado no inventário.';
}
export function dismantleEquipment(state: GameState, itemId: string): GameState {
  if (dismantleBlock(state, itemId)) return state;
  const item = state.inventory.items.find(i => i.id === itemId)!;
  const amount = dismantleYield(item);
  return { ...state, inventory: { ...state.inventory,
    items: state.inventory.items.filter(i => i.id !== itemId),
    gems: item.gemSlot ? [...state.inventory.gems, item.gemSlot] : state.inventory.gems },
    economy: { ...state.economy, shards: { ...state.economy.shards, [item.rarity]: (state.economy.shards?.[item.rarity] || 0) + amount } },
    forgeNotice: { kind: 'success', title: `${item.name} desmantelado: +${amount} cristal(is) ${item.rarity}${item.gemSlot ? '. Gema devolvida ao inventário.' : '.'}` } };
}
export function refinementBlock(state: GameState, item: Item): string | null {
  if (state.combat?.isActive) return 'Finalize o combate antes de refinar.';
  if (item.upgradeLevel >= 10) return 'Este item já está no nível máximo (+10).';
  const cost = forgeCost(item);
  if (state.economy.coins < cost.gold) return `Ouro insuficiente: requer ${cost.gold}.`;
  if ((state.economy.shards?.[item.rarity] || 0) < cost.shards) return `Requer ${cost.shards} cristal(is) ${item.rarity}.`;
  return null;
}
export function refineEquipment(state: GameState, itemId: string, roll: number): GameState {
  const inventoryItem = state.inventory.items.find(i => i.id === itemId);
  const slots = ['weapon', 'armor', 'helmet', 'boots', 'accessory'] as const;
  const slot = slots.find(s => state.character.equipped[s]?.id === itemId);
  const item = inventoryItem || (slot ? state.character.equipped[slot] : undefined);
  if (!item) return state;
  const blocked = refinementBlock(state, item);
  if (blocked) return { ...state, forgeNotice: { kind: 'error', title: blocked } };
  const cost = forgeCost(item);
  const success = roll * 100 < cost.chance;
  // Protection preserves crystals on a failed attempt; gear is never destroyed.
  const protectedAttempt = !success && (state.inventory.consumables?.protectionStones || 0) > 0;
  const updated = { ...item, upgradeLevel: item.upgradeLevel + (success ? 1 : 0) };
  return { ...state,
    character: { ...state.character, equipped: slot ? { ...state.character.equipped, [slot]: updated } : state.character.equipped },
    inventory: { ...state.inventory, items: inventoryItem ? state.inventory.items.map(i => i.id === itemId ? updated : i) : state.inventory.items, consumables: { ...state.inventory.consumables, protectionStones: Math.max(0, (state.inventory.consumables?.protectionStones || 0) - (protectedAttempt ? 1 : 0)) } },
    economy: { ...state.economy, coins: state.economy.coins - cost.gold, totalCoinsSpent: state.economy.totalCoinsSpent + cost.gold,
      shards: { ...state.economy.shards, [item.rarity]: (state.economy.shards?.[item.rarity] || 0) - (protectedAttempt ? 0 : cost.shards) } },
    forgeNotice: { kind: success ? 'success' : 'error', title: success ? `${item.name} refinado para +${updated.upgradeLevel}.` : protectedAttempt ? 'A melhoria falhou. Uma Pedra de Proteção preservou os cristais; o ouro foi consumido.' : 'A melhoria falhou. O item foi preservado; ouro e cristais foram consumidos.' } };
}
