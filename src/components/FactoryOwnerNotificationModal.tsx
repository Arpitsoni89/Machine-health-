import React from 'react';
import { 
  CheckCircle2, 
  Send, 
  Radio, 
  X, 
  ShieldCheck, 
  Activity, 
  Smartphone, 
  Mail, 
  UserCheck, 
  FileCheck,
  Check,
  Download
} from 'lucide-react';
import { OwnerWorkDoneNotification } from '../types';
import { useTheme } from '../context/ThemeContext';
import { downloadPostRepairNoticePdf } from '../utils/pdfCertificateGenerator';
import { triggerHaptic } from '../utils/notificationHelpers';

interface FactoryOwnerNotificationModalProps {
  notification: OwnerWorkDoneNotification | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FactoryOwnerNotificationModal: React.FC<FactoryOwnerNotificationModalProps> = ({
  notification,
  isOpen,
  onClose,
}) => {
  const { themeConfig } = useTheme();

  if (!isOpen || !notification) return null;

  const handleDownloadCertificate = () => {
    triggerHaptic(20);
    downloadPostRepairNoticePdf(notification);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[85vh] animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 pb-safe sm:pb-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Indicator */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center">
          <div className="w-12 h-1.5 rounded-full bg-slate-300" />
        </div>

        {/* Header Bar */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-900 text-white relative">
          <button
            onClick={() => {
              triggerHaptic(10);
              onClose();
            }}
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Close notification"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-bold uppercase tracking-wider mb-1">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Automated Sensor Telemetry Broadcast</span>
          </div>

          <h3 className="text-base sm:text-xl font-extrabold text-white leading-tight">
            Sensor Notified Factory Owner: Work Completed
          </h3>

          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Machine sensors verified baseline parameters and dispatched live receipts to the owner.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-3.5 overflow-y-auto overscroll-contain">
          {/* Machine & Technician Summary */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Serviced Asset</span>
              <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">
                {notification.machineName} ({notification.machineTag})
              </span>
              <span className="text-[11px] text-slate-500">{notification.facility}</span>
            </div>

            <div className="sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Serviced By</span>
              <span className="font-bold text-slate-800 flex items-center sm:justify-end gap-1 mt-0.5">
                <UserCheck className="w-3.5 h-3.5 text-sky-600" />
                <span>{notification.technicianName}</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500">{notification.technicianBadge}</span>
            </div>
          </div>

          {/* Sensor Live Verification Grid */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>Edge Sensor Acoustic & Health Audit</span>
              </span>
              <span className="text-[10px] font-bold font-mono bg-emerald-200/70 text-emerald-800 px-2 py-0.5 rounded-md">
                {notification.sensorVerification.sensorSerial}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center">
              <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-emerald-100 shadow-2xs">
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 block uppercase truncate">Vibration RMS</span>
                <span className="text-xs sm:text-sm font-extrabold text-emerald-700 font-mono mt-0.5 block truncate">
                  {notification.sensorVerification.vibrationRMS}
                </span>
                <span className="text-[9px] font-bold text-emerald-600">Zone A (Good)</span>
              </div>

              <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-emerald-100 shadow-2xs">
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 block uppercase truncate">Temperature</span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 font-mono mt-0.5 block truncate">
                  {notification.sensorVerification.temperatureC}
                </span>
                <span className="text-[9px] font-bold text-slate-500">Nominal</span>
              </div>

              <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-emerald-100 shadow-2xs">
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 block uppercase truncate">Power Load</span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 font-mono mt-0.5 block truncate">
                  {notification.sensorVerification.powerKW}
                </span>
                <span className="text-[9px] font-bold text-slate-500">Balanced</span>
              </div>
            </div>

            <p className="text-[11px] text-emerald-800 leading-relaxed font-sans">
              ✓ <strong>Sensor Verdict:</strong> {notification.repairSummary}
            </p>
          </div>

          {/* Delivery Channels Dispatched to Factory Owner */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              Multi-Channel Dispatch Receipts to Factory Owner
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {/* WhatsApp Notification */}
              <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 flex items-center gap-1 truncate">
                    <span>WhatsApp Alert</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono truncate">
                    Delivered to {notification.recipientOwner.phone}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                    Status: Delivered & Read
                  </div>
                </div>
              </div>

              {/* SMS Dispatch */}
              <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-sky-100 text-sky-800 shrink-0">
                  <Send className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 flex items-center gap-1 truncate">
                    <span>SMS Emergency IoT</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono truncate">
                    Twilio Gateway ID: #SMS-8841
                  </div>
                  <div className="text-[10px] text-sky-700 font-semibold mt-0.5">
                    Status: Sent to Factory Owner
                  </div>
                </div>
              </div>

              {/* Email Audit */}
              <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 flex items-center gap-1 truncate">
                    <span>Executive Email</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {notification.recipientOwner.email}
                  </div>
                  <div className="text-[10px] text-amber-700 font-semibold mt-0.5">
                    Status: Delivered with Audit PDF
                  </div>
                </div>
              </div>

              {/* In-App Audit Trail */}
              <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-violet-100 text-violet-800 shrink-0">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 flex items-center gap-1 truncate">
                    <span>In-App Audit Log</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    Logged at {notification.timestamp}
                  </div>
                  <div className="text-[10px] text-violet-700 font-semibold mt-0.5">
                    Status: Archived in CMMS
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-3.5 sm:p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 w-full sm:w-auto">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">Factory Owner Verified · Production Line Normal</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleDownloadCertificate}
              className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 min-h-[44px]"
            >
              <Download className="w-3.5 h-3.5 text-violet-600 shrink-0" />
              <span>PDF Receipt</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic(10);
                onClose();
              }}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition cursor-pointer active:scale-95 min-h-[44px]"
            >
              Acknowledge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
