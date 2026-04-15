// Types for authentication
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  user?: any; // Use any for flexibility since server may return different formats
  message?: string;
}

export interface User {
  Id: string;
  Email: string;
  FullName: string;
  PhoneNumber: string;
  RoleId: number;
  StatusId: number;
  JamatKhanaIds: string[];
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt: string | null;
}

export interface UsersResponse {
  Users: User[];
  Pagination: {
    Total: number;
    Page: number;
    TotalPages: number;
    PageSize: number;
    HasNext: boolean;
    HasPrevious: boolean;
    NextPage: number | null;
    PreviousPage: number | null;
  };
}

export interface Jamatkhana {
  id: string;
  name: string;
}

// Types for forms/applications
export interface FormData {
  FormId: string;
  EnumeratorId: string;
  JamatKhanaId: string;
  HouseHoldCNIC: string | null;
  HouseOwnership: boolean;
  FamilyIncomeSourcesIds: number[];
  FamilyIncomeBands?: { [key: number]: number };
  IncomeBandId?: number;
  FamilyMembersInPakistan: number;
  FamilyMembersOutsidePakistan: number;
  FamilyMembersCNICInPakistan: string[];
  FormStatus: number;
  RejectReasonId: string | null;
  RejectReasonText: string | null;
  RejectedBy: string | null;
  CreatedAt: string;
  UpdatedAt: string;
  FamilyMembers: FamilyMember[];
}

export interface FamilyMember {
  IdTypeId: number;
  IdNumber: string;
  FullName: string;
  GenderId: number;
  MonthYearOfBirth: string;
  MobileNumber: string;
  RelationshipToHeadId: number;
  MaritalStatusId: number;
  CommunityAffiliation: boolean;
  IsStudying: boolean;
  NotStudyingReasonId: number | null;
  SchoolTypeId: number | null;
  SchoolName: string | null;
  LevelId: number | null;
  GradeId: number | null;
  Grade: string | null;
  ExaminationBoardId: number | null;
  ExaminationBoard: string | null;
  StreamId: number | null;
  UniversityId: number | null;
  UniversityModeId: number | null;
  SectorId: number | null;
  Degree: string | null;
  TechnicalInstitutionName: string | null;
  TechnicalField: string | null;
  TechnicalDuration: string | null;
  Fees: number | null;
  BankAccount: string | null;
  BankName: string | null;
  BankTypeId: number | null;
  HealthInsurance: boolean;
  OccupationTypeId: number | null;
  EarningStatus: boolean;
  NoEarningReasonId: number | null;
  EarningTypeId: number | null;
  EmploymentTypeId: number | null;
  Industry: string | null;
  IncomeBandId: number | null;
  Id: number;
  FormId: string;
  CreatedAt: string;
  UpdatedAt: string;
}

// Dynamic lookup data interface
export interface LookupData {
  [key: string]: { Id: number; Name: string }[];
}

// Alert types
export type AlertType = 'error' | 'warning' | 'success' | 'info';

export interface AlertState {
  type: AlertType;
  title: string;
  message: string;
  isVisible: boolean;
}

// API Error
export interface ApiError {
  detail?: Array<{
    type: string;
    loc: string[];
    msg: string;
    input: any;
  }>;
  message?: string;
}

// User profile for header
export interface UserProfile {
  name: string;
  email: string;
  initial: string;
  notificationCount: string;
  role?: number;
  jamatKhanaIds?: string[];
}
