import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { IndustrialMachine } from '../types';
import { 
  TrendingUp, 
  Flame, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface HistoricalTrendChartProps {
  machine: IndustrialMachine;
  isAnomalyActive?: boolean;
  liveTemp?: number;
  liveVib?: number;
}

export const HistoricalTrendChart: React.FC<HistoricalTrendChartProps> = ({
  machine,
  isAnomalyActive = false,
  liveTemp,
  liveVib,
}) => {
  const { themeConfig } = useTheme();
  const [viewMetric, setViewMetric] = useState<'both' | 'temperature' | 'vibration'>('both');
  const [showThresholds, setShowThresholds] = useState(true);

  // Prepare 24-hour data points, patching the latest point with live values if provided
  const chartData = useMemo(() => {
    const rawHistory = [...machine.history];
    if (rawHistory.length === 0) return [];

    const data = rawHistory.map((item, index) => {
      const isLatest = index === rawHistory.length - 1;
      return {
        ...item,
        temperature: isLatest && liveTemp !== undefined ? liveTemp : item.temperature,
        vibration: isLatest && liveVib !== undefined ? liveVib : item.vibration,
        isAnomaly: isLatest ? (isAnomalyActive || item.isAnomaly) : item.isAnomaly,
      };
    });

    return data;
  }, [machine.history, liveTemp, liveVib, isAnomalyActive]);

  // Compute 24h summary statistics
  const stats = useMemo(() => {
    if (chartData.length === 0) return { maxTemp: 0, avgTemp: 0, maxVib: 0, avgVib: 0, anomalies: 0 };
    
    let sumTemp = 0;
    let maxTemp = -Infinity;
    let sumVib = 0;
    let maxVib = -Infinity;
    let anomalies = 0;

    chartData.forEach((d) => {
      sumTemp += d.temperature;
      if (d.temperature > maxTemp) maxTemp = d.temperature;
      sumVib += d.vibration;
      if (d.vibration > maxVib) maxVib = d.vibration;
      if (d.isAnomaly || d.temperature >= machine.tempThreshold || d.vibration >= machine.vibThreshold) {
        anomalies++;
      }
    });

    return {
      maxTemp: Number(maxTemp.toFixed(1)),
      avgTemp: Number((sumTemp / chartData.length).toFixed(1)),
      maxVib: Number(maxVib.toFixed(2)),
      avgVib: Number((sumVib / chartData.length).toFixed(2)),
      anomalies,
    };
  }, [chartData, machine.tempThreshold, machine.vibThreshold]);

  // Friendly Bright Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const isExceedingTemp = dataPoint.temperature >= machine.tempThreshold;
      const isExceedingVib = dataPoint.vibration >= machine.vibThreshold;

      return (
        <div className="bg-white/95 backdrop-blur-md border border-slate-200 p-3.5 rounded-2xl shadow-xl text-xs space-y-2 font-sans min-w-[210px] z-50">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <span className="font-mono text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-sky-500" />
              {label}
            </span>
            {dataPoint.isAnomaly ? (
              <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded-md">
                Deviation
              </span>
            ) : (
              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-md">
                Nominal
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-amber-600 font-medium">
                <Flame className="w-3.5 h-3.5" />
                Temperature:
              </span>
              <span className={`font-mono font-bold ${isExceedingTemp ? 'text-rose-600 font-black' : 'text-slate-900'}`}>
                {dataPoint.temperature}°C
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sky-600 font-medium">
                <Activity className="w-3.5 h-3.5" />
                Vibration RMS:
              </span>
              <span className={`font-mono font-bold ${isExceedingVib ? 'text-rose-600 font-black' : 'text-slate-900'}`}>
                {dataPoint.vibration} mm/s
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-500">
              <span>Risk Score:</span>
              <span className={`font-mono font-bold ${dataPoint.riskScore > 65 ? 'text-rose-600' : 'text-sky-600'}`}>
                {dataPoint.riskScore}/100
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4 transition-colors">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className={`w-4 h-4 ${themeConfig.textClass}`} />
            <h3 className="font-bold text-base text-slate-900">
              24-Hour Telemetry Dynamics
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Synchronized thermal friction (°C) and triaxial vibration (mm/s RMS) with AI baseline envelopes
          </p>
        </div>

        {/* View Switches */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setViewMetric('both')}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition ${
                viewMetric === 'both'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Combined
            </button>
            <button
              onClick={() => setViewMetric('temperature')}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition flex items-center gap-1 ${
                viewMetric === 'temperature'
                  ? 'bg-white text-orange-600 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Flame className="w-3 h-3" />
              <span>Temp (°C)</span>
            </button>
            <button
              onClick={() => setViewMetric('vibration')}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition flex items-center gap-1 ${
                viewMetric === 'vibration'
                  ? 'bg-white text-sky-600 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3 h-3" />
              <span>Vib (mm/s)</span>
            </button>
          </div>

          {/* Threshold Toggle */}
          <button
            onClick={() => setShowThresholds(!showThresholds)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition flex items-center gap-1.5 ${
              showThresholds
                ? 'bg-slate-100 border-slate-300 text-sky-700 font-semibold'
                : 'bg-white border-slate-200 text-slate-400'
            }`}
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>Thresholds</span>
          </button>
        </div>
      </div>

      {/* 24-Hour Summary Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-1">
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-medium">Peak Temp (24h)</span>
            <span className="text-base font-bold font-mono text-orange-600 tabular-nums">{stats.maxTemp}°C</span>
          </div>
          <Flame className="w-4 h-4 text-orange-500/70" />
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-medium">Avg Temp (24h)</span>
            <span className="text-base font-bold font-mono text-slate-800 tabular-nums">{stats.avgTemp}°C</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Base: {machine.tempBaseline}°C</span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-medium">Peak Vibration</span>
            <span className="text-base font-bold font-mono text-sky-600 tabular-nums">{stats.maxVib} mm/s</span>
          </div>
          <Activity className="w-4 h-4 text-sky-500/70" />
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-medium">Anomalies Detected</span>
            <span className={`text-base font-bold font-mono tabular-nums ${stats.anomalies > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {stats.anomalies} Events
            </span>
          </div>
          {stats.anomalies > 0 ? (
            <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          )}
        </div>
      </div>

      {/* Main Bright Recharts Container */}
      <div className="w-full h-72 sm:h-80 bg-slate-50/70 rounded-2xl border border-slate-200 p-2 sm:p-3 relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 15, right: 15, left: -5, bottom: 5 }}
          >
            <defs>
              <linearGradient id="tempGradientFriendly" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="vibGradientFriendly" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid 
              stroke="#e2e8f0" 
              strokeDasharray="3 3" 
              vertical={false} 
            />

            <XAxis
              dataKey="timestamp"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
            />

            {(viewMetric === 'both' || viewMetric === 'temperature') && (
              <YAxis
                yAxisId="left"
                stroke="#f97316"
                fontSize={11}
                domain={['auto', 'auto']}
                tickLine={false}
                axisLine={{ stroke: '#fed7aa' }}
                unit="°C"
              />
            )}

            {(viewMetric === 'both' || viewMetric === 'vibration') && (
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#0ea5e9"
                fontSize={11}
                domain={['auto', 'auto']}
                tickLine={false}
                axisLine={{ stroke: '#bae6fd' }}
                unit="mm/s"
              />
            )}

            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: 10, fontSize: 11 }}
              formatter={(value) => <span className="text-slate-600 font-medium">{value}</span>}
            />

            {/* Threshold Reference Lines */}
            {showThresholds && (viewMetric === 'both' || viewMetric === 'temperature') && (
              <ReferenceLine
                yAxisId="left"
                y={machine.tempThreshold}
                stroke="#ef4444"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `Trip: ${machine.tempThreshold}°C`,
                  fill: '#ef4444',
                  fontSize: 10,
                  position: 'top',
                }}
              />
            )}

            {showThresholds && (viewMetric === 'both' || viewMetric === 'vibration') && (
              <ReferenceLine
                yAxisId="right"
                y={machine.vibThreshold}
                stroke="#f43f5e"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `Limit: ${machine.vibThreshold} mm/s`,
                  fill: '#f43f5e',
                  fontSize: 10,
                  position: 'bottom',
                }}
              />
            )}

            {/* Curves */}
            {(viewMetric === 'both' || viewMetric === 'temperature') && (
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="temperature"
                name="Temperature (°C)"
                stroke="#ea580c"
                strokeWidth={2.4}
                fillOpacity={1}
                fill="url(#tempGradientFriendly)"
                dot={false}
                activeDot={{ r: 5, fill: '#ea580c', stroke: '#fff', strokeWidth: 2 }}
              />
            )}

            {(viewMetric === 'both' || viewMetric === 'vibration') && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="vibration"
                name="Vibration (mm/s RMS)"
                stroke="#0284c7"
                strokeWidth={2.4}
                dot={false}
                activeDot={{ r: 5, fill: '#0284c7', stroke: '#fff', strokeWidth: 2 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Helpful Legend Note */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-sky-500" />
          <span>Nominal operational drift automatically accounts for ambient factory heating cycles.</span>
        </span>
        <span className="font-mono text-[11px] text-emerald-600 font-semibold">
          Auto-Refreshing Live
        </span>
      </div>
    </div>
  );
};
