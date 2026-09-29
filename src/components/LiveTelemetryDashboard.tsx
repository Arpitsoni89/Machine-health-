import React, { useState, useEffect } from 'react';
import { IndustrialMachine, MaintenanceAlert, TechnicianInfo } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SymptomGauge } from './SymptomGauge';
import { AnomalyWaveform } from './AnomalyWaveform';
import { OperationalDirectives } from './OperationalDirectives';
import { HistoricalTrendChart } from './HistoricalTrendChart';
import { TechnicalGraphSection } from './TechnicalGraphSection';
import { EnterpriseFeaturesBar } from './EnterpriseFeaturesBar';
import { TechnicianAssignmentCard } from './TechnicianAssignmentCard';
import { PredictiveInsightCard } from './PredictiveInsightCard';
import { getRecommendedTechnician } from '../data/mockTechnicians';
import { usePlan } from '../context/PlanContext';
import { 
  HeartHandshake, 
  Cpu, 
  Clock, 
  MapPin, 
  Wrench, 
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  Bell,
  CreditCard,
  Sliders,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Flame,
  Info,
  Download,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LiveTelemetryDashboardProps {
  machines: IndustrialMachine[];
  selectedMachineId: string;
  onSelectMachine: (id: string) => void;
  onAddAlert: (alert: MaintenanceAlert) => void;
  onAcknowledgeAlert?: (alertId: string) => void;
  onAssignTechnician?: (machineId: string, alertId?: string, technician?: TechnicianInfo) => void;
  onMarkMachineRepaired?: (machineId: string, repairNotes?: string) => void;
  onOpenGuide?: () => void;
  onOpenFleet?: () => void;
  onOpenAlerts?: () => void;
  onOpenSubscription?: () => void;
}

export const LiveTelemetryDashboard: React.FC<LiveTelemetryDashboardProps> = ({
  machines,
  selectedMachineId,
  onSelectMachine,
  onAddAlert,
  onAssignTechnician,
  onMarkMachineRepaired,
  onOpenGuide,
  onOpenFleet,
  onOpenAlerts,
  onOpenSubscription,
}) => {
  const { user } = useAuth();
  const { themeConfig } = useTheme();
  const { features } = usePlan();
  const currentMachine = machines.find((m) => m.id === selectedMachineId) || machines[0];
  
  // View mode: 'simple' is default for everyday normal people, 'technical' for deep engineering charts
  const [viewMode, setViewMode] = useState<'simple' | 'technical'>('simple');

  // Local dynamic metrics for live feel
  const [liveTemp, setLiveTemp] = useState(currentMachine.temperature);
  const [liveVib, setLiveVib] = useState(currentMachine.vibration);
  const [livePower, setLivePower] = useState(currentMachine.power);
  const [isAnomalyActive, setIsAnomalyActive] = useState(currentMachine.status === 'critical' || currentMachine.status === 'warning');
  const [dispatchNotification, setDispatchNotification] = useState<string | null>(null);

  // Sync when machine selection changes
  useEffect(() => {
    setLiveTemp(currentMachine.temperature);
    setLiveVib(currentMachine.vibration);
    setLivePower(currentMachine.power);
    setIsAnomalyActive(currentMachine.status !== 'normal');
  }, [selectedMachineId, currentMachine]);

  // Real-time jitter calibrated to the active subscription plan sampling speed
  useEffect(() => {
    const samplingSpeed = features.samplingRateMs || 1000;
    const interval = setInterval(() => {
      const jitterFactor = isAnomalyActive ? 1.4 : 0.4;
      setLiveTemp((prev) => {
        const delta = (Math.random() - 0.48) * jitterFactor;
        const target = isAnomalyActive ? currentMachine.tempThreshold * 1.05 : currentMachine.tempBaseline;
        return Number((prev * 0.95 + target * 0.05 + delta).toFixed(1));
      });

      setLiveVib((prev) => {
        const delta = (Math.random() - 0.48) * jitterFactor * 0.2;
        const target = isAnomalyActive ? currentMachine.vibThreshold * 1.1 : currentMachine.vibBaseline;
        return Number(Math.max(0.8, prev * 0.95 + target * 0.05 + delta).toFixed(2));
      });

      setLivePower((prev) => {
        const delta = (Math.random() - 0.48) * jitterFactor * 3.5;
        const target = isAnomalyActive ? currentMachine.powerThreshold * 1.08 : currentMachine.powerBaseline;
        return Number((prev * 0.95 + target * 0.05 + delta).toFixed(1));
      });
    }, Math.max(100, Math.min(samplingSpeed, 3000)));

    return () => clearInterval(interval);
  }, [isAnomalyActive, currentMachine, features.samplingRateMs]);

  const handleToggleAnomaly = () => {
    if (!isAnomalyActive) {
      setIsAnomalyActive(true);
      setLiveTemp(Number((currentMachine.tempThreshold * 1.12).toFixed(1)));
      setLiveVib(Number((currentMachine.vibThreshold * 1.25).toFixed(2)));
      setLivePower(Number((currentMachine.powerThreshold * 1.15).toFixed(1)));

      const newAlert: MaintenanceAlert = {
        id: `alt-${Date.now()}`,
        machineId: currentMachine.id,
        machineName: currentMachine.name,
        category: currentMachine.category,
        severity: 'critical',
        metric: 'vibration',
        value: `${(currentMachine.vibThreshold * 1.25).toFixed(1)} mm/s RMS`,
        threshold: `${currentMachine.vibThreshold} mm/s`,
        message: `High Shaking Detected on ${currentMachine.name}! Bearing needs lubrication or tightening.`,
        timestamp: 'Just now',
        acknowledged: false,
        recommendedAction: 'Inspect shaft alignment and tighten mounting bolts before end of shift.',
      };
      onAddAlert(newAlert);
      setDispatchNotification(`🚨 Problem simulated on ${currentMachine.name}: Machine is shaking heavily. Maintenance team alerted!`);
      setTimeout(() => setDispatchNotification(null), 6000);
    } else {
      setIsAnomalyActive(false);
      setLiveTemp(currentMachine.tempBaseline);
      setLiveVib(currentMachine.vibBaseline);
      setLivePower(currentMachine.powerBaseline);
      setDispatchNotification(`✅ Problem resolved! Machine vibration returned to smooth normal.`);
      setTimeout(() => setDispatchNotification(null), 4000);
    }
  };

  const handleDispatchCrew = () => {
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
      colors: [themeConfig.dotColor, '#38bdf8', '#34d399', '#f59e0b'],
    });

    const tech = getRecommendedTechnician(currentMachine.category);
    if (onAssignTechnician) {
      onAssignTechnician(currentMachine.id, undefined, tech);
    }
    setDispatchNotification(`🚀 ${tech.name} (${tech.badgeId}) assigned & dispatched! Role: ${tech.role} · Comms: ${tech.radioChannel} · ETA ${tech.etaMinutes} mins.`);
    setTimeout(() => setDispatchNotification(null), 7000);
  };

  const handleCompleteRepair = (notes?: string) => {
    setIsAnomalyActive(false);
    setLiveTemp(currentMachine.tempBaseline);
    setLiveVib(currentMachine.vibBaseline);
    setLivePower(currentMachine.powerBaseline);

    if (onMarkMachineRepaired) {
      onMarkMachineRepaired(currentMachine.id, notes);
    }
  };

  const handleDownloadReport = () => {
    const now = new Date();
    const exportPayload = {
      reportMetadata: {
        reportTitle: `Machine Telemetry & Health Audit - ${currentMachine.name}`,
        generatedAt: now.toISOString(),
        formattedDate: now.toLocaleString(),
        generator: 'MachineMind Industrial Predictive Intelligence',
        applicationVersion: '2.4.0',
        environment: 'Continuous Edge Telemetry Streaming',
        facility: user?.facility || 'Alpha Plant Facility (Alwar)',
        operator: user ? `${user.name} (${user.role})` : 'Plant Operations Engineer',
      },
      machineInformation: {
        id: currentMachine.id,
        name: currentMachine.name,
        tag: currentMachine.tag,
        category: currentMachine.categoryLabel,
        sector: currentMachine.industryLabel,
        location: currentMachine.location,
        lastMaintainedDate: currentMachine.lastMaintained,
        nextScheduledInspection: currentMachine.nextScheduledInspection,
      },
      currentHealthStatus: {
        operationalStatus: currentStatus,
        statusLabel: currentStatus === 'normal' 
          ? 'Healthy / Normal Baseline' 
          : currentStatus === 'warning' 
          ? 'Warning / Inspection Recommended' 
          : 'Critical Anomaly / Immediate Action Required',
        overallHealthScorePercent: isAnomalyActive ? 38 : currentMachine.healthScore,
        riskScorePercent: riskScore,
        anomalyCurrentlyActive: isAnomalyActive,
        estimatedHoursToFailure: isAnomalyActive ? (currentMachine.predictedTimeToFailureHours || 12) : null,
        aiDiagnosis: currentMachine.aiDiagnosticNote,
      },
      liveSensorsReadingSnapshot: {
        recordedAt: now.toISOString(),
        temperature: {
          metric: 'Thermal Temperature',
          currentValue: liveTemp,
          unit: '°C',
          baselineNormal: currentMachine.tempBaseline,
          criticalThreshold: currentMachine.tempThreshold,
          evaluation: liveTemp >= currentMachine.tempThreshold ? 'EXCEEDED_CRITICAL' : liveTemp >= currentMachine.tempBaseline * 1.2 ? 'ELEVATED' : 'SAFE_OPTIMAL',
        },
        vibration: {
          metric: 'Mechanical Vibration',
          currentValue: liveVib,
          unit: 'mm/s RMS',
          baselineNormal: currentMachine.vibBaseline,
          criticalThreshold: currentMachine.vibThreshold,
          evaluation: liveVib >= currentMachine.vibThreshold ? 'EXCEEDED_CRITICAL' : liveVib >= currentMachine.vibBaseline * 1.2 ? 'ELEVATED' : 'SAFE_OPTIMAL',
        },
        power: {
          metric: 'Motor Power Consumption',
          currentValue: livePower,
          unit: 'kW',
          baselineNormal: currentMachine.powerBaseline,
          criticalThreshold: currentMachine.powerThreshold,
          evaluation: livePower >= currentMachine.powerThreshold ? 'EXCEEDED_CRITICAL' : livePower >= currentMachine.powerBaseline * 1.2 ? 'ELEVATED' : 'SAFE_OPTIMAL',
        },
      },
      operationalDirectives: {
        recommendedIntervention: isAnomalyActive
          ? 'Priority Maintenance: Inspect shaft alignment, lubricate bearing housings, and balance motor rotor before end of shift.'
          : 'Standard Protocol: Continue routine operations. Telemetry shows equipment running within optimal vibration and thermal tolerances.',
        complianceStandard: 'ISO 10816-3 (Mechanical Vibration Industrial Machinery) & ISO 13374 Condition Monitoring Standards',
      },
      recentTelemetryHistory: currentMachine.history,
    };

    const formattedJson = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([formattedJson], { type: 'application/json' });
    const blobUrl = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    const safeTag = currentMachine.tag.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dateStamp = now.toISOString().slice(0, 10);
    downloadAnchor.href = blobUrl;
    downloadAnchor.download = `telemetry-report-${safeTag}-${dateStamp}.json`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    URL.revokeObjectURL(blobUrl);

    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.5 },
      colors: [themeConfig.dotColor, '#38bdf8', '#34d399', '#f59e0b'],
    });

    setDispatchNotification(`📄 Telemetry report for ${currentMachine.name} downloaded as formatted JSON!`);
    setTimeout(() => setDispatchNotification(null), 5000);
  };

  const currentStatus = isAnomalyActive
    ? (liveVib > currentMachine.vibThreshold || liveTemp > currentMachine.tempThreshold ? 'critical' : 'warning')
    : 'normal';

  const riskScore = currentStatus === 'critical' ? 92 : currentStatus === 'warning' ? 68 : 16;

  const firstName = user?.name ? user.name.split(' ')[0] : 'Visitor';
  const healthyCount = machines.filter(m => m.status === 'normal').length;

  return (
    <div className="space-y-6">
      {/* 1. Quick Layman Explanation Banner - What this app actually does */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div className="flex items-start gap-3.5">
          <div className={`w-11 h-11 rounded-2xl ${themeConfig.bgLightClass} border ${themeConfig.borderClass} ${themeConfig.textClass} flex items-center justify-center shrink-0 shadow-2xs mt-0.5`}>
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Hi, {firstName}! Welcome to MachineMind
              </h2>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                ● Live Monitoring
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Think of MachineMind as a <strong>smart fitness watch for factory machines</strong>. It listens to shaking, feels temperature, and gives early warnings weeks before expensive equipment breaks down.
            </p>
          </div>
        </div>

        {/* View Mode Toggle: Simple vs Technical */}
        <div className="w-full sm:w-auto grid grid-cols-2 sm:flex items-center gap-1.5 shrink-0 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setViewMode('simple')}
            className={`min-h-[40px] px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-98 ${
              viewMode === 'simple'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>😊 Simple View</span>
          </button>
          <button
            onClick={() => setViewMode('technical')}
            className={`min-h-[40px] px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-98 ${
              viewMode === 'technical'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>⚙️ Technical Graphs</span>
          </button>
        </div>
      </div>

      {/* Plan-Aware Unlocked Features & Multi-Plant Control Strip */}
      <EnterpriseFeaturesBar
        currentMachine={currentMachine}
        onOpenSubscription={onOpenSubscription}
      />

      {/* 2. Machine Switcher & Big Traffic-Light Health Status */}
      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs transition-colors">
        {/* Mobile Fast Equipment Swipe Carousel */}
        <div className="mb-4 pb-3 border-b border-slate-100 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Quick Switch Asset ({machines.length})
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Swipe to switch ➔
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 touch-manipulation">
            {machines.map((m) => {
              const isSelected = m.id === selectedMachineId;
              const isCrit = m.status === 'critical';
              const isWarn = m.status === 'warning';
              return (
                <button
                  key={m.id}
                  onClick={() => onSelectMachine(m.id)}
                  className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-2 shrink-0 cursor-pointer active:scale-95 ${
                    isSelected
                      ? `${themeConfig.bgLightClass} ${themeConfig.textClass} border ${themeConfig.borderClass} font-bold shadow-2xs ring-1 ring-slate-200`
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    isCrit ? 'bg-rose-500 animate-pulse' : isWarn ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />
                  <span>{m.name}</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {m.tag.split('-')[1] || m.tag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-4 sm:pb-6 border-b border-slate-100">
          {/* Machine Info */}
          <div className="w-full lg:w-auto">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 flex-wrap">
              <span className={`font-mono font-bold ${themeConfig.textClass}`}>{currentMachine.tag}</span>
              <span>·</span>
              <span>{currentMachine.categoryLabel}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                {currentMachine.location}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {currentMachine.name}
              </h1>

              {/* Machine Dropdown Switcher */}
              <select
                value={selectedMachineId}
                onChange={(e) => onSelectMachine(e.target.value)}
                className="w-full sm:w-auto min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs sm:text-sm font-semibold focus:outline-hidden focus:border-sky-500 transition shadow-2xs cursor-pointer"
                aria-label="Select machinery asset"
              >
                {machines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.status === 'normal' ? '🟢 Healthy' : m.status === 'warning' ? '🟡 Checkup' : '🔴 Fix Needed'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons: Download Report & Interactive Simulation */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
            <button
              onClick={handleDownloadReport}
              className="min-h-[44px] px-4 py-2.5 rounded-2xl text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              title="Download full telemetry report as formatted JSON"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Download Report</span>
            </button>

            <button
              onClick={handleToggleAnomaly}
              className={`min-h-[44px] px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                isAnomalyActive
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20 active:scale-98'
                  : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20 active:scale-98'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAnomalyActive ? '✓ Restore Normal' : '🚨 Test Problem'}</span>
            </button>
          </div>
        </div>

        {/* 3. Big, Clear "At a Glance" Traffic Light Condition Card */}
        <div className="mt-5 sm:mt-6">
          <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            isAnomalyActive
              ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-400/20'
              : 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-400/20'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5 sm:gap-4">
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs text-xl ${
                  isAnomalyActive ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
                }`}>
                  {isAnomalyActive ? '⚠️' : '✅'}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base md:text-lg font-bold text-slate-900">
                      {isAnomalyActive ? 'Attention Needed: High Vibration' : 'Condition: Running Smoothly'}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-bold ${
                      isAnomalyActive ? 'bg-rose-200 text-rose-900' : 'bg-emerald-200 text-emerald-900'
                    }`}>
                      {isAnomalyActive ? '38% Health' : '94% Health'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed">
                    {isAnomalyActive
                      ? 'The motor bearing has begun to vibrate heavily. If ignored, parts could snap in ~12 hours. We recommend greasing bearings and checking bolts.'
                      : 'All bearings and gears are balanced. Operating temperature and electrical consumption are within safe everyday levels.'}
                  </p>
                </div>
              </div>

              {/* Action Button right inside condition banner */}
              <div className="shrink-0 flex items-center w-full md:w-auto">
                {currentMachine.assignedTechnician ? (
                  <button
                    onClick={() => handleCompleteRepair()}
                    className="w-full md:w-auto min-h-[44px] px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Complete Repair & Reset</span>
                  </button>
                ) : (
                  <button
                    onClick={handleDispatchCrew}
                    className={`w-full md:w-auto min-h-[44px] px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98 ${
                      isAnomalyActive
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-300'
                    }`}
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>{isAnomalyActive ? 'Assign Technician Now' : 'Schedule Checkup'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Assigned Technician Information & Repair Card */}
      {currentMachine.assignedTechnician && (
        <TechnicianAssignmentCard
          technician={currentMachine.assignedTechnician}
          machine={currentMachine}
          onMarkRepaired={handleCompleteRepair}
        />
      )}

      {/* Notification Toast */}
      {dispatchNotification && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-900 text-xs font-semibold flex items-center justify-between shadow-md animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2.5">
            <Send className={`w-4 h-4 ${themeConfig.textClass} shrink-0`} />
            <span>{dispatchNotification}</span>
          </div>
          <button
            onClick={() => setDispatchNotification(null)}
            className="text-slate-400 hover:text-slate-600 font-bold ml-2 text-sm p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 4. Three Everyday Vitals (Heat, Shaking, Electricity) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Machine Vitals (Checked Every Second)
            </h3>
            <p className="text-xs text-slate-500">
              Click the (i) on any dial to learn what it means in plain English.
            </p>
          </div>
          <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Sensors Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SymptomGauge
            type="temperature"
            value={liveTemp}
            baseline={currentMachine.tempBaseline}
            threshold={currentMachine.tempThreshold}
            unit="°C"
          />
          <SymptomGauge
            type="vibration"
            value={liveVib}
            baseline={currentMachine.vibBaseline}
            threshold={currentMachine.vibThreshold}
            unit="mm/s"
          />
          <SymptomGauge
            type="power"
            value={livePower}
            baseline={currentMachine.powerBaseline}
            threshold={currentMachine.powerThreshold}
            unit="kW"
          />
        </div>
      </div>

      {/* 5. Simple Mode: "How MachineMind Prevents Catastrophe" 3 Plain Steps */}
      {viewMode === 'simple' && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs">
          <div className="max-w-2xl mb-6">
            <h3 className="text-base font-bold text-slate-900">
              How this works in 3 simple steps
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Factories usually wait until a machine literally smokes and stops. Here is how MachineMind prevents that:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Step 1 */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                1. Continuous Listening
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Magnetic sensors attached to the metal feel tiny vibrations that human ears can't hear.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                2. AI Spots the Wobble
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                The smart model learns the machine's healthy rhythm and flags when something begins wobbling off-track.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                3. Fix Before Stoppage
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                The mechanic gets a friendly message telling them to grease the bearing during regular break time.
              </p>
            </div>
          </div>

          {/* Quick Toggle to Technical Graphs */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-500">
              Are you an engineer looking for raw frequency data and 24-hour sensor timelines?
            </span>
            <button
              onClick={() => setViewMode('technical')}
              className={`font-semibold ${themeConfig.textClass} hover:underline flex items-center gap-1 cursor-pointer`}
            >
              <span>Switch to Technical Graphs & Oscilloscope</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 6. Technical Mode Graphs (24h Trend Chart, Waveform, Directives) */}
      {viewMode === 'technical' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between bg-slate-100 px-4 py-2.5 rounded-2xl text-xs text-slate-600">
            <span className="font-semibold text-slate-800">⚙️ Technical Engineering Mode Active</span>
            <button
              onClick={() => setViewMode('simple')}
              className="text-sky-600 font-bold hover:underline cursor-pointer"
            >
              ← Back to Simple View
            </button>
          </div>

          {/* Comprehensive Technical Engineering Graphs & FFT Diagnostics */}
          <TechnicalGraphSection
            machine={currentMachine}
            isAnomalyActive={isAnomalyActive}
            liveTemp={liveTemp}
            liveVib={liveVib}
            livePower={livePower}
            onToggleAnomaly={handleToggleAnomaly}
          />

          {/* 24-Hour Historical Temperature and Vibration Trend Chart */}
          <HistoricalTrendChart
            machine={currentMachine}
            isAnomalyActive={isAnomalyActive}
            liveTemp={liveTemp}
            liveVib={liveVib}
          />

          {/* Live AI Anomaly Waveform Graph */}
          <AnomalyWaveform
            anomalyTriggered={isAnomalyActive}
            onToggleAnomaly={handleToggleAnomaly}
            machineName={currentMachine.name}
          />

          {/* Operational Directives */}
          <OperationalDirectives
            currentStatus={currentStatus}
            riskScore={riskScore}
            assignedTechnician={currentMachine.assignedTechnician}
            onTriggerInspection={() => {
              setDispatchNotification(`📅 Planned checkup scheduled for ${currentMachine.name} in next maintenance shift.`);
            }}
            onDispatchImmediate={handleDispatchCrew}
            onMarkRepaired={handleCompleteRepair}
          />
        </div>
      )}

      {/* 7. Summary & Simple Work Order Box */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div className="flex items-start gap-3.5">
          <div className={`p-2.5 rounded-2xl ${themeConfig.bgLightClass} border ${themeConfig.borderClass} ${themeConfig.textClass} shrink-0`}>
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Diagnosis Summary</span>
              <span className="text-[11px] font-normal text-slate-500">
                (Based on live sensor data)
              </span>
            </h4>
            <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
              {currentMachine.aiDiagnosticNote}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={handleDownloadReport}
            className="px-3.5 py-2.5 border border-slate-300 bg-white hover:bg-slate-50 font-semibold text-xs rounded-xl transition flex items-center gap-1.5 shadow-2xs cursor-pointer text-slate-700"
            title="Export full machine telemetry data as formatted JSON"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download Report (.json)</span>
          </button>

          <button
            onClick={handleDispatchCrew}
            className={`px-4 py-2.5 ${themeConfig.primaryClass} ${themeConfig.primaryHoverClass} font-semibold text-xs rounded-xl transition flex items-center gap-2 shadow-xs cursor-pointer text-white`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Assign Technician</span>
          </button>
        </div>
      </div>
    </div>
  );
};
