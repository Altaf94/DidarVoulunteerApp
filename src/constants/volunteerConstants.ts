// ============================================
// VOLUNTEER MANAGEMENT SYSTEM - CONSTANTS & MASTER DATA
// Didar Mubarak Pakistan
// ============================================

import {
  Region,
  UserRole,
  UserLevel,
  AccessLevel,
  DataSource,
  VolunteerStatus,
  PrintStatus,
  Event,
  DutyType,
  ACCESS_LEVEL_BAND_COLORS,
  ACCESS_LEVEL_NAMES,
} from '../types/volunteer';

// ============================================
// REGION CONFIGURATION
// ============================================

export const REGIONS = [
  { value: Region.GILGIT, label: 'Gilgit', code: 'GLT' },
  { value: Region.HUNZA, label: 'Hunza', code: 'HNZ' },
  { value: Region.GUPIS, label: 'Gupis', code: 'GPS' },
  { value: Region.ISHKOMAN, label: 'Ishkoman', code: 'ISH' },
  { value: Region.LOWER_CHITRAL, label: 'Lower Chitral', code: 'LCH' },
  { value: Region.UPPER_CHITRAL, label: 'Upper Chitral', code: 'UCH' },
];

export const getRegionLabel = (region: Region): string => {
  return REGIONS.find(r => r.value === region)?.label || region;
};

export const getRegionCode = (region: Region): string => {
  return REGIONS.find(r => r.value === region)?.code || region.substring(0, 3).toUpperCase();
};

// ============================================
// USER ROLES & LEVELS
// ============================================

export const USER_ROLES = [
  {
    value: UserRole.VIEW_ONLY,
    label: 'View Only',
    description: 'Can access dashboards and monitor progress',
    permissions: {
      canUpload: false,
      canApprove: false,
      canReject: false,
      canPrint: false,
      canDispatch: false,
      canViewDashboard: true,
      canViewAllRegions: false,
    },
  },
  {
    value: UserRole.MAKER,
    label: 'Maker',
    description: 'Can upload data, validate, and submit records',
    permissions: {
      canUpload: true,
      canApprove: true,
      canReject: true,
      canPrint: false,
      canDispatch: false,
      canViewDashboard: true,
      canViewAllRegions: false,
    },
  },
  {
    value: UserRole.CHECKER,
    label: 'Checker',
    description: 'Can review, approve, print badges, and dispatch',
    permissions: {
      canUpload: false,
      canApprove: true,
      canReject: true,
      canPrint: true,
      canDispatch: true,
      canViewDashboard: true,
      canViewAllRegions: false,
    },
  },
];

export const USER_LEVELS = [
  { value: UserLevel.NATIONAL, label: 'National Level', canViewAllRegions: true },
  { value: UserLevel.REGIONAL, label: 'Regional Level', canViewAllRegions: false },
  { value: UserLevel.LOCAL, label: 'Local Level', canViewAllRegions: false },
];

export const getRoleLabel = (role: UserRole): string => {
  return USER_ROLES.find(r => r.value === role)?.label || role;
};

export const getLevelLabel = (level: UserLevel): string => {
  return USER_LEVELS.find(l => l.value === level)?.label || level;
};

// ============================================
// EVENTS (MASTER DATA - 9 EVENTS)
// ============================================

