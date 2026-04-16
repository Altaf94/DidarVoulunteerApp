// ============================================
// VOLUNTEER MANAGEMENT SYSTEM - CONTEXT
// Didar Mubarak Pakistan
// ============================================

import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  ReactNode,
  useEffect,
} from 'react';
import volunteerApiService from '../services/volunteerApi';
import {
  Volunteer,
  VolunteerFilters,
  UploadBatch,
  DashboardStats,
  Event,
  DutyType,
  Region,
  VolunteerStatus,
  PrintBatch,
  DispatchPackage,
  CoveringSheet,
  LocalCouncil,
  JamatKhana,
  VolunteerUploadFormData,
  VolunteerApprovalFormData,
  PrintBatchFormData,
  DispatchFormData,
  DashboardFilters,
  UserRole,
  UserLevel,
} from '../types/volunteer';
import { EVENTS, DUTY_TYPES } from '../constants/volunteerConstants';

// ============================================
// CONTEXT STATE INTERFACE
// ============================================

interface VolunteerContextState {
  // User info
  userRole: UserRole;
  userLevel: UserLevel;
  userRegion?: Region;
  
  // Volunteers
  volunteers: Volunteer[];
  volunteersLoading: boolean;
  volunteersError: string | null;
  volunteersTotal: number;
  volunteersPage: number;
  
  // Upload batches
  uploadBatches: UploadBatch[];
  uploadBatchesLoading: boolean;
  currentUploadBatch: UploadBatch | null;
  
  // Print batches
  printBatches: PrintBatch[];
  printBatchesLoading: boolean;
  currentPrintBatch: PrintBatch | null;
  
  // Dispatch packages
  dispatchPackages: DispatchPackage[];
  dispatchPackagesLoading: boolean;
  
  // Dashboard
  dashboardStats: DashboardStats | null;
  dashboardLoading: boolean;
  
  // Master data
  events: Event[];
  dutyTypes: DutyType[];
  localCouncils: LocalCouncil[];
  jamatKhanas: JamatKhana[];
  
  // Selected items
  selectedVolunteers: string[];
  
  // Filters
  currentFilters: VolunteerFilters;
  
  // Actions
  loadVolunteers: (filters?: VolunteerFilters) => Promise<void>;
  loadMoreVolunteers: () => Promise<void>;
  refreshVolunteers: () => Promise<void>;
  
  uploadVolunteerData: (data: VolunteerUploadFormData) => Promise<UploadBatch>;
  loadUploadBatches: (region?: Region) => Promise<void>;
  
  approveVolunteers: (data: VolunteerApprovalFormData) => Promise<void>;
  submitVolunteers: (volunteerIds: string[]) => Promise<void>;
  
  createPrintBatch: (data: PrintBatchFormData) => Promise<PrintBatch>;
  printBadges: (printBatchId: string) => Promise<void>;
  generateCoveringSheet: (printBatchId: string) => Promise<CoveringSheet[]>;
  
  prepareDispatchPackage: (data: DispatchFormData) => Promise<DispatchPackage>;
  dispatchPackage: (packageId: string) => Promise<void>;
  loadDispatchPackages: (region?: Region) => Promise<void>;
  
  loadDashboardStats: (filters?: DashboardFilters) => Promise<void>;
  
  loadMasterData: () => Promise<void>;
  loadLocalCouncils: (region?: Region) => Promise<void>;
  loadJamatKhanas: (localCouncilId?: string) => Promise<void>;
  
  selectVolunteer: (id: string) => void;
  deselectVolunteer: (id: string) => void;
  selectAllVolunteers: () => void;
  deselectAllVolunteers: () => void;
  
  setFilters: (filters: VolunteerFilters) => void;
  clearFilters: () => void;
  
  setUserRole: (role: UserRole) => void;
  setUserLevel: (level: UserLevel) => void;
  setUserRegion: (region?: Region) => void;
}

// ============================================
// DEFAULT VALUES
// ============================================

const defaultFilters: VolunteerFilters = {
  page: 1,
  pageSize: 20,
};

