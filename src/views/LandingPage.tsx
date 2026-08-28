import React, { useState } from 'react';
import { Compass, ArrowRight, ShieldCheck, Calculator, TrendingUp, AlertTriangle, CheckCircle2, CalendarCheck2, Sparkles, BookOpen, CheckSquare, Clock, ChevronRight, GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext'; interface LandingPageProps { onNavigateToAuth: (mode: 'login' | 'register') => void;
} export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToAuth }) => { const { startDemo } = useAuth();
  const toast = useToast();
  const [demoLoading, setDemoLoading] = useState(false);

  // Live Interactive Attendance Simulator Widget on Hero
  const [simAttended, setSimAttended] = useState(41);
  const [simTotal, setSimTotal] = useState(50);
  const [simTarget, setSimTarget] = useState(85);
  const [simMin, setSimMin] = useState(75);
  const simCurrentPct = simTotal === 0 ? 100 : Number(((simAttended / simTotal) * 100).toFixed(1));
  const simTargetFrac = simTarget / 100;
  const simClassesNeeded = simCurrentPct >= simTarget 
    ? 0 
    : Math.max(0, Math.ceil(((simTargetFrac * simTotal) - simAttended) / (1 - simTargetFrac)));
  const simMinFrac = simMin / 100;
  const simSafeAbsences = simCurrentPct >= simMin 
    ? Math.max(0, Math.floor((simAttended / simMinFrac) - simTotal))
    : 0;
  const handleLaunchDemo = async () => { setDemoLoading(true);
  try { await startDemo();
  toast.success('Demo Session Initialized', 'Welcome to Campus OS! Sample student dataset loaded.');
    }
  catch (err: any) { toast.error('Failed to load demo', err.message);
    }
  finally { setDemoLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 flex flex-col selection:bg-black selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white backdrop-blur-md border-b border-gray-100 px-6 sm:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shadow-sm">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg text-black tracking-tight">CAMPUS OS</span>
            <span className="text-[11px] text-gray-400 hidden sm:inline ml-2 font-medium">Student Intelligence Platform</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => onNavigateToAuth('login')} className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-black transition-colors"
          > Sign In
          </button>
          <button onClick={handleLaunchDemo} disabled={demoLoading} className="px-4 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-full transition-all"
          >
            {demoLoading ? 'Loading Demo...' : 'Explore Demo'}
          </button>
          <button onClick={() => onNavigateToAuth('register')} className="px-5 py-2 text-xs font-bold bg-black hover:bg-neutral-800 text-white rounded-full shadow-sm transition-all hidden sm:block"
          > Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-20 max-w-6xl mx-auto w-full text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-black " />
          <span>Student Intelligence Platform • Deterministic Next-Move Engine</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold text-black tracking-tight leading-[1.15] max-w-4xl mx-auto"> Your academic data.{' '}
          <span className="text-gray-400 "> Your next move.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed"> University portals only show you historical data. Campus OS explains what that data means and calculates exactly what you should do today.
        </p>

        {/* Hero CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={() => onNavigateToAuth('register')} className="w-full sm:w-auto px-8 py-3.5 bg-black hover:bg-neutral-800 text-white font-bold text-sm rounded-full shadow-sm transition-all flex items-center justify-center gap-2 group"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button onClick={handleLaunchDemo} disabled={demoLoading} className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-gray-50 :bg-slate-800 text-black border border-gray-200 font-semibold text-sm rounded-full transition-all flex items-center justify-center gap-2 shadow-2xs"
          >
            <span>Explore Live Demo</span>
            <ChevronRight className="w-4 h-4 text-gray-400 " />
          </button>
        </div>

        {/* Live Interactive Attendance Calculator Teaser Widget */}
        <div className="mt-14 p-8 sm:p-10 rounded-[36px] bg-white border border-gray-100 shadow-sm max-w-3xl mx-auto text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-gray-100 ">
            <div>
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-black " />
                <h3 className="text-base font-bold text-black ">Interactive Attendance Intelligence Formula</h3>
              </div>
              <p className="text-xs text-gray-500 mt-0.5"> Real-time mathematical simulation: solve (A + x)/(N + x) ≥ Target.
              </p>
            </div>
            <span className="px-3 py-1 text-[11px] font-bold font-mono bg-gray-100 text-gray-800 rounded-full self-start sm:self-auto"> Real Math Engine
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
            {/* Input Controls */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                  <span>Classes Attended (A)</span>
                  <span className="font-mono text-black ">{simAttended}</span>
                </div>
                <input type="range" min="0" max={simTotal} value={simAttended} onChange={e => setSimAttended(Number(e.target.value))} className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-black"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                  <span>Total Classes Held (N)</span>
                  <span className="font-mono text-gray-500 ">{simTotal}</span>
                </div>
                <input type="range" min="10" max="100" value={simTotal} onChange={e => { const val = Number(e.target.value);
  setSimTotal(val);
  if (simAttended > val) setSimAttended(val);
                  }} className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-gray-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 ">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Target</span>
                  <span className="text-sm font-bold font-mono text-black ">{simTarget}%</span>
                </div>
                <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 ">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Min Allowed</span>
                  <span className="text-sm font-bold font-mono text-gray-700 ">{simMin}%</span>
                </div>
              </div>
            </div>

            {/* Calculated Output Card */}
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 "> Current Status
                </span>
                <div className="text-3xl font-bold font-mono text-black mt-1 flex items-baseline gap-2">
                  <span>{simCurrentPct}%</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-sans font-bold ${ simCurrentPct >= simTarget ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {simCurrentPct >= simTarget ? 'Safe' : 'Watch'}
                  </span>
                </div>
              </div>

              <div className="my-3 py-3 border-y border-gray-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 ">Classes needed for {simTarget}%:</span>
                  <span className="font-bold font-mono text-black ">
                    +{simClassesNeeded} consecutive
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 ">Safe absences before {simMin}%:</span>
                  <span className="font-bold font-mono text-emerald-800">
                    {simSafeAbsences} classes
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-gray-500 italic">
                {simClassesNeeded > 0
                  ? `Attend your next ${simClassesNeeded} consecutive classes to cross your ${simTarget}% target.`
                  : `You are above your target and can safely afford up to ${simSafeAbsences} absences.`}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem vs Solution Section */}
      <section className="px-6 py-16 bg-white border-y border-gray-100 ">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 ">Philosophy</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-black mt-1"> Data Without Context Is Noise
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-2"> Why Campus OS is designed around proactive student action rather than passive record tables.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Traditional Portal */}
            <div className="p-7 sm:p-8 rounded-[28px] bg-gray-50 border border-gray-100 space-y-4">
              <div className="flex items-center gap-2 text-red-600 text-sm font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>Traditional University Portal</span>
              </div>
              <ul className="space-y-3 text-xs text-gray-600 ">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✕</span>
                  <span>Shows attendance is 78.4% with zero guidance on how many classes to attend.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✕</span>
                  <span>Lists raw marks in isolated tables without computing semester SGPA trajectory.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✕</span>
                  <span>Leaves students guessing which assignment deadline is genuinely high urgency.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✕</span>
                  <span>Scattered portals with sluggish interfaces and disconnected systems.</span>
                </li>
              </ul>
            </div>

            {/* Campus OS */}
            <div className="p-7 sm:p-8 rounded-[28px] bg-white border border-gray-200 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-black text-sm font-bold">
                <Compass className="w-4 h-4" />
                <span>Campus OS Intelligence</span>
              </div>
              <ul className="space-y-3 text-xs text-gray-700 ">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                  <span>Calculates exact consecutive classes required and safe absences remaining.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                  <span>Interactive SGPA & CGPA What-If simulator models anticipated letter grades.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                  <span>Signature "What should I do today?" prioritizes top 3-5 high-impact daily actions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                  <span>Private, responsive, zero-cost deterministic intelligence with instant CSV import/export.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Key Feature Pillars */}
      <section className="px-6 py-20 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 ">Features</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-black mt-1"> Engineered for Academic Mastery
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-7 rounded-[28px] bg-white border border-gray-100 shadow-sm hover:border-gray-300 transition-all">
            <div className="p-3 w-fit rounded-full bg-gray-50 text-black mb-4">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-black ">Attendance Intelligence</h3>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed"> Deterministic formulas compute safe absences and target recovery requirements with real-time what-if simulations.
            </p>
          </div>

          <div className="p-7 rounded-[28px] bg-white border border-gray-100 shadow-sm hover:border-gray-300 transition-all">
            <div className="p-3 w-fit rounded-full bg-gray-50 text-black mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-black ">What Should I Do Today?</h3>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed"> Signature decision engine synthesizes timetable, assignment deadlines, attendance risk, and weak subjects into daily priorities.
            </p>
          </div>

          <div className="p-7 rounded-[28px] bg-white border border-gray-100 shadow-sm hover:border-gray-300 transition-all">
            <div className="p-3 w-fit rounded-full bg-gray-50 text-black mb-4">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-black ">SGPA & CGPA Simulator</h3>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed"> Credit-weighted grade point calculations and multi-semester cumulative projection modeling.
            </p>
          </div>

          <div className="p-7 rounded-[28px] bg-white border border-gray-100 shadow-sm hover:border-gray-300 transition-all">
            <div className="p-3 w-fit rounded-full bg-gray-50 text-black mb-4">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-black ">Academic Analytics & Trends</h3>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed"> Identifies improving, stable, or declining test performances and automatically flags weakest subjects needing revision.
            </p>
          </div>

          <div className="p-7 rounded-[28px] bg-white border border-gray-100 shadow-sm hover:border-gray-300 transition-all">
            <div className="p-3 w-fit rounded-full bg-gray-50 text-black mb-4">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-black ">Smart Task Priority</h3>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed"> Assignments dynamically ranked by proximity, effort estimates, and subject vulnerability.
            </p>
          </div>

          <div className="p-7 rounded-[28px] bg-white border border-gray-100 shadow-sm hover:border-gray-300 transition-all">
            <div className="p-3 w-fit rounded-full bg-gray-50 text-black mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-black ">Privacy & Offline Dossier</h3>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed"> Complete data autonomy with one-click JSON/CSV exports, zero telemetry tracking, and cascading deletion.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-100 px-6 py-8 text-center text-xs text-gray-500 ">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-black " />
            <span className="font-bold text-gray-900 ">CAMPUS OS</span>
            <span>— "Your academic data. Your next move."</span>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={handleLaunchDemo} className="hover:text-black transition-colors"> Try Demo
            </button>
            <button onClick={() => onNavigateToAuth('login')} className="hover:text-black transition-colors"> Sign In
            </button>
            <button onClick={() => onNavigateToAuth('register')} className="hover:text-black transition-colors"> Register
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
