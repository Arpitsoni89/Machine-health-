import React, { useState } from 'react';
import { 
  TrendingUp, 
  CheckCircle2, 
  Sparkles, 
  Calculator,
  ArrowRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTheme } from '../context/ThemeContext';

export const RoiCalculatorView: React.FC = () => {
  const { themeConfig } = useTheme();
  const [machineCount, setMachineCount] = useState<number>(20);
  const [hourlyDowntimeCostINR, setHourlyDowntimeCostINR] = useState<number>(150000);
  const [breakdownHoursPerYear, setBreakdownHoursPerYear] = useState<number>(48);

  const formatINR = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)} Lakhs`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  // Calculations
  const currentAnnualLoss = hourlyDowntimeCostINR * breakdownHoursPerYear;
  const expectedBreakdownReductionPercent = 0.85;
  const annualSavingsINR = currentAnnualLoss * expectedBreakdownReductionPercent;
  const netUptimeGainHours = Math.round(breakdownHoursPerYear * expectedBreakdownReductionPercent);

  const handleCelebrateRoi = () => {
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
      colors: [themeConfig.dotColor, '#38bdf8', '#34d399', '#f59e0b'],
    });
  };

  return (
    <div className="space-y-8">
      {/* Macro Problem Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-rose-50 via-white to-orange-50 border border-rose-200 p-6 sm:p-8 shadow-xs overflow-hidden transition-colors">
        <div className="relative z-10 max-w-4xl">
          <div className="text-xs text-rose-600 font-bold uppercase tracking-wider mb-2">
            Why Factories Need This
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            When machines stop suddenly, factories lose millions of rupees
          </h2>

          <div className="my-6 p-6 rounded-2xl bg-white border border-rose-200 shadow-sm flex flex-col md:flex-row items-baseline md:items-center justify-between gap-4">
            <div>
              <span className="text-4xl sm:text-5xl font-black text-rose-600 tracking-tight font-mono tabular-nums">
                ₹12 Lakh Crore
              </span>
              <p className="text-slate-700 text-sm sm:text-base font-medium mt-2">
                Lost every year in Indian factories simply because machines are only fixed AFTER they break down.
              </p>
            </div>

            <div className="shrink-0 p-3.5 rounded-xl bg-rose-50/80 text-xs text-slate-700 border border-rose-200">
              <span className="font-bold text-slate-900 block mb-0.5">The Old Way (Disaster Cycle):</span>
              <span>Machine smokes & halts ➔ Workers sit idle ➔ Customers upset.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Plant ROI Calculator */}
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xs transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className={`p-2 rounded-xl ${themeConfig.badgeBg} ${themeConfig.textClass}`}>
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                Simple Factory Savings Calculator
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Move the sliders to see how much money your factory saves by preventing machine breakdowns.
            </p>
          </div>

          <button
            onClick={handleCelebrateRoi}
            className={`w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl ${themeConfig.primaryClass} ${themeConfig.primaryHoverClass} text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs shrink-0 cursor-pointer active:scale-98`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Simulate Factory Savings</span>
          </button>
        </div>

        {/* Sliders and Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          {/* Controls */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-slate-700">How many machines in your plant?</span>
                <span className={`font-mono font-bold text-sm tabular-nums ${themeConfig.textClass}`}>{machineCount} Machines</span>
              </div>
              <input
                type="range"
                min="5"
                max="250"
                step="5"
                value={machineCount}
                onChange={(e) => setMachineCount(Number(e.target.value))}
                className="w-full h-3 sm:h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600 touch-manipulation my-1"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-slate-700">Cost if a machine stops for 1 hour:</span>
                <span className={`font-mono font-bold text-sm tabular-nums ${themeConfig.textClass}`}>{formatINR(hourlyDowntimeCostINR)} / hour</span>
              </div>
              <input
                type="range"
                min="25000"
                max="1000000"
                step="25000"
                value={hourlyDowntimeCostINR}
                onChange={(e) => setHourlyDowntimeCostINR(Number(e.target.value))}
                className="w-full h-3 sm:h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600 touch-manipulation my-1"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Includes idle workers, wasted materials, and missed customer deadlines.</span>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-slate-700">Hours of unexpected stoppage per year:</span>
                <span className={`font-mono font-bold text-sm tabular-nums ${themeConfig.textClass}`}>{breakdownHoursPerYear} Hours/Year</span>
              </div>
              <input
                type="range"
                min="10"
                max="400"
                step="5"
                value={breakdownHoursPerYear}
                onChange={(e) => setBreakdownHoursPerYear(Number(e.target.value))}
                className="w-full h-3 sm:h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600 touch-manipulation my-1"
              />
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="lg:col-span-6 rounded-3xl bg-slate-50 border border-slate-200 p-6 sm:p-7 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs">
                <span className="text-slate-500">Money currently lost to sudden breakdowns:</span>
                <span className="font-mono font-bold text-rose-600 tabular-nums">{formatINR(currentAnnualLoss)} / year</span>
              </div>

              <div className="mt-5 text-center sm:text-left">
                <span className={`text-xs uppercase font-bold tracking-wider ${themeConfig.textClass}`}>
                  Money Saved by MachineMind Every Year
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono mt-1 tabular-nums">
                  {formatINR(annualSavingsINR)}
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  By catching loose bolts and dry bearings early, <span className="font-semibold text-emerald-600">85% to 90%</span> of breakdowns are prevented.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[11px] text-slate-500 block font-medium">Extra Production Hours</span>
                  <span className="text-base font-bold text-emerald-600 font-mono tabular-nums">+{netUptimeGainHours} hrs/year</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[11px] text-slate-500 block font-medium">Machine Lifespan</span>
                  <span className={`text-base font-bold font-mono ${themeConfig.textClass}`}>+30% Longer</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Payback period for sensors</span>
              <span className="text-emerald-600 font-bold">Under 90 Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparative Matrix: The Old Way vs The MachineMind Way */}
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xs transition-colors">
        <div className="mb-6">
          <div className={`text-xs font-semibold mb-1 ${themeConfig.textClass}`}>
            Side-by-Side Comparison
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            The Old Way vs. The MachineMind Way
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            See why modern factories are switching from emergency firefighting to smart continuous care.
          </p>
        </div>

        <span className="sm:hidden text-[11px] font-semibold text-sky-600 bg-sky-50 border border-sky-200/80 px-2.5 py-1 rounded-lg inline-block mb-3">
          ← Swipe table horizontally to compare →
        </span>

        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[540px] text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-3 px-4 uppercase tracking-wider font-semibold">What Happens</th>
                <th className="py-3 px-4 uppercase tracking-wider font-semibold text-rose-700 bg-rose-50/70 rounded-t-xl">
                  The Old Way (Wait until it breaks)
                </th>
                <th className={`py-3 px-4 uppercase tracking-wider font-semibold ${themeConfig.textClass} ${themeConfig.bgLightClass} rounded-t-xl`}>
                  The MachineMind Way (Fix it before it breaks)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-900">1. When a part wears out</td>
                <td className="py-3.5 px-4 text-slate-700 bg-rose-50/30">
                  <span className="font-semibold text-rose-700 block">No one notices until machine halts with smoke.</span>
                  Factory stops completely.
                </td>
                <td className={`py-3.5 px-4 text-slate-700 ${themeConfig.bgLightClass}/40`}>
                  <span className="font-semibold text-emerald-700 block">Sensors catch the small vibration 2 weeks earlier.</span>
                  Factory keeps running smoothly.
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-900">2. The Repair Work</td>
                <td className="py-3.5 px-4 text-slate-700 bg-rose-50/30">
                  <span className="font-semibold text-rose-700 block">Emergency panic repairs at midnight.</span>
                  Mechanics work overtime in high stress.
                </td>
                <td className={`py-3.5 px-4 text-slate-700 ${themeConfig.bgLightClass}/40`}>
                  <span className={`font-semibold ${themeConfig.textClass} block`}>Planned 15-minute quick check during tea break.</span>
                  Treated gently during regular shift hours.
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-900">3. The Total Cost</td>
                <td className="py-3.5 px-4 text-slate-700 bg-rose-50/30">
                  <span className="font-semibold text-rose-700 block">Massive unexpected bill.</span>
                  Broken gears, scrapped materials, delayed orders.
                </td>
                <td className={`py-3.5 px-4 text-slate-700 ${themeConfig.bgLightClass}/40`}>
                  <span className={`font-semibold ${themeConfig.textClass} block`}>Tiny routine cost.</span>
                  A squirt of grease or a quick ₹500 bolt swap.
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-900">4. Peace of Mind</td>
                <td className="py-3.5 px-4 text-slate-700 bg-rose-50/30">
                  <span className="font-semibold text-rose-700 block">Constant stress & surprise breakdowns.</span>
                </td>
                <td className={`py-3.5 px-4 text-slate-700 ${themeConfig.bgLightClass}/40`}>
                  <span className="font-semibold text-emerald-700 block">Relaxed plant manager with happy customers.</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
