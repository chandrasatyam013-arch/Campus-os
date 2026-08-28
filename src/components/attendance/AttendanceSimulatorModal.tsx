import React, { useState } from 'react';
import { Calculator, TrendingUp, TrendingDown, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { SubjectAttendanceIntelligence } from '../../types'; interface AttendanceSimulatorModalProps { isOpen: boolean; onClose: () => void; subjectIntel: SubjectAttendanceIntelligence | null;
} export const AttendanceSimulatorModal: React.FC<AttendanceSimulatorModalProps> = ({ isOpen, onClose, subjectIntel
}) => { const [attendNext, setAttendNext] = useState(5);
  const [missNext, setMissNext] = useState(0);
  if (!subjectIntel) return null;
  const currentAttended = subjectIntel.attendedClasses;
  const currentTotal = subjectIntel.totalClasses;
  const currentPercentage = subjectIntel.attendancePercentage || 0;
  const targetPercentage = subjectIntel.targetPercentage;
  const minimumPercentage = subjectIntel.minimumRequiredPercentage;

  // Projected math
  const newAttended = currentAttended + attendNext;
  const newTotal = currentTotal + attendNext + missNext;
  const projectedPercentage = newTotal === 0 ? 100 : Number(((newAttended / newTotal) * 100).toFixed(2));
  const diffPercentage = Number((projectedPercentage - currentPercentage).toFixed(2));
  const isSafe = projectedPercentage >= targetPercentage;
  const isBorderline = projectedPercentage >= minimumPercentage && projectedPercentage < targetPercentage;
  const isDanger = projectedPercentage < minimumPercentage;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Attendance What-If Simulator" subtitle={`Simulate future class attendance scenarios for ${subjectIntel.subjectName} (${subjectIntel.subjectCode})`} maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Current State Summary */}
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 grid grid-cols-3 gap-3 text-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 ">Current</span>
            <p className="text-xl font-bold font-mono text-black mt-0.5">{subjectIntel.attendancePercentage === null ? '-' : `${currentPercentage}%`}</p>
            <span className="text-[10px] text-gray-400 font-mono">{currentAttended}/{currentTotal} classes</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 ">Target</span>
            <p className="text-xl font-bold font-mono text-black mt-0.5">{targetPercentage}%</p>
            <span className="text-[10px] text-gray-400 ">Needs +{subjectIntel.classesNeededForTarget}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 ">Safe Absences</span>
            <p className={`text-xl font-bold font-mono mt-0.5 ${subjectIntel.classesCanMiss > 1 ? 'text-emerald-800' : 'text-amber-800'}`}>
              {subjectIntel.classesCanMiss}
            </p>
            <span className="text-[10px] text-gray-400 ">Min {minimumPercentage}%</span>
          </div>
        </div>

        {/* Real-time Projection Card */}
        <div className={`p-6 rounded-2xl border text-center transition-all ${ isSafe
            ? 'bg-emerald-50 border-emerald-100 text-emerald-950'
            : isBorderline
            ? 'bg-amber-50 border-amber-100 text-amber-950'
            : 'bg-red-50 border-red-100 text-red-950'
        }`}>
          <span className="text-xs uppercase font-bold tracking-wider text-gray-500 "> Projected Attendance
          </span>
          <div className="text-4xl font-bold font-mono my-2 flex items-center justify-center gap-2 text-black ">
            <span>{projectedPercentage}%</span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-sans font-bold ${ diffPercentage >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
            }`}>
              {diffPercentage >= 0 ? `+${diffPercentage}%` : `${diffPercentage}%`}
            </span>
          </div>
          <p className="text-xs text-gray-600 "> Based on {newAttended} attended out of {newTotal} total classes.
          </p>

          <div className="mt-3 text-xs font-medium">
            {isSafe && (
              <span className="flex items-center justify-center gap-1.5 text-emerald-800">
                <CheckCircle2 className="w-4 h-4" /> Scenario meets or exceeds your {targetPercentage}% target!
              </span>
            )}
            {isBorderline && (
              <span className="flex items-center justify-center gap-1.5 text-amber-800">
                <AlertTriangle className="w-4 h-4" /> Above {minimumPercentage}% minimum, but still below {targetPercentage}% target.
              </span>
            )}
            {isDanger && (
              <span className="flex items-center justify-center gap-1.5 text-red-800">
                <AlertTriangle className="w-4 h-4" /> Danger: This scenario drops attendance below the required {minimumPercentage}% minimum!
              </span>
            )}
          </div>
        </div>

        {/* Interactive Sliders */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-bold text-gray-700 mb-1.5">
              <span className="flex items-center gap-1 text-emerald-800">
                <TrendingUp className="w-3.5 h-3.5" /> Consecutive Classes to Attend: +{attendNext}
              </span>
              <span className="font-mono text-black ">{attendNext} sessions</span>
            </div>
            <input type="range" min="0" max="30" value={attendNext} onChange={e => setAttendNext(Number(e.target.value))} className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-black"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>0</span>
              <span>10</span>
              <span>20</span>
              <span>30 classes</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-gray-700 mb-1.5">
              <span className="flex items-center gap-1 text-red-700">
                <TrendingDown className="w-3.5 h-3.5" /> Classes to Miss (Absences): +{missNext}
              </span>
              <span className="font-mono text-black ">{missNext} missed</span>
            </div>
            <input type="range" min="0" max="15" value={missNext} onChange={e => setMissNext(Number(e.target.value))} className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-gray-400"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>0</span>
              <span>5</span>
              <span>10</span>
              <span>15 misses</span>
            </div>
          </div>
        </div>

        {/* Fast Presets */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2"> Quick Simulation Presets
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button onClick={() => { setAttendNext(5);
  setMissNext(0); }} className="px-3 py-2 text-xs font-medium bg-gray-50 hover:bg-gray-100 :bg-slate-700 text-gray-700 rounded-xl border border-gray-200 transition-colors text-center"
            > Attend next 5
            </button>
            <button onClick={() => { setAttendNext(10);
  setMissNext(0); }} className="px-3 py-2 text-xs font-medium bg-gray-50 hover:bg-gray-100 :bg-slate-700 text-gray-700 rounded-xl border border-gray-200 transition-colors text-center"
            > Attend next 10
            </button>
            <button onClick={() => { setAttendNext(0);
  setMissNext(1); }} className="px-3 py-2 text-xs font-medium bg-gray-50 hover:bg-gray-100 :bg-slate-700 text-gray-700 rounded-xl border border-gray-200 transition-colors text-center"
            > Miss next 1
            </button>
            <button onClick={() => { setAttendNext(0);
  setMissNext(3); }} className="px-3 py-2 text-xs font-medium bg-gray-50 hover:bg-gray-100 :bg-slate-700 text-gray-700 rounded-xl border border-gray-200 transition-colors text-center"
            > Miss next 3
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button onClick={onClose} className="px-6 py-2 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-full shadow-sm transition-all"
          > Done
          </button>
        </div>
      </div>
    </Modal>
  );
};
