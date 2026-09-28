import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, ArrowRight, Calendar, Wrench, UserCheck } from 'lucide-react';
import { MachineStatus, TechnicianInfo } from '../types';

interface OperationalDirectivesProps {
  currentStatus: MachineStatus;
  riskScore: number;
  assignedTechnician?: TechnicianInfo | null;
  onTriggerInspection?: () => void;
  onDispatchImmediate?: () => void;
  onMarkRepaired?: () => void;
}

export const OperationalDirectives: React.FC<OperationalDirectivesProps> = ({
  currentStatus,
  riskScore,
  assignedTechnician,
  onTriggerInspection,
  onDispatchImmediate,
  onMarkRepaired,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Operational Directives
          </h3>
          <p className="text-xs text-slate-500">
            Clear, stress-free action recommendations translated from raw sensor metrics
          </p>
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-1.5 font-mono">
          <span>AI Risk Score:</span>
          <span className={`font-bold tabular-nums ${
            riskScore > 75 ? 'text-rose-600' : riskScore > 40 ? 'text-amber-600' : 'text-emerald-600'
          }`}>
            {riskScore}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Normal Card */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            currentStatus === 'normal'
              ? 'bg-emerald-50/80 border-emerald-300 shadow-xs ring-2 ring-emerald-400/20'
              : 'bg-white border-slate-200 opacity-60 hover:opacity-90'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-800">
              Normal Baseline
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xs text-slate-600 min-h-[36px] leading-relaxed">
            Machine behavior is within expected patterns. No manual intervention required.
          </p>
          <div className="mt-3 pt-2.5 border-t border-emerald-100 text-[11px] font-medium text-emerald-700 flex items-center justify-between">
            <span>Action: Continue automated monitoring</span>
          </div>
        </div>

        {/* Warning Card */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            currentStatus === 'warning'
              ? 'bg-amber-50/80 border-amber-300 shadow-xs ring-2 ring-amber-400/20'
              : 'bg-white border-slate-200 opacity-60 hover:opacity-90'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-800">
              Warning Deviation
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xs text-slate-600 min-h-[36px] leading-relaxed">
            Early vibration or heat deviation detected. Machine is running, but needs checkup.
          </p>
          <div className="mt-3 pt-2.5 border-t border-amber-100 flex items-center justify-between text-[11px] font-medium text-amber-800">
            <span>Action: Schedule planned maintenance</span>
            {onTriggerInspection && (
              <button
                onClick={onTriggerInspection}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 transition font-semibold flex items-center gap-1 shadow-2xs"
              >
                <Calendar className="w-3 h-3" />
                <span>Schedule</span>
              </button>
            )}
          </div>
        </div>

        {/* Critical Card */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            currentStatus === 'critical'
              ? 'bg-rose-50/90 border-rose-300 shadow-xs animate-pulse ring-2 ring-rose-400/20'
              : 'bg-white border-slate-200 opacity-60 hover:opacity-90'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rose-700">
              Immediate Attention
            </span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-xs text-slate-600 min-h-[36px] leading-relaxed">
            Strong anomaly detected. Immediate inspection advised to avoid sudden stoppage.
          </p>
          <div className="mt-3 pt-2.5 border-t border-rose-100 flex items-center justify-between text-[11px] font-semibold text-rose-800">
            {assignedTechnician ? (
              <>
                <span className="truncate flex items-center gap-1 text-sky-800">
                  <UserCheck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>Assigned: {assignedTechnician.name}</span>
                </span>
                {onMarkRepaired && (
                  <button
                    onClick={onMarkRepaired}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shrink-0 ml-1 shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Mark Repaired</span>
                  </button>
                )}
              </>
            ) : (
              <>
                <span className="truncate">Action: Dispatch crew</span>
                {onDispatchImmediate && (
                  <button
                    onClick={onDispatchImmediate}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold transition shrink-0 ml-1 shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Wrench className="w-3 h-3" />
                    <span>Dispatch</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
