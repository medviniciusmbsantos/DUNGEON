import { useState } from 'react';
import { HERO_CLASSES, type HeroClass } from '@/lib/campaign';
import { assetUrl } from '@/lib/assets';
import { cn } from '@/lib/utils';

interface CharacterPortraitProps {
  heroClass?: HeroClass;
  className?: string;
  mode?: 'portrait' | 'avatar';
}

export function CharacterPortrait({ heroClass = 'mage', className, mode = 'portrait' }: CharacterPortraitProps) {
  const hero = HERO_CLASSES[heroClass];
  const source = assetUrl(`characters/${heroClass}.png`);
  const [failedSource, setFailedSource] = useState<string | null>(null);

  return <span data-character-class={heroClass} className={cn('relative block overflow-hidden bg-[#090a12]', className)}>
    {failedSource === source ? (
      <span role="img" aria-label={`Personagem ${hero.name}`} className="absolute inset-0 flex items-center justify-center text-4xl">{hero.icon}</span>
    ) : (
      <img src={source} alt={`Personagem ${hero.name}`} draggable={false} onError={() => setFailedSource(source)}
        className={cn('absolute inset-0 h-full w-full', mode === 'avatar' ? 'object-cover object-[50%_30%] scale-[1.7] origin-[50%_30%]' : 'object-contain')} />
    )}
  </span>;
}
