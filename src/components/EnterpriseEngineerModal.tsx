import React, { useState } from 'react';
import { 
  Phone, 
  PhoneOff, 
  Video, 
  Mic, 
  MicOff, 
  ShieldCheck, 
  Sparkles, 
  UserCheck, 
  MessageSquare, 
  CheckCircle2, 
  X, 
  Building2, 
  Award, 
  Clock, 
  Zap,
  Activity
} from 'lucide-react';
import { usePlan } from '../context/PlanContext';
import { useTheme } from '../context/ThemeContext';
import { IndustrialMachine } from '../types';

interface EnterpriseEngineerModalProps {
  machine?: IndustrialMachine;
  isOpen: boolean;
  onClose: () => void;
}

export const EnterpriseEngineerModal: React.FC<EnterpriseEngineerModalProps> = ({
  machine,
  isOpen,
  onClose,
}) => {
  const { themeConfig } = useTheme();
  const { activeFacility } = usePlan();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [activeCallStatus, setActiveCallStatus] = useState<'connected' | 'ended'>('connected');
  const [callNotes, setCallNotes] = useState<string[]>([
    'Connected to dedicated reliability hotline (SLA: < 2 min response).',
    'Dr. Rajeshwari Menon joined from Industrial Diagnostic Lab (IIT Delhi / MachineMind Specialist).',
    `Live telemetry stream bridged from ${activeFacility.name}.`,
    machine ? `Analyzing acoustic harmonics for ${machine.name} (${machine.tag}).` : 'Analyzing plant-wide telemetry matrix.',
  ]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-150">
        {/* Header Strip */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Phone className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                  Enterprise 24/7 Dedicated Engineer Hotline
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Live Consultation: Dr. Rajeshwari Menon, PhD
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

        {/* Video / Specialist Preview Area */}
        <div className="p-5 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            {/* Specialist Profile Card (5 cols) */}
            <div className="sm:col-span-5 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-center space-y-3">
              <div className="relative inline-block mx-auto">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80"
                  alt="Dr. Rajeshwari Menon"
                  className="w-24 h-24 rounded-2xl object-cover mx-auto border-2 border-slate-300 shadow-sm"
                />
                <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full border-2 border-white text-white">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              </div>

              <div>
                <h4 className="font-extrabold text-sm text-slate-900">Dr. Rajeshwari Menon</h4>
                <p className="text-[11px] text-slate-500 font-medium">Chief Mechanical Reliability Engineer</p>
                <div className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 mt-1">
                  <Award className="w-3 h-3 text-amber-600" />
                  <span>22+ Yrs · Vibration Category IV ISO</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 font-mono pt-2 border-t border-slate-200 text-left space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Location:</span>
                  <span>Delhi Tech Lab</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Hub:</span>
                  <span>{activeFacility.name.split('·')[0]}</span>
                </div>
              </div>
            </div>

            {/* Live Audio Spectrum & Live Telemetry Feed (7 cols) */}
            <div className="sm:col-span-7 space-y-3">
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">Live Acoustic Signal Stream</span>
                  <span className="text-emerald-400 font-mono flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Active Telemetry Link</span>
                  </span>
                </div>

                {/* Animated Waveform Visualizer */}
                <div className="h-16 flex items-end justify-between gap-1 px-2 py-2 bg-slate-950 rounded-xl overflow-hidden">
                  {[24, 45, 62, 38, 80, 52, 95, 70, 42, 66, 88, 30, 58, 82, 40, 74, 90, 35, 60, 48].map((val, idx) => (
                    <div
                      key={idx}
                      className={`w-full rounded-t-sm transition-all duration-150 ${
                        idx % 3 === 0 ? 'bg-amber-400' : 'bg-sky-400'
                      }`}
                      style={{ height: `${val}%` }}
                    />
                  ))}
                </div>

                <div className="text-[11px] text-slate-300 font-mono leading-relaxed bg-slate-800/80 p-2.5 rounded-xl">
                  <strong>Specialist Observation:</strong> "The 118.4 Hz outer raceway defect frequency (BPFO) on {machine ? machine.tag : 'the drive motor'} is stabilizing after lubrication. We recommend a thermographic scan during the next shift."
                </div>
              </div>

              {/* Action Call Controls */}
              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3 rounded-2xl border transition cursor-pointer ${
                    isMuted ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <button
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  className={`p-3 rounded-2xl border transition cursor-pointer ${
                    !isVideoOn ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                  title={isVideoOn ? 'Turn Video Off' : 'Turn Video On'}
                >
                  <Video className="w-5 h-5" />
                </button>

                <button
                  onClick={onClose}
                  className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>End Consultation</span>
                </button>
              </div>
            </div>
          </div>

          {/* Consultation Notes Transcript */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs font-mono space-y-1.5">
            <span className="font-bold text-slate-900 block uppercase tracking-wider text-[10px]">
              Encrypted Session Audit Log (ISO 27001 Compliant)
            </span>
            {callNotes.map((note, index) => (
              <div key={index} className="text-slate-600 flex items-start gap-2">
                <span className="text-emerald-500 font-bold">›</span>
                <span>{note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
