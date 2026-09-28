import React, { createContext, useContext, useState, useEffect } from 'react';
import { PlanTier, SubscriptionPlan, BillingCycle } from '../types';
import confetti from 'canvas-confetti';

export interface PlanFeatures {
  maxMachines: number | 'Unlimited';
  samplingRateMs: number;
  samplingRateLabel: string;
  hasSubSecondStreaming: boolean;
  hasMultiPlant: boolean;
  hasSapOracleSync: boolean;
  hasScadaEmergencyTrip: boolean;
  hasDedicatedEngineerHotline: boolean;
  hasIsoRecalibrationCertificate: boolean;
  hasPhysicsNeuralNetModel: boolean;
  hasPredictiveRul: boolean;
  hasWhatsappSmsDispatch: boolean;
  hasHotSwapWarranty: boolean;
  hasOrbitLissajous: boolean;
  hasAudioFrequencyStethoscope: boolean;
  hasStandardAlerts: boolean;
  historyRetentionDays: number;
  slaSupportLevel: string;
  warrantyBadge: string;
}

export interface PlanChangeNotice {
  planName: string;
  planTier: PlanTier;
  timestamp: string;
  details: string;
}

export interface PlantFacilityInfo {
  id: string;
  name: string;
  location: string;
  state: string;
  country: string;
  activeLines: number;
  totalMachines: number;
  primaryIndustry: string;
  scadaNode: string;
  manager: string;
}

export const PLANT_FACILITIES: PlantFacilityInfo[] = [
  {
    id: 'facility-alwar',
    name: 'Plant Alpha · Alwar Manufacturing Hub',
    location: 'RIICO Industrial Area, Alwar',
    state: 'Rajasthan',
    country: 'India',
    activeLines: 4,
    totalMachines: 18,
    primaryIndustry: 'Automotive & Metal Stamping',
    scadaNode: 'OPC-UA://10.14.0.12:4840',
    manager: 'Harshit Sharma (Plant Director)',
  },
  {
    id: 'facility-sanand',
    name: 'Plant Beta · Sanand EV Mega-Plant',
    location: 'GIDC Industrial Estate, Sanand',
    state: 'Gujarat',
    country: 'India',
    activeLines: 6,
    totalMachines: 32,
    primaryIndustry: 'EV Powertrain & Battery Automation',
    scadaNode: 'OPC-UA://10.22.4.88:4840',
    manager: 'Ananya Deshmukh (VP Reliability)',
  },
  {
    id: 'facility-pune',
    name: 'Plant Gamma · Pune Heavy Machinery Bay',
    location: 'Chakan MIDC Phase 2, Pune',
    state: 'Maharashtra',
    country: 'India',
    activeLines: 5,
    totalMachines: 24,
    primaryIndustry: 'Heavy Extrusion & Steam Turbines',
    scadaNode: 'OPC-UA://10.38.1.10:4840',
    manager: 'Vikramaditya Rao (Chief Mechanical Eng)',
  },
];

export interface SapSyncRecord {
  orderId: string;
  sapNotificationId: string;
  machineTag: string;
  status: 'synced' | 'pending' | 'in_execution';
  costCenter: string;
  priority: 'Very High' | 'High' | 'Medium';
  assignedWorkCenter: string;
  timestamp: string;
}

interface PlanContextType {
  planTier: PlanTier;
  planName: string;
  setPlanTier: (tier: PlanTier) => void;
  planChangeNotice: PlanChangeNotice | null;
  dismissPlanNotice: () => void;
  features: PlanFeatures;
  activeFacility: PlantFacilityInfo;
  setActiveFacilityById: (facilityId: string) => void;
  scadaInterlockState: 'ARMED_NORMAL' | 'SAFETY_TRIPPED' | 'BYPASS_MAINTENANCE' | 'TEST_PULSE';
  setScadaInterlockState: (state: 'ARMED_NORMAL' | 'SAFETY_TRIPPED' | 'BYPASS_MAINTENANCE' | 'TEST_PULSE') => void;
  tripScadaEmergencyInterlock: (machineTag: string) => void;
  resetScadaInterlock: () => void;
  sapSyncRecords: SapSyncRecord[];
  isSapSyncing: boolean;
  triggerSapSync: (machineTag: string, alertMessage: string) => void;
  isEngineerHotlineOpen: boolean;
  openEngineerHotline: () => void;
  closeEngineerHotline: () => void;
  isIsoCertModalOpen: boolean;
  openIsoCertModal: () => void;
  closeIsoCertModal: () => void;
  isScadaModalOpen: boolean;
  openScadaModal: () => void;
  closeScadaModal: () => void;
  isSapModalOpen: boolean;
  openSapModal: () => void;
  closeSapModal: () => void;
}

