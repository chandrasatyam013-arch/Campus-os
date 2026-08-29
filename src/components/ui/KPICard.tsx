import React from 'react';
import { LucideIcon } from 'lucide-react'; interface KPICardProps { title: string; value: string | number; subtitle?: string; icon: LucideIcon; color: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky'; badge?: { text: string; type: 'safe' | 'warning' | 'danger' | 'info';
  }; onClick?: () => void;
} export const KPICard: React.FC<KPICardProps> = ({ title, value, subtitle, icon: Icon, color, badge, onClick
}) => { const badgeMap = { safe: 'bg-emerald-50 text-emerald-600 border border-emerald-100', warning: 'bg-amber-50 text-amber-600 border border-amber-100', danger: 'bg-rose-50 text-rose-600 border border-rose-100', info: 'bg-gray-100 text-gray-700 border border-gray-200 '
  };
  return (
    <div onClick={onClick} className={`mobile-glass-card p-6 sm:p-7 rounded-[28px] flex flex-col justify-between transition-all duration-300 ${ onClick ? 'cursor-pointer hover:border-white/60 dark:hover:border-slate-600 hover:shadow-lg' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-gray-400 text-[10px] uppercase tracking-[0.15em] font-bold">
          {title}
        </span>
        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 border border-gray-100 ">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-2">
        <div className="text-4xl sm:text-5xl font-bold tracking-tighter text-black ">
          {value}
        </div>
        {badge && (
          <span className={`px-3 py-1 text-xs font-bold rounded-full ${badgeMap[badge.type]}`}>
            {badge.text}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-gray-400 mt-4 flex items-center gap-1 font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
};
