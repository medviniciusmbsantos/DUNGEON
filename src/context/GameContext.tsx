import type { HeroClass, MarketAction } from '@/lib/campaign';
// ============================================
// GAME CONTEXT - Global State Provider
// ============================================

import { createContext, useContext, type ReactNode } from 'react';
import { useGameState } from '@/hooks/useGameState';
import type { GameState, Quest, Item, Gem, PlayerProfile, Lootbox, SpecialAttack, FocusTag, QuestType, Difficulty, DayOfWeek, MapId, Rarity, PetId, SanctuaryBuffType } from '@/types/game';
import { DIFFICULTY_CONFIG } from '@/types/game';

// ============================================
// CONTEXT TYPE
// ============================================

interface GameContextType {
  chooseClass: (heroClass: HeroClass) => void;
  tradeMarket: (action: MarketAction) => void;
  // State
  gameState: GameState;
  isLoaded: boolean;
  showLevelUp: boolean;
  setShowLevelUp: (show: boolean) => void;
  showRestOverlay: boolean;
  setShowRestOverlay: (show: boolean) => void;
  restDetails: any;
  LOOTBOX_TYPES: Lootbox[];
  DIFFICULTY_CONFIG: typeof DIFFICULTY_CONFIG;
  
  // Character Actions
  setCharacterName: (name: string) => void;
  completeProfileSetup: (profile: PlayerProfile) => void;
  equipItem: (item: Item) => void;
  unequipItem: (type: Item['type']) => void;
  
  // Gem Socketing
  socketGem: (itemId: string, gem: Gem) => void;
  unsocketGem: (itemId: string) => void;
  
  // Special Attacks
  equipSpecialAttack: (attack: SpecialAttack) => void;
  unequipSpecialAttack: () => void;
  
  // Quests
  createQuest: (title: string, description: string, type: QuestType, difficulty: Difficulty, isEmergency?: boolean, suggestedByMaster?: boolean, scheduledDate?: string, focusTag?: FocusTag, habitDays?: DayOfWeek[], metaTarget?: number, energyReward?: number, checkpointTitles?: string[], scheduledTime?: string, reminderEnabled?: boolean) => Quest;
  addQuest: (quest: Quest) => void;
  completeQuest: (questId: string, type: QuestType) => void;
  toggleQuestCheckpoint: (questId: string, type: QuestType, checkpointId: string) => void;
  deleteQuest: (questId: string, type: QuestType) => void;
  updateQuest: (
    questId: string,
    type: QuestType,
    updates: {
      title?: string;
      description?: string;
      difficulty?: Difficulty;
      energyReward?: number;
      scheduledDate?: string;
      scheduledTime?: string;
      reminderEnabled?: boolean;
      habitDays?: DayOfWeek[];
      metaTarget?: number;
      checkpointTitles?: string[];
    }
  ) => void;
  
  // Combat
  startCombat: () => void;
  playerAttack: () => void;
  playerSpecialAttack: () => void;
  endCombat: () => void;
  advanceFloor: () => void;
  startNewBattle: () => void; // Start fresh battle after death
  resetDungeonAfterDeath: () => void; // Reset dungeon state after player death
  reviveCharacter: () => void; // Revive character with XP penalty
  
  // Map System
  selectMapNode: (mapId: MapId, nodeId: string) => void;
  enterMapSystem: () => void;
  exitMapSystem: () => void;
  leaveCombat: () => void;
  completeMapNode: (mapId: MapId, nodeId: string) => void;
  resetMaps: () => void;
  spawnEnemyForNode: (mapId: MapId, nodeId: string) => void;
  closeDungeonEvent: () => void;
  chooseSanctuaryBuff: (buffType: SanctuaryBuffType) => void;
  skipMerchant: () => void;
  buyMerchantOffer: (offerId: string) => void;
  
  // Energy System
  recoverEnergy: () => void;
  restCharacter: () => void; // Lose 3 energy, recover 20% HP
  
  // Reset
  resetProgress: () => void;
  restartGame: () => void;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  
  // Lootbox
  buyLootbox: (lootboxId: string) => boolean;
  openLootbox: (lootboxId: string) => { items: Item[]; specialAttack?: SpecialAttack };
  
  // Chest System
  openChest: () => { type: 'gold' | 'consumable' | 'equipment'; reward: any } | null;
  startUnlockingChest: (slotIndex: number) => void;
  collectChestRewards: (slotIndex: number) => void;
  claimDailyMission: (missionId: string) => void;
  
  // Forge
  destroyItem: (itemId: string) => void;
  upgradeItem: (itemId: string) => { success: boolean; result: 'success' | 'fail' | 'downgrade' };
  convertShards: (fromRarity: Rarity) => void;
  
  // Chat
  sendChatMessage: (content: string) => void;
  acceptSuggestedQuest: (quest: Quest) => void;
  
  // Calendar
  createWeeklyGoal: (title: string, description: string, targetCount: number, category: FocusTag) => void;
  addCalendarEvent: (date: string, title: string, type: 'quest' | 'reminder' | 'deadline', questId?: string) => void;
  
  // Focus
  setFocusTag: (tag: FocusTag) => void;
  
  // Pet
  selectPet: (petId: PetId | null) => void;
  unlockPet: (petId: PetId) => void;
  
  // Cloud Sync Choice
  syncLocalToCloud: () => Promise<void>;
  loadCloudToLocal: () => Promise<boolean | undefined>;
  
  // Debug
  addDebugLog: (message: string) => void;
}

// ============================================
// CREATE CONTEXT
// ============================================

const GameContext = createContext<GameContextType | undefined>(undefined);

// ============================================
// PROVIDER COMPONENT
// ============================================

export function GameProvider({ children }: { children: ReactNode }) {
  const gameStateHook = useGameState();

  return (
    <GameContext.Provider value={gameStateHook}>
      {children}
    </GameContext.Provider>
  );
}

// ============================================
// CUSTOM HOOK
// ============================================

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