const STORAGE_PLAN_KEY = 'machinemind_active_plan_tier';
const STORAGE_FACILITY_KEY = 'machinemind_active_facility_id';

const PLAN_NAMES: Record<PlanTier, string> = {
  pilot: 'Starter Pilot',
  pro: 'Plant Pro',
  enterprise: 'Enterprise Fleet',
};

const PLAN_SUMMARIES: Record<PlanTier, string> = {
  pilot: '5 Machine Quota · 10-Second Telemetry · Standard Email Alerts',
  pro: '20 Machine Quota · 1-Sec Continuous Live FFT · ISO 17025 Calibration Certs · SCADA Safety Interlock · Predictive RUL · WhatsApp & SMS Dispatch',
  enterprise: 'Up to 30 Machines · Sub-Second 100 Hz Stream · Multi-Plant Sync · SAP PM ERP Integration · 24/7 AI Engineer',
};

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export const PlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [planTier, setPlanTierState] = useState<PlanTier>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PLAN_KEY);
      if (saved === 'pilot' || saved === 'pro' || saved === 'enterprise') {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'pro'; // Default to Plant Pro
  });

  const [planChangeNotice, setPlanChangeNotice] = useState<PlanChangeNotice | null>(null);

  const [activeFacilityId, setActiveFacilityId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_FACILITY_KEY);
      if (saved && PLANT_FACILITIES.some((f) => f.id === saved)) {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'facility-alwar';
  });

  const [scadaInterlockState, setScadaInterlockState] = useState<'ARMED_NORMAL' | 'SAFETY_TRIPPED' | 'BYPASS_MAINTENANCE' | 'TEST_PULSE'>('ARMED_NORMAL');
  const [isSapSyncing, setIsSapSyncing] = useState(false);
  const [sapSyncRecords, setSapSyncRecords] = useState<SapSyncRecord[]>([
    {
      orderId: 'WO-SAP-2026-9901',
      sapNotificationId: 'SAP-PM-NOTIF-409182',
      machineTag: 'MOT-IND-04',
      status: 'synced',
      costCenter: 'CC-ALWAR-MTR-02',
      priority: 'Very High',
      assignedWorkCenter: 'MECH_MAINT_BAY_1',
      timestamp: 'Today, 08:30 AM',
    },
    {
      orderId: 'WO-SAP-2026-9874',
      sapNotificationId: 'SAP-PM-NOTIF-408920',
      machineTag: 'PMP-HYD-02',
      status: 'synced',
      costCenter: 'CC-ALWAR-HYD-01',
      priority: 'Very High',
      assignedWorkCenter: 'HYD_SPECIALIST_TEAM',
      timestamp: 'Yesterday, 04:15 PM',
    },
  ]);

  // Modals for Unlocked Features
  const [isEngineerHotlineOpen, setIsEngineerHotlineOpen] = useState(false);
  const [isIsoCertModalOpen, setIsIsoCertModalOpen] = useState(false);
  const [isScadaModalOpen, setIsScadaModalOpen] = useState(false);
  const [isSapModalOpen, setIsSapModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PLAN_KEY, planTier);
    } catch {
      // ignore
    }
  }, [planTier]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_FACILITY_KEY, activeFacilityId);
    } catch {
      // ignore
    }
  }, [activeFacilityId]);

  const setPlanTier = (newTier: PlanTier) => {
    setPlanTierState(newTier);
    setPlanChangeNotice({
      planName: PLAN_NAMES[newTier],
      planTier: newTier,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      details: PLAN_SUMMARIES[newTier],
    });

    confetti({
      particleCount: 65,
      spread: 70,
      origin: { y: 0.2 },
      colors: ['#38bdf8', '#10b981', '#f59e0b', '#a855f7'],
    });
  };

  const dismissPlanNotice = () => {
    setPlanChangeNotice(null);
  };

  const setActiveFacilityById = (facilityId: string) => {
    setActiveFacilityId(facilityId);
  };

  const activeFacility = PLANT_FACILITIES.find((f) => f.id === activeFacilityId) || PLANT_FACILITIES[0];
  const planName = PLAN_NAMES[planTier] || 'Plant Pro';

  // Derive feature availability based on active plan tier
  const features: PlanFeatures = {
    maxMachines: planTier === 'pilot' ? 5 : planTier === 'pro' ? 20 : 30,
    samplingRateMs: planTier === 'enterprise' ? 100 : planTier === 'pro' ? 1000 : 10000,
    samplingRateLabel: planTier === 'enterprise' ? 'Sub-second 100 Hz Real-Time' : planTier === 'pro' ? '1-Second Continuous Live' : '10-Second Periodic Polling',
    hasSubSecondStreaming: planTier === 'enterprise',
    hasMultiPlant: planTier === 'enterprise',
    hasSapOracleSync: planTier === 'enterprise',
    hasScadaEmergencyTrip: planTier === 'pro' || planTier === 'enterprise',
    hasDedicatedEngineerHotline: planTier === 'enterprise',
    hasIsoRecalibrationCertificate: planTier === 'pro' || planTier === 'enterprise',
    hasPhysicsNeuralNetModel: planTier === 'enterprise',
    hasPredictiveRul: planTier === 'pro' || planTier === 'enterprise',
    hasWhatsappSmsDispatch: planTier === 'pro' || planTier === 'enterprise',
    hasHotSwapWarranty: planTier === 'pro' || planTier === 'enterprise',
    hasOrbitLissajous: planTier === 'pro' || planTier === 'enterprise',
    hasAudioFrequencyStethoscope: planTier === 'pro' || planTier === 'enterprise',
    hasStandardAlerts: true,
    historyRetentionDays: planTier === 'enterprise' ? 730 : planTier === 'pro' ? 365 : 180,
    slaSupportLevel: planTier === 'enterprise' ? '24/7 Dedicated Senior Engineer (15-min SLA)' : planTier === 'pro' ? 'Priority Mechanical On-Call (2 hr)' : 'Email Support (48 hr)',
    warrantyBadge: planTier === 'enterprise' ? 'Up to 3 Years Warranty (Up to 10 Sensor Replacements + Free Hardware Updates while Plan is Active)' : planTier === 'pro' ? '3-Year Extended Warranty + Hot-Swap Dispatch + ISO 17025 Cert' : '1-Year Standard Hardware Warranty',
  };

  const tripScadaEmergencyInterlock = (machineTag: string) => {
    setScadaInterlockState('SAFETY_TRIPPED');
  };

  const resetScadaInterlock = () => {
    setScadaInterlockState('ARMED_NORMAL');
  };

  const triggerSapSync = (machineTag: string, alertMessage: string) => {
    setIsSapSyncing(true);
    setTimeout(() => {
      const newRecord: SapSyncRecord = {
        orderId: `WO-SAP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        sapNotificationId: `SAP-PM-NOTIF-${Math.floor(400000 + Math.random() * 90000)}`,
        machineTag,
        status: 'synced',
        costCenter: `CC-${activeFacility.state.substring(0, 3).toUpperCase()}-MECH-01`,
        priority: 'Very High',
        assignedWorkCenter: 'EMERGENCY_RELIABILITY_CREW',
        timestamp: 'Just now (SAP PM Synced)',
      };
      setSapSyncRecords((prev) => [newRecord, ...prev]);
      setIsSapSyncing(false);
    }, 1200);
  };

  return (
    <PlanContext.Provider
      value={{
        planTier,
        planName,
        setPlanTier,
        planChangeNotice,
        dismissPlanNotice,
        features,
        activeFacility,
        setActiveFacilityById,
        scadaInterlockState,
        setScadaInterlockState,
        tripScadaEmergencyInterlock,
        resetScadaInterlock,
        sapSyncRecords,
        isSapSyncing,
        triggerSapSync,
        isEngineerHotlineOpen,
        openEngineerHotline: () => setIsEngineerHotlineOpen(true),
        closeEngineerHotline: () => setIsEngineerHotlineOpen(false),
        isIsoCertModalOpen,
        openIsoCertModal: () => setIsIsoCertModalOpen(true),
        closeIsoCertModal: () => setIsIsoCertModalOpen(false),
        isScadaModalOpen,
        openScadaModal: () => setIsScadaModalOpen(true),
        closeScadaModal: () => setIsScadaModalOpen(false),
        isSapModalOpen,
        openSapModal: () => setIsSapModalOpen(true),
        closeSapModal: () => setIsSapModalOpen(false),
      }}
    >
      {children}
    </PlanContext.Provider>
  );
};

export const usePlan = () => {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return context;
};
