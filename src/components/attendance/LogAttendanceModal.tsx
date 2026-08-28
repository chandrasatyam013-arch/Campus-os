import React, { useState } from 'react';
import { Check, X, ShieldAlert, Calendar } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Subject } from '../../types';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext'; interface LogAttendanceModalProps { isOpen: boolean; onClose: () => void; subjects: Subject[]; defaultSubjectId?: string; onSuccess: () => void;
} export const LogAttendanceModal: React.FC<LogAttendanceModalProps> = ({ isOpen, onClose, subjects, defaultSubjectId, onSuccess
}) => { const [subjectId, setSubjectId] = useState(defaultSubjectId || subjects[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'PRESENT' | 'ABSENT' | 'EXCUSED'>('PRESENT');
  const [classType, setClassType] = useState<'LECTURE' | 'LAB' | 'TUTORIAL'>('LECTURE');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault();
  if (!subjectId) { toast.error('Please select a subject.'); return;
    } setLoading(true);
  try { await api.logAttendance({ subjectId, date, status, classType, notes: notes.trim() || undefined
      });
  toast.success( status === 'PRESENT' ? 'Attendance Recorded (+1 Present)' : 'Absence Recorded',
        `Logged for ${subjects.find(s => s.id === subjectId)?.name || 'Subject'}`
      ); onSuccess(); onClose();
    }
  catch (err: any) { toast.error('Failed to log attendance', err.message);
    }
  finally { setLoading(false);
    }
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Class Attendance" subtitle="Record your attendance or absence for today or a previous class." maxWidth="md"
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

        {/* Date & Class Type */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5"> Date
            </label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-black font-mono" required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5"> Class Type
            </label>
            <select value={classType} onChange={e => setClassType(e.target.value as any)} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-black"
            >
              <option value="LECTURE">Lecture</option>
              <option value="LAB">Lab Session</option>
              <option value="TUTORIAL">Tutorial</option>
            </select>
          </div>
        </div>

        {/* Attendance Status Buttons */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5"> Status
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button type="button" onClick={() => setStatus('PRESENT')} className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${ status === 'PRESENT'
                  ? 'bg-black text-white border-black shadow-sm'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300 '
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Present</span>
            </button>

            <button type="button" onClick={() => setStatus('ABSENT')} className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${ status === 'ABSENT'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300 '
              }`}
            >
              <X className="w-3.5 h-3.5" />
              <span>Absent</span>
            </button>

            <button type="button" onClick={() => setStatus('EXCUSED')} className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${ status === 'EXCUSED'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300 '
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Excused</span>
            </button>
          </div>
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5"> Notes (Optional)
          </label>
          <input type="text" placeholder="e.g. Professor covered Module 3 Graph algorithms" value={notes} onChange={e => setNotes(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-black"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-gray-700 hover:text-black bg-gray-100 rounded-full transition-colors"
          > Cancel
          </button>
          <button type="submit" disabled={loading} className="px-5 py-2 text-xs font-bold text-white bg-black hover:bg-neutral-800 disabled:opacity-50 rounded-full shadow-sm transition-all"
          >
            {loading ? 'Logging...' : 'Save Record'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
