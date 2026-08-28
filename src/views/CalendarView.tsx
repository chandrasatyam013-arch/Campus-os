import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, Trash2, MapPin, Clock, Filter, GraduationCap, Sparkles, BookOpen
} from 'lucide-react';
import { AcademicEvent, Subject, EventType } from '../types';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { CreateEventModal } from '../components/calendar/CreateEventModal'; export const CalendarView: React.FC = () => { const [subjects, setSubjects] = useState<Subject[]>([]);
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const loadData = async () => { setLoading(true);
  try { const [subs, evts] = await Promise.all([ api.getSubjects(), api.getEvents()
      ]);
  setSubjects(subs);
  setEvents(evts);
    }
  catch (err: any) { toast.error('Failed to load events', err.message);
    }
  finally { setLoading(false);
    }
  };
  useEffect(() => { loadData();
  }, []);
  const handleDelete = async (id: string) => { if (!confirm('Are you sure you want to delete this event?')) return;
  try { await api.deleteEvent(id);
  toast.success('Event deleted'); loadData();
    }
  catch (err: any) { toast.error('Failed to delete', err.message);
    }
  };
  const getSubject = (subId?: string) => { if (!subId) return null;
  return subjects.find(s => s.id === subId);
  };
  const getCategoryBadge = (type: EventType) => { switch (type) { case 'EXAM': return 'bg-rose-50 text-rose-700 border-rose-100'; case 'CT': return 'bg-amber-50 text-amber-700 border-amber-100'; case 'ASSIGNMENT': return 'bg-purple-50 text-purple-700 border-purple-100'; case 'PROJECT': return 'bg-sky-50 text-sky-700 border-sky-100'; case 'HOLIDAY': return 'bg-emerald-50 text-emerald-700 border-emerald-100'; default: return 'bg-gray-100 text-gray-700 border-gray-200 ';
    }
  };
  const filteredEvents = events.filter(e => { if (filterType !== 'ALL' && e.type !== filterType) return false;
  return true;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  if (loading) { return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-400 font-medium">Loading academic calendar events...</p>
      </div>
    );
  };
  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-1">Important Dates</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-black tracking-tight">Academic Calendar & Milestones</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1"> Exams, continuous assessments, hackathons, and institutional deadlines.
          </p>
        </div>

        <button onClick={() => setShowCreateModal(true)} className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-full shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Academic Event</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-full bg-white border border-gray-100 shadow-2xs">
        {['ALL', 'EXAM', 'CT', 'ASSIGNMENT', 'PROJECT', 'HOLIDAY', 'OTHER'].map(cat => (
          <button key={cat} onClick={() => setFilterType(cat)} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${ filterType === cat
                ? 'bg-black text-white shadow-sm'
                : 'text-gray-500 hover:text-black hover:bg-gray-50 :bg-slate-800 '
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-[32px] border border-gray-100 shadow-sm">
            <CalendarIcon className="w-10 h-10 text-gray-400 mx-auto mb-2 opacity-75" />
            <h3 className="text-base font-bold text-black ">No academic events found</h3>
            <p className="text-xs text-gray-400 mt-1">Schedule exams, CT dates, or project submission milestones.</p>
          </div>
        ) : ( filteredEvents.map(evt => { const sub = getSubject(evt.subjectId);
  const evtDate = new Date(evt.date);
  const isUpcoming = evtDate.getTime() >= Date.now();
  return (
              <div key={evt.id} className="p-5 sm:p-6 rounded-2xl bg-white border border-gray-100 hover:border-gray-300 shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  {/* Date Box */}
                  <div className="w-16 p-2 rounded-2xl bg-gray-50 border border-gray-100 text-center shrink-0">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">
                      {evtDate.toLocaleDateString(undefined, { month: 'short' })}
                    </span>
                    <span className="text-xl font-bold font-mono text-black block">
                      {evtDate.getDate()}
                    </span>
                    <span className="text-[9px] text-gray-400 font-mono block">
                      {evtDate.toLocaleDateString(undefined, { weekday: 'short' })}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-black ">{evt.title}</h3>
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getCategoryBadge(evt.type)}`}>
                        {evt.type}
                      </span>
                      {sub && (
                        <span className="px-2.5 py-0.5 text-[10px] font-semibold rounded-full border" style={{ backgroundColor: `${sub.color}15`, borderColor: `${sub.color}35`, color: sub.color
                          }}
                        >
                          {sub.code}
                        </span>
                      )}
                    </div>

                    {evt.description && (
                      <p className="text-xs text-gray-500 leading-relaxed max-w-xl">
                        {evt.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-400 pt-1">
                      {evt.startTime && (
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5 text-gray-400 " />
                          <span>{evt.startTime} {evt.endTime ? `- ${evt.endTime}` : ''}</span>
                        </span>
                      )}
                      {evt.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 " />
                          <span>{evt.location}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button onClick={() => handleDelete(evt.id)} className="p-1.5 text-gray-400 hover:text-rose-600 rounded-full hover:bg-gray-100 :bg-slate-700 transition-colors" title="Delete event"
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
        <CreateEventModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} subjects={subjects} onSuccess={loadData}
        />
      )}
    </div>
  );
};
