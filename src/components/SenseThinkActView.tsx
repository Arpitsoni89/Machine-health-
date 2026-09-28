import React, { useState } from 'react';
import { 
  Radio, 
  BrainCircuit, 
  BellRing, 
  ArrowRight, 
  Activity, 
  Flame, 
  Zap, 
  Sparkles, 
  CheckCircle2, 
  Play, 
  RotateCw, 
  ShieldCheck,
  Stethoscope,
  HeartHandshake
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTheme } from '../context/ThemeContext';

export const SenseThinkActView: React.FC = () => {
  const { themeConfig } = useTheme();
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(2);
  const [sensorValues, setSensorValues] = useState({ temp: 86.4, vib: 8.9, pwr: 112.5 });
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedLogs, setSimulatedLogs] = useState<string[]>([
    'Magnetic sensor feels small wobble in motor shaft...',
    'Smart software compares shaking against healthy normal habits.',
    'Plain text note generated: "Grease bearing #4 during Friday tea break."',
  ]);

  const runSimulationCycle = () => {
    setIsSimulating(true);
    setActiveStep(1);

    setTimeout(() => {
      setActiveStep(2);
      setSensorValues({
        temp: Number((75 + Math.random() * 25).toFixed(1)),
        vib: Number((6 + Math.random() * 6).toFixed(2)),
        pwr: Number((90 + Math.random() * 40).toFixed(1)),
      });
    }, 1000);

    setTimeout(() => {
      setActiveStep(3);
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
        colors: [themeConfig.dotColor, '#38bdf8', '#34d399', '#f59e0b'],
      });
      setIsSimulating(false);
      setSimulatedLogs((prev) => [
        `[${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}] Check complete! Problem caught and mechanic notified before factory stoppage.`,
        ...prev.slice(0, 4),
      ]);
    }, 2200);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className={`text-xs font-semibold mb-1 ${themeConfig.textClass}`}>
              How MachineMind Works In Simple Terms
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Sense · Think · Fix
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Traditional factories wait until a machine literally stops with smoke. MachineMind acts like a 24/7 personal doctor to prevent breakdowns completely.
            </p>
          </div>

          <button
            onClick={runSimulationCycle}
            disabled={isSimulating}
            className={`w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl ${themeConfig.primaryClass} ${themeConfig.primaryHoverClass} font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition shrink-0 active:scale-95 disabled:opacity-60 cursor-pointer text-white`}
          >
            {isSimulating ? <RotateCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>{isSimulating ? 'Testing Pipeline...' : '▶ Click to Test How It Works'}</span>
          </button>
        </div>
      </div>

      {/* 3 Step Interactive Architecture Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1: SENSE */}
        <div
          onClick={() => setActiveStep(1)}
          className={`cursor-pointer rounded-3xl border p-6 transition-all duration-200 flex flex-col justify-between ${
            activeStep === 1
              ? `${themeConfig.bgLightClass} border-sky-300 shadow-sm ring-2 ring-sky-400/20`
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className={`text-xs font-mono font-bold ${themeConfig.textClass}`}>
                STEP 1: SENSE
              </span>
              <div className={`w-9 h-9 rounded-xl ${themeConfig.badgeBg} ${themeConfig.textClass} flex items-center justify-center`}>
                <Radio className="w-4 h-4" />
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              1. Feel the Pulse (Sensors)
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Like a doctor placing a stethoscope on a chest, small magnetic sensors stick to the machine and feel shaking, heat, and electricity 24 hours a day.
            </p>

            <div className="mt-5 space-y-2 pt-4 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-slate-700">
                <span className="flex items-center gap-1.5 text-orange-600">
                  <Flame className="w-3.5 h-3.5" /> Heat:
                </span>
                <span className="font-mono font-bold">{sensorValues.temp}°C</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-slate-700">
                <span className="flex items-center gap-1.5 text-sky-600">
                  <Activity className="w-3.5 h-3.5" /> Shaking:
                </span>
                <span className="font-mono font-bold">{sensorValues.vib} mm/s</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-slate-700">
                <span className="flex items-center gap-1.5 text-amber-600">
                  <Zap className="w-3.5 h-3.5" /> Electricity:
                </span>
                <span className="font-mono font-bold">{sensorValues.pwr} kW</span>
              </div>
            </div>
          </div>

          <div className={`mt-6 flex items-center justify-between text-xs font-semibold ${themeConfig.textClass}`}>
            <span>Captures data without stopping work</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Step 2: THINK */}
        <div
          onClick={() => setActiveStep(2)}
          className={`cursor-pointer rounded-3xl border p-6 transition-all duration-200 flex flex-col justify-between ${
            activeStep === 2
              ? `${themeConfig.bgLightClass} border-sky-300 shadow-sm ring-2 ring-sky-400/20`
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className={`text-xs font-mono font-bold ${themeConfig.textClass}`}>
                STEP 2: THINK
              </span>
              <div className={`w-9 h-9 rounded-xl ${themeConfig.badgeBg} ${themeConfig.textClass} flex items-center justify-center`}>
                <BrainCircuit className="w-4 h-4" />
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              2. Spot Tiny Changes (Smart Brain)
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Humans get tired, but the computer compares each second against healthy operation. It notices micro-friction weeks before human ears can hear a squeak.
            </p>

            <div className="mt-5 space-y-2 pt-4 border-t border-slate-100 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-slate-600 mb-1">
                  <span>Deviation from Healthy:</span>
                  <span className="font-mono font-bold text-sky-600">Minor Wobble</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full ${themeConfig.primaryClass} w-3/4`} />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-600">Breakdown Forecast:</span>
                <span className="text-rose-600 font-bold">~12 Days remaining</span>
              </div>
            </div>
          </div>

          <div className={`mt-6 flex items-center justify-between text-xs font-semibold ${themeConfig.textClass}`}>
            <span>AI calculates exact time to fix</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Step 3: ACT */}
        <div
          onClick={() => setActiveStep(3)}
          className={`cursor-pointer rounded-3xl border p-6 transition-all duration-200 flex flex-col justify-between ${
            activeStep === 3
              ? `${themeConfig.bgLightClass} border-sky-300 shadow-sm ring-2 ring-sky-400/20`
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className={`text-xs font-mono font-bold ${themeConfig.textClass}`}>
                STEP 3: FIX
              </span>
              <div className={`w-9 h-9 rounded-xl ${themeConfig.badgeBg} ${themeConfig.textClass} flex items-center justify-center`}>
                <BellRing className="w-4 h-4" />
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              3. Send a Plain Note (Action)
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Instead of an emergency panic when an assembly line halts, the system sends an SMS: "Please grease bearing #4 on Friday before weekend shifts."
            </p>

            <div className="mt-5 space-y-2 pt-4 border-t border-slate-100 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-600">SMS / WhatsApp Alert:</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Sent to Crew
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-600">Repair Time:</span>
                <span className="font-bold text-slate-900">15 Minutes Routine</span>
              </div>
            </div>
          </div>

          <div className={`mt-6 flex items-center justify-between text-xs font-semibold ${themeConfig.textClass}`}>
            <span>Zero unexpected downtime</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Real-time Activity Log Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Live System Activity Log
        </h4>
        <div className="space-y-2 font-mono text-xs text-slate-600">
          {simulatedLogs.map((log, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
