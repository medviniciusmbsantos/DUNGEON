import { ItemArtwork } from '@/components/ItemArtwork';
import { assetUrl } from '@/lib/assets';
import { ClassPicker } from '@/components/ClassPicker';
import { HERO_CLASSES, type HeroClass } from '@/lib/campaign';
import { useState, Component, type ReactNode, type ErrorInfo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameProvider, useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { useNotificationScheduler } from '@/hooks/useNotificationScheduler';
import { DEFAULT_PLAYER_PROFILE, type MapId } from '@/types/game';
import { Header } from '@/components/Header';
import { Dashboard } from '@/sections/Dashboard';
import { Quests } from '@/sections/Quests';
import { Dungeon } from '@/sections/Dungeon';
import { MapSystem } from '@/sections/MapSystem';
import { WorldMap } from '@/sections/WorldMap';
import { Inventory } from '@/sections/Inventory';
import { Shop } from '@/sections/Shop';
// ProfileSetup removed - onboarding simplified to just name input
import { 
  Swords, 
  User, 
  Play, 
  AlertTriangle, 
  RefreshCw, 
  Sparkles, 
  Crown, 
  Star, 
  FlameKindling,
  LogIn,
  LogOut 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { DungeonEventReward, MerchantOffer, SanctuaryBuffType } from '@/types/game';

// ============================================
// ERROR BOUNDARY - Global Error Protection
// ============================================

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Game Error:', error, errorInfo);
    // Log to localStorage for debugging
    const errorLog = {
      timestamp: Date.now(),
      message: error.message,
      stack: error.stack,
      info: errorInfo.componentStack,
    };
    localStorage.setItem('dungeon-error-log', JSON.stringify(errorLog));
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4">
          <div className="card-dungeon p-8 max-w-md w-full text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white font-cinzel mb-2">
              Erro Temporário
            </h2>
            <p className="text-gray-400 mb-6">
              Ocorreu um erro inesperado. Não se preocupe, seus dados estão salvos!
            </p>
            {this.state.error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded p-3 mb-6 text-left">
                <p className="text-red-400 text-sm font-mono">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <Button 
              onClick={this.handleReload}
              className="w-full btn-primary py-4"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Recarregar Jogo
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================
// LOADING FALLBACK
// ============================================

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 mx-auto mb-4"
        >
          <Swords className="w-16 h-16 text-purple-500" />
        </motion.div>
        <p className="text-gray-400">Carregando...</p>
      </div>
    </div>
  );
}

// ============================================
// START SCREEN - Login or Continue
// ============================================

function StartScreen({ 
  onLogin,
  user
}: { 
  onLogin: () => void;
  user: any;
}) {
  const { signOut } = useAuth();
  const { setGameState } = useGame();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center bg-gradient-dark p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="card-dungeon p-8 max-w-md w-full text-center"
      >
        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center glow-purple mb-6">
          <Swords className="w-12 h-12 text-white" />
        </div>

        <h1 className="text-3xl font-bold text-white font-cinzel mb-2">Dungeon of Discipline</h1>
        <p className="text-gray-400 mb-8">
          {user ? `Bem-vindo de volta, ${user.email}` : 'Conecte sua conta para iniciar sua jornada'}
        </p>

        <div className="grid grid-cols-1 gap-4">
          <Button 
            onClick={onLogin}
            className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700 border-blue-500/50 flex items-center justify-center gap-2"
          >
            <LogIn className="w-6 h-6" />
            <span>{user ? 'Entrar no Jogo' : 'Fazer Login com Google'}</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => setGameState(prev => ({ ...prev, isInitialScreen: false, currentMapId: null, currentNodeId: null }))}
            className="w-full py-6 text-base border-purple-500/50 text-purple-200"
          >
            Experimentar sem conta
          </Button>

          {user && (
            <Button
              variant="outline"
              onClick={() => signOut()}
              className="w-full py-4 text-sm border-red-500/30 text-red-400 hover:bg-red-500/10 flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair / Trocar de Conta</span>
            </Button>
          )}
        </div>

        <p className="mt-8 text-[10px] text-gray-500 uppercase tracking-widest leading-relaxed">
          Sem conta, o progresso fica salvo neste dispositivo.<br />Com login, você pode sincronizá-lo na nuvem.
        </p>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// WELCOME SCREEN - Character Creation
// ============================================

function WelcomeScreen({ onStart }: { onStart: (name: string, heroClass: HeroClass) => void }) {
  const [name, setName] = useState('');
  const [heroClass, setHeroClass] = useState<HeroClass | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && heroClass) {
      onStart(name.trim(), heroClass);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center bg-gradient-dark p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="card-dungeon p-8 max-w-md w-full text-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: 'spring' }}
          className="mb-6"
        >
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center glow-purple">
            <Swords className="w-12 h-12 text-white" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-3xl font-bold text-white font-cinzel mb-2"
        >
          Dungeon of Discipline
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-gray-400 mb-8"
        >
          Transforme sua produtividade em uma jornada épica
        </motion.p>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="text-left">
            <label className="text-sm text-gray-400 mb-1 block">
              Como devemos chamar você, aventureiro?
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome..."
                className="pl-10 bg-[#16213e] border-[#2d2d44] text-white text-lg py-6"
                maxLength={20}
              />
            </div>
          </div>

          <ClassPicker value={heroClass} onChange={setHeroClass} />
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              disabled={!name.trim() || !heroClass}
              className="w-full btn-primary py-6 text-lg flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Começar Jornada
            </Button>
          </motion.div>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-8 pt-6 border-t border-[#2d2d44]"
        >
          <p className="text-sm text-gray-500">Sua vida real = energia do personagem</p>
          <p className="text-sm text-gray-500">Sua disciplina = arma</p>
          <p className="text-sm text-gray-500">Sua consistência = armadura</p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// DEATH SCREEN
// ============================================

function DeathScreen({ onRevive }: { onRevive: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center bg-black p-4"
    >
      <div className="card-dungeon p-8 max-w-md w-full text-center border-red-500/50">
        <div className="text-8xl mb-6">💀</div>
        <h1 className="text-4xl font-bold text-red-500 font-cinzel mb-4">VOCÊ CAIU</h1>
        <p className="text-gray-400 mb-8">Seu personagem foi derrotado, mas sua jornada continua...</p>
        
        <div className="bg-[#16213e] rounded-lg p-4 mb-8 text-left">
          <p className="text-sm text-gray-400 mb-3">Penalidade de Ressurreição:</p>
          <ul className="text-sm text-red-400 space-y-1">
            <li>• Perda de 20% do XP Total</li>
            <li>• Possível regressão de nível</li>
            <li>• HP restaurado ao novo máximo</li>
          </ul>
          <p className="text-sm text-gray-400 mt-3">Mantido:</p>
          <ul className="text-sm text-green-400 space-y-1">
            <li>• Todos os equipamentos</li>
            <li>• Todos os itens e ouro</li>
            <li>• Ataques especiais</li>
            <li>• Skins e Conquistas</li>
            <li>• Quests e Progresso do Mapa</li>
          </ul>
        </div>

        <Button onClick={onRevive} className="w-full btn-primary py-6 text-lg bg-red-600 hover:bg-red-700">
          <Sparkles className="w-5 h-5 mr-2" />
          Renascer e Continuar
        </Button>
      </div>
    </motion.div>
  );
}

// ============================================
// MAIN APP CONTENT
// ============================================

function AppContent() {
  const { 
    gameState, 
    setCharacterName, 
    reviveCharacter, 
    completeProfileSetup, 
    chooseClass,
    selectMapNode, 
    enterMapSystem,
    exitMapSystem,
    leaveCombat,
    closeDungeonEvent,
    chooseSanctuaryBuff,
    skipMerchant,
    buyMerchantOffer,
    setGameState,
    showLevelUp,
    setShowLevelUp,
    showRestOverlay,
    setShowRestOverlay,
    restDetails,
    loadCloudToLocal
  } = useGame();

  const [legacyClass, setLegacyClass] = useState<HeroClass | null>(null);

  // Initialize notification scheduler for habits and tasks
  useNotificationScheduler(gameState.quests);

  const { 
    isInitialScreen, 
    character, 
    currentMapId, 
    currentNodeId, 
  } = gameState;

  const { user, signInWithGoogle } = useAuth();

  // Reference for scroll reset
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Local state for non-gameplay UI
  const [currentView, setCurrentView] = useState<'dashboard' | 'quests' | 'inventory' | 'shop'>('dashboard');

  const forceScrollToTop = () => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as any });
    } catch {
      window.scrollTo(0, 0);
    }
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
      try {
        scrollContainerRef.current.scrollTo({ top: 0, left: 0, behavior: 'instant' as any });
      } catch {}
    }
  };

  // Reset scroll instantly when view changes
  useEffect(() => {
    forceScrollToTop();
    const t1 = setTimeout(forceScrollToTop, 30);
    const t2 = setTimeout(forceScrollToTop, 100);
    const t3 = setTimeout(forceScrollToTop, 250);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [currentView]);
  const [showDeath, setShowDeath] = useState(false);
  const [activeBiomeMapId, setActiveBiomeMapId] = useState<MapId | null>(null);

  // Check for death
  if (character.hp <= 0 && !showDeath && character.name) {
    setShowDeath(true);
  }

  // Navigation handlers
  const handleEnterDungeon = () => {
    enterMapSystem();
  };

  const handleEnterCombat = (mapId: MapId, nodeId: string) => {
    selectMapNode(mapId, nodeId);
  };

  const handleExitMapSystem = () => {
    setActiveBiomeMapId(null);
    exitMapSystem();
  };

  const handleExitCombat = () => {
    leaveCombat();
  };

  // Render current view
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onEnterDungeon={handleEnterDungeon} />;
      case 'quests':
        return <Quests />;
      case 'inventory':
        return <Inventory />;
      case 'shop':
        return <Shop />;
      default:
        return <Dashboard onEnterDungeon={handleEnterDungeon} />;
    }
  };

  const dungeonEvent = gameState.dungeonEvent;
  const lootOverlay = gameState.lootOverlay;

  const renderReward = (reward: DungeonEventReward, index: number) => {
    if (reward.type === 'gold') {
      return (
        <div key={index} className="flex items-center justify-between bg-black/30 border border-white/5 rounded-md px-2 py-1">
          <span className="text-xs text-gray-300">Ouro</span>
          <span className="text-xs font-mono text-yellow-400">+{reward.amount}</span>
        </div>
      );
    }
    if (reward.type === 'forgeShard') {
      return (
        <div key={index} className="flex items-center justify-between bg-black/30 border border-white/5 rounded-md px-2 py-1">
          <span className="text-xs text-gray-300">Cristal {reward.rarity}</span>
          <span className="text-xs font-mono text-purple-400">+{reward.amount}</span>
        </div>
      );
    }
    if (reward.type === 'energyFragment') {
      return (
        <div key={index} className="flex items-center justify-between bg-black/30 border border-white/5 rounded-md px-2 py-1">
          <span className="text-xs text-gray-300">Fragmento de Energia</span>
          <span className="text-xs font-mono text-cyan-400">+{reward.amount}</span>
        </div>
      );
    }
    if (reward.type === 'petShard') {
      return (
        <div key={index} className="flex items-center justify-between bg-black/30 border border-white/5 rounded-md px-2 py-1">
          <span className="text-xs text-gray-300">Fragmentos de Pet</span>
          <span className="text-xs font-mono text-pink-400">+{reward.amount}</span>
        </div>
      );
    }
    if (reward.type === 'protectionStone') {
      return (
        <div key={index} className="flex items-center justify-between bg-black/30 border border-white/5 rounded-md px-2 py-1">
          <span className="text-xs text-gray-300">Pedra de Proteção</span>
          <span className="text-xs font-mono text-blue-400">+{reward.amount}</span>
        </div>
      );
    }
    if (reward.type === 'item' && reward.item) {
      return (
        <div key={index} className="flex items-center justify-between bg-black/30 border border-white/5 rounded-md px-2 py-1">
          <span className="flex min-w-0 items-center gap-3"><ItemArtwork item={reward.item} className="w-16" /><span className="text-xs text-gray-300 break-words">{reward.item.name}</span></span>
          <span className="text-[10px] uppercase">{reward.item.rarity}</span>
        </div>
      );
    }
    return null;
  };

  const OfferCard = ({ offer }: { offer: MerchantOffer }) => (
    <div className="p-3 rounded-lg border border-white/10 bg-black/30">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-white">{offer.title}</h4>
          <p className="text-[10px] text-gray-400">{offer.description}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-mono text-yellow-400">{offer.price} ouro</p>
          <Button onClick={() => buyMerchantOffer(offer.id)} className="mt-1 h-6 px-2 text-[10px]">Comprar</Button>
        </div>
      </div>
    </div>
  );

  const BuffButton = ({ label, type }: { label: string; type: SanctuaryBuffType }) => (
    <Button onClick={() => chooseSanctuaryBuff(type)} className="w-full h-8 text-xs">{label}</Button>
  );

  const [eventIntro, setEventIntro] = useState<null | { type: 'chest' | 'merchant' | 'sanctuary'; chestRarity?: string }>(null);
  const chestIntroImages: Record<string, string> = {
    common: assetUrl('chests/common.png'),
    rare: assetUrl('chests/rare.png'),
    epic: assetUrl('chests/epic.png'),
    legendary: assetUrl('chests/legendary.png'),
  };

  useEffect(() => {
    if (!dungeonEvent) {
      setEventIntro(null);
      return;
    }

    if (dungeonEvent.type === 'chest') {
      setEventIntro({ type: 'chest', chestRarity: dungeonEvent.chestRarity });
    } else if (dungeonEvent.type === 'merchant') {
      setEventIntro({ type: 'merchant' });
    } else {
      setEventIntro({ type: 'sanctuary' });
    }

    const t = window.setTimeout(() => {
      setEventIntro(null);
      if (dungeonEvent.type === 'chest') {
        closeDungeonEvent();
      }
    }, 3000);

    return () => window.clearTimeout(t);
  }, [dungeonEvent, closeDungeonEvent]);

  return (
    <>
      {isInitialScreen ? (
        <StartScreen 
          onLogin={() => {
            if (user) {
              loadCloudToLocal();
            } else {
              signInWithGoogle();
            }
          }}
          user={user}
        />
      ) : !character.name ? (
        <WelcomeScreen onStart={(name, heroClass) => {
          setCharacterName(name);
          chooseClass(heroClass);
          completeProfileSetup(DEFAULT_PLAYER_PROFILE);
        }} />
      ) : !character.heroClass ? (
        <div className="min-h-screen bg-gradient-dark p-6 flex items-center justify-center"><div className="card-dungeon p-6 max-w-lg w-full space-y-5">
          <h1 className="text-2xl font-cinzel text-white">Uma nova jornada, {character.name}</h1>
          <p className="text-gray-300">Seu progresso foi preservado. Escolha sua classe e receba sua primeira arma.</p>
          <ClassPicker value={legacyClass} onChange={setLegacyClass} />
          <Button disabled={!legacyClass} onClick={() => legacyClass && chooseClass(legacyClass)}>Continuar como {legacyClass ? HERO_CLASSES[legacyClass].name : 'aventureiro'}</Button>
        </div></div>
      ) : (
        <div className="min-h-screen bg-black text-white flex flex-col overflow-x-hidden">
          <Header 
            currentView={currentView} 
            onViewChange={(view) => {
              setCurrentView(view as any);
              forceScrollToTop();
              // Auto-exit dungeon systems when navigating elsewhere
              if (currentMapId || currentNodeId) {
                exitMapSystem();
              }
            }} 
          />
{/*ptzao*/}        
          <main className="flex-1 pt-[104px] lg:pt-16 pb-20 lg:pb-0 lg:pl-0 border-x border-white/10 mx-auto w-full max-w-7xl relative shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-x-hidden">
            <AnimatePresence mode="wait">
              {showDeath ? (
                <DeathScreen 
                  onRevive={() => {
                    reviveCharacter();
                    setShowDeath(false);
                    exitMapSystem();
                    setCurrentView('dashboard');
                  }} 
                />
              ) : (
                <div className="flex-1 h-full px-2 sm:px-4">
                  {/* Overlay Views (Full Screen) */}
                  <AnimatePresence>
                    {currentNodeId && currentMapId && (
                      <motion.div
                        key="combat-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] overflow-hidden"
                      >
                        <Dungeon 
                          mapId={currentMapId}
                          nodeId={currentNodeId}
                          onExit={handleExitCombat} 
                        />
                      </motion.div>
                    )}

                    {currentMapId && !currentNodeId && (
                      <motion.div
                        key="map-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] overflow-hidden bg-black"
                      >
                        {activeBiomeMapId ? (
                          <MapSystem 
                            initialMapId={activeBiomeMapId}
                            onEnterCombat={handleEnterCombat} 
                            onExit={() => {
                              setActiveBiomeMapId(null);
                              handleExitMapSystem();
                            }}
                            onBackToWorldMap={() => setActiveBiomeMapId(null)}
                          />
                        ) : (
                          <WorldMap
                            onSelectMap={(mapId) => setActiveBiomeMapId(mapId)}
                            onNavigateToCastle={() => {
                              setActiveBiomeMapId(null);
                              handleExitMapSystem();
                              setCurrentView('shop');
                            }}
                            onClose={() => {
                              setActiveBiomeMapId(null);
                              handleExitMapSystem();
                            }}
                          />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Standard Views */}
                  <motion.div
                    key={currentView}
                    ref={scrollContainerRef}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 h-full overflow-auto"
                  >
                    {renderView()}
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </main>

          <AnimatePresence>
            {eventIntro && (
              <motion.div
                key="event-intro"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.85, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.6, x: eventIntro.type === 'chest' ? 180 : 0, y: eventIntro.type === 'chest' ? 240 : 0 }}
                  transition={{ duration: 0.25 }}
                  className="text-center"
                >
                  <div className="flex items-center justify-center">
                    {eventIntro.type === 'chest' ? (
                      <img
                        src={chestIntroImages[eventIntro.chestRarity || 'common'] || chestIntroImages.common}
                        alt="Baú"
                        className="w-28 h-28 object-contain drop-shadow-2xl"
                        draggable={false}
                      />
                    ) : (
                      <div className="text-6xl">
                        {eventIntro.type === 'merchant' && '🧙'}
                        {eventIntro.type === 'sanctuary' && '🌿'}
                      </div>
                    )}
                  </div>
                  <div className="mt-3 text-lg font-bold font-cinzel">
                    {eventIntro.type === 'chest' && 'Baú encontrado!'}
                    {eventIntro.type === 'merchant' && 'Mercador Perdido!'}
                    {eventIntro.type === 'sanctuary' && 'Santuário da Floresta!'}
                  </div>
                  <div className="text-sm text-gray-400">
                    {eventIntro.type === 'chest' && `Raridade: ${eventIntro.chestRarity?.toUpperCase()}`}
                    {eventIntro.type === 'merchant' && 'Escolha 1 oferta'}
                    {eventIntro.type === 'sanctuary' && 'Escolha 1 buff'}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <Dialog
            open={!!lootOverlay && !eventIntro}
            onOpenChange={(open) => {
              if (!open) {
                setGameState(prev => ({ ...prev, lootOverlay: null }));
              }
            }}
          >
            <DialogContent className="bg-[#1a1a2e] border-[#2d2d44] text-white max-w-md">
              <DialogHeader>
                <DialogTitle className="font-cinzel text-xl">{lootOverlay?.title || 'Recompensas'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 py-2">
                {(lootOverlay?.rewards || []).map(renderReward)}
              </div>
              <Button onClick={() => setGameState(prev => ({ ...prev, lootOverlay: null }))} className="w-full">
                Continuar
              </Button>
            </DialogContent>
          </Dialog>

          <AnimatePresence>
            {!!dungeonEvent && dungeonEvent.type !== 'chest' && !eventIntro && (
              <motion.div
                key="dungeon-event-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[130] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="w-full max-w-md bg-[#1a1a2e] border-[#2d2d44] text-white rounded-2xl border p-6 shadow-2xl"
                >
                  {dungeonEvent.type === 'merchant' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-cinzel text-xl">Mercador Perdido</h3>
                        <Button onClick={skipMerchant} variant="outline" className="h-8 px-3 text-xs">Sair</Button>
                      </div>
                      <div className="space-y-2">
                        {dungeonEvent.offers.map((offer) => (
                          <OfferCard key={offer.id} offer={offer} />
                        ))}
                      </div>
                    </div>
                  )}

                  {dungeonEvent.type === 'sanctuary' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-cinzel text-xl">Santuário da Floresta</h3>
                          <p className="text-xs text-gray-400 mt-1">Escolha 1 buff por 3 turnos seguidos</p>
                        </div>
                        <Button onClick={closeDungeonEvent} variant="outline" className="h-8 px-3 text-xs">Sair</Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <BuffButton label="+20% ATK" type="attack" />
                        <BuffButton label="+20% DEF" type="defense" />
                        <BuffButton label="+50% Gold" type="gold" />
                        <BuffButton label="+50% XP" type="xp" />
                      </div>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Global Overlays */}
          <AnimatePresence>
            {showLevelUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowLevelUp(false)}
          >
            <motion.div
              className="text-center"
              animate={{ 
                rotate: [0, -2, 2, -2, 2, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                animate={{ 
                  textShadow: [
                    '0 0 20px #fbbf24',
                    '0 0 40px #fbbf24',
                    '0 0 20px #fbbf24'
                  ]
                }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Crown className="w-24 h-24 text-yellow-400 mx-auto mb-4" />
              </motion.div>
              <h2 className="text-5xl font-bold text-yellow-400 font-cinzel mb-2">
                LEVEL UP!
              </h2>
              <p className="text-2xl text-white">
                Nível {character.level}
              </p>
              <div className="mt-6 space-y-2 text-sm text-gray-400">
                <p className="text-green-400">+5 HP Máximo</p>
                <p className="text-red-400">+0,5 Ataque base</p>
                <p className="text-blue-400">+0.5 Defesa</p>
                <p className="text-yellow-400">+0.3% Crítico</p>
              </div>
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLevelUp(false);
                }}
                className="mt-8 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-6 px-8 rounded-xl shadow-[0_0_20px_rgba(202,138,4,0.3)] transition-all hover:scale-105 active:scale-95"
              >
                <Star className="w-5 h-5 mr-2 fill-current" />
                Continuar Jornada
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Rest Overlay */}
      <AnimatePresence>
        {showRestOverlay && restDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
            onClick={() => setShowRestOverlay(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="text-center max-w-sm w-full bg-[#1a1a2e] border-2 border-orange-500/50 rounded-3xl p-8 shadow-[0_0_50px_rgba(249,115,22,0.2)]"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  filter: ["drop-shadow(0 0 10px #f97316)", "drop-shadow(0 0 30px #f97316)", "drop-shadow(0 0 10px #f97316)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-6"
              >
                <div className="w-24 h-24 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto border-2 border-orange-500/30">
                  <FlameKindling className="w-12 h-12 text-orange-500" />
                </div>
              </motion.div>

              <h2 className="text-3xl font-bold text-orange-400 font-cinzel mb-2">
                DESCANSO
              </h2>
              <p className="text-gray-400 mb-8">
                Você recuperou suas forças na fogueira.
              </p>

              <div className="bg-black/40 rounded-2xl p-6 mb-8 border border-white/5">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-500 text-sm font-medium">Vida Atual</span>
                  <span className="text-gray-300 font-mono font-bold">{restDetails.newHp} / {character.maxHp}</span>
                </div>
                
                <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden mb-4">
                  {/* Previous HP Shadow */}
                  <div 
                    className="absolute inset-y-0 left-0 bg-white/10"
                    style={{ width: `${(restDetails.prevHp / character.maxHp) * 100}%` }}
                  />
                  {/* Healing Animation */}
                  <motion.div 
                    initial={{ width: `${(restDetails.prevHp / character.maxHp) * 100}%` }}
                    animate={{ width: `${(restDetails.newHp / character.maxHp) * 100}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-600 to-green-400"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-left">
                    <span className="text-gray-500 text-xs block">Recuperado</span>
                    <span className="text-2xl font-bold text-green-400">+{restDetails.healAmount} HP</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-500 text-xs block">Anterior</span>
                    <span className="text-lg text-gray-400 font-mono">{restDetails.prevHp}</span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowRestOverlay(false);
                }}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-6 rounded-xl transition-all active:scale-95 shadow-lg shadow-orange-900/20"
              >
                Continuar Jornada
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )}
</>
  );
}

// ============================================
// ROOT APP
// ============================================

function App() {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial load
  useState(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  });

  if (isLoading) {
    return <LoadingFallback />;
  }

  return (
    <ErrorBoundary>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </ErrorBoundary>
  );
}

export default App;
