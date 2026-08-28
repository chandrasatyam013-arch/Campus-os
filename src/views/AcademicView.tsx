import React, { useState, useEffect } from 'react';
import { GraduationCap, TrendingUp, Target, BookOpen, AlertTriangle, ArrowRight, TrendingDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { KPICard } from '../components/ui/KPICard';
import { DashboardData, SubjectPerformanceAnalytics } from '../types';

interface AcademicViewProps {
  onNavigate: (route: string) => void;
}

export const AcademicView: React.FC<AcademicViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Target Calculator State
  const [targetCGPA, setTargetCGPA] = useState<string>('');
  const [remainingCredits, setRemainingCredits] = useState<string>('');
  const [targetResult, setTargetResult] = useState<{possible: boolean, requiredAverageGradePoint: number, message: string} | null>(null);

  useEffect(() => {
    const loadAcademicData = async () => {
      try {
        const res = await api.getDashboard();
        setData(res);
      } catch (err) {
        console.error('Failed to load academic data', err);
      } finally {
        setLoading(false);
      }
    };
    loadAcademicData();
  }, []);

  const handleCalculateTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCGPA || !remainingCredits) return;
    try {
      const target = Number(targetCGPA);
      const remaining = Number(remainingCredits);
      const currentCGPA = data?.academicPerformance.estimatedCGPA || 0;
      const completedCredits = data?.academicPerformance.completedCredits || 0;
      
      const currentPoints = currentCGPA * completedCredits;
      const targetPoints = target * (completedCredits + remaining);
      const requiredPoints = targetPoints - currentPoints;
      const requiredAverage = requiredPoints / remaining;
      
      // Assume 10 point scale for simple client-side fallback
      if (requiredAverage > 10) {
        setTargetResult({ possible: false, requiredAverageGradePoint: requiredAverage, message: `That target is mathematically unreachable. You would need an average grade point of ${requiredAverage.toFixed(2)}.` });
      } else if (requiredAverage <= 0) {
        setTargetResult({ possible: true, requiredAverageGradePoint: 0, message: `You have already achieved this mathematically, even if you score zero on the remaining credits.` });
      } else {
        setTargetResult({ possible: true, requiredAverageGradePoint: Number(requiredAverage.toFixed(2)), message: `You need to maintain an average grade point of ${requiredAverage.toFixed(2)} across your remaining ${remaining} credits.` });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !data) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Analyzing Academic Intelligence...</p>
      </div>
    );
  }

  if (!data.academicPerformance) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <AlertTriangle className="w-10 h-10 text-rose-500" />
        <p className="text-sm text-gray-500 font-medium">Academic analytics data is temporarily unavailable.</p>
      </div>
    );
  }

  const { academicPerformance } = data;
  const { estimatedSGPA, estimatedCGPA, academicRisk, trend, completedCredits, semesters, subjects } = academicPerformance;

  const strongSubjects = subjects.filter(s => !s.isWeakSubject && s.assessmentsCount > 0);
  const weakSubjects = subjects.filter(s => s.isWeakSubject);

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-1">Academic Intelligence</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-black tracking-tight">
            Performance Analytics
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1"> 
            Deterministic grading, semester-wise trends, and target analysis.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Current SGPA" 
          value={estimatedSGPA ?? 'N/A'} 
          subtitle="Latest semester performance" 
          icon={GraduationCap} 
          color="indigo" 
        />
        <KPICard 
          title="Cumulative GPA" 
          value={estimatedCGPA ?? 'N/A'} 
          subtitle={`${completedCredits} credits completed`} 
          icon={Target} 
          color="emerald" 
          badge={{ 
            text: trend === 'IMPROVING' ? 'Improving' : trend === 'DECLINING' ? 'Declining' : 'Stable', 
            type: trend === 'IMPROVING' ? 'safe' : trend === 'DECLINING' ? 'warning' : 'info' 
          }} 
        />
        <KPICard 
          title="Strong Subjects" 
          value={strongSubjects.length} 
          subtitle="Performing above average" 
          icon={TrendingUp} 
          color="sky" 
        />
        <KPICard 
          title="Academic Risk" 
          value={academicRisk} 
          subtitle={`${weakSubjects.length} subjects need attention`} 
          icon={AlertTriangle} 
          color={academicRisk === 'SAFE' ? 'emerald' : academicRisk === 'HIGH_RISK' ? 'amber' : 'rose'} 
          badge={{ 
            text: academicRisk, 
            type: academicRisk === 'SAFE' ? 'safe' : 'danger' 
          }} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Semester Trend Chart (Mockup representation) */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-[28px] bg-white border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-black flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                Performance Trend
              </h2>
            </div>
            {semesters.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">
                No semester data available yet.
              </div>
            ) : (
              <div className="space-y-4">
                {semesters.map((sem, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div>
                      <h3 className="font-bold text-sm text-black">{sem.semesterName}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{sem.totalCredits} credits</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-lg font-bold text-black">{sem.sgpa.toFixed(2)}</span>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">SGPA</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Target Calculator */}
        <div className="p-6 sm:p-8 rounded-[28px] bg-black text-white shadow-xl flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Target className="w-32 h-32" />
          </div>
          
          <h2 className="text-lg font-bold flex items-center gap-2 mb-2 relative z-10">
            <Target className="w-5 h-5 text-indigo-400" />
            Target Calculator
          </h2>
          <p className="text-xs text-gray-400 mb-6 relative z-10">
            Find out exactly what you need to score to hit your dream CGPA.
          </p>

          <form onSubmit={handleCalculateTarget} className="space-y-4 relative z-10 mb-6 flex-grow">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5"> Target CGPA
              </label>
              <input type="number" step="0.01" min="0" max="10" placeholder="e.g. 8.5" value={targetCGPA} onChange={e => setTargetCGPA(e.target.value)} className="w-full px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 font-mono" required />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5"> Remaining Credits
              </label>
              <input type="number" placeholder="e.g. 40" value={remainingCredits} onChange={e => setRemainingCredits(e.target.value)} className="w-full px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 font-mono" required />
            </div>
            
            <button type="submit" className="w-full py-3 bg-white text-black font-bold text-xs rounded-xl hover:bg-gray-100 transition-colors shadow-lg">
              Calculate Required Score
            </button>
          </form>

          {targetResult && (
            <div className={`p-4 rounded-xl border relative z-10 ${targetResult.possible ? 'bg-indigo-500/20 border-indigo-500/30' : 'bg-rose-500/20 border-rose-500/30'}`}>
              <div className="flex items-start gap-3">
                {targetResult.possible ? <TrendingUp className="w-5 h-5 text-indigo-300 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-rose-300 shrink-0" />}
                <div>
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${targetResult.possible ? 'text-indigo-300' : 'text-rose-300'}`}>
                    {targetResult.possible ? 'Achievable' : 'Mathematically Impossible'}
                  </span>
                  <p className="text-sm font-medium text-white leading-snug mt-1">
                    {targetResult.message}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Strong / Weak Subjects Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Strong Subjects */}
        <div className="p-6 sm:p-8 rounded-[28px] bg-white border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-black flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Strong Subjects
          </h2>
          <div className="space-y-3">
            {strongSubjects.length === 0 ? (
              <p className="text-sm text-gray-400">No strong subjects identified yet.</p>
            ) : (
              strongSubjects.map(s => (
                <div key={s.subjectId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                  <div>
                    <h3 className="font-bold text-sm text-black">{s.subjectName}</h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mt-1">Average: {s.averagePercentage}%</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="font-mono text-lg font-bold text-black block leading-none">{s.gradePointEstimate}</span>
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mt-1">Points</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center font-mono">
                      {s.gradeEstimate}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Needs Attention */}
        <div className="p-6 sm:p-8 rounded-[28px] bg-white border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-black flex items-center gap-2 mb-6">
            <TrendingDown className="w-5 h-5 text-rose-500" />
            Needs Attention
          </h2>
          <div className="space-y-3">
            {weakSubjects.length === 0 ? (
              <p className="text-sm text-gray-400">You are doing great! No subjects are currently flagged.</p>
            ) : (
              weakSubjects.map(s => (
                <div key={s.subjectId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                  <div>
                    <h3 className="font-bold text-sm text-black">{s.subjectName}</h3>
                    <p className="text-[10px] text-rose-500 uppercase tracking-wider font-bold mt-1 max-w-[200px] leading-snug">{s.weakReason}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="font-mono text-lg font-bold text-black block leading-none">{s.gradePointEstimate}</span>
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mt-1">Points</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-rose-200 text-rose-800 font-bold flex items-center justify-center font-mono">
                      {s.gradeEstimate}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
