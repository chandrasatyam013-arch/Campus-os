import React, { useState } from 'react';
import { Download, FileJson, FileSpreadsheet, ShieldCheck } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext'; interface DataExportModalProps { isOpen: boolean; onClose: () => void;
} export const DataExportModal: React.FC<DataExportModalProps> = ({ isOpen, onClose }) => { const [format, setFormat] = useState<'json' | 'csv'>('json');
  const [downloading, setDownloading] = useState(false);
  const toast = useToast();
  const handleExport = async () => { setDownloading(true);
  try { const data = await api.exportData();
  if (format === 'json') { const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `campus_os_backup_${new Date().toISOString().split('T')[0]}.json`; a.click(); URL.revokeObjectURL(url);
      }
  else {
        // Build CSV representation of subjects & attendance
  let csvContent = 'data:text/csv;charset=utf-8,'; csvContent += 'CATEGORY,CODE,NAME,VALUE1,VALUE2,DATE\n'; data.subjects?.forEach((s: any) => { csvContent += `SUBJECT,${s.code},"${s.name}",${s.credits} Credits,Min ${s.minimumAttendance}%,${s.createdAt}\n`;
        }); data.attendance?.forEach((a: any) => { csvContent += `ATTENDANCE,${a.subjectId},${a.status},${a.classType},-,${a.date}\n`;
        }); data.marks?.forEach((m: any) => { csvContent += `MARK,${m.subjectId},"${m.assessmentName}",${m.obtainedMarks}/${m.maximumMarks},${m.assessmentType},${m.date}\n`;
        }); data.assignments?.forEach((asgn: any) => { csvContent += `ASSIGNMENT,${asgn.subjectId},"${asgn.title}",${asgn.priority},${asgn.status},${asgn.deadline}\n`;
        });
  const encodedUri = encodeURI(csvContent);
  const a = document.createElement('a'); a.href = encodedUri; a.download = `campus_os_academic_dossier_${new Date().toISOString().split('T')[0]}.csv`; a.click();
      } toast.success('Data Dossier Exported', `Downloaded complete academic backup as .${format.toUpperCase()}`); onClose();
    }
  catch (err: any) { toast.error('Export Failed', err.message);
    }
  finally { setDownloading(false);
    }
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Academic Data Dossier" subtitle="Download a full offline snapshot of your subjects, attendance logs, marks, assignments, and schedule." maxWidth="md"
    >
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs text-gray-700 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-black shrink-0 mt-0.5" />
          <p className="leading-relaxed"> Your academic records are private. Exported dossiers contain your raw data with timestamps, foreign keys, and calculated grade weights.
          </p>
        </div>

        {/* Format Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2"> Select Export Format
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setFormat('json')} className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${ format === 'json'
                  ? 'bg-black text-white border-black shadow-sm'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300 '
              }`}
            >
              <FileJson className={`w-6 h-6 ${format === 'json' ? 'text-white' : 'text-gray-900 '}`} />
              <div className="text-center">
                <p className="text-xs font-bold">Complete JSON</p>
                <p className={`text-[10px] mt-0.5 ${format === 'json' ? 'text-gray-300' : 'text-gray-400 '}`}>Machine-readable format with full metadata</p>
              </div>
            </button>

            <button type="button" onClick={() => setFormat('csv')} className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${ format === 'csv'
                  ? 'bg-black text-white border-black shadow-sm'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300 '
              }`}
            >
              <FileSpreadsheet className={`w-6 h-6 ${format === 'csv' ? 'text-white' : 'text-gray-900 '}`} />
              <div className="text-center">
                <p className="text-xs font-bold">Spreadsheet CSV</p>
                <p className={`text-[10px] mt-0.5 ${format === 'csv' ? 'text-gray-300' : 'text-gray-400 '}`}>Excel & Sheets compatible tabular rows</p>
              </div>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-gray-700 hover:text-black bg-gray-100 rounded-full transition-colors"
          > Cancel
          </button>
          <button type="button" onClick={handleExport} disabled={downloading} className="px-5 py-2 text-xs font-bold text-white bg-black hover:bg-neutral-800 disabled:opacity-50 rounded-full shadow-sm transition-all flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? 'Preparing...' : 'Download Export'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
