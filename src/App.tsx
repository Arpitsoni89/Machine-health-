import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { PlanProvider, usePlan } from './context/PlanContext';
import { Navbar } from './components/Navbar';
import { BottomNavBar } from './components/BottomNavBar';
import { GoogleLoginModal } from './components/GoogleLoginModal';
import { FriendlyGuideModal } from './components/FriendlyGuideModal';
import { LiveTelemetryDashboard } from './components/LiveTelemetryDashboard';
import { MachineFleetView } from './components/MachineFleetView';
import { SenseThinkActView } from './components/SenseThinkActView';
import { RoiCalculatorView } from './components/RoiCalculatorView';
import { SubscriptionPlansView } from './components/SubscriptionPlansView';
import { HelpAndWarrantyView } from './components/HelpAndWarrantyView';
import { AlertsSlideOver } from './components/AlertsSlideOver';
import { FactoryOwnerNotificationModal } from './components/FactoryOwnerNotificationModal';
import { EnterpriseEngineerModal } from './components/EnterpriseEngineerModal';
import { SapErpSyncModal } from './components/SapErpSyncModal';
import { ScadaInterlockModal } from './components/ScadaInterlockModal';
import { IsoRecalibrationModal } from './components/IsoRecalibrationModal';
import { INITIAL_MACHINES, INITIAL_ALERTS } from './data/mockMachines';
import { IndustrialMachine, MaintenanceAlert, NavTab, TechnicianInfo, OwnerWorkDoneNotification } from './types';
import { ShieldCheck, Sparkles, CreditCard, Radio, CheckCircle2, Check, ArrowRight } from 'lucide-react';
import { getRecommendedTechnician } from './data/mockTechnicians';
import { PWAInstallBanner } from './components/PWAInstallPrompt';
import { OfflineIndicator } from './components/OfflineIndicator';
import { NotificationToastBanner } from './components/NotificationToastBanner';
import { TaskCompletedToast } from './components/TaskCompletedToast';
import { soundFx, triggerHaptic, sendSystemNotification } from './utils/notificationHelpers';
import { saveAlertToFirestore, subscribeToFirestoreAlerts } from './lib/firestoreService';

