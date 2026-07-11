import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color: 'blue' | 'red' | 'green' | 'amber';
  delay?: number;
}

export default function StatCard({ title, value, icon: Icon, trend, trendUp, color, delay = 0 }: StatCardProps) {
  const colorMap = {
    blue: 'text-primary-500 bg-primary-50 dark:bg-primary-500/10 border-primary-100 dark:border-primary-500/20 stat-card-blue',
    red: 'text-emergency-500 bg-emergency-50 dark:bg-emergency-500/10 border-emergency-100 dark:border-emergency-500/20 stat-card-red',
    green: 'text-success-500 bg-success-50 dark:bg-success-500/10 border-success-100 dark:border-success-500/20 stat-card-green',
    amber: 'text-warning-500 bg-warning-50 dark:bg-warning-500/10 border-warning-100 dark:border-warning-500/20 stat-card-amber',
  };

  const IconBgMap = {
    blue: 'bg-primary-500',
    red: 'bg-emergency-500',
    green: 'bg-success-500',
    amber: 'bg-warning-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`card border p-6 flex flex-col justify-between h-full ${colorMap[color]}`}
    >
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <p className="text-sm font-medium text-dark-500 dark:text-dark-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-dark-900 dark:text-white">{value}</h3>
        </div>
        <div className={`p-3 rounded-2xl ${IconBgMap[color]} shadow-lg shadow-black/5`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      
      {trend && (
        <div className="flex items-center gap-2 mt-2 text-sm relative z-10">
          <span className={`font-semibold ${trendUp ? 'text-success-500' : 'text-emergency-500'}`}>
            {trend}
          </span>
          <span className="text-dark-400 dark:text-dark-500">vs last month</span>
        </div>
      )}
      
      {/* Decorative background shape */}
      <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full opacity-10 bg-current blur-2xl pointer-events-none" />
    </motion.div>
  );
}