export const EVENTS: Event[] = [
  {
    id: 'event-1',
    eventNumber: 1,
    name: 'Didar Mubarak - Day 1',
    description: 'First day of Didar Mubarak program',
    location: 'Main Venue - Gilgit',
    date: '2026-05-01',
    isActive: true,
    requiredVolunteers: 500,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'event-2',
    eventNumber: 2,
    name: 'Didar Mubarak - Day 2',
    description: 'Second day of Didar Mubarak program',
    location: 'Main Venue - Gilgit',
    date: '2026-05-02',
    isActive: true,
    requiredVolunteers: 500,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'event-3',
    eventNumber: 3,
    name: 'Didar Mubarak - Day 3',
    description: 'Third day of Didar Mubarak program',
    location: 'Main Venue - Gilgit',
    date: '2026-05-03',
    isActive: true,
    requiredVolunteers: 500,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'event-4',
    eventNumber: 4,
    name: 'Didar Mubarak - Day 4',
    description: 'Fourth day of Didar Mubarak program',
    location: 'Main Venue - Hunza',
    date: '2026-05-04',
    isActive: true,
    requiredVolunteers: 450,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'event-5',
    eventNumber: 5,
    name: 'Didar Mubarak - Day 5',
    description: 'Fifth day of Didar Mubarak program',
    location: 'Main Venue - Hunza',
    date: '2026-05-05',
    isActive: true,
    requiredVolunteers: 450,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'event-6',
    eventNumber: 6,
    name: 'Didar Mubarak - Day 6',
    description: 'Sixth day of Didar Mubarak program',
    location: 'Main Venue - Chitral',
    date: '2026-05-06',
    isActive: true,
    requiredVolunteers: 400,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'event-7',
    eventNumber: 7,
    name: 'Didar Mubarak - Day 7',
    description: 'Seventh day of Didar Mubarak program',
    location: 'Main Venue - Chitral',
    date: '2026-05-07',
    isActive: true,
    requiredVolunteers: 400,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'event-8',
    eventNumber: 8,
    name: 'Didar Mubarak - Day 8',
    description: 'Eighth day of Didar Mubarak program',
    location: 'Main Venue - Ishkoman',
    date: '2026-05-08',
    isActive: true,
    requiredVolunteers: 350,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'event-9',
    eventNumber: 9,
    name: 'Didar Mubarak - Grand Finale',
    description: 'Final day of Didar Mubarak program',
    location: 'Main Venue - Gilgit',
    date: '2026-05-09',
    isActive: true,
    requiredVolunteers: 600,
    createdAt: '2026-01-01T00:00:00Z',
  },
];

export const getEventById = (id: string): Event | undefined => {
  return EVENTS.find(e => e.id === id);
};

export const getEventByNumber = (number: number): Event | undefined => {
  return EVENTS.find(e => e.eventNumber === number);
};

// ============================================
// ACCESS LEVELS
// ============================================

export const ACCESS_LEVELS = [
  {
    value: AccessLevel.STAGE,
    label: ACCESS_LEVEL_NAMES[AccessLevel.STAGE],
    bandColor: ACCESS_LEVEL_BAND_COLORS[AccessLevel.STAGE],
    description: 'Most restricted - Stage area access only',
    sortOrder: 1,
  },
  {
    value: AccessLevel.PANDAL,
    label: ACCESS_LEVEL_NAMES[AccessLevel.PANDAL],
    bandColor: ACCESS_LEVEL_BAND_COLORS[AccessLevel.PANDAL],
    description: 'Pandal area access',
    sortOrder: 2,
  },
  {
    value: AccessLevel.OUTSIDE_HOLDING_AREA,
    label: ACCESS_LEVEL_NAMES[AccessLevel.OUTSIDE_HOLDING_AREA],
    bandColor: ACCESS_LEVEL_BAND_COLORS[AccessLevel.OUTSIDE_HOLDING_AREA],
    description: 'Outside holding area access',
    sortOrder: 3,
  },
  {
    value: AccessLevel.OUTSIDE_AREA,
    label: ACCESS_LEVEL_NAMES[AccessLevel.OUTSIDE_AREA],
    bandColor: ACCESS_LEVEL_BAND_COLORS[AccessLevel.OUTSIDE_AREA],
    description: 'Outside area access',
    sortOrder: 4,
  },
  {
    value: AccessLevel.HEALTH_AREA,
    label: ACCESS_LEVEL_NAMES[AccessLevel.HEALTH_AREA],
    bandColor: ACCESS_LEVEL_BAND_COLORS[AccessLevel.HEALTH_AREA],
    description: 'Health/Medical area access',
    sortOrder: 5,
  },
];

export const getAccessLevelLabel = (level: AccessLevel): string => {
  return ACCESS_LEVEL_NAMES[level] || `Level ${level}`;
};

