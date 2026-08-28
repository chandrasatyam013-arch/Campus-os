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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-gray-100 px-3 py-2 flex items-center justify-around pb-safe">
      {tabs.map(tab => { const Icon = tab.icon;
  const isActive = currentRoute === tab.id;
  return (
          <button key={tab.id} onClick={() => onNavigate(tab.id)} className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all ${ isActive ? 'text-black font-bold' : 'text-gray-400 hover:text-black '
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'scale-105 text-black ' : ''}`} />
            <span className="text-[10px] mt-1">{tab.label}</span>
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
