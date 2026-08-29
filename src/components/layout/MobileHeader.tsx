import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Bell, LogOut, Check } from 'lucide-react';
import { AppNotification } from '../../types';
import { api } from '../../lib/api';

interface MobileHeaderProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ currentRoute, onNavigate }) => {
  const { user, logout, isDemo } = useAuth();
  const [showMenu, setShowMenu] = React.useState(false);

  const getPageTitle = (route: string) => {
    switch(route) {
      case 'dashboard': return 'Overview';
      case 'attendance': return 'Attendance';
      case 'marks': return 'Marks & SGPA';
      case 'analytics': return 'Analytics';
      case 'assignments': return 'Assignments';
      case 'timetable': return 'Timetable';
      case 'calendar': return 'Calendar';
      case 'recommendations': return 'Action Engine';
      case 'subjects': return 'Subjects';
      case 'settings': return 'Settings';
      case 'ai-chat': return 'AI Assistant';
      case 'career': return 'Career Roadmap';
      default: return 'Campus OS';
    }
  };

  return (
    <header className="md:hidden sticky top-0 z-30 mobile-glass-header px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shadow-sm overflow-hidden">
          <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm tracking-tight text-black">{getPageTitle(currentRoute)}</span>
          {isDemo && (
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Demo Mode</span>
          )}
        </div>
      </div>
      
      <div className="relative">
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold text-xs"
        >
          {user?.name?.charAt(0) || <User className="w-4 h-4" />}
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="p-3 border-b border-gray-50">
              <p className="text-xs font-bold text-black truncate">{user?.name}</p>
              <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => {
                setShowMenu(false);
                logout();
              }}
              className="w-full text-left px-4 py-3 text-xs text-red-600 hover:bg-red-50 font-semibold flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
