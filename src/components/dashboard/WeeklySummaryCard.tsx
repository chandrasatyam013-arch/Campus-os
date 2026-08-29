import React from 'react';
import { TrendingUp, TrendingDown, CheckCircle2, AlertTriangle, Calendar } from 'lucide-react';
import { WeeklyAcademicSummary } from '../../types'; interface WeeklySummaryCardProps { summary: WeeklyAcademicSummary; onNavigate: (route: string) => void;
} export const WeeklySummaryCard: React.FC<WeeklySummaryCardProps> = ({ summary, onNavigate }) => { const isUp = summary.attendanceDirection === 'UP';
  return (
    <div className="p-7 sm:p-8 rounded-[32px] bg-white border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-1">Weekly Velocity</p>
          <div className="flex items-center gap-2">
            <h4 className="text-lg font-bold text-black tracking-tight">Academic Snapshot</h4>
          </div>
        </div>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100 "> Last 7 Days
        </span>
      </div>

      <p className="text-xs font-semibold text-gray-700 mb-5 bg-gray-50 p-4 rounded-2xl border border-gray-100 leading-relaxed">
        {summary.highlightMessage}
      </p>

      {/* Grid of Key Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-5 text-center">
        <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 ">
          <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-gray-400 ">
            {isUp ? <TrendingUp className="w-3 h-3 text-emerald-600" /> : <TrendingDown className="w-3 h-3 text-amber-600" />}
            <span>Trend</span>
          </div>
          <p className={`text-base font-bold font-mono mt-1 ${isUp ? 'text-emerald-600' : 'text-amber-600'}`}>
            {summary.attendanceChangePercent > 0 ? `+${summary.attendanceChangePercent}%` : `${summary.attendanceChangePercent}%`}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 ">
          <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-gray-400 ">
            <CheckCircle2 className="w-3 h-3 text-black " />
            <span>Tasks Done</span>
          </div>
          <p className="text-base font-bold font-mono text-black mt-1">
            {summary.assignmentsCompletedCount}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 ">
          <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-gray-400 ">
            <Calendar className="w-3 h-3 text-gray-700 " />
            <span>Exams (14d)</span>
          </div>
          <p className="text-base font-bold font-mono text-black mt-1">
            {summary.upcomingExamsCount}
          </p>
        </div>
      </div>

      {/* Bullet Insights */}
      <div className="space-y-2">
        {summary.detailedPoints.map((point, idx) => (
          <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-500 ">
            <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0 mt-1.5" />
            <span className="leading-relaxed">{point}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
