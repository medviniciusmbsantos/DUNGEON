import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import type { MapId, MapNode } from '@/types/game';
import { REGIONS, entryBlock, routeProgress, submapDays, submapEnergy, DAILY_ROUTE_ENERGY } from '@/lib/campaign';
import { assetUrl } from '@/lib/assets';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Heart, Zap, Swords, Lock, Crown, Check } from 'lucide-react';

interface MapSystemProps {
  initialMapId?: MapId;
  onEnterCombat: (mapId: MapId, nodeId: string) => void;
  onExit: () => void;
  onBackToWorldMap?: () => void;
}
const MAP_IMAGES = ['dark_forest_bg.jpg', 'ancient_crypt_bg.jpg', 'lava_volcano_bg.jpg', 'void_abyss_bg.jpg', 'dragon_nest_bg.jpg'];

export function MapSystem({ initialMapId = 'map1', onEnterCombat, onExit, onBackToWorldMap }: MapSystemProps) {
  const { gameState, claimDailyMission } = useGame();
  const [mapId, setMapId] = useState(initialMapId);
  const map = gameState.maps[mapId];
  const [area, setArea] = useState(() => map.nodes.find(n => n.isUnlocked && !n.isCompleted)?.area || 0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showMissions, setShowMissions] = useState(false);
  const region = Number(mapId.slice(3)) - 1;
  const nodes = map.nodes.filter(n => n.area === area);
  const selected: MapNode = nodes.find(n => n.id === selectedId) || nodes.find(n => n.isUnlocked && !n.isCompleted) || nodes[0];
  const progress = routeProgress(map, area);
  const blocked = entryBlock(map, selected);
  const noEnergy = !gameState.settings.infiniteEnergy && gameState.character.energy < 1;
  const chooseArea = (next: number) => { setArea(next); setSelectedId(null); };
  return <div className="campaign-screen h-dvh overflow-y-auto bg-[#080910] text-white">
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <Button variant="outline" onClick={onBackToWorldMap || onExit}><ChevronLeft className="mr-1 h-4 w-4" />Mapa Mundo</Button>
        <label className="flex items-center gap-2 text-sm text-gray-400">Região<select aria-label="Região" value={mapId} onChange={e => { setMapId(e.target.value as MapId); chooseArea(0); }} className="rounded-lg border border-white/10 bg-[#141523] p-2 text-white max-w-[230px]">{Object.values(gameState.maps).map(m => <option key={m.id} value={m.id} disabled={!m.isUnlocked}>{m.name}{!m.isUnlocked ? ' · Bloqueada' : ''}</option>)}</select></label>
        <div className="flex gap-4 text-sm font-mono"><span className="flex items-center gap-1 text-rose-300"><Heart className="h-4 w-4" />{Math.ceil(gameState.character.hp)}/{gameState.character.maxHp}</span><span className="flex items-center gap-1 text-cyan-300"><Zap className="h-4 w-4" />{gameState.character.energy}/{gameState.character.maxEnergy}</span></div>
      </header>
      <div><p className="text-xs tracking-[0.25em] text-purple-300 uppercase mb-2">Expedição · Região {region + 1}</p><h1 className="font-cinzel text-2xl sm:text-3xl">{map.name}</h1></div>
      <div className="grid gap-3 md:grid-cols-3">{REGIONS[region].map((name, index) => {
        const p = routeProgress(map, index); const unlocked = map.nodes.some(n => n.area === index && n.isUnlocked);
        return <button key={name} onClick={() => chooseArea(index)} aria-pressed={area === index} className={`rounded-2xl border p-4 text-left transition-colors ${area === index ? 'border-purple-400 bg-purple-500/15' : 'border-white/10 bg-white/[0.025] hover:border-purple-400/50'}`}><span className="flex items-center justify-between gap-2 font-semibold">{name}{unlocked ? p.completed === p.total ? <Check className="h-4 w-4 text-emerald-400" /> : <Swords className="h-4 w-4 text-purple-300" /> : <Lock className="h-4 w-4 text-gray-500" />}</span><span className="mt-2 block text-xs text-gray-400">{p.completed}/{p.total} vitórias · ~{submapDays(mapId, index)} dias a {DAILY_ROUTE_ENERGY} energias/dia</span></button>;
      })}</div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,1fr)]">
        <section className="min-w-0 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#10121c] p-4 sm:p-5 space-y-3"><div className="flex flex-wrap justify-between gap-2"><h2 className="font-bold">{REGIONS[region][area]}</h2><span className="text-sm text-cyan-300">{progress.completed}/{progress.total} encontros vencidos</span></div><div role="progressbar" aria-label="Progresso do submapa" aria-valuenow={progress.completed} aria-valuemin={0} aria-valuemax={progress.total} className="h-2 rounded-full bg-white/5 overflow-hidden"><div className="h-full bg-gradient-to-r from-purple-500 to-cyan-400" style={{ width: `${progress.completed / progress.total * 100}%` }} /></div><p className="text-sm text-gray-400">{submapEnergy(mapId, area)} combates de 1 energia, incluindo o boss. O tempo é uma estimativa: você avança pelas vitórias, sem esperar uma data. Derrotas e fugas não avançam a rota. Descobertas extras não gastam energia.</p></div>
          <div className="rounded-2xl border border-white/10 overflow-hidden relative bg-[#10121c]">
            <div className="h-40 sm:h-56 lg:h-64 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(0deg,#10121c,transparent),url('${assetUrl(MAP_IMAGES[region])}')` }} />
            <div className="relative -mt-10 p-4 grid grid-cols-2 sm:grid-cols-5 gap-2">{nodes.map((node, i) => <button key={node.id} onClick={() => setSelectedId(node.id)} aria-pressed={selected.id === node.id} className={`min-w-0 rounded-xl border p-3 text-left transition-colors ${selected.id === node.id ? 'border-cyan-400 bg-cyan-950' : 'border-white/15 bg-[#141523] hover:border-purple-400'} ${!node.isUnlocked ? 'text-gray-500' : ''}`}><span className="flex justify-between gap-1 mb-3">{node.isBoss ? <Crown className="h-5 w-5 text-amber-400" /> : <span className="text-purple-300 text-sm">{i + 1}</span>}{node.isCompleted ? <Check className="h-4 w-4 text-emerald-400" /> : !node.isUnlocked ? <Lock className="h-4 w-4" /> : null}</span><span className="block text-xs font-bold">{node.isBoss ? 'Boss' : ['Batedores', 'Caçadores', 'Veteranos', 'Elites'][i]}</span><span className="mt-1 block text-xs text-gray-400">{node.wins || 0}/{node.requiredWins} vitórias</span></button>)}</div>
          </div>
          <Button variant="outline" onClick={() => setShowMissions(!showMissions)}>{showMissions ? 'Ocultar objetivos diários' : 'Ver objetivos diários'}</Button>
          {showMissions && <div className="grid sm:grid-cols-2 gap-3">{gameState.dailyMissions.missions.map(m => <div key={m.id} className="rounded-xl border border-white/10 p-4 text-sm"><strong>{m.title}</strong><p className="text-gray-400 my-2">{m.progress}/{m.target}</p><Button size="sm" disabled={!m.completed || m.claimed} onClick={() => claimDailyMission(m.id)}>{m.claimed ? 'Resgatado' : 'Resgatar'}</Button></div>)}</div>}
        </section>
        <aside className="min-w-0 rounded-2xl border border-white/10 bg-[#10121c] p-5 space-y-5 self-start lg:sticky lg:top-4">
          <div><p className="text-xs uppercase tracking-widest text-purple-300">{selected.isBoss ? 'Guardião do submapa' : 'Próximo confronto'}</p><h2 className="font-cinzel text-xl mt-2 break-words">{selected.name}</h2><p className="text-sm text-gray-400 mt-2">{selected.wins || 0}/{selected.requiredWins} vitórias nesta etapa.{selected.isCompleted ? ' Você pode repetir para coletar recursos.' : ''}</p></div>
          <div className="space-y-3">{selected.possibleSpawns.map(enemy => <article key={enemy.name} className="rounded-xl border border-white/5 bg-black/30 p-3"><div className="flex gap-3 items-start"><span className="text-3xl" aria-hidden="true">{enemy.image}</span><div className="min-w-0"><h3 className="text-sm font-medium break-words">{enemy.name}</h3><p className="text-xs text-gray-400 mt-1">{enemy.hp} HP · ATQ {enemy.damageMin.toFixed(1)}–{enemy.damageMax.toFixed(1)} · DEF {enemy.defense.toFixed(1)}</p><p className="text-xs text-amber-300 mt-1">{enemy.goldMin}–{enemy.goldMax} ouro · {enemy.xp} XP</p></div></div></article>)}</div>
          {blocked && <p className="text-sm text-amber-200" role="status">{blocked}</p>}
          {noEnergy && <p className="text-sm text-cyan-200">Complete tarefas e resgate os objetivos diários para recuperar energia.</p>}
          <Button className="w-full h-12" disabled={!!blocked || noEnergy} onClick={() => onEnterCombat(mapId, selected.id)}><Swords className="mr-2 h-4 w-4" />{selected.isBoss ? 'Enfrentar boss' : 'Enfrentar inimigo'} · 1 energia</Button>
        </aside>
      </div>
    </div>
  </div>;
}
