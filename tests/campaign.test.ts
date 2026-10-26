import test from 'node:test';
import assert from 'node:assert/strict';
import { activeDays, canEquipClass, classWeapon, dayKey, entryBlock, expandCampaignMap, finishCampaignNode, marketCatalog, marketBlock, transactMarket, migrateCampaignMaps, submapDays } from '../src/lib/campaign.ts';
import type { GameMap, GameState, MapId } from '../src/types/game.ts';

const today = '2026-10-26';
function maps() {
  return Object.fromEntries(Array.from({ length: 5 }, (_, index) => {
    const id = `map${index + 1}` as MapId;
    return [id, expandCampaignMap({ id, name: '', description: '', theme: '', nodes: [], requiredLevel: 1, isUnlocked: index === 0 })];
  })) as Record<MapId, GameMap>;
}
function state(): GameState {
  return {
    maps: maps(), character: { heroClass: 'mage', level: 20, equipped: {}, hp: 100, maxHp: 100 },
    inventory: { items: [], gems: [], specialAttacks: [] }, economy: { coins: 2000, totalCoinsSpent: 0, totalCoinsEarned: 0 },
    totalBossesDefeated: 0, currentMapId: 'map1', currentNodeId: 'map1-stage1', lootOverlay: null,
    combat: { bossHp: 0, playerHp: 80, isActive: false },
  } as unknown as GameState;
}

