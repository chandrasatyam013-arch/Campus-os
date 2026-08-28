import React, { useState, useEffect } from 'react';
import { LineChart as LineChartIcon, BarChart3, Sparkles, TrendingUp, AlertTriangle, Award, BookOpen, Calculator
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid
} from 'recharts';
import { api } from '../lib/api';
import { DashboardData } from '../types';
import { SGPACalculatorModal } from '../components/marks/SGPACalculatorModal'; export const AnalyticsView: React.FC = () => { const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSGPAModal, setShowSGPAModal] = useState(false); useEffect(() => { api.getDashboard().then(res => { setData(res);
  setLoading(false);
    }).catch(err => { console.error(err);
  setLoading(false);
    });
  }, []);
  if (loading || !data) { return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-400 font-medium">Aggregating visual analytics...</p>
      </div>
    );
  };
  const { academicPerformance, overallAttendance, weeklySummary } = data;
  const subjectPerformances = academicPerformance.subjects || [];
  const subjectAttendances = overallAttendance.subjects || [];

  // Chart datasets
  const marksChartData = subjectPerformances.map(s => ({ name: s.subjectCode, fullName: s.subjectName, percentage: s.averagePercentage, credits: s.credits, color: s.color
  }));
  const attendanceVsMarksData = subjectAttendances.map(s => { const mrk = subjectPerformances.find(m => m.subjectId === s.subjectId)?.averagePercentage || 0;
  return { code: s.subjectCode, name: s.subjectName, attendance: s.attendancePercentage, marks: mrk, targetAtt: s.targetPercentage
    };
  });
  const weakSubjects = subjectPerformances.filter(s => s.isWeakSubject || s.averagePercentage < 65);
  const totalCredits = subjectPerformances.reduce((sum, s) => sum + s.credits, 0);
  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-1">Predictive Insights</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-black tracking-tight">Academic Analytics & SGPA</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1"> Visual intelligence, correlation analysis, and multi-semester grade point forecasting.
          </p>
        </div>

        <button onClick={() => setShowSGPAModal(true)} className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-full shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Launch SGPA / CGPA Simulator</span>
        </button>
      </div>

      {/* Top Velocity Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-[28px] bg-white border border-gray-100 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Estimated SGPA</span>
          <div className="text-3xl font-bold font-mono text-black mt-1">
            {academicPerformance?.estimatedSGPA}
          </div>
          <p className="text-xs text-gray-500 mt-1"> Credit-weighted across {totalCredits} registered credits
          </p>
        </div>

        <div className="p-6 rounded-[28px] bg-white border border-gray-100 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Weekly Attendance Trend</span>
          <div className="text-3xl font-bold font-mono text-emerald-700 mt-1">
            {weeklySummary?.attendanceDirection === 'UP' ? `+${weeklySummary.attendanceChangePercent}%` : `${weeklySummary?.attendanceChangePercent}%`}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {weeklySummary?.highlightMessage || 'Steady progress across courses'}
          </p>
        </div>

        <div className="p-6 rounded-[28px] bg-white border border-gray-100 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Weak Areas</span>
          <div className="text-3xl font-bold font-mono text-amber-700 mt-1">
            {weakSubjects.length} Subject{weakSubjects.length === 1 ? '' : 's'}
          </div>
          <p className="text-xs text-gray-500 mt-1"> Scoring below 65% benchmark or declining
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Average Performance Bar Chart */}
        <div className="p-7 sm:p-8 rounded-[32px] bg-white border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-black ">Subject Score Averages</h3>
              <p className="text-[11px] text-gray-500 ">Average percentage achieved across continuous tests</p>
            </div>
            <span className="text-xs font-mono text-gray-500 font-bold">Scale: 0-100%</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marksChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={11} domain={[0, 100]} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '12px', fontSize: '12px', color: '#111827', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} itemStyle={{ color: '#111827' }} formatter={(val: any) => [`${val}%`, 'Average Score']} labelFormatter={(label) => { const item = marksChartData.find(m => m.name === label);
  return item ? `${item.fullName} (${item.name})` : label;
                  }}
                />
                <Bar dataKey="percentage" fill="#111827" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance vs Performance Dual Analysis Chart */}
        <div className="p-7 sm:p-8 rounded-[32px] bg-white border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-black ">Attendance vs Marks Correlation</h3>
              <p className="text-[11px] text-gray-500 ">Comparing presence percentage against test scores</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-semibold">
              <span className="flex items-center gap-1 text-gray-700 ">
                <span className="w-2 h-2 rounded-full bg-gray-400" /> Attendance %
              </span>
              <span className="flex items-center gap-1 text-black ">
                <span className="w-2 h-2 rounded-full bg-black" /> Marks %
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceVsMarksData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="code" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={11} domain={[0, 100]} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '12px', fontSize: '12px', color: '#111827', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                />
                <Bar dataKey="attendance" name="Attendance %" fill="#9CA3AF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="marks" name="Marks %" fill="#111827" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Weak Subject Diagnostics Section */}
      <div className="p-7 sm:p-8 rounded-[32px] bg-white border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <h3 className="text-base font-bold text-black tracking-tight">Weak Subject Diagnostics & Remediation</h3>
        </div>
        <p className="text-xs text-gray-500 "> Automated academic triage based on continuous test dips and credit risk impact.
        </p>

        {weakSubjects.length === 0 ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs flex items-center gap-3">
            <Award className="w-6 h-6 text-emerald-700 shrink-0" />
            <div>
              <p className="font-bold text-sm text-emerald-900">No weak subjects detected!</p>
              <p className="text-emerald-700 mt-0.5">All enrolled courses maintain strong averages above the 65% benchmark.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weakSubjects.map(s => (
              <div key={s.subjectId} className="p-5 rounded-2xl bg-gray-50 border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    <h4 className="text-xs font-bold text-black ">{s.subjectName}</h4>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-700">{s.averagePercentage}% Avg</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed"> Carries <strong className="text-black font-mono">{s.credits} credits</strong>. Prioritize reviewing recent Continuous Assessment problem sets and attending upcoming tutorial sessions.
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SGPA Simulator Modal */}
      {showSGPAModal && (
        <SGPACalculatorModal isOpen={showSGPAModal} onClose={() => setShowSGPAModal(false)} performances={subjectPerformances}
        />
      )}
    </div>
  );
};
