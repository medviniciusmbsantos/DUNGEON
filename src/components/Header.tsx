import { CharacterPortrait } from './CharacterPortrait';
import { HERO_CLASSES } from '@/lib/campaign';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, Scroll, Backpack, Castle, Heart, Zap, Coins, Flame, LogOut, RefreshCw, Shield, Sparkles, Settings, RotateCcw, AlertTriangle } from 'lucide-react';
import { useNotificationScheduler } from '@/hooks/useNotificationScheduler';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { ProgressBar } from './ProgressBar';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

interface HeaderProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Sword },
  { id: 'quests', label: 'Tarefas', icon: Scroll },
  { id: 'inventory', label: 'Inventário', icon: Backpack },
  { id: 'shop', label: 'Castelo', icon: Castle },
];

export function Header({ currentView, onViewChange }: HeaderProps) {
  const { gameState, syncLocalToCloud, setGameState, restartGame } = useGame();
  const { signOut } = useAuth();
  const { permission, toggleNotifications, isSubscribing } = useNotificationScheduler(gameState.quests);
  const { character, economy, recoveryMode, sanctuaryBuff } = gameState;
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncLocalToCloud();
    } catch (err) {
      console.warn('Erro ao sincronizar:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSignOut = async () => {
    setIsSyncing(true);
    try {
      await syncLocalToCloud(); // Auto-sync before sign out
    } catch (err) {
      console.warn('Erro ao sincronizar antes de sair:', err);
    } finally {
      await signOut();
      setShowProfileMenu(false);
      setIsSyncing(false);
    }
  };

  const hpPercent = (character.hp / character.maxHp) * 100;
  const isCriticalHp = hpPercent < 25;

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b',
          isCriticalHp ? 'border-red-500/50' : 'border-[#2d2d44]'
        )}
      >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-3 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            onClick={() => onViewChange('dashboard')}
          >
            <div className="relative">
              <Sword className={cn('w-6 h-6 sm:w-8 sm:h-8', isCriticalHp ? 'text-red-500' : 'text-purple-500')} />
              <div className={cn('absolute inset-0 blur-lg', isCriticalHp ? 'bg-red-500/50' : 'bg-purple-500/50')} />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white font-cinzel">
                <span className="block sm:hidden">DoD</span>
                <span className="hidden sm:block">Dungeon of</span>
              </h1>
              <p className={cn('hidden sm:block text-xs -mt-1', isCriticalHp ? 'text-red-400' : 'text-purple-400')}>Discipline</p>
            </div>
            {recoveryMode && (
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                <Flame className="w-3 h-3" />
                Recuperação
              </span>
            )}
          </motion.div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                    isActive 
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </motion.button>
              );
            })}
          </nav>

          {/* Stats & Profile */}
          <div className="flex items-center gap-2 min-w-0">
            {/* HP Mini */}
            <div className="hidden xl:flex items-center gap-2">
              <Heart className={cn(
                'w-4 h-4',
                isCriticalHp ? 'text-red-500 animate-pulse' : 'text-green-500'
              )} />
              <div className="w-20">
                <ProgressBar
                  value={character.hp}
                  max={character.maxHp}
                  type="hp"
                  size="sm"
                  showValue={false}
                />
              </div>
            </div>

            {/* XP Mini */}
            <div className="hidden xl:flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-500" />
              <div className="w-16">
                <ProgressBar
                  value={character.xp}
                  max={character.maxXp}
                  type="xp"
                  size="sm"
                  showValue={false}
                />
              </div>
            </div>

            {/* Coins */}
            <motion.div 
              className="flex items-center gap-2 bg-yellow-500/10 px-2 sm:px-3 py-1.5 rounded-lg border border-yellow-500/30"
              whileHover={{ scale: 1.05 }}
            >
              <Coins className="w-4 h-4 text-yellow-500" />
              <span className="text-xs sm:text-sm font-mono font-bold text-yellow-400">
                {economy.coins}
              </span>
            </motion.div>

            {sanctuaryBuff && (
              <div className="hidden xl:flex items-center gap-2 bg-green-500/10 px-2 py-1.5 rounded-lg border border-green-500/30">
                {sanctuaryBuff.type === 'attack' && <Sword className="w-4 h-4 text-green-400" />}
                {sanctuaryBuff.type === 'defense' && <Shield className="w-4 h-4 text-green-400" />}
                {sanctuaryBuff.type === 'gold' && <Coins className="w-4 h-4 text-green-400" />}
                {sanctuaryBuff.type === 'xp' && <Sparkles className="w-4 h-4 text-green-400" />}
              </div>
            )}

            {/* Profile / Menu */}
            <div className="relative">
              <motion.button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 rounded-full p-1.5 pr-3 border border-white/10"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {character.heroClass ? <CharacterPortrait heroClass={character.heroClass} mode="avatar" className="h-8 w-8 shrink-0 rounded-full" /> : <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/30 text-xs">{character.name?.[0] || 'P'}</span>}
                <span className="hidden xl:inline text-sm text-gray-300 max-w-32 truncate">{character.name || 'Player'}</span>
                {character.heroClass && <span className="hidden sm:inline text-xs text-purple-300 whitespace-nowrap">{HERO_CLASSES[character.heroClass].icon} {HERO_CLASSES[character.heroClass].name}</span>}
              </motion.button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-12 bg-[#1a1a2e] border border-white/10 rounded-lg shadow-xl p-2 min-w-[180px] z-50"
                  >
                    <button
                      onClick={handleSync}
                      disabled={isSyncing}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-300 hover:bg-white/10 transition-colors"
                    >
                      <RefreshCw className={cn('w-4 h-4', isSyncing && 'animate-spin')} />
                      {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
                    </button>
                    <button
                      onClick={() => { setShowProfileMenu(false); setShowConfig(true); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-300 hover:bg-white/10 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Configuração
                    </button>
                    <button
                      onClick={() => { setShowProfileMenu(false); setShowRestartConfirm(true); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-orange-400 hover:bg-orange-500/10 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reiniciar Jogo
                    </button>
                    <hr className="border-white/10 my-1" />
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="lg:hidden flex items-center justify-around py-1 border-t border-white/5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-xs transition-all',
                  isActive ? 'text-purple-400' : 'text-gray-500 hover:text-gray-300'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
      </motion.header>

      {/* Config Dialog */}
      <Dialog open={showConfig} onOpenChange={setShowConfig}>
        <DialogContent className="bg-[#1a1a2e] border-white/10 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-400" />
              Configuração
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-between gap-4 py-2">
            <div>
              <p className="text-sm font-bold text-white">Notificações do navegador</p>
              <p className="text-xs text-gray-400">Receba lembretes de quests mesmo com o app fechado</p>
            </div>
            <Switch
              disabled={isSubscribing}
              checked={permission === 'granted'}
              onCheckedChange={async (checked) => {
                await toggleNotifications(checked);
              }}
            />
          </div>
          <div className="flex items-center justify-between gap-4 py-2">
            <div>
              <p className="text-sm font-bold text-white">Energia infinita</p>
              <p className="text-xs text-gray-400">Desativa o custo de energia das tarefas</p>
            </div>
            <Switch
              checked={gameState.settings?.infiniteEnergy || false}
              onCheckedChange={(checked) => {
                setGameState(prev => ({ ...prev, settings: { ...prev.settings, infiniteEnergy: checked } }));
              }}
            />
          </div>
          <div className="flex items-center justify-between gap-4 py-2">
            <div>
              <p className="text-sm font-bold text-white">Dobrar cap de energia</p>
              <p className="text-xs text-gray-400">Aumenta o limite máximo de energia</p>
            </div>
            <Switch
              checked={gameState.settings?.doubleTaskEnergyCap || false}
              onCheckedChange={(checked) => {
                setGameState(prev => ({ ...prev, settings: { ...prev.settings, doubleTaskEnergyCap: checked } }));
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Restart Confirm Dialog */}
      <Dialog open={showRestartConfirm} onOpenChange={setShowRestartConfirm}>
        <DialogContent className="bg-[#1a1a2e] border-white/10 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-400">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              Reiniciar Jogo
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-gray-200">
              Isso vai apagar seu personagem e todo o progresso salvo neste dispositivo.
            </p>
            <p className="text-xs text-gray-500">
              Essa ação não pode ser desfeita.
            </p>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button
              onClick={() => setShowRestartConfirm(false)}
              className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                setShowRestartConfirm(false);
                restartGame();
              }}
              className="px-3 py-2 rounded-lg border border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 transition-colors text-sm text-orange-300"
            >
              Confirmar reinício
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
