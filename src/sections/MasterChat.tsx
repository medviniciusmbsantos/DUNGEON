import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, User, Bot, Plus, Check, X, Edit3, Target, BookOpen, Dumbbell, Briefcase, Heart, Lightbulb, FolderOpen } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Quest, FocusTag } from '@/types/game';

interface MasterChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const focusIcons: Record<string, React.ElementType> = {
  estudos: BookOpen,
  trabalho: Briefcase,
  saude: Heart,
  fitness: Dumbbell,
  leitura: BookOpen,
  produtividade: Target,
  criatividade: Lightbulb,
  organizacao: FolderOpen,
};

const focusLabels: Record<string, string> = {
  estudos: '📚 Estudos',
  trabalho: '💼 Trabalho',
  saude: '❤️ Saúde',
  fitness: '💪 Fitness',
  leitura: '📖 Leitura',
  produtividade: '🎯 Produtividade',
  criatividade: '💡 Criatividade',
  organizacao: '📂 Organização',
};

export function MasterChat({ isOpen, onClose }: MasterChatProps) {
  const { gameState, sendChatMessage, acceptSuggestedQuest, addQuest, setFocusTag } = useGame();
  const { chatHistory, playerProfile } = gameState;
  const [input, setInput] = useState('');
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [showFocusSelector, setShowFocusSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendChatMessage(input);
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  const handleAcceptQuest = (quest: Quest) => {
    acceptSuggestedQuest(quest);
    sendChatMessage('Quest aceita! Obrigado, Mestre!');
  };

  const handleAdjustQuest = (quest: Quest) => {
    setEditingQuest(quest);
  };

  const saveAdjustedQuest = (adjusted: Quest) => {
    addQuest(adjusted);
    setEditingQuest(null);
    sendChatMessage('Quest ajustada e adicionada!');
  };

  const handleSetFocus = (tag: FocusTag) => {
    setFocusTag(tag);
    setShowFocusSelector(false);
    sendChatMessage(`Quero focar em ${tag}.`);
  };

  const quickSuggestions = [
    'Gerar novas quests',
    'Análise do meu progresso',
    'Quero focar em estudos',
    'Preciso de ajuda',
  ];

  const focusOptions: Exclude<FocusTag, null>[] = ['estudos', 'trabalho', 'saude', 'fitness', 'leitura', 'produtividade', 'criatividade', 'organizacao'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a2e] border-[#2d2d44] text-white max-w-2xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b border-[#2d2d44]">
          <DialogTitle className="font-cinzel text-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p>Mestre da Disciplina</p>
              <p className="text-xs text-gray-400 font-normal">Seu mentor estratégico</p>
            </div>
            {playerProfile.activeFocusTag && (
              <div className="ml-auto px-3 py-1 bg-orange-500/20 rounded-full text-xs text-orange-400 flex items-center gap-1">
                <Target className="w-3 h-3" />
                Foco: {focusLabels[playerProfile.activeFocusTag]?.split(' ')[1]}
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatHistory.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Olá! Sou o Mestre da Disciplina.</p>
              <p className="text-sm mt-2">Posso ajudar você a:</p>
              <ul className="text-sm mt-2 space-y-1">
                <li>• Criar quests personalizadas</li>
                <li>• Analisar seu progresso</li>
                <li>• Dar dicas de produtividade</li>
                <li>• Ajustar dificuldade</li>
                <li>• Definir foco de atividades</li>
              </ul>
            </div>
          )}

          <AnimatePresence>
            {chatHistory.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'flex gap-3',
                  msg.role === 'player' ? 'flex-row-reverse' : ''
                )}
              >
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                  msg.role === 'player' ? 'bg-purple-500/20' : 'bg-cyan-500/20'
                )}>
                  {msg.role === 'player' ? (
                    <User className="w-4 h-4 text-purple-400" />
                  ) : (
                    <Bot className="w-4 h-4 text-cyan-400" />
                  )}
                </div>
                <div className={cn(
                  'max-w-[80%] rounded-lg p-3',
                  msg.role === 'player' 
                    ? 'bg-purple-500/20 text-white' 
                    : 'bg-[#16213e] text-gray-200'
                )}>
                  <p className="text-sm whitespace-pre-line">{msg.content}</p>
                  
                  {/* Quest Suggestion Actions */}
                  {msg.suggestedQuest && msg.actions && (
                    <div className="mt-3 flex gap-2 flex-wrap">
                      <Button
                        onClick={() => handleAcceptQuest(msg.suggestedQuest!)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Aceitar
                      </Button>
                      <Button
                        onClick={() => handleAdjustQuest(msg.suggestedQuest!)}
                        size="sm"
                        variant="outline"
                        className="border-yellow-500 text-yellow-400"
                      >
                        <Edit3 className="w-3 h-3 mr-1" />
                        Ajustar
                      </Button>
                      <Button
                        onClick={() => sendChatMessage('Não, obrigado')}
                        size="sm"
                        variant="outline"
                        className="border-red-500 text-red-400"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Recusar
                      </Button>
                    </div>
                  )}

                  {/* Quick Actions */}
                  {msg.actions && !msg.suggestedQuest && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {msg.actions.map((action, idx) => (
                        <Button
                          key={idx}
                          onClick={() => {
                            if (action.type === 'generate') {
                              sendChatMessage('Gerar novas quests');
                            }
                          }}
                          size="sm"
                          variant="outline"
                          className="text-xs"
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Focus Selector */}
        {showFocusSelector && (
          <div className="px-4 py-2 border-t border-[#2d2d44] bg-[#16213e]/50">
            <p className="text-sm text-gray-400 mb-2">Escolha seu foco:</p>
            <div className="grid grid-cols-2 gap-2">
              {focusOptions.map((tag) => {
                const Icon = focusIcons[tag] || Target;
                return (
                  <button
                    key={tag}
                    onClick={() => handleSetFocus(tag)}
                    className="flex items-center gap-2 px-3 py-2 bg-[#1a1a2e] hover:bg-[#2d2d44] rounded-lg text-sm text-gray-300 transition-colors text-left"
                  >
                    <Icon className="w-4 h-4 text-purple-400" />
                    {focusLabels[tag]}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Suggestions */}
        <div className="px-4 py-2 border-t border-[#2d2d44]">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setShowFocusSelector(!showFocusSelector)}
              className="px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 rounded-full text-xs text-orange-400 whitespace-nowrap transition-colors flex items-center gap-1"
            >
              <Target className="w-3 h-3" />
              {playerProfile.activeFocusTag ? 'Mudar Foco' : 'Definir Foco'}
            </button>
            {quickSuggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => {
                  setInput(suggestion);
                  sendChatMessage(suggestion);
                  setInput('');
                }}
                className="px-3 py-1.5 bg-[#16213e] hover:bg-[#1e2a4a] rounded-full text-xs text-gray-300 whitespace-nowrap transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[#2d2d44]">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="bg-[#16213e] border-[#2d2d44] text-white"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Quest Edit Dialog */}
        <Dialog open={!!editingQuest} onOpenChange={() => setEditingQuest(null)}>
          <DialogContent className="bg-[#1a1a2e] border-[#2d2d44] text-white max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-cinzel">Ajustar Quest</DialogTitle>
            </DialogHeader>
            {editingQuest && (
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm text-gray-400">Título</label>
                  <Input
                    value={editingQuest.title}
                    onChange={(e) => setEditingQuest({ ...editingQuest, title: e.target.value })}
                    className="bg-[#16213e] border-[#2d2d44] text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Descrição</label>
                  <Input
                    value={editingQuest.description}
                    onChange={(e) => setEditingQuest({ ...editingQuest, description: e.target.value })}
                    className="bg-[#16213e] border-[#2d2d44] text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Dificuldade</label>
                  <select
                    value={editingQuest.difficulty}
                    onChange={(e) => setEditingQuest({ ...editingQuest, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                    className="w-full bg-[#16213e] border border-[#2d2d44] rounded-md p-2 text-white"
                  >
                    <option value="easy">🟢 Fácil</option>
                    <option value="medium">🔵 Médio</option>
                    <option value="hard">🟣 Difícil</option>
                  </select>
                </div>
                <Button
                  onClick={() => saveAdjustedQuest(editingQuest)}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Quest
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
