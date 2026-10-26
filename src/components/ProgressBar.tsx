import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max: number;
  type?: 'hp' | 'xp' | 'boss' | 'energy' | 'default';
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  label?: string;
  className?: string;
}

export function ProgressBar({
  value,
  max,
  type = 'default',
  size = 'md',
  showValue = true,
  label,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
  };
  
  const fillClasses = {
    hp: 'hp-bar-fill',
    xp: 'xp-bar-fill',
    boss: 'boss-hp-fill',
    energy: 'energy-bar-fill',
    default: 'bg-gradient-purple',
  };
  
  const textColors = {
    hp: percentage < 30 ? 'text-red-400' : percentage < 60 ? 'text-yellow-400' : 'text-green-400',
    xp: 'text-purple-400',
    boss: 'text-red-400',
    energy: 'text-yellow-500 font-black',
    default: 'text-purple-400',
  };

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label && (
            <span className="text-sm font-medium text-gray-300">{label}</span>
          )}
          {showValue && (
            <span className={cn('text-sm font-mono font-bold', textColors[type])}>
              {Math.round(value)} / {max}
            </span>
          )}
        </div>
      )}
      <div className={cn('progress-bar-bg', sizeClasses[size])}>
        <motion.div
          className={cn('progress-bar-fill', fillClasses[type])}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