const defaultContextValue: VolunteerContextState = {
  userRole: UserRole.VIEW_ONLY,
  userLevel: UserLevel.REGIONAL,
  userRegion: undefined,
  
  volunteers: [],
  volunteersLoading: false,
  volunteersError: null,
  volunteersTotal: 0,
  volunteersPage: 1,
  
  uploadBatches: [],
  uploadBatchesLoading: false,
  currentUploadBatch: null,
  
  printBatches: [],
  printBatchesLoading: false,
  currentPrintBatch: null,
  
  dispatchPackages: [],
  dispatchPackagesLoading: false,
  
  dashboardStats: null,
  dashboardLoading: false,
  
  events: EVENTS,
  dutyTypes: DUTY_TYPES,
  localCouncils: [],
  jamatKhanas: [],
  
  selectedVolunteers: [],
  currentFilters: defaultFilters,
  
  loadVolunteers: async () => {},
  loadMoreVolunteers: async () => {},
  refreshVolunteers: async () => {},
  uploadVolunteerData: async () => ({ } as UploadBatch),
  loadUploadBatches: async () => {},
  approveVolunteers: async () => {},
  submitVolunteers: async () => {},
  createPrintBatch: async () => ({ } as PrintBatch),
  printBadges: async () => {},
  generateCoveringSheet: async () => [],
  prepareDispatchPackage: async () => ({ } as DispatchPackage),
  dispatchPackage: async () => {},
  loadDispatchPackages: async () => {},
  loadDashboardStats: async () => {},
  loadMasterData: async () => {},
  loadLocalCouncils: async () => {},
  loadJamatKhanas: async () => {},
  selectVolunteer: () => {},
  deselectVolunteer: () => {},
  selectAllVolunteers: () => {},
  deselectAllVolunteers: () => {},
  setFilters: () => {},
  clearFilters: () => {},
  setUserRole: () => {},
  setUserLevel: () => {},
  setUserRegion: () => {},
};

// ============================================
// CONTEXT CREATION
// ============================================

const VolunteerContext = createContext<VolunteerContextState>(defaultContextValue);

interface VolunteerProviderProps {
  children: ReactNode;
}

// ============================================
// PROVIDER COMPONENT
// ============================================

