import React, { useState, useEffect } from 'react';
import { Compass, Search, Moon, Sun, Bell, LogOut, Sparkles, User as UserIcon, ShieldCheck, Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { AppNotification } from '../../types';
import { api } from '../../lib/api'; interface NavbarProps { currentRoute: string; onNavigate: (route: string) => void; onOpenCommandPalette: () => void;
} export const Navbar: React.FC<NavbarProps> = ({ currentRoute, onNavigate, onOpenCommandPalette
}) => { const { user, isDemo, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false); useEffect(() => { if (user) { api.getNotifications()
        .then(setNotifications)
        .catch(err => console.error('Failed to load notifications:', err));
    }
  }, [user]);
  const unreadCount = notifications.filter(n => !n.read).length;
  const handleDismiss = async (id: string, e: React.MouseEvent) => { e.stopPropagation();
  try { await api.dismissNotification(id);
  setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }
  catch (err) { console.error('Failed to dismiss:', err);
    }
  };
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-6 md:px-10 bg-white backdrop-blur-md border-b border-gray-100 ">
      {/* Left: Brand + Demo Badge */}
      <div className="flex items-center gap-4">
        <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-3 group text-left focus:outline-none"
        >
          <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <div className="w-3.5 h-3.5 bg-white rotate-45 rounded-[2px]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-black text-lg uppercase">CAMPUS OS</span>
              {isDemo && (
                <span className="px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-gray-100 text-gray-600 rounded-full border border-gray-200 "> Demo
                </span>
              )}
            </div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-gray-400 font-semibold hidden sm:block">Academic Workspace</p>
          </div>
        </button>
      </div>

      {/* Middle: Quick Search Trigger */}
      <div className="flex-1 max-w-md mx-6 hidden md:block">
        <button onClick={onOpenCommandPalette} className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-gray-400 bg-gray-50 hover:bg-gray-100 :bg-slate-700 border border-gray-100 rounded-full transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-3.5 h-3.5 text-gray-400 group-hover:text-black transition-colors" />
            <span className="text-gray-400 group-hover:text-gray-600 :text-slate-300 ">Search database, subjects, tasks...</span>
          </div>
          <kbd className="px-2 py-0.5 text-[10px] font-mono bg-white text-gray-500 rounded-full border border-gray-200 shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Search button for mobile */}
        <button onClick={onOpenCommandPalette} className="md:hidden p-2.5 text-gray-500 hover:text-black rounded-full hover:bg-gray-50 :bg-slate-800 transition-colors" aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>


        {/* Notifications Popover */}
        <div className="relative">
          <button onClick={() => { setShowNotifications(!showNotifications);
  setShowUserMenu(false);
            }} className="relative p-2.5 text-gray-500 hover:text-black rounded-full hover:bg-gray-50 :bg-slate-800 transition-colors" aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-black rounded-full ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-gray-100 rounded-[24px] shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50 ">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-black " />
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 ">Notifications</h4>
                </div>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-black text-white rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-400 "> No active notifications.
                  </div>
                ) : ( notifications.map(n => (
                    <div key={n.id} onClick={() => { if (n.link) onNavigate(n.link.replace('/', ''));
  setShowNotifications(false);
                      }} className={`p-4 text-xs hover:bg-gray-50 :bg-slate-800 cursor-pointer transition-colors flex items-start justify-between gap-3 ${
                        !n.read ? 'bg-gray-50 ' : ''
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
                          <p className="font-semibold text-gray-900 ">{n.title}</p>
                        </div>
                        <p className="text-gray-500 mt-1 text-[11px] leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1.5 font-mono">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {!n.read && (
                        <button onClick={(e) => handleDismiss(n.id, e)} title="Mark as read" className="text-gray-400 hover:text-black p-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button onClick={() => { setShowUserMenu(!showUserMenu);
  setShowNotifications(false);
            }} className="flex items-center gap-2.5 pl-2.5 pr-2 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 :bg-slate-700 border border-gray-100 transition-all text-left"
          >
            <div className="w-7 h-7 rounded-full bg-black text-white font-bold text-xs flex items-center justify-center uppercase">
              {user?.name ? user.name[0] : 'S'}
            </div>
            <div className="hidden sm:block text-left pr-1">
              <p className="text-xs font-bold text-gray-900 truncate max-w-[100px]">{user?.name || 'Student'}</p>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-3 w-60 bg-white border border-gray-100 rounded-[24px] shadow-2xl overflow-hidden z-50 p-2">
              <div className="p-3.5 border-b border-gray-100 ">
                <p className="text-xs font-bold text-gray-900 truncate">{user?.name}</p>
                <p className="text-[11px] text-gray-400 truncate mt-0.5">{user?.email}</p>
                {isDemo && (
                  <div className="mt-2 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full w-fit">
                    <ShieldCheck className="w-3 h-3 text-black " />
                    <span>Demo Mode</span>
                  </div>
                )}
              </div>

              <div className="pt-2 space-y-1">
                <button onClick={() => { onNavigate('settings');
  setShowUserMenu(false);
                  }} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:text-black hover:bg-gray-50 :bg-slate-800 rounded-xl transition-colors text-left"
                >
                  <UserIcon className="w-4 h-4 text-gray-400 " />
                  <span>Profile & Settings</span>
                </button>
                <button onClick={() => { onNavigate('recommendations');
  setShowUserMenu(false);
                  }} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:text-black hover:bg-gray-50 :bg-slate-800 rounded-xl transition-colors text-left"
                >
                  <Sparkles className="w-4 h-4 text-black " />
                  <span>Action Recommendations</span>
                </button>
                <div className="my-1 border-t border-gray-100 " />
                <button onClick={() => { logout();
  setShowUserMenu(false);
                  }} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
