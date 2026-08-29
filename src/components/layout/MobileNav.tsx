import React from 'react';
import { Home, Compass, GraduationCap, CheckSquare, MoreHorizontal } from 'lucide-react';

interface MobileNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onMoreClick: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentRoute, onNavigate, onMoreClick }) => {
  const mainNavItems = [
    { id: 'dashboard', label: 'Overview', icon: Home },
    { id: 'attendance', label: 'Attendance', icon: CheckSquare },
    { id: 'analytics', label: 'Academic', icon: GraduationCap },
    { id: 'recommendations', label: 'Roadmap', icon: Compass },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-safe px-4 pb-4">
      <nav className="pointer-events-auto bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-[32px] overflow-hidden flex justify-around items-center h-[68px] px-2">
        {mainNavItems.map((item) => {
          const isActive = currentRoute === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="relative flex flex-col items-center justify-center w-16 h-full focus:outline-none transition-all duration-200"
            >
              {isActive && (
                <span className="absolute inset-0 bg-gray-900/5 rounded-2xl m-1" />
              )}
              <Icon 
                className={`w-[22px] h-[22px] transition-colors duration-200 relative z-10 ${
                  isActive ? 'text-black' : 'text-gray-400'
                }`} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span 
                className={`text-[10px] mt-1 relative z-10 transition-colors duration-200 ${
                  isActive ? 'font-bold text-black' : 'font-medium text-gray-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
        <button
          onClick={onMoreClick}
          className="relative flex flex-col items-center justify-center w-16 h-full focus:outline-none transition-all duration-200"
        >
          <MoreHorizontal className="w-[22px] h-[22px] text-gray-400 relative z-10" strokeWidth={2} />
          <span className="text-[10px] mt-1 font-medium text-gray-400 relative z-10">More</span>
        </button>
      </nav>
    </div>
  );
};
