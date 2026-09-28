import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle2, 
  Download, 
  ShieldCheck, 
  X, 
  FileText, 
  Calendar, 
  QrCode, 
  Sparkles,
  Building2
} from 'lucide-react';
import { usePlan } from '../context/PlanContext';
import { useTheme } from '../context/ThemeContext';
import { IndustrialMachine } from '../types';
import confetti from 'canvas-confetti';
import { downloadIsoRecalibrationPdf } from '../utils/pdfCertificateGenerator';

interface IsoRecalibrationModalProps {
  machine?: IndustrialMachine;
  isOpen: boolean;
  onClose: () => void;
}

export const IsoRecalibrationModal: React.FC<IsoRecalibrationModalProps> = ({
  machine,
  isOpen,
  onClose,
}) => {
  const { themeConfig } = useTheme();
  const { activeFacility } = usePlan();
  const [certNotice, setCertNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const certData = {
    certificateNumber: `ISO-17025-CAL-2026-${machine ? machine.tag.replace(/[^A-Z0-9]/g, '') : 'PLANT'}-9921`,
    standard: 'ISO/IEC 17025:2017 & NIST Traceable Metrology Standards',
    accreditationBody: 'National Accreditation Board for Testing and Calibration Laboratories (NABL)',
    facility: activeFacility.name,
    machineAssigned: machine ? `${machine.name} (${machine.tag})` : 'Plant Fleet Accelerometer Cluster',
    sensorSerial: machine?.serialNumber || 'SN-ACCEL-TRX-882194',
    sensorType: 'Triaxial Piezoelectric Accelerometer (100 mV/g ± 2%)',
    calibrationDate: 'September 15, 2026',
    expiryDate: 'September 14, 2027',
    metrologicalTraceability: 'NIST Standard Reference Material #2891 / NPL Mass-Spring Calibrator',
    expandedUncertainty: '± 0.42% at k = 2 (95.45% Confidence Level)',
    frequencyResponseRange: '0.5 Hz – 12,500 Hz (Flat ± 3dB)',
    crossAxisSensitivity: '< 2.1%',
    certifiedEngineer: 'Dr. Rajeshwari Menon, PhD (Lead Metrologist #CAT-IV-8821)',
  };

  const handleDownloadCertPdf = () => {
    downloadIsoRecalibrationPdf({
      machine,
      activeFacilityName: activeFacility.name,
      certificateNumber: certData.certificateNumber,
    });

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: [themeConfig.dotColor, '#38bdf8', '#34d399', '#f59e0b'],
    });

    setCertNotice('ISO 17025 Calibration Certificate (.pdf) downloaded successfully!');
    setTimeout(() => setCertNotice(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-150">
        {/* Header Strip */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  Plant Pro & Enterprise Quality Metrology
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300">
                  ISO/IEC 17025:2017
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Sensor Precision Recalibration Certificate
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Display Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {certNotice && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{certNotice}</span>
            </div>
          )}

          <div className="p-5 rounded-2xl bg-amber-50/50 border-2 border-dashed border-amber-300/80 space-y-4">
            <div className="flex items-start justify-between border-b border-amber-200 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 font-bold block">
                  Official Verification Record
                </span>
                <h4 className="text-sm font-extrabold text-slate-900 font-mono">
                  {certData.certificateNumber}
                </h4>
              </div>
              <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                PASSED (100% Precision)
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Assigned Machine:</span>
                <span className="font-bold text-slate-900">{certData.machineAssigned}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Sensor Serial Number:</span>
                <span className="font-bold text-slate-900">{certData.sensorSerial}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Expanded Uncertainty:</span>
                <span className="font-bold text-emerald-700">{certData.expandedUncertainty}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Valid Through:</span>
                <span className="font-bold text-slate-900">{certData.expiryDate}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 leading-relaxed pt-2 border-t border-amber-200">
              <strong>Traceability Statement:</strong> This sensor has been verified against national metrology laboratory reference standards in compliance with ISO/IEC 17025:2017. Vibration amplitude and phase linearity verified up to 10,000 Hz.
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-amber-200 text-slate-600">
              <span>Signatory: <strong>{certData.certifiedEngineer}</strong></span>
              <span className="text-emerald-700 font-bold">✓ Digitally Signed & Sealed</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <button
            onClick={handleDownloadCertPdf}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs text-white transition flex items-center gap-2 shadow-sm cursor-pointer ${themeConfig.primaryClass} ${themeConfig.primaryHoverClass}`}
          >
            <FileText className="w-4 h-4" />
            <span>Download Official Certificate (.pdf)</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 font-bold text-slate-700 transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
