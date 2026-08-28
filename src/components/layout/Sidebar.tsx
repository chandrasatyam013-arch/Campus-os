import React from 'react';
import { LayoutDashboard, CalendarCheck2, GraduationCap, LineChart, CheckSquare, Clock, Calendar, Sparkles, BookOpen, Settings, ShieldAlert, Bot, Compass
} from 'lucide-react'; interface SidebarProps { currentRoute: string; onNavigate: (route: string) => void; riskCount?: number; pendingTasksCount?: number;
} export const Sidebar: React.FC<SidebarProps> = ({ currentRoute, onNavigate, riskCount = 0, pendingTasksCount = 0
}) => { const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, badge: null
    },
    { id: 'attendance', label: 'Attendance Intel', icon: CalendarCheck2, badge: riskCount > 0 ? { count: riskCount, color: 'bg-rose-50 text-rose-700 border-rose-200' } : null
    },
    { id: 'marks', label: 'Marks & SGPA', icon: GraduationCap, badge: null
    },
    { id: 'analytics', label: 'Analytics', icon: LineChart, badge: null
    },
    { id: 'assignments', label: 'Assignments', icon: CheckSquare, badge: pendingTasksCount > 0 ? { count: pendingTasksCount, color: 'bg-black text-white' } : null
    },
    { id: 'timetable', label: 'Timetable', icon: Clock, badge: null
    },
    { id: 'calendar', label: 'Academic Calendar', icon: Calendar, badge: null
    },
    { id: 'recommendations', label: 'Action Engine', icon: Sparkles, badge: { count: 'AI', color: 'bg-gray-100 text-gray-700 border-gray-200 ' }
    },
    { id: 'subjects', label: 'Subjects', icon: BookOpen, badge: null
    },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null
    },
    { id: 'ai-chat', label: 'AI Chat', icon: Bot, badge: { count: 'New', color: 'bg-black text-white border-black' }
    },
    { id: 'career', label: 'Career Roadmap', icon: Compass, badge: { count: 'Hot', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
    }
  ];
  return (
    <aside className="w-64 bg-white border-r border-gray-100 p-4 hidden md:flex flex-col justify-between shrink-0 select-none">
      <div className="space-y-1">
        <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 "> Core Workspace
        </p>

        {navItems.map(item => { const Icon = item.icon;
  const isActive = currentRoute === item.id;
  return (
            <button key={item.id} onClick={() => onNavigate(item.id)} className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all group text-left ${ isActive
                  ? 'bg-gray-50 text-black shadow-2xs font-bold'
                  : 'text-gray-400 hover:text-black hover:bg-gray-50 :bg-slate-800 '
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-105 ${isActive ? 'text-black ' : 'text-gray-400 group-hover:text-black '}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${item.badge.color}`}
                >
                  {item.badge.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info Card */}
      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs text-gray-500 space-y-1.5">
        <div className="flex items-center gap-2 text-black font-bold text-[10px] uppercase tracking-wider">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Deterministic Formula</span>
        </div>
        <p className="leading-relaxed text-[11px] text-gray-400 "> Real-time safe absence buffer algorithms and SGPA target simulations.
        </p>
      </div>
    </aside>
  );
};
