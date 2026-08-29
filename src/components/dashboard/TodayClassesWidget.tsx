import React from 'react';
import { Clock, MapPin, User, ChevronRight } from 'lucide-react'; interface TodayClassesWidgetProps { dayOfWeek: string; dateFormatted: string; classes: Array<{ id: string; subjectName: string; subjectCode: string; color: string; startTime: string; endTime: string; room?: string; instructor?: string; isNext?: boolean;
  }>; onNavigate: (route: string) => void;
} export const TodayClassesWidget: React.FC<TodayClassesWidgetProps> = ({ dayOfWeek, dateFormatted, classes, onNavigate
}) => { return (
    <div className="p-6 sm:p-7 rounded-[28px] mobile-glass-card">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-1">Daily Schedule</p>
          <div className="flex items-center gap-2">
            <h4 className="text-lg font-bold text-black tracking-tight">Today's Classes</h4>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{dayOfWeek} • {dateFormatted}</p>
        </div>
        <button onClick={() => onNavigate('timetable')} className="text-xs text-black hover:text-gray-600 :text-slate-300 font-bold flex items-center gap-0.5 transition-colors"
        >
          <span>Full Week</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-3">
        {classes.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400 bg-gray-50 rounded-2xl border border-gray-100 "> No classes scheduled for today. Time for deep focus study!
          </div>
        ) : ( classes.map(c => (
            <div key={c.id} className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${ c.isNext
                  ? 'bg-gray-50 border-gray-300 shadow-2xs'
                  : 'bg-white border-gray-100 hover:border-gray-200 '
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-2.5 h-10 rounded-full shrink-0" style={{ backgroundColor: c.color }}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-black ">{c.subjectName}</span>
                    <span className="text-[10px] font-mono text-gray-400 font-semibold">({c.subjectCode})</span>
                    {c.isNext && (
                      <span className="px-2 py-0.5 text-[9px] font-bold bg-black text-white rounded-full"> NEXT
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-gray-400 " />
                      {c.startTime} - {c.endTime}
                    </span>
                    {c.room && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400 " />
                        {c.room}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {c.instructor && (
                <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400 font-medium">
                  <User className="w-3 h-3 text-gray-400 " />
                  <span className="truncate max-w-[120px]">{c.instructor}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
