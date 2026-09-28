export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'Plant Operations Manager' | 'Chief Reliability Engineer' | 'Predictive Maintenance Specialist' | 'Executive VP Operations';
  facility: string;
  provider: 'google';
  loginTime: string;
}

export type MachineStatus = 'normal' | 'warning' | 'critical';

export type MachineCategory = 'factory_machines' | 'production_lines' | 'power_systems';

export type IndustrySector = 'auto' | 'steel' | 'textile' | 'pharma';

export interface MachineMetricHistory {
  timestamp: string;
  temperature: number; // °C
  vibration: number;   // mm/s RMS
  power: number;       // kW
  riskScore: number;   // 0-100%
  isAnomaly: boolean;
}

export interface TechnicianInfo {
  id: string;
  name: string;
  badgeId: string;
  avatar: string;
  role: string;
  certification: string;
  phone: string;
  radioChannel: string;
  shift: string;
  etaMinutes: number;
  status: 'en_route' | 'on_site' | 'repaired';
  assignedAt: string;
  repairNotes?: string;
}

export interface OwnerWorkDoneNotification {
  id: string;
  machineId: string;
  machineName: string;
  machineTag: string;
  facility: string;
  timestamp: string;
  technicianName: string;
  technicianBadge: string;
  repairSummary: string;
  sensorVerification: {
    sensorSerial: string;
    vibrationRMS: string;
    vibrationStatus: string;
    temperatureC: string;
    powerKW: string;
    acousticQuality: string;
    isoZone: string;
  };
  recipientOwner: {
    name: string;
    role: string;
    email: string;
    phone: string;
  };
  channelsDispatched: {
    whatsapp: boolean;
    sms: boolean;
    email: boolean;
    inApp: boolean;
  };
}

export interface IndustrialMachine {
  id: string;
  name: string;
  tag: string;
  serialNumber?: string;
  category: MachineCategory;
  categoryLabel: string;
  industry: IndustrySector;
  industryLabel: string;
  location: string;
  status: MachineStatus;
  healthScore: number; // 0 - 100
  temperature: number; // current °C
  tempBaseline: number;
  tempThreshold: number;
  vibration: number;   // current mm/s RMS
  vibBaseline: number;
  vibThreshold: number;
  power: number;       // current kW
  powerBaseline: number;
  powerThreshold: number;
  riskScore: number;   // 0-100
  predictedTimeToFailureHours: number | null;
  lastMaintained: string;
  nextScheduledInspection: string;
  aiDiagnosticNote: string;
  history: MachineMetricHistory[];
  assignedTechnician?: TechnicianInfo | null;
}

export interface MaintenanceAlert {
  id: string;
  machineId: string;
  machineName: string;
  category: MachineCategory;
  severity: 'warning' | 'critical';
  metric: 'temperature' | 'vibration' | 'power' | 'compound';
  value: string;
  threshold: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  assignedTo?: string;
  recommendedAction: string;
  technician?: TechnicianInfo | null;
  isRepaired?: boolean;
  repairedAt?: string;
}

export type PlanTier = 'pilot' | 'pro' | 'enterprise';
export type BillingCycle = 'monthly' | 'annual';

export type NavTab = 'telemetry' | 'fleet' | 'roi' | 'subscription' | 'help';

export interface SensorWarrantyItem {
  id: string;
  serialNumber: string;
  model: string;
  type: 'Triaxial Accelerometer' | 'PT100 Thermal Probe' | 'Hall Effect Current Transducer' | 'Edge Gateway Hub';
  machineId: string;
  machineName: string;
  installationDate: string;
  warrantyExpiryDate: string;
  warrantyTier: 'Standard 1-Year' | 'Pro Extended 3-Year' | 'Enterprise 3-Year (Up to 10 Replacements)' | 'Enterprise Lifetime Continuous' | string;
  status: 'active' | 'expiring_soon' | 'calibration_due';
  lastCalibrated: string;
  nextCalibrationDue: string;
  replacementCount: number;
  coverageTerms: string[];
}

export interface SubscriptionPlan {
  id: PlanTier;
  name: string;
  tagline: string;
  forAudience: string;
  monthlyPrice: number;
  annualPricePerMonth: number;
  machineLimit: number | 'Unlimited';
  highlightBadge?: string;
  isPopular?: boolean;
  features: string[];
  specs: {
    samplingRate: string;
    anomalyModel: string;
    alertChannels: string;
    historyRetention: string;
    uptimeSla: string;
    supportLevel: string;
    hardwareSupport: string;
  };
}

export interface UserSubscription {
  planId: PlanTier;
  status: 'active' | 'trial';
  billingCycle: BillingCycle;
  renewalDate: string;
  activeMachinesCount: number;
  machineQuota: number;
  paymentMethod: {
    brand: string;
    last4: string;
    expiry: string;
  };
  invoices: {
    id: string;
    date: string;
    amount: string;
    status: 'paid' | 'pending';
    pdfName: string;
  }[];
}

export interface PreventiveAction {
  priority: 'IMMEDIATE' | 'NEXT_SHIFT' | 'SCHEDULED_PM';
  action: string;
  targetComponent: string;
  requiredTools: string[];
  estimatedDowntimeMinutes: number;
  completed?: boolean;
}

export interface PredictiveInsight {
  executiveSummary: string;
  riskLevel: 'CRITICAL' | 'ELEVATED' | 'NOMINAL';
  failureProbability: number;
  estimatedRemainingUsefulLife: string;
  anomalyClassification: string;
  rootCauseAnalysis: string[];
  preventiveActions: PreventiveAction[];
  financialRiskAvoidance: {
    estimatedDowntimeCostPerHour: string;
    preventiveCost: string;
    potentialSavings: string;
  };
  isoComplianceStatus: string;
}

export type FeedbackCategory = 
  | 'sensor_accuracy' 
  | 'warranty_experience' 
  | 'technician_service' 
  | 'app_usability' 
  | 'feature_request' 
  | 'general';

export interface CustomerFeedbackItem {
  id: string;
  rating: number; // 1 - 5
  category: FeedbackCategory;
  categoryLabel: string;
  authorName: string;
  authorRole: string;
  facilityName: string;
  userEmail: string;
  npsScore: number; // 0 - 10
  tags: string[];
  feedbackMessage: string;
  timestamp: string;
  verified: boolean;
  officialReply?: {
    author: string;
    role: string;
    message: string;
    timestamp: string;
  };
}

