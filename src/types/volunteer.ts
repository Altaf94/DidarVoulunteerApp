// ============================================
// VOLUNTEER MANAGEMENT SYSTEM - TYPE DEFINITIONS
// Didar Mubarak Pakistan
// ============================================

// ============================================
// ENUMS & CONSTANTS
// ============================================

export enum Region {
  GILGIT = 'gilgit',
  HUNZA = 'hunza',
  GUPIS = 'gupis',
  ISHKOMAN = 'ishkoman',
  LOWER_CHITRAL = 'lower_chitral',
  UPPER_CHITRAL = 'upper_chitral',
}

export enum UserLevel {
  NATIONAL = 'national',
  REGIONAL = 'regional',
  LOCAL = 'local',
}

export enum UserRole {
  VIEW_ONLY = 'view_only',
  MAKER = 'maker',
  CHECKER = 'checker',
}

export enum AccessLevel {
  STAGE = 1,
  PANDAL = 2,
  OUTSIDE_HOLDING_AREA = 3,
  OUTSIDE_AREA = 4,
  HEALTH_AREA = 5,
}

export enum VolunteerStatus {
  PENDING = 'pending',
  VALID = 'valid',
  REJECTED = 'rejected',
  DISCREPANT = 'discrepant',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  PRINTED = 'printed',
  DISPATCHED = 'dispatched',
}

export enum ValidationError {
  CNIC_NOT_FOUND = 'cnic_not_found',
  DUPLICATE_SAME_DUTY = 'duplicate_same_duty',
  DISCREPANT_DIFFERENT_DUTIES = 'discrepant_different_duties',
  DISCREPANT_MULTIPLE_TEAMS = 'discrepant_multiple_teams',
  DISCREPANT_MULTIPLE_EVENTS = 'discrepant_multiple_events',
}

export enum DataSource {
  LOCAL_COUNCIL = 'local_council',
  REGIONAL_EVENT_MANAGER = 'regional_event_manager',
  ITREB = 'itreb',
  HEALTH_BOARD = 'health_board',
}

export enum PrintStatus {
  NOT_PRINTED = 'not_printed',
  PRINTING = 'printing',
  PRINTED = 'printed',
  DISPATCHED = 'dispatched',
}

// ============================================
// ORGANIZATIONAL STRUCTURE
// ============================================

export interface NationalCouncil {
  id: string;
  name: string;
  code: string;
  createdAt: string;
}

export interface RegionalCouncil {
  id: string;
  nationalCouncilId: string;
  name: string;
  code: string;
  region: Region;
  createdAt: string;
}

export interface LocalCouncil {
  id: string;
  regionalCouncilId: string;
  name: string;
  code: string;
  createdAt: string;
}

export interface JamatKhana {
  id: string;
  localCouncilId: string;
  name: string;
  code: string;
  region: Region;
  isActive: boolean;
  createdAt: string;
}

// ============================================
// USER MANAGEMENT
// ============================================

