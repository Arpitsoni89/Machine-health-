import React, { useState } from 'react';
import { 
  UserCheck, 
  Radio, 
  Phone, 
  Clock, 
  Award, 
  Wrench, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck,
  Building2,
  FileCheck
} from 'lucide-react';
import { TechnicianInfo, IndustrialMachine } from '../types';
import { useTheme } from '../context/ThemeContext';
import confetti from 'canvas-confetti';

interface TechnicianAssignmentCardProps {
  technician: TechnicianInfo;
  machine: IndustrialMachine;
  onMarkRepaired: (notes?: string) => void;
  compact?: boolean;
}

export const TechnicianAssignmentCard: React.FC<TechnicianAssignmentCardProps> = ({
  technician,
  machine,
  onMarkRepaired,
  compact = false,
}) => {
  const { themeConfig } = useTheme();
  const [isRepairing, setIsRepairing] = useState(false);
  const [showRepairModal, setShowRepairModal] = useState(false);
  const [repairNotes, setRepairNotes] = useState(
    'Bearing re-lubricated with high-temperature polyurea grease. Shaft runout measured at 0.02mm (within ISO tolerance). Foot bolts retorqued to 180 Nm.'
  );

  const handleExecuteRepair = () => {
    setIsRepairing(true);
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#38bdf8', '#fbbf24', '#6366f1'],
    });

    setTimeout(() => {
      onMarkRepaired(repairNotes);
      setIsRepairing(false);
      setShowRepairModal(false);
    }, 600);
  };

  if (compact) {
    return (
      <div className="p-3.5 rounded-2xl bg-sky-50/80 border border-sky-200/90 text-xs space-y-2.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={technician.avatar}
              alt={technician.name}
              className="w-8 h-8 rounded-full object-cover border border-sky-300"
            />
            <div>
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <span>{technician.name}</span>
                <span className="font-mono text-[10px] text-sky-800 bg-sky-100 px-1.5 py-0.2 rounded font-semibold">
                  {technician.badgeId}
                </span>
              </div>
              <div className="text-[10px] text-slate-500">{technician.role}</div>
            </div>
          </div>

          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100/90 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>ETA: {technician.etaMinutes}m</span>
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-sky-200/60 text-[11px]">
          <div className="flex items-center gap-2 text-slate-600">
            <Radio className="w-3 h-3 text-sky-600" />
            <span>{technician.radioChannel}</span>
          </div>

          <button
            onClick={() => setShowRepairModal(true)}
            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition shadow-2xs flex items-center gap-1 cursor-pointer"
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Mark Repaired</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-sky-50/90 to-slate-50 border border-sky-200 shadow-xs space-y-4 transition-all">
        {/* Header Strip with Technician Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-sky-100">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={technician.avatar}
                alt={technician.name}
                className="w-13 h-13 rounded-2xl object-cover border-2 border-white shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-extrabold text-slate-900 leading-tight">
                  {technician.name}
                </h4>
                <span className="font-mono text-[10px] font-bold text-sky-800 bg-sky-100 border border-sky-200 px-2 py-0.5 rounded-md">
                  {technician.badgeId}
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <UserCheck className="w-3 h-3" />
                  <span>Assigned & Dispatched</span>
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">
                {technician.role}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-white border border-sky-200 shadow-2xs text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Arrival Status</span>
              <span className="text-xs font-extrabold text-amber-600 flex items-center gap-1 font-mono justify-end">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>En Route · ETA {technician.etaMinutes} mins</span>
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Credential & Contact Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-2xl bg-white border border-slate-200/80 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Certified Expertise</span>
            </span>
            <span className="text-xs font-bold text-slate-800 mt-1 block">
              {technician.certification}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-slate-200/80 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-sky-500" />
              <span>Comms Frequency</span>
            </span>
            <span className="text-xs font-bold text-slate-800 mt-1 block font-mono">
              {technician.radioChannel}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">{technician.phone}</span>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-slate-200/80 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              <span>Duty Shift & Bay</span>
            </span>
            <span className="text-xs font-bold text-slate-800 mt-1 block">
              {technician.shift}
            </span>
            <span className="text-[11px] text-slate-500">{machine.location}</span>
          </div>
        </div>

        {/* Action Directives / Repair Plan */}
        <div className="p-3.5 rounded-2xl bg-white border border-sky-200 text-xs space-y-1">
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-sky-600" />
            <span>Active Maintenance Scope for {machine.name}</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            {technician.repairNotes || machine.aiDiagnosticNote}
          </p>
        </div>

        {/* Action Button: Return Machine to Normal State */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Once the technician completes the mechanical fix, click below to restore baseline state.</span>
          </div>

          <button
            onClick={() => setShowRepairModal(true)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Complete Repair & Restore Normal State</span>
          </button>
        </div>
      </div>

      {/* Repair Confirmation Modal */}
      {showRepairModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Verify Repair & Normal State
                </h3>
                <p className="text-xs text-slate-500">
                  {machine.name} ({machine.tag})
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-700">
                <span>Servicing Technician:</span>
                <span className="font-bold text-slate-900">{technician.name}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span>Certification Badge:</span>
                <span className="font-mono text-slate-900">{technician.badgeId}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span>New Machine Status:</span>
                <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Normal (Zone A Baseline · 98% Health)
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200/80 text-[11px] text-emerald-800 flex items-center gap-1.5 font-medium">
                <Radio className="w-3.5 h-3.5 text-emerald-600 shrink-0 animate-pulse" />
                <span>Edge sensors will run acoustic check & auto-notify the factory owner via SMS / WhatsApp.</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Technician Work Log & Verification Notes:
              </label>
              <textarea
                value={repairNotes}
                onChange={(e) => setRepairNotes(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowRepairModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteRepair}
                disabled={isRepairing}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                {isRepairing ? (
                  <span>Sensors Verifying & Notifying Owner...</span>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Verify Sensors & Notify Owner</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