function MachineMindApp() {
  const { user, openLoginModal } = useAuth();
  const { themeConfig } = useTheme();
  const { 
    planTier, 
    planName,
    setPlanTier, 
    planChangeNotice,
    dismissPlanNotice,
    isEngineerHotlineOpen, 
    closeEngineerHotline,
    isSapModalOpen,
    closeSapModal,
    isScadaModalOpen,
    closeScadaModal,
    isIsoCertModalOpen,
    closeIsoCertModal
  } = usePlan();

  const [activeTab, setActiveTab] = useState<NavTab>('telemetry');
  const [machines, setMachines] = useState<IndustrialMachine[]>(INITIAL_MACHINES);
  const [selectedMachineId, setSelectedMachineId] = useState<string>(INITIAL_MACHINES[0].id);
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>(INITIAL_ALERTS);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [latestOwnerNotification, setLatestOwnerNotification] = useState<OwnerWorkDoneNotification | null>(null);
  const [isOwnerNoticeModalOpen, setIsOwnerNoticeModalOpen] = useState(false);
  const [toastAlert, setToastAlert] = useState<MaintenanceAlert | null>(null);
  const [taskCompletedToast, setTaskCompletedToast] = useState<OwnerWorkDoneNotification | null>(null);

  // Subscribe to real-time alerts from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToFirestoreAlerts((firestoreAlerts) => {
      if (firestoreAlerts.length > 0) {
        setAlerts((prev) => {
          const firestoreIds = new Set(firestoreAlerts.map(a => a.id));
          const localOnly = prev.filter(a => !firestoreIds.has(a.id));
          return [...firestoreAlerts, ...localOnly];
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Desktop PC Keyboard Navigation Shortcuts (1-5 for tabs, 'A' for alerts, Escape for modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in forms/inputs
      const activeEl = document.activeElement;
      const isInput = activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.tagName === 'SELECT' ||
        (activeEl as HTMLElement).isContentEditable
      );

      if (isInput) return;

      if (e.key === '1') {
        setActiveTab('telemetry');
        soundFx.playTabClick();
      } else if (e.key === '2') {
        setActiveTab('fleet');
        soundFx.playTabClick();
      } else if (e.key === '3') {
        setActiveTab('roi');
        soundFx.playTabClick();
      } else if (e.key === '4') {
        setActiveTab('subscription');
        soundFx.playTabClick();
      } else if (e.key === '5') {
        setActiveTab('help');
        soundFx.playTabClick();
      } else if (e.key === 'a' || e.key === 'A') {
        setIsAlertsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsAlertsOpen(false);
        setIsGuideOpen(false);
        setIsOwnerNoticeModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const selectedMachine = machines.find((m) => m.id === selectedMachineId) || machines[0];

  const handleAddAlert = (newAlert: MaintenanceAlert) => {
    setAlerts((prev) => [newAlert, ...prev]);
    setMachines((prev) =>
      prev.map((m) =>
        m.id === newAlert.machineId
          ? {
              ...m,
              status: 'critical',
              healthScore: Math.min(m.healthScore, 35),
              predictedTimeToFailureHours: 12,
            }
          : m
      )
    );

    // Audio & haptic feedback on mobile
    soundFx.playAlertChime();
    triggerHaptic([40, 50, 40]);

    // Save to Firestore
    saveAlertToFirestore(newAlert);

    // Push notification if permitted
    sendSystemNotification(`🚨 Critical: ${newAlert.machineName}`, {
      body: `${newAlert.message} Telemetry: ${newAlert.value}`,
    });

    // Show mobile top toast banner if drawer is closed
    if (!isAlertsOpen) {
      setToastAlert(newAlert);
      setTimeout(() => {
        setToastAlert((curr) => (curr?.id === newAlert.id ? null : curr));
      }, 7000);
    }
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
  };

  const handleAcknowledgeAll = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, acknowledged: true })));
    setToastAlert(null);
  };

  const handleSimulateIoTAlert = () => {
    const randomMachine = machines[Math.floor(Math.random() * machines.length)];
    const simAlert: MaintenanceAlert = {
      id: `alert-sim-${Date.now()}`,
      machineId: randomMachine.id,
      machineName: randomMachine.name,
      category: randomMachine.category,
      severity: 'critical',
      metric: 'vibration',
      value: `${(randomMachine.vibBaseline * 2.6).toFixed(2)} mm/s RMS`,
      threshold: `${randomMachine.vibThreshold.toFixed(2)} mm/s`,
      message: `High-frequency harmonic vibration burst detected on ${randomMachine.name} drive shaft bearing raceway. Immediate inspection required.`,
      timestamp: 'Just now',
      acknowledged: false,
      recommendedAction: 'Dispatch certified reliability technician to inspect bearing lubrication and align shaft coupling.',
    };

    handleAddAlert(simAlert);
  };

  const handleAssignTechnician = (machineId: string, alertId?: string, technician?: TechnicianInfo) => {
    const machine = machines.find((m) => m.id === machineId);
    const tech = technician || getRecommendedTechnician(machine?.category || 'factory_machines');

    setMachines((prev) =>
      prev.map((m) =>
        m.id === machineId
          ? {
              ...m,
              assignedTechnician: tech,
            }
          : m
      )
    );

    setAlerts((prev) =>
      prev.map((a) =>
        a.machineId === machineId || (alertId && a.id === alertId)
          ? {
              ...a,
              acknowledged: true,
              assignedTo: tech.name,
              technician: tech,
            }
          : a
      )
    );
  };

  const handleMarkMachineRepaired = (machineId: string, repairNotes?: string) => {
    const targetMachine = machines.find((m) => m.id === machineId);
    let techName = 'Assigned Certified Technician';
    let techBadge = '#TECH-IND-4091';

    setMachines((prev) =>
      prev.map((m) => {
        if (m.id === machineId) {
          techName = m.assignedTechnician?.name || 'Vikram "Vik" Rathore';
          techBadge = m.assignedTechnician?.badgeId || '#TECH-IND-4091';
          return {
            ...m,
            status: 'normal',
            healthScore: 98,
            riskScore: 6,
            temperature: m.tempBaseline,
            vibration: m.vibBaseline,
            power: m.powerBaseline,
            predictedTimeToFailureHours: 720,
            lastMaintained: 'Just now (Repaired & Certified)',
            aiDiagnosticNote: `Repair verified by ${techName}. ${repairNotes || 'Vibration & thermal metrics returned to ISO 10816 Zone A normal.'} All mechanical components running smoothly.`,
            assignedTechnician: null,
          };
        }
        return m;
      })
    );

    setAlerts((prev) =>
      prev.map((a) =>
        a.machineId === machineId
          ? {
              ...a,
              acknowledged: true,
              isRepaired: true,
              repairedAt: 'Just now',
            }
          : a
      )
    );

    // Sensor automated post-repair acoustic verification & Factory Owner notification
    if (targetMachine) {
      const sensorNotice: OwnerWorkDoneNotification = {
        id: `notice-${Date.now()}`,
        machineId: targetMachine.id,
        machineName: targetMachine.name,
        machineTag: targetMachine.tag,
        facility: user?.facility || 'Alpha Plant Facility (Alwar)',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        technicianName: techName,
        technicianBadge: techBadge,
        repairSummary: repairNotes || 'Mechanical repair verified. Edge vibration sensors executed a 10-second post-repair acoustic self-test: amplitude normalized to ISO 10816 Zone A baseline (1.80 mm/s RMS). Stator temp nominal at 45.0°C.',
        sensorVerification: {
          sensorSerial: targetMachine.category === 'power_systems' ? 'SENS-PWR-1108' : targetMachine.category === 'production_lines' ? 'SENS-HUB-0044' : 'SENS-ACC-9021',
          vibrationRMS: `${targetMachine.vibBaseline.toFixed(2)} mm/s RMS`,
          vibrationStatus: 'ISO 10816 Zone A (Excellent / Normal)',
          temperatureC: `${targetMachine.tempBaseline.toFixed(1)}°C`,
          powerKW: `${targetMachine.powerBaseline.toFixed(1)} kW`,
          acousticQuality: 'Harmonic spectral noise <0.12 mm/s. Zero bearing raceway defect frequencies detected.',
          isoZone: 'Zone A (Like-New Baseline)',
        },
        recipientOwner: {
          name: user?.name || 'Harshit (Factory Owner)',
          role: user?.role || 'Plant Owner & Managing Director',
          email: user?.email || 'harshit998ops@gmail.com',
          phone: '+91 98201 44102',
        },
        channelsDispatched: {
          whatsapp: true,
          sms: true,
          email: true,
          inApp: true,
        },
      };

      setLatestOwnerNotification(sensorNotice);
      // Give a short notification toast when task is completed by technician
      setTaskCompletedToast(sensorNotice);

      // Play success chime & haptic feedback
      soundFx.playSuccessChime();
      triggerHaptic([30, 45, 30]);

      // Dispatch browser push notification
      sendSystemNotification(`✅ Task Completed: ${techName}`, {
        body: `${targetMachine.name} (${targetMachine.tag}) repaired and restored to ISO Zone A baseline.`,
      });

      // Keep full-screen modal closed by default to avoid interrupting user;
      // User can click "View Full Log" directly on the short notification toast or the header banner!
      setIsOwnerNoticeModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-900 flex flex-col selection:bg-sky-500 selection:text-white transition-colors duration-200">
      {/* Friendly Demo Notice for Visitors */}
      {!user && (
        <div className="bg-white/85 backdrop-blur-xs border-b border-slate-200/90 px-4 py-2 text-center text-xs text-slate-600 flex items-center justify-center gap-2">
          <span>👋 Previewing MachineMind in interactive demo mode.</span>
          <button
            onClick={openLoginModal}
            className={`font-semibold ${themeConfig.textClass} hover:underline`}
          >
            Sign in with Google to enable shift dispatches →
          </button>
        </div>
      )}

      {/* Sensor-to-Owner Work Done Notification Banner */}
      {latestOwnerNotification && (
        <div className="bg-emerald-950 text-white border-b border-emerald-800 px-4 py-2.5 shadow-md flex items-center justify-between text-xs animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5 max-w-4xl truncate">
            <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-300 shrink-0">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
            </span>
            <span className="font-semibold truncate">
              📡 <strong className="text-emerald-300">Sensor Notification to Factory Owner:</strong> Work completed on {latestOwnerNotification.machineName}. Vitals verified at {latestOwnerNotification.sensorVerification.vibrationRMS} (ISO Zone A Normal).
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-3">
            <button
              onClick={() => setIsOwnerNoticeModalOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition shadow-2xs cursor-pointer"
            >
              View Dispatch Notice
            </button>
            <button
              onClick={() => setLatestOwnerNotification(null)}
              className="text-emerald-400 hover:text-white p-1 text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* PWA App Install Banner */}
      <PWAInstallBanner />

      {/* Main Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        alerts={alerts}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        machines={machines}
        selectedMachineId={selectedMachineId}
        onSelectMachine={(id) => setSelectedMachineId(id)}
      />

      {/* Dynamic Plan Changed Notification Banner - Displays when plan is switched */}
      {planChangeNotice && (
        <div className="bg-gradient-to-r from-emerald-600 via-sky-600 to-indigo-600 text-white shadow-md animate-in slide-in-from-top-3 duration-200 sticky top-16 z-30 border-b border-white/20">
          <div className="max-w-7xl 2xl:max-w-[1536px] mx-auto px-3 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0 border border-white/30">
                <CheckCircle2 className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-sm text-white">
                    Plan Changed to {planChangeNotice.planName}!
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white text-slate-900 shadow-2xs">
                    {planChangeNotice.planTier.toUpperCase()} TIER ACTIVE
                  </span>
                </div>
                <p className="text-white/90 text-[11px] mt-0.5">
                  {planChangeNotice.details}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => {
                  setActiveTab('telemetry');
                  dismissPlanNotice();
                }}
                className="px-3 py-1.5 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>View Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={dismissPlanNotice}
                className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 text-xs cursor-pointer"
                title="Dismiss banner"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main App Content Viewport - Optimized for PC Widescreen & Mobile Safe Viewports */}
      <main className="flex-1 max-w-7xl 2xl:max-w-[1600px] w-full mx-auto px-3 sm:px-6 lg:px-8 2xl:px-10 py-4 sm:py-7 lg:py-8 pb-28 sm:pb-32">
        {activeTab === 'telemetry' && (
          <LiveTelemetryDashboard
            machines={machines}
            selectedMachineId={selectedMachineId}
            onSelectMachine={(id) => setSelectedMachineId(id)}
            onAddAlert={handleAddAlert}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            onAssignTechnician={handleAssignTechnician}
            onMarkMachineRepaired={handleMarkMachineRepaired}
            onOpenGuide={() => setIsGuideOpen(true)}
            onOpenFleet={() => setActiveTab('fleet')}
            onOpenAlerts={() => setIsAlertsOpen(true)}
            onOpenSubscription={() => setActiveTab('subscription')}
          />
        )}

        {activeTab === 'fleet' && (
          <MachineFleetView
            machines={machines}
            onSelectMachine={(id) => {
              setSelectedMachineId(id);
              setActiveTab('telemetry');
            }}
          />
        )}

        {activeTab === 'roi' && <RoiCalculatorView />}

        {activeTab === 'subscription' && (
          <SubscriptionPlansView 
            onNavigateToHelp={() => setActiveTab('help')}
            onGoToDashboard={() => setActiveTab('telemetry')}
            onPlanChanged={(planId) => setPlanTier(planId)}
          />
        )}

        {activeTab === 'help' && (
          <HelpAndWarrantyView
            onOpenGuide={() => setIsGuideOpen(true)}
            onOpenSubscription={() => setActiveTab('subscription')}
            machines={machines}
            onAssignTechnician={handleAssignTechnician}
          />
        )}
      </main>

      {/* Enterprise Feature Modals */}
      <EnterpriseEngineerModal
        machine={selectedMachine}
        isOpen={isEngineerHotlineOpen}
        onClose={closeEngineerHotline}
      />

      <SapErpSyncModal
        machine={selectedMachine}
        alerts={alerts}
        isOpen={isSapModalOpen}
        onClose={closeSapModal}
      />

      <ScadaInterlockModal
        machine={selectedMachine}
        isOpen={isScadaModalOpen}
        onClose={closeScadaModal}
      />

      <IsoRecalibrationModal
        machine={selectedMachine}
        isOpen={isIsoCertModalOpen}
        onClose={closeIsoCertModal}
      />

      {/* Mobile Top Toast Notification Banner for Anomalies */}
      <NotificationToastBanner
        alert={toastAlert}
        onOpenAlerts={() => {
          setToastAlert(null);
          setIsAlertsOpen(true);
        }}
        onDismiss={() => setToastAlert(null)}
        onQuickDispatch={(alert) => {
          handleAssignTechnician(alert.machineId, alert.id);
          setToastAlert(null);
        }}
      />

      {/* Short Notification Toast for Technician Task Completion */}
      <TaskCompletedToast
        notification={taskCompletedToast}
        onDismiss={() => setTaskCompletedToast(null)}
        onViewDetails={() => {
          setTaskCompletedToast(null);
          setIsOwnerNoticeModalOpen(true);
        }}
      />

      {/* Slide-over / Mobile Bottom Sheet Plant Alerts Drawer */}
      <AlertsSlideOver
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        alerts={alerts}
        machines={machines}
        onAcknowledge={handleAcknowledgeAlert}
        onAcknowledgeAll={handleAcknowledgeAll}
        onSimulateAlert={handleSimulateIoTAlert}
        onSelectMachine={(id) => {
          setSelectedMachineId(id);
          setActiveTab('telemetry');
        }}
        onAssignTechnician={handleAssignTechnician}
        onMarkMachineRepaired={handleMarkMachineRepaired}
      />

      {/* Friendly Guide Walkthrough Modal */}
      <FriendlyGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onExploreDemo={() => setActiveTab('telemetry')}
      />

      {/* Google Login / Account Switcher Modal */}
      <GoogleLoginModal />

      {/* Factory Owner Sensor Work-Done Notification Modal */}
      <FactoryOwnerNotificationModal
        notification={latestOwnerNotification}
        isOpen={isOwnerNoticeModalOpen}
        onClose={() => setIsOwnerNoticeModalOpen(false)}
      />

      {/* Friendly Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8 text-xs text-slate-500 transition-colors shadow-2xs">
        <div className="max-w-7xl 2xl:max-w-[1536px] mx-auto px-3 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">
              MachineMind
            </span>
            <span aria-hidden="true">·</span>
            <span>Predictive industrial care before failure happens</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <button
              onClick={() => setActiveTab('subscription')}
              className={`font-semibold flex items-center gap-1 ${themeConfig.textClass} hover:underline`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Active Plan: <strong className="text-slate-900">{planName}</strong></span>
            </button>
            <span aria-hidden="true">·</span>
            <span className="text-slate-600">ISO 10816-3 Industrial Reliability Standard</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-slate-600">System Status: 99.98% SLA</span>
            <span aria-hidden="true">·</span>
            <div className="flex items-center gap-1 text-emerald-600 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Google Identity Verified</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Fixed Bottom Navigation Bar Dock */}
      <BottomNavBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSearch={() => {
          window.dispatchEvent(new CustomEvent('open-command-palette'));
        }}
      />

      {/* Offline Connectivity Indicator */}
      <OfflineIndicator />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PlanProvider>
          <MachineMindApp />
        </PlanProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