export const getAccessLevelColor = (level: AccessLevel): string => {
  return ACCESS_LEVEL_BAND_COLORS[level] || '#808080';
};

// ============================================
// DUTY TYPES
// ============================================

export const DUTY_TYPES: DutyType[] = [
  // Stage Duties
  { id: 'duty-1', name: 'Reciter', code: 'RCT', accessLevel: AccessLevel.STAGE, isActive: true },
  
  // Pandal Duties
  { id: 'duty-2', name: 'Security', code: 'SEC', accessLevel: AccessLevel.PANDAL, isActive: true },
  { id: 'duty-3', name: 'Carpet Area', code: 'CRP', accessLevel: AccessLevel.PANDAL, isActive: true },
  { id: 'duty-4', name: 'Near Stage', code: 'NRS', accessLevel: AccessLevel.PANDAL, isActive: true },
  { id: 'duty-5', name: 'Water Services', code: 'WTR', accessLevel: AccessLevel.PANDAL, isActive: true },
  { id: 'duty-6', name: 'Washroom', code: 'WSH', accessLevel: AccessLevel.PANDAL, isActive: true },
  
  // Outside Holding Area Duties
  { id: 'duty-7', name: 'Crowd Management', code: 'CRD', accessLevel: AccessLevel.OUTSIDE_HOLDING_AREA, isActive: true },
  { id: 'duty-8', name: 'Queue Management', code: 'QUE', accessLevel: AccessLevel.OUTSIDE_HOLDING_AREA, isActive: true },
  { id: 'duty-9', name: 'Entry Control', code: 'ENT', accessLevel: AccessLevel.OUTSIDE_HOLDING_AREA, isActive: true },
  
  // Outside Area Duties
  { id: 'duty-10', name: 'Parking', code: 'PRK', accessLevel: AccessLevel.OUTSIDE_AREA, isActive: true },
  { id: 'duty-11', name: 'Traffic Control', code: 'TRF', accessLevel: AccessLevel.OUTSIDE_AREA, isActive: true },
  { id: 'duty-12', name: 'Outer Security', code: 'OSC', accessLevel: AccessLevel.OUTSIDE_AREA, isActive: true },
  
  // Health Area Duties
  { id: 'duty-13', name: 'Doctor', code: 'DOC', accessLevel: AccessLevel.HEALTH_AREA, isActive: true },
  { id: 'duty-14', name: 'Nurse', code: 'NRS', accessLevel: AccessLevel.HEALTH_AREA, isActive: true },
  { id: 'duty-15', name: 'First Aid', code: 'FAD', accessLevel: AccessLevel.HEALTH_AREA, isActive: true },
  { id: 'duty-16', name: 'Ambulance', code: 'AMB', accessLevel: AccessLevel.HEALTH_AREA, isActive: true },
];

export const getDutyTypeById = (id: string): DutyType | undefined => {
  return DUTY_TYPES.find(d => d.id === id);
};

export const getDutyTypeByName = (name: string): DutyType | undefined => {
  return DUTY_TYPES.find(d => d.name.toLowerCase() === name.toLowerCase());
};

export const getDutyTypesByAccessLevel = (accessLevel: AccessLevel): DutyType[] => {
  return DUTY_TYPES.filter(d => d.accessLevel === accessLevel && d.isActive);
};

// ============================================
// DATA SOURCES
// ============================================

export const DATA_SOURCES = [
  {
    value: DataSource.LOCAL_COUNCIL,
    label: 'Local Council',
    description: 'Volunteer data from Local Councils',
  },
  {
    value: DataSource.REGIONAL_EVENT_MANAGER,
    label: 'Regional Event Manager',
    description: 'Volunteer data from Regional Event Managers',
  },
  {
    value: DataSource.ITREB,
    label: 'ITREB',
    description: 'Reciters for Stage Area',
  },
  {
    value: DataSource.HEALTH_BOARD,
    label: 'Health Board',
    description: 'Doctors & Nurses for Health Area',
  },
];

export const getDataSourceLabel = (source: DataSource): string => {
  return DATA_SOURCES.find(s => s.value === source)?.label || source;
};

