import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Activity, 
  Layers, 
  Sliders, 
  TrendingUp, 
  CreditCard, 
  Presentation, 
  Cpu, 
  AlertTriangle, 
  Download, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  HelpCircle
} from 'lucide-react';
import { IndustrialMachine, NavTab } from '../types';
import { useTheme } from '../context/ThemeContext';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  machines: IndustrialMachine[];
  onSelectMachine: (id: string) => void;
  onNavigateTab: (tab: NavTab) => void;
  onOpenAlerts: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  machines,
  onSelectMachine,
  onNavigateTab,
  onOpenAlerts,
}) => {
  const { themeConfig } = useTheme();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  // Search filtered machines
  const matchingMachines = machines.filter((m) => {
    if (!cleanQuery) return true;
    return (
      m.name.toLowerCase().includes(cleanQuery) ||
      m.tag.toLowerCase().includes(cleanQuery) ||
      (m.serialNumber && m.serialNumber.toLowerCase().includes(cleanQuery)) ||
      m.location.toLowerCase().includes(cleanQuery) ||
      m.categoryLabel.toLowerCase().includes(cleanQuery)
    );
  });

  // Navigation pages list
  const pages = [
    { id: 'telemetry' as const, label: 'Live Health Telemetry', desc: 'Real-time sensors, vibration, and thermal dashboard', icon: Activity },
    { id: 'fleet' as const, label: 'All Machines Fleet', desc: 'Overview of all plant equipment, filters, and health scores', icon: Layers },
    { id: 'roi' as const, label: 'Money Saved (ROI Calculator)', desc: 'Estimate factory downtime loss reduction in INR (₹)', icon: TrendingUp },
    { id: 'subscription' as const, label: 'Pricing & Subscription Plans (₹)', desc: 'Starter, Plant Pro, and Enterprise Fleet tiers in Indian Rupees', icon: CreditCard },
    { id: 'help' as const, label: 'Sensor Warranty & AI Help Assistant', desc: 'Warranty lookup, instant hot-swap RMA claims, and AI troubleshooting', icon: HelpCircle },
  ];

  const matchingPages = pages.filter((p) => {
    if (!cleanQuery) return true;
    return p.label.toLowerCase().includes(cleanQuery) || p.desc.toLowerCase().includes(cleanQuery);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-3 sm:pt-20 px-3 sm:px-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[86dvh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative border-b border-slate-200 px-4 py-3.5 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a machine name, serial ID, or navigation view..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-3 space-y-4 flex-1">
          {/* Machines Section */}
          {matchingMachines.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Equipment & Machinery ({matchingMachines.length})
              </div>
              <div className="space-y-1 mt-1">
                {matchingMachines.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      onSelectMachine(m.id);
                      onNavigateTab('telemetry');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl bg-slate-100 text-slate-700 group-hover:${themeConfig.bgLightClass} group-hover:${themeConfig.textClass} transition`}>
                        <Cpu className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{m.name}</span>
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {m.tag}
                          </span>
                          {m.serialNumber && (
                            <span className="font-mono text-[10px] text-slate-600">
                              · {m.serialNumber}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {m.location} · {m.categoryLabel}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        m.status === 'critical' ? 'bg-rose-100 text-rose-800' : m.status === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {m.healthScore}% Health
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Views Section */}
          {matchingPages.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Navigation Views
              </div>
              <div className="space-y-1 mt-1">
                {matchingPages.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        onNavigateTab(p.id);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl bg-slate-100 text-slate-700 group-hover:${themeConfig.bgLightClass} group-hover:${themeConfig.textClass} transition`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {p.label}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {p.desc}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {matchingMachines.length === 0 && matchingPages.length === 0 && (
            <div className="py-12 text-center text-slate-500 text-xs">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">No results found for "{query}"</p>
              <p className="text-slate-400 mt-1">Try searching for "Extruder", "Pump", "SN-MOT", or "Pricing"</p>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">ESC</kbd> to exit</span>
            <span aria-hidden="true">·</span>
            <span>Click any item to jump instantly</span>
          </div>
          <button
            onClick={() => {
              onOpenAlerts();
              onClose();
            }}
            className="text-rose-600 font-semibold hover:underline cursor-pointer"
          >
            Open Active Alerts →
          </button>
        </div>
      </div>
    </div>
  );
};
