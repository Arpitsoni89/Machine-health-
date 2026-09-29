import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  ShieldCheck, 
  HelpCircle, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  Download, 
  Wrench, 
  Clock, 
  Cpu, 
  Flame, 
  Activity, 
  Truck, 
  Sparkles, 
  FileText, 
  ArrowRight, 
  X, 
  MessageSquare, 
  BookOpen, 
  Check, 
  Building2, 
  ShieldAlert, 
  Info, 
  Phone, 
  PhoneCall, 
  Radio, 
  Headphones,
  RotateCw,
  Gauge,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { INITIAL_SENSOR_WARRANTIES } from '../data/mockSensors';
import { SensorWarrantyItem, IndustrialMachine, TechnicianInfo } from '../types';
import { CallTechnicianSection } from './CallTechnicianSection';
import { CallTechnicianModal } from './CallTechnicianModal';
import { PlantFeedbackSection } from './PlantFeedbackSection';
import { MOCK_TECHNICIANS } from '../data/mockTechnicians';
import { downloadSensorCalibrationPdf } from '../utils/pdfCertificateGenerator';
import { Star } from 'lucide-react';

interface HelpAndWarrantyViewProps {
  onOpenGuide: () => void;
  onOpenSubscription?: () => void;
  machines?: IndustrialMachine[];
  onAssignTechnician?: (machineId: string, alertId?: string, technician?: TechnicianInfo) => void;
}

interface AssistantMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  timestamp: string;
  actionLinks?: { label: string; action: () => void }[];
}

const FAQ_KNOWLEDGE_BASE: Record<string, string> = {
  warranty: `**MachineMind Industrial Sensor Hardware Warranty Overview:**
• **Starter Pilot**: Includes 1-Year standard hardware replacement warranty covering piezoelectric crystal degradation, thermal RTD drift, and daily automated edge self-tests.
• **Plant Pro**: Includes 3-Year extended hardware warranty with **Instant Overnight Hot-Swap Dispatch**. Covers IP67 coolant/oil immersion, thermal shock up to 350°C, and severe mechanical vibration fatigue (<50g shock).
• **Enterprise Fleet**: Includes **Up to 3-Year Warranty with up to 10 Sensor Replacements** and **Free Hardware Updates** while your plan is active, plus annual on-site ISO 17025 precision recalibration.

*Need to file a claim?* Use the Sensor Warranty Lookup tab to find your sensor's serial ID and click **Claim Warranty Replacement** to generate an instant RMA slip.`,

  claim: `**How to Claim a Replacement Sensor (RMA Procedure):**
1. Navigate to the **Sensor Hardware Warranty** tab.
2. Select your sensor from the list or type its serial number (e.g., SENS-ACC-9021).
3. Click the **Claim Warranty Replacement (RMA)** button.
4. Select the failure symptom (Thermal drift, cable fatigue, or physical shock).
5. A prepaid overnight hot-swap shipment will be queued with tracking details and an RMA authorization slip.
6. The damaged sensor can be placed into the provided return mailer with zero freight cost.`,

  mounting: `**Triaxial Accelerometer Mounting & Installation Standard (ISO 13373):**
1. **Location**: Mount the sensor as close to the load zone of the bearing housing as possible, directly on solid structural metal.
2. **Surface Prep**: Clean the mounting spot down to bare metal (flatness within 0.025 mm, surface finish Ra < 1.6 μm).
3. **Attachment**: Use 1/4-28 or M6 threaded studs with a torque wrench set to **3.5–4.0 Nm**.
4. **Coupling**: Apply a thin layer of high-temperature silicone grease or mounting wax to optimize acoustic transfer above 5 kHz.
5. **Cabling**: Secure the braided cable within 75 mm of the sensor to prevent cable strain noise.`,

  iso: `**ISO 10816-3 Vibration Severity Guidelines (mm/s RMS):**
• **Zone A (<1.8 mm/s)**: Brand new or recently overhauled machines. Perfect balance and alignment.
• **Zone B (1.8 – 4.5 mm/s)**: Safe for long-term continuous operation without restriction.
• **Zone C (4.5 – 7.1 mm/s)**: Unsatisfactory. Permissible for limited period until planned maintenance shutdown. Check harmonic vibration for bearing raceway defects.
• **Zone D (>7.1 mm/s)**: Critical danger of machine damage. Immediate trip or load reduction required to prevent spindle seizure.`,

  cavitation: `**Resolving Hydraulic Pump Cavitation Warnings:**
1. **Verify Inlet Pressure**: Ensure suction head pressure is at least 0.5 bar above fluid vapor pressure.
2. **Inspect Suction Strainer**: Check for partial blockage or sludge accumulation causing net positive suction head (NPSH) deficiency.
3. **Fluid Temperature**: Check if hydraulic oil temperature exceeds 65°C, reducing viscosity and vaporizing dissolved air.
4. **Bypass Circuit**: If vibration exceeds 6.0 mm/s, engage the automated bypass circuit and check for aeration bubbles in the sight glass.`,

  sampling: `**Sub-Second Edge Telemetry & Offline Buffering:**
• The MachineMind Edge Gateway samples accelerometers at 10 kHz and streams processed RMS and peak FFT metrics at 10 Hz over encrypted WebSocket.
• In the event of plant Wi-Fi or Ethernet interruption, the local edge hub buffers up to **72 hours of full-fidelity telemetry** on local solid-state flash memory.
• Once connectivity is restored, buffered telemetry automatically re-synchronizes with the cloud platform without losing a single micro-second of anomaly history.`,
};

