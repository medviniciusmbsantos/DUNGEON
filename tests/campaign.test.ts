import test from 'node:test';
import assert from 'node:assert/strict';
import { applyClassBonuses, canEquipClass, classWeapon, entryBlock, expandCampaignMap, finishCampaignNode, marketCatalog, marketBlock, transactMarket, migrateCampaignMaps, submapDays, submapEnergy, submapCombatCount, routeProgress, restAtCamp, MARKET_PRICES, ARMOR_PRICES, exchangeFee } from '../src/lib/campaign.ts';
import { dismantleBlock, dismantleEquipment, dismantleYield, forgeCost, refineEquipment } from '../src/lib/forge.ts';
import type { GameMap, GameState, MapId } from '../src/types/game.ts';

function maps() {
  return Object.fromEntries(Array.from({ length: 5 }, (_, index) => {
    const id = `map${index + 1}` as MapId;
    return [id, expandCampaignMap({ id, name: '', description: '', theme: '', nodes: [], requiredLevel: 1, isUnlocked: index === 0 })];
  })) as Record<MapId, GameMap>;
}
function state(): GameState {
  return {
    maps: maps(), character: { heroClass: 'mage', level: 50, equipped: {}, hp: 100, maxHp: 100, energy: 8, maxEnergy: 10 },
    inventory: { items: [], gems: [], specialAttacks: [], consumables: { protectionStones: 0 } },
    economy: { coins: 1000000, totalCoinsSpent: 0, totalCoinsEarned: 0, shards: { common: 20, rare: 20, epic: 20, legendary: 20, mythic: 20 } },
    totalBossesDefeated: 15, currentMapId: 'map1', currentNodeId: 'map1-stage1', lootOverlay: null,
    combat: { encounterId: 'encounter-1', bossHp: 0, playerHp: 80, isActive: false },
  } as unknown as GameState;
}
function win(s: GameState, mapId: MapId, nodeId: string, id = crypto.randomUUID()): GameState {
  return finishCampaignNode({ ...s, currentMapId: mapId, currentNodeId: nodeId, combat: { ...s.combat!, encounterId: id, bossHp: 0, playerHp: 80, isActive: false } }, mapId, nodeId);
}

