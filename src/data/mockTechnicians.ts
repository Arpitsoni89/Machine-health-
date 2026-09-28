import { TechnicianInfo } from '../types';

export const MOCK_TECHNICIANS: TechnicianInfo[] = [
  {
    id: 'tech-01',
    name: 'Vikram "Vik" Rathore',
    badgeId: 'TECH-IND-4091',
    avatar: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=150&auto=format&fit=crop&q=80',
    role: 'Senior Precision Millwright & Vibration Analyst',
    certification: 'ISO 18436-2 Category III Vibration, ASNT Level II NDT',
    phone: '+91 98201 44102',
    radioChannel: 'UHF Ch 4 (Line 2 Operations)',
    shift: 'Morning Shift Alpha (06:00 - 14:30)',
    etaMinutes: 4,
    status: 'en_route',
    assignedAt: 'Just now',
    repairNotes: 'Standard protocol: Inspect shaft runout, re-grease drive-end bearing with high-viscosity polyurea grease, retorque foot bolts to 180 Nm.',
  },
  {
    id: 'tech-02',
    name: 'Pooja Sharma',
    badgeId: 'TECH-IND-3208',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    role: 'Lead Electrical Drives & Power Reliability Specialist',
    certification: 'Certified Reliability Leader (CRL), IEEE Stator Diagnostics',
    phone: '+91 97110 33819',
    radioChannel: 'UHF Ch 2 (Electrical Switchgear)',
    shift: 'General Production Shift (08:30 - 17:00)',
    etaMinutes: 6,
    status: 'en_route',
    assignedAt: 'Just now',
    repairNotes: 'Standard protocol: Check phase balance on VFD inverter output, inspect stator winding resistance, clean cooling fins.',
  },
  {
    id: 'tech-03',
    name: 'Arjun Deshmukh',
    badgeId: 'TECH-IND-5114',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'Precision Fluid Power & Hydraulic System Master',
    certification: 'IFPS Certified Fluid Power Master Specialist',
    phone: '+91 94520 88231',
    radioChannel: 'UHF Ch 6 (Hydraulics & Pressure Systems)',
    shift: 'Quick-Response Rapid Repair Crew (24/7 Hot-Swap)',
    etaMinutes: 3,
    status: 'en_route',
    assignedAt: 'Just now',
    repairNotes: 'Standard protocol: Inspect suction strainer for aeration/sludge, purge trapped air bubbles, verify oil viscosity at 55°C operating temp.',
  },
];

export function getRecommendedTechnician(machineCategory: string): TechnicianInfo {
  if (machineCategory === 'power_systems') {
    return { ...MOCK_TECHNICIANS[1], assignedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
  }
  if (machineCategory === 'production_lines') {
    return { ...MOCK_TECHNICIANS[2], assignedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
  }
  return { ...MOCK_TECHNICIANS[0], assignedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
}
