import React, { useState } from 'react';
import { 
  Building2, 
  Database, 
  Radio, 
  Phone, 
  Award, 
  Sparkles, 
  ShieldCheck, 
  ChevronDown, 
  CheckCircle2, 
  ArrowUpRight,
  Zap,
  Layers,
  Cpu,
  RefreshCw,
  SlidersHorizontal,
  Lock
} from 'lucide-react';
import { usePlan, PLANT_FACILITIES } from '../context/PlanContext';
import { useTheme } from '../context/ThemeContext';
import { IndustrialMachine } from '../types';

interface EnterpriseFeaturesBarProps {
  currentMachine?: IndustrialMachine;
  onOpenSubscription?: () => void;
}

export const EnterpriseFeaturesBar: React.FC<EnterpriseFeaturesBarProps> = ({
  currentMachine,
  onOpenSubscription,
}) => {
  const { themeConfig } = useTheme();
  const { 
    planTier, 
    features, 
    activeFacility, 
    setActiveFacilityById,
    openEngineerHotline,
    openIsoCertModal,
    openScadaModal,
    openSapModal,
    scadaInterlockState
  } = usePlan();

  const [isFacilityDropdownOpen, setIsFacilityDropdownOpen] = useState(false);

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4 transition-colors">
      {/* Top Strip: Plan Level Status & Facility Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 shadow-2xs ${
            planTier === 'enterprise' 
              ? 'bg-amber-100 text-amber-900 border border-amber-300'
              : planTier === 'pro'
              ? `${themeConfig.badgeBg} ${themeConfig.textClass} border ${themeConfig.borderClass}`
              : 'bg-slate-100 text-slate-800 border border-slate-300'
          }`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {planTier === 'enterprise' ? 'Enterprise Fleet Plan (All Features Unlocked)' : planTier === 'pro' ? 'Plant Pro Plan (Active)' : 'Starter Pilot Plan'}
            </span>
          </span>

          <span className="text-xs text-slate-500 hidden sm:inline">·</span>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono">
            <span>Sampling: <strong className="text-slate-900">{features.samplingRateLabel}</strong></span>
            <span>•</span>
            <span>Machine Quota: <strong className="text-slate-900">{features.maxMachines === 'Unlimited' ? 'Unlimited Assets' : `${features.maxMachines} Machines`}</strong></span>
          </div>
        </div>

        {/* Multi-Plant Switcher (Enterprise feature or Locked Preview) */}
        <div className="flex items-center gap-2">
          {features.hasMultiPlant ? (
            <div className="relative">
              <button
                onClick={() => setIsFacilityDropdownOpen(!isFacilityDropdownOpen)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                <Building2 className="w-3.5 h-3.5 text-sky-600" />
                <span className="truncate max-w-[200px]">{activeFacility.name.split('·')[0]}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isFacilityDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 p-2 space-y-1 animate-in fade-in duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    Switch Plant Facility
                  </div>
                  {PLANT_FACILITIES.map((facility) => (
                    <button
                      key={facility.id}
                      onClick={() => {
                        setActiveFacilityById(facility.id);
                        setIsFacilityDropdownOpen(false);
                      }}
                      className={`w-full p-2.5 rounded-xl text-left text-xs transition flex items-start justify-between cursor-pointer ${
                        activeFacility.id === facility.id
                          ? `${themeConfig.bgLightClass} ${themeConfig.textClass} font-bold`
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-bold">{facility.name}</div>
                        <div className="text-[11px] text-slate-500">{facility.location}, {facility.state}</div>
                      </div>
                      {activeFacility.id === facility.id && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenSubscription}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs font-medium flex items-center gap-1.5 hover:border-slate-300 transition cursor-pointer"
              title="Multi-Plant digital twin unlocked on Enterprise Fleet"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Plant Alpha (Alwar)</span>
              <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-0.5">
                <Lock className="w-2.5 h-2.5" /> Multi-Plant on Enterprise
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Feature Action Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* BUTTON 1: SAP / Oracle ERP Sync */}
        <button
          onClick={features.hasSapOracleSync ? openSapModal : onOpenSubscription}
          className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
            features.hasSapOracleSync
              ? 'bg-sky-50/70 border-sky-200 hover:bg-sky-100 text-sky-950 shadow-2xs'
              : 'bg-slate-50/70 border-slate-200 text-slate-500 hover:bg-slate-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <Database className={`w-4 h-4 ${features.hasSapOracleSync ? 'text-sky-600' : 'text-slate-400'}`} />
            {features.hasSapOracleSync ? (
              <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 text-[10px] font-bold font-mono">
                Active
              </span>
            ) : (
              <Lock className="w-3 h-3 text-slate-400" />
            )}
          </div>
          <div className="mt-2">
            <span className="text-xs font-bold block text-slate-900">SAP / Oracle Sync</span>
            <span className="text-[10px] text-slate-500 block truncate">Two-Way CMMS Orders</span>
          </div>
        </button>

        {/* BUTTON 2: SCADA / PLC Interlock */}
        <button
          onClick={features.hasScadaEmergencyTrip ? openScadaModal : onOpenSubscription}
          className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
            features.hasScadaEmergencyTrip
              ? scadaInterlockState === 'SAFETY_TRIPPED'
                ? 'bg-rose-50 border-rose-300 text-rose-950 shadow-2xs animate-pulse'
                : 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100 text-emerald-950 shadow-2xs'
              : 'bg-slate-50/70 border-slate-200 text-slate-500 hover:bg-slate-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <Radio className={`w-4 h-4 ${features.hasScadaEmergencyTrip ? (scadaInterlockState === 'SAFETY_TRIPPED' ? 'text-rose-600' : 'text-emerald-600') : 'text-slate-400'}`} />
            {features.hasScadaEmergencyTrip ? (
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                scadaInterlockState === 'SAFETY_TRIPPED' ? 'bg-rose-200 text-rose-900' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {scadaInterlockState === 'SAFETY_TRIPPED' ? 'Tripped' : 'Armed'}
              </span>
            ) : (
              <Lock className="w-3 h-3 text-slate-400" />
            )}
          </div>
          <div className="mt-2">
            <span className="text-xs font-bold block text-slate-900">SCADA Safety Trip</span>
            <span className="text-[10px] text-slate-500 block truncate">PLC Coil Emergency Brake</span>
          </div>
        </button>

        {/* BUTTON 3: Dedicated 24/7 AI Engineer Hotline */}
        <button
          onClick={features.hasDedicatedEngineerHotline ? openEngineerHotline : onOpenSubscription}
          className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
            features.hasDedicatedEngineerHotline
              ? 'bg-amber-50/70 border-amber-200 hover:bg-amber-100 text-amber-950 shadow-2xs'
              : 'bg-slate-50/70 border-slate-200 text-slate-500 hover:bg-slate-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <Phone className={`w-4 h-4 ${features.hasDedicatedEngineerHotline ? 'text-amber-600' : 'text-slate-400'}`} />
            {features.hasDedicatedEngineerHotline ? (
              <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live
              </span>
            ) : (
              <Lock className="w-3 h-3 text-slate-400" />
            )}
          </div>
          <div className="mt-2">
            <span className="text-xs font-bold block text-slate-900">24/7 AI Engineer</span>
            <span className="text-[10px] text-slate-500 block truncate">Dr. Rajeshwari Menon</span>
          </div>
        </button>

        {/* BUTTON 4: ISO 17025 Calibration Certificate */}
        <button
          onClick={features.hasIsoRecalibrationCertificate ? openIsoCertModal : onOpenSubscription}
          className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
            features.hasIsoRecalibrationCertificate
              ? 'bg-purple-50/70 border-purple-200 hover:bg-purple-100 text-purple-950 shadow-2xs'
              : 'bg-slate-50/70 border-slate-200 text-slate-500 hover:bg-slate-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <Award className={`w-4 h-4 ${features.hasIsoRecalibrationCertificate ? 'text-purple-600' : 'text-slate-400'}`} />
            {features.hasIsoRecalibrationCertificate ? (
              <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold font-mono">
                Verified
              </span>
            ) : (
              <Lock className="w-3 h-3 text-slate-400" />
            )}
          </div>
          <div className="mt-2">
            <span className="text-xs font-bold block text-slate-900">ISO 17025 Certificate</span>
            <span className="text-[10px] text-slate-500 block truncate">Precision Metrology Slip</span>
          </div>
        </button>
      </div>
    </div>
  );
};
