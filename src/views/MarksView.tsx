import React, { useState, useEffect } from 'react';
import { GraduationCap, Plus, Calculator, Trash2, TrendingUp, Award, BookOpen, Filter, CheckCircle2
} from 'lucide-react';
import { Mark, Subject, SubjectPerformanceAnalytics } from '../types';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { LogMarkModal } from '../components/marks/LogMarkModal';
import { SGPACalculatorModal } from '../components/marks/SGPACalculatorModal'; export const MarksView: React.FC = () => { const [subjects, setSubjects] = useState<Subject[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [performances, setPerformances] = useState<SubjectPerformanceAnalytics[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('ALL');
  const [showLogModal, setShowLogModal] = useState(false);
  const [showSGPAModal, setShowSGPAModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const loadData = async () => { setLoading(true);
  try { const [subs, marksData, dash] = await Promise.all([ api.getSubjects(), api.getMarks(), api.getDashboard()
      ]);
  setSubjects(subs);
  setMarks(marksData);
  setPerformances(dash.academicPerformance?.subjects || []);
    }
  catch (err: any) { toast.error('Failed to load marks data', err.message);
    }
  finally { setLoading(false);
    }
  };
  useEffect(() => { loadData();
  }, []);
  const handleDeleteMark = async (id: string) => { if (!confirm('Are you sure you want to delete this assessment record?')) return;
  try { await api.deleteMark(id);
  toast.success('Assessment record deleted'); loadData();
    }
  catch (err: any) { toast.error('Failed to delete', err.message);
    }
  };
  const getSubjectName = (subId: string) => { const s = subjects.find(sub => sub.id === subId);
  return s ? `${s.name} (${s.code})` : 'Unknown Subject';
  };
  const getSubjectColor = (subId: string) => { return subjects.find(sub => sub.id === subId)?.color || '#6366f1';
  };
  const filteredMarks = selectedSubjectId === 'ALL'
    ? marks
    : marks.filter(m => m.subjectId === selectedSubjectId);
  if (loading) { return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-400 font-medium">Computing academic performance models...</p>
      </div>
    );
  };
  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-1">Academic Scores</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-black tracking-tight">Marks & Academic Performance</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1"> Track continuous assessments, midterm exams, grade projections, and SGPA trajectories.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button onClick={() => setShowSGPAModal(true)} className="px-4 py-2.5 bg-white hover:bg-gray-50 :bg-slate-800 text-black border border-gray-200 hover:border-gray-300 font-bold text-xs rounded-full shadow-2xs transition-all flex items-center gap-2"
          >
            <Calculator className="w-3.5 h-3.5 text-gray-700 " />
            <span>SGPA / CGPA Simulator</span>
          </button>

          <button onClick={() => setShowLogModal(true)} className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-full shadow-sm transition-all flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Assessment Marks</span>
          </button>
        </div>
      </div>

      {/* Subject Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {performances.map(perf => (
          <div key={perf.subjectId} className="p-7 rounded-[32px] bg-white border border-gray-100 shadow-sm flex flex-col justify-between space-y-5"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: perf.color }} />
                  <div>
                    <h3 className="text-sm font-bold text-black ">{perf.subjectName}</h3>
                    <span className="text-[10px] font-mono text-gray-400 font-medium">{perf.subjectCode} • {perf.credits} Credits</span>
                  </div>
                </div>

                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full font-mono border ${ perf.trend === 'IMPROVING'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    : perf.trend === 'DECLINING'
                    ? 'bg-rose-50 text-rose-700 border-rose-100'
                    : 'bg-gray-100 text-gray-700 border-gray-200 '
                }`}>
                  {perf.trend}
                </span>
              </div>

              {/* Marks Stat */}
              <div className="mt-5 flex items-baseline justify-between">
                <div className="text-4xl font-bold font-mono text-black ">
                  {perf.averagePercentage > 0 ? `${perf.averagePercentage}%` : '—'}
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-black block font-mono"> Grade Pt: {perf.gradePointEstimate || 8}/10
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {perf.assessmentsCount} assessments
                  </span>
                </div>
              </div>
            </div>

            {/* Assessment Progress Bar */}
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-black" style={{ width: `${Math.min(100, perf.averagePercentage)}%` }}
              />
            </div>

            <div className="text-xs text-gray-500 pt-2 border-t border-gray-100 flex items-center justify-between">
              <span>Status</span>
              <span className="font-semibold text-gray-900 ">
                {perf.isWeakSubject ? 'Focus needed' : 'On track'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Assessment Scores Table */}
      <div className="p-7 sm:p-8 rounded-[32px] bg-white border border-gray-100 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-1">Assessment Records</p>
            <h3 className="text-xl font-bold text-black tracking-tight">Assessment History</h3>
            <p className="text-xs text-gray-400 mt-0.5"> Verified scores for continuous assessments, lab assignments, and term tests.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-gray-400 " />
            <select value={selectedSubjectId} onChange={e => setSelectedSubjectId(e.target.value)} className="px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-800 font-medium focus:outline-none focus:border-black"
            >
              <option value="ALL">All Subjects</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white ">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 uppercase tracking-[0.15em] font-bold text-[10px]">
              <tr>
                <th className="p-4">Subject</th>
                <th className="p-4">Assessment Name</th>
                <th className="p-4">Type</th>
                <th className="p-4">Score</th>
                <th className="p-4">Percentage</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMarks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400 "> No assessment records found. Click "Log Assessment Marks" to add your test scores.
                  </td>
                </tr>
              ) : ( filteredMarks.map(m => { const pct = ((m.obtainedMarks / m.maximumMarks) * 100).toFixed(1);
  return (
                    <tr key={m.id} className="hover:bg-gray-50 :bg-slate-800 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: getSubjectColor(m.subjectId) }}
                          />
                          <span className="font-bold text-gray-900 ">{getSubjectName(m.subjectId)}</span>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-gray-800 ">
                        {m.assessmentName}
                      </td>
                      <td className="p-4 font-mono text-[11px] text-gray-500 font-medium">
                        {m.assessmentType}
                      </td>
                      <td className="p-4 font-mono font-bold text-black ">
                        {m.obtainedMarks} / {m.maximumMarks}
                      </td>
                      <td className="p-4">
                        <span className={`font-mono font-bold px-2.5 py-0.5 rounded-full text-[11px] border ${ Number(pct) >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : Number(pct) >= 60 ? 'bg-gray-100 text-gray-800 border-gray-200 ' : 'bg-rose-50 text-rose-700 border-rose-100'
                        }`}>
                          {pct}%
                        </span>
                      </td>
                      <td className="p-4 font-mono text-gray-500 ">
                        {new Date(m.date).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDeleteMark(m.id)} className="p-1.5 text-gray-400 hover:text-rose-600 rounded-full hover:bg-gray-100 :bg-slate-700 transition-colors" title="Delete mark"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showLogModal && (
        <LogMarkModal isOpen={showLogModal} onClose={() => setShowLogModal(false)} subjects={subjects} onSuccess={loadData}
        />
      )}

      {showSGPAModal && (
        <SGPACalculatorModal isOpen={showSGPAModal} onClose={() => setShowSGPAModal(false)} performances={performances}
        />
      )}
    </div>
  );
};
