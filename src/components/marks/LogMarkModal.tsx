import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Subject, AssessmentType } from '../../types';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext'; interface LogMarkModalProps { isOpen: boolean; onClose: () => void; subjects: Subject[]; defaultSubjectId?: string; onSuccess: () => void;
} export const LogMarkModal: React.FC<LogMarkModalProps> = ({ isOpen, onClose, subjects, defaultSubjectId, onSuccess
}) => { const [subjectId, setSubjectId] = useState(defaultSubjectId || subjects[0]?.id || '');
  const [assessmentName, setAssessmentName] = useState('');
  const [assessmentType, setAssessmentType] = useState<AssessmentType>('CT');
  const [obtainedMarks, setObtainedMarks] = useState<string>('');
  const [maximumMarks, setMaximumMarks] = useState<string>('50');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault();
  if (!subjectId || !assessmentName || obtainedMarks === '' || !maximumMarks) { toast.error('Please fill in all required fields.'); return;
    };
  const obt = Number(obtainedMarks);
  const max = Number(maximumMarks);
  if (isNaN(obt) || isNaN(max) || max <= 0) { toast.error('Please enter valid numeric marks.'); return;
    };
  if (obt > max) { toast.error('Obtained marks cannot exceed maximum marks.'); return;
    } setLoading(true);
  try { await api.createMark({ subjectId, assessmentName: assessmentName.trim(), assessmentType, obtainedMarks: obt, maximumMarks: max, date, notes: notes.trim() || undefined
      });
  const pct = ((obt / max) * 100).toFixed(1);
  toast.success('Assessment Score Logged', `${assessmentName}: ${obt}/${max} (${pct}%)`); onSuccess(); onClose();
    }
  catch (err: any) { toast.error('Failed to log marks', err.message);
    }
  finally { setLoading(false);
    }
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Assessment Marks" subtitle="Enter scores for continuous tests, midterms, labs, or assignments." maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Subject Select */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5"> Subject
          </label>
          <select value={subjectId} onChange={e => setSubjectId(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-black" required
          >
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>

        {/* Assessment Name */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5"> Assessment Name
          </label>
          <input type="text" placeholder="e.g. Continuous Assessment 2 (Dynamic Programming)" value={assessmentName} onChange={e => setAssessmentName(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-black" required
          />
        </div>

        {/* Type & Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5"> Assessment Type
            </label>
            <select value={assessmentType} onChange={e => setAssessmentType(e.target.value as any)} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-black"
            >
              <option value="CT">Continuous Test (CT)</option>
              <option value="MIDTERM">Midterm Exam</option>
              <option value="FINAL_EXAM">Final Exam</option>
              <option value="ASSIGNMENT">Graded Assignment</option>
              <option value="LAB">Lab Assessment</option>
              <option value="QUIZ">Quiz</option>
              <option value="PROJECT">Course Project</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5"> Date
            </label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-black font-mono" required
            />
          </div>
        </div>

        {/* Score Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5"> Obtained Marks
            </label>
            <input type="number" step="0.5" placeholder="e.g. 42" value={obtainedMarks} onChange={e => setObtainedMarks(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-black font-mono text-base" required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5"> Maximum Marks
            </label>
            <input type="number" step="1" placeholder="e.g. 50" value={maximumMarks} onChange={e => setMaximumMarks(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-black font-mono text-base" required
            />
          </div>
        </div>

        {/* Calculated Percentage Preview */}
        {obtainedMarks !== '' && maximumMarks !== '' && Number(maximumMarks) > 0 && (
          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-600 ">Score Percentage:</span>
            <span className="font-mono font-bold text-black ">
              {((Number(obtainedMarks) / Number(maximumMarks)) * 100).toFixed(1)}%
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-gray-700 hover:text-black bg-gray-100 rounded-full transition-colors"
          > Cancel
          </button>
          <button type="submit" disabled={loading} className="px-5 py-2 text-xs font-bold text-white bg-black hover:bg-neutral-800 disabled:opacity-50 rounded-full shadow-sm transition-all"
          >
            {loading ? 'Saving...' : 'Save Assessment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