export const VolunteerProvider: React.FC<VolunteerProviderProps> = ({ children }) => {
  // User state
  const [userRole, setUserRole] = useState<UserRole>(UserRole.MAKER);
  const [userLevel, setUserLevel] = useState<UserLevel>(UserLevel.REGIONAL);
  const [userRegion, setUserRegion] = useState<Region | undefined>(Region.GILGIT);
  
  // Volunteers state
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [volunteersLoading, setVolunteersLoading] = useState(false);
  const [volunteersError, setVolunteersError] = useState<string | null>(null);
  const [volunteersTotal, setVolunteersTotal] = useState(0);
  const [volunteersPage, setVolunteersPage] = useState(1);
  
  // Upload batches state
  const [uploadBatches, setUploadBatches] = useState<UploadBatch[]>([]);
  const [uploadBatchesLoading, setUploadBatchesLoading] = useState(false);
  const [currentUploadBatch, setCurrentUploadBatch] = useState<UploadBatch | null>(null);
  
  // Print batches state
  const [printBatches, setPrintBatches] = useState<PrintBatch[]>([]);
  const [printBatchesLoading, setPrintBatchesLoading] = useState(false);
  const [currentPrintBatch, setCurrentPrintBatch] = useState<PrintBatch | null>(null);
  
  // Dispatch packages state
  const [dispatchPackages, setDispatchPackages] = useState<DispatchPackage[]>([]);
  const [dispatchPackagesLoading, setDispatchPackagesLoading] = useState(false);
  
  // Dashboard state
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  
  // Master data state
  const [events, setEvents] = useState<Event[]>(EVENTS);
  const [dutyTypes, setDutyTypes] = useState<DutyType[]>(DUTY_TYPES);
  const [localCouncils, setLocalCouncils] = useState<LocalCouncil[]>([]);
  const [jamatKhanas, setJamatKhanas] = useState<JamatKhana[]>([]);
  
  // Selection state
  const [selectedVolunteers, setSelectedVolunteers] = useState<string[]>([]);
  
  // Filter state
  const [currentFilters, setCurrentFilters] = useState<VolunteerFilters>(defaultFilters);

  // ============================================
  // VOLUNTEER OPERATIONS
  // ============================================

  const loadVolunteers = useCallback(async (filters: VolunteerFilters = {}) => {
    setVolunteersLoading(true);
    setVolunteersError(null);
    
    try {
      const mergedFilters = { ...currentFilters, ...filters, page: 1 };
      
      // Apply region filter based on user level
      if (userLevel !== UserLevel.NATIONAL && userRegion) {
        mergedFilters.region = userRegion;
      }
      
      const response = await volunteerApiService.getVolunteers(mergedFilters);
      setVolunteers(response.data);
      setVolunteersTotal(response.pagination.total);
      setVolunteersPage(1);
      setCurrentFilters(mergedFilters);
    } catch (error: any) {
      setVolunteersError(error.message || 'Failed to load volunteers');
      console.error('Error loading volunteers:', error);
    } finally {
      setVolunteersLoading(false);
    }
  }, [currentFilters, userLevel, userRegion]);

  const loadMoreVolunteers = useCallback(async () => {
    if (volunteersLoading || volunteers.length >= volunteersTotal) return;
    
    setVolunteersLoading(true);
    
    try {
      const nextPage = volunteersPage + 1;
      const response = await volunteerApiService.getVolunteers({
        ...currentFilters,
        page: nextPage,
      });
      
      setVolunteers(prev => [...prev, ...response.data]);
      setVolunteersPage(nextPage);
    } catch (error: any) {
      setVolunteersError(error.message || 'Failed to load more volunteers');
    } finally {
      setVolunteersLoading(false);
    }
  }, [volunteersLoading, volunteers.length, volunteersTotal, volunteersPage, currentFilters]);

  const refreshVolunteers = useCallback(async () => {
    await loadVolunteers(currentFilters);
  }, [loadVolunteers, currentFilters]);

  // ============================================
  // UPLOAD OPERATIONS
  // ============================================

  const uploadVolunteerData = useCallback(async (data: VolunteerUploadFormData): Promise<UploadBatch> => {
    const batch = await volunteerApiService.uploadVolunteerData(data);
    setCurrentUploadBatch(batch);
    setUploadBatches(prev => [batch, ...prev]);
    return batch;
  }, []);

  const loadUploadBatches = useCallback(async (region?: Region) => {
    setUploadBatchesLoading(true);
    
    try {
      const targetRegion = region || (userLevel !== UserLevel.NATIONAL ? userRegion : undefined);
      const response = await volunteerApiService.getUploadBatches(targetRegion);
      setUploadBatches(response.data);
    } catch (error) {
      console.error('Error loading upload batches:', error);
    } finally {
      setUploadBatchesLoading(false);
    }
  }, [userLevel, userRegion]);

  // ============================================
  // MAKER WORKFLOW OPERATIONS
  // ============================================

  const approveVolunteers = useCallback(async (data: VolunteerApprovalFormData) => {
    await volunteerApiService.approveVolunteers(data);
    
    // Update local state
    setVolunteers(prev =>
      prev.map(v =>
        data.volunteerIds.includes(v.id)
          ? {
              ...v,
              status: data.action === 'approve' ? VolunteerStatus.APPROVED : VolunteerStatus.REJECTED,
            }
          : v
      )
    );
    
    // Clear selection
    setSelectedVolunteers([]);
  }, []);

  const submitVolunteers = useCallback(async (volunteerIds: string[]) => {
    await volunteerApiService.submitVolunteers(volunteerIds);
    
    // Update local state
    setVolunteers(prev =>
      prev.map(v =>
        volunteerIds.includes(v.id)
          ? { ...v, status: VolunteerStatus.SUBMITTED }
          : v
      )
    );
    
    // Clear selection
    setSelectedVolunteers([]);
  }, []);

  // ============================================
  // CHECKER WORKFLOW OPERATIONS
  // ============================================

  const createPrintBatch = useCallback(async (data: PrintBatchFormData): Promise<PrintBatch> => {
    const batch = await volunteerApiService.createPrintBatch(data);
    setCurrentPrintBatch(batch);
    setPrintBatches(prev => [batch, ...prev]);
    return batch;
  }, []);

  const printBadges = useCallback(async (printBatchId: string) => {
    await volunteerApiService.printBadges(printBatchId);
    
    // Update local state
    setVolunteers(prev =>
      prev.map(v =>
        selectedVolunteers.includes(v.id)
          ? { ...v, status: VolunteerStatus.PRINTED }
          : v
      )
    );
    
    setSelectedVolunteers([]);
  }, [selectedVolunteers]);

  const generateCoveringSheet = useCallback(async (printBatchId: string): Promise<CoveringSheet[]> => {
    return volunteerApiService.generateCoveringSheet(printBatchId);
  }, []);

  // ============================================
  // DISPATCH OPERATIONS
  // ============================================

  const prepareDispatchPackage = useCallback(async (data: DispatchFormData): Promise<DispatchPackage> => {
    const pkg = await volunteerApiService.prepareDispatchPackage(data);
    setDispatchPackages(prev => [pkg, ...prev]);
    return pkg;
  }, []);

  const dispatchPackage = useCallback(async (packageId: string) => {
    await volunteerApiService.dispatchPackage(packageId);
    
    // Update local state
    setDispatchPackages(prev =>
      prev.map(p =>
        p.id === packageId
          ? { ...p, status: 'dispatched' as const, dispatchedAt: new Date().toISOString() }
          : p
      )
    );
  }, []);

  const loadDispatchPackages = useCallback(async (region?: Region) => {
    setDispatchPackagesLoading(true);
    
    try {
      const targetRegion = region || (userLevel !== UserLevel.NATIONAL ? userRegion : undefined);
      const packages = await volunteerApiService.getDispatchPackages(targetRegion);
      setDispatchPackages(packages);
    } catch (error) {
      console.error('Error loading dispatch packages:', error);
    } finally {
      setDispatchPackagesLoading(false);
    }
  }, [userLevel, userRegion]);

  // ============================================
  // DASHBOARD OPERATIONS
  // ============================================

  const loadDashboardStats = useCallback(async (filters: DashboardFilters = {}) => {
    setDashboardLoading(true);
    
    try {
      const targetFilters = { ...filters };
      if (userLevel !== UserLevel.NATIONAL && userRegion && !filters.region) {
        targetFilters.region = userRegion;
      }
      
      const stats = await volunteerApiService.getDashboardStats(targetFilters);
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setDashboardLoading(false);
    }
  }, [userLevel, userRegion]);

  // ============================================
  // MASTER DATA OPERATIONS
  // ============================================

  const loadMasterData = useCallback(async () => {
    try {
      const [eventsData, dutyTypesData] = await Promise.all([
        volunteerApiService.getEvents(),
        volunteerApiService.getDutyTypes(),
      ]);
      
      setEvents(eventsData);
      setDutyTypes(dutyTypesData);
    } catch (error) {
      console.error('Error loading master data:', error);
    }
  }, []);

  const loadLocalCouncils = useCallback(async (region?: Region) => {
    try {
      const councils = await volunteerApiService.getLocalCouncils(region);
      setLocalCouncils(councils);
    } catch (error) {
      console.error('Error loading local councils:', error);
    }
  }, []);

  const loadJamatKhanas = useCallback(async (localCouncilId?: string) => {
    try {
      const jks = await volunteerApiService.getJamatKhanas(localCouncilId);
      setJamatKhanas(jks);
    } catch (error) {
      console.error('Error loading jamat khanas:', error);
    }
  }, []);

  // ============================================
  // SELECTION OPERATIONS
  // ============================================

  const selectVolunteer = useCallback((id: string) => {
    setSelectedVolunteers(prev => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
  }, []);

  const deselectVolunteer = useCallback((id: string) => {
    setSelectedVolunteers(prev => prev.filter(v => v !== id));
  }, []);

  const selectAllVolunteers = useCallback(() => {
    setSelectedVolunteers(volunteers.map(v => v.id));
  }, [volunteers]);

  const deselectAllVolunteers = useCallback(() => {
    setSelectedVolunteers([]);
  }, []);

  // ============================================
  // FILTER OPERATIONS
  // ============================================

  const setFilters = useCallback((filters: VolunteerFilters) => {
    setCurrentFilters(prev => ({ ...prev, ...filters }));
  }, []);

  const clearFilters = useCallback(() => {
    setCurrentFilters(defaultFilters);
    setSelectedVolunteers([]);
  }, []);

  // ============================================
  // INITIAL LOAD
  // ============================================

  useEffect(() => {
    loadMasterData();
  }, [loadMasterData]);

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const contextValue: VolunteerContextState = {
    userRole,
    userLevel,
    userRegion,
    
    volunteers,
    volunteersLoading,
    volunteersError,
    volunteersTotal,
    volunteersPage,
    
    uploadBatches,
    uploadBatchesLoading,
    currentUploadBatch,
    
    printBatches,
    printBatchesLoading,
    currentPrintBatch,
    
    dispatchPackages,
    dispatchPackagesLoading,
    
    dashboardStats,
    dashboardLoading,
    
    events,
    dutyTypes,
    localCouncils,
    jamatKhanas,
    
    selectedVolunteers,
    currentFilters,
    
    loadVolunteers,
    loadMoreVolunteers,
    refreshVolunteers,
    uploadVolunteerData,
    loadUploadBatches,
    approveVolunteers,
    submitVolunteers,
    createPrintBatch,
    printBadges,
    generateCoveringSheet,
    prepareDispatchPackage,
    dispatchPackage,
    loadDispatchPackages,
    loadDashboardStats,
    loadMasterData,
    loadLocalCouncils,
    loadJamatKhanas,
    selectVolunteer,
    deselectVolunteer,
    selectAllVolunteers,
    deselectAllVolunteers,
    setFilters,
    clearFilters,
    setUserRole,
    setUserLevel,
    setUserRegion,
  };

  return (
    <VolunteerContext.Provider value={contextValue}>
      {children}
    </VolunteerContext.Provider>
  );
};

// ============================================
// CUSTOM HOOK
// ============================================

export const useVolunteer = (): VolunteerContextState => {
  const context = useContext(VolunteerContext);
  if (context === undefined) {
    throw new Error('useVolunteer must be used within a VolunteerProvider');
  }
  return context;
};

export default VolunteerContext;
