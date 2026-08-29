import React, { useState, useEffect } from 'react';
import { CalendarCheck2, GraduationCap, CheckSquare, AlertTriangle, Plus, Calculator, Calendar, Sparkles, ArrowRight, TrendingUp, Clock, ShieldCheck, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DashboardData, SubjectAttendanceIntelligence } from '../types';
import { api } from '../lib/api';
import { KPICard } from '../components/ui/KPICard';
import { WhatShouldIDoToday } from '../components/dashboard/WhatShouldIDoToday';
import { TodayClassesWidget } from '../components/dashboard/TodayClassesWidget';
import { WeeklySummaryCard } from '../components/dashboard/WeeklySummaryCard';
import { AttendanceSimulatorModal } from '../components/attendance/AttendanceSimulatorModal';
import { LogAttendanceModal } from '../components/attendance/LogAttendanceModal';
import { LogMarkModal } from '../components/marks/LogMarkModal';
import { SGPACalculatorModal } from '../components/marks/SGPACalculatorModal';
import { CreateAssignmentModal } from '../components/assignments/CreateAssignmentModal'; interface DashboardViewProps { onNavigate: (route: string) => void;
} export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => { const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [simulatorSubject, setSimulatorSubject] = useState<SubjectAttendanceIntelligence | null>(null);
  const [showLogAttendance, setShowLogAttendance] = useState(false);
  const [showLogMark, setShowLogMark] = useState(false);
  const [showSGPASimulator, setShowSGPASimulator] = useState(false);
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const loadDashboard = async (isSilent = false) => { if (!isSilent) setLoading(true); else setRefreshing(true);
  try { const res = await api.getDashboard();
  setData(res);
    }
  catch (err) { console.error('Failed to load dashboard:', err);
    }
  finally { setLoading(false);
  setRefreshing(false);
    }
  };
  useEffect(() => { loadDashboard();
  }, []);
  if (loading || !data) { return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Synthesizing student intelligence...</p>
      </div>
    );
  };
  const { overallAttendance, academicPerformance, pendingTasks, riskAnalysis, whatShouldIDoToday, todaySchedule, weeklySummary, subjects } = data;
  const getGreeting = () => { const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
  };

  if (subjects.length === 0) {
    return (
      <div className="p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[70vh] text-center">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <Sparkles className="w-10 h-10 text-indigo-500" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-black mb-3 tracking-tight">
          Welcome to Campus OS 👋
        </h1>
        <p className="text-gray-500 mb-8 max-w-md text-sm">
          Your academic workspace is ready. Let's build your foundation by adding your first subject.
        </p>
        <button 
          onClick={() => onNavigate('subjects')}
          className="px-6 py-3 bg-black text-white font-bold rounded-full hover:bg-neutral-800 transition-colors shadow-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add First Subject</span>
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header & Quick Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-1">Live Intelligence</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-black tracking-tight">
            {getGreeting()}, {user?.name.split(' ')[0] || 'Scholar'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1"> Deterministic snapshot of your attendance buffer, estimated SGPA, and today's priority actions.
          </p>
        </div>

        {/* Fast Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button onClick={() => setShowLogAttendance(true)} className="px-5 py-2.5 text-xs font-bold bg-black hover:bg-neutral-800 text-white rounded-full shadow-sm transition-all flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Attendance</span>
          </button>

          <button onClick={() => setShowLogMark(true)} className="px-4 py-2.5 text-xs font-bold bg-white hover:bg-gray-50 :bg-slate-800 text-black border border-gray-200 hover:border-gray-300 rounded-full transition-all flex items-center gap-2 shadow-2xs"
          >
            <GraduationCap className="w-3.5 h-3.5 text-gray-700 " />
            <span>Log Marks</span>
          </button>

          <button onClick={() => setShowCreateAssignment(true)} className="px-4 py-2.5 text-xs font-bold bg-white hover:bg-gray-50 :bg-slate-800 text-black border border-gray-200 hover:border-gray-300 rounded-full transition-all flex items-center gap-2 shadow-2xs"
          >
            <CheckSquare className="w-3.5 h-3.5 text-gray-700 " />
            <span>New Task</span>
          </button>

          <button onClick={() => loadDashboard(true)} disabled={refreshing} className="p-2.5 text-gray-500 hover:text-black bg-white hover:bg-gray-50 :bg-slate-800 border border-gray-200 rounded-full transition-colors" title="Refresh Intelligence Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-black ' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Overall Attendance" value={overallAttendance.overallPercentage === null ? 'No Data' : `${overallAttendance.overallPercentage}%`} subtitle={`${overallAttendance.totalAttended}/${overallAttendance.totalHeld} classes attended`} icon={CalendarCheck2} color={overallAttendance.isAboveTarget ? 'indigo' : overallAttendance.isAboveMinimum ? 'amber' : 'rose'} badge={{ text: overallAttendance.isAboveTarget ? 'Safe' : overallAttendance.isAboveMinimum ? 'Watch' : 'Risk', type: overallAttendance.isAboveTarget ? 'safe' : overallAttendance.isAboveMinimum ? 'warning' : 'danger'
          }} onClick={() => onNavigate('attendance')}
        />

        <KPICard title="Estimated SGPA / CGPA" value={academicPerformance.estimatedCGPA ?? academicPerformance.estimatedSGPA ?? 'N/A'} subtitle={`${academicPerformance.completedCredits} completed credits`} icon={GraduationCap} color="emerald" badge={{ text: academicPerformance.trend === 'IMPROVING' ? 'Improving' : academicPerformance.trend === 'DECLINING' ? 'Needs Attention' : 'Stable', type: academicPerformance.trend === 'IMPROVING' ? 'safe' : academicPerformance.trend === 'DECLINING' ? 'warning' : 'info'
          }} onClick={() => setShowSGPASimulator(true)}
        />

        <KPICard title="Pending Assignments" value={pendingTasks.pendingCount} subtitle={pendingTasks.urgentDueNext24Hours > 0 ? `${pendingTasks.urgentDueNext24Hours} due in <24h` : `${pendingTasks.dueThisWeekCount} due this week`} icon={CheckSquare} color={pendingTasks.urgentDueNext24Hours > 0 ? 'rose' : 'sky'} badge={pendingTasks.urgentDueNext24Hours > 0 ? { text: 'Urgent', type: 'danger' } : undefined} onClick={() => onNavigate('assignments')}
        />

        <KPICard title="Academic Risk Index" value={riskAnalysis.riskLevel} subtitle={`${riskAnalysis.inDangerCount} in danger • ${riskAnalysis.borderlineCount} on watch`} icon={AlertTriangle} color={riskAnalysis.riskLevel === 'SAFE' ? 'emerald' : riskAnalysis.riskLevel === 'WATCH' ? 'sky' : riskAnalysis.riskLevel === 'HIGH_RISK' ? 'amber' : 'rose'} badge={{ text: `${riskAnalysis.riskScore}/100 Risk`, type: riskAnalysis.riskLevel === 'SAFE' ? 'safe' : riskAnalysis.riskLevel === 'HIGH_RISK' || riskAnalysis.riskLevel === 'CRITICAL' ? 'danger' : 'warning'
          }} onClick={() => onNavigate('attendance')}
        />
      </div>

      {/* Signature Feature: What should I do today? */}
      <WhatShouldIDoToday items={whatShouldIDoToday} onNavigate={onNavigate}
      />

      {/* Grid: Timetable & Weekly Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TodayClassesWidget dayOfWeek={todaySchedule.dayOfWeek} dateFormatted={todaySchedule.dateFormatted} classes={todaySchedule.classes} onNavigate={onNavigate}
        />

        <WeeklySummaryCard summary={weeklySummary} onNavigate={onNavigate}
        />
      </div>

      {/* Attendance Watchlist & Quick Simulators */}
      <div className="p-7 sm:p-8 rounded-[32px] bg-white border border-gray-100 shadow-sm space-y-5 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-1">Buffer Analytics</p>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-black tracking-tight">Subject Attendance Intelligence</h3>
            </div>
            <p className="text-xs text-gray-400 mt-0.5"> Live buffer analytics with deterministic safe absences and what-if simulation triggers.
            </p>
          </div>
          <button onClick={() => onNavigate('attendance')} className="text-xs text-black hover:text-gray-600 :text-slate-300 font-bold flex items-center gap-1 transition-colors self-start sm:self-auto shrink-0"
          >
            <span>Full Attendance View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Subjects List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {overallAttendance.subjects.map(sub => (
            <div key={sub.subjectId} className="p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-all flex flex-col justify-between gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: sub.color }} />
                  <div>
                    <h4 className="text-xs font-bold text-black ">{sub.subjectName}</h4>
                    <span className="text-[10px] font-mono text-gray-400 font-medium">{sub.subjectCode}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-mono font-bold text-black ">{sub.attendancePercentage}%</span>
                  <div className="text-[10px] text-gray-400 font-mono">
                    {sub.attendedClasses}/{sub.totalClasses} classes
                  </div>
                </div>
              </div>

              {/* Status bar */}
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${ sub.riskLevel === 'SAFE' ? 'bg-emerald-500' : sub.riskLevel === 'WATCH' ? 'bg-amber-500' : 'bg-rose-500'
                  }`} style={{ width: `${Math.min(100, sub.attendancePercentage || 0)}%` }}
                />
              </div>

              {/* Next Move & Simulation trigger */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-200 ">
                <span className="text-[11px] text-gray-500 truncate max-w-[200px]">
                  {sub.classesNeededForTarget > 0 ? (
                    <span className="text-amber-700 font-semibold">Needs +{sub.classesNeededForTarget} to reach {sub.targetPercentage}%</span>
                  ) : (
                    <span className="text-emerald-700 font-semibold">Can miss up to {sub.classesCanMiss} classes</span>
                  )}
                </span>

                <button onClick={() => setSimulatorSubject(sub)} className="px-3 py-1 text-[11px] font-bold text-black hover:bg-white bg-gray-200 border border-gray-200 rounded-full flex items-center gap-1 transition-colors"
                >
                  <Calculator className="w-3 h-3" />
                  <span>Simulate</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {simulatorSubject && (
        <AttendanceSimulatorModal isOpen={!!simulatorSubject} onClose={() => setSimulatorSubject(null)} subjectIntel={simulatorSubject}
        />
      )}

      {showLogAttendance && (
        <LogAttendanceModal isOpen={showLogAttendance} onClose={() => setShowLogAttendance(false)} subjects={subjects} onSuccess={() => loadDashboard(true)}
        />
      )}

      {showLogMark && (
        <LogMarkModal isOpen={showLogMark} onClose={() => setShowLogMark(false)} subjects={subjects} onSuccess={() => loadDashboard(true)}
        />
      )}

      {showCreateAssignment && (
        <CreateAssignmentModal isOpen={showCreateAssignment} onClose={() => setShowCreateAssignment(false)} subjects={subjects} onSuccess={() => loadDashboard(true)}
        />
      )}

      {showSGPASimulator && (
        <SGPACalculatorModal isOpen={showSGPASimulator} onClose={() => setShowSGPASimulator(false)} performances={academicPerformance.subjects}
        />
      )}
    </div>
  );
};