test('five regions contain fifteen submaps, each with four encounters and its own boss', () => {
  const all = maps();
  for (const map of Object.values(all)) {
    assert.equal(map.nodes.length, 15);
    assert.equal(map.nodes.filter(n => n.isBoss).length, 3);
    for (let area = 0; area < 3; area++) {
      const nodes = map.nodes.filter(n => n.area === area);
      assert.equal(nodes.length, 5);
      assert.equal(nodes[4].requiredDays, submapDays(map.id, area));
      for (const n of nodes) assert.equal(n.possibleSpawns.reduce((sum, s) => sum + s.chance, 0), 100);
    }
  }
});
test('3, 5, 7, 10 and 14 days belong to successive SUBMAPS', () => {
  assert.deepEqual([submapDays('map1', 0), submapDays('map1', 1), submapDays('map1', 2), submapDays('map2', 0), submapDays('map2', 1)], [3, 5, 7, 10, 14]);
});
test('a class can only equip its own exclusive weapons; universal armor works', () => {
  for (const heroClass of ['mage', 'ninja', 'archer'] as const) {
    for (const other of ['mage', 'ninja', 'archer'] as const) assert.equal(canEquipClass({ heroClass }, classWeapon(other, 0)), heroClass === other);
    assert.equal(canEquipClass({ heroClass }, marketCatalog(heroClass)[5].item), true);
  }
});
test('the first boss needs three distinct days, not repeated entries on one day', () => {
  const map = maps().map1;
  const boss = { ...map.nodes[4], isUnlocked: true };
  map.areaActivityDays = { 0: [today, today, today] };
  assert.equal(activeDays(map, today, 0), 1);
  assert.match(entryBlock(map, boss, today)!, /3º dia/);
  map.areaActivityDays[0] = ['2026-10-22', '2026-10-24'];
  assert.equal(entryBlock(map, boss, today), null);
});
test('time in a previous submap never counts toward a new submap', () => {
  const map = maps().map1;
  map.areaActivityDays = { 0: ['2026-10-20', '2026-10-21', '2026-10-22'] };
  assert.equal(activeDays(map, today, 1), 0);
  map.nodes[5].isUnlocked = true;
  assert.equal(activeDays(map, today, 1), 1);
  const boss = { ...map.nodes[9], isUnlocked: true };
  assert.match(entryBlock(map, boss, today)!, /5º dia/);
});
test('calendar days use Sao Paulo across a UTC midnight', () => {
  assert.equal(dayKey(Date.parse('2026-10-26T01:00:00Z')), '2026-10-25');
});
test('locked regions and nodes cannot be entered even after waiting', () => {
  assert.match(entryBlock(maps().map2, { ...maps().map2.nodes[0], isUnlocked: true }, today)!, /anterior/);
  assert.match(entryBlock(maps().map1, maps().map1.nodes[4], today)!, /anterior/);
});
test('completion requires a real victory in the selected encounter', () => {
  const s = state();
  assert.equal(finishCampaignNode({ ...s, combat: null }, 'map1', 'map1-stage1', today).maps.map1.nodes[0].isCompleted, false);
  assert.equal(finishCampaignNode(s, 'map1', 'map1-stage2', today), s);
  const won = finishCampaignNode(s, 'map1', 'map1-stage1', today);
  assert.equal(won.maps.map1.nodes[0].isCompleted, true);
  assert.equal(won.maps.map1.nodes[1].isUnlocked, true);
  assert.equal(finishCampaignNode(won, 'map1', 'map1-stage1', today), won);
});
test('an early boss unlocks the next submap, never the next region, with one class reward', () => {
  const s = state();
  s.currentNodeId = 'map1-stage5';
  s.maps.map1.nodes[4].isUnlocked = true;
  s.maps.map1.areaActivityDays = { 0: ['2026-10-22', '2026-10-24'] };
  const won = finishCampaignNode(s, 'map1', 'map1-stage5', today);
  assert.equal(won.maps.map1.nodes[5].isUnlocked, true);
  assert.equal(won.maps.map2.isUnlocked, false);
  assert.equal(won.inventory.items[0].classRequirement, 'mage');
  assert.ok(won.inventory.items[0].stats.attack! > classWeapon('mage', 0).stats.attack!);
  assert.equal(won.totalBossesDefeated, 1);
  assert.equal(finishCampaignNode(won, 'map1', 'map1-stage5', today), won);
});
test('only all fifteen stages open the next region', () => {
  const s = state();
  s.currentNodeId = 'map1-stage15';
  s.maps.map1.nodes = s.maps.map1.nodes.map((n, i) => ({ ...n, isUnlocked: true, isCompleted: i < 14 }));
  s.maps.map1.areaActivityDays = { 2: ['2026-10-18', '2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23'] };
  assert.equal(finishCampaignNode(s, 'map1', 'map1-stage15', today).maps.map2.isUnlocked, true);
});
test('buy and sell round trip loses gold, preserves accounting and cannot sell twice', () => {
  const s = state();
  const bought = transactMarket(s, { type: 'buy', tier: 0 });
  assert.equal(bought.inventory.items.length, 1);
  assert.equal(bought.economy.coins, 1940);
  const action = { type: 'sell' as const, itemId: bought.inventory.items[0].id };
  const sold = transactMarket(bought, action);
  assert.equal(sold.economy.coins, 1953);
  assert.equal(sold.economy.totalCoinsSpent, 62);
  assert.equal(sold.economy.totalCoinsEarned, 15);
  assert.equal(sold.inventory.items.length, 0);
  assert.equal(transactMarket(sold, action), sold);
});
test('every offer loses value on resale, including upgraded items', () => {
  for (let tier = 0; tier < 10; tier++) {
    const s = state();
    const bought = transactMarket(s, { type: 'buy', tier });
    bought.inventory.items[0].upgradeLevel = 10;
    const sold = transactMarket(bought, { type: 'sell', itemId: bought.inventory.items[0].id });
    assert.ok(sold.economy.coins < s.economy.coins);
  }
});
test('insufficient gold, invalid offers, low levels and combat reject purchases', () => {
  const s = state();
  for (const tier of [-1, 10, NaN, 0.5]) assert.equal(transactMarket(s, { type: 'buy', tier }), s);
  s.economy.coins = 59;
  assert.equal(transactMarket(s, { type: 'buy', tier: 0 }), s);
  s.economy.coins = 2000; s.character.level = 1;
  assert.equal(transactMarket(s, { type: 'buy', tier: 4 }), s);
  s.combat!.isActive = true;
  assert.equal(transactMarket(s, { type: 'buy', tier: 0 }), s);
});
test('selling requires upfront gold and refuses equipped or socketed gear', () => {
  const s = state(); const item = classWeapon('mage', 0); s.inventory.items = [item];
  s.economy.coins = 1;
  assert.equal(transactMarket(s, { type: 'sell', itemId: item.id }), s);
  s.economy.coins = 10; s.character.equipped.weapon = item;
  assert.equal(transactMarket(s, { type: 'sell', itemId: item.id }), s);
  s.character.equipped = {}; item.gemSlot = { id: 'gem' } as never;
  assert.match(marketBlock(s, { type: 'sell', itemId: item.id })!, /gema/);
});
test('exchange consumes the source, charges gold, preserves rarity and yields own class', () => {
  const s = state(); const weapon = classWeapon('ninja', 2); weapon.upgradeLevel = 7; s.inventory.items = [weapon];
  s.economy.coins = 24;
  const action = { type: 'exchange' as const, itemId: weapon.id };
  assert.equal(transactMarket(s, action), s);
  s.economy.coins = 25;
  const exchanged = transactMarket(s, action);
  assert.equal(exchanged.economy.coins, 0);
  assert.equal(exchanged.inventory.items.length, 1);
  assert.equal(exchanged.inventory.items[0].classRequirement, 'mage');
  assert.equal(exchanged.inventory.items[0].rarity, 'epic');
  assert.equal(exchanged.inventory.items[0].upgradeLevel, 0);
  assert.equal(transactMarket(exchanged, action), exchanged);
});
test('migration preserves legacy clears and partially completed stages', () => {
  const old = maps();
  delete old.map1.campaignVersion;
  old.map1.nodes = old.map1.nodes.slice(0, 5).map(n => ({ ...n, isCompleted: true }));
  old.map2.isUnlocked = true;
  delete old.map2.campaignVersion;
  old.map2.nodes = old.map2.nodes.slice(0, 5);
  old.map2.nodes[0].isCompleted = true;
  const merged = migrateCampaignMaps(old, maps());
  assert.equal(merged.map1.nodes.filter(n => n.isCompleted).length, 15);
  assert.equal(merged.map2.isUnlocked, true);
  assert.equal(merged.map2.nodes[0].isCompleted, true);
  assert.equal(merged.map2.nodes[1].isUnlocked, true);
});
test('new campaign reload preserves each submap day counter', () => {
  const saved = maps(); saved.map1.areaActivityDays = { 0: ['2026-10-20'], 1: ['2026-10-25'] };
  const merged = migrateCampaignMaps(saved, maps());
  assert.deepEqual(merged.map1.areaActivityDays, saved.map1.areaActivityDays);
});
test('all seventy-five stages can be completed sequentially without a progression dead end', () => {
  let s = state();
  for (const id of Object.keys(s.maps) as MapId[]) {
    assert.equal(s.maps[id].isUnlocked, true);
    for (const node of s.maps[id].nodes) {
      s.currentMapId = id; s.currentNodeId = node.id;
      const area = node.area || 0;
      s.maps[id].areaActivityDays = { ...s.maps[id].areaActivityDays,
        [area]: Array.from({ length: submapDays(id, area) }, (_, i) => `day-${i}`) };
      const next = finishCampaignNode(s, id, node.id, today);
      assert.notEqual(next, s);
      s = next;
    }
  }
  assert.equal(s.totalBossesDefeated, 15);
  assert.equal(s.inventory.items.length, 15);
  assert.equal(Object.values(s.maps).flatMap(m => m.nodes).filter(n => n.isCompleted).length, 75);
});
