import { assetUrl } from '@/lib/assets';
import type { Item, Rarity } from '@/types/game';
import { cn } from '@/lib/utils';

const TIERS: Rarity[] = ['common', 'rare', 'epic', 'legendary', 'mythic'];
// The atlas has one distinct illustration per weapon/armor tier, plus utility gear.
export function ItemArtwork({ item, className }: { item: Pick<Item, 'type' | 'rarity' | 'name' | 'classRequirement'>; className?: string }) {
  let column = Math.max(0, TIERS.indexOf(item.rarity));
  let row = 4;
  if (item.type === 'weapon') {
    row = item.classRequirement === 'mage' ? 0 : item.classRequirement === 'archer' ? 2 : 1;
  } else if (item.type === 'armor') row = 3;
  else column = item.type === 'helmet' ? 0 : item.type === 'boots' ? 1 : item.type === 'accessory' ? 2 : 3;
  return <span role="img" aria-label={item.name} data-item-art="true" className={cn('item-artwork block aspect-square w-16 shrink-0 rounded-xl', className)} style={{
    backgroundImage: `url("${assetUrl('items/equipment-atlas.png')}")`, backgroundSize: '500% 500%', backgroundPosition: `${column * 25}% ${row * 25}%`,
  }} />;
}