// ============================================
// VOLUNTEER STATUS
// ============================================

export const VOLUNTEER_STATUSES = [
  { value: VolunteerStatus.PENDING, label: 'Pending', color: '#FEF3C7', textColor: '#92400E' },
  { value: VolunteerStatus.VALID, label: 'Valid', color: '#D1FAE5', textColor: '#065F46' },
  { value: VolunteerStatus.REJECTED, label: 'Rejected', color: '#FEE2E2', textColor: '#991B1B' },
  { value: VolunteerStatus.DISCREPANT, label: 'Discrepant', color: '#FED7AA', textColor: '#9A3412' },
  { value: VolunteerStatus.SUBMITTED, label: 'Submitted', color: '#DBEAFE', textColor: '#1E40AF' },
  { value: VolunteerStatus.APPROVED, label: 'Approved', color: '#D1FAE5', textColor: '#065F46' },
  { value: VolunteerStatus.PRINTED, label: 'Printed', color: '#E0E7FF', textColor: '#3730A3' },
  { value: VolunteerStatus.DISPATCHED, label: 'Dispatched', color: '#C4B5FD', textColor: '#5B21B6' },
];

export const getStatusConfig = (status: VolunteerStatus) => {
  return VOLUNTEER_STATUSES.find(s => s.value === status) || VOLUNTEER_STATUSES[0];
};

// ============================================
// PRINT STATUS
// ============================================

export const PRINT_STATUSES = [
  { value: PrintStatus.NOT_PRINTED, label: 'Not Printed', color: '#F3F4F6', textColor: '#374151' },
  { value: PrintStatus.PRINTING, label: 'Printing', color: '#FEF3C7', textColor: '#92400E' },
  { value: PrintStatus.PRINTED, label: 'Printed', color: '#D1FAE5', textColor: '#065F46' },
  { value: PrintStatus.DISPATCHED, label: 'Dispatched', color: '#C4B5FD', textColor: '#5B21B6' },
];

export const getPrintStatusConfig = (status: PrintStatus) => {
  return PRINT_STATUSES.find(s => s.value === status) || PRINT_STATUSES[0];
};

// ============================================
// EXCEL UPLOAD TEMPLATE
// ============================================

export const EXCEL_TEMPLATE_COLUMNS = [
  { key: 'cnic', label: 'CNIC', required: true, example: '12345-1234567-1' },
  { key: 'name', label: 'Name', required: true, example: 'Ali Ahmed Khan' },
  { key: 'eventNumber', label: 'Event Number', required: true, example: '1' },
  { key: 'dutyType', label: 'Duty Type', required: true, example: 'Security' },
  { key: 'accessLevel', label: 'Access Level', required: true, example: '2' },
];

// ============================================
// VALIDATION MESSAGES
// ============================================

export const VALIDATION_MESSAGES = {
  CNIC_NOT_FOUND: 'CNIC not found in Enrollment System - Record Rejected',
  DUPLICATE_SAME_DUTY: 'Duplicate: Same person already assigned this duty in this event - Record Rejected',
  DISCREPANT_DIFFERENT_DUTIES: 'Warning: Same person assigned different duties in same event - Marked as Discrepant',
  DISCREPANT_MULTIPLE_TEAMS: 'Warning: Person assigned by multiple sources - Marked as Discrepant',
  DISCREPANT_MULTIPLE_EVENTS: 'Info: Person assigned across different events - Marked as Discrepant (Allowed but flagged)',
};

// ============================================
// DASHBOARD THRESHOLDS
// ============================================

export const DASHBOARD_THRESHOLDS = {
  LOW: 30,
  MEDIUM: 60,
  HIGH: 90,
};

export const getProgressColor = (percentage: number): string => {
  if (percentage >= DASHBOARD_THRESHOLDS.HIGH) return '#10B981'; // Green
  if (percentage >= DASHBOARD_THRESHOLDS.MEDIUM) return '#F59E0B'; // Yellow
  if (percentage >= DASHBOARD_THRESHOLDS.LOW) return '#F97316'; // Orange
  return '#EF4444'; // Red
};
