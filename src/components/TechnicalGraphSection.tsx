import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  Area,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { IndustrialMachine } from '../types';
import { useTheme } from '../context/ThemeContext';
import {
  Activity,
  Flame,
  Zap,
  TrendingUp,
  SlidersHorizontal,
  Download,
  Play,
  Pause,
  Maximize2,
  RefreshCw,
  Cpu,
  Layers,
  Sparkles,
  Info,
  Radio,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Gauge,
  BarChart2,
  GitCommit
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TechnicalGraphSectionProps {
  machine: IndustrialMachine;
  isAnomalyActive?: boolean;
  liveTemp?: number;
  liveVib?: number;
  livePower?: number;
  onToggleAnomaly?: () => void;
}

type GraphTab = 'fft' | 'trend' | 'orbit' | 'rul' | 'ai_loss';

export const TechnicalGraphSection: React.FC<TechnicalGraphSectionProps> = ({
  machine,
  isAnomalyActive = false,
  liveTemp,
  liveVib,
  livePower,
  onToggleAnomaly,
}) => {
  const { themeConfig } = useTheme();
  const [activeGraphTab, setActiveGraphTab] = useState<GraphTab>('fft');
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('24h');
  const [showHarmonicMarkers, setShowHarmonicMarkers] = useState(true);
  const [selectedHarmonicPeak, setSelectedHarmonicPeak] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Orbit Canvas reference
  const orbitCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const orbitAnimRef = useRef<number | null>(null);
  const orbitAngleRef = useRef<number>(0);

  // 1. FFT Frequency Spectrum Data (0 Hz to 1000 Hz)
  const fftData = useMemo(() => {
    const runningSpeedHz = 29.8; // ~1788 RPM (1X)
    const points = [];
    
    for (let f = 2; f <= 500; f += 2) {
      let amp = 0.12 + Math.random() * 0.08; // noise floor

      // 1X Running Speed peak (~30 Hz)
      if (Math.abs(f - 30) <= 2) {
        amp += isAnomalyActive ? 4.8 : 2.1;
      }
      // 2X Misalignment harmonic (~60 Hz)
      if (Math.abs(f - 60) <= 2) {
        amp += isAnomalyActive ? 3.9 : 0.8;
      }
      // 3X Mechanical looseness (~90 Hz)
      if (Math.abs(f - 90) <= 2) {
        amp += isAnomalyActive ? 2.4 : 0.4;
      }
      // BPFO (Bearing Outer Race Defect ~118 Hz)
      if (Math.abs(f - 118) <= 2) {
        amp += isAnomalyActive ? 5.6 : 0.3;
      }
      // BPFI (Bearing Inner Race Defect ~148 Hz)
      if (Math.abs(f - 148) <= 2) {
        amp += isAnomalyActive ? 3.2 : 0.25;
      }
      // Gear Mesh Frequency (GMF ~320 Hz)
      if (Math.abs(f - 320) <= 2) {
        amp += isAnomalyActive ? 2.8 : 1.1;
      }

      points.push({
        frequency: f,
        freqLabel: `${f} Hz`,
        amplitude: Number(amp.toFixed(2)),
        threshold: 2.8,
        isSpike: amp > 2.8,
        label: 
          f === 30 ? '1X (RPM)' :
          f === 60 ? '2X (Misalign)' :
          f === 90 ? '3X (Looseness)' :
          f === 118 ? 'BPFO (Bearing outer race)' :
          f === 148 ? 'BPFI (Bearing inner race)' :
          f === 320 ? 'GMF (Gear Mesh)' : undefined,
      });
    }
    return points;
  }, [isAnomalyActive]);

  // 2. 24-Hour Multi-Parameter Time Series Data
  const trendData = useMemo(() => {
    const rawHistory = [...machine.history];
    if (rawHistory.length === 0) return [];

    return rawHistory.map((item, index) => {
      const isLatest = index === rawHistory.length - 1;
      const currentT = isLatest && liveTemp !== undefined ? liveTemp : item.temperature;
      const currentV = isLatest && liveVib !== undefined ? liveVib : item.vibration;
      const currentP = isLatest && livePower !== undefined ? livePower : item.power;
      const anomaly = isLatest ? (isAnomalyActive || item.isAnomaly) : item.isAnomaly;

      return {
        timestamp: item.timestamp,
        temperature: currentT,
        vibration: currentV,
        power: currentP,
        tempThreshold: machine.tempThreshold,
        vibThreshold: machine.vibThreshold,
        powerThreshold: machine.powerThreshold,
        isAnomaly: anomaly,
        kurtosis: Number((anomaly ? 5.4 + Math.random() * 1.8 : 2.8 + Math.random() * 0.4).toFixed(2)),
      };
    });
  }, [machine, liveTemp, liveVib, livePower, isAnomalyActive]);

  // 3. AI Loss Reconstruction Error Distribution Data
  const aiLossData = useMemo(() => {
    const bins = [];
    for (let loss = 0.01; loss <= 0.15; loss += 0.007) {
      const isHighLoss = loss > 0.065;
      const normalFrequency = Math.exp(-Math.pow((loss - 0.035) / 0.015, 2)) * 140;
      const anomalyFrequency = isAnomalyActive 
        ? Math.exp(-Math.pow((loss - 0.095) / 0.02, 2)) * 110 
        : Math.exp(-Math.pow((loss - 0.095) / 0.02, 2)) * 10;

      bins.push({
        lossBin: Number(loss.toFixed(3)),
        lossLabel: `${(loss * 100).toFixed(1)}%`,
        normalSamples: Math.round(normalFrequency),
        anomalySamples: Math.round(anomalyFrequency),
        threshold: 0.065,
      });
    }
    return bins;
  }, [isAnomalyActive]);

  // 4. Remaining Useful Life (RUL) & ISO 10816 Degradation Curve Data
  const rulData = useMemo(() => {
    const stages = [];
    const baseVib = machine.vibBaseline;
    const critVib = machine.vibThreshold * 1.4;

    for (let day = 0; day <= 30; day += 2) {
      // Exponential bearing degradation curve
      const degradationFactor = isAnomalyActive 
        ? Math.pow(day / 18, 2.4) * (critVib - baseVib)
        : Math.pow(day / 30, 1.3) * (machine.vibThreshold * 0.6 - baseVib);

      const projectedVib = Number(Math.min(critVib * 1.2, baseVib + degradationFactor).toFixed(2));
      const zone = 
        projectedVib < 2.3 ? 'Zone A (Good)' :
        projectedVib < 4.5 ? 'Zone B (Satisfactory)' :
        projectedVib < 7.1 ? 'Zone C (Unsatisfactory)' : 'Zone D (Unacceptable)';

      stages.push({
        day: `Day ${day}`,
        dayNum: day,
        vibration: projectedVib,
        zoneA: 2.3, // ISO 10816 Good
        zoneB: 4.5, // ISO 10816 Satisfactory
        zoneC: 7.1, // ISO 10816 Warning
        zoneD: 11.2, // ISO 10816 Danger
        zone,
      });
    }
    return stages;
  }, [machine, isAnomalyActive]);

  // Orbit Plot Animation Loop
  useEffect(() => {
    if (activeGraphTab !== 'orbit') return;
    const canvas = orbitCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    const height = (canvas.height = 300);
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.38;

    const trailPoints: { x: number; y: number }[] = [];
    const maxTrail = 180;

    const render = () => {
      if (isLiveStreaming) {
        orbitAngleRef.current += 0.06;
      }
      const angle = orbitAngleRef.current;

      ctx.clearRect(0, 0, width, height);

      // 1. Bearing Clearance Boundary Circle
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Inner Warning Boundary
      ctx.strokeStyle = 'rgba(251, 146, 60, 0.4)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.72, 0, Math.PI * 2);
      ctx.stroke();

      // 2. Orthogonal Proximity Probes (Probe X at 45°, Probe Y at 135°)
      ctx.setLineDash([]);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;

      // X-Axis crosshair
      ctx.beginPath();
      ctx.moveTo(centerX - radius - 20, centerY);
      ctx.lineTo(centerX + radius + 20, centerY);
      ctx.stroke();

      // Y-Axis crosshair
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - radius - 20);
      ctx.lineTo(centerX, centerY + radius + 20);
      ctx.stroke();

      // Labels
      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.fillText('+Probe X (Horizontal Displacement)', centerX + radius - 90, centerY - 8);
      ctx.fillText('+Probe Y (Vertical)', centerX + 8, centerY - radius + 14);

      // 3. Calculate Shaft Center Motion (Lissajous Ellipse with Anomaly Wobble)
      const xEccentricity = isAnomalyActive ? 0.75 : 0.32;
      const yEccentricity = isAnomalyActive ? 0.62 : 0.28;
      const phaseOffset = isAnomalyActive ? 0.45 : 0.15;
      const jitter = isAnomalyActive ? (Math.sin(angle * 5) * 0.12) : (Math.sin(angle * 2) * 0.03);

      const shaftX = centerX + Math.cos(angle) * radius * (xEccentricity + jitter);
      const shaftY = centerY + Math.sin(angle + phaseOffset + Math.sin(angle * 2) * 0.2) * radius * (yEccentricity + jitter);

      trailPoints.push({ x: shaftX, y: shaftY });
      if (trailPoints.length > maxTrail) {
        trailPoints.shift();
      }

      // Draw Orbit Trajectory Trail
      if (trailPoints.length > 1) {
        ctx.beginPath();
        ctx.moveTo(trailPoints[0].x, trailPoints[0].y);
        for (let i = 1; i < trailPoints.length; i++) {
          ctx.lineTo(trailPoints[i].x, trailPoints[i].y);
        }
        ctx.strokeStyle = isAnomalyActive ? '#ef4444' : themeConfig.primaryHex;
        ctx.lineWidth = isAnomalyActive ? 2.5 : 2;
        ctx.stroke();
      }

      // Draw Current Shaft Center Position
      ctx.fillStyle = isAnomalyActive ? '#ef4444' : themeConfig.primaryHex;
      ctx.beginPath();
      ctx.arc(shaftX, shaftY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Keyphasor pulse dot
      const keyphasorX = centerX + Math.cos(angle) * 8;
      const keyphasorY = centerY + Math.sin(angle) * 8;
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(keyphasorX, keyphasorY, 3, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [activeGraphTab, isLiveStreaming, isAnomalyActive, themeConfig.primaryHex]);

  // Export technical CSV
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    if (activeGraphTab === 'fft') {
      csvContent += 'Frequency_Hz,Amplitude_mm_s_RMS,Threshold_mm_s,Harmonic_Tag\n';
      fftData.forEach((row) => {
        csvContent += `${row.frequency},${row.amplitude},${row.threshold},"${row.label || 'None'}"\n`;
      });
    } else if (activeGraphTab === 'trend') {
      csvContent += 'Timestamp,Temperature_C,Vibration_mm_s,Power_kW,Kurtosis,Anomaly_Flag\n';
      trendData.forEach((row) => {
        csvContent += `${row.timestamp},${row.temperature},${row.vibration},${row.power},${row.kurtosis},${row.isAnomaly ? 'TRUE' : 'FALSE'}\n`;
      });
    } else {
      csvContent += 'Day,Projected_Vibration_mm_s,ISO_Severity_Zone\n';
      rulData.forEach((row) => {
        csvContent += `${row.day},${row.vibration},"${row.zone}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${machine.tag}_${activeGraphTab}_technical_telemetry.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    confetti({
      particleCount: 40,
      spread: 55,
      origin: { y: 0.6 },
      colors: [themeConfig.dotColor, '#38bdf8', '#34d399', '#f59e0b'],
    });

    setExportNotice(`Exported ${activeGraphTab.toUpperCase()} engineering dataset (.csv)!`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6 transition-colors">
      {/* 1. Header with Title, Live Indicator & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl ${themeConfig.badgeBg} ${themeConfig.textClass} flex items-center justify-center`}>
              <BarChart2 className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Technical Engineering Graphs & FFT Diagnostics</span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${themeConfig.badgeBg} ${themeConfig.textClass}`}>
                {machine.tag}
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time Fast Fourier Transform (FFT) spectrum, shaft orbital Lissajous trajectories, and ISO 10816 RUL models.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Live / Pause Button */}
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
              isLiveStreaming
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
          >
            {isLiveStreaming ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <Pause className="w-3.5 h-3.5" />
                <span>Live Stream</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Paused</span>
              </>
            )}
          </button>

          {/* Anomaly Toggle */}
          {onToggleAnomaly && (
            <button
              onClick={onToggleAnomaly}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                isAnomalyActive
                  ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{isAnomalyActive ? 'Reset Anomaly' : 'Inject Anomaly'}</span>
            </button>
          )}

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Download active technical chart data as CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Export Toast Notice */}
      {exportNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* 2. Technical Graph Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-100">
        {[
          { id: 'fft', label: '1. FFT Frequency Spectrum', icon: Activity, desc: 'Harmonics & Bearing BPFO/BPFI' },
          { id: 'trend', label: '2. Multi-Sensor Timeline', icon: TrendingUp, desc: '24h Sync: Temp, Vib, kW' },
          { id: 'orbit', label: '3. Shaft Orbit (Lissajous)', icon: RotateCw, desc: 'X/Y Proximity Centerline' },
          { id: 'rul', label: '4. ISO 10816 RUL Degradation', icon: Gauge, desc: 'Remaining Useful Life Curve' },
          { id: 'ai_loss', label: '5. AI Autoencoder Loss', icon: Cpu, desc: 'Reconstruction Error Latent Space' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeGraphTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveGraphTab(tab.id as GraphTab)}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                isActive
                  ? `${themeConfig.primaryClass} ${themeConfig.primaryHoverClass} text-white shadow-xs`
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Dynamic Technical Chart Content */}
      <div className="space-y-4">
        {/* GRAPH 1: FFT VIBRATION FREQUENCY SPECTRUM */}
        {activeGraphTab === 'fft' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Legend & Harmonic Markers Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-700">Identified Harmonics:</span>
                <span className="px-2 py-0.5 rounded-md bg-sky-50 border border-sky-200 text-sky-800 font-mono text-[11px]">
                  1X: 29.8 Hz (1788 RPM)
                </span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-800 font-mono text-[11px]">
                  2X: 59.6 Hz (Misalignment)
                </span>
                <span className={`px-2 py-0.5 rounded-md font-mono text-[11px] ${
                  isAnomalyActive ? 'bg-rose-100 border border-rose-300 text-rose-800 font-bold animate-pulse' : 'bg-slate-100 text-slate-700'
                }`}>
                  BPFO: 118.4 Hz (Bearing Outer Race)
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 font-mono text-[11px]">
                  GMF: 320 Hz (Gear Mesh)
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span>Sampling: <strong>2048 pts @ 10 kHz</strong></span>
                <span>•</span>
                <span>Window: <strong>Hanning</strong></span>
              </div>
            </div>

            {/* Recharts Bar/Area Chart for FFT Spectrum */}
            <div className="h-[280px] w-full bg-slate-50/60 p-3 rounded-2xl border border-slate-200/80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={fftData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis 
                    dataKey="frequency" 
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    unit=" Hz"
                    domain={[0, 500]}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    unit=" mm/s"
                    domain={[0, isAnomalyActive ? 7.5 : 4.5]}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs font-mono shadow-xl border border-slate-700 space-y-1">
                            <div className="font-bold text-emerald-400">{data.frequency} Hz</div>
                            <div>Amplitude: <strong>{data.amplitude} mm/s RMS</strong></div>
                            {data.label && (
                              <div className="text-amber-300 font-sans font-semibold pt-1 border-t border-slate-700">
                                🎯 {data.label}
                              </div>
                            )}
                            {data.isSpike && (
                              <div className="text-rose-400 font-sans font-bold">
                                ⚠️ Exceeds ISO 10816 Alarm Limit (2.8 mm/s)
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine 
                    y={2.8} 
                    stroke="#ef4444" 
                    strokeDasharray="4 4" 
                    label={{ value: 'ISO Threshold 2.8 mm/s', position: 'insideTopRight', fill: '#ef4444', fontSize: 10 }} 
                  />
                  <Area
                    type="monotone"
                    dataKey="amplitude"
                    stroke={isAnomalyActive ? '#ef4444' : themeConfig.primaryHex}
                    fill={isAnomalyActive ? '#fee2e2' : '#e0f2fe'}
                    strokeWidth={2}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Diagnostic Insight Callout */}
            <div className={`p-3.5 rounded-2xl text-xs flex items-start gap-3 border ${
              isAnomalyActive
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              <Info className={`w-4 h-4 shrink-0 mt-0.5 ${isAnomalyActive ? 'text-rose-600' : 'text-emerald-600'}`} />
              <div className="space-y-0.5">
                <span className="font-bold block">
                  {isAnomalyActive
                    ? 'Spectral Defect Signature Confirmed (BPFO Peak at 118.4 Hz)'
                    : 'Harmonic Baseline Normal: 1X & 2X Running Speeds Stable'}
                </span>
                <p className="text-[11px] opacity-90 leading-relaxed">
                  {isAnomalyActive
                    ? 'Elevated amplitude at 118.4 Hz indicates flaking on the outer raceway of the drive-end roller bearing. Recommend lubricating bearing and scheduling ultrasound probe.'
                    : 'The fundamental 1X running frequency (29.8 Hz) accounts for 88% of total vibrational energy, representing a well-balanced mechanical rotor without misalignment.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* GRAPH 2: 24-HOUR MULTI-SENSOR TIMELINE */}
        {activeGraphTab === 'trend' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  <span>Temperature (°C)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  <span>Vibration (mm/s)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>Power (kW)</span>
                </span>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {(['1h', '6h', '24h', '7d'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition ${
                      timeRange === range ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[280px] w-full bg-slate-50/60 p-3 rounded-2xl border border-slate-200/80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trendData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="timestamp" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#64748b' }} unit="°C" />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#64748b' }} unit="mm/s" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-2xl text-xs font-mono shadow-xl border border-slate-700 space-y-1.5">
                            <div className="text-slate-400 font-sans border-b border-slate-700 pb-1">{data.timestamp}</div>
                            <div className="flex justify-between gap-4">
                              <span className="text-orange-400">Temp:</span>
                              <strong>{data.temperature} °C</strong>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-sky-400">Vibration:</span>
                              <strong>{data.vibration} mm/s</strong>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-amber-400">Power:</span>
                              <strong>{data.power} kW</strong>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-purple-400">Kurtosis:</span>
                              <strong>{data.kurtosis}</strong>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#f97316" strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="vibration" stroke="#0284c7" strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="kurtosis" stroke="#a855f7" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* GRAPH 3: SHAFT ORBIT & LISSAJOUS PHASE PLOT */}
        {activeGraphTab === 'orbit' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Canvas Orbit Display (7 cols) */}
              <div className="md:col-span-7 bg-slate-950 rounded-2xl p-3 relative flex items-center justify-center overflow-hidden min-h-[300px] shadow-inner">
                <canvas ref={orbitCanvasRef} className="w-full h-[280px]" />
                <div className="absolute top-3 left-3 bg-slate-900/80 px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-300 border border-slate-700">
                  Orthogonal Proximity Probe X/Y (90° Offset)
                </div>
                <div className="absolute bottom-3 right-3 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Keyphasor 1X Sync</span>
                </div>
              </div>

              {/* Orbit Analytics (5 cols) */}
              <div className="md:col-span-5 space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider block font-mono">
                    Orbital Geometry Diagnostics
                  </span>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Eccentricity Ratio (ε)</span>
                    <span className="font-mono font-bold text-slate-900">
                      {isAnomalyActive ? '0.78 (Severe Ovality)' : '0.31 (Concentric)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Phase Lag Angle (ϕ)</span>
                    <span className="font-mono font-bold text-slate-900">142.6°</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Dynamic Clearance</span>
                    <span className={`font-mono font-bold ${isAnomalyActive ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {isAnomalyActive ? '18.4 μm (Critical Rub Warning)' : '48.2 μm (Safe Margin)'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 text-[11px] text-sky-900 leading-relaxed">
                  <strong>Engineering Rule:</strong> A circular orbit indicates balanced radial load. An elongated ellipse indicates angular misalignment or unequal bearing stiffness.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GRAPH 4: ISO 10816 RUL DEGRADATION CURVE */}
        {activeGraphTab === 'rul' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[10px]">Zone A: Good (&lt; 2.3 mm/s)</span>
                <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-900 font-bold text-[10px]">Zone B: Satisfactory (&lt; 4.5 mm/s)</span>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">Zone C: Unsatisfactory (&lt; 7.1 mm/s)</span>
                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-900 font-bold text-[10px]">Zone D: Danger (&gt; 7.1 mm/s)</span>
              </div>
            </div>

            <div className="h-[280px] w-full bg-slate-50/60 p-3 rounded-2xl border border-slate-200/80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={rulData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} unit=" mm/s" domain={[0, 12]} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl text-xs font-mono shadow-xl border border-slate-700 space-y-1">
                            <div className="font-bold text-sky-400">{data.day} Projection</div>
                            <div>Vibration: <strong>{data.vibration} mm/s</strong></div>
                            <div className="text-amber-300 font-sans font-bold">{data.zone}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine y={2.3} stroke="#10b981" strokeDasharray="3 3" />
                  <ReferenceLine y={4.5} stroke="#0284c7" strokeDasharray="3 3" />
                  <ReferenceLine y={7.1} stroke="#f59e0b" strokeDasharray="3 3" />
                  <ReferenceLine y={10.0} stroke="#ef4444" strokeDasharray="3 3" />
                  <Area
                    type="monotone"
                    dataKey="vibration"
                    stroke={isAnomalyActive ? '#ef4444' : '#0284c7'}
                    fill={isAnomalyActive ? '#fee2e2' : '#e0f2fe'}
                    strokeWidth={2.5}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
              <div>
                <strong>Estimated Remaining Useful Life (RUL): </strong>
                <span>{isAnomalyActive ? '14.2 Operating Days (Trip Expected Day 18)' : '180+ Operating Days (Healthy)'}</span>
              </div>
              <span className="font-mono font-bold bg-white px-2.5 py-1 rounded-lg border border-amber-300">
                Confidence: 94.2%
              </span>
            </div>
          </div>
        )}

        {/* GRAPH 5: AI AUTOENCODER RECONSTRUCTION ERROR */}
        {activeGraphTab === 'ai_loss' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-800">
                Latent Space Reconstruction Error Distribution (Loss Function: MSE)
              </span>
              <span>Threshold: <strong>Loss &gt; 0.065 (3-Sigma)</strong></span>
            </div>

            <div className="h-[280px] w-full bg-slate-50/60 p-3 rounded-2xl border border-slate-200/80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={aiLossData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="lossLabel" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} unit=" samples" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl text-xs font-mono shadow-xl border border-slate-700 space-y-1">
                            <div>Reconstruction Loss: <strong>{data.lossBin}</strong></div>
                            <div className="text-emerald-400">Normal Samples: {data.normalSamples}</div>
                            <div className="text-rose-400">Anomalous Outliers: {data.anomalySamples}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine x="6.5%" stroke="#ef4444" strokeWidth={2} label={{ value: '3σ Anomaly Cutoff', fill: '#ef4444', fontSize: 10 }} />
                  <Bar dataKey="normalSamples" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="anomalySamples" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <div>
                <strong>Model: </strong> LSTM Temporal Autoencoder + Isolation Forest (TensorFlow Lite Micro)
              </div>
              <div className="font-mono text-slate-900">
                Inference Latency: <strong>4.2 ms / sample</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
