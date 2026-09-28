import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { usePlan } from '../context/PlanContext';
import { 
  Activity, 
  Bell, 
  ChevronDown, 
  LogOut, 
  Layers, 
  TrendingUp, 
  Sliders, 
  HelpCircle, 
  CreditCard,
  Sparkles,
  Menu,
  X,
  Check,
  Building2,
  ShieldCheck,
  Radio,
  Search,
  ChevronRight,
  Cpu,
  Command
} from 'lucide-react';
import { IndustrialMachine, MaintenanceAlert, NavTab } from '../types';
import { CommandPaletteModal } from './CommandPaletteModal';
import { PWAInstallButton } from './PWAInstallPrompt';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  alerts: MaintenanceAlert[];
  onOpenAlerts: () => void;
  onOpenGuide: () => void;
  machines?: IndustrialMachine[];
  selectedMachineId?: string;
  onSelectMachine?: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  alerts,
  onOpenAlerts,
  onOpenGuide,
  machines = [],
  selectedMachineId,
  onSelectMachine,
}) => {
  const { user, logout, openLoginModal, switchRole } = useAuth();
  const { themeConfig, bgConfig } = useTheme();
  const { planTier, planName } = usePlan();
  
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNewHighPriorityAlert, setIsNewHighPriorityAlert] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const prevAlertsRef = useRef<MaintenanceAlert[]>(alerts);

  const currentMachine = machines.find((m) => m.id === selectedMachineId) || machines[0];
  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;
  const criticalCount = alerts.filter((a) => !a.acknowledged && a.severity === 'critical').length;

  // Handle click outside to close popovers gracefully
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut listener: Cmd+K / Ctrl+K opens Command Palette, numbers 1-5 switch tabs on PC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is actively typing in input, textarea, or contentEditable
      const target = e.target as HTMLElement | null;
      const isInput = target && (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.tagName === 'SELECT' || 
        target.isContentEditable
      );

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      if (!isInput && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (e.key === '1') {
          setActiveTab('telemetry');
        } else if (e.key === '2') {
          setActiveTab('fleet');
        } else if (e.key === '3') {
          setActiveTab('roi');
        } else if (e.key === '4') {
          setActiveTab('subscription');
        } else if (e.key === '5' || e.key === '?') {
          setActiveTab('help');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTab]);

  // Detect when a new high-priority maintenance alert is added to alerts list
  useEffect(() => {
    const prevAlerts = prevAlertsRef.current;
    if (alerts.length > prevAlerts.length) {
      const prevIds = new Set(prevAlerts.map((a) => a.id));
      const newlyAdded = alerts.filter((a) => !prevIds.has(a.id));
      const hasNewHighPriority = newlyAdded.some(
        (a) => a.severity === 'critical' && !a.acknowledged
      );

      if (hasNewHighPriority) {
        setIsNewHighPriorityAlert(true);
        const timer = setTimeout(() => {
          setIsNewHighPriorityAlert(false);
        }, 8000);
        return () => clearTimeout(timer);
      }
    }
    prevAlertsRef.current = alerts;
  }, [alerts]);

  const shouldPulseAlertIcon = isNewHighPriorityAlert || criticalCount > 0;

  interface NavItem {
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }

  const navItems: NavItem[] = [
    { id: 'telemetry', label: 'Live Health', icon: Activity, badge: 'Live' },
    { id: 'fleet', label: 'All Machines', icon: Layers },
    { id: 'roi', label: 'Money Saved', icon: TrendingUp },
    { id: 'subscription', label: 'Pricing (₹)', icon: CreditCard },
    { id: 'help', label: 'Warranty & Help', icon: HelpCircle, badge: 'Support' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-colors duration-200">
        {/* Main Navbar Top Row */}
        <div className="max-w-7xl 2xl:max-w-[1536px] mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2 sm:gap-3">
            
            {/* Left Brand Identity */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div 
                className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0" 
                onClick={() => {
                  setActiveTab('telemetry');
                  setIsMobileMenuOpen(false);
                }}
                title="MachineMind Predictive Care"
              >
                {/* Brand Logo with Dynamic Gradient Ring */}
                <div 
                  className={`w-9 h-9 rounded-xl p-0.5 shadow-xs group-hover:scale-105 transition-transform flex items-center justify-center bg-gradient-to-tr ${themeConfig.gradient}`}
                >
                  <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 text-white" fill="none">
                      <path 
                        d="M3 12h4l2.5-6 3.5 12 3-8 2 4h5" 
                        stroke="#38bdf8"
                        strokeWidth="2.2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                      />
                    </svg>
                  </div>
                </div>

                {/* Title & Tag */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-extrabold tracking-tight text-slate-900 leading-none">
                      Machine<span className={themeConfig.textClass}>Mind</span>
                    </span>
                    <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200/80 leading-none">
                      v2.4
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-500 leading-tight hidden sm:block">
                    Predictive Reliability Intelligence
                  </span>
                </div>
              </div>

              {/* Quick Jump Search Button in Navbar */}
              <button
                onClick={() => setIsCommandPaletteOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 transition text-xs shadow-2xs cursor-pointer ml-1 lg:ml-2 active:scale-95"
                title="Quick Search or Jump to Machine (Cmd+K or Ctrl+K)"
              >
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs">Quick Jump...</span>
                <kbd className="px-1.5 py-0.5 text-[9px] font-mono font-bold text-slate-400 bg-white border border-slate-200 rounded">
                  ⌘K
                </kbd>
              </button>
            </div>

            {/* Center Segmented Navigation Links (Desktop) */}
            <nav className="hidden lg:flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80 shadow-2xs" aria-label="Desktop primary navigation">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const shortcutNum = index + 1;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`group relative px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                      isActive
                        ? `bg-white ${themeConfig.textClass} shadow-xs font-bold border border-slate-200/60`
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                    title={`${item.label} (Press ${shortcutNum} on keyboard)`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? themeConfig.textClass : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                    {item.badge ? (
                      <span className="px-1 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-extrabold uppercase tracking-wider">
                        {item.badge}
                      </span>
                    ) : (
                      <span className="hidden xl:inline text-[9px] font-mono text-slate-400 group-hover:text-slate-600 opacity-60">
                        {shortcutNum}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Action Tools Cluster */}
            <div className="flex items-center gap-2">
              
              {/* Active Plan Pill Indicator */}
              <button
                onClick={() => setActiveTab('subscription')}
                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition cursor-pointer border shadow-2xs ${
                  planTier === 'enterprise'
                    ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                    : planTier === 'pro'
                    ? `${themeConfig.badgeBg} ${themeConfig.textClass} border ${themeConfig.borderClass} hover:opacity-90`
                    : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
                }`}
                title={`Active Plan: ${planName} (Click to switch or upgrade plan)`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>{planName}</span>
              </button>

              {/* Quick Guide & Warranty Center Button */}
              <button
                onClick={() => setActiveTab('help')}
                className={`p-2 rounded-xl transition cursor-pointer ${
                  activeTab === 'help'
                    ? `${themeConfig.bgLightClass} ${themeConfig.textClass} font-bold`
                    : 'text-slate-600 hover:text-sky-600 hover:bg-slate-100'
                }`}
                title="Sensor Warranty Center & AI Support Assistant"
                aria-label="Open Sensor Warranty Center & Help Assistant"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              {/* Plant Alerts Trigger */}
              <button
                onClick={() => {
                  setIsNewHighPriorityAlert(false);
                  onOpenAlerts();
                }}
                className={`relative p-2 rounded-xl transition-all duration-300 border cursor-pointer ${
                  shouldPulseAlertIcon
                    ? 'bg-rose-50 text-rose-600 border-rose-300 shadow-xs ring-2 ring-rose-400/25'
                    : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-slate-200'
                }`}
                title={shouldPulseAlertIcon ? "High-Priority Maintenance Alert Active" : "View Plant Alerts"}
                aria-label="View alerts"
              >
                {shouldPulseAlertIcon && (
                  <span className="absolute inset-0 rounded-xl bg-rose-400/25 animate-ping pointer-events-none" />
                )}

                <Bell 
                  className={`w-4 h-4 transition-all duration-300 ${
                    shouldPulseAlertIcon 
                      ? 'text-rose-600 animate-subtle-pulse' 
                      : 'text-slate-600'
                  }`} 
                />

                {unacknowledgedCount > 0 && (
                  <span className={`absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold text-white shadow-2xs transition-transform ${
                    criticalCount > 0 ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'
                  }`}>
                    {unacknowledgedCount}
                  </span>
                )}
              </button>

              {/* PWA Install Button */}
              <PWAInstallButton compact />

              {/* User Profile / SSO */}
              {user ? (
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 p-1.5 pl-2.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl transition text-left shadow-2xs cursor-pointer"
                  >
                    <div className="flex flex-col text-right hidden md:block">
                      <span className="text-xs font-bold text-slate-900 leading-tight">
                        {user.name}
                      </span>
                      <span className={`text-[10px] ${themeConfig.textClass} font-semibold truncate max-w-[130px]`}>
                        {user.role}
                      </span>
                    </div>

                    <div className="relative">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-7 h-7 rounded-lg object-cover border border-slate-200 shadow-2xs"
                      />
                      <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center shadow-xs">
                        <svg viewBox="0 0 24 24" className="w-2.5 h-2.5">
                          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z"/>
                          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.27 21.39 7.35 24 12 24z"/>
                          <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.13z"/>
                          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.61 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"/>
                        </svg>
                      </div>
                    </div>

                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Profile Menu Dropdown */}
                  {isProfileMenuOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in duration-100"
                    >
                      <div className="pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {user.name}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                          </div>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" /> Plant:
                          </span>
                          <span className="font-semibold text-slate-800">{user.facility}</span>
                        </div>
                      </div>

                      <div className="py-2 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block">
                          Switch Operational Role
                        </span>
                        {[
                          'Chief Reliability Engineer',
                          'Plant Operations Manager',
                          'Executive VP Operations',
                        ].map((roleName) => (
                          <button
                            key={roleName}
                            onClick={() => {
                              switchRole(roleName as any);
                              setIsProfileMenuOpen(false);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition flex items-center justify-between cursor-pointer ${
                              user.role === roleName
                                ? `${themeConfig.bgLightClass} ${themeConfig.textClass} font-bold`
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span>{roleName}</span>
                            {user.role === roleName && <Check className="w-3.5 h-3.5" />}
                          </button>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-slate-100">
                        <button
                          onClick={() => {
                            logout();
                            setIsProfileMenuOpen(false);
                          }}
                          className="w-full flex items-center justify-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={openLoginModal}
                  className="min-h-[40px] flex items-center gap-2 py-1.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 font-semibold text-xs rounded-xl transition shadow-2xs cursor-pointer active:scale-95"
                >
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.27 21.39 7.35 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.13z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.61 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"/>
                  </svg>
                  <span className="hidden sm:inline">Sign in with Google</span>
                  <span className="sm:hidden">Sign In</span>
                </button>
              )}

              {/* Mobile Navigation Drawer Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition cursor-pointer active:scale-95"
                title="Toggle menu"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Dedicated Mobile Horizontal Tab Navigation Strip (Quick 1-Thumb Switching) */}
          <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2 -mx-3 px-3 border-t border-slate-100 bg-slate-50/60 touch-manipulation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 ${
                    isActive
                      ? `bg-white ${themeConfig.textClass} shadow-2xs font-bold border border-slate-200`
                      : 'text-slate-600 hover:text-slate-900 bg-white/70 border border-slate-200/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? themeConfig.textClass : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Contextual Sub-Navigation Strip (Breadcrumbs & Telemetry Status) on Tablet/Desktop */}
          <div className="hidden sm:flex items-center justify-between py-2 border-t border-slate-100 text-xs">
            {/* Breadcrumb Navigation & Active Context */}
            <div className="flex items-center gap-2 text-slate-500 min-w-0">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5 shrink-0">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Alwar Facility Alpha
              </span>
              <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
              <span className="font-semibold text-slate-700 capitalize shrink-0">
                {activeTab === 'telemetry' && 'Live Health Monitoring'}
                {activeTab === 'fleet' && 'Plant Fleet Machinery'}
                {activeTab === 'roi' && 'Value & Downtime Savings (₹)'}
                {activeTab === 'subscription' && 'Subscription Plans (₹)'}
                {activeTab === 'help' && 'Sensor Warranty & Help Assistant'}
              </span>

              {/* Active Machine Pill if on Telemetry */}
              {activeTab === 'telemetry' && currentMachine && (
                <>
                  <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
                  <span className={`font-mono font-bold ${themeConfig.textClass} bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200/60 flex items-center gap-1 truncate`}>
                    <Cpu className="w-3 h-3 shrink-0" />
                    <span className="truncate">{currentMachine.tag} ({currentMachine.name})</span>
                  </span>
                </>
              )}
            </div>

            {/* Industrial Real-Time Stream Status & PC Shortcut Hint */}
            <div className="flex items-center gap-3 text-[11px] text-slate-500 shrink-0">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-slate-700 font-semibold">10Hz Stream Active</span>
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="font-mono text-slate-500">Latency: 14ms</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
                99.98% SLA
              </span>
              <span aria-hidden="true" className="text-slate-300 hidden xl:inline">·</span>
              <span className="text-[10px] text-slate-400 font-mono hidden xl:inline">
                Press [1-5] to navigate
              </span>
            </div>
          </div>

          {/* Mobile Navigation Drawer Dropdown */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-slate-200 py-3 space-y-2.5 animate-in slide-in-from-top-2 duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center justify-between min-h-[46px] p-3 rounded-2xl text-xs font-semibold text-left transition cursor-pointer active:scale-98 ${
                        isActive
                          ? `${themeConfig.bgLightClass} ${themeConfig.textClass} font-bold border ${themeConfig.borderClass} shadow-2xs`
                          : 'text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4.5 h-4.5" />
                        <span className="text-sm font-semibold">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Mobile Quick Jump */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsCommandPaletteOpen(true);
                }}
                className="w-full min-h-[46px] flex items-center justify-between p-3 rounded-2xl bg-sky-50 text-sky-800 border border-sky-200 text-xs font-bold cursor-pointer active:scale-98"
              >
                <span className="flex items-center gap-2.5">
                  <Search className="w-4.5 h-4.5 text-sky-600" />
                  <span className="text-sm">Search all machines or views...</span>
                </span>
                <span className="text-[11px] font-mono bg-sky-200/80 px-2 py-0.5 rounded-md font-bold">⌘K</span>
              </button>

              {/* Mobile Active Plan and Facility Status */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <span className="font-semibold text-slate-800">Alwar Facility Alpha</span>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('subscription');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded-md ${themeConfig.badgeBg} ${themeConfig.textClass}`}
                >
                  {planName}
                </button>
              </div>

              {/* Mobile Install App Button */}
              <div className="pt-1">
                <PWAInstallButton className="w-full min-h-[46px] flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-600 text-white font-bold text-xs shadow-xs active:scale-98" />
              </div>
            </div>
          )}

        </div>
      </header>

      {/* Global Command Palette Search Modal */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        machines={machines}
        onSelectMachine={(id) => {
          if (onSelectMachine) onSelectMachine(id);
          setActiveTab('telemetry');
        }}
        onNavigateTab={(tab) => setActiveTab(tab)}
        onOpenAlerts={onOpenAlerts}
      />
    </>
  );
};
