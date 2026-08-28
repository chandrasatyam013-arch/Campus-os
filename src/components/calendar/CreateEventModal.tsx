import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Subject, EventType } from '../../types';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext'; interface CreateEventModalProps { isOpen: boolean; onClose: () => void; subjects: Subject[]; onSuccess: () => void;
} export const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose, subjects, onSuccess
}) => { const [title, setTitle] = useState('');
  const [type, setType] = useState<EventType>('EXAM');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:30');
  const [endTime, setEndTime] = useState('12:30');
  const [subjectId, setSubjectId] = useState<string>('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault();
  if (!title || !date) { toast.error('Title and date are required.'); return;
    } setLoading(true);
  try { await api.createEvent({ title: title.trim(), type, date, startTime: startTime || undefined, endTime: endTime || undefined, subjectId: subjectId || undefined, location: location.trim() || undefined, description: description.trim() || undefined
      });
  toast.success('Academic Event Added', `Scheduled "${title}" on ${date}.`); onSuccess(); onClose();
    }
  catch (err: any) { toast.error('Failed to create event', err.message);
    }
  finally { setLoading(false);
    }
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Academic Calendar Event" subtitle="Schedule examinations, continuous assessments, hackathons, or project milestones." maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5"> Event Title
          </label>
          <input type="text" placeholder="e.g. Discrete Math Mid-Semester Examination" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500" required
          />
        </div>

        {/* Type & Subject */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5"> Category
            </label>
            <select value={type} onChange={e => setType(e.target.value as EventType)} className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="EXAM">University Exam</option>
              <option value="CT">Continuous Assessment (CT)</option>
              <option value="ASSIGNMENT">Assignment Due Date</option>
              <option value="PROJECT">Project Viva / Milestone</option>
              <option value="HOLIDAY">Holiday / Break</option>
              <option value="OTHER">Symposium / Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5"> Related Subject (Optional)
            </label>
            <select value={subjectId} onChange={e => setSubjectId(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="">None / General</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date & Times */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5"> Date
            </label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500 font-mono" required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5"> Start Time
            </label>
            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5"> End Time
            </label>
            <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5"> Location / Hall (Optional)
          </label>
          <input type="text" placeholder="e.g. Main Examination Hall 1" value={location} onChange={e => setLocation(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5"> Syllabus / Notes
          </label>
          <textarea rows={2} placeholder="Key units covered or allowable materials..." value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl transition-colors"
          > Cancel
          </button>
          <button type="submit" disabled={loading} className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
          >
            {loading ? 'Adding...' : 'Schedule Event'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
