import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { usePlan } from '../context/PlanContext';
import { 
  Check, 
  Sparkles, 
  ShieldCheck, 
  CreditCard, 
  Download, 
  Zap, 
  ArrowRight, 
  HelpCircle, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Building2,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PlanTier, BillingCycle, SubscriptionPlan } from '../types';
import { PaymentCheckoutView } from './PaymentCheckoutView';

const PLANS: SubscriptionPlan[] = [
  {
    id: 'pilot',
    name: 'Starter Pilot',
    tagline: 'Perfect for small Indian MSME workshops testing smart predictive care on 1 to 5 machines',
    forAudience: '1–5 Critical Machines',
    monthlyPrice: 9999,
    annualPricePerMonth: 8499,
    machineLimit: 5,
    features: [
      '1-Year Sensor Hardware Warranty & Diagnostic Self-Test Ping',
      'Continuous 24/7 monitoring for up to 5 machines',
      'Checks heat and shaking every 10 seconds',
      'Early warnings when machines begin to vibrate abnormally',
      'Email and dashboard alerts for plant operators',
      'Up to 6 Months of recorded telemetry history & trend data',
      'Automated Digital Work-Order Ticket Export for mechanics',
      'Standard support (reply within 48 hours)',
    ],
    specs: {
      samplingRate: 'Every 10 seconds',
      anomalyModel: 'Smart Thresholds & Averages',
      alertChannels: 'Email & In-App Alerts',
      historyRetention: 'Up to 6 Months',
      uptimeSla: '99.5% Uptime',
      supportLevel: 'Email Support (48 hr)',
      hardwareSupport: '1-Yr Warranty + Daily Self-Test',
    },
  },
  {
    id: 'pro',
    name: 'Plant Pro',
    tagline: 'Complete protection for mid-sized factory production lines across Indian industrial corridors',
    forAudience: 'Up to 20 Factory Machines',
    monthlyPrice: 39999,
    annualPricePerMonth: 31999,
    machineLimit: 20,
    isPopular: true,
    highlightBadge: 'Most Popular for Factories',
    features: [
      '3-Year Extended Sensor Hardware Warranty with Instant Hot-Swap Dispatch',
      'ISO 17025 Sensor Precision Recalibration Certificate & NIST Traceability Slip',
      'Remote SCADA / PLC Emergency Safety Trip & Motor Soft-Brake Interlock',
      'Predictive Bearing RUL (Remaining Useful Life) Estimator with ISO 10816 alarms',
      'Continuous 24/7 monitoring for up to 20 machines',
      'Live 1-second continuous shaking & heat checks',
      'Smart AI forecasts bearing damage 2–3 weeks before failure',
      'Instant WhatsApp, SMS, and mechanic dispatch notes',
      'Up to 12 Months of recorded telemetry health history & CSV export',
      'Automatic repair checklists with recommended parts',
      'Priority telephone support (reply within 2 hours)',
    ],
    specs: {
      samplingRate: '1 Second (Live Real-Time)',
      anomalyModel: 'Physics-Guided Neural AI + RUL',
      alertChannels: 'SMS, WhatsApp, Slack & SCADA Relay',
      historyRetention: 'Up to 12 Months',
      uptimeSla: '99.9% Uptime',
      supportLevel: 'Priority On-Call (2 hr)',
      hardwareSupport: '3-Yr Hot-Swap + ISO 17025 Digital Cert',
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise Fleet',
    tagline: 'Zero-downtime reliability for multi-site industrial plants and conglomerates across India',
    forAudience: 'Up to 30 Plant Machines',
    monthlyPrice: 119999,
    annualPricePerMonth: 95999,
    machineLimit: 30,
    highlightBadge: 'Zero Downtime Guarantee',
    features: [
      'Up to 3-Year Warranty with up to 10 Sensor Replacements & Free Hardware Updates while Plan is Active',
      'Annual On-Site ISO 17025 Sensor Precision Recalibration & Verification',
      'Multi-Plant Digital Twin & Bi-Directional SAP / Oracle CMMS Sync',
      'Continuous 24/7 monitoring for up to 30 machines across plant lines',
      'Sub-second real-time sensor synchronization',
      'Custom AI models tailored to custom factory equipment',
      'Up to 24 Months of enterprise telemetry cloud storage & archival',
      '24/7 dedicated senior mechanical engineer on call (15-min SLA)',
    ],
    specs: {
      samplingRate: 'Sub-second Live Stream',
      anomalyModel: 'Custom Bespoke Factory AI',
      alertChannels: 'Full Multi-Channel + ERP Sync',
      historyRetention: 'Up to 24 Months Storage',
      uptimeSla: '99.99% Uptime',
      supportLevel: '24/7 Dedicated (15 min SLA)',
      hardwareSupport: 'Up to 3-Yr (10 Replacements) + Free Updates',
    },
  },
];

interface SubscriptionPlansViewProps {
  onPlanChanged?: (planId: PlanTier) => void;
  onNavigateToHelp?: () => void;
  onGoToDashboard?: () => void;
}

export const SubscriptionPlansView: React.FC<SubscriptionPlansViewProps> = ({
  onPlanChanged,
  onNavigateToHelp,
  onGoToDashboard,
}) => {
  const { themeConfig } = useTheme();
  const { user } = useAuth();
  const { planTier, setPlanTier } = usePlan();

  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annual');
  const [currentPlanId, setCurrentPlanId] = useState<PlanTier>(planTier);
  const [selectedPlanToUpgrade, setSelectedPlanToUpgrade] = useState<SubscriptionPlan | null>(null);
  const [isProcessingUpgrade, setIsProcessingUpgrade] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Sync with context planTier
  useEffect(() => {
    setCurrentPlanId(planTier);
  }, [planTier]);

  // Interactive Quote Customizer state
  const [customMachineCount, setCustomMachineCount] = useState<number>(12);
  const [includeExtraAccelerometers, setIncludeExtraAccelerometers] = useState<boolean>(true);
  const [includeHighTempRTD, setIncludeHighTempRTD] = useState<boolean>(true);
  const [includeEdgeGateway, setIncludeEdgeGateway] = useState<boolean>(false);

  const activeMachinesCount = 6;
  const currentPlan = PLANS.find((p) => p.id === currentPlanId) || PLANS[1];
  const maxQuota = currentPlan.machineLimit === 'Unlimited' ? 999 : currentPlan.machineLimit;
  const usagePercentage = Math.min(100, Math.round((activeMachinesCount / maxQuota) * 100));

  const handleOpenUpgrade = (plan: SubscriptionPlan) => {
    setSelectedPlanToUpgrade(plan);
  };

  const handleInstantSwitch = (plan: SubscriptionPlan) => {
    setCurrentPlanId(plan.id);
    setPlanTier(plan.id);
    if (onPlanChanged) {
      onPlanChanged(plan.id);
    }
    setToastMessage(`Plan Changed to ${plan.name}! All ${plan.name} features and quotas are now active.`);
    setTimeout(() => setToastMessage(null), 6000);
  };

  const handleConfirmPlanChange = () => {
    if (!selectedPlanToUpgrade) return;
    setIsProcessingUpgrade(true);

    setTimeout(() => {
      setCurrentPlanId(selectedPlanToUpgrade.id);
      setIsProcessingUpgrade(false);
      setSelectedPlanToUpgrade(null);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: [themeConfig.dotColor, '#38bdf8', '#34d399', '#f59e0b'],
      });

      setToastMessage(`Plan successfully switched to ${selectedPlanToUpgrade.name}! Your plant capacity has been updated.`);
      setTimeout(() => setToastMessage(null), 5000);
    }, 900);
  };

  const sampleInvoices = [
    { id: 'INV-2026-0914', date: 'Sept 1, 2026', amount: billingCycle === 'annual' ? '₹3,83,988.00' : '₹39,999.00', status: 'Paid', period: 'Sept 2026 - Aug 2027' },
    { id: 'INV-2025-0914', date: 'Sept 1, 2025', amount: '₹3,83,988.00', status: 'Paid', period: 'Sept 2025 - Aug 2026' },
  ];

  const faqs = [
    {
      q: 'How does MachineMind connect to our existing factory sensors?',
      a: 'MachineMind communicates natively through standard industrial protocols like IO-Link, Modbus TCP/RTU, 4-20mA current loops, and OPC-UA. If your machines lack digital sensors, our quick-attach wireless triaxial magnetic vibration pods install in under 5 minutes without drilling or halting production.',
    },
    {
      q: 'Can we upgrade or downgrade our machine capacity mid-cycle?',
      a: 'Yes! When you add new CNC machines, turbines, or assembly robots, you can upgrade instantly. Billing is prorated to the exact day, ensuring you only pay for active machinery.',
    },
    {
      q: 'Is our production telemetry stored safely and kept confidential?',
      a: 'Absolutely. All plant vibration, temperature, and current metrics are encrypted in transit via TLS 1.3 and at rest with AES-256. MachineMind models run in isolated tenant sandboxes; your acoustic signatures are never mixed or shared with competitors.',
    },
    {
      q: 'What happens if a sensor disconnects or WiFi drops in the plant?',
      a: 'Our edge gateway buffers up to 72 hours of high-frequency waveform data locally on flash memory and automatically reconciles with the cloud once plant connectivity is restored.',
    },
  ];

  if (selectedPlanToUpgrade) {
    return (
      <div className="space-y-6">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 bg-white border border-emerald-300 shadow-xl rounded-2xl p-4 max-w-md flex items-start gap-3 animate-in slide-in-from-top-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-xs font-bold text-slate-900">Subscription Updated</h4>
              <p className="text-xs text-slate-600 mt-0.5">{toastMessage}</p>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <PaymentCheckoutView
          plan={selectedPlanToUpgrade}
          billingCycle={billingCycle}
          onPaymentSuccess={(plan, cycle, receipt) => {
            setCurrentPlanId(plan.id);
            setPlanTier(plan.id);
            if (onPlanChanged) {
              onPlanChanged(plan.id);
            }
            setToastMessage(`Payment confirmed! Plan changed to ${plan.name}. All ${plan.name} features are now unlocked.`);
          }}
          onCancel={() => setSelectedPlanToUpgrade(null)}
          onGoToDashboard={() => {
            setSelectedPlanToUpgrade(null);
            if (onGoToDashboard) {
              onGoToDashboard();
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-white border border-emerald-300 shadow-xl rounded-2xl p-4 max-w-md flex items-start gap-3 animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-slate-900">Subscription Updated</h4>
            <p className="text-xs text-slate-600 mt-0.5">{toastMessage}</p>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner - Clean, bright, and spacious */}
      <div className="text-center max-w-3xl mx-auto space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-slate-200 shadow-2xs">
          <Sparkles className={`w-3.5 h-3.5 ${themeConfig.textClass}`} />
          <span className="text-slate-700">Simple, Transparent Pricing</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Keep your machines protected with <span className={themeConfig.textClass}>smart care</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Prevent expensive machine breakdowns with 24/7 smart monitoring. 
          No confusing contracts. Cancel anytime. Choose the plan that fits your machine count.
        </p>

        {/* Clean Billing Switcher Toggle */}
        <div className="pt-3 flex items-center justify-center">
          <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs inline-flex items-center gap-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                billingCycle === 'monthly'
                  ? `${themeConfig.primaryClass} font-semibold shadow-xs`
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>

            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
                billingCycle === 'annual'
                  ? `${themeConfig.primaryClass} font-semibold shadow-xs`
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-amber-950 shadow-2xs">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Subscription Overview Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Current Active Plan</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${themeConfig.badgeBg} ${themeConfig.badgeText} border ${themeConfig.borderClass}`}>
                {currentPlan.name}
              </span>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active Subscription
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 flex items-baseline gap-2">
              <span>{user ? user.facility : 'Plant Facility Alpha'}</span>
              <span className="text-xs font-normal text-slate-500">
                (Renews Oct 26, 2026 · {billingCycle === 'annual' ? 'Billed Annually' : 'Billed Monthly'})
              </span>
            </h3>

            <p className="text-xs text-slate-600 max-w-xl">
              Equipped with 1-second continuous telemetry sampling, AI bearing spall forecasting, and automated WhatsApp technician dispatching.
            </p>
          </div>

          {/* Machine Quota Utilization Progress */}
          <div className="lg:w-80 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Monitored Assets Quota</span>
              <span className="font-mono font-bold text-slate-900">
                {activeMachinesCount} / {currentPlan.machineLimit === 'Unlimited' ? '∞' : `${currentPlan.machineLimit} Machines`}
              </span>
            </div>

            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${themeConfig.primaryClass}`}
                style={{ width: `${currentPlan.machineLimit === 'Unlimited' ? 25 : usagePercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>{currentPlan.machineLimit === 'Unlimited' ? 'Unlimited capacity available' : `${currentPlan.machineLimit - activeMachinesCount} asset slots remaining`}</span>
              <span className="font-semibold text-emerald-600">100% Healthy Signal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === currentPlanId;
          const displayPrice = billingCycle === 'annual' ? plan.annualPricePerMonth : plan.monthlyPrice;

          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 ${
                isCurrent
                  ? `bg-white border-2 ${themeConfig.borderClass} shadow-md`
                  : plan.isPopular
                  ? 'bg-white border-2 border-slate-300 shadow-sm hover:border-slate-400'
                  : 'bg-white border border-slate-200 shadow-xs hover:border-slate-300'
              }`}
            >
              {/* Highlight Badge if popular or current */}
              {plan.highlightBadge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-slate-900 text-white shadow-sm">
                  {plan.highlightBadge}
                </div>
              )}

              <div>
                {/* Plan Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{plan.forAudience}</p>
                  </div>
                  {isCurrent && (
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${themeConfig.badgeBg} ${themeConfig.badgeText}`}>
                      Current Plan
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="my-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
                      ₹{displayPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      / month
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {billingCycle === 'annual' ? 'Billed annually (₹' + (displayPrice * 12).toLocaleString('en-IN') + '/yr + GST)' : 'Billed monthly (+ 18% GST)'}
                  </p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-6 pb-6 border-b border-slate-100">
                  {plan.tagline}
                </p>

                {/* Feature List */}
                <div className="space-y-3 text-xs text-slate-700 mb-8">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Included Capabilities
                  </div>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        isCurrent || plan.isPopular ? themeConfig.badgeBg : 'bg-slate-100'
                      }`}>
                        <Check className={`w-3 h-3 ${isCurrent || plan.isPopular ? themeConfig.textClass : 'text-slate-600'}`} />
                      </div>
                      <span className="leading-snug">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="space-y-2">
                <button
                  onClick={() => handleOpenUpgrade(plan)}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isCurrent
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                      : plan.isPopular
                      ? `${themeConfig.primaryClass} ${themeConfig.primaryHoverClass} text-white shadow-md hover:scale-[1.01]`
                      : 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs hover:scale-[1.01]'
                  }`}
                >
                  {isCurrent ? (
                    <>
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      <span>Active Plan · Payment & Invoices</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Select {plan.name} & Checkout</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {!isCurrent && (
                  <button
                    onClick={() => handleInstantSwitch(plan)}
                    className="w-full py-2 px-3 rounded-xl text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    title={`Instantly activate ${plan.name} features without entering payment info`}
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Quick Switch to {plan.name}</span>
                  </button>
                )}

                {/* Plan Warranty Terms & Conditions */}
                <div className="pt-2 text-center border-t border-slate-100/80">
                  <p className="text-[10px] leading-tight text-slate-400">
                    <span className="font-semibold text-slate-600">*Terms &amp; Conditions:</span> If any sensor is repaired by a third party, then warranty is void and is not replaceable by the company.
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature & Technical Specs Comparison Matrix */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Technical Architecture & SLA Matrix</h3>
            <p className="text-xs text-slate-500 mt-1">
              Compare data retention, sensor sampling frequencies, and engineering support tiers.
            </p>
          </div>
          <span className="sm:hidden text-[11px] font-semibold text-sky-600 bg-sky-50 border border-sky-200/80 px-2.5 py-1 rounded-lg self-start">
            ← Swipe horizontally to compare tiers →
          </span>
        </div>

        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[580px] text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-3 px-4 font-semibold">Specification</th>
                <th className="py-3 px-4 font-semibold">Starter Pilot</th>
                <th className={`py-3 px-4 font-semibold ${themeConfig.textClass}`}>Plant Pro (Active)</th>
                <th className="py-3 px-4 font-semibold">Enterprise Fleet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              <tr>
                <td className="py-3.5 px-4 font-sans font-medium text-slate-900">Machine Capacity</td>
                <td className="py-3.5 px-4 text-slate-600">5 Machines</td>
                <td className="py-3.5 px-4 font-bold text-slate-900">20 Machines</td>
                <td className="py-3.5 px-4 font-bold text-slate-900">Up to 30 Machines</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-sans font-medium text-slate-900">Sensor Polling Frequency</td>
                <td className="py-3.5 px-4 text-slate-600">10 Seconds</td>
                <td className="py-3.5 px-4 font-bold text-slate-900">1 Second (Live FFT)</td>
                <td className="py-3.5 px-4 text-slate-600">Sub-second Stream</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-sans font-medium text-slate-900">Diagnostic AI Engine</td>
                <td className="py-3.5 px-4 text-slate-600">Threshold Statistics</td>
                <td className="py-3.5 px-4 font-bold text-slate-900">Physics-Guided FFT</td>
                <td className="py-3.5 px-4 text-slate-600">Custom Neural OEM Model</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-sans font-medium text-slate-900">Alert Dispatching Channels</td>
                <td className="py-3.5 px-4 text-slate-600">Email & In-App</td>
                <td className="py-3.5 px-4 font-bold text-slate-900">WhatsApp, SMS, Slack</td>
                <td className="py-3.5 px-4 text-slate-600">SAP / ERP Webhooks</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-sans font-medium text-slate-900">Historical Data Retention</td>
                <td className="py-3.5 px-4 text-slate-600">Up to 6 Months</td>
                <td className="py-3.5 px-4 font-bold text-slate-900">Up to 12 Months</td>
                <td className="py-3.5 px-4 text-slate-600">Up to 24 Months</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-sans font-medium text-slate-900">SCADA / PLC Safety Trip Interlock</td>
                <td className="py-3.5 px-4 text-slate-400 font-sans">✕ Not Available</td>
                <td className="py-3.5 px-4 font-bold text-emerald-600 font-sans">✓ Included (OPC-UA / PLC Relay)</td>
                <td className="py-3.5 px-4 font-bold text-emerald-600 font-sans">✓ Included (Multi-Site Interlock)</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-sans font-medium text-slate-900">ISO 17025 Calibration Certificate</td>
                <td className="py-3.5 px-4 text-slate-400 font-sans">✕ Not Available</td>
                <td className="py-3.5 px-4 font-bold text-emerald-600 font-sans">✓ Included (Digital PDF & NIST Traceable)</td>
                <td className="py-3.5 px-4 font-bold text-emerald-600 font-sans">✓ Included (Annual On-Site Metrology)</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-sans font-medium text-slate-900">Mechanical Engineer Support</td>
                <td className="py-3.5 px-4 text-slate-600">Standard (48 hr)</td>
                <td className="py-3.5 px-4 font-bold text-slate-900">Priority (2 hr SLA)</td>
                <td className="py-3.5 px-4 text-slate-600">24/7 Dedicated (15 min)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Matrix Terms & Conditions Footnote */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="font-semibold text-slate-700">*Warranty Policy:</span>
          <span>If any sensor is repaired by a third party, then warranty is void and is not replaceable by the company.</span>
        </div>
      </div>

      {/* Billing & Invoices Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Method Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Payment Method</span>
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified
              </span>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-7 bg-slate-900 rounded flex items-center justify-center text-white text-[10px] font-bold font-mono">
                VISA
              </div>
              <div className="text-xs">
                <div className="font-semibold text-slate-900 font-mono">•••• •••• •••• 4829</div>
                <div className="text-slate-500 text-[11px]">Expires 11/2028 · Corporate Plant Card</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setToastMessage('Payment details updated. Security token refreshed.');
              setTimeout(() => setToastMessage(null), 4000);
            }}
            className="mt-6 w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
          >
            Update Payment Method
          </button>
        </div>

        {/* Invoice History Card */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Recent Plant Invoices</span>
              <span className="text-xs text-slate-500">Auto-generated for Tax / GST compliance</span>
            </div>

            <div className="space-y-2">
              {sampleInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="font-bold text-slate-900 font-mono">{inv.id}</div>
                      <div className="text-slate-500 text-[11px]">{inv.period} · {inv.date}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold text-slate-900 font-mono">{inv.amount}</div>
                      <div className="text-[10px] text-emerald-600 font-semibold">{inv.status}</div>
                    </div>

                    <button
                      onClick={() => {
                        setToastMessage(`Downloading invoice ${inv.id}.pdf...`);
                        setTimeout(() => setToastMessage(null), 3000);
                      }}
                      title="Download PDF"
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-600 transition"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Need procurement invoicing by purchase order (PO)?</span>
            <button
              onClick={() => {
                setToastMessage('Contacting enterprise billing desk...');
                setTimeout(() => setToastMessage(null), 3000);
              }}
              className={`font-semibold ${themeConfig.textClass} hover:underline`}
            >
              Request Net-30 PO Billing →
            </button>
          </div>
        </div>
      </div>

      {/* Sensor Hardware Warranty Guarantee Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Industrial Sensor Hardware Warranty Policy Included</span>
          </div>
          <h3 className="text-xl font-bold tracking-tight">
            Guaranteed Replacement Protection for All Vibration & Thermal Sensors
          </h3>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            Every subscription includes hardware warranty coverage. Plant Pro tiers feature **Overnight Hot-Swap Dispatch** for damaged or drifting probes, while Enterprise Fleet provides **Up to 3-Year Warranty with up to 10 Sensor Replacements** and free hardware updates while your plan is active.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          {onNavigateToHelp && (
            <button
              onClick={onNavigateToHelp}
              className={`px-5 py-3 rounded-2xl text-xs font-bold ${themeConfig.primaryClass} ${themeConfig.primaryHoverClass} text-white shadow-xs transition flex items-center gap-2 cursor-pointer`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Sensor Warranty & Help Assistant →</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Custom Quote & Hardware Estimator */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${themeConfig.textClass}`}>
              Custom Deployment Estimator
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Interactive Factory Sizing & Sensor Package Customizer
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Configure your factory's exact machine footprint and optional sensor bundles to calculate instant annual ROI.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">Recommended Tier</span>
            <span className="text-sm font-extrabold text-slate-900 font-mono">
              {customMachineCount <= 5 ? 'Starter Pilot' : customMachineCount <= 25 ? 'Plant Pro Tier' : 'Enterprise Fleet'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          {/* Controls */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                <span>Number of Monitored Machines</span>
                <span className={`font-mono text-sm ${themeConfig.textClass}`}>{customMachineCount} Machines</span>
              </div>
              <input
                type="range"
                min="1"
                max="60"
                value={customMachineCount}
                onChange={(e) => setCustomMachineCount(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>1 Workshop Machine</span>
                <span>20 Production Line</span>
                <span>60 Multi-Bay Fleet</span>
              </div>
            </div>

            {/* Hardware Sensor Add-On Toggles */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                Sensor Hardware Packages (Includes 3-Year Hot-Swap Warranty)
              </span>

              <label className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/70 transition">
                <input
                  type="checkbox"
                  checked={includeExtraAccelerometers}
                  onChange={(e) => setIncludeExtraAccelerometers(e.target.checked)}
                  className="mt-0.5 rounded text-sky-600 focus:ring-sky-500"
                />
                <div className="text-xs">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Industrial Triaxial Accelerometer Pack (1 per machine)</span>
                    <span className="font-mono text-[10px] text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      ₹9,999 / unit
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Stainless steel hermetic IP67 casing with 3-year hot-swap replacement warranty.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/70 transition">
                <input
                  type="checkbox"
                  checked={includeHighTempRTD}
                  onChange={(e) => setIncludeHighTempRTD(e.target.checked)}
                  className="mt-0.5 rounded text-sky-600 focus:ring-sky-500"
                />
                <div className="text-xs">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span>High-Temp PT100 RTD Thermal Probes (Up to 350°C)</span>
                    <span className="font-mono text-[10px] text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      ₹5,999 / unit
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Class A precision platinum element with armored steel braided cabling.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/70 transition">
                <input
                  type="checkbox"
                  checked={includeEdgeGateway}
                  onChange={(e) => setIncludeEdgeGateway(e.target.checked)}
                  className="mt-0.5 rounded text-sky-600 focus:ring-sky-500"
                />
                <div className="text-xs">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Industrial EdgeSync Multi-Channel IoT Hub</span>
                    <span className="font-mono text-[10px] text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      ₹28,999 / hub
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    DIN-rail mounted edge computing hub with 72-hour offline memory buffer and 4G failover.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Sizing Calculations Card */}
          <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">
                Calculated Sizing & ROI Summary (₹ INR)
              </span>

              {(() => {
                const baseMonthly = customMachineCount <= 5 
                  ? 8499 
                  : customMachineCount <= 20 
                  ? 31999 
                  : 31999 + (customMachineCount - 20) * 1499;
                const annualSoftware = baseMonthly * 12;
                const hardwareCost = 
                  (includeExtraAccelerometers ? customMachineCount * 9999 : 0) +
                  (includeHighTempRTD ? customMachineCount * 5999 : 0) +
                  (includeEdgeGateway ? Math.ceil(customMachineCount / 10) * 28999 : 0);
                const estimatedDowntimeSavings = Math.round(customMachineCount * 225000);

                return (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="text-slate-600">Annual Software Subscription</span>
                      <span className="font-mono font-bold text-slate-900">₹{annualSoftware.toLocaleString('en-IN')} / yr</span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="text-slate-600">One-Time Sensor Hardware Investment</span>
                      <span className="font-mono font-bold text-slate-900">₹{hardwareCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-emerald-700 font-semibold">
                      <span>Est. Annual Downtime Loss Prevented</span>
                      <span className="font-mono font-bold">+₹{estimatedDowntimeSavings.toLocaleString('en-IN')} / yr</span>
                    </div>
                    <div className="p-3 bg-emerald-100/70 border border-emerald-300/80 rounded-2xl text-emerald-900 text-xs">
                      <div className="font-bold flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-700" />
                        <span>Estimated Payback: {Math.max(1.1, Math.round(((hardwareCost + annualSoftware) / estimatedDowntimeSavings) * 12 * 10) / 10)} Months</span>
                      </div>
                      <p className="text-[11px] text-emerald-800 mt-1">
                        Based on preventing 2.8 average catastrophic line trips per machine per year in Indian factories.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        const proposal = {
                          proposalTitle: 'MachineMind Sizing & Sensor Package Procurement Proposal (INR)',
                          currency: 'INR (₹)',
                          date: new Date().toISOString(),
                          customerMachinesMonitored: customMachineCount,
                          recommendedTier: customMachineCount <= 5 ? 'Starter Pilot' : customMachineCount <= 25 ? 'Plant Pro' : 'Enterprise Fleet',
                          annualSubscriptionCostINR: annualSoftware,
                          hardwareSensorsInvestmentINR: hardwareCost,
                          estimatedAnnualDowntimeSavingsINR: estimatedDowntimeSavings,
                          includedHardwareWarranty: '3-Year Instant Hot-Swap Replacement Guarantee',
                          sensorHardwareIncluded: {
                            triaxialAccelerometers: includeExtraAccelerometers ? customMachineCount : 0,
                            rtdThermalProbes: includeHighTempRTD ? customMachineCount : 0,
                            edgeGatewayHubs: includeEdgeGateway ? Math.ceil(customMachineCount / 10) : 0,
                          },
                        };
                        const blob = new Blob([JSON.stringify(proposal, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `MachineMind-Custom-Proposal-${customMachineCount}-Machines.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        setToastMessage('📄 Custom proposal JSON exported successfully in INR (₹)!');
                        setTimeout(() => setToastMessage(null), 4000);
                      }}
                      className="w-full mt-3 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 font-bold text-xs text-slate-800 transition shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-slate-500" />
                      <span>Download Proposal (.json)</span>
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs transition-colors">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-900">Frequently Asked Questions</h3>
          <p className="text-xs text-slate-500 mt-1">
            Common questions regarding industrial telemetry, sensor protocols, and plant subscription policies.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200 rounded-2xl overflow-hidden transition"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 bg-slate-50/70 hover:bg-slate-50 transition"
                >
                  <span className="text-xs sm:text-sm font-semibold text-slate-900">
                    {faq.q}
                  </span>
                  <HelpCircle className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-180 ' + themeConfig.textClass : 'text-slate-400'}`} />
                </button>
                {isOpen && (
                  <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100 animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
