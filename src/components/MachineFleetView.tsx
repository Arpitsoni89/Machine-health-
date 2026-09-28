import React, { useState } from 'react';
import { IndustrialMachine, IndustrySector, MachineCategory, MachineStatus } from '../types';
import { useTheme } from '../context/ThemeContext';
import { usePlan, PLANT_FACILITIES } from '../context/PlanContext';
import { 
  Activity, 
  Flame, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  ArrowRight,
  Search,
  Filter,
  X,
  Hash,
  Building2,
  Sparkles,
  ShieldCheck,
  Lock
} from 'lucide-react';

interface MachineFleetViewProps {
  machines: IndustrialMachine[];
  onSelectMachine: (id: string) => void;
}

export const MachineFleetView: React.FC<MachineFleetViewProps> = ({
  machines,
  onSelectMachine,
}) => {
  const { themeConfig } = useTheme();
  const { planTier, features, activeFacility, setActiveFacilityById } = usePlan();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<IndustrySector | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<MachineStatus | 'all'>('all');

  const filteredMachines = machines.filter((m) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = m.name.toLowerCase().includes(q);
      const matchTag = m.tag.toLowerCase().includes(q);
      const matchId = m.id.toLowerCase().includes(q);
      const matchSerial = m.serialNumber ? m.serialNumber.toLowerCase().includes(q) : false;
      const matchLoc = m.location.toLowerCase().includes(q);
      if (!matchName && !matchTag && !matchId && !matchSerial && !matchLoc) return false;
    }
    if (selectedIndustry !== 'all' && m.industry !== selectedIndustry) return false;
    if (selectedStatus !== 'all' && m.status !== selectedStatus) return false;
    return true;
  });

  const smoothCount = machines.filter(m => m.status === 'normal').length;
  const warningCount = machines.filter(m => m.status === 'warning').length;
  const criticalCount = machines.filter(m => m.status === 'critical').length;

  return (
    <div className="space-y-6">
      {/* Friendly Fleet Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-semibold ${themeConfig.textClass}`}>
                Factory Floor Overview
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-xs font-mono font-bold text-slate-700">
                {activeFacility.name}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5 flex-wrap">
              <span>All Machines & Equipment</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-slate-100 text-slate-700">
                {machines.length} / {features.maxMachines === 'Unlimited' ? '∞' : features.maxMachines} Quota
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              Quickly see which machines are running happily and which ones need a mechanic's attention before line stoppage.
            </p>

            <div className="flex items-center gap-3 text-xs font-semibold mt-3 text-slate-600 flex-wrap">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                {smoothCount} Running Great
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5 text-amber-700">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                {warningCount} Checkup Advised
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5 text-rose-700">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                {criticalCount} Attention Needed
              </span>
            </div>
          </div>

          {/* Quick Search Input Field by Name or Serial ID */}
          <div className="w-full lg:w-96 shrink-0">
            <label htmlFor="machine-search-input" className="block text-xs font-bold text-slate-700 mb-1.5">
              <span className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-slate-500" />
                  <span>Search by Name or Serial ID</span>
                </span>
                {searchQuery && (
                  <span className="text-[11px] font-normal text-slate-500">
                    {filteredMachines.length} found
                  </span>
                )}
              </span>
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="machine-search-input"
                type="text"
                placeholder="Search by name, tag, or serial ID (e.g. SN-MOT-8831)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full min-h-[44px] pl-9 pr-9 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-200 transition shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                  title="Clear search"
                  aria-label="Clear search input"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 px-1">
              <span>Search by machine name, tag, or serial number</span>
            </div>
          </div>
        </div>

        {/* Active Search Filter Badge */}
        {searchQuery.trim() && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="text-slate-600 flex items-center gap-2 flex-wrap">
              <span>Filtered by keyword:</span>
              <span className="font-semibold text-slate-900 bg-sky-50 text-sky-800 px-2 py-0.5 rounded-lg border border-sky-200 flex items-center gap-1">
                "{searchQuery}"
                <button 
                  onClick={() => setSearchQuery('')}
                  className="hover:text-sky-950 font-bold ml-1 cursor-pointer"
                  aria-label="Clear current search query"
                >
                  ×
                </button>
              </span>
              <span className="text-slate-500">
                ({filteredMachines.length} of {machines.length} machines matching)
              </span>
            </div>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-semibold text-sky-600 hover:text-sky-800 hover:underline cursor-pointer"
            >
              Reset search
            </button>
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 sm:mt-6 pt-4 border-t border-slate-100">
          {/* Status Quick Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 -mx-2 px-2 sm:mx-0 sm:px-0 touch-manipulation">
            <span className="text-xs font-semibold text-slate-500 shrink-0 mr-1">Status:</span>
            {[
              { id: 'all', label: 'All Equipment' },
              { id: 'normal', label: '🟢 Healthy' },
              { id: 'warning', label: '🟡 Checkup' },
              { id: 'critical', label: '🔴 Fix Needed' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStatus(st.id as any)}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs transition font-semibold cursor-pointer shrink-0 active:scale-95 ${
                  selectedStatus === st.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Industry Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 -mx-2 px-2 sm:mx-0 sm:px-0 touch-manipulation">
            <span className="text-xs font-semibold text-slate-500 shrink-0 mr-1">Industry:</span>
            {[
              { id: 'all', label: 'All Plants' },
              { id: 'auto', label: 'Automotive' },
              { id: 'steel', label: 'Steel' },
              { id: 'textile', label: 'Textile' },
              { id: 'pharma', label: 'Pharma' },
            ].map((ind) => (
              <button
                key={ind.id}
                onClick={() => setSelectedIndustry(ind.id as any)}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs transition font-medium cursor-pointer shrink-0 active:scale-95 ${
                  selectedIndustry === ind.id
                    ? `${themeConfig.primaryClass} font-semibold shadow-xs text-white`
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {ind.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Machinery */}
      {filteredMachines.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center text-slate-500 shadow-xs">
          <Filter className="w-8 h-8 mx-auto mb-2 text-slate-400" />
          <p className="text-base font-bold text-slate-800">No equipment matches your search or filter</p>
          {searchQuery ? (
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              No machine found matching name or serial ID <strong className="text-slate-800">"{searchQuery}"</strong>. Try checking the spelling or search by tag like <span className="font-mono text-sky-600">MOT-IND-04</span>.
            </p>
          ) : (
            <p className="text-xs text-slate-500 mt-1">Try changing the condition or industry filters.</p>
          )}
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedIndustry('all');
              setSelectedStatus('all');
            }}
            className={`mt-4 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold ${themeConfig.textClass} cursor-pointer transition active:scale-95`}
          >
            Clear all filters & search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredMachines.map((machine) => {
            const isCritical = machine.status === 'critical';
            const isWarning = machine.status === 'warning';

            return (
              <div
                key={machine.id}
                className={`rounded-2xl sm:rounded-3xl border p-4 sm:p-6 flex flex-col justify-between transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 ${
                  isCritical
                    ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-300/40'
                    : isWarning
                    ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-300/40'
                    : 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Unboxed Metadata Header with Serial ID */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-mono mb-1 flex-wrap">
                        <span className={`font-semibold ${themeConfig.textClass}`}>{machine.tag}</span>
                        {machine.serialNumber && (
                          <>
                            <span aria-hidden="true" className="text-slate-300">·</span>
                            <span className="text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium">
                              ID: {machine.serialNumber}
                            </span>
                          </>
                        )}
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span>{machine.industryLabel}</span>
                      </div>
                      <h3 className="font-bold text-base text-slate-900 tracking-tight">
                        {machine.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">{machine.location}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 pt-1">
                      {isCritical && <AlertOctagon className="w-4 h-4 text-rose-600" />}
                      {isWarning && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                      {!isCritical && !isWarning && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      <span className={`text-xs font-bold ${
                        isCritical ? 'text-rose-600' : isWarning ? 'text-amber-700' : 'text-emerald-700'
                      }`}>
                        {isCritical ? 'Needs Repair' : isWarning ? 'Checkup Advised' : 'Healthy'}
                      </span>
                    </div>
                  </div>

                  {/* Health Score Meter */}
                  <div className="my-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-600 font-semibold">Overall Machine Condition</span>
                      <span className={`font-mono font-bold ${
                        machine.healthScore < 50 ? 'text-rose-600' : machine.healthScore < 75 ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {machine.healthScore}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          machine.healthScore < 50
                            ? 'bg-rose-500'
                            : machine.healthScore < 75
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${machine.healthScore}%` }}
                      />
                    </div>
                  </div>

                  {/* 3 Everyday Readings */}
                  <div className="grid grid-cols-3 gap-2 py-1 text-center">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/70">
                      <div className="flex items-center justify-center gap-1 text-slate-500 text-[10px] mb-0.5">
                        <Flame className="w-3 h-3 text-orange-500" />
                        <span>Heat</span>
                      </div>
                      <span className="text-xs font-bold text-slate-900 font-mono">{machine.temperature}°C</span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/70">
                      <div className="flex items-center justify-center gap-1 text-slate-500 text-[10px] mb-0.5">
                        <Activity className="w-3 h-3 text-sky-500" />
                        <span>Shaking</span>
                      </div>
                      <span className="text-xs font-bold text-slate-900 font-mono">{machine.vibration}</span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/70">
                      <div className="flex items-center justify-center gap-1 text-slate-500 text-[10px] mb-0.5">
                        <Zap className="w-3 h-3 text-amber-500" />
                        <span>Power</span>
                      </div>
                      <span className="text-xs font-bold text-slate-900 font-mono">{machine.power}kW</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {machine.aiDiagnosticNote}
                  </p>
                </div>

                {/* Footer Action */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    {machine.categoryLabel}
                  </span>

                  <button
                    onClick={() => onSelectMachine(machine.id)}
                    className={`px-3.5 py-1.5 rounded-xl ${themeConfig.bgLightClass} hover:opacity-90 ${themeConfig.textClass} border ${themeConfig.borderClass} text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs`}
                  >
                    <span>Inspect Vitals</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

