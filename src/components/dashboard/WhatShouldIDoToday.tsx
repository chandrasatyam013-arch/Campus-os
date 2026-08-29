import React from 'react';
import { Sparkles, CalendarCheck2, CheckSquare, BookOpen, ArrowRight, ShieldAlert, GraduationCap
} from 'lucide-react';
import { DailyActionItem } from '../../types'; interface WhatShouldIDoTodayProps { items: DailyActionItem[]; onNavigate: (route: string) => void;
} export const WhatShouldIDoToday: React.FC<WhatShouldIDoTodayProps> = ({ items, onNavigate }) => { const getBadgeStyle = (color: DailyActionItem['badgeColor']) => { switch (color) { case 'red': return 'bg-rose-50 text-rose-700 border-rose-100'; case 'amber': return 'bg-amber-50 text-amber-700 border-amber-100'; case 'purple': return 'bg-purple-50 text-purple-700 border-purple-100'; case 'emerald': return 'bg-emerald-50 text-emerald-700 border-emerald-100'; case 'blue': default: return 'bg-gray-100 text-gray-800 border-gray-200 ';
    }
  };
  return (
    <div className="p-6 sm:p-7 rounded-[28px] mobile-glass-card relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-1">Action Engine</p>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-black tracking-tight">What should I do today?</h3>
            <span className="px-3 py-1 bg-black text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
              {items.length} Pending
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1"> Deterministic priority actions calculated from attendance buffers, deadlines, and weakest subjects.
          </p>
        </div>

        <button onClick={() => onNavigate('recommendations')} className="text-xs font-bold text-black hover:text-gray-600 :text-slate-300 items-center gap-1 hidden sm:flex transition-colors"
        >
          <span>All Insights</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Action Items List */}
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-100 ">
            <ShieldAlert className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-bold text-black ">All clear for today!</p>
            <p className="text-xs text-gray-400 mt-1"> Your attendance buffers are safe and no urgent assignment deadlines are pending.
            </p>
          </div>
        ) : ( items.map((item, idx) => (
            <div key={item.id} onClick={() => item.targetRoute && onNavigate(item.targetRoute.replace('/', ''))} className="p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 :bg-slate-700 border border-transparent hover:border-gray-200 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center font-bold text-xs text-black shadow-2xs shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-black group-hover:text-neutral-700 transition-colors">
                      {item.title}
                    </span>
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full border ${getBadgeStyle(item.badgeColor)}`}>
                      {item.badgeText}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200 ">
                <span className="text-xs font-bold text-black group-hover:underline flex items-center gap-1 transition-all"> Take action
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
