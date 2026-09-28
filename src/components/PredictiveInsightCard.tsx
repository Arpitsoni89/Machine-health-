import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  RotateCw, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  ShieldAlert, 
  TrendingDown, 
  DollarSign, 
  Copy, 
  Check, 
  ChevronRight, 
  Cpu,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { IndustrialMachine, PredictiveInsight, PreventiveAction } from '../types';
import { useTheme } from '../context/ThemeContext';

interface PredictiveInsightCardProps {
  machine: IndustrialMachine;
  currentVibration: number;
  currentTemperature: number;
  currentPower: number;
  isAnomalyActive: boolean;
  telemetryHistory: any[];
  onDispatchTechnician?: () => void;
}

export const PredictiveInsightCard: React.FC<PredictiveInsightCardProps> = ({
  machine,
  currentVibration,
  currentTemperature,
  currentPower,
  isAnomalyActive,
  telemetryHistory,
  onDispatchTechnician,
}) => {
  const { themeConfig } = useTheme();
  const [insight, setInsight] = useState<PredictiveInsight | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [analyzedSource, setAnalyzedSource] = useState<string>('gemini-3.8-flash');
  const [analyzedTime, setAnalyzedTime] = useState<string>('');
  const [completedActions, setCompletedActions] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch predictive insights from Gemini API via server endpoint
  const runPredictiveAnalysis = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/predictive-insight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          machine,
          currentVibration,
          currentTemperature,
          currentPower,
          isAnomalyActive,
          telemetryHistory: telemetryHistory.slice(-15),
        }),
      });

      const data = await response.json();

      if (data.success && data.insight) {
        setInsight(data.insight);
        setAnalyzedSource(data.source || 'gemini-3.8-flash');
        setAnalyzedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        setCompletedActions({});
      } else {
        throw new Error(data.error || 'Unable to complete AI analysis');
      }
    } catch (err: any) {
      console.error('Error fetching predictive insight:', err);
      setErrorMsg(err.message || 'Analysis temporarily unavailable');
    } finally {
      setLoading(false);
    }
  };

  // Run on mount or when machine/anomaly state changes
  useEffect(() => {
    runPredictiveAnalysis();
  }, [machine.id, isAnomalyActive]);

  const toggleAction = (index: number) => {
    setCompletedActions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleCopyReport = () => {
    if (!insight) return;
    const reportText = `[GEMINI PREDICTIVE MAINTENANCE REPORT]
Equipment: ${machine.name} (${machine.tag})
Risk Level: ${insight.riskLevel} (${insight.failureProbability}% failure probability)
RUL (Remaining Useful Life): ${insight.estimatedRemainingUsefulLife}
Diagnosis: ${insight.anomalyClassification}
Summary: ${insight.executiveSummary}
ISO Standard: ${insight.isoComplianceStatus}

ROOT CAUSE ANALYSIS:
${insight.rootCauseAnalysis.map((rc, i) => `${i + 1}. ${rc}`).join('\n')}

RECOMMENDED PREVENTIVE ACTIONS:
${insight.preventiveActions.map((a, i) => `[${a.priority}] ${a.action} (Target: ${a.targetComponent}, Tools: ${a.requiredTools.join(', ')})`).join('\n')}

FINANCIAL IMPACT:
Potential Catastrophic Downtime Avoided: ${insight.financialRiskAvoidance.potentialSavings} (Preventive Cost: ${insight.financialRiskAvoidance.preventiveCost})
Generated at: ${new Date().toLocaleString()}`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCritical = insight?.riskLevel === 'CRITICAL' || isAnomalyActive;
  const isElevated = insight?.riskLevel === 'ELEVATED';

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs relative overflow-hidden transition-all">
      {/* Decorative gradient highlight bar */}
      <div className={`absolute top-0 inset-x-0 h-1.5 ${
        isCritical 
          ? 'bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600'
          : isElevated 
          ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500'
          : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500'
      }`} />

      {/* Header Bar: Gemini Badge & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-900 text-white shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-spin-slow" />
              <span>Gemini AI Predictive Insight</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
              <Cpu className="w-3 h-3 text-slate-400" />
              <span>model: {analyzedSource}</span>
            </span>
            {analyzedTime && (
              <span className="text-[11px] text-slate-400 hidden sm:inline-block">
                Updated at {analyzedTime}
              </span>
            )}
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Harmonic Telemetry & Degradation Forecast</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time FFT vibration spectrum & multi-sensor thermal trend synthesis for <strong>{machine.name}</strong>.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyReport}
            disabled={!insight || loading}
            className="min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95 shadow-2xs"
            title="Copy structured engineering maintenance report"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Report Copied!' : 'Copy Report'}</span>
          </button>

          <button
            onClick={runPredictiveAnalysis}
            disabled={loading}
            className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold ${themeConfig.primaryClass} ${themeConfig.primaryHoverClass} text-white shadow-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-60`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Analyzing with Gemini...' : 'Re-analyze Trend'}</span>
          </button>
        </div>
      </div>

      {/* Loading State Overlay / Skeleton */}
      {loading && (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 shadow-xs">
            <Sparkles className="w-6 h-6 animate-spin text-cyan-600" />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-bold text-slate-800">
              Gemini AI is analyzing multi-sensor telemetry curves...
            </div>
            <div className="text-xs text-slate-500 max-w-md">
              Evaluating ISO 10816-3 spectral harmonics, thermal dissipation rates, and power torque anomalies.
            </div>
          </div>
        </div>
      )}

      {/* Error Notice */}
      {errorMsg && !loading && (
        <div className="mt-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={runPredictiveAnalysis}
            className="px-3 py-1 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-500 transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Content Layout */}
      {!loading && insight && (
        <div className="mt-6 space-y-6">
          {/* Top Metric Strip: Risk Probability, RUL, ISO Status, and Anomaly Class */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Failure Risk Probability */}
            <div className={`p-4 rounded-2xl border transition-all ${
              isCritical
                ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                : isElevated
                ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
            }`}>
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Failure Probability</span>
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  isCritical ? 'bg-rose-200 text-rose-900' : isElevated ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200 text-emerald-900'
                }`}>
                  {insight.riskLevel}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black tracking-tight">
                  {insight.failureProbability}%
                </span>
                <span className="text-[11px] font-medium opacity-80">
                  computed risk factor
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200/70 h-2 rounded-full mt-2.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    isCritical ? 'bg-rose-600' : isElevated ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(Math.max(insight.failureProbability, 5), 100)}%` }}
                />
              </div>
            </div>

            {/* Estimated Remaining Useful Life (RUL) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-800">
              <div className="flex items-center justify-between text-xs font-semibold mb-2 text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>Remaining Useful Life (RUL)</span>
                </span>
                <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  Forecast
                </span>
              </div>

              <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight line-clamp-1">
                {insight.estimatedRemainingUsefulLife}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Before critical threshold breach or shutdown
              </p>
            </div>

            {/* Financial Risk Avoidance / Savings */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1 text-slate-300">
                  <span className="flex items-center gap-1.5 text-cyan-300">
                    <DollarSign className="w-4 h-4" />
                    <span>Cost Avoidance Impact</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                    Saved
                  </span>
                </div>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  {insight.financialRiskAvoidance.potentialSavings}
                </div>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between mt-2 pt-2 border-t border-slate-800">
                <span>Preventive Cost: <strong className="text-white">{insight.financialRiskAvoidance.preventiveCost}</strong></span>
                <span>Downtime Rate: <strong className="text-slate-300">{insight.financialRiskAvoidance.estimatedDowntimeCostPerHour}</strong></span>
              </div>
            </div>
          </div>

          {/* Executive Diagnosis & Anomaly Classification */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-white text-slate-800 border border-slate-200 shadow-2xs">
                  {insight.anomalyClassification}
                </span>
              </div>
              <span className="text-xs font-medium text-slate-500">
                Standard: <strong className="text-slate-700">{insight.isoComplianceStatus}</strong>
              </span>
            </div>

            <p className="text-sm font-semibold text-slate-800 leading-relaxed">
              {insight.executiveSummary}
            </p>
          </div>

          {/* Two Columns: Root Cause Breakdown & Actionable Preventive Checklist */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Root Cause Technical Analysis */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <Layers className="w-4 h-4 text-slate-500" />
                <span>Physics & Diagnostic Root Causes</span>
              </div>

              <div className="space-y-2.5">
                {insight.rootCauseAnalysis.map((cause, idx) => (
                  <div 
                    key={idx} 
                    className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-start gap-3 text-xs"
                  >
                    <span className="w-5 h-5 rounded-lg bg-slate-100 text-slate-700 font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-slate-700 font-medium leading-relaxed">
                      {cause}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Prioritized Preventive Actions Checklist */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                  <Wrench className="w-4 h-4 text-slate-500" />
                  <span>Recommended Preventive Actions</span>
                </div>
                <span className="text-[11px] text-slate-500 font-semibold">
                  {Object.values(completedActions).filter(Boolean).length}/{insight.preventiveActions.length} Scheduled
                </span>
              </div>

              <div className="space-y-2.5">
                {insight.preventiveActions.map((action: PreventiveAction, idx: number) => {
                  const isChecked = !!completedActions[idx];
                  const priorityColor = 
                    action.priority === 'IMMEDIATE' 
                      ? 'bg-rose-100 text-rose-800 border-rose-300' 
                      : action.priority === 'NEXT_SHIFT' 
                      ? 'bg-amber-100 text-amber-800 border-amber-300' 
                      : 'bg-blue-100 text-blue-800 border-blue-300';

                  return (
                    <div 
                      key={idx}
                      onClick={() => toggleAction(idx)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                        isChecked 
                          ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-400/20 opacity-85'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                      }`}
                    >
                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleAction(idx);
                        }}
                        className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition ${
                          isChecked 
                            ? 'bg-emerald-600 border-emerald-600 text-white' 
                            : 'bg-slate-50 border-slate-300 text-transparent hover:border-slate-400'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-[10px] font-extrabold px-2 py-0.2 rounded-md border ${priorityColor}`}>
                            {action.priority}
                          </span>
                          <span className="text-xs font-bold text-slate-800 truncate">
                            {action.targetComponent}
                          </span>
                          <span className="text-[11px] text-slate-400 ml-auto flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" />
                            <span>~{action.estimatedDowntimeMinutes} min</span>
                          </span>
                        </div>

                        <p className={`text-xs text-slate-700 leading-snug ${isChecked ? 'line-through text-slate-400' : ''}`}>
                          {action.action}
                        </p>

                        {/* Tools / Parts tag pills */}
                        {action.requiredTools && action.requiredTools.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap mt-2 pt-2 border-t border-slate-100">
                            <span className="text-[10px] font-semibold text-slate-400">Required:</span>
                            {action.requiredTools.map((tool, tIdx) => (
                              <span 
                                key={tIdx} 
                                className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200"
                              >
                                {tool}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Hand-off Footer */}
              {isCritical && onDispatchTechnician && (
                <div className="pt-2">
                  <button
                    onClick={onDispatchTechnician}
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Wrench className="w-4 h-4" />
                    <span>Dispatch Certified Technician with this Insight</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
