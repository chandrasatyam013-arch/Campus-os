import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { LandingPage } from './views/LandingPage';
import { LoginPage } from './views/LoginPage';
import { RegisterPage } from './views/RegisterPage';
import { ForgotPasswordPage } from './views/ForgotPasswordPage';
import { ResetPasswordPage } from './views/ResetPasswordPage';
import { Navbar } from './components/layout/Navbar';
import { MobileHeader } from './components/layout/MobileHeader';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { CommandPalette } from './components/layout/CommandPalette';
import { DashboardView } from './views/DashboardView';
import { AttendanceView } from './views/AttendanceView';
import { MarksView } from './views/MarksView';
import { AcademicView } from './views/AcademicView';
import { AssignmentsView } from './views/AssignmentsView';
import { TimetableView } from './views/TimetableView';
import { CalendarView } from './views/CalendarView';
import { RecommendationsView } from './views/RecommendationsView';
import { SubjectsView } from './views/SubjectsView';
import { SettingsView } from './views/SettingsView';
import { AIChatView } from './views/AIChatView';
import { CareerView } from './views/CareerView';

import { X, BookOpen, Clock, Calendar, LineChart, Settings, Bot, Compass, GraduationCap, CheckSquare } from 'lucide-react';
import { App as CapacitorApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

const MainAppContent: React.FC = () => {
  const { user, loading, exchangeTokenForCookie } = useAuth();
  const [authView, setAuthView] = useState<'landing' | 'login' | 'register' | 'forgot-password' | 'reset-password'>('landing');
  const [currentRoute, setCurrentRoute] = useState('dashboard');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [showMobileMoreMenu, setShowMobileMoreMenu] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Capacitor App URL Open Listener (Deep Links)
    let urlListener: any = null;
    if (Capacitor.isNativePlatform()) {
      urlListener = CapacitorApp.addListener('appUrlOpen', async (event) => {
        const slug = event.url.split('campusos://').pop();
        if (slug && slug.startsWith('auth?token=')) {
          const token = slug.split('token=')[1];
          if (token) {
            try {
              // Close the OAuth browser
              await Browser.close();
              // Exchange the token for a secure HTTP-only cookie
              await exchangeTokenForCookie(token);
            } catch (err) {
              console.error('Failed to exchange token for cookie:', err);
            }
          }
        }
      });
    }

    // Check if we are on Web and have a reset token in the URL
    if (!Capacitor.isNativePlatform()) {
      const urlParams = new URLSearchParams(window.location.search);
      if (window.location.pathname === '/reset-password' || urlParams.has('token')) {
        setAuthView('reset-password');
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (urlListener) {
        urlListener.then((l: any) => l.remove());
      }
    };
  }, [exchangeTokenForCookie]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-gray-500 font-mono tracking-tight">Initializing Campus OS...</p>
      </div>
    );
  }

  // Unauthenticated Views
  if (!user) {
    if (authView === 'login') {
      return (
        <LoginPage
          onNavigateToRegister={() => setAuthView('register')}
          onNavigateToLanding={() => setAuthView('landing')}
          onNavigateToForgotPassword={() => setAuthView('forgot-password')}
        />
      );
    }
    if (authView === 'register') {
      return (
        <RegisterPage
          onNavigateToLogin={() => setAuthView('login')}
          onNavigateToLanding={() => setAuthView('landing')}
        />
      );
    }
    if (authView === 'forgot-password') {
      return (
        <ForgotPasswordPage onNavigateToLogin={() => setAuthView('login')} />
      );
    }
    if (authView === 'reset-password') {
      return (
        <ResetPasswordPage onNavigateToLogin={() => {
          // Clear URL if on web to avoid re-triggering reset view
          if (!Capacitor.isNativePlatform() && window.history.replaceState) {
            window.history.replaceState({}, document.title, '/');
          }
          setAuthView('login');
        }} />
      );
    }
    return (
      <LandingPage
        onNavigateToAuth={(mode) => setAuthView(mode)}
      />
    );
  }

  // Authenticated Main Layout
  const renderCurrentView = () => {
    switch (currentRoute) {
      case 'dashboard':
        return <DashboardView onNavigate={setCurrentRoute} />;
      case 'attendance':
        return <AttendanceView />;
      case 'marks':
        return <MarksView />;
      case 'analytics':
        return <AcademicView onNavigate={setCurrentRoute} />;
      case 'assignments':
        return <AssignmentsView />;
      case 'timetable':
        return <TimetableView />;
      case 'calendar':
        return <CalendarView />;
      case 'recommendations':
        return <RecommendationsView onNavigate={setCurrentRoute} />;
      case 'academic':
        return <AcademicView onNavigate={setCurrentRoute} />;
      case 'subjects':
        return <SubjectsView />;
      case 'settings':
        return <SettingsView />;
      case 'ai-chat':
        return <AIChatView />;
      case 'career':
        return <CareerView />;
      default:
        return <DashboardView onNavigate={setCurrentRoute} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 flex flex-col selection:bg-black selection:text-white antialiased font-sans">
      {/* Offline Indicator Overlay */}
      {isOffline && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm p-6 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
            <X className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">You are offline</h2>
          <p className="text-sm text-gray-500 max-w-sm">
            Campus OS requires an active internet connection to securely synchronize your academic data. Reconnect to continue.
          </p>
        </div>
      )}

      {/* Top Navbar (Desktop) */}
      <div className="hidden md:block">
        <Navbar
          currentRoute={currentRoute}
          onNavigate={setCurrentRoute}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />
      </div>

      {/* Mobile Header */}
      <MobileHeader 
        currentRoute={currentRoute}
        onNavigate={setCurrentRoute}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar
          currentRoute={currentRoute}
          onNavigate={setCurrentRoute}
        />

        {/* View Content Area */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-8">
          {renderCurrentView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        currentRoute={currentRoute}
        onNavigate={setCurrentRoute}
        onOpenMoreMenu={() => setShowMobileMoreMenu(true)}
      />

      {/* Mobile More Sheet / Drawer */}
      {showMobileMoreMenu && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm md:hidden">
          <div className="w-full bg-white border-t border-gray-100 rounded-t-[32px] p-6 space-y-4 shadow-2xl animate-in slide-in-from-bottom-full duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                Additional Modules
              </span>
              <button
                onClick={() => setShowMobileMoreMenu(false)}
                className="p-1 text-gray-400 hover:text-black rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'marks', label: 'Marks & Grades', icon: BookOpen },
                { id: 'assignments', label: 'Assignments', icon: CheckSquare },
                { id: 'academic', label: 'Academic', icon: GraduationCap },
                { id: 'timetable', label: 'Timetable', icon: Clock },
                { id: 'analytics', label: 'Analytics & SGPA', icon: LineChart },
                { id: 'calendar', label: 'Academic Calendar', icon: Calendar },
                { id: 'subjects', label: 'Subjects', icon: BookOpen },
                { id: 'settings', label: 'Settings', icon: Settings },
                { id: 'ai-chat', label: 'AI Chat', icon: Bot },
                { id: 'career', label: 'Career Roadmap', icon: Compass }
              ].map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentRoute(item.id);
                      setShowMobileMoreMenu(false);
                    }}
                    className={`p-3.5 rounded-2xl border flex items-center gap-3 text-left transition-all ${
                      currentRoute === item.id
                        ? 'bg-black text-white border-black'
                        : 'bg-gray-50 border-gray-100 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-semibold">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={setCurrentRoute}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <MainAppContent />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
