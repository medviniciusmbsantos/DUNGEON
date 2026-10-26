import { CharacterPortrait } from './CharacterPortrait';
import { HERO_CLASSES, type HeroClass } from '@/lib/campaign';

export function ClassPicker({ value, onChange }: { value: HeroClass | null; onChange: (value: HeroClass) => void }) {
  return <fieldset className="space-y-3 text-left">
    <legend className="font-cinzel text-lg text-white mb-2">Escolha sua classe</legend>
    <p className="text-xs text-gray-400">Sua jornada começa com uma arma exclusiva. A classe é permanente neste personagem.</p>
    <div className="grid gap-2">
      {(Object.keys(HERO_CLASSES) as HeroClass[]).map(id => {
        const hero = HERO_CLASSES[id];
        return <label key={id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${value === id ? 'border-purple-400 bg-purple-500/20' : 'border-white/10 bg-black/30 hover:border-purple-500/60'}`}>
          <input type="radio" name="hero-class" value={id} checked={value === id} onChange={() => onChange(id)} className="accent-purple-500" />
          <CharacterPortrait heroClass={id} className="h-20 w-16 shrink-0 rounded-xl" />
          <span><strong className="block text-white">{hero.name} <span className="text-xs text-purple-300">· {hero.weapon}</span></strong><span className="text-xs text-gray-300">{hero.description}</span></span>
        </label>;
      })}
    </div>
  </fieldset>;
}
