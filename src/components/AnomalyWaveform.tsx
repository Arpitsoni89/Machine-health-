import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface AnomalyWaveformProps {
  anomalyTriggered: boolean;
  onToggleAnomaly: () => void;
  machineName: string;
}

export const AnomalyWaveform: React.FC<AnomalyWaveformProps> = ({
  anomalyTriggered,
  onToggleAnomaly,
  machineName,
}) => {
  const { themeConfig } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [anomalyStats, setAnomalyStats] = useState({
    sigma: 1.1,
    anomalyConfidence: 12,
    model: 'LSTM Autoencoder + Isolation Forest v2.4',
  });

  const frameIdRef = useRef<number | null>(null);
  const timeOffsetRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 700);
    let height = (canvas.height = 240);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 240;
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      if (isRunning) {
        timeOffsetRef.current += 0.045;
      }

      const t = timeOffsetRef.current;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Crisp Light Grid Lines
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.9)';
      ctx.lineWidth = 1;

      // Horizontal grid
      const ySteps = 6;
      for (let i = 0; i <= ySteps; i++) {
        const y = (height / ySteps) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Vertical grid
      const xSteps = 14;
      for (let i = 0; i <= xSteps; i++) {
        const x = (width / xSteps) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      const centerY = height * 0.58;

      // 2. Draw AI-Learned Baseline Upper & Lower Envelopes (Dashed Soft Slate Lines)
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.7)';
      ctx.lineWidth = 1.5;

      // Upper baseline envelope
      ctx.beginPath();
      for (let x = 0; x <= width; x += 5) {
        const xFrac = x / width;
        const envelope = 38 + Math.sin(xFrac * 4 + 1) * 8;
        const y = centerY - envelope;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Lower baseline envelope
      ctx.beginPath();
      for (let x = 0; x <= width; x += 5) {
        const xFrac = x / width;
        const envelope = 38 + Math.sin(xFrac * 4 + 1) * 8;
        const y = centerY + envelope;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]); // reset line dash

      // 3. Draw Real-time Sensor Waveform (Bright Vivid Blue / Red Spike on Anomaly)
      const points: { x: number; y: number; isSpike: boolean }[] = [];
      const numPoints = Math.floor(width / 2);

      let peakAnomalyX = -1;
      let peakAnomalyY = -1;

      for (let i = 0; i < numPoints; i++) {
        const x = (i / numPoints) * width;
        const relX = x / width;

        const baseNoise =
          Math.sin(relX * 22 + t * 4) * 12 +
          Math.sin(relX * 45 + t * 8) * 6 +
          Math.sin(relX * 12 + t * 2) * 5;

        let anomalyOffset = 0;
        let isSpike = false;

        if (anomalyTriggered) {
          const anomalyCenter = 0.68;
          const dist = Math.abs(relX - anomalyCenter);
          if (dist < 0.09) {
            const spikeMag = Math.exp(-Math.pow(dist / 0.025, 2)) * 115;
            anomalyOffset = -spikeMag;
            isSpike = true;

            if (relX >= 0.67 && relX <= 0.69) {
              peakAnomalyX = x;
              peakAnomalyY = centerY + anomalyOffset;
            }
          }
        }

        const y = centerY + baseNoise + anomalyOffset;
        points.push({ x, y, isSpike });
      }

      // Draw Waveform Segments with High Definition
      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);

        if (p1.isSpike || p2.isSpike) {
          ctx.strokeStyle = '#e11d48'; // Bright Red/Rose Anomaly
          ctx.lineWidth = 3.2;
          ctx.shadowColor = 'rgba(225, 29, 72, 0.4)';
          ctx.shadowBlur = 8;
        } else {
          ctx.strokeStyle = themeConfig.primaryHex; // Bright Primary Color
          ctx.lineWidth = 2.4;
          ctx.shadowColor = 'rgba(2, 132, 199, 0.3)';
          ctx.shadowBlur = 4;
        }
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      // 4. Draw Callouts & Labels on Canvas
      ctx.fillStyle = '#64748b';
      ctx.font = '600 11px system-ui, sans-serif';
      ctx.fillText('AI Baseline Envelope (Normal Operation Zone)', width * 0.24, centerY - 52);

      // Anomaly callout if triggered
      if (anomalyTriggered && peakAnomalyX > 0) {
        ctx.fillStyle = '#be123c';
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.fillText('CRITICAL ANOMALY DETECTED', peakAnomalyX - 85, peakAnomalyY - 14);

        ctx.strokeStyle = '#be123c';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(peakAnomalyX, centerY - 45);
        ctx.lineTo(peakAnomalyX, peakAnomalyY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.beginPath();
        ctx.arc(peakAnomalyX, peakAnomalyY, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#e11d48';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      frameIdRef.current = requestAnimationFrame(render);
    };

    frameIdRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
    };
  }, [isRunning, anomalyTriggered, themeConfig]);

  useEffect(() => {
    if (anomalyTriggered) {
      setAnomalyStats({
        sigma: 3.84,
        anomalyConfidence: 97.4,
        model: 'Isolation Forest + LSTM Autoencoder',
      });
    } else {
      setAnomalyStats({
        sigma: 0.82,
        anomalyConfidence: 4.2,
        model: 'Isolation Forest + LSTM Autoencoder',
      });
    }
  }, [anomalyTriggered]);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs relative overflow-hidden transition-colors">
      {/* Top Bar with Anomaly controls and Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${themeConfig.primaryClass} animate-ping`} />
            <h3 className="font-bold text-base text-slate-900">
              Continuous AI Telemetry Waveform
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Streaming real-time FFT vibration harmonics for <span className={`font-semibold ${themeConfig.textClass}`}>{machineName}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Pause / Play */}
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isRunning ? 'Freeze' : 'Resume'}</span>
          </button>

          {/* Inject / Clear Anomaly Button */}
          <button
            onClick={onToggleAnomaly}
            className={`py-2 px-3.5 rounded-xl border text-xs font-semibold transition flex items-center gap-2 shadow-xs ${
              anomalyTriggered
                ? 'bg-rose-600 hover:bg-rose-500 border-rose-500 text-white animate-pulse'
                : `${themeConfig.primaryClass} ${themeConfig.primaryHoverClass} border-transparent`
            }`}
          >
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{anomalyTriggered ? 'Clear Anomaly Spike' : 'Test Anomaly Simulation'}</span>
          </button>
        </div>
      </div>

      {/* Bright Canvas Viewport */}
      <div className="relative w-full h-[240px] bg-slate-50/70 rounded-2xl border border-slate-200 overflow-hidden shadow-inner">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Real-time Indicator Overlay Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-2 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-200 text-[11px] font-mono shadow-sm">
          <span className="text-slate-500">Deviation:</span>
          <span className={`font-bold ${anomalyTriggered ? 'text-rose-600 font-black' : 'text-sky-600'}`}>
            {anomalyTriggered ? `+${anomalyStats.sigma}σ ABNORMAL` : `+${anomalyStats.sigma}σ NORMAL`}
          </span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-500">Confidence:</span>
          <span className={`font-bold ${anomalyTriggered ? 'text-rose-600' : 'text-emerald-600'}`}>
            {anomalyStats.anomalyConfidence}%
          </span>
        </div>
      </div>

      {/* Technical Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className={`w-3.5 h-3.5 ${themeConfig.textClass} shrink-0`} />
          <span>Self-learning baseline model compares live micro-patterns without human fatigue.</span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-600 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Edge Telemetry: 1,000 Hz</span>
        </div>
      </div>
    </div>
  );
};
