import React from 'react';
import { 
  Radio, 
  ShieldAlert, 
  ShieldCheck, 
  Power, 
  CheckCircle2, 
  X, 
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react';
import { usePlan } from '../context/PlanContext';
import { useTheme } from '../context/ThemeContext';
import { IndustrialMachine } from '../types';

interface ScadaInterlockModalProps {
  machine?: IndustrialMachine;
  isOpen: boolean;
  onClose: () => void;
}

export const ScadaInterlockModal: React.FC<ScadaInterlockModalProps> = ({
  machine,
  isOpen,
  onClose,
}) => {
  const { themeConfig } = useTheme();
  const { 
    activeFacility, 
    scadaInterlockState, 
    setScadaInterlockState, 
    tripScadaEmergencyInterlock, 
    resetScadaInterlock 
  } = usePlan();

  if (!isOpen) return null;

  const handleExecuteEmergencyTrip = () => {
    tripScadaEmergencyInterlock(machine ? machine.tag : 'ALL_ASSETS');
  };

  const handleResetRelay = () => {
    resetScadaInterlock();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-150">
        {/* Header Strip */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              scadaInterlockState === 'SAFETY_TRIPPED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                  Plant Pro & Enterprise SCADA / PLC Safety Interlock
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                  scadaInterlockState === 'SAFETY_TRIPPED' ? 'bg-rose-500 text-white animate-pulse' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {scadaInterlockState}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Remote Trip Relay & Fail-Safe Emergency Brake
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

        {/* Modal Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Status Card */}
          <div className={`p-4 rounded-2xl border ${
            scadaInterlockState === 'SAFETY_TRIPPED' 
              ? 'bg-rose-50 border-rose-200 text-rose-900' 
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {scadaInterlockState === 'SAFETY_TRIPPED' ? (
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                <span className="font-bold text-sm">
                  {scadaInterlockState === 'SAFETY_TRIPPED' 
                    ? 'EMERGENCY INTERLOCK TRIPPED: Machine Power Cut' 
                    : 'Relay Status: ARMED & RUNNING (SIL-3 Safety Level)'}
                </span>
              </div>
              <span className="text-xs font-mono font-bold">
                {activeFacility.scadaNode}
              </span>
            </div>
            <p className="text-xs mt-1 opacity-80">
              Direct connection through industrial Modbus TCP / OPC-UA gateway to plant drive VFDs and emergency breakers.
            </p>
          </div>

          {/* Action Trigger Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {scadaInterlockState !== 'SAFETY_TRIPPED' ? (
              <button
                type="button"
                onClick={handleExecuteEmergencyTrip}
                className="p-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition flex flex-col items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-98"
              >
                <Power className="w-6 h-6" />
                <span>ENGAGE EMERGENCY SOFT-BRAKE</span>
                <span className="text-[10px] font-normal opacity-80">Sends instant 0V coil trip to VFD</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleResetRelay}
                className="p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex flex-col items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-98"
              >
                <RotateCcw className="w-6 h-6" />
                <span>RESET SAFETY INTERLOCK RELAY</span>
                <span className="text-[10px] font-normal opacity-80">Re-energizes safety circuit coils</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setScadaInterlockState(scadaInterlockState === 'BYPASS_MAINTENANCE' ? 'ARMED_NORMAL' : 'BYPASS_MAINTENANCE');
              }}
              className="p-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex flex-col items-center justify-center gap-2 border border-slate-200 cursor-pointer active:scale-98"
            >
              <SlidersHorizontal className="w-6 h-6 text-slate-600" />
              <span>{scadaInterlockState === 'BYPASS_MAINTENANCE' ? 'EXIT MAINTENANCE BYPASS' : 'SET MAINTENANCE BYPASS'}</span>
              <span className="text-[10px] font-normal text-slate-500">Allows diagnostic sensor recalibration</span>
            </button>
          </div>

          {/* Clean Safety Architecture & Interlock Specs */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Fail-Safe Safety Interlock Architecture</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                IEC 61508 / ISO 13849-1
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                <span className="text-[10px] font-sans text-slate-500 block">Response Time</span>
                <span className="text-xs font-bold text-slate-900">&lt; 15 ms</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                <span className="text-[10px] font-sans text-slate-500 block">Safety Category</span>
                <span className="text-xs font-bold text-emerald-600">Cat 4 / PL e</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                <span className="text-[10px] font-sans text-slate-500 block">Dual Channel</span>
                <span className="text-xs font-bold text-sky-600">Redundant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
