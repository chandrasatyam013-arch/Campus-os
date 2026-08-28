import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, MapPin, User, Calendar, Layers, ChevronRight
} from 'lucide-react';
import { TimetableEntry, Subject, DayOfWeek } from '../types';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { CreateTimetableModal } from '../components/timetable/CreateTimetableModal';
  const DAYS: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']; export const TimetableView: React.FC = () => { const [subjects, setSubjects] = useState<Subject[]>([]);
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('MONDAY');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const loadData = async () => { setLoading(true);
  try { const [subs, slots] = await Promise.all([ api.getSubjects(), api.getTimetable()
      ]);
  setSubjects(subs);
  setEntries(slots);

      // Auto-select today's day of week
  const dayIndex = new Date().getDay(); // 0 is Sunday
  const dayMap: Record<number, DayOfWeek> = { 1: 'MONDAY', 2: 'TUESDAY', 3: 'WEDNESDAY', 4: 'THURSDAY', 5: 'FRIDAY', 6: 'SATURDAY', 0: 'SUNDAY'
      };
  if (dayMap[dayIndex]) setSelectedDay(dayMap[dayIndex]);
    }
  catch (err: any) { toast.error('Failed to load timetable', err.message);
    }
  finally { setLoading(false);
    }
  };
  useEffect(() => { loadData();
  }, []);
  const handleDelete = async (id: string) => { if (!confirm('Are you sure you want to remove this timetable slot?')) return;
  try { await api.deleteTimetableEntry(id);
  toast.success('Timetable slot removed'); loadData();
    }
  catch (err: any) { toast.error('Failed to delete', err.message);
    }
  };
  const getSubject = (subId: string) => { return subjects.find(s => s.id === subId);
  };
  const currentDayEntries = entries
    .filter(e => e.day === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  if (loading) { return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-400 font-medium">Loading weekly class schedule...</p>
      </div>
    );
  };
  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-1">Class Schedule</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-black tracking-tight">Weekly Timetable Schedule</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1"> Organize recurring lectures, lab sessions, and classroom assignments.
          </p>
        </div>

        <button onClick={() => setShowCreateModal(true)} className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-full shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Class Slot</span>
        </button>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex overflow-x-auto rounded-full bg-white p-1.5 border border-gray-100 shadow-2xs gap-1 scrollbar-thin">
        {DAYS.map(d => { const count = entries.filter(e => e.day === d).length;
  const isActive = selectedDay === d;
  return (
            <button key={d} onClick={() => setSelectedDay(d)} className={`flex-1 min-w-[100px] py-2.5 px-3 rounded-full text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${ isActive
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-500 hover:text-black hover:bg-gray-50 :bg-slate-800 '
              }`}
            >
              <span>{d}</span>
              <span className={`text-[10px] px-2 py-0.2 rounded-full font-mono ${ isActive ? 'bg-neutral-800 text-gray-300' : 'bg-gray-100 text-gray-500 '
              }`}>
                {count} {count === 1 ? 'class' : 'classes'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Schedule for Selected Day */}
      <div className="space-y-3">
        {currentDayEntries.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-[32px] border border-gray-100 shadow-sm">
            <Clock className="w-10 h-10 text-gray-400 mx-auto mb-2 opacity-75" />
            <h3 className="text-base font-bold text-black ">No classes scheduled for {selectedDay}</h3>
            <p className="text-xs text-gray-400 mt-1">Use "Add Class Slot" to map recurring lectures for this day.</p>
          </div>
        ) : ( currentDayEntries.map((slot, idx) => { const sub = getSubject(slot.subjectId);
  return (
              <div key={slot.id} className="p-5 sm:p-6 rounded-2xl bg-white border border-gray-100 hover:border-gray-300 shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center justify-center w-24 p-3 rounded-2xl bg-gray-50 border border-gray-100 shrink-0 text-center font-mono">
                    <span className="text-xs font-bold text-black ">{slot.startTime}</span>
                    <span className="text-[10px] text-gray-400 ">to</span>
                    <span className="text-xs font-bold text-gray-700 ">{slot.endTime}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: sub?.color || '#6366f1' }}
                      />
                      <h3 className="text-sm font-bold text-black ">{sub?.name || 'Subject'}</h3>
                      <span className="text-[10px] font-mono text-gray-400 font-medium">({sub?.code})</span>
                      <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-gray-100 text-gray-700 border border-gray-200 ">
                        {slot.classType}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
                      {slot.room && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-600 " />
                          <span>Room: {slot.room}</span>
                        </span>
                      )}
                      {slot.instructor && (
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-gray-600 " />
                          <span>Faculty: {slot.instructor}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button onClick={() => handleDelete(slot.id)} className="p-1.5 text-gray-400 hover:text-rose-600 rounded-full hover:bg-gray-100 :bg-slate-700 transition-colors" title="Delete slot"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateTimetableModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} subjects={subjects} onSuccess={loadData}
        />
      )}
    </div>
  );
};
