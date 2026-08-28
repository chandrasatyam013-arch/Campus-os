import React, { useState, useEffect, useRef } from 'react';
import { Search, BookOpen, CheckSquare, Calendar, Compass, ArrowRight, Calculator, Clock, Sparkles, Settings, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Subject, Assignment } from '../../types';
import { api } from '../../lib/api'; interface CommandPaletteProps { isOpen: boolean; onClose: () => void; onNavigate: (route: string) => void;
} export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate
}) => { const [query, setQuery] = useState('');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const inputRef = useRef<HTMLInputElement>(null); useEffect(() => { if (isOpen) { setTimeout(() => inputRef.current?.focus(), 50); api.getSubjects().then(setSubjects).catch(() => {}); api.getAssignments().then(setAssignments).catch(() => {});
    }
  else { setQuery('');
    }
  }, [isOpen]); useEffect(() => { const handleKeyDown = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault();
  if (isOpen) onClose(); else {
          // Trigger open via parent or window event
        }
      };
  if (e.key === 'Escape' && isOpen) { onClose();
      }
    }; window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  const quickNav = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: Compass, category: 'Navigation' },
    { id: 'attendance', label: 'Attendance Intelligence & Simulator', icon: Calculator, category: 'Navigation' },
    { id: 'marks', label: 'Marks, Grades & SGPA', icon: BookOpen, category: 'Navigation' },
    { id: 'analytics', label: 'Academic Performance Analytics', icon: Sparkles, category: 'Navigation' },
    { id: 'assignments', label: 'Assignment Manager', icon: CheckSquare, category: 'Navigation' },
    { id: 'timetable', label: 'Weekly Timetable', icon: Clock, category: 'Navigation' },
    { id: 'calendar', label: 'Academic Calendar', icon: Calendar, category: 'Navigation' },
    { id: 'recommendations', label: 'What Should I Do Today Engine', icon: Sparkles, category: 'Navigation' },
    { id: 'settings', label: 'Preferences & Data Settings', icon: Settings, category: 'Navigation' }
  ];
  const filteredNav = quickNav.filter(n => n.label.toLowerCase().includes(query.toLowerCase()));
  const filteredSubjects = subjects.filter(s => s.name.toLowerCase().includes(query.toLowerCase()) || s.code.toLowerCase().includes(query.toLowerCase())
  );
  const filteredAssignments = assignments.filter(a => a.title.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24">
        {/* Backdrop */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div initial={{ opacity: 0, scale: 0.96, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: -10 }} className="relative w-full max-w-xl bg-white border border-gray-100 rounded-[28px] shadow-2xl overflow-hidden z-10"
        >
          {/* Input Header */}
          <div className="flex items-center px-5 py-4 border-b border-gray-100 bg-white ">
            <Search className="w-4 h-4 text-gray-400 mr-3" />
            <input ref={inputRef} type="text" placeholder="Search subjects, actions, assignments, or pages..." value={query} onChange={e => setQuery(e.target.value)} className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
            />
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-black rounded-full">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results List */}
          <div className="max-h-96 overflow-y-auto p-3 space-y-4">
            {/* Quick Navigation */}
            {filteredNav.length > 0 && (
              <div>
                <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ">Pages</p>
                <div className="space-y-1 mt-1">
                  {filteredNav.map(item => { const Icon = item.icon;
  return (
                      <button key={item.id} onClick={() => { onNavigate(item.id); onClose();
                        }} className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-gray-800 hover:bg-gray-50 :bg-slate-800 rounded-2xl transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 text-gray-400 group-hover:text-black " />
                          <span>{item.label}</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-black group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Subjects */}
            {filteredSubjects.length > 0 && (
              <div>
                <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ">Subjects</p>
                <div className="space-y-1 mt-1">
                  {filteredSubjects.map(sub => (
                    <button key={sub.id} onClick={() => { onNavigate('attendance'); onClose();
                      }} className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-gray-800 hover:bg-gray-50 :bg-slate-800 rounded-2xl transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sub.color }} />
                        <span className="font-semibold">{sub.name}</span>
                        <span className="text-[10px] text-gray-400 font-mono">({sub.code})</span>
                      </div>
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">View Intel</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Assignments */}
            {filteredAssignments.length > 0 && (
              <div>
                <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ">Assignments</p>
                <div className="space-y-1 mt-1">
                  {filteredAssignments.slice(0, 4).map(a => (
                    <button key={a.id} onClick={() => { onNavigate('assignments'); onClose();
                      }} className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-gray-800 hover:bg-gray-50 :bg-slate-800 rounded-2xl transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckSquare className="w-3.5 h-3.5 text-black " />
                        <span className="truncate max-w-[280px] font-medium">{a.title}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {new Date(a.deadline).toLocaleDateString()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filteredNav.length === 0 && filteredSubjects.length === 0 && filteredAssignments.length === 0 && (
              <div className="py-8 text-center text-xs text-gray-400 "> No matching academic items found for "{query}".
              </div>
            )}
          </div>

          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-[11px] text-gray-400 flex items-center justify-between">
            <span>Clean Search Engine</span>
            <span>ESC to dismiss</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
