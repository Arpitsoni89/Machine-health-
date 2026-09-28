import React, { useState } from 'react';
import { 
  Phone, 
  PhoneCall, 
  Radio, 
  UserCheck, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Wrench, 
  AlertTriangle, 
  Building2, 
  MapPin, 
  Award, 
  Send, 
  ChevronRight,
  Headphones,
  Check
} from 'lucide-react';
import { TechnicianInfo, IndustrialMachine } from '../types';
import { MOCK_TECHNICIANS } from '../data/mockTechnicians';
import { CallTechnicianModal } from './CallTechnicianModal';
import { useTheme } from '../context/ThemeContext';
import confetti from 'canvas-confetti';

interface CallTechnicianSectionProps {
  machines?: IndustrialMachine[];
  onDispatchToBay?: (technician: TechnicianInfo, bayNotes: string) => void;
}

export const CallTechnicianSection: React.FC<CallTechnicianSectionProps> = ({
  machines = [],
  onDispatchToBay,
}) => {
  const { themeConfig } = useTheme();

  const [activeCallTech, setActiveCallTech] = useState<TechnicianInfo | null>(null);
  const [selectedMachineId, setSelectedMachineId] = useState<string>(machines[0]?.id || 'm-01');
  const [selectedTechId, setSelectedTechId] = useState<string>(MOCK_TECHNICIANS[0].id);
  const [urgency, setUrgency] = useState<'critical' | 'warning' | 'routine'>('warning');
  const [dispatchReason, setDispatchReason] = useState('Bearing vibration checkup and lubrication review');
  const [dispatchToast, setDispatchToast] = useState<string | null>(null);

  const selectedMachine = machines.find((m) => m.id === selectedMachineId) || machines[0];

  const handleStartCall = (tech: TechnicianInfo) => {
    setActiveCallTech(tech);
  };

  const handleQuickDispatch = (tech: TechnicianInfo) => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
    const msg = `🚀 ${tech.name} (${tech.badgeId}) dispatched to ${selectedMachine?.name || 'Machine Bay'}! Comms: ${tech.radioChannel} · ETA ${tech.etaMinutes} mins.`;
    setDispatchToast(msg);
    setTimeout(() => setDispatchToast(null), 7000);

    if (onDispatchToBay) {
      onDispatchToBay(tech, `Quick dispatch for ${selectedMachine?.name || 'plant machinery'}`);
    }
  };

  const handleFormDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    const tech = MOCK_TECHNICIANS.find((t) => t.id === selectedTechId) || MOCK_TECHNICIANS[0];

    confetti({
      particleCount: 60,
      spread: 65,
      origin: { y: 0.6 },
    });

    const msg = `🚀 Technician Dispatch Order Placed! ${tech.name} has been notified via ${tech.radioChannel} for immediate response at ${selectedMachine?.name || 'bay'}.`;
    setDispatchToast(msg);
    setTimeout(() => setDispatchToast(null), 8000);

    if (onDispatchToBay) {
      onDispatchToBay(tech, dispatchReason);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {dispatchToast && (
        <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-700 shadow-xl flex items-center justify-between text-xs animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="leading-relaxed">{dispatchToast}</span>
          </div>
          <button
            onClick={() => setDispatchToast(null)}
            className="text-slate-400 hover:text-white ml-2 text-sm p-1 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 24/7 Plant Support Hotline Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white border border-slate-800 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-400/30 shrink-0">
            <Headphones className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                24/7 Priority Field Engineering Hotline
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
              Call On-Duty Plant Technicians Directly
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              Connect via encrypted digital radio or direct cellular voice with on-call certified reliability specialists. Average bay arrival time is under 5 minutes.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0">
          <button
            onClick={() => handleStartCall(MOCK_TECHNICIANS[0])}
            className="px-5 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call Lead Technician Now</span>
          </button>
        </div>
      </div>

      {/* Active On-Call Technician Directory Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Active Plant Reliability Specialists On-Duty
            </h3>
            <p className="text-xs text-slate-500">
              Click 'Call Technician' for instant voice dialogue or dispatch them directly to any equipment bay.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>3 Technicians Active</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MOCK_TECHNICIANS.map((tech) => (
            <div
              key={tech.id}
              className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Tech Profile Row */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={tech.avatar}
                        alt={tech.name}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-md"
                      />
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                    </div>

                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">
                        {tech.name}
                      </h4>
                      <span className="font-mono text-[10px] text-sky-800 bg-sky-100 px-1.5 py-0.2 rounded font-semibold">
                        {tech.badgeId}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full shrink-0">
                    ETA: {tech.etaMinutes}m
                  </span>
                </div>

                {/* Role & Certification Details */}
                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="font-semibold text-slate-700 text-[11px] leading-tight">
                    {tech.role}
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 flex items-start gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span className="leading-tight">{tech.certification}</span>
                  </div>
                </div>

                {/* Channels Strip */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1 font-mono">
                    <Radio className="w-3 h-3 text-sky-600 shrink-0" />
                    <span className="truncate">{tech.radioChannel.split(' ')[0]}</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="truncate">{tech.phone}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => handleStartCall(tech)}
                  className="flex-1 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Technician</span>
                </button>

                <button
                  onClick={() => handleQuickDispatch(tech)}
                  className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer"
                  title="Dispatch directly to active equipment"
                >
                  <Wrench className="w-3.5 h-3.5 text-slate-600" />
                  <span>Dispatch</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Direct Bay Dispatch Form */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-extrabold text-slate-900">
              Rapid Bay Dispatch & Machine Work Order
            </h4>
            <p className="text-xs text-slate-500">
              Need on-site mechanical inspection? Select an asset and dispatch a technician directly.
            </p>
          </div>
        </div>

        <form onSubmit={handleFormDispatch} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Target Machine */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Industrial Asset:
              </label>
              <select
                value={selectedMachineId}
                onChange={(e) => setSelectedMachineId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 font-medium focus:outline-hidden focus:border-sky-500"
              >
                {machines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.tag}) · {m.location}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Specialist */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Assign Specialist:
              </label>
              <select
                value={selectedTechId}
                onChange={(e) => setSelectedTechId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 font-medium focus:outline-hidden focus:border-sky-500"
              >
                {MOCK_TECHNICIANS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.badgeId}) · {t.role.split('&')[0]}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Urgency */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Dispatch Urgency:
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 font-medium focus:outline-hidden focus:border-sky-500"
              >
                <option value="critical">🚨 Critical / High Shaking (Immediate Hot-Swap)</option>
                <option value="warning">⚠️ Warning / Thermal Spike (Within Shift)</option>
                <option value="routine">📅 Routine Planned Checkup (Standard Schedule)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Field Directives & Observed Symptoms:
            </label>
            <input
              type="text"
              value={dispatchReason}
              onChange={(e) => setDispatchReason(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-sky-500"
              placeholder="e.g. Bearing rattle sound detected at 1400 RPM, check grease viscosity"
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Direct radio ping will be broadcasted to technician's handset upon submission.</span>
            </span>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Dispatch Order to Technician</span>
            </button>
          </div>
        </form>
      </div>

      {/* Interactive Call Modal */}
      {activeCallTech && (
        <CallTechnicianModal
          technician={activeCallTech}
          isOpen={Boolean(activeCallTech)}
          onClose={() => setActiveCallTech(null)}
          onDispatchToBay={onDispatchToBay}
        />
      )}
    </div>
  );
};
