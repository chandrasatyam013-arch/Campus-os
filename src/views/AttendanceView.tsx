import React, { useState, useEffect } from 'react';
import { CalendarCheck2, Calculator, Plus, Trash2, Check, X, ShieldAlert, AlertTriangle, CheckCircle2, Calendar, Filter
} from 'lucide-react';
import { AttendanceRecord, Subject, SubjectAttendanceIntelligence } from '../types';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { AttendanceSimulatorModal } from '../components/attendance/AttendanceSimulatorModal';
import { LogAttendanceModal } from '../components/attendance/LogAttendanceModal'; export const AttendanceView: React.FC = () => { const [subjects, setSubjects] = useState<Subject[]>([]);
  const [intelList, setIntelList] = useState<SubjectAttendanceIntelligence[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('ALL');
  const [simulatorSubject, setSimulatorSubject] = useState<SubjectAttendanceIntelligence | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const loadData = async () => { setLoading(true);
  try { const [subs, attLogs, dash] = await Promise.all([ api.getSubjects(), api.getAttendance(), api.getDashboard()
      ]);
  setSubjects(subs);
  setRecords(attLogs);
  setIntelList(dash.overallAttendance.subjects || []);
    }
  catch (err: any) { toast.error('Failed to load attendance records', err.message);
    }
  finally { setLoading(false);
    }
  };
  useEffect(() => { loadData();
  }, []);
  const handleDeleteRecord = async (id: string) => { if (!confirm('Are you sure you want to delete this attendance log?')) return;
  try { await api.deleteAttendance(id);
  toast.success('Attendance record removed'); loadData();
    }
  catch (err: any) { toast.error('Failed to delete', err.message);
    }
  };
  const filteredRecords = selectedSubjectId === 'ALL'
    ? records
    : records.filter(r => r.subjectId === selectedSubjectId);
  const getSubjectName = (subId: string) => { const s = subjects.find(sub => sub.id === subId);
  return s ? `${s.name} (${s.code})` : 'Unknown Subject';
  };
  const getSubjectColor = (subId: string) => { return subjects.find(sub => sub.id === subId)?.color || '#6366f1';
  };
  if (loading) { return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-400 font-medium">Computing attendance formulas...</p>
      </div>
    );
  };
  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-1">Attendance Intel</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-black tracking-tight">Attendance Intelligence</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1"> Deterministic safe absence buffers, target projections, and granular session records.
          </p>
        </div>

        <button onClick={() => setShowLogModal(true)} className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-full shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Class Attendance</span>
        </button>
      </div>

      {/* Intelligence Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {intelList.map(intel => { const isSafe = intel.riskLevel === 'SAFE';
  const isWatch = intel.riskLevel === 'WATCH';
  return (
            <div key={intel.subjectId} className="p-7 rounded-[32px] bg-white border border-gray-100 shadow-sm flex flex-col justify-between space-y-5"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: intel.color }} />
                    <div>
                      <h3 className="text-sm font-bold text-black ">{intel.subjectName}</h3>
                      <span className="text-[10px] font-mono text-gray-400 font-medium">{intel.subjectCode}</span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${ isSafe
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : isWatch
                      ? 'bg-amber-50 text-amber-700 border-amber-100'
                      : 'bg-rose-50 text-rose-700 border-rose-100'
                  }`}>
                    {intel.riskLevel}
                  </span>
                </div>

                {/* Percentage Big Stat & Progress */}
                {intel.attendancePercentage === null ? (
                  <div className="mt-5 py-4 flex flex-col items-center justify-center bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                    <span className="text-sm font-bold text-gray-500">No attendance data yet</span>
                  </div>
                ) : (
                  <>
                    <div className="mt-5 flex items-baseline justify-between">
                      <div className="text-4xl font-bold font-mono text-black ">
                        {intel.attendancePercentage}%
                      </div>
                      <span className="text-xs font-mono text-gray-400 ">
                        {intel.attendedClasses} / {intel.totalClasses} attended
                      </span>
                    </div>

                    <div className="mt-3 w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${ isSafe ? 'bg-emerald-500' : isWatch ? 'bg-amber-500' : 'bg-rose-500'
                        }`} style={{ width: `${Math.min(100, intel.attendancePercentage)}%` }}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Mathematical Metrics Table */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs space-y-2">
                <div className="flex items-center justify-between text-gray-600 ">
                  <span>Target ({intel.targetPercentage}%):</span>
                  <span className={`font-mono font-bold ${intel.classesNeededForTarget > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {intel.classesNeededForTarget > 0 ? `+${intel.classesNeededForTarget} to reach` : 'Achieved'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-gray-600 ">
                  <span>Safe Misses (Min {intel.minimumRequiredPercentage}%):</span>
                  <span className={`font-mono font-bold ${intel.classesCanMiss > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {intel.classesCanMiss} classes
                  </span>
                </div>

                {intel.attendancePercentage !== null && (
                  <div className="flex items-center justify-between text-gray-600 pt-1 border-t border-gray-100">
                    <span title="If you attend the next class">Proj. (Attend Next):</span>
                    <span className="font-mono font-bold text-indigo-600">{intel.projectedIfAttendNext}%</span>
                  </div>
                )}
                
                {intel.attendancePercentage !== null && (
                  <div className="flex items-center justify-between text-gray-600">
                    <span title="If you miss the next class">Proj. (Miss Next):</span>
                    <span className="font-mono font-bold text-rose-600">{intel.projectedIfMissNext}%</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1">
                <p className="text-[11px] text-gray-400 italic">
                  {intel.attendancePercentage === null ? 'Start by logging a class' : intel.classesCanMiss > 1 ? 'Healthy buffer' : 'Attend next classes'}
                </p>

                <button onClick={() => setSimulatorSubject(intel)} className="px-3 py-1.5 text-xs font-bold text-black hover:bg-gray-100 :bg-slate-700 bg-gray-50 border border-gray-200 rounded-full flex items-center gap-1.5 transition-colors"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Simulate</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recorded Attendance History */}
      <div className="p-7 sm:p-8 rounded-[32px] bg-white border border-gray-100 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-1">Session Archives</p>
            <h3 className="text-xl font-bold text-black tracking-tight">Attendance Logs & History</h3>
            <p className="text-xs text-gray-400 mt-0.5"> Chronological log of verified class sessions with type and notes.
            </p>
          </div>

          {/* Filter by Subject */}
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

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white ">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 uppercase tracking-[0.15em] font-bold text-[10px]">
              <tr>
                <th className="p-4">Subject</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">Type</th>
                <th className="p-4">Notes</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400 "> No attendance records found. Click "Log Class Attendance" to start recording sessions.
                  </td>
                </tr>
              ) : ( filteredRecords.map(rec => (
                  <tr key={rec.id} className="hover:bg-gray-50 :bg-slate-800 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: getSubjectColor(rec.subjectId) }}
                        />
                        <span className="font-bold text-gray-900 ">{getSubjectName(rec.subjectId)}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-gray-600 ">
                      {new Date(rec.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="p-4">
                      {rec.status === 'PRESENT' && (
                        <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1 w-fit">
                          <Check className="w-3 h-3" />
                          <span>Present</span>
                        </span>
                      )}
                      {rec.status === 'ABSENT' && (
                        <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-100 flex items-center gap-1 w-fit">
                          <X className="w-3 h-3" />
                          <span>Absent</span>
                        </span>
                      )}
                      {rec.status === 'EXCUSED' && (
                        <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-100 flex items-center gap-1 w-fit">
                          <ShieldAlert className="w-3 h-3" />
                          <span>Excused</span>
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-mono text-[11px] text-gray-500 font-medium">
                      {rec.classType}
                    </td>
                    <td className="p-4 text-gray-500 max-w-xs truncate">
                      {rec.notes || '—'}
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDeleteRecord(rec.id)} className="p-1.5 text-gray-400 hover:text-rose-600 rounded-full hover:bg-gray-100 :bg-slate-700 transition-colors" title="Delete log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simulator Modal */}
      {simulatorSubject && (
        <AttendanceSimulatorModal isOpen={!!simulatorSubject} onClose={() => setSimulatorSubject(null)} subjectIntel={simulatorSubject}
        />
      )}

      {/* Log Attendance Modal */}
      {showLogModal && (
        <LogAttendanceModal isOpen={showLogModal} onClose={() => setShowLogModal(false)} subjects={subjects} onSuccess={loadData}
        />
      )}
    </div>
  );
};
