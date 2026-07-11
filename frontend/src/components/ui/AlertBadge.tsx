import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, Bell, CheckCircle } from 'lucide-react';
import type { AlertSeverity, AlertDirection } from '@/types/alert';

interface AlertBadgeProps {
  severity: AlertSeverity;
  direction?: AlertDirection;
  distance?: number;
  message: string;
}

export default function AlertBadge({ severity, direction, distance, message }: AlertBadgeProps) {
  if (severity === 'CLEAR') return null;

  const severityConfig = {
    CRITICAL: {
      bg: 'bg-emergency-600',
      text: 'text-white',
      border: 'border-emergency-500',
      shadow: 'shadow-neon-red',
      icon: AlertTriangle,
      animation: 'animate-pulse-emergency',
    },
    WARNING: {
      bg: 'bg-warning-500',
      text: 'text-white',
      border: 'border-warning-400',
      shadow: 'shadow-lg shadow-warning-500/30',
      icon: Bell,
      animation: 'animate-bounce-gentle',
    },
    INFO: {
      bg: 'bg-primary-500',
      text: 'text-white',
      border: 'border-primary-400',
      shadow: 'shadow-neon-blue',
      icon: Info,
      animation: '',
    },
  };

  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col md:flex-row items-center gap-4 p-4 md:px-6 md:py-4 rounded-2xl border ${config.bg} ${config.text} ${config.border} ${config.shadow} ${config.animation}`}
      >
        <div className="p-3 bg-white/20 rounded-full backdrop-blur-md shrink-0">
          <Icon className="w-8 h-8" />
        </div>
        
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <span className="text-sm font-bold uppercase tracking-wider opacity-90">
            {severity} ALERT
          </span>
          <span className="text-xl md:text-2xl font-black tracking-tight leading-tight">
            {message}
          </span>
        </div>

        {distance && direction && (
          <div className="flex items-center gap-3 px-4 py-2 bg-black/20 rounded-xl ml-0 md:ml-4 border border-white/10 shrink-0">
            <div className="flex flex-col items-center">
              <span className="text-xs uppercase opacity-80 font-semibold">Distance</span>
              <span className="text-xl font-bold font-mono">{Math.round(distance)}m</span>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="flex flex-col items-center">
              <span className="text-xs uppercase opacity-80 font-semibold">Direction</span>
              <span className="text-lg font-bold">{direction}</span>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
