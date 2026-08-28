import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Edit2, CalendarCheck2, GraduationCap, Layers, Check
} from 'lucide-react';
import { Subject } from '../types';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/ui/Modal';
  const PRESET_COLORS = [
  '#6366f1', // Indigo
  '#3b82f6', // Blue
  '#0ea5e9', // Sky
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Rose
  '#a855f7', // Purple
  '#ec4899'  // Pink
]; export const SubjectsView: React.FC = () => { const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [credits, setCredits] = useState('4');
  const [semester, setSemester] = useState('1');
  const [targetAttendance, setTargetAttendance] = useState('85');
  const [minimumAttendance, setMinimumAttendance] = useState('75');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [instructor, setInstructor] = useState('');
  const [room, setRoom] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const loadSubjects = async () => { setLoading(true);
  try { const res = await api.getSubjects();
  setSubjects(res);
    }
  catch (err: any) { toast.error('Failed to load subjects', err.message);
    }
  finally { setLoading(false);
    }
  };
  useEffect(() => { loadSubjects();
  }, []);
  const handleOpenCreate = () => { setEditingSubject(null);
  setName('');
  setCode('');
  setCredits('4');
  setSemester('1');
  setTargetAttendance('85');
  setMinimumAttendance('75');
  setColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
  setInstructor('');
  setRoom('');
  setShowModal(true);
  };
  const handleOpenEdit = (s: Subject) => { setEditingSubject(s);
  setName(s.name);
  setCode(s.code);
  setCredits(String(s.credits));
  setSemester(String(s.semester || 1));
  setTargetAttendance(String(s.targetAttendance));
  setMinimumAttendance(String(s.minimumAttendance));
  setColor(s.color || PRESET_COLORS[0]);
  setInstructor(s.instructor || '');
  setRoom(s.room || '');
  setShowModal(true);
  };
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault();
  if (!name || !code) { toast.error('Subject name and code are required.'); return;
    } setSubmitting(true);
  try { const payload = { name: name.trim(), code: code.trim().toUpperCase(), credits: Number(credits) || 4, semester: Number(semester) || 1, targetAttendance: Number(targetAttendance) || 85, minimumAttendance: Number(minimumAttendance) || 75, color, instructor: instructor.trim() || undefined, room: room.trim() || undefined
      };
  if (editingSubject) { await api.updateSubject(editingSubject.id, payload);
  toast.success('Subject Updated', `Saved changes to ${payload.name}`);
      }
  else { await api.createSubject(payload);
  toast.success('Subject Added', `Enrolled into ${payload.name} (${payload.code})`);
      } setShowModal(false); loadSubjects();
    }
  catch (err: any) { toast.error('Action Failed', err.message);
    }
  finally { setSubmitting(false);
    }
  };
  const handleDelete = async (id: string, subName: string) => { if (!confirm(`Are you sure you want to remove ${subName}? This will cascade delete its attendance, marks, and timetable entries.`)) { return;
    } try { await api.deleteSubject(id);
  toast.success('Subject Removed', `${subName} and associated logs were deleted.`); loadSubjects();
    }
  catch (err: any) { toast.error('Failed to delete subject', err.message);
    }
  };
  if (loading) { return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-400 font-medium">Loading enrolled subjects...</p>
      </div>
    );
  };
  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-1">Academic Curriculum</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-black tracking-tight">Enrolled Subjects & Credits</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1"> Configure credit weights, attendance target thresholds, professors, and subject color keys.
          </p>
        </div>

        <button onClick={handleOpenCreate} className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-full shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Subject</span>
        </button>
      </div>

      {/* Grid of Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {subjects.map(s => (
          <div key={s.id} className="p-6 rounded-[28px] bg-white border border-gray-100 shadow-sm hover:border-gray-300 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: s.color }}
                  />
                  <div>
                    <h3 className="text-sm font-bold text-black leading-snug">{s.name}</h3>
                    <span className="text-[11px] font-mono text-gray-400 font-bold">{s.code}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button onClick={() => handleOpenEdit(s)} className="p-1.5 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 :bg-slate-700 transition-colors" title="Edit subject"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(s.id, s.name)} className="p-1.5 text-gray-400 hover:text-rose-600 rounded-full hover:bg-gray-100 :bg-slate-700 transition-colors" title="Delete subject"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Metadata Badges */}
              <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
                <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 ">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Semester</span>
                  <span className="font-mono font-bold text-black text-sm mt-0.5 block">Sem {s.semester || 1}</span>
                </div>
                <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 ">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Credit Weight</span>
                  <span className="font-mono font-bold text-black text-sm mt-0.5 block">{s.credits} Credits</span>
                </div>
                <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 ">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Target Att.</span>
                  <span className="font-mono font-bold text-black text-sm mt-0.5 block">{s.targetAttendance}%</span>
                </div>
              </div>
            </div>

            {/* Footer details */}
            <div className="pt-3 border-t border-gray-100 text-xs text-gray-500 flex items-center justify-between">
              <span>{s.instructor ? `Faculty: ${s.instructor}` : 'Instructor unassigned'}</span>
              <span>{s.room ? `Room: ${s.room}` : '—'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingSubject ? 'Edit Subject Details' : 'Add Enrolled Subject'} subtitle="Configure course credit weight, target attendance threshold, and color identifier." maxWidth="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5"> Subject Name
              </label>
              <input type="text" placeholder="e.g. Distributed Operating Systems" value={name} onChange={e => setName(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-black" required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5"> Subject Code
                </label>
                <input type="text" placeholder="e.g. CS401" value={code} onChange={e => setCode(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-black font-mono" required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5"> Semester (1-10)
                </label>
                <input type="number" min="1" max="12" value={semester} onChange={e => setSemester(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-black font-mono" required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5"> Credits (1-10)
                </label>
                <input type="number" min="1" max="12" value={credits} onChange={e => setCredits(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-black font-mono" required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5"> Target Attendance %
                </label>
                <input type="number" min="50" max="100" value={targetAttendance} onChange={e => setTargetAttendance(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-black font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5"> Min Allowed %
                </label>
                <input type="number" min="50" max="100" value={minimumAttendance} onChange={e => setMinimumAttendance(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-black font-mono"
                />
              </div>
            </div>

            {/* Color Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5"> Color Identifier
              </label>
              <div className="flex items-center gap-2">
                {PRESET_COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setColor(c)} className={`w-7 h-7 rounded-full border flex items-center justify-center transition-transform ${ color === c ? 'scale-110 border-black ring-2 ring-black/20' : 'border-transparent hover:scale-105'
                    }`} style={{ backgroundColor: c }}
                  >
                    {color === c && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5"> Faculty Name (Optional)
                </label>
                <input type="text" placeholder="e.g. Dr. Vance" value={instructor} onChange={e => setInstructor(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5"> Room / Lab (Optional)
                </label>
                <input type="text" placeholder="e.g. Hall 4" value={room} onChange={e => setRoom(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-medium text-gray-700 hover:text-black bg-gray-100 rounded-full transition-colors"
              > Cancel
              </button>
              <button type="submit" disabled={submitting} className="px-5 py-2 text-xs font-bold text-white bg-black hover:bg-neutral-800 disabled:opacity-50 rounded-full shadow-sm transition-all"
              >
                {submitting ? 'Saving...' : editingSubject ? 'Update Subject' : 'Create Subject'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
