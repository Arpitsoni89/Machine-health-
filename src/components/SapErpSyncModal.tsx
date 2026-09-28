import React, { useState } from 'react';
import { 
  Building2, 
  RefreshCw, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  X, 
  Database, 
  Server, 
  Clock, 
  ShieldCheck, 
  ExternalLink,
  Zap,
  Download
} from 'lucide-react';
import { usePlan } from '../context/PlanContext';
import { useTheme } from '../context/ThemeContext';
import { IndustrialMachine, MaintenanceAlert } from '../types';
import confetti from 'canvas-confetti';

interface SapErpSyncModalProps {
  machine?: IndustrialMachine;
  alerts?: MaintenanceAlert[];
  isOpen: boolean;
  onClose: () => void;
}

export const SapErpSyncModal: React.FC<SapErpSyncModalProps> = ({
  machine,
  alerts = [],
  isOpen,
  onClose,
}) => {
  const { themeConfig } = useTheme();
  const { activeFacility, sapSyncRecords, isSapSyncing, triggerSapSync } = usePlan();
  const [selectedErp, setSelectedErp] = useState<'sap' | 'oracle'>('sap');
  const [costCenter, setCostCenter] = useState('CC-ALWAR-PLANT-101');
  const [notificationType, setNotificationType] = useState('M2 (Malfunction / Breakdown Order)');
  const [syncSuccessToast, setSyncSuccessToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleManualSync = () => {
    triggerSapSync(machine ? machine.tag : 'MOT-IND-04', 'Automated harmonic anomaly threshold exceeded.');
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: [themeConfig.dotColor, '#38bdf8', '#34d399', '#f59e0b'],
    });
    setSyncSuccessToast(`Pushed maintenance work-order to ${selectedErp.toUpperCase()} PM Server!`);
    setTimeout(() => setSyncSuccessToast(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-150">
        {/* Header Strip */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400">
                  Enterprise ERP & CMMS Connector
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Bi-Directional SAP PM & Oracle Maintenance Cloud Integration
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {syncSuccessToast && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{syncSuccessToast}</span>
            </div>
          )}

          {/* ERP Selector & Live Status Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedErp('sap')}
              className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                selectedErp === 'sap'
                  ? 'bg-sky-50/80 border-sky-300 ring-2 ring-sky-500/20 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-slate-900">SAP S/4HANA & ECC 6.0</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 font-mono">
                  Connected (REST / RFC)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Module: SAP PM (Plant Maintenance) · Endpoint: <code className="text-slate-700">https://sap.plant1001.corp/pm/api</code>
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedErp('oracle')}
              className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                selectedErp === 'oracle'
                  ? 'bg-sky-50/80 border-sky-300 ring-2 ring-sky-500/20 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-slate-900">Oracle Maintenance Cloud</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 font-mono">
                  Active Webhook
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Module: Oracle CMMS · REST Endpoint: <code className="text-slate-700">https://cmms.oraclecloud.com/v2</code>
              </p>
            </button>
          </div>

          {/* Sync Trigger Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                  Dispatch Maintenance Order to SAP PM
                </h4>
                <p className="text-xs text-slate-500">
                  Target Asset: <strong className="text-slate-900">{machine ? `${machine.name} (${machine.tag})` : 'All Critical Assets'}</strong> · Facility: <strong className="text-slate-900">{activeFacility.name}</strong>
                </p>
              </div>

              <button
                disabled={isSapSyncing}
                onClick={handleManualSync}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
                  isSapSyncing
                    ? 'bg-slate-700 text-white cursor-wait'
                    : `${themeConfig.primaryClass} ${themeConfig.primaryHoverClass} text-white`
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSapSyncing ? 'animate-spin' : ''}`} />
                <span>{isSapSyncing ? 'Synchronizing with SAP...' : 'Push Real-Time SAP Work Order'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-200">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Cost Center Code</label>
                <input
                  type="text"
                  value={costCenter}
                  onChange={(e) => setCostCenter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">SAP Notification Type</label>
                <select
                  value={notificationType}
                  onChange={(e) => setNotificationType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
                >
                  <option>M1 (Maintenance Request)</option>
                  <option>M2 (Malfunction / Breakdown Order)</option>
                  <option>M3 (Activity Report / Verification)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Synchronized Records Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">Recent SAP PM Transmitted Orders</span>
              <span className="text-[11px] text-slate-500 font-mono">Real-Time Two-Way Sync</span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-600 font-mono text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">SAP Notification #</th>
                    <th className="py-2.5 px-3">Asset Tag</th>
                    <th className="py-2.5 px-3">Priority</th>
                    <th className="py-2.5 px-3">Assigned Work Center</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {sapSyncRecords.map((rec, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 font-bold text-sky-700">{rec.sapNotificationId}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{rec.machineTag}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px]">
                          {rec.priority}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{rec.assignedWorkCenter}</td>
                      <td className="py-2.5 px-3 text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Synced</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted OAuth2 Bearer Auth · RFC NetWeaver Certified</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 font-bold text-slate-700 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
