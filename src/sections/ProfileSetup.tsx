import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Clock, 
  Target, 
  Zap, 
  Calendar,
  ChevronRight,
  Check,
  Sparkles
} from 'lucide-react';
import { useGame } from '@/context/GameContext';
import type { PlayerProfile } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface StepProps {
  title: string;
  description: string;
  children: React.ReactNode;
  step: number;
  totalSteps: number;
}

function Step({ title, description, children, step, totalSteps }: StepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="flex justify-center gap-2 mb-4">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors ${
                i < step ? 'bg-purple-500' : i === step ? 'bg-purple-400 animate-pulse' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
        <h2 className="text-2xl font-bold text-white font-cinzel">{title}</h2>
        <p className="text-gray-400 mt-2">{description}</p>
      </div>
      {children}
    </motion.div>
  );
}

export function ProfileSetup() {
  const { completeProfileSetup } = useGame();
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<Partial<PlayerProfile>>({
    dailyFreeHours: 4,
    workSchedule: 'flexible',
    energyLevel: 'medium',
    mainGoal: '',
    biggestDifficulty: '',
    habitToBuild: '',
    habitToEliminate: '',
    preferredQuestTime: 'evening',
    difficultyPreference: 'balanced',
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeProfileSetup(profile as PlayerProfile);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return profile.dailyFreeHours && profile.dailyFreeHours > 0;
      case 1:
        return profile.mainGoal?.trim() && profile.biggestDifficulty?.trim();
      case 2:
        return profile.habitToBuild?.trim() && profile.habitToEliminate?.trim();
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-dark p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="card-dungeon p-8 max-w-lg w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
            <Sparkles className="w-10 h-10 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-white font-cinzel">
            O Mestre da Disciplina
          </h1>
          <p className="text-gray-400 mt-2">
            Vou conhecer você para criar quests personalizadas
          </p>
        </div>

        {/* Steps */}
        {currentStep === 0 && (
          <Step title="Sua Rotina" description="Me conte sobre seu dia a dia" step={0} totalSteps={totalSteps}>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Quantas horas livres você tem por dia?
                </label>
                <Select
                  value={String(profile.dailyFreeHours)}
                  onValueChange={(v) => setProfile({ ...profile, dailyFreeHours: Number(v) })}
                >
                  <SelectTrigger className="bg-[#16213e] border-[#2d2d44] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a2e] border-[#2d2d44]">
                    <SelectItem value="1">1 hora</SelectItem>
                    <SelectItem value="2">2 horas</SelectItem>
                    <SelectItem value="3">3 horas</SelectItem>
                    <SelectItem value="4">4 horas</SelectItem>
                    <SelectItem value="5">5 horas</SelectItem>
                    <SelectItem value="6">6+ horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Sua situação atual?
                </label>
                <Select
                  value={profile.workSchedule}
                  onValueChange={(v) => setProfile({ ...profile, workSchedule: v as PlayerProfile['workSchedule'] })}
                >
                  <SelectTrigger className="bg-[#16213e] border-[#2d2d44] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a2e] border-[#2d2d44]">
                    <SelectItem value="fulltime">Trabalho tempo integral</SelectItem>
                    <SelectItem value="parttime">Trabalho meio período</SelectItem>
                    <SelectItem value="student">Estudante</SelectItem>
                    <SelectItem value="flexible">Horário flexível</SelectItem>
                    <SelectItem value="unemployed">Sem trabalho atualmente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Seu nível de energia médio?
                </label>
                <Select
                  value={profile.energyLevel}
                  onValueChange={(v) => setProfile({ ...profile, energyLevel: v as PlayerProfile['energyLevel'] })}
                >
                  <SelectTrigger className="bg-[#16213e] border-[#2d2d44] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a2e] border-[#2d2d44]">
                    <SelectItem value="low">Baixo - Cansado frequentemente</SelectItem>
                    <SelectItem value="medium">Médio - Energia variável</SelectItem>
                    <SelectItem value="high">Alto - Sempre energizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Step>
        )}

        {currentStep === 1 && (
          <Step title="Seus Objetivos" description="O que você quer alcançar?" step={1} totalSteps={totalSteps}>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Qual seu maior objetivo agora?
                </label>
                <Input
                  value={profile.mainGoal}
                  onChange={(e) => setProfile({ ...profile, mainGoal: e.target.value })}
                  placeholder="Ex: Passar em um concurso, emagrecer, aprender inglês..."
                  className="bg-[#16213e] border-[#2d2d44] text-white"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Qual sua maior dificuldade?
                </label>
                <Input
                  value={profile.biggestDifficulty}
                  onChange={(e) => setProfile({ ...profile, biggestDifficulty: e.target.value })}
                  placeholder="Ex: Procrastinação, falta de tempo, disciplina..."
                  className="bg-[#16213e] border-[#2d2d44] text-white"
                />
              </div>
            </div>
          </Step>
        )}

        {currentStep === 2 && (
          <Step title="Hábitos" description="Que hábitos você quer construir ou eliminar?" step={2} totalSteps={totalSteps}>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  Qual hábito você quer CONSTRUIR?
                </label>
                <Input
                  value={profile.habitToBuild}
                  onChange={(e) => setProfile({ ...profile, habitToBuild: e.target.value })}
                  placeholder="Ex: Ler todos os dias, meditar, exercício..."
                  className="bg-[#16213e] border-[#2d2d44] text-white"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                  <Zap className="w-4 h-4 text-red-400" />
                  Qual hábito você quer ELIMINAR?
                </label>
                <Input
                  value={profile.habitToEliminate}
                  onChange={(e) => setProfile({ ...profile, habitToEliminate: e.target.value })}
                  placeholder="Ex: Redes sociais excessivas, procrastinar..."
                  className="bg-[#16213e] border-[#2d2d44] text-white"
                />
              </div>
            </div>
          </Step>
        )}

        {currentStep === 3 && (
          <Step title="Preferências" description="Como você quer jogar?" step={3} totalSteps={totalSteps}>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Melhor horário para quests?
                </label>
                <Select
                  value={profile.preferredQuestTime}
                  onValueChange={(v) => setProfile({ ...profile, preferredQuestTime: v as PlayerProfile['preferredQuestTime'] })}
                >
                  <SelectTrigger className="bg-[#16213e] border-[#2d2d44] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a2e] border-[#2d2d44]">
                    <SelectItem value="morning">Manhã</SelectItem>
                    <SelectItem value="afternoon">Tarde</SelectItem>
                    <SelectItem value="evening">Noite</SelectItem>
                    <SelectItem value="night">Madrugada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Preferência de dificuldade?
                </label>
                <Select
                  value={profile.difficultyPreference}
                  onValueChange={(v) => setProfile({ ...profile, difficultyPreference: v as PlayerProfile['difficultyPreference'] })}
                >
                  <SelectTrigger className="bg-[#16213e] border-[#2d2d44] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a2e] border-[#2d2d44]">
                    <SelectItem value="easier">Mais fácil - Foco em consistência</SelectItem>
                    <SelectItem value="balanced">Equilibrado - Desafio justo</SelectItem>
                    <SelectItem value="challenging">Desafiador - Máximo crescimento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/30 mt-6">
                <p className="text-sm text-purple-300">
                  <Sparkles className="w-4 h-4 inline mr-2" />
                  O Mestre vai usar essas informações para criar quests realistas e sustentáveis para você.
                </p>
              </div>
            </div>
          </Step>
        )}

        {/* Navigation */}
        <div className="flex gap-4 mt-8">
          {currentStep > 0 && (
            <Button
              onClick={handleBack}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-400 hover:bg-gray-800"
            >
              Voltar
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
          >
            {currentStep === totalSteps - 1 ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Começar Jornada
              </>
            ) : (
              <>
                Próximo
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
