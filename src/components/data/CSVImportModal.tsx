import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext'; interface CSVImportModalProps { isOpen: boolean; onClose: () => void; onSuccess: () => void;
} export const CSVImportModal: React.FC<CSVImportModalProps> = ({ isOpen, onClose, onSuccess
}) => { const [dataType, setDataType] = useState<'subjects' | 'attendance' | 'marks' | 'assignments'>('subjects');
  const [csvContent, setCsvContent] = useState('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const SAMPLE_TEMPLATES = { subjects: `name,code,credits,minimumAttendance,targetAttendance\nCloud Computing,CS305,3,75,85\nOperating Systems,CS306,4,75,85`, attendance: `subjectCode,date,status,classType\nCS301,2026-03-24,PRESENT,LECTURE\nCS302,2026-03-24,PRESENT,LAB\nMA301,2026-03-24,ABSENT,LECTURE`, marks: `subjectCode,assessmentName,assessmentType,obtainedMarks,maximumMarks,date\nCS301,Quiz 1,QUIZ,18,20,2026-03-20\nCS302,Midterm Exam,MIDTERM,82,100,2026-03-22`, assignments: `subjectCode,title,deadline,priority,status\nCS301,Red-Black Tree Assignment,2026-03-30T23:59:00,HIGH,NOT_STARTED\nCS302,Relational Schema Normalization,2026-04-02T23:59:00,MEDIUM,IN_PROGRESS`
  };
  const handleTypeChange = (type: 'subjects' | 'attendance' | 'marks' | 'assignments') => { setDataType(type);
  setCsvContent(SAMPLE_TEMPLATES[type]); parseCSV(SAMPLE_TEMPLATES[type]);
  };
  const parseCSV = (text: string) => { setErrorMsg(null);
  try { const lines = text.trim().split('\n').filter(l => l.trim().length > 0);
  if (lines.length < 2) { setParsedRows([]); return;
      };
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1).map(line => { const values = line.split(',').map(v => v.trim());
  const rowObj: Record<string, any> = {}; headers.forEach((h, i) => { rowObj[h] = values[i] || '';
        });
  return rowObj;
      });
  setParsedRows(rows);
    }
  catch (err: any) { setErrorMsg('Failed to parse CSV: ' + err.message);
  setParsedRows([]);
    }
  };
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => { const val = e.target.value;
  setCsvContent(val); parseCSV(val);
  };
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader(); reader.onload = event => { const text = event.target?.result as string;
  setCsvContent(text); parseCSV(text);
    }; reader.readAsText(file);
  };
  const handleImport = async () => { if (parsedRows.length === 0) { toast.error('No valid rows to import.'); return;
    } setLoading(true);
  try { const payload: any = {}; payload[dataType] = parsedRows;
  const res = await api.importData(payload);
  toast.success('Import Successful', `${parsedRows.length} ${dataType} imported into database.`); onSuccess(); onClose();
    }
  catch (err: any) { toast.error('Import Failed', err.message);
    }
  finally { setLoading(false);
    }
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Academic Data (CSV)" subtitle="Upload or paste comma-separated academic logs with validation and preview." maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Category Picker */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5"> Select Data Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['subjects', 'attendance', 'marks', 'assignments'] as const).map(t => (
              <button key={t} type="button" onClick={() => handleTypeChange(t)} className={`py-2 px-3 rounded-full text-xs font-bold capitalize transition-all border ${ dataType === t
                    ? 'bg-black text-white border-black shadow-sm'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:text-black '
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* File Upload Zone */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 "> Paste CSV or Select File
            </label>
            <label className="cursor-pointer text-xs font-semibold text-black hover:underline flex items-center gap-1">
              <Upload className="w-3.5 h-3.5" />
              <span>Browse CSV file</span>
              <input type="file" accept=".csv,text/csv" onChange={handleFileUpload} className="hidden"
              />
            </label>
          </div>

          <textarea rows={5} value={csvContent} onChange={handleTextChange} placeholder={SAMPLE_TEMPLATES[dataType]} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-mono text-gray-900 focus:outline-none focus:border-black"
          />
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Live Validation & Preview Table */}
        {parsedRows.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Preview: {parsedRows.length} valid rows found
              </span>
            </div>

            <div className="max-h-48 overflow-x-auto overflow-y-auto rounded-2xl border border-gray-200 bg-white text-[11px] shadow-2xs">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                  <tr>
                    {Object.keys(parsedRows[0]).map(h => (
                      <th key={h} className="p-2.5 font-mono font-bold text-gray-700 uppercase">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {parsedRows.slice(0, 10).map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 :bg-slate-800 ">
                      {Object.values(row).map((val: any, i) => (
                        <td key={i} className="p-2.5 text-gray-700 font-mono">
                          {String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedRows.length > 10 && (
                <div className="p-2 text-center text-gray-400 text-[10px]">
                  ...and {parsedRows.length - 10} more rows
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-gray-700 hover:text-black bg-gray-100 rounded-full transition-colors"
          > Cancel
          </button>
          <button type="button" onClick={handleImport} disabled={loading || parsedRows.length === 0} className="px-5 py-2 text-xs font-bold text-white bg-black hover:bg-neutral-800 disabled:opacity-50 rounded-full shadow-sm transition-all flex items-center gap-2"
          >
            {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>Commit {parsedRows.length} Rows</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
