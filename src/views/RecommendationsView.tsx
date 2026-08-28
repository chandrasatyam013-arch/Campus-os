import React, { useState, useEffect } from 'react';
import { Sparkles, CalendarCheck2, CheckSquare, BookOpen, GraduationCap, ArrowRight, Filter, Flame, CheckCircle2, Clock
} from 'lucide-react';
import { ActionRecommendation } from '../types';
import { api } from '../lib/api'; interface RecommendationsViewProps { onNavigate: (route: string) => void;
} export const RecommendationsView: React.FC<RecommendationsViewProps> = ({ onNavigate }) => { const [recommendations, setRecommendations] = useState<ActionRecommendation[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState(true); useEffect(() => { api.getRecommendations().then(res => { setRecommendations(res || []);
  setLoading(false);
    }).catch(err => { console.error(err);
  setLoading(false);
    });
  }, []);
  if (loading) { return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Executing deterministic action formulas...</p>
      </div>
    );
  };
  const filtered = filterCategory === 'ALL'
    ? recommendations
    : recommendations.filter(r => r.category === filterCategory);
  const getCategoryIcon = (cat: ActionRecommendation['category']) => { switch (cat) { case 'ATTENDANCE': return <CalendarCheck2 className="w-5 h-5 text-gray-800 " />; case 'ASSIGNMENT': return <CheckSquare className="w-5 h-5 text-gray-800 " />; case 'ACADEMIC': return <BookOpen className="w-5 h-5 text-gray-800 " />; case 'EXAM_PREP': return <GraduationCap className="w-5 h-5 text-gray-800 " />; case 'SCHEDULE': default: return <Clock className="w-5 h-5 text-gray-800 " />;
    }
  };
  const getPriorityBadge = (priority: ActionRecommendation['priority']) => { switch (priority) { case 'CRITICAL': return 'bg-rose-50 text-rose-700 border-rose-100'; case 'HIGH': return 'bg-amber-50 text-amber-700 border-amber-100'; case 'MEDIUM': return 'bg-sky-50 text-sky-700 border-sky-100'; case 'LOW': default: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    }
  };
  const handleAction = (rec: ActionRecommendation) => { switch (rec.category) { case 'ATTENDANCE': onNavigate('attendance'); break; case 'ASSIGNMENT': onNavigate('assignments'); break; case 'ACADEMIC': onNavigate('marks'); break; case 'EXAM_PREP': onNavigate('calendar'); break; case 'SCHEDULE': default: onNavigate('timetable'); break;
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await api.dismissRecommendation(id);
      setRecommendations(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      console.error('Failed to dismiss recommendation', err);
    }
  };
  if (loading) { return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-400 font-medium">Executing deterministic action formulas...</p>
      </div>
    );
  };
  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-1">Decision Engine</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-black tracking-tight">Smart Action Recommendations</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1"> Deterministic priority matrix weighted by urgency score, buffer risk, and deadlines.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-800 text-xs font-semibold shadow-2xs">
          <Flame className="w-4 h-4 text-amber-600" />
          <span>{recommendations.length} Active Triggers</span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-full bg-white border border-gray-100 shadow-2xs">
        {[
          { id: 'ALL', label: 'All Insights' },
          { id: 'ATTENDANCE', label: 'Attendance Risk' },
          { id: 'ASSIGNMENT', label: 'Task Deadlines' },
          { id: 'ACADEMIC', label: 'Subject Remediation' },
          { id: 'EXAM_PREP', label: 'Exam Prep' }
        ].map(tab => (
          <button key={tab.id} onClick={() => setFilterCategory(tab.id)} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${ filterCategory === tab.id
                ? 'bg-black text-white shadow-sm'
                : 'text-gray-500 hover:text-black hover:bg-gray-50 :bg-slate-800 '
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Recommendations Feed */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-[32px] border border-gray-100 shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2 opacity-75" />
            <h3 className="text-base font-bold text-black ">No active warnings in this category!</h3>
            <p className="text-xs text-gray-400 mt-1">Your academic parameters are fully balanced.</p>
          </div>
        ) : ( filtered.map(rec => (
            <div key={rec.id} className="p-6 sm:p-7 rounded-[32px] bg-white border border-gray-100 shadow-sm hover:border-gray-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              <div className="flex items-start gap-4">
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 shrink-0">
                  {getCategoryIcon(rec.category)}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-black ">{rec.title}</h3>
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full border ${getPriorityBadge(rec.priority)}`}>
                      {rec.priority}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400 "> Score: {rec.urgencyScore}/100
                    </span>
                    {rec.subjectName && (
                      <span className="text-[10px] font-semibold text-gray-500 ">
                        • {rec.subjectName}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed max-w-2xl">
                    {rec.reason}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end shrink-0 gap-2">
                <button onClick={() => handleDismiss(rec.id)} className="w-full md:w-auto px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-full shadow-sm transition-all"
                >
                  Dismiss
                </button>
                <button onClick={() => handleAction(rec)} className="w-full md:w-auto px-5 py-2.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-full shadow-sm transition-all flex items-center justify-center gap-2 group"
                >
                  <span>{rec.action}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
