import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Trash2, CheckCircle2, Clock, AlertCircle, Filter, Calendar, Layers
} from 'lucide-react';
import { Assignment, Subject, AssignmentPriority, AssignmentStatus } from '../types';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { CreateAssignmentModal } from '../components/assignments/CreateAssignmentModal'; export const AssignmentsView: React.FC = () => { const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filterSubject, setFilterSubject] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const loadData = async () => { setLoading(true);
  try { const [subs, asgns] = await Promise.all([ api.getSubjects(), api.getAssignments()
      ]);
  setSubjects(subs);
  setAssignments(asgns);
    }
  catch (err: any) { toast.error('Failed to load assignments', err.message);
    }
  finally { setLoading(false);
    }
  };
  useEffect(() => { loadData();
  }, []);
  const handleStatusChange = async (id: string, newStatus: AssignmentStatus) => { try { await api.updateAssignment(id, { status: newStatus });
  toast.success( newStatus === 'COMPLETED' ? 'Assignment marked complete! 🎉' : 'Assignment status updated',
        `Task moved to ${newStatus.replace('_', ' ')}`
      ); loadData();
    }
  catch (err: any) { toast.error('Update failed', err.message);
    }
  };
  const handleDelete = async (id: string) => { if (!confirm('Are you sure you want to delete this assignment?')) return;
  try { await api.deleteAssignment(id);
  toast.success('Assignment deleted'); loadData();
    }
  catch (err: any) { toast.error('Failed to delete', err.message);
    }
  };
  const getSubject = (subId: string) => { return subjects.find(s => s.id === subId);
  };
  const getPriorityBadge = (priority: AssignmentPriority) => { switch (priority) { case 'CRITICAL': return 'bg-rose-50 text-rose-700 border-rose-100'; case 'HIGH': return 'bg-amber-50 text-amber-700 border-amber-100'; case 'MEDIUM': return 'bg-sky-50 text-sky-700 border-sky-100'; case 'LOW': default: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    }
  };
  const filteredAssignments = assignments.filter(a => { if (filterSubject !== 'ALL' && a.subjectId !== filterSubject) return false;
  if (filterStatus === 'PENDING' && a.status === 'COMPLETED') return false;
  if (filterStatus === 'COMPLETED' && a.status !== 'COMPLETED') return false;
  return true;
  });
  const pendingCount = assignments.filter(a => a.status !== 'COMPLETED').length;
  const completedCount = assignments.filter(a => a.status === 'COMPLETED').length;
  if (loading) { return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-400 font-medium">Loading assignments & priority board...</p>
      </div>
    );
  };
  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-1">Task Deliverables</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-black tracking-tight">Assignment Priorities & Tasks</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1"> Track submissions, deadlines, estimated effort, and academic deliverables.
          </p>
        </div>

        <button onClick={() => setShowCreateModal(true)} className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-full shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Assignment</span>
        </button>
      </div>

      {/* Overview Metric Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-[24px] bg-white border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pending Tasks</span>
            <p className="text-3xl font-bold font-mono text-black mt-0.5">{pendingCount}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
            <Clock className="w-5 h-5 text-gray-700 " />
          </div>
        </div>

        <div className="p-6 rounded-[24px] bg-white border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Completed</span>
            <p className="text-3xl font-bold font-mono text-emerald-700 mt-0.5">{completedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          </div>
        </div>

        <div className="p-6 rounded-[24px] bg-white border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Tasks</span>
            <p className="text-3xl font-bold font-mono text-black mt-0.5">{assignments.length}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
            <Layers className="w-5 h-5 text-gray-700 " />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-gray-100 shadow-2xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter by:</span>
          </div>

          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-800 font-medium focus:outline-none focus:border-black"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Only</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-800 font-medium focus:outline-none focus:border-black"
          >
            <option value="ALL">All Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredAssignments.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-[32px] border border-gray-100 shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2 opacity-75" />
            <h3 className="text-base font-bold text-black ">No tasks matching criteria</h3>
            <p className="text-xs text-gray-400 mt-1">Create an assignment to start tracking deadlines and effort.</p>
          </div>
        ) : ( filteredAssignments.map(asgn => { const sub = getSubject(asgn.subjectId);
  const isCompleted = asgn.status === 'COMPLETED';
  const deadlineDate = new Date(asgn.deadline);
  const isOverdue = !isCompleted && deadlineDate.getTime() < Date.now();
  return (
              <div key={asgn.id} className={`p-5 sm:p-6 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${ isCompleted
                    ? 'bg-gray-50 border-gray-200 opacity-60'
                    : isOverdue
                    ? 'bg-rose-50/40 border-rose-200 shadow-2xs'
                    : 'bg-white border-gray-100 hover:border-gray-300 shadow-2xs'
                }`}
              >
                {/* Left check & info */}
                <div className="flex items-start gap-4">
                  <button onClick={() => handleStatusChange(asgn.id, isCompleted ? 'NOT_STARTED' : 'COMPLETED')} className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all ${ isCompleted
                        ? 'bg-black border-black text-white'
                        : 'bg-white border-gray-300 hover:border-black text-transparent'
                    }`} title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`text-sm font-bold ${isCompleted ? 'line-through text-gray-400 ' : 'text-black '}`}>
                        {asgn.title}
                      </h3>
                      {sub && (
                        <span className="px-2.5 py-0.5 text-[10px] font-semibold rounded-full border" style={{ backgroundColor: `${sub.color}15`, borderColor: `${sub.color}35`, color: sub.color
                          }}
                        >
                          {sub.code}
                        </span>
                      )}
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border uppercase ${getPriorityBadge(asgn.priority)}`}>
                        {asgn.priority}
                      </span>
                      {isOverdue && (
                        <span className="px-2.5 py-0.5 text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100 rounded-full"> OVERDUE
                        </span>
                      )}
                    </div>

                    {asgn.description && (
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {asgn.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-[11px] text-gray-400 mt-2">
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-gray-400 " /> Due: {deadlineDate.toLocaleDateString()} at {deadlineDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {asgn.estimatedHours && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400 " /> Est. {asgn.estimatedHours} hrs
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 ">
                  <select value={asgn.status} onChange={e => handleStatusChange(asgn.id, e.target.value as AssignmentStatus)} className="px-3.5 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-800 font-semibold focus:outline-none focus:border-black"
                  >
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>

                  <button onClick={() => handleDelete(asgn.id)} className="p-1.5 text-gray-400 hover:text-rose-600 rounded-full hover:bg-gray-100 :bg-slate-700 transition-colors" title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateAssignmentModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} subjects={subjects} onSuccess={loadData}
        />
      )}
    </div>
  );
};