export const HelpAndWarrantyView: React.FC<HelpAndWarrantyViewProps> = ({
  onOpenGuide,
  onOpenSubscription,
  machines = [],
  onAssignTechnician,
}) => {
  const { themeConfig } = useTheme();

  const [activeTab, setActiveTab] = useState<'warranty' | 'technician' | 'assistant' | 'feedback'>('warranty');
  const [sensors, setSensors] = useState<SensorWarrantyItem[]>(INITIAL_SENSOR_WARRANTIES);
  const [selectedSensorId, setSelectedSensorId] = useState<string>(INITIAL_SENSOR_WARRANTIES[0].id);
  const [searchSensorQuery, setSearchSensorQuery] = useState('');
  const [callingTech, setCallingTech] = useState<TechnicianInfo | null>(null);
  
  // Claim modal state
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimReason, setClaimReason] = useState('Signal cable wear or fatigue');
  const [claimNotes, setClaimNotes] = useState('');
  const [claimToast, setClaimToast] = useState<string | null>(null);

  // Calibration State
  const [calibratingSensor, setCalibratingSensor] = useState<SensorWarrantyItem | null>(null);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [calibrationStep, setCalibrationStep] = useState('');

  // Assistant Chat State
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: `👋 **Welcome to MachineMind Industrial Support & Reliability Assistant!**

I am your 24/7 technical copilot for factory maintenance, sensor warranty claims, and ISO condition monitoring.

**What would you like assistance with today?**
• Check warranty terms or request a hot-swap replacement sensor
• Review ISO 10816-3 vibration limits & severity standards
• Sensor mounting torque & placement guidelines
• Troubleshooting active anomaly alarms (bearing, thermal, cavitation)`,
      timestamp: 'Just now',
    },
  ]);

  const selectedSensor = sensors.find((s) => s.id === selectedSensorId) || sensors[0];

  const filteredSensors = sensors.filter((s) => {
    if (!searchSensorQuery.trim()) return true;
    const q = searchSensorQuery.toLowerCase();
    return (
      s.serialNumber.toLowerCase().includes(q) ||
      s.model.toLowerCase().includes(q) ||
      s.machineName.toLowerCase().includes(q) ||
      s.type.toLowerCase().includes(q)
    );
  });

  const handleAskQuestion = (questionText: string) => {
    if (!questionText.trim()) return;

    const userMsg: AssistantMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: questionText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');

    // Formulate response
    const qLower = questionText.toLowerCase();
    let replyText = '';

    if (qLower.includes('call') || qLower.includes('technician') || qLower.includes('phone') || qLower.includes('speak') || qLower.includes('mechanic')) {
      replyText = `**Direct Certified Technician Calling & Dispatch Available:**
You can call our on-duty reliability specialists immediately:
• **Vikram "Vik" Rathore** (#TECH-IND-4091): Vibration & Mechanical Lead (Phone: +91 98201 44102 · UHF Ch 4)
• **Pooja Sharma** (#TECH-IND-3208): Electrical Drives & VFD Specialist (Phone: +91 97110 33819 · UHF Ch 2)
• **Arjun Deshmukh** (#TECH-IND-5114): Fluid Power & Hydraulics (Phone: +91 94520 88231 · UHF Ch 6)

👉 Switch to the **"Call a Technician"** tab above to launch an instant encrypted voice call or dispatch a specialist directly to any machine bay!`;
    } else if (qLower.includes('warranty') || qLower.includes('guarantee') || qLower.includes('coverage') || qLower.includes('3-year') || qLower.includes('lifetime')) {
      replyText = FAQ_KNOWLEDGE_BASE.warranty;
    } else if (qLower.includes('claim') || qLower.includes('replace') || qLower.includes('broken') || qLower.includes('rma') || qLower.includes('hot-swap')) {
      replyText = FAQ_KNOWLEDGE_BASE.claim;
    } else if (qLower.includes('mount') || qLower.includes('install') || qLower.includes('torque') || qLower.includes('accelerometer') || qLower.includes('stud')) {
      replyText = FAQ_KNOWLEDGE_BASE.mounting;
    } else if (qLower.includes('iso') || qLower.includes('10816') || qLower.includes('severity') || qLower.includes('velocity') || qLower.includes('threshold') || qLower.includes('limit')) {
      replyText = FAQ_KNOWLEDGE_BASE.iso;
    } else if (qLower.includes('cavitation') || qLower.includes('pump') || qLower.includes('hydraulic') || qLower.includes('impeller')) {
      replyText = FAQ_KNOWLEDGE_BASE.cavitation;
    } else if (qLower.includes('sampling') || qLower.includes('offline') || qLower.includes('internet') || qLower.includes('buffer') || qLower.includes('edge')) {
      replyText = FAQ_KNOWLEDGE_BASE.sampling;
    } else {
      replyText = `**Technical Diagnostic Summary:**
Regarding your inquiry: *"I understand you are evaluating machine conditions or sensor parameters."*

**Recommended Plant Action Protocol:**
1. **Verify Baseline**: Confirm whether telemetry is running in Zone A/B (<4.5 mm/s RMS) under standard motor load.
2. **Sensor Inspection**: Check accelerometer mounting torque (4.0 Nm) and verify lead wire shield continuity.
3. **Warranty Replacement**: If sensor reading shows abnormal clipping or non-physical harmonic spikes, file an **Advance Replacement Claim** via the Warranty tab.
4. **Maintenance Guidance**: Cross-reference the machine's 24-hour FFT spectrum against bearing ball pass frequency (BPFO/BPFI).

For specific guidelines, you can also ask: *"What does the 3-Year Sensor Warranty cover?"* or *"How to mount accelerometers?"*`;
    }

    setTimeout(() => {
      const assistantMsg: AssistantMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    }, 400);
  };

  const handleDispatchClaim = () => {
    const rmaCode = `RMA-${new Date().getFullYear()}-SENS-${Math.floor(1000 + Math.random() * 9000)}`;

    setSensors((prev) =>
      prev.map((s) =>
        s.id === selectedSensor.id
          ? {
              ...s,
              replacementCount: s.replacementCount + 1,
              status: 'active',
            }
          : s
      )
    );

    setIsClaimModalOpen(false);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });

    setClaimToast(`🚀 Advance Replacement RMA (${rmaCode}) approved! Courier dispatched to ${selectedSensor.machineName} bay with priority tracking.`);
    setTimeout(() => setClaimToast(null), 8000);
  };

  const handleDownloadCalibrationCert = () => {
    downloadSensorCalibrationPdf(selectedSensor);

    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.6 },
      colors: [themeConfig.dotColor, '#38bdf8', '#34d399', '#f59e0b'],
    });

    setClaimToast(`📄 ISO 17025 Calibration Certificate (.pdf) for ${selectedSensor.serialNumber} downloaded successfully!`);
    setTimeout(() => setClaimToast(null), 5000);
  };

  const handleStartCalibration = (sensor: SensorWarrantyItem) => {
    setCalibratingSensor(sensor);
    setIsCalibrating(true);
    setCalibrationProgress(15);
    setCalibrationStep('Pinging transducer crystal & zeroing 0g baseline...');

    setTimeout(() => {
      setCalibrationProgress(45);
      setCalibrationStep('Sweeping reference frequency response from 0.5 Hz to 12.5 kHz (159.2 Hz primary)...');
    }, 600);

    setTimeout(() => {
      setCalibrationProgress(75);
      setCalibrationStep('Verifying NIST SRM reference standards, temperature drift & phase linearity...');
    }, 1200);

    setTimeout(() => {
      setCalibrationProgress(100);
      setCalibrationStep('ISO/IEC 17025 Calibration verified with zero error offset!');
    }, 1800);

    setTimeout(() => {
      const nowFormatted = new Date().toISOString().slice(0, 10);
      const nextDueYear = new Date().getFullYear() + 1;
      const nextDueFormatted = `${nextDueYear}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${new Date().getDate().toString().padStart(2, '0')}`;

      setSensors((prev) =>
        prev.map((s) =>
          s.id === sensor.id
            ? {
                ...s,
                status: 'active',
                lastCalibrated: `${nowFormatted} (Just now)`,
                nextCalibrationDue: nextDueFormatted,
              }
            : s
        )
      );

      setIsCalibrating(false);
      setCalibratingSensor(null);

      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
        colors: [themeConfig.dotColor, '#10b981', '#38bdf8', '#fbbf24'],
      });

      setClaimToast(`✅ Precision recalibration complete for ${sensor.serialNumber} (${sensor.model})! Calibration is now Active and ISO 17025 accredited through ${nextDueFormatted}.`);
      setTimeout(() => setClaimToast(null), 7000);
    }, 2400);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {claimToast && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-md bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 animate-in slide-in-from-top-4 duration-200 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs leading-relaxed">{claimToast}</div>
          <button 
            onClick={() => setClaimToast(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="max-w-2xl">
            <div className={`text-xs font-semibold mb-1 ${themeConfig.textClass}`}>
              Industrial Reliability & Hardware Protection
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Sensor Warranty Center & AI Support Assistant
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              Inspect active hardware warranties for vibration and thermal sensors, request overnight hot-swap replacements, and get instant technical troubleshooting from our reliability copilot.
            </p>
          </div>

          {/* Section Switcher Tabs */}
          <div className="w-full sm:w-auto grid grid-cols-2 sm:flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shrink-0">
            <button
              onClick={() => setActiveTab('warranty')}
              className={`min-h-[38px] px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                activeTab === 'warranty'
                  ? `bg-white ${themeConfig.textClass} shadow-xs`
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="truncate">Warranty</span>
            </button>
            <button
              onClick={() => setActiveTab('technician')}
              className={`min-h-[38px] px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                activeTab === 'technician'
                  ? `bg-white text-emerald-700 shadow-xs ring-1 ring-emerald-300`
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PhoneCall className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span className="truncate">Call Tech</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 hidden sm:inline-block" />
            </button>
            <button
              onClick={() => setActiveTab('assistant')}
              className={`min-h-[38px] px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                activeTab === 'assistant'
                  ? `bg-white ${themeConfig.textClass} shadow-xs`
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="truncate">Assistant</span>
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`min-h-[38px] px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                activeTab === 'feedback'
                  ? `bg-white text-amber-700 shadow-xs ring-1 ring-amber-300`
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              <span className="truncate">Feedback</span>
              <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded-full hidden md:inline-block">
                CSAT 4.9
              </span>
            </button>
          </div>
        </div>

        {/* 3 Warranty Tiers Overview Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-sky-100 text-sky-700 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Standard 1-Year (Starter)</div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Full crystal replacement for signal drift + automated daily edge self-test ping.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-900">3-Year Hot-Swap (Plant Pro)</div>
              <p className="text-[11px] text-amber-800/80 mt-0.5">
                Overnight courier dispatch for damaged probes, IP67 ingress & thermal shock protection.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-900">Up to 3-Year / 10 Replacements (Enterprise)</div>
              <p className="text-[11px] text-emerald-800/80 mt-0.5">
                Up to 10 sensor replacements & free hardware updates while plan is active + annual ISO 17025 calibration.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Official Hardware Warranty Terms & Conditions Banner */}
      <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-2xs">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-950 leading-relaxed">
          <span className="font-bold text-amber-900 block text-sm mb-0.5">Official Sensor Hardware Warranty Terms &amp; Conditions:</span>
          <span>
            All MachineMind vibration, acoustic, and thermal sensors are hermetically factory-calibrated. <strong className="text-amber-900 font-bold">If any sensor is repaired or tampered with by an unauthorized third party, the warranty is void and the sensor is not replaceable by the company.</strong> To ensure unbroken compliance and ISO 17025 certification, always request advance replacement through the portal or contact our certified reliability engineering desk.
          </span>
        </div>
      </div>

      {/* Main Content Area based on Active Tab */}
      {activeTab === 'warranty' ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-6">
          {/* Left Column (5 Cols on PC/Tablet, 1 Col on Mobile): Sensor Inventory & Search */}
          <div className="md:col-span-5 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Installed Plant Sensors</h3>
                <p className="text-xs text-slate-500">Pick any transducer to inspect warranty</p>
              </div>
              <span className="text-[11px] font-mono font-semibold bg-slate-100 px-2 py-0.5 rounded-md text-slate-600">
                {filteredSensors.length} Monitored
              </span>
            </div>

            {/* Quick Search Sensor Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search serial (e.g. SENS-ACC-9021)..."
                value={searchSensorQuery}
                onChange={(e) => setSearchSensorQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-sky-500"
              />
            </div>

            {/* Sensor List */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredSensors.map((sensor) => {
                const isSelected = sensor.id === selectedSensor.id;
                return (
                  <div
                    key={sensor.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedSensorId(sensor.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedSensorId(sensor.id);
                      }
                    }}
                    className={`w-full p-3 rounded-2xl border text-left transition flex items-start justify-between cursor-pointer ${
                      isSelected
                        ? `${themeConfig.bgLightClass} ${themeConfig.borderClass} shadow-2xs`
                        : 'bg-white border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <span className={`font-bold ${isSelected ? themeConfig.textClass : 'text-slate-900'}`}>
                          {sensor.serialNumber}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-500 text-[10px]">{sensor.type}</span>
                      </div>
                      <div className="text-xs font-semibold text-slate-800 mt-1 line-clamp-1">
                        {sensor.model}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span>{sensor.machineName}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 space-y-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full block ${
                        sensor.status === 'active' 
                           ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {sensor.status === 'active' ? 'Active & Covered' : 'Calibration Due'}
                      </span>
                      {sensor.status === 'calibration_due' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartCalibration(sensor);
                          }}
                          className="px-2 py-0.5 rounded-md bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ml-auto shadow-xs"
                        >
                          <RotateCw className="w-2.5 h-2.5" />
                          <span>Calibrate</span>
                        </button>
                      )}
                      <div className="text-[10px] text-slate-400 font-mono">
                        Exp: {sensor.warrantyExpiryDate}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column (7 Cols on PC/Tablet, 1 Col on Mobile): Selected Sensor Warranty Details & Actions */}
          <div className="md:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded-lg border border-slate-200">
                    {selectedSensor.serialNumber}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {selectedSensor.warrantyTier}
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                  {selectedSensor.model}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mounted on: <strong className="text-slate-700">{selectedSensor.machineName}</strong> ({selectedSensor.machineId})
                </p>
              </div>

              {/* Warranty & Calibration Status Pill */}
              <div className="flex items-center gap-2">
                {selectedSensor.status === 'calibration_due' ? (
                  <div className="p-3 rounded-2xl bg-amber-50 border-2 border-amber-300 text-center min-w-[140px]">
                    <div className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">
                      Calibration Status
                    </div>
                    <div className="text-xs font-extrabold text-amber-700 mt-0.5 flex items-center justify-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Recalibration Due</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center min-w-[130px]">
                    <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                      Warranty Status
                    </div>
                    <div className="text-sm font-extrabold text-emerald-700 mt-0.5">
                      Covered 100%
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Calibration Due Notification Banner */}
            {selectedSensor.status === 'calibration_due' && (
              <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300/80 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-150">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-200 text-amber-900 shrink-0 mt-0.5">
                    <AlertTriangle className="w-5 h-5 text-amber-800" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <span>Annual Precision Recalibration Due</span>
                      <span className="px-1.5 py-0.2 bg-amber-200 text-amber-900 text-[10px] rounded font-mono">
                        Expired: {selectedSensor.nextCalibrationDue}
                      </span>
                    </div>
                    <div className="text-[11px] text-amber-800/90 mt-0.5 leading-relaxed">
                      Transducer requires NIST/NABL zero-offset compensation to ensure vibration FFT diagnosis remains 100% accurate.
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleStartCalibration(selectedSensor)}
                  className="px-4 py-2.5 rounded-xl text-xs font-extrabold bg-amber-600 hover:bg-amber-500 text-white shadow-md transition flex items-center justify-center gap-2 shrink-0 cursor-pointer animate-pulse w-full sm:w-auto"
                >
                  <RotateCw className="w-4 h-4" />
                  <span>Calibrate Sensor Now</span>
                </button>
              </div>
            )}

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Installed</span>
                <span className="text-xs font-bold text-slate-800 font-mono mt-0.5 block">{selectedSensor.installationDate}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Warranty Expiry</span>
                <span className="text-xs font-bold text-slate-800 font-mono mt-0.5 block">{selectedSensor.warrantyExpiryDate}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Last Calibrated</span>
                <span className="text-xs font-bold text-slate-800 font-mono mt-0.5 block">{selectedSensor.lastCalibrated}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Replacements Used</span>
                <span className="text-xs font-bold text-slate-800 font-mono mt-0.5 block">
                  {selectedSensor.replacementCount} of {selectedSensor.warrantyTier.includes('Enterprise') ? '10 Replacements' : '3 Replacements'}
                </span>
              </div>
            </div>

            {/* Coverage Terms Checklist */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Guaranteed Hardware Protection Scope</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedSensor.coverageTerms.map((term, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-700">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{term}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions: Calibrate Sensor, Claim Replacement & Download Calibration Certificate */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-slate-900">
                  Sensor Service & Calibration
                </div>
                <div className="text-[11px] text-slate-500">
                  Perform digital recalibration or request advance replacement.
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto justify-end">
                {/* Calibration Button */}
                <button
                  onClick={() => handleStartCalibration(selectedSensor)}
                  className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-98 ${
                    selectedSensor.status === 'calibration_due'
                      ? 'bg-amber-600 hover:bg-amber-500 text-white animate-pulse'
                      : 'bg-white hover:bg-slate-100 border border-slate-300 text-slate-700'
                  }`}
                  title={selectedSensor.status === 'calibration_due' ? 'Calibrate sensor immediately' : 'Run ISO 17025 precision recalibration test'}
                >
                  <RotateCw className={`w-3.5 h-3.5 ${selectedSensor.status === 'calibration_due' ? 'text-white' : 'text-slate-500'}`} />
                  <span>{selectedSensor.status === 'calibration_due' ? 'Calibrate Sensor (Due)' : 'Recalibrate'}</span>
                </button>

                <button
                  onClick={handleDownloadCalibrationCert}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 transition shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                  title="Download Official ISO 17025 Calibration Certificate as PDF"
                >
                  <FileText className="w-3.5 h-3.5 text-sky-600" />
                  <span>Calibration Cert (PDF)</span>
                </button>

                <button
                  onClick={() => setIsClaimModalOpen(true)}
                  className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold ${themeConfig.primaryClass} ${themeConfig.primaryHoverClass} text-white shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-98`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Claim Warranty (RMA)</span>
                </button>
              </div>

              {/* Feedback Prompt Strip inside Warranty Tab */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-slate-50/70 p-3.5 rounded-2xl">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500 shrink-0" />
                  <span className="text-slate-700 font-medium">
                    Have feedback on our sensor accuracy, replacement speed, or support?
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('feedback')}
                  className={`px-3 py-1.5 rounded-xl font-bold ${themeConfig.textClass} hover:bg-white transition flex items-center gap-1 cursor-pointer shrink-0 border border-slate-200 bg-white shadow-2xs`}
                >
                  <span>Plant Feedback & Reviews</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'technician' ? (
        <CallTechnicianSection
          machines={machines}
          onDispatchToBay={(tech, bayNotes) => {
            if (onAssignTechnician && machines.length > 0) {
              onAssignTechnician(machines[0].id, undefined, tech);
            }
          }}
        />
      ) : activeTab === 'assistant' ? (
        /* Help Assistant Chat & FAQ View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Quick Troubleshooting FAQs */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-sky-600" />
                <span>Quick Diagnostic Topics</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Click any topic to ask the assistant</p>
            </div>

            <div className="space-y-1.5">
              {[
                { title: '📞 How to call on-duty plant technician', q: 'How do I call a certified plant technician right now?' },
                { title: 'What is covered under the 3-Year Sensor Warranty?', q: 'What is covered under the 3-Year Sensor Warranty?' },
                { title: 'How do I claim a replacement for a broken sensor?', q: 'How do I claim a replacement sensor via RMA?' },
                { title: 'Vibration sensor mounting & torque specs', q: 'What is the correct mounting torque for vibration accelerometers?' },
                { title: 'ISO 10816-3 severity vibration thresholds', q: 'What are the ISO 10816-3 vibration severity limits?' },
                { title: 'Resolving pump cavitation & impeller alarms', q: 'How do I resolve a cavitation warning on hydraulic pumps?' },
                { title: 'Edge telemetry sampling & offline buffering', q: 'How does edge sampling work during internet downtime?' },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAskQuestion(item.q)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200/80 hover:border-sky-200 transition text-left text-xs font-semibold text-slate-800 hover:text-sky-900 flex items-center justify-between cursor-pointer group"
                >
                  <span>{item.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition" />
                </button>
              ))}
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900">
              <div className="font-bold flex items-center gap-1.5 mb-1">
                <Wrench className="w-3.5 h-3.5 text-amber-700" />
                <span>On-Call Vibration Engineering</span>
              </div>
              <p className="text-[11px] text-amber-800/85 leading-relaxed">
                Need urgent on-site bearing analysis? Pro & Enterprise plant accounts include emergency technician dispatch within 2 hours.
              </p>
              <button
                onClick={() => setActiveTab('technician')}
                className="mt-2.5 w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Plant Floor Technician</span>
              </button>
            </div>
          </div>

          {/* Interactive Chat Console */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl shadow-xs flex flex-col h-[580px] overflow-hidden">
            {/* Assistant Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl ${themeConfig.primaryClass} flex items-center justify-center text-white shadow-2xs`}>
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>MachineMind Industrial Copilot</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <span className="text-[10px] text-slate-500">ISO 10816 & 13374 Condition Monitoring Knowledge Base</span>
                </div>
              </div>

              <button
                onClick={() => setMessages([messages[0]])}
                className="text-[11px] font-semibold text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                Clear History
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {messages.map((msg) => {
                const isAssistant = msg.sender === 'assistant';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isAssistant ? '' : 'flex-row-reverse'}`}
                  >
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 ${
                      isAssistant 
                        ? `${themeConfig.bgLightClass} ${themeConfig.textClass} font-bold` 
                        : 'bg-slate-900 text-white font-bold'
                    }`}>
                      {isAssistant ? 'AI' : 'You'}
                    </div>

                    <div className={`p-4 rounded-3xl max-w-xl text-xs leading-relaxed ${
                      isAssistant
                        ? 'bg-slate-50 border border-slate-200/90 text-slate-800'
                        : `${themeConfig.primaryClass} text-white shadow-xs`
                    }`}>
                      <div className="whitespace-pre-wrap font-sans">
                        {msg.text}
                      </div>
                      <div className={`text-[10px] mt-2 font-mono ${isAssistant ? 'text-slate-400' : 'text-white/80'}`}>
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskQuestion(inputQuery);
              }}
              className="p-3 border-t border-slate-100 flex items-center gap-2 bg-white"
            >
              <input
                type="text"
                placeholder="Ask about vibration limits, bearing damage, sensor torque, or warranty terms..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-sky-500 focus:bg-white"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim()}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer ${
                  inputQuery.trim()
                    ? `${themeConfig.primaryClass} hover:opacity-90`
                    : 'bg-slate-300 cursor-not-allowed'
                }`}
              >
                <span>Ask</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Plant Feedback & Community Reviews Section */
        <PlantFeedbackSection />
      )}

      {/* Claim RMA Modal */}
      {isClaimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-sky-100 text-sky-800">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Advance Warranty Replacement (RMA)</h3>
                  <p className="text-[11px] text-slate-500">Overnight Hot-Swap Dispatch Guarantee</p>
                </div>
              </div>
              <button
                onClick={() => setIsClaimModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
              <div className="font-mono font-bold text-slate-900">{selectedSensor.serialNumber}</div>
              <div className="text-slate-600 mt-0.5">{selectedSensor.model}</div>
              <div className="text-slate-500 text-[11px] mt-1">Installed on: <strong>{selectedSensor.machineName}</strong></div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Failure or Anomaly Reason
              </label>
              <select
                value={claimReason}
                onChange={(e) => setClaimReason(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-sky-500"
              >
                <option value="Signal cable wear or fatigue">Signal cable wear or connector fatigue</option>
                <option value="Thermal drift beyond calibration limits">Thermal drift beyond calibration limits</option>
                <option value="High physical vibration shock damage">High physical vibration shock / casing damage</option>
                <option value="IP67 coolant or moisture ingress">IP67 coolant or moisture ingress</option>
                <option value="Non-physical harmonic frequency noise">Non-physical harmonic frequency noise / clipping</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Delivery Facility & Bay Address
              </label>
              <input
                type="text"
                defaultValue="Alwar Facility Alpha · Maintenance Bay 2 (Extrusion Line)"
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-hidden"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsClaimModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDispatchClaim}
                className={`px-4 py-2 rounded-xl text-xs font-bold ${themeConfig.primaryClass} ${themeConfig.primaryHoverClass} text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Confirm & Dispatch Overnight</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Precision Calibration Execution Modal */}
      {calibratingSensor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <RotateCw className="w-6 h-6 animate-spin" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    ISO/IEC 17025 Metrology Ping
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Calibrating {calibratingSensor.serialNumber}
                </h3>
              </div>
            </div>

            {/* Animated Oscilloscope / Calibration Pulse Visualizer */}
            <div className="p-4 rounded-2xl bg-slate-950 text-white space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Ref Frequency: 159.2 Hz</span>
                <span className="text-emerald-400 font-bold">10.0 m/s² Peak</span>
              </div>

              <div className="h-20 flex items-end justify-between gap-1 px-1 bg-slate-900/90 rounded-xl overflow-hidden p-2">
                {[30, 55, 75, 95, 80, 50, 20, 45, 85, 100, 85, 45, 20, 50, 80, 95, 75, 55, 30, 15].map((val, idx) => (
                  <div
                    key={idx}
                    className="w-full bg-amber-400 rounded-t-sm transition-all duration-200"
                    style={{ height: `${Math.max(12, Math.round((val * (calibrationProgress / 100))))}%` }}
                  />
                ))}
              </div>

              <div className="text-[11px] font-mono text-slate-300 flex items-center justify-between">
                <span>Sensitivity: 100.2 mV/g (±0.2%)</span>
                <span className="text-amber-400">Phase Error: 0.04°</span>
              </div>
            </div>

            {/* Progress Bar & Status Text */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 truncate max-w-[320px]">{calibrationStep}</span>
                <span className="font-mono font-bold text-amber-600">{calibrationProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-300"
                  style={{ width: `${calibrationProgress}%` }}
                />
              </div>
            </div>

            <div className="text-[11px] text-slate-500 text-center">
              Please keep plant machine running at steady RPM during calibration ping.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
