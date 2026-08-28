import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Subject, AssignmentPriority, AssignmentStatus } from '../../types';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext'; interface CreateAssignmentModalProps { isOpen: boolean; onClose: () => void; subjects: Subject[]; onSuccess: () => void;
} export const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({ isOpen, onClose, subjects, onSuccess
}) => { const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 3); d.setHours(23, 59, 0, 0);
  return d.toISOString().slice(0, 16);
  });
  const [priority, setPriority] = useState<AssignmentPriority>('HIGH');
  const [estimatedHours, setEstimatedHours] = useState('3');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault();
  if (!subjectId || !title || !deadline) { toast.error('Please provide a subject, title, and deadline.'); return;
    } setLoading(true);
  try { await api.createAssignment({ subjectId, title: title.trim(), description: description.trim() || undefined, deadline: new Date(deadline).toISOString(), priority, status: 'NOT_STARTED', estimatedHours: estimatedHours ? Number(estimatedHours) : undefined
      });
  toast.success('Assignment Created', `Added "${title}" with ${priority} priority.`); onSuccess(); onClose();
    }
  catch (err: any) { toast.error('Failed to create assignment', err.message);
    }
  finally { setLoading(false);
    }
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Assignment / Project" subtitle="Track your submissions, priorities, and deadlines." maxWidth="md"
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

        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5"> Assignment Title
          </label>
          <input type="text" placeholder="e.g. Graph Algorithms & Dijkstra Visualizer" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-black" required
          />
        </div>

        {/* Deadline & Priority */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5"> Deadline Date & Time
            </label>
            <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-black font-mono" required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5"> Priority
            </label>
            <select value={priority} onChange={e => setPriority(e.target.value as AssignmentPriority)} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-black font-bold"
            >
              <option value="CRITICAL">Critical (Urgent)</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>
        </div>

        {/* Estimated Hours */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5"> Estimated Effort (Hours)
          </label>
          <input type="number" min="0.5" step="0.5" placeholder="e.g. 4" value={estimatedHours} onChange={e => setEstimatedHours(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-black font-mono"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5"> Description / Requirements (Optional)
          </label>
          <textarea rows={3} placeholder="Key rubric points, submission format, or problem set numbers..." value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-black"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-gray-700 hover:text-black bg-gray-100 rounded-full transition-colors"
          > Cancel
          </button>
          <button type="submit" disabled={loading} className="px-5 py-2 text-xs font-bold text-white bg-black hover:bg-neutral-800 disabled:opacity-50 rounded-full shadow-sm transition-all"
          >
            {loading ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
