import { ItemArtwork } from '@/components/ItemArtwork';
import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { HERO_CLASSES, marketCatalog, marketBlock, itemValue, SELL_FEE, EXCHANGE_FEE, exchangeFee, MARKET_BOSSES, type MarketAction } from '@/lib/campaign';

export function Market() {
  const { gameState, tradeMarket } = useGame();
  const [tab, setTab] = useState<'buy' | 'sell' | 'exchange' | 'history'>('buy');
  const [message, setMessage] = useState('');
  const hero = gameState.character.heroClass;
  const transact = (action: MarketAction) => {
    const blocked = marketBlock(gameState, action);
    if (blocked) { setMessage(blocked); return; }
    tradeMarket(action);
    setMessage('Negociação concluída. Seu inventário e saldo foram atualizados.');
  };
  const owned = gameState.inventory.items.filter(i => !Object.values(gameState.character.equipped).some(e => e?.id === i.id));
  const sellable = tab === 'exchange' ? owned.filter(i => i.type === 'weapon' && i.classRequirement && i.classRequirement !== hero) : owned;
  return <section className="space-y-4 rounded-2xl border border-amber-500/20 bg-[#101018] p-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-cinzel text-xl text-amber-300">Mercado dos Aventureiros</h3><p className="text-xs text-gray-400 mt-1">Arsenal da classe · balcão de venda · casa de trocas</p></div><strong className="text-xl text-amber-400">🪙 {gameState.economy.coins} ouro</strong></div>
    <p className="text-sm text-gray-300">Armas de 160 a 350.000 e armaduras de 130 a 280.000 ouro. Raridades avançadas exigem bosses únicos derrotados. Revenda por 12% do valor base, com taxa de {SELL_FEE} ouro paga antes da venda. Trocas custam 10% do valor da arma (mínimo {EXCHANGE_FEE} ouro) e convertem uma arma de outra classe na mesma raridade, sem melhorias ou gema. Desequipe antes de negociar.</p>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" aria-label="Locais do mercado">{([
      ['buy', '🏪 Arsenal'], ['sell', '🪙 Vender'], ['exchange', '⚖️ Casa de trocas'], ['history', '📜 Histórico'],
    ] as const).map(([id, label]) => <Button key={id} variant={tab === id ? 'default' : 'outline'} onClick={() => { setTab(id); setMessage(''); }}>{label}</Button>)}</div>
    {message && <p role="status" className="rounded-lg bg-purple-500/10 p-3 text-sm text-purple-200">{message}</p>}
    {!hero ? <p>Escolha sua classe para acessar o mercado.</p> : tab === 'buy' ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{marketCatalog(hero).map(({ item, price }, tier) => {
      const action: MarketAction = { type: 'buy', tier };
      const blocked = marketBlock(gameState, action);
      return <article key={item.id} className="rounded-xl border min-w-0 border-purple-500/25 bg-black/30 p-4 space-y-3 flex flex-col">
        <ItemArtwork item={item} className="w-full max-w-36 mx-auto" /><h4 className="font-bold">{item.name}</h4>
        <p className="text-xs text-purple-300">{item.classRequirement ? `Exclusivo: ${HERO_CLASSES[hero].name}` : 'Todas as classes'} · nível {item.levelRequirement} · {MARKET_BOSSES[tier % 5]} bosses</p>
        <p className="text-sm">{item.type === 'weapon' ? `+${item.stats.attack} ataque` : `+${item.stats.defense} defesa · +${item.stats.hpBonus} vida`} · {item.rarity}</p>
        <Button className="w-full mt-auto whitespace-normal h-auto min-h-10" disabled={!!blocked} onClick={() => transact(action)}>Comprar · {price} ouro</Button>
        {blocked && <p className="text-xs text-amber-200">{blocked}</p>}
      </article>;
    })}</div> : tab === 'history' ? <div className="space-y-2">{!(gameState.marketHistory || []).length && <p className="text-sm text-gray-400">Suas negociações aparecerão aqui.</p>}{(gameState.marketHistory || []).map(entry => <p key={entry.id} className="rounded-lg bg-black/30 p-3 text-sm"><span className="text-xs text-gray-400">{new Date(entry.at).toLocaleString('pt-BR')}</span><br />{entry.text}</p>)}</div> : <div className="grid sm:grid-cols-2 gap-3">
      {!sellable.length && <p className="text-sm text-gray-400">{tab === 'sell' ? 'Nenhum item desequipado disponível para venda.' : 'Nenhuma arma de outra classe para trocar.'}</p>}
      {sellable.map(item => {
        const action: MarketAction = { type: tab === 'sell' ? 'sell' : 'exchange', itemId: item.id };
        const blocked = marketBlock(gameState, action);
        return <article key={item.id} className="rounded-xl border border-white/10 p-4 space-y-2"><ItemArtwork item={item} className="w-28 mx-auto" /><h4 className="font-semibold break-words">{item.name}</h4><p className="text-xs text-gray-400">{item.rarity}{item.classRequirement && ` · ${HERO_CLASSES[item.classRequirement].name}`}</p>
          <p className="text-sm">{tab === 'sell' ? `Recebe ${itemValue(item) - SELL_FEE} ouro líquido · mínimo ${SELL_FEE} em saldo` : `Arma de ${HERO_CLASSES[hero].name} · mesma raridade · taxa ${exchangeFee(item)} ouro`}</p>
          {(item.gemSlot || item.upgradeLevel > 0) && <p className="text-xs text-amber-300">Melhorias serão perdidas. Remova a gema antes de negociar.</p>}
          <Button disabled={!!blocked || !!item.gemSlot} onClick={() => transact(action)}>{tab === 'sell' ? 'Vender item' : 'Trocar arma'}</Button>
          {blocked && <p className="text-xs text-amber-200">{blocked}</p>}
        </article>;
      })}
    </div>}
  </section>;
}
