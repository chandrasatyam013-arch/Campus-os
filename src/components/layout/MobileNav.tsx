import React from 'react';
import { LayoutDashboard, CalendarCheck2, CheckSquare, Sparkles, MoreHorizontal
} from 'lucide-react'; interface MobileNavProps { currentRoute: string; onNavigate: (route: string) => void; onOpenMoreMenu: () => void;
} export const MobileNav: React.FC<MobileNavProps> = ({ currentRoute, onNavigate, onOpenMoreMenu
}) => { const tabs = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck2 },
    { id: 'academic', label: 'Academic', icon: Sparkles },
    { id: 'career', label: 'Roadmap', icon: Sparkles }
  ];
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 mobile-glass-nav px-3 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] flex items-center justify-around transition-colors">
      {tabs.map(tab => { const Icon = tab.icon;
  const isActive = currentRoute === tab.id;
  return (
          <button key={tab.id} onClick={() => onNavigate(tab.id)} className={`relative flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all duration-300 ${ isActive ? 'text-black dark:text-white font-bold bg-black/5 dark:bg-white/10' : 'text-gray-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110 text-black dark:text-white' : ''}`} />
            <span className="text-[10px] mt-1 tracking-tight">{tab.label}</span>
          </button>
        );
      })}

      {/* More / Menu Button */}
      <button onClick={onOpenMoreMenu} className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl text-gray-400 hover:text-black "
      >
        <MoreHorizontal className="w-5 h-5" />
        <span className="text-[10px] mt-1">More</span>
      </button>
    </nav>
  );
};
