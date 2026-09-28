import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MaintenanceAlert, IndustrialMachine, TechnicianInfo } from '../types';
import { 
  X, 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Send,
  Bell,
  BellRing,
  UserCheck,
  Radio,
  Phone,
  Wrench,
  Award,
  Sparkles,
  Search,
  Filter,
  Volume2,
  VolumeX,
  Smartphone,
  ChevronRight,
  ChevronDown,
  CheckCheck,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTheme } from '../context/ThemeContext';
import { getRecommendedTechnician } from '../data/mockTechnicians';
import { soundFx, triggerHaptic, requestPushPermission, sendSystemNotification } from '../utils/notificationHelpers';

interface AlertsSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: MaintenanceAlert[];
  machines: IndustrialMachine[];
  onAcknowledge: (id: string) => void;
  onSelectMachine: (machineId: string) => void;
  onAssignTechnician: (machineId: string, alertId?: string, technician?: TechnicianInfo) => void;
  onMarkMachineRepaired: (machineId: string, repairNotes?: string) => void;
  onAcknowledgeAll?: () => void;
  onSimulateAlert?: () => void;
}

type FilterTab = 'all' | 'critical' | 'warning' | 'dispatched' | 'repaired';

export const AlertsSlideOver: React.FC<AlertsSlideOverProps> = ({
  isOpen,
  onClose,
  alerts,
  machines,
  onAcknowledge,
  onSelectMachine,
  onAssignTechnician,
  onMarkMachineRepaired,
  onAcknowledgeAll,
  onSimulateAlert,
}) => {
  const { themeConfig } = useTheme();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pushStatus, setPushStatus] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const [expandedAlertIds, setExpandedAlertIds] = useState<Record<string, boolean>>({});

  // Mobile swipe down gesture to dismiss
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchCurrentY, setTouchCurrentY] = useState<number | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only allow swipe to dismiss when dragging from the top header handle
    if (sheetRef.current && sheetRef.current.scrollTop === 0) {
      setTouchStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY !== null) {
      const currentY = e.touches[0].clientY;
      const diff = currentY - touchStartY;
      if (diff > 0) {
        setTouchCurrentY(diff);
      }
    }
  };

  const handleTouchEnd = () => {
    if (touchCurrentY && touchCurrentY > 120) {
      triggerHaptic(20);
      onClose();
    }
    setTouchStartY(null);
    setTouchCurrentY(null);
  };

  const handleEnablePush = async () => {
    triggerHaptic(30);
    const result = await requestPushPermission();
    setPushStatus(result);
    if (result === 'granted') {
      soundFx.playSuccessChime();
      sendSystemNotification('MachineMind Alerts Enabled', {
        body: 'Real-time predictive industrial notifications are now active on your device.',
      });
    }
  };

  const handleDispatch = (alert: MaintenanceAlert) => {
    triggerHaptic([30, 40, 30]);
    if (soundEnabled) soundFx.playSuccessChime();

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: [themeConfig.dotColor, '#38bdf8', '#34d399', '#f59e0b'],
    });

    const tech = getRecommendedTechnician(alert.category);
    onAssignTechnician(alert.machineId, alert.id, tech);
  };

  const handleCompleteRepair = (machineId: string) => {
    triggerHaptic([40, 60, 40]);
    if (soundEnabled) soundFx.playSuccessChime();

    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#38bdf8', '#fbbf24'],
    });
    onMarkMachineRepaired(machineId, 'Mechanical verification verified. Sensor baseline restored to ISO Zone A Normal.');
  };

  const handleAcknowledgeSingle = (id: string) => {
    triggerHaptic(20);
    if (soundEnabled) soundFx.playAlertChime();
    onAcknowledge(id);
  };

  const handleAcknowledgeAll = () => {
    triggerHaptic([30, 30]);
    if (soundEnabled) soundFx.playSuccessChime();
    if (onAcknowledgeAll) {
      onAcknowledgeAll();
    } else {
      alerts.filter(a => !a.acknowledged).forEach(a => onAcknowledge(a.id));
    }
  };

  const toggleExpand = (id: string) => {
    triggerHaptic(10);
    setExpandedAlertIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter and search computation
  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;
  const criticalCount = alerts.filter((a) => !a.acknowledged && a.severity === 'critical').length;
  const warningCount = alerts.filter((a) => !a.acknowledged && a.severity === 'warning').length;
  const dispatchedCount = alerts.filter((a) => a.acknowledged && !a.isRepaired && (a.assignedTo || a.technician)).length;
  const repairedCount = alerts.filter((a) => a.isRepaired).length;

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      // Search matching
      const matchesSearch = 
        alert.machineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.recommendedAction.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (alert.assignedTo && alert.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // Filter matching
      if (activeFilter === 'critical') return alert.severity === 'critical' && !alert.isRepaired;
      if (activeFilter === 'warning') return alert.severity === 'warning' && !alert.isRepaired;
      if (activeFilter === 'dispatched') return (alert.assignedTo || alert.technician) && !alert.isRepaired;
      if (activeFilter === 'repaired') return alert.isRepaired;

      return true;
    });
  }, [alerts, activeFilter, searchQuery]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-stretch sm:justify-end animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        ref={sheetRef}
        style={{
          transform: touchCurrentY ? `translateY(${touchCurrentY}px)` : undefined,
          transition: touchCurrentY ? 'none' : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="w-full sm:max-w-lg bg-white sm:border-l border-slate-200 h-auto max-h-[92dvh] sm:h-full sm:max-h-full rounded-t-3xl sm:rounded-none flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-right duration-250 pb-safe"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Mobile Drag Indicator Handle */}
        <div className="sm:hidden pt-2.5 pb-1 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1.5 rounded-full bg-slate-300 transition-colors" />
          <span className="text-[10px] font-medium text-slate-400 mt-1">Swipe down to dismiss</span>
        </div>

        {/* Panel Header */}
        <div className="px-4 py-3 sm:p-5 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`p-2 rounded-2xl shrink-0 flex items-center justify-center ${
                criticalCount > 0 
                  ? 'bg-rose-100 text-rose-600 ring-2 ring-rose-300/40' 
                  : 'bg-sky-100 text-sky-700'
              }`}>
                {criticalCount > 0 ? (
                  <BellRing className="w-5 h-5 animate-pulse" />
                ) : (
                  <Bell className="w-5 h-5" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight truncate">
                    Plant Alert Center
                  </h3>
                  {unacknowledgedCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500 text-white leading-none">
                      {unacknowledgedCount} new
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate">
                  Real-time IoT telemetry & auto technician dispatch
                </p>
              </div>
            </div>

            {/* Quick Header Utility Controls */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Audio Chime Toggle */}
              <button
                onClick={() => {
                  triggerHaptic(15);
                  setSoundEnabled(!soundEnabled);
                }}
                className={`p-2 rounded-xl border transition cursor-pointer active:scale-95 ${
                  soundEnabled 
                    ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200' 
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
                title={soundEnabled ? 'Mute alert sounds' : 'Enable alert sounds'}
                aria-label="Toggle alert chime sounds"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 transition cursor-pointer active:scale-95"
                aria-label="Close notifications panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Mobile Search Input */}
          <div className="mt-3 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by machine, vibration, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-slate-100 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Touch-Friendly Horizontally Scrollable Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2.5 pb-1 -mx-4 px-4">
            <button
              onClick={() => {
                triggerHaptic(15);
                setActiveFilter('all');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>All Alerts</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                activeFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {alerts.length}
              </span>
            </button>

            <button
              onClick={() => {
                triggerHaptic(15);
                setActiveFilter('critical');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                activeFilter === 'critical'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60'
              }`}
            >
              <AlertOctagon className="w-3 h-3" />
              <span>Critical</span>
              {criticalCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold bg-rose-500 text-white">
                  {criticalCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                triggerHaptic(15);
                setActiveFilter('warning');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                activeFilter === 'warning'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/60'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Warnings</span>
              {warningCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold bg-amber-500 text-white">
                  {warningCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                triggerHaptic(15);
                setActiveFilter('dispatched');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                activeFilter === 'dispatched'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200/60'
              }`}
            >
              <UserCheck className="w-3 h-3" />
              <span>Dispatched</span>
              {dispatchedCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold bg-sky-200 text-sky-900">
                  {dispatchedCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                triggerHaptic(15);
                setActiveFilter('repaired');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                activeFilter === 'repaired'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/60'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Repaired</span>
              {repairedCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold bg-emerald-200 text-emerald-900">
                  {repairedCount}
                </span>
              )}
            </button>
          </div>

          {/* Quick Actions Row: Acknowledge All & Mobile Push Status */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-[11px] text-slate-500">
              Showing {filteredAlerts.length} of {alerts.length} notifications
            </span>

            <div className="flex items-center gap-2">
              {unacknowledgedCount > 0 && (
                <button
                  onClick={handleAcknowledgeAll}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition flex items-center gap-1 cursor-pointer active:scale-95"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-slate-500" />
                  <span>Ack All ({unacknowledgedCount})</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Browser Push Permission Banner for Mobile */}
        {pushStatus !== 'granted' && (
          <div className="mx-4 mt-3 p-3 rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-sky-500 text-white shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-sky-950 leading-tight">Enable Mobile Web Push</p>
                <p className="text-[11px] text-sky-700">Receive real-time IoT alerts instantly on your lockscreen.</p>
              </div>
            </div>

            <button
              onClick={handleEnablePush}
              className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shrink-0 shadow-2xs cursor-pointer active:scale-95"
            >
              Enable
            </button>
          </div>
        )}

        {/* Alerts List Container with Mobile Smooth Scrolling */}
        <div className="flex-1 px-4 py-3 space-y-3 overflow-y-auto overscroll-contain">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-3xl bg-slate-50/80 border border-slate-200/80 my-4">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                {searchQuery ? 'No alerts matching search' : 'No alerts in this category'}
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                {searchQuery
                  ? `Clear search query "${searchQuery}" to view all plant equipment status.`
                  : 'All monitored machinery parameters are operating within ISO-standard limits.'}
              </p>

              {onSimulateAlert && (
                <button
                  onClick={() => {
                    triggerHaptic(30);
                    onSimulateAlert();
                  }}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-2xs inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-sky-600" />
                  <span>Simulate IoT Vibration Spike</span>
                </button>
              )}
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const isCritical = alert.severity === 'critical';
              const machine = machines.find((m) => m.id === alert.machineId);
              const technician = alert.technician || machine?.assignedTechnician;
              const isExpanded = !!expandedAlertIds[alert.id];

              return (
                <div
                  key={alert.id}
                  className={`p-3.5 sm:p-4 rounded-3xl border transition-all duration-150 ${
                    alert.isRepaired
                      ? 'bg-emerald-50/70 border-emerald-200/90 shadow-2xs'
                      : alert.acknowledged
                      ? 'bg-slate-50/90 border-slate-200/90 shadow-2xs'
                      : isCritical
                      ? 'bg-rose-50/90 border-rose-300/90 shadow-xs ring-1 ring-rose-400/20'
                      : 'bg-amber-50/90 border-amber-300/90 shadow-xs ring-1 ring-amber-400/20'
                  }`}
                >
                  {/* Alert Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className={`text-[11px] font-bold flex items-center gap-1.5 ${
                      alert.isRepaired
                        ? 'text-emerald-700'
                        : isCritical 
                        ? 'text-rose-700' 
                        : 'text-amber-800'
                    }`}>
                      {alert.isRepaired ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Repaired & Restored</span>
                        </>
                      ) : isCritical ? (
                        <>
                          <AlertOctagon className="w-3.5 h-3.5 shrink-0 text-rose-600 animate-pulse" />
                          <span>Critical Attention</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                          <span>Warning Inspection</span>
                        </>
                      )}
                    </span>

                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono shrink-0">
                      <Clock className="w-3 h-3" />
                      {alert.timestamp}
                    </span>
                  </div>

                  {/* Machine Title & Quick Jump Action */}
                  <div className="flex items-start justify-between gap-2">
                    <button
                      onClick={() => {
                        triggerHaptic(20);
                        onSelectMachine(alert.machineId);
                        onClose();
                      }}
                      className="text-left group flex-1 min-w-0"
                    >
                      <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-sky-600 transition flex items-center gap-1.5 truncate">
                        <span>{alert.machineName}</span>
                        {machine?.tag && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200/80 text-slate-700 font-bold">
                            {machine.tag}
                          </span>
                        )}
                        <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-sky-600 shrink-0" />
                      </h4>
                    </button>

                    {/* Expand/Collapse Toggle on Mobile */}
                    <button
                      onClick={() => toggleExpand(alert.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
                      aria-label="Toggle alert details"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Main Message */}
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                    {alert.message}
                  </p>

                  {/* Telemetry Pill Bar */}
                  <div className="mt-2 p-2 rounded-2xl bg-white border border-slate-200/80 text-xs flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-slate-500 text-[11px] truncate">
                      <Zap className="w-3 h-3 text-amber-500 shrink-0" />
                      <span>Reading:</span>
                      <span className="text-slate-900 font-mono font-bold">{alert.value}</span>
                    </div>

                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 shrink-0">
                      Limit: {alert.threshold}
                    </span>
                  </div>

                  {/* Expandable Deep Diagnostic on Mobile */}
                  {isExpanded && (
                    <div className="mt-2 p-2.5 rounded-2xl bg-white/90 border border-slate-200/90 text-[11px] space-y-1.5 animate-in fade-in duration-150">
                      <div className="text-slate-600">
                        <strong className="text-slate-800">ISO Standard:</strong> ISO 10816-3 Class II / Alarm Zone {isCritical ? 'D (Dangerous)' : 'C (Warning)'}
                      </div>
                      <div className="text-slate-600">
                        <strong className="text-slate-800">Recommended Action:</strong> {alert.recommendedAction}
                      </div>
                    </div>
                  )}

                  {/* Technician Info Card when Assigned */}
                  {technician && (
                    <div className="mt-2.5 p-2.5 sm:p-3 rounded-2xl bg-sky-50/90 border border-sky-200/90 text-xs space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={technician.avatar}
                            alt={technician.name}
                            className="w-8 h-8 rounded-full object-cover border border-sky-300 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5 truncate">
                              <span className="truncate">{technician.name}</span>
                              <span className="font-mono text-[9px] text-sky-800 bg-sky-200/80 px-1 py-0.2 rounded font-semibold shrink-0">
                                {technician.badgeId}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 truncate">
                              {technician.role}
                            </div>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          <span>ETA {technician.etaMinutes}m</span>
                        </span>
                      </div>

                      {/* Quick Contact & Dispatch Specs on Mobile */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 pt-1.5 border-t border-sky-200/60">
                        <a 
                          href={`tel:${technician.phone}`}
                          className="flex items-center gap-1 font-mono text-sky-700 hover:underline cursor-pointer"
                        >
                          <Phone className="w-3 h-3 text-sky-600" />
                          <span>{technician.phone}</span>
                        </a>
                        <div className="flex items-center gap-1 font-mono justify-end">
                          <Radio className="w-3 h-3 text-sky-600" />
                          <span>{technician.radioChannel}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mobile Action Buttons (Min 44px hit targets) */}
                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between gap-2">
                    {alert.isRepaired ? (
                      <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-100/90 px-3 py-1.5 rounded-xl">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Operating Within Baseline</span>
                      </span>
                    ) : technician ? (
                      <div className="flex items-center justify-between w-full gap-2">
                        <span className="text-[11px] text-sky-800 font-semibold flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                          <span>Tech En Route</span>
                        </span>

                        <button
                          onClick={() => handleCompleteRepair(alert.machineId)}
                          className="min-h-[42px] px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Mark Repaired & Reset</span>
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleAcknowledgeSingle(alert.id)}
                          className="min-h-[42px] px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer active:scale-95"
                        >
                          Acknowledge
                        </button>

                        <button
                          onClick={() => handleDispatch(alert)}
                          className="min-h-[42px] flex-1 max-w-[200px] px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Assign Technician</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Mobile Sticky Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <Radio className="w-3.5 h-3.5 text-sky-600 animate-pulse shrink-0" />
            <span className="truncate">ISO 10816 Continuous Edge Dispatch</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer active:scale-95 shrink-0"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
