import React, { useState, useMemo } from 'react';
import { Calculator, Sparkles, TrendingUp, BookOpen, Layers } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { SubjectPerformanceAnalytics } from '../../types'; interface SGPACalculatorModalProps { isOpen: boolean; onClose: () => void; performances: SubjectPerformanceAnalytics[];
};
  const GRADE_POINTS: Record<string, number> = {
  'O (Outstanding - 10)': 10,
  'A+ (Excellent - 9)': 9,
  'A (Very Good - 8)': 8,
  'B+ (Good - 7)': 7,
  'B (Above Average - 6)': 6,
  'C (Average - 5)': 5,
  'F (Fail - 0)': 0
}; export const SGPACalculatorModal: React.FC<SGPACalculatorModalProps> = ({ isOpen, onClose, performances
}) => {
  // Tab state: 'sgpa' or 'cgpa'
  const [activeTab, setActiveTab] = useState<'sgpa' | 'cgpa'>('sgpa');

  // Simulated Grade Points for current semester subjects
  const [grades, setGrades] = useState<Record<string, number>>(() => { const init: Record<string, number> = {}; performances.forEach(p => { init[p.subjectId] = p.gradePointEstimate || 8;
    });
  return init;
  });

  // Prior semesters for CGPA calculation
  const [semesters, setSemesters] = useState<Array<{ sem: number; sgpa: number; credits: number }>>([
    { sem: 1, sgpa: 8.40, credits: 22 },
    { sem: 2, sgpa: 8.15, credits: 24 }
  ]);

  // Current SGPA based on actual estimated performances
  const baselineSGPA = useMemo(() => { let pts = 0;
  let creds = 0; performances.forEach(p => { const gp = p.gradePointEstimate || 8; pts += gp * p.credits; creds += p.credits;
    });
  return creds === 0 ? 0 : Number((pts / creds).toFixed(2));
  }, [performances]);

  // Simulated SGPA based on user interactive tweaks
  const simulatedSGPA = useMemo(() => { let pts = 0;
  let creds = 0; performances.forEach(p => { const gp = grades[p.subjectId] ?? (p.gradePointEstimate || 8); pts += gp * p.credits; creds += p.credits;
    });
  return creds === 0 ? 0 : Number((pts / creds).toFixed(2));
  }, [performances, grades]);

  // CGPA calculation
  const cumulativeCGPA = useMemo(() => { let totalPoints = 0;
  let totalCredits = 0; semesters.forEach(s => { totalPoints += s.sgpa * s.credits; totalCredits += s.credits;
    });

    // Add current simulated semester
  const currentCredits = performances.reduce((acc, p) => acc + p.credits, 0) || 18; totalPoints += simulatedSGPA * currentCredits; totalCredits += currentCredits;
  return totalCredits === 0 ? 0 : Number((totalPoints / totalCredits).toFixed(2));
  }, [semesters, simulatedSGPA, performances]);
  const handleGradeChange = (subjectId: string, point: number) => { setGrades(prev => ({ ...prev, [subjectId]: point }));
  };
  const handleAddSemester = () => { setSemesters(prev => [
      ...prev,
      { sem: prev.length + 1, sgpa: 8.0, credits: 20 }
    ]);
  };
  const handleUpdateSemester = (index: number, field: 'sgpa' | 'credits', val: number) => { setSemesters(prev => { const copy = [...prev]; copy[index] = { ...copy[index], [field]: val };
  return copy;
    });
  };
  const handleRemoveSemester = (index: number) => { setSemesters(prev => prev.filter((_, i) => i !== index));
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="SGPA & CGPA What-If Intelligence" subtitle="Simulate expected letter grades across subjects and forecast your semester GPA and cumulative CGPA." maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex rounded-full bg-gray-100 p-1 border border-gray-200 ">
          <button onClick={() => setActiveTab('sgpa')} className={`flex-1 py-2 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-2 ${ activeTab === 'sgpa'
                ? 'bg-black text-white shadow-sm'
                : 'text-gray-600 hover:text-black '
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Current Semester SGPA</span>
          </button>
          <button onClick={() => setActiveTab('cgpa')} className={`flex-1 py-2 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-2 ${ activeTab === 'cgpa'
                ? 'bg-black text-white shadow-sm'
                : 'text-gray-600 hover:text-black '
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Cumulative Multi-Semester CGPA</span>
          </button>
        </div>

        {activeTab === 'sgpa' ? (
          <>
            {/* Live SGPA KPI Scorebox */}
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between text-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 ">Baseline SGPA</span>
                <p className="text-2xl font-bold font-mono text-gray-700 ">{baselineSGPA}</p>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase font-bold text-black ">Simulated Target SGPA</span>
                <div className="text-4xl font-bold font-mono text-black mt-0.5">
                  {simulatedSGPA}
                </div>
                <span className={`text-xs font-bold font-mono mt-1 px-2.5 py-0.5 rounded-full ${ simulatedSGPA >= baselineSGPA
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {simulatedSGPA >= baselineSGPA ? `+${(simulatedSGPA - baselineSGPA).toFixed(2)}` : (simulatedSGPA - baselineSGPA).toFixed(2)}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 ">Total Credits</span>
                <p className="text-2xl font-bold font-mono text-gray-700 ">
                  {performances.reduce((acc, p) => acc + p.credits, 0)}
                </p>
              </div>
            </div>

            {/* Subject Grade Simulator Sliders */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-700 "> Simulate Target Letter Grades by Subject
              </p>

              {performances.map(p => { const currentPoint = grades[p.subjectId] ?? (p.gradePointEstimate || 8);
  return (
                  <div key={p.subjectId} className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-8 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-black ">{p.subjectName}</span>
                          <span className="text-[10px] font-mono text-gray-400 ">({p.subjectCode})</span>
                        </div>
                        <span className="text-[11px] text-gray-500 ">
                          {p.credits} Credits • Current Avg: {p.averagePercentage > 0 ? `${p.averagePercentage}%` : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <select value={currentPoint} onChange={e => handleGradeChange(p.subjectId, Number(e.target.value))} className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 font-bold focus:outline-none focus:border-black"
                      >
                        {Object.entries(GRADE_POINTS).map(([label, val]) => (
                          <option key={label} value={val}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            {/* CGPA Projection Box */}
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 text-center">
              <span className="text-xs uppercase font-bold text-black tracking-wider"> Projected Cumulative CGPA
              </span>
              <div className="text-4xl font-bold font-mono text-black my-1">
                {cumulativeCGPA}
              </div>
              <p className="text-xs text-gray-500 "> Calculated across {semesters.length + 1} semesters ({semesters.reduce((a, b) => a + b.credits, 0) + (performances.reduce((a, p) => a + p.credits, 0) || 18)} total credits).
              </p>
            </div>

            {/* Semester Inputs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700 "> Prior Semester Performance Records
                </span>
                <button onClick={handleAddSemester} className="px-3 py-1 text-[11px] font-bold text-black hover:bg-gray-100 :bg-slate-700 bg-white border border-gray-200 rounded-full transition-colors shadow-2xs"
                >
                  + Add Semester
                </button>
              </div>

              {semesters.map((s, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-black min-w-[90px]">Semester {s.sem}</span>

                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-[10px] text-gray-500 block mb-0.5">SGPA</span>
                      <input type="number" step="0.01" min="0" max="10" value={s.sgpa} onChange={e => handleUpdateSemester(idx, 'sgpa', Number(e.target.value))} className="w-20 px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-mono text-black text-center focus:outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-500 block mb-0.5">Credits</span>
                      <input type="number" min="1" max="40" value={s.credits} onChange={e => handleUpdateSemester(idx, 'credits', Number(e.target.value))} className="w-20 px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-mono text-black text-center focus:outline-none focus:border-black"
                      />
                    </div>

                    <button onClick={() => handleRemoveSemester(idx)} className="text-gray-400 hover:text-red-600 p-1 text-xs self-end mb-1" title="Remove semester"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="flex justify-end pt-2">
          <button onClick={onClose} className="px-6 py-2 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-full shadow-sm transition-all"
          > Close Simulator
          </button>
        </div>
      </div>
    </Modal>
  );
};
