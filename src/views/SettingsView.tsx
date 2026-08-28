import React, { useState } from 'react';
import { Settings, User, Shield, Download, Upload, RefreshCw, Trash2, CheckCircle2, Moon, Sun, ShieldCheck, FileSpreadsheet, FileJson
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';
import { CSVImportModal } from '../components/data/CSVImportModal';
import { DataExportModal } from '../components/data/DataExportModal'; export const SettingsView: React.FC = () => { const { user, isDemo, logout, startDemo } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();
  const [targetAttendance, setTargetAttendance] = useState('85');
  const [minimumAttendance, setMinimumAttendance] = useState('75');
  const [gradingScale, setGradingScale] = useState<'10_POINT' | '4_POINT'>('10_POINT');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [resetting, setResetting] = useState(false);
  const handleSavePreferences = (e: React.FormEvent) => { e.preventDefault();
  toast.success('Academic Preferences Saved', `Target: ${targetAttendance}%, Min: ${minimumAttendance}%`);
  };
  const handleResetDemoData = async () => { if (!confirm('Reset all academic data to the clean student benchmark demonstration profile?')) return;
  setResetting(true);
  try { await startDemo();
  toast.success('Demo Dataset Reset', 'Fresh academic records loaded.');
    }
  catch (err: any) { toast.error('Reset Failed', err.message);
    }
  finally { setResetting(false);
    }
  };
  const handleDeleteAccount = async () => { const confirmation = prompt('Type "DELETE" to permanently erase your account and all academic data:');
  if (confirmation !== 'DELETE') { toast.info('Account deletion cancelled'); return;
    } try { await api.deleteAccount('DELETE');
  toast.success('Account Deleted', 'All academic records permanently removed.'); logout();
    }
  catch (err: any) { toast.error('Deletion Failed', err.message);
    }
  };
  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-1">System Configuration</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-black tracking-tight">Preferences & Data Engine</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1"> Manage your student profile, academic thresholds, CSV imports, and offline dossier exports.
        </p>
      </div>

      {/* Profile Section */}
      <div className="p-7 sm:p-8 rounded-[32px] bg-white border border-gray-100 shadow-sm space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100 ">
          <User className="w-4 h-4 text-gray-400 " />
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Student Profile</h3>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-black text-white font-bold text-lg flex items-center justify-center shadow-sm">
              {user?.name ? user.name[0] : 'S'}
            </div>
            <div>
              <p className="text-sm font-bold text-black ">{user?.name || 'Student Scholar'}</p>
              <p className="text-xs text-gray-500 font-mono">{user?.email || 'demo@campusos.internal'}</p>
              {isDemo && (
                <span className="inline-block mt-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700 rounded-full"> Interactive Demo Mode
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={logout} className="px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 rounded-full transition-all"
            > Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Global Academic Targets Form */}
      <div className="p-7 sm:p-8 rounded-[32px] bg-white border border-gray-100 shadow-sm space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100 ">
          <Shield className="w-4 h-4 text-gray-400 " />
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Default Academic Thresholds</h3>
        </div>

        <form onSubmit={handleSavePreferences} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5"> Default Target Attendance
              </label>
              <div className="relative">
                <input type="number" min="50" max="100" value={targetAttendance} onChange={e => setTargetAttendance(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-mono focus:outline-none focus:border-black"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 ">%</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Institutional target goal</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5"> Minimum Allowed Threshold
              </label>
              <div className="relative">
                <input type="number" min="50" max="100" value={minimumAttendance} onChange={e => setMinimumAttendance(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-mono focus:outline-none focus:border-black"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 ">%</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Minimum for exam eligibility</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5"> Grading Scale System
              </label>
              <select value={gradingScale} onChange={e => setGradingScale(e.target.value as any)} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-bold focus:outline-none focus:border-black"
              >
                <option value="10_POINT">10.0 Grade Point Scale (O, A+, A...)</option>
                <option value="4_POINT">4.0 GPA Standard Scale (A, B, C...)</option>
              </select>
              <p className="text-[10px] text-gray-400 mt-1">SGPA algorithm scale</p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="px-5 py-2 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-full shadow-sm transition-all"
            > Save Thresholds
            </button>
          </div>
        </form>
      </div>

      {/* Data Management & Dossier Section */}
      <div className="p-7 sm:p-8 rounded-[32px] bg-white border border-gray-100 shadow-sm space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100 ">
          <FileSpreadsheet className="w-4 h-4 text-gray-400 " />
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Data Portability & Dossier</h3>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed"> Import academic records via CSV spreadsheets or export your entire academic dossier in JSON/CSV for offline backups.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <button onClick={() => setShowImportModal(true)} className="p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-gray-300 transition-all flex items-center gap-3 text-left group"
          >
            <div className="p-2.5 rounded-full bg-white shadow-2xs text-black group-hover:scale-105 transition-transform">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-black ">Import CSV Data</p>
              <p className="text-[10px] text-gray-400 ">Bulk upload subjects & logs</p>
            </div>
          </button>

          <button onClick={() => setShowExportModal(true)} className="p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-gray-300 transition-all flex items-center gap-3 text-left group"
          >
            <div className="p-2.5 rounded-full bg-white shadow-2xs text-black group-hover:scale-105 transition-transform">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-black ">Export Dossier</p>
              <p className="text-[10px] text-gray-400 ">Download complete backup</p>
            </div>
          </button>

          <button onClick={handleResetDemoData} disabled={resetting} className="p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-gray-300 transition-all flex items-center gap-3 text-left group"
          >
            <div className="p-2.5 rounded-full bg-white shadow-2xs text-black group-hover:scale-105 transition-transform">
              <RefreshCw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <p className="text-xs font-bold text-black ">Reset Demo Data</p>
              <p className="text-[10px] text-gray-400 ">Restore benchmark profiles</p>
            </div>
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-7 sm:p-8 rounded-[32px] bg-red-50/40 border border-red-100 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-red-100 text-red-600">
          <Trash2 className="w-4 h-4" />
          <h3 className="text-xs font-bold uppercase tracking-wider">Danger Zone</h3>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-black ">Permanently Delete Account & Academic Dossier</p>
            <p className="text-[11px] text-gray-500 mt-0.5"> Instantly removes all subjects, attendance logs, marks, assignments, and timetable schedules.
            </p>
          </div>

          <button onClick={handleDeleteAccount} className="px-4 py-2 text-xs font-bold text-red-600 hover:text-white bg-white hover:bg-red-600 border border-red-200 rounded-full transition-all self-start sm:self-auto shadow-2xs"
          > Delete Account
          </button>
        </div>
      </div>

      {/* Modals */}
      {showImportModal && (
        <CSVImportModal isOpen={showImportModal} onClose={() => setShowImportModal(false)} onSuccess={() => toast.success('Data records imported successfully!')}
        />
      )}

      {showExportModal && (
        <DataExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
};
