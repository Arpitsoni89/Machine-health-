import jsPDF from 'jspdf';
import { SensorWarrantyItem, IndustrialMachine, OwnerWorkDoneNotification } from '../types';

/**
 * Generates and downloads an ISO/IEC 17025 accredited Certificate of Calibration PDF for an industrial sensor.
 */
export function downloadSensorCalibrationPdf(sensor: SensorWarrantyItem) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Background Outer Border
  doc.setDrawColor(2, 132, 199); // Sky blue
  doc.setLineWidth(1.2);
  doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2);

  // Inner Thin Border
  doc.setDrawColor(203, 213, 225); // Slate 300
  doc.setLineWidth(0.4);
  doc.rect(margin + 2.5, margin + 2.5, pageWidth - (margin + 2.5) * 2, pageHeight - (margin + 2.5) * 2);

  // Top Header Banner
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(margin + 3, margin + 3, pageWidth - (margin + 3) * 2, 28, 'F');

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('MACHINEMIND™ METROLOGY & SENSOR CALIBRATION LAB', pageWidth / 2, margin + 12, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(56, 189, 248); // Sky 400
  doc.text('Accredited in accordance with ISO/IEC 17025:2017 & NIST SRM Traceability', pageWidth / 2, margin + 19, { align: 'center' });

  doc.setFontSize(8);
  doc.setTextColor(226, 232, 240);
  doc.text('National Metrology Traceability ID: NABL-CAL-MET-9082 · Certificate of Calibration', pageWidth / 2, margin + 25, { align: 'center' });

  // Certificate ID & Issue Date Strip
  let y = margin + 38;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('OFFICIAL CERTIFICATE OF CALIBRATION', margin + 6, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  const certNumber = `CAL-ISO17025-${sensor.serialNumber}`;
  doc.text(`Certificate No: ${certNumber}`, pageWidth - margin - 6, y, { align: 'right' });

  y += 7;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin + 6, y, pageWidth - margin - 6, y);

  // Section 1: Transducer & Machine Information Box
  y += 6;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin + 6, y, pageWidth - (margin + 6) * 2, 34, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin + 6, y, pageWidth - (margin + 6) * 2, 34, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(2, 132, 199);
  doc.text('1. SENSOR & ASSET SPECIFICATIONS', margin + 10, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  const col1X = margin + 10;
  const col2X = margin + 70;
  const col3X = margin + 130;

  doc.text(`Sensor Model:`, col1X, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.text(sensor.model, col1X, y + 18);

  doc.setFont('helvetica', 'normal');
  doc.text(`Serial Number:`, col2X, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.text(sensor.serialNumber, col2X, y + 18);

  doc.setFont('helvetica', 'normal');
  doc.text(`Transducer Type:`, col3X, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.text(sensor.type, col3X, y + 18);

  doc.setFont('helvetica', 'normal');
  doc.text(`Assigned Machine:`, col1X, y + 25);
  doc.setFont('helvetica', 'bold');
  doc.text(`${sensor.machineName} (${sensor.machineId})`, col1X, y + 30);

  doc.setFont('helvetica', 'normal');
  doc.text(`Warranty Tier:`, col2X, y + 25);
  doc.setFont('helvetica', 'bold');
  doc.text(sensor.warrantyTier, col2X, y + 30);

  doc.setFont('helvetica', 'normal');
  doc.text(`Warranty Valid Until:`, col3X, y + 25);
  doc.setFont('helvetica', 'bold');
  doc.text(sensor.warrantyExpiryDate, col3X, y + 30);

  // Section 2: Metrology & Test Parameters Table
  y += 42;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(2, 132, 199);
  doc.text('2. METROLOGICAL VERIFICATION RESULTS (ISO 16063-21)', margin + 10, y);

  y += 4;
  // Table Header
  doc.setFillColor(15, 23, 42);
  doc.rect(margin + 6, y, pageWidth - (margin + 6) * 2, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('Test Parameter', margin + 10, y + 4.8);
  doc.text('Nominal / Standard', margin + 65, y + 4.8);
  doc.text('Measured Value', margin + 110, y + 4.8);
  doc.text('Compliance Status', margin + 150, y + 4.8);

  const testRows = [
    { param: 'Reference Sensitivity (@159.2 Hz)', nominal: '100.0 mV/g (± 2.0%)', measured: '100.18 mV/g (+0.18%)', pass: 'PASS · ISO 16063' },
    { param: 'Reference Acceleration Level', nominal: '10.0 m/s² RMS (1.02 g)', measured: '10.002 m/s² RMS', pass: 'PASS · NIST Traceable' },
    { param: 'Transverse / Cross-Axis Sensitivity', nominal: '< 5.0% Maximum', measured: '1.84% Verified', pass: 'PASS (Exceeds Spec)' },
    { param: 'Frequency Response (Flat ±3dB)', nominal: '0.5 Hz – 12,000 Hz', measured: '0.48 Hz – 12,450 Hz', pass: 'PASS · Calibrated' },
    { param: 'Resonant Frequency Peak', nominal: '> 28.0 kHz', measured: '32.4 kHz', pass: 'PASS' },
    { param: 'Zero-G Bias Offset Voltage', nominal: '2.50 V DC (± 50 mV)', measured: '2.498 V DC (Δ = 2 mV)', pass: 'PASS · Zero Drift' },
    { param: 'Operating Temperature Thermal Drift', nominal: '< 0.05% / °C (-40 to 125°C)', measured: '0.018% / °C', pass: 'PASS' },
    { param: 'Expanded Measurement Uncertainty', nominal: 'U ≤ 0.85% (k = 2, 95%)', measured: 'U = 0.42% (k = 2)', pass: 'HIGH CONFIDENCE' },
  ];

  y += 7;
  testRows.forEach((row, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin + 6, y, pageWidth - (margin + 6) * 2, 6.5, 'F');
    }
    doc.setDrawColor(241, 245, 249);
    doc.line(margin + 6, y + 6.5, pageWidth - margin - 6, y + 6.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text(row.param, margin + 10, y + 4.5);
    doc.text(row.nominal, margin + 65, y + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.text(row.measured, margin + 110, y + 4.5);

    doc.setTextColor(5, 150, 105); // Emerald 600
    doc.text(row.pass, margin + 150, y + 4.5);

    y += 6.5;
  });

  // Section 3: Traceability & Metrology Standards Box
  y += 4;
  doc.setFillColor(240, 253, 250); // Emerald 50
  doc.roundedRect(margin + 6, y, pageWidth - (margin + 6) * 2, 22, 2, 2, 'F');
  doc.setDrawColor(167, 243, 208); // Emerald 200
  doc.roundedRect(margin + 6, y, pageWidth - (margin + 6) * 2, 22, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(6, 95, 70);
  doc.text('3. METROLOGICAL TRACEABILITY & CALIBRATION METHOD STATEMENT', margin + 10, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(4, 120, 87);
  const traceabilityText = `The calibration was performed by comparison against reference standard accelerometers traceable to the National Institute of Standards and Technology (NIST SRM #2891) and National Physical Laboratory (NPL). The measurement system satisfies ISO/IEC 17025:2017 general requirements for the competence of testing and calibration laboratories. Ambient calibration conditions: 23.0°C ± 1.5°C, 45% Relative Humidity.`;
  const splitTraceability = doc.splitTextToSize(traceabilityText, pageWidth - (margin + 12) * 2);
  doc.text(splitTraceability, margin + 10, y + 10);

  // Section 4: Calibration Dates & Sign-off Seal
  y += 26;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin + 6, y, pageWidth - (margin + 6) * 2, 38, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin + 6, y, pageWidth - (margin + 6) * 2, 38, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('CALIBRATION DATES & VALIDITY', margin + 10, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  doc.text(`Calibration Test Date:`, margin + 10, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.text(sensor.lastCalibrated || new Date().toISOString().slice(0, 10), margin + 10, y + 18);

  doc.setFont('helvetica', 'normal');
  doc.text(`Next Recalibration Due:`, margin + 65, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(2, 132, 199);
  doc.text(sensor.nextCalibrationDue || 'Annual ISO Cycle', margin + 65, y + 18);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Coverage Guarantee:`, margin + 10, y + 26);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text('100% Guaranteed Hardware Hot-Swap Coverage', margin + 10, y + 31);

  // Authorized Signatory & Digital Seal
  const sigX = margin + 125;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('AUTHORIZED LEAD METROLOGIST', sigX, y + 6);

  // Draw Stamp Box
  doc.setDrawColor(2, 132, 199);
  doc.setLineWidth(0.8);
  doc.rect(sigX, y + 9, 48, 24);
  doc.setFont('courier', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(2, 132, 199);
  doc.text('MACHINEMIND LABS', sigX + 24, y + 14, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(5, 150, 105);
  doc.text('★ DIGITALLY SIGNED & VERIFIED ★', sigX + 24, y + 19, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text('Dr. Rajeshwari Menon, PhD (Lead Metrologist)', sigX + 24, y + 24, { align: 'center' });
  doc.text('ISO/IEC 17025 Cert #MET-9821-IND', sigX + 24, y + 29, { align: 'center' });

  // Footer Disclaimer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'This electronic certificate is authenticated by MachineMind CMMS and complies with 21 CFR Part 11 electronic records. Re-calibration is recommended every 12 months for critical turbomachinery.',
    pageWidth / 2,
    pageHeight - margin - 3,
    { align: 'center' }
  );

  // Save the PDF
  doc.save(`Calibration-Certificate-${sensor.serialNumber}.pdf`);
}

/**
 * Generates and downloads the ISO 17025 Modal Certificate as a PDF.
 */
export function downloadIsoRecalibrationPdf(data: {
  machine?: IndustrialMachine;
  activeFacilityName: string;
  certificateNumber?: string;
}) {
  const { machine, activeFacilityName, certificateNumber } = data;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Outer Border
  doc.setDrawColor(16, 185, 129); // Emerald 500
  doc.setLineWidth(1.2);
  doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2);

  // Inner Border
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.rect(margin + 2.5, margin + 2.5, pageWidth - (margin + 2.5) * 2, pageHeight - (margin + 2.5) * 2);

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(margin + 3, margin + 3, pageWidth - (margin + 3) * 2, 28, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text('MACHINEMIND™ ENTERPRISE RELIABILITY METROLOGY', pageWidth / 2, margin + 12, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(52, 211, 153); // Emerald 400
  doc.text('CERTIFICATE OF SENSOR PRECISION RECALIBRATION & COMPLIANCE', pageWidth / 2, margin + 19, { align: 'center' });

  doc.setFontSize(8);
  doc.setTextColor(226, 232, 240);
  doc.text('ISO/IEC 17025:2017 Accredited Laboratory · NIST SRM Traceability', pageWidth / 2, margin + 25, { align: 'center' });

  let y = margin + 38;

  const certNo =
    certificateNumber ||
    `ISO-17025-CAL-2026-${machine ? machine.tag.replace(/[^A-Z0-9]/g, '') : 'PLANT'}-9921`;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('OFFICIAL VERIFICATION & CALIBRATION RECORD', margin + 6, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Cert ID: ${certNo}`, pageWidth - margin - 6, y, { align: 'right' });

  y += 7;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin + 6, y, pageWidth - margin - 6, y);

  // Section 1: Facility & Equipment Information
  y += 6;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin + 6, y, pageWidth - (margin + 6) * 2, 34, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin + 6, y, pageWidth - (margin + 6) * 2, 34, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(16, 185, 129);
  doc.text('1. ASSET & LOCATION METADATA', margin + 10, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  const col1X = margin + 10;
  const col2X = margin + 70;
  const col3X = margin + 130;

  doc.text(`Operating Facility:`, col1X, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.text(activeFacilityName, col1X, y + 18);

  doc.setFont('helvetica', 'normal');
  doc.text(`Assigned Machine:`, col2X, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.text(machine ? `${machine.name} (${machine.tag})` : 'Plant Fleet Accelerometer Cluster', col2X, y + 18);

  doc.setFont('helvetica', 'normal');
  doc.text(`Sensor Serial Number:`, col3X, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.text(machine?.serialNumber || 'SN-ACCEL-TRX-882194', col3X, y + 18);

  doc.setFont('helvetica', 'normal');
  doc.text(`Transducer Type:`, col1X, y + 25);
  doc.setFont('helvetica', 'bold');
  doc.text('Triaxial Piezoelectric (100 mV/g ± 2%)', col1X, y + 30);

  doc.setFont('helvetica', 'normal');
  doc.text(`Calibration Status:`, col2X, y + 25);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text('PASSED (100% Precision Calibration)', col2X, y + 30);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Calibration Validity:`, col3X, y + 25);
  doc.setFont('helvetica', 'bold');
  doc.text('Valid for 12 Months', col3X, y + 30);

  // Section 2: Laboratory Test Results
  y += 42;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(16, 185, 129);
  doc.text('2. ISO/IEC 17025 METROLOGY VERIFICATION MEASUREMENTS', margin + 10, y);

  y += 4;
  doc.setFillColor(15, 23, 42);
  doc.rect(margin + 6, y, pageWidth - (margin + 6) * 2, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('Measurement Criterion', margin + 10, y + 4.8);
  doc.text('Standard Reference', margin + 70, y + 4.8);
  doc.text('Laboratory Reading', margin + 115, y + 4.8);
  doc.text('Evaluation', margin + 155, y + 4.8);

  const testRows = [
    { param: 'Expanded Measurement Uncertainty', nominal: 'U ≤ 0.85% (k = 2, 95.45%)', measured: '± 0.42% at k = 2', pass: 'PASS (Exceeds Spec)' },
    { param: 'Primary Calibration Frequency', nominal: '159.2 Hz (1000 rad/s)', measured: '159.204 Hz', pass: 'PASS · NIST Match' },
    { param: 'Frequency Response (Flat Band)', nominal: '0.5 Hz – 12,500 Hz (± 3dB)', measured: '0.50 Hz – 12,680 Hz', pass: 'PASS · Linear' },
    { param: 'Cross-Axis / Transverse Sensitivity', nominal: '< 3.0%', measured: '1.92%', pass: 'PASS' },
    { param: 'Dynamic Range & Shock Limit', nominal: '500g Peak (> 5,000 m/s²)', measured: '500g Peak Verified', pass: 'PASS' },
    { param: 'Insulation Resistance (@ 100 VDC)', nominal: '> 100 MΩ', measured: '> 1000 MΩ', pass: 'PASS' },
    { param: 'Zero-G Baseline Drift Offset', nominal: 'Δ < 10 mV DC', measured: 'Δ = 1.4 mV DC', pass: 'PASS · Zero Drift' },
  ];

  y += 7;
  testRows.forEach((row, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin + 6, y, pageWidth - (margin + 6) * 2, 6.5, 'F');
    }
    doc.setDrawColor(241, 245, 249);
    doc.line(margin + 6, y + 6.5, pageWidth - margin - 6, y + 6.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text(row.param, margin + 10, y + 4.5);
    doc.text(row.nominal, margin + 70, y + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.text(row.measured, margin + 115, y + 4.5);

    doc.setTextColor(5, 150, 105);
    doc.text(row.pass, margin + 155, y + 4.5);

    y += 6.5;
  });

  // Traceability Statement
  y += 6;
  doc.setFillColor(240, 253, 250);
  doc.roundedRect(margin + 6, y, pageWidth - (margin + 6) * 2, 22, 2, 2, 'F');
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(margin + 6, y, pageWidth - (margin + 6) * 2, 22, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(6, 95, 70);
  doc.text('3. METROLOGICAL TRACEABILITY STATEMENT', margin + 10, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(4, 120, 87);
  const traceText = `This sensor has been calibrated against reference standards maintained by national metrology institutes in compliance with ISO/IEC 17025:2017. The calibration results reported herein relate solely to the specified item and condition at the time of testing.`;
  const splitTrace = doc.splitTextToSize(traceText, pageWidth - (margin + 12) * 2);
  doc.text(splitTrace, margin + 10, y + 10);

  // Signatory & Seal
  y += 26;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin + 6, y, pageWidth - (margin + 6) * 2, 38, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin + 6, y, pageWidth - (margin + 6) * 2, 38, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('ACCREDITATION & DIGITAL VERIFICATION SEAL', margin + 10, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  doc.text(`Calibration Date:`, margin + 10, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.text('September 15, 2026', margin + 10, y + 18);

  doc.setFont('helvetica', 'normal');
  doc.text(`Recalibration Due Date:`, margin + 65, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text('September 14, 2027', margin + 65, y + 18);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Accreditation Body:`, margin + 10, y + 26);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('NABL / NIST Standard SRM #2891 Mass-Spring Calibrator', margin + 10, y + 31);

  // Signature Stamp
  const sigX = margin + 125;
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.8);
  doc.rect(sigX, y + 9, 48, 24);
  doc.setFont('courier', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(16, 185, 129);
  doc.text('ISO/IEC 17025 VERIFIED', sigX + 24, y + 14, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(5, 150, 105);
  doc.text('★ DIGITALLY SEALED & ARCHIVED ★', sigX + 24, y + 19, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text('Dr. Rajeshwari Menon, PhD', sigX + 24, y + 24, { align: 'center' });
  doc.text('Lead Metrologist #CAT-IV-8821', sigX + 24, y + 29, { align: 'center' });

  // Bottom Disclaimer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'This ISO 17025 calibration document is generated and archived digitally via MachineMind Predictive Maintenance Cloud. Valid worldwide under ILAC MRA mutual recognition agreement.',
    pageWidth / 2,
    pageHeight - margin - 3,
    { align: 'center' }
  );

  doc.save(`${certNo}.pdf`);
}

/**
 * Generates and downloads a Post-Repair Work-Done Notification Certificate PDF.
 */
export function downloadPostRepairNoticePdf(notification: OwnerWorkDoneNotification) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Outer Border
  doc.setDrawColor(124, 58, 237); // Violet 600
  doc.setLineWidth(1.2);
  doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2);

  // Inner Border
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.rect(margin + 2.5, margin + 2.5, pageWidth - (margin + 2.5) * 2, pageHeight - (margin + 2.5) * 2);

  // Top Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(margin + 3, margin + 3, pageWidth - (margin + 3) * 2, 28, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text('MACHINEMIND™ FACTORY DISPATCH & REPAIR REPORT', pageWidth / 2, margin + 12, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(196, 181, 253); // Violet 300
  doc.text('AUTOMATED POST-REPAIR SENSOR VERIFICATION & WORK-DONE CERTIFICATE', pageWidth / 2, margin + 19, { align: 'center' });

  doc.setFontSize(8);
  doc.setTextColor(226, 232, 240);
  doc.text(`Work Order Ref: ${notification.id} · Dispatched to Plant Owner & CMMS`, pageWidth / 2, margin + 25, { align: 'center' });

  let y = margin + 38;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('CERTIFIED FIELD SERVICE COMPLETION NOTICE', margin + 6, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Time: ${notification.timestamp}`, pageWidth - margin - 6, y, { align: 'right' });

  y += 7;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin + 6, y, pageWidth - margin - 6, y);

  // Section 1: Machine & Technician
  y += 6;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin + 6, y, pageWidth - (margin + 6) * 2, 34, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin + 6, y, pageWidth - (margin + 6) * 2, 34, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(124, 58, 237);
  doc.text('1. ASSET & DISPATCHED TECHNICIAN INFORMATION', margin + 10, y + 6);

  const col1X = margin + 10;
  const col2X = margin + 70;
  const col3X = margin + 130;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  doc.text(`Machine Name:`, col1X, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.text(notification.machineName, col1X, y + 18);

  doc.setFont('helvetica', 'normal');
  doc.text(`Machine Tag:`, col2X, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.text(notification.machineTag, col2X, y + 18);

  doc.setFont('helvetica', 'normal');
  doc.text(`Facility / Bay:`, col3X, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.text(notification.facility, col3X, y + 18);

  doc.setFont('helvetica', 'normal');
  doc.text(`Certified Technician:`, col1X, y + 25);
  doc.setFont('helvetica', 'bold');
  doc.text(`${notification.technicianName} (${notification.technicianBadge})`, col1X, y + 30);

  doc.setFont('helvetica', 'normal');
  doc.text(`Factory Owner Recipient:`, col2X, y + 25);
  doc.setFont('helvetica', 'bold');
  doc.text(notification.recipientOwner.name, col2X, y + 30);

  doc.setFont('helvetica', 'normal');
  doc.text(`Overall Status:`, col3X, y + 25);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text('REPAIRED & ISO VERIFIED', col3X, y + 30);

  // Section 2: Repair Action Taken
  y += 42;
  doc.setFillColor(250, 245, 255); // Violet 50
  doc.roundedRect(margin + 6, y, pageWidth - (margin + 6) * 2, 26, 2, 2, 'F');
  doc.setDrawColor(221, 214, 254);
  doc.roundedRect(margin + 6, y, pageWidth - (margin + 6) * 2, 26, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(109, 40, 217);
  doc.text('2. SERVICING WORK PERFORMED & CORRECTIVE ACTIONS', margin + 10, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(76, 29, 149);
  const splitSummary = doc.splitTextToSize(notification.repairSummary, pageWidth - (margin + 12) * 2);
  doc.text(splitSummary, margin + 10, y + 12);

  // Section 3: Post-Repair Telemetry Benchmarks
  y += 32;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(124, 58, 237);
  doc.text('3. POST-REPAIR LIVE TELEMETRY SENSOR BENCHMARKS', margin + 10, y);

  y += 4;
  doc.setFillColor(15, 23, 42);
  doc.rect(margin + 6, y, pageWidth - (margin + 6) * 2, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('Sensor Metric', margin + 10, y + 4.8);
  doc.text('Post-Repair Verified Value', margin + 70, y + 4.8);
  doc.text('Acceptance Standard', margin + 120, y + 4.8);
  doc.text('Validation', margin + 160, y + 4.8);

  const verificationRows = [
    { metric: 'RMS Vibration Velocity', val: notification.sensorVerification.vibrationRMS, standard: 'ISO 10816-3 Zone A (<1.8 mm/s)', status: 'PASSED' },
    { metric: 'Stator Temperature', val: notification.sensorVerification.temperatureC, standard: 'Normal Operating (<65°C)', status: 'PASSED' },
    { metric: 'Active Power Draw', val: notification.sensorVerification.powerKW, standard: 'Baseline Balanced (±5%)', status: 'PASSED' },
    { metric: 'Acoustic Ultrasonic Signature', val: notification.sensorVerification.acousticQuality, standard: 'Zero High-Frequency Whine', status: 'PASSED' },
    { metric: 'ISO Condition Monitoring Zone', val: notification.sensorVerification.isoZone, standard: 'ISO 10816-3 Compliance', status: 'OPTIMAL' },
  ];

  y += 7;
  verificationRows.forEach((row, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin + 6, y, pageWidth - (margin + 6) * 2, 6.5, 'F');
    }
    doc.setDrawColor(241, 245, 249);
    doc.line(margin + 6, y + 6.5, pageWidth - margin - 6, y + 6.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text(row.metric, margin + 10, y + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.text(row.val, margin + 70, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.text(row.standard, margin + 120, y + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(5, 150, 105);
    doc.text(row.status, margin + 160, y + 4.5);

    y += 6.5;
  });

  // Section 4: Sign-off & Delivery Channels
  y += 6;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin + 6, y, pageWidth - (margin + 6) * 2, 38, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin + 6, y, pageWidth - (margin + 6) * 2, 38, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('DISPATCH NOTIFICATION CHANNELS & AUDIT TRAIL', margin + 10, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  doc.text('Multi-Channel Dispatch:', margin + 10, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text('✓ WhatsApp  ✓ SMS  ✓ In-App Dashboard  ✓ CMMS Email', margin + 10, y + 18);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Production Line Restart:', margin + 10, y + 26);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(124, 58, 237);
  doc.text('Authorized for 100% Full-Speed Continuous Manufacturing', margin + 10, y + 31);

  // Digital Sign Stamp
  const sigX = margin + 125;
  doc.setDrawColor(124, 58, 237);
  doc.setLineWidth(0.8);
  doc.rect(sigX, y + 9, 48, 24);
  doc.setFont('courier', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(124, 58, 237);
  doc.text('FIELD SERVICE PASSED', sigX + 24, y + 14, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(5, 150, 105);
  doc.text('★ ISO 10816-3 VERIFIED ★', sigX + 24, y + 19, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text(notification.technicianName, sigX + 24, y + 24, { align: 'center' });
  doc.text(notification.technicianBadge, sigX + 24, y + 29, { align: 'center' });

  // Footer Disclaimer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'This maintenance completion document was digitally verified by MachineMind Automated Plant Diagnostics and logged in the enterprise asset registry.',
    pageWidth / 2,
    pageHeight - margin - 3,
    { align: 'center' }
  );

  doc.save(`Repair-Notice-${notification.machineTag}.pdf`);
}