test('successive submaps need 24, 40, 56, 80, 112 energy at eight daily', () => {
  assert.deepEqual([submapDays('map1',0),submapDays('map1',1),submapDays('map1',2)], [3,5,7]);
  assert.deepEqual([submapEnergy('map1',0),submapEnergy('map1',1),submapEnergy('map1',2),submapEnergy('map2',0),submapEnergy('map2',1)], [24,40,56,80,112]);
  for (const m of Object.values(maps())) for (let area=0;area<3;area++) assert.equal(routeProgress(m,area).total,submapCombatCount(m.id,area));
});
test('the route reserves energy for original rest/events and reaches its boss without a date gate', () => {
  let s=state();s.totalBossesDefeated=0;
  let spent=0;
  for (const node of s.maps.map1.nodes.slice(0,4)) {
    for(let i=0;i<node.requiredWins!;i++) {
      assert.equal(entryBlock(s.maps.map1,s.maps.map1.nodes.find(n=>n.id===node.id)!),null);
      s=win(s,'map1',node.id);spent++;
    }
  }
  assert.equal(spent,15);assert.equal(s.maps.map1.nodes[4].isUnlocked,true);
  assert.equal(entryBlock(s.maps.map1,s.maps.map1.nodes[4]),null);
  s=win(s,'map1',s.maps.map1.nodes[4].id);spent++;
  assert.equal(spent,16);assert.equal(routeProgress(s.maps.map1,0).completed,16);
  assert.equal(s.maps.map1.nodes[5].isUnlocked,true);assert.equal(s.maps.map2.isUnlocked,false);
});
test('partial stage progress persists and unlocks only after the required wins', () => {
  let s=state();s=win(s,'map1','map1-stage1');
  assert.equal(s.maps.map1.nodes[0].wins,1);assert.equal(s.maps.map1.nodes[0].isCompleted,false);
  assert.equal(s.maps.map1.nodes[1].isUnlocked,false);
  const loaded=migrateCampaignMaps(JSON.parse(JSON.stringify(s.maps)),maps());
  assert.equal(loaded.map1.nodes[0].wins,1);assert.equal(loaded.map1.nodes[1].isUnlocked,false);
  s={...s,maps:loaded};for(let i=1;i<4;i++)s=win(s,'map1','map1-stage1');
  assert.equal(s.maps.map1.nodes[0].isCompleted,true);assert.equal(s.maps.map1.nodes[1].isUnlocked,true);
});
test('one combat cannot be claimed twice, including in a partial stage', () => {
  const s=win(state(),'map1','map1-stage1','unique');
  assert.equal(finishCampaignNode(s,'map1','map1-stage1'),s);
  assert.equal(s.maps.map1.nodes[0].wins,1);
});
test('a loss, active combat, unknown encounter or wrong stage cannot advance', () => {
  const s=state();
  for(const combat of [null,{...s.combat!,bossHp:1},{...s.combat!,playerHp:0},{...s.combat!,isActive:true},{...s.combat!,encounterId:undefined}]) {
    const blocked={...s,combat};assert.equal(finishCampaignNode(blocked,'map1','map1-stage1'),blocked);
  }
  assert.equal(finishCampaignNode(s,'map1','map1-stage2'),s);
});
test('a completed stage replay cannot mint first-clear rewards', () => {
  let s=state();s.maps.map1.nodes[4]={...s.maps.map1.nodes[4],isUnlocked:true};
  s=win(s,'map1','map1-stage5');const count=s.inventory.items.length;
  assert.equal(count,1);const repeated=win(s,'map1','map1-stage5');assert.equal(repeated.inventory.items.length,count);
});
test('every later encounter pool is strictly stronger than all earlier pools', () => {
  let maxHp=0,maxDamage=0,maxDefense=0;
  const names=new Set<string>();
  for(const m of Object.values(maps()))for(const node of m.nodes) {
    assert.ok(Math.min(...node.possibleSpawns.map(e=>e.hp))>maxHp);
    assert.ok(Math.min(...node.possibleSpawns.map(e=>e.damageMin))>maxDamage);
    assert.ok(Math.min(...node.possibleSpawns.map(e=>e.defense))>=maxDefense);
    for(const enemy of node.possibleSpawns){assert.equal(names.has(enemy.name),false);names.add(enemy.name);}
    maxHp=Math.max(...node.possibleSpawns.map(e=>e.hp));maxDamage=Math.max(...node.possibleSpawns.map(e=>e.damageMin));maxDefense=Math.max(...node.possibleSpawns.map(e=>e.defense));
    assert.equal(node.possibleSpawns.reduce((sum,e)=>sum+e.chance,0),100);
  }
});
test('three classes have equivalent expected damage and effective HP across equipment tiers', () => {
  for(const [attack,hp,defense,crit] of [[9,100,.6,.05],[24,160,4,.1],[65,300,12,.2],[110,550,16,.25]]) {
    const results=(['mage','ninja','archer'] as const).map(hero=>{
      const p=applyClassBonuses(hero,attack,hp);
      return {dps:(p.attack-defense)*(1+(crit+p.crit)*.5),survival:p.maxHp/(1-(.03+p.dodge))};
    });
    assert.ok(Math.max(...results.map(r=>r.dps))/Math.min(...results.map(r=>r.dps))<1.03);
    assert.ok(Math.max(...results.map(r=>r.survival))/Math.min(...results.map(r=>r.survival))<1.02);
  }
});
test('exclusive weapons reject other classes; armor remains universal', () => {
  for(const hero of ['mage','ninja','archer'] as const){
    for(const other of ['mage','ninja','archer'] as const) assert.equal(canEquipClass({heroClass:hero},classWeapon(other,0)),hero===other);
    assert.equal(canEquipClass({heroClass:hero},marketCatalog(hero)[5].item),true);
  }
});
test('legacy cleared stages are preserved without introducing date waits', () => {
  const old=maps();old.map1.campaignVersion=2;
  for(const n of old.map1.nodes.slice(0,5)){n.isCompleted=true;delete n.requiredWins;delete n.wins;}
  const migrated=migrateCampaignMaps(old,maps());
  assert.equal(routeProgress(migrated.map1,0).completed,16);assert.equal(migrated.map1.nodes[5].isUnlocked,true);
});
test('all 15 submaps complete sequentially at their declared energy budgets', () => {
  let s=state();s.totalBossesDefeated=0;let victories=0;let expected=0;
  for(const m of Object.values(s.maps)){
    assert.equal(s.maps[m.id].isUnlocked,true);
    for(let area=0;area<3;area++)expected+=submapCombatCount(m.id,area);
    for(const node of m.nodes)for(let i=0;i<node.requiredWins!;i++){s=win(s,m.id,node.id);victories++;}
  }
  assert.equal(victories,expected);assert.equal(s.totalBossesDefeated,15);assert.equal(s.inventory.items.length,15);
  assert.ok(Object.values(s.maps).flatMap(m=>m.nodes).every(n=>n.isCompleted));
});
test('legendary and mythic prices represent long-term progression, with boss and level gates', () => {
  assert.equal(MARKET_PRICES[3],75000);assert.equal(ARMOR_PRICES[3],60000);assert.ok(MARKET_PRICES[4]>MARKET_PRICES[3]*4);
  const s=state();s.totalBossesDefeated=7;
  assert.match(marketBlock(s,{type:'buy',tier:3})!,/8 bosses/);
  s.totalBossesDefeated=8;s.character.level=24;assert.match(marketBlock(s,{type:'buy',tier:3})!,/nível 25/);
  s.character.level=25;assert.equal(marketBlock(s,{type:'buy',tier:3}),null);
});
test('every purchase/resale round trip loses gold, even after refinement', () => {
  for(let tier=0;tier<10;tier++){
    const s=state();const bought=transactMarket(s,{type:'buy',tier});assert.equal(bought.inventory.items.length,1);
    bought.inventory.items[0].upgradeLevel=10;
    const sold=transactMarket(bought,{type:'sell',itemId:bought.inventory.items[0].id});
    assert.ok(sold.economy.coins<s.economy.coins);assert.equal(sold.inventory.items.length,0);
    assert.equal(sold.economy.coins,s.economy.coins-sold.economy.totalCoinsSpent+sold.economy.totalCoinsEarned);
  }
});
test('missing gold, invalid tiers and active combat reject purchases atomically', () => {
  const s=state();for(const tier of [-1,10,.5,NaN])assert.equal(transactMarket(s,{type:'buy',tier}),s);
  s.economy.coins=159;assert.equal(transactMarket(s,{type:'buy',tier:0}),s);
  s.economy.coins=160;s.combat!.isActive=true;assert.equal(transactMarket(s,{type:'buy',tier:0}),s);
});
test('selling the same item twice or selling equipped/socketed gear is rejected', () => {
  const s=state();const item=classWeapon('mage',0);s.inventory.items=[item];
  const action={type:'sell' as const,itemId:item.id};s.character.equipped.weapon=item;
  assert.equal(transactMarket(s,action),s);s.character.equipped={};item.gemSlot={id:'gem'} as never;
  assert.equal(transactMarket(s,action),s);delete item.gemSlot;
  const sold=transactMarket(s,action);assert.equal(transactMarket(sold,action),sold);
});
test('rare exchanges use a proportional fee and cannot mint or duplicate items', () => {
  const s=state();const item=classWeapon('ninja',3);s.inventory.items=[item];
  assert.equal(exchangeFee(item),7500);s.economy.coins=7499;
  const action={type:'exchange' as const,itemId:item.id};assert.equal(transactMarket(s,action),s);
  s.economy.coins=7500;const next=transactMarket(s,action);
  assert.equal(next.economy.coins,0);assert.equal(next.inventory.items.length,1);
  assert.equal(next.inventory.items[0].classRequirement,'mage');assert.equal(next.inventory.items[0].rarity,'legendary');
  assert.equal(transactMarket(next,action),next);
});
test('original rest spends one energy, restores HP and preserves gold and fragments', () => {
  const s=state();s.character.hp=20;s.character.energy=3;s.character.energyFragments=4;s.economy.coins=0;
  const rested=restAtCamp(s);
  assert.equal(rested.character.hp,100);assert.equal(rested.character.energy,2);
  assert.equal(rested.character.energyFragments,4);assert.equal(rested.economy.coins,0);
  assert.equal(rested.economy.totalCoinsSpent,s.economy.totalCoinsSpent);
  assert.equal(rested.restDetails?.healAmount,80);
  s.character.energy=0;assert.equal(restAtCamp(s),s);
});
test('the original infinite-energy setting also applies to resting', () => {
  const s=state();s.character.hp=20;s.character.energy=0;s.settings={infiniteEnergy:true} as never;
  const rested=restAtCamp(s);assert.equal(rested.character.energy,0);assert.equal(rested.character.hp,100);
});
test('dismantling awards exact rarity shards, preserves the gem and consumes the item once', () => {
  const s=state();const item=classWeapon('mage',2);item.upgradeLevel=6;item.gemSlot={id:'gem'} as never;s.inventory.items=[item];
  const next=dismantleEquipment(s,item.id);
  assert.equal(next.inventory.items.length,0);assert.equal(next.economy.shards.epic,23);assert.equal(next.inventory.gems[0].id,'gem');
  assert.equal(next.economy.coins,s.economy.coins);assert.equal(dismantleEquipment(next,item.id),next);
});
test('equipped items and active fights block dismantling without resource changes', () => {
  const s=state();const item=classWeapon('mage',0);s.inventory.items=[item];s.character.equipped.weapon=item;
  assert.match(dismantleBlock(s,item.id)!,/Desequipe/);assert.equal(dismantleEquipment(s,item.id),s);
  s.character.equipped={};s.combat!.isActive=true;assert.equal(dismantleEquipment(s,item.id),s);
});
test('forge +1 charges canonical costs and changes the actual inventory item', () => {
  const s=state();const item=classWeapon('mage',0);s.inventory.items=[item];
  const next=refineEquipment(s,item.id,.99);
  assert.equal(next.inventory.items[0].upgradeLevel,1);assert.equal(next.economy.coins,s.economy.coins-30);assert.equal(next.economy.shards.common,19);
  assert.equal(next.forgeNotice?.kind,'success');
});
test('refining equipped gear updates its slot; missing shards never become NaN', () => {
  const s=state();const item=classWeapon('mage',1);s.character.equipped.weapon=item;
  const next=refineEquipment(s,item.id,0);assert.equal(next.character.equipped.weapon!.upgradeLevel,1);
  const missing=state();missing.character.equipped.weapon=item;missing.economy.shards={} as never;
  const blocked=refineEquipment(missing,item.id,0);assert.equal(blocked.economy.coins,missing.economy.coins);assert.equal(blocked.forgeNotice?.kind,'error');
});
test('max refinement and insufficient coins fail without consuming resources', () => {
  const s=state();const item=classWeapon('mage',0);item.upgradeLevel=10;s.inventory.items=[item];
  assert.equal(refineEquipment(s,item.id,0).economy.coins,s.economy.coins);
  item.upgradeLevel=0;s.economy.coins=29;const blocked=refineEquipment(s,item.id,0);assert.equal(blocked.inventory.items[0].upgradeLevel,0);assert.equal(blocked.economy.coins,29);
});
test('refine and dismantle cannot create a crystal arbitrage loop', () => {
  const s=state();const item=classWeapon('mage',0);s.inventory.items=[item];let next=s;
  for(let i=0;i<10;i++)next=refineEquipment(next,item.id,0);
  const shardsSpent=s.economy.shards.common-next.economy.shards.common;
  assert.ok(dismantleYield(next.inventory.items[0])<shardsSpent);
  assert.ok(forgeCost(classWeapon('mage',3)).gold>forgeCost(classWeapon('mage',0)).gold*10);
});
test('a protection stone preserves crystals exactly once on a failed refinement', () => {
  const s=state();const item=classWeapon('mage',0);item.upgradeLevel=5;s.inventory.items=[item];
  s.inventory.consumables={protectionStones:1};
  const cost=forgeCost(item);const protectedState=refineEquipment(s,item.id,.99);
  assert.equal(protectedState.inventory.items[0].upgradeLevel,5);
  assert.equal(protectedState.economy.coins,s.economy.coins-cost.gold);
  assert.equal(protectedState.economy.shards.common,s.economy.shards.common);
  assert.equal(protectedState.inventory.consumables!.protectionStones,0);
  const unprotected=refineEquipment(protectedState,item.id,.99);
  assert.equal(unprotected.economy.shards.common,protectedState.economy.shards.common-cost.shards);
});
