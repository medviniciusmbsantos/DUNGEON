import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Market } from './Market';
import { ItemArtwork } from '@/components/ItemArtwork';
import { forgeCost, dismantleBlock, dismantleYield, refinementBlock } from '@/lib/forge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function Shop() {
  const { gameState, upgradeItem, destroyItem } = useGame();
  const [tab, setTab] = useState<'forge' | 'market'>('forge');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [confirmation, setConfirmation] = useState<'refine' | 'dismantle' | null>(null);
  const equipped = Object.values(gameState.character.equipped).filter(i => i && 'upgradeLevel' in i);
  const items = [...gameState.inventory.items, ...equipped].filter((item, i, list) => list.findIndex(x => x.id === item.id) === i);
  const selected = items.find(i => i.id === selectedId);
  const isEquipped = selected && equipped.some(i => i.id === selected.id);
  const cost = selected ? forgeCost(selected) : null;
  const refineBlocked = selected ? refinementBlock(gameState, selected) : 'Selecione um equipamento.';
  const dismantleBlocked = selected ? dismantleBlock(gameState, selected.id) : 'Selecione um equipamento.';
  const visible = filter === 'all' ? items : items.filter(i => i.type === filter);
  const rarityNames = { common: 'Comum', rare: 'Raro', epic: 'Épico', legendary: 'Lendário', mythic: 'Mítico' };
  return <div className="game-page space-y-6 py-5 sm:py-8">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs tracking-[0.25em] text-purple-300 uppercase">Castelo dos Aventureiros</p><h1 className="mt-2 text-2xl sm:text-3xl font-cinzel">Arsenal & Forja</h1></div><span className="text-xl font-mono text-amber-300">{gameState.economy.coins.toLocaleString('pt-BR')} ouro</span></header>
    <div className="flex gap-2" aria-label="Serviços do castelo"><Button onClick={() => setTab('forge')} variant={tab === 'forge' ? 'default' : 'outline'}>Forja</Button><Button onClick={() => setTab('market')} variant={tab === 'market' ? 'default' : 'outline'}>Loja</Button></div>
    {tab === 'market' ? <Market /> : <>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">{(Object.keys(rarityNames) as (keyof typeof rarityNames)[]).map(r => <div key={r} className="rounded-xl border border-white/10 bg-[#10121c] p-3"><p className="text-xs text-gray-400">Cristais · {rarityNames[r]}</p><p className="mt-1 text-xl font-mono">{gameState.economy.shards?.[r] || 0}</p></div>)}</div>
      {gameState.forgeNotice && <p role="status" className={`rounded-xl border p-4 text-sm ${gameState.forgeNotice.kind === 'success' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-amber-500/30 bg-amber-500/10 text-amber-200'}`}>{gameState.forgeNotice.title}</p>}
      <div className="grid gap-6 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.5fr)]">
        <section id="forge-details" className="scroll-mt-32 rounded-2xl border border-amber-500/20 bg-[#10121c] p-5 sm:p-6 space-y-5 self-start lg:sticky lg:top-24">
          <div><h2 className="font-cinzel text-xl text-amber-200">Forja Ancestral</h2><p className="text-sm text-gray-400 mt-2">Refine seu equipamento ou desmantele itens para obter cristais da mesma raridade.</p></div>
          {selected ? <><ItemArtwork item={selected} className="w-40 mx-auto" /><h3 className="text-lg font-bold break-words">{selected.name} +{selected.upgradeLevel}</h3><p className="text-sm text-purple-300">{rarityNames[selected.rarity]} · {isEquipped ? 'Equipado' : 'No inventário'}</p>
            <div className="rounded-xl border border-white/10 p-3 text-sm space-y-2"><p>Refinar para +{Math.min(10, selected.upgradeLevel + 1)}: <strong>{cost?.gold.toLocaleString('pt-BR')} ouro</strong> e {cost?.shards} cristal(is).</p><p className="text-gray-400">Chance de sucesso: {cost?.chance}%. Sem pedra de proteção, uma falha consome ouro e cristais. O nível atual do item é preservado.</p><p>Pedras de proteção disponíveis: {gameState.inventory.consumables?.protectionStones || 0}. Em uma falha, uma pedra é consumida para preservar os cristais.</p><p>Desmantelar: <strong>{dismantleYield(selected)} cristal(is) {rarityNames[selected.rarity]}</strong>.</p>{selected.gemSlot && <p className="text-cyan-300">A gema será devolvida ao inventário ao desmantelar.</p>}</div>
            <div className="grid gap-2"><Button disabled={!!refineBlocked} onClick={() => setConfirmation('refine')}>Refinar equipamento</Button>{refineBlocked && <p className="text-xs text-amber-200">{refineBlocked}</p>}<Button variant="outline" disabled={!!dismantleBlocked} onClick={() => setConfirmation('dismantle')}>Desmantelar item</Button>{dismantleBlocked && <p className="text-xs text-amber-200">{dismantleBlocked}</p>}</div>
          </> : <div className="rounded-xl border border-dashed border-white/20 p-8 text-center text-gray-400">Selecione um equipamento ao lado para ver custos e materiais.</div>}
        </section>
        <section className="min-w-0 space-y-4"><div className="flex flex-wrap justify-between gap-3 items-center"><h2 className="font-cinzel text-lg">Seus equipamentos</h2><label className="text-sm text-gray-400">Filtrar <select aria-label="Filtrar equipamentos" value={filter} onChange={e => setFilter(e.target.value)} className="ml-2 rounded-lg border border-white/10 bg-[#141523] p-2"><option value="all">Todos</option><option value="weapon">Armas</option><option value="armor">Armaduras</option><option value="helmet">Elmos</option><option value="boots">Botas</option><option value="accessory">Acessórios</option></select></label></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">{visible.map(item => <button key={item.id} onClick={() => { setSelectedId(item.id); if (window.innerWidth < 1024) document.getElementById('forge-details')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} aria-pressed={selectedId === item.id} className={`min-w-0 rounded-xl border bg-[#10121c] p-3 text-left ${selectedId === item.id ? 'border-amber-400 ring-1 ring-amber-400' : 'border-white/10 hover:border-purple-400'}`}><ItemArtwork item={item} className="w-full max-w-32 mx-auto" /><span className="mt-3 block text-sm font-semibold break-words">{item.name} +{item.upgradeLevel}</span><span className="mt-1 block text-xs text-gray-400">{rarityNames[item.rarity]}{equipped.some(i => i.id === item.id) ? ' · Equipado' : ''}</span></button>)}</div>
          {!visible.length && <p className="rounded-xl border border-dashed border-white/10 p-6 text-gray-400">Nenhum equipamento neste filtro.</p>}
        </section>
      </div>
    </>}
    <Dialog open={!!confirmation && !!selected} onOpenChange={open => { if (!open) setConfirmation(null); }}><DialogContent className="bg-[#10121c] text-white border-white/10"><DialogHeader><DialogTitle>{confirmation === 'dismantle' ? 'Confirmar desmantelamento' : 'Confirmar refinamento'}</DialogTitle></DialogHeader>{selected && <div className="space-y-4"><ItemArtwork item={selected} className="w-28 mx-auto" /><p className="font-semibold">{selected.name} +{selected.upgradeLevel}</p><p className="text-sm text-gray-300">{confirmation === 'dismantle' ? `O item será removido permanentemente e renderá ${dismantleYield(selected)} cristal(is) ${rarityNames[selected.rarity]}. Gemas serão preservadas.` : `A tentativa custa ${cost?.gold} ouro e ${cost?.shards} cristal(is). Chance: ${cost?.chance}%.`}</p><div className="grid grid-cols-2 gap-3"><Button variant="outline" onClick={() => setConfirmation(null)}>Cancelar</Button><Button onClick={() => { if (confirmation === 'dismantle') { destroyItem(selected.id); setSelectedId(null); } else upgradeItem(selected.id); setConfirmation(null); }}>{confirmation === 'dismantle' ? 'Confirmar desmantelamento' : 'Confirmar refinamento'}</Button></div></div>}</DialogContent></Dialog>
  </div>;
}