export interface VolunteerUser {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: UserRole;
  level: UserLevel;
  region?: Region;
  localCouncilId?: string;
  permissions: UserPermissions;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserPermissions {
  canUpload: boolean;
  canApprove: boolean;
  canReject: boolean;
  canPrint: boolean;
  canDispatch: boolean;
  canViewDashboard: boolean;
  canViewAllRegions: boolean;
  regions?: Region[];
}

// ============================================
// EVENT MANAGEMENT
// ============================================

export interface Event {
  id: string;
  eventNumber: number;
  name: string;
  description: string;
  location: string;
  date: string;
  isActive: boolean;
  requiredVolunteers: number;
  createdAt: string;
  updatedAt?: string;
}

// ============================================
// DUTY TYPES
// ============================================

export interface DutyType {
  id: string;
  name: string;
  code: string;
  accessLevel: AccessLevel;
  description?: string;
  isActive: boolean;
}

// Predefined duty types mapped to access levels
export const DUTY_TYPES_BY_ACCESS: Record<AccessLevel, string[]> = {
  [AccessLevel.STAGE]: ['Reciter'],
  [AccessLevel.PANDAL]: [
    'Security',
    'Carpet Area',
    'Near Stage',
    'Water Services',
    'Washroom',
  ],
  [AccessLevel.OUTSIDE_HOLDING_AREA]: [
    'Crowd Management',
    'Queue Management',
    'Entry Control',
  ],
  [AccessLevel.OUTSIDE_AREA]: [
    'Parking',
    'Traffic Control',
    'Outer Security',
  ],
  [AccessLevel.HEALTH_AREA]: [
    'Doctor',
    'Nurse',
    'First Aid',
    'Ambulance',
  ],
};

// ============================================
// VOLUNTEER DATA
// ============================================

export interface Volunteer {
  id: string;
  volunteerId: string; // Unique ID per CNIC (persists across events)
  cnic: string;
  name: string;
  eventId: string;
  eventNumber: number;
  dutyTypeId: string;
  dutyTypeName: string;
  accessLevel: AccessLevel;
  accessLevelName: string;
  region: Region;
  source: DataSource;
  sourceEntityId: string; // Local Council / ITREB / Health Board ID
  sourceEntityName: string;
  uploadBatchId: string;
  status: VolunteerStatus;
  validationErrors: ValidationResult[];
  printStatus: PrintStatus;
  printBatchId?: string;
  packageId?: string;
  cnicVerified: boolean;
  submittedAt?: string;
  submittedBy?: string;
  approvedAt?: string;
  approvedBy?: string;
  printedAt?: string;
  printedBy?: string;
  dispatchedAt?: string;
  dispatchedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface VolunteerUploadRow {
  cnic: string;
  name: string;
  eventNumber: number;
  dutyType: string;
  accessLevel: number;
  rowNumber: number;
}

export interface UploadBatch {
  id: string;
  fileName: string;
  region: Region;
  uploadedBy: string;
  uploadedByName: string;
  totalRecords: number;
  validRecords: number;
  rejectedRecords: number;
  discrepantRecords: number;
  status: 'processing' | 'completed' | 'failed';
  source: DataSource;
  sourceEntityId: string;
  sourceEntityName: string;
  createdAt: string;
  processedAt?: string;
}

// ============================================
// VALIDATION
// ============================================

export interface ValidationResult {
  isValid: boolean;
  errorType?: ValidationError;
  errorMessage?: string;
  conflictingRecords?: string[];
  details?: Record<string, any>;
}

export interface CNICValidationResponse {
  isValid: boolean;
  isRegistered: boolean;
  name?: string;
  message?: string;
}

export interface BulkValidationResult {
  batchId: string;
  totalRecords: number;
  validRecords: Volunteer[];
  rejectedRecords: VolunteerWithError[];
  discrepantRecords: VolunteerWithError[];
}

export interface VolunteerWithError extends Volunteer {
  errors: ValidationResult[];
}

// ============================================
// PRINTING & DISPATCH
// ============================================

export interface Badge {
  volunteerId: string;
  volunteerName: string;
  cnic: string;
  eventName: string;
  eventNumber: number;
  dutyType: string;
  accessLevel: AccessLevel;
  accessLevelName: string;
  bandColor: string;
  qrCode: string;
  printedAt?: string;
}

export interface PrintBatch {
  id: string;
  region: Region;
  volunteerIds: string[];
  totalBadges: number;
  printedBy: string;
  printedByName: string;
  status: 'pending' | 'printing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
}

export interface CoveringSheet {
  id: string;
  printBatchId: string;
  region: Region;
  accessLevel: AccessLevel;
  bandColor: string;
  volunteers: CoveringSheetEntry[];
  generatedAt: string;
  generatedBy: string;
}

export interface CoveringSheetEntry {
  cnic: string;
  name: string;
  volunteerId: string;
  receivingSignature?: string;
}

export interface DispatchPackage {
  id: string;
  printBatchIds: string[];
  region: Region;
  destination: DataSource;
  destinationEntityId: string;
  destinationEntityName: string;
  totalBadges: number;
  totalBands: number;
  coveringSheetIds: string[];
  status: 'preparing' | 'ready' | 'dispatched' | 'received';
  preparedBy: string;
  dispatchedAt?: string;
  dispatchedBy?: string;
  receivedAt?: string;
  receivedBy?: string;
  createdAt: string;
}

// Band colors mapped to access levels
export const ACCESS_LEVEL_BAND_COLORS: Record<AccessLevel, string> = {
  [AccessLevel.STAGE]: '#FFD700', // Gold
  [AccessLevel.PANDAL]: '#4169E1', // Royal Blue
  [AccessLevel.OUTSIDE_HOLDING_AREA]: '#32CD32', // Lime Green
  [AccessLevel.OUTSIDE_AREA]: '#FFA500', // Orange
  [AccessLevel.HEALTH_AREA]: '#FF0000', // Red
};

export const ACCESS_LEVEL_NAMES: Record<AccessLevel, string> = {
  [AccessLevel.STAGE]: 'Stage',
  [AccessLevel.PANDAL]: 'Pandal',
  [AccessLevel.OUTSIDE_HOLDING_AREA]: 'Outside Holding Area',
  [AccessLevel.OUTSIDE_AREA]: 'Outside Area',
  [AccessLevel.HEALTH_AREA]: 'Health Area',
};

// ============================================
// DASHBOARD & ANALYTICS
// ============================================

export interface DashboardStats {
  region?: Region;
  totalRequired: number;
  totalReceived: number;
  totalValidated: number;
  totalApproved: number;
  totalPrinted: number;
  totalDispatched: number;
  receivedPercentage: number;
  printedPercentage: number;
  byAccessLevel: AccessLevelStats[];
  byEvent: EventStats[];
  byRegion?: RegionStats[];
}

export interface AccessLevelStats {
  accessLevel: AccessLevel;
  accessLevelName: string;
  required: number;
  received: number;
  printed: number;
}

export interface EventStats {
  eventId: string;
  eventName: string;
  eventNumber: number;
  required: number;
  received: number;
  printed: number;
}

export interface RegionStats {
  region: Region;
  regionName: string;
  required: number;
  received: number;
  printed: number;
  receivedPercentage: number;
  printedPercentage: number;
}

// ============================================
// API RESPONSES
// ============================================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface VolunteersResponse extends PaginatedResponse<Volunteer> {}
export interface EventsResponse extends PaginatedResponse<Event> {}
export interface UploadBatchesResponse extends PaginatedResponse<UploadBatch> {}

// ============================================
// FILTERS
// ============================================

export interface VolunteerFilters {
  region?: Region;
  eventId?: string;
  status?: VolunteerStatus;
  accessLevel?: AccessLevel;
  dutyTypeId?: string;
  source?: DataSource;
  printStatus?: PrintStatus;
  cnic?: string;
  name?: string;
  uploadBatchId?: string;
  page?: number;
  pageSize?: number;
}

export interface DashboardFilters {
  region?: Region;
  eventId?: string;
  dateFrom?: string;
  dateTo?: string;
}

// ============================================
// FORM DATA
// ============================================

export interface VolunteerUploadFormData {
  file: any; // File object for Excel upload
  region: Region;
  source: DataSource;
  sourceEntityId: string;
}

export interface VolunteerApprovalFormData {
  volunteerIds: string[];
  action: 'approve' | 'reject';
  reason?: string;
}

export interface PrintBatchFormData {
  volunteerIds: string[];
  region: Region;
}

export interface DispatchFormData {
  printBatchIds: string[];
  destination: DataSource;
  destinationEntityId: string;
}
