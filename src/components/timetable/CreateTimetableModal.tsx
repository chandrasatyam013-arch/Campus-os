import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Subject, DayOfWeek } from '../../types';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext'; interface CreateTimetableModalProps { isOpen: boolean; onClose: () => void; subjects: Subject[]; onSuccess: () => void;
} export const CreateTimetableModal: React.FC<CreateTimetableModalProps> = ({ isOpen, onClose, subjects, onSuccess
}) => { const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [day, setDay] = useState<DayOfWeek>('MONDAY');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [room, setRoom] = useState('');
  const [instructor, setInstructor] = useState('');
  const [classType, setClassType] = useState<'LECTURE' | 'LAB' | 'TUTORIAL'>('LECTURE');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault();
  if (!subjectId || !day || !startTime || !endTime) { toast.error('Please fill in all required fields.'); return;
    } setLoading(true);
  try { await api.createTimetableEntry({ subjectId, day, startTime, endTime, room: room.trim() || undefined, instructor: instructor.trim() || undefined, classType
      });
  toast.success('Timetable Slot Added', `Scheduled for ${day} at ${startTime}.`); onSuccess(); onClose();
    }
  catch (err: any) { toast.error('Failed to add slot', err.message);
    }
  finally { setLoading(false);
    }
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Timetable Class Slot" subtitle="Configure recurring weekly lecture or lab slots." maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Subject */}
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

        {/* Day & Type */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5"> Day of Week
            </label>
            <select value={day} onChange={e => setDay(e.target.value as DayOfWeek)} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-black"
            >
              <option value="MONDAY">Monday</option>
              <option value="TUESDAY">Tuesday</option>
              <option value="WEDNESDAY">Wednesday</option>
              <option value="THURSDAY">Thursday</option>
              <option value="FRIDAY">Friday</option>
              <option value="SATURDAY">Saturday</option>
              <option value="SUNDAY">Sunday</option>
            </select>
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

        {/* Times */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5"> Start Time
            </label>
            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-black font-mono" required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5"> End Time
            </label>
            <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-black font-mono" required
            />
          </div>
        </div>

        {/* Location & Instructor */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5"> Room / Lab
            </label>
            <input type="text" placeholder="e.g. Lab B-204" value={room} onChange={e => setRoom(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5"> Instructor Name
            </label>
            <input type="text" placeholder="e.g. Dr. Vance" value={instructor} onChange={e => setInstructor(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-black"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-gray-700 hover:text-black bg-gray-100 rounded-full transition-colors"
          > Cancel
          </button>
          <button type="submit" disabled={loading} className="px-5 py-2 text-xs font-bold text-white bg-black hover:bg-neutral-800 disabled:opacity-50 rounded-full shadow-sm transition-all"
          >
            {loading ? 'Adding...' : 'Add Slot'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
