// ============================================
// VOLUNTEER MANAGEMENT SYSTEM - API SERVICE
// Didar Mubarak Pakistan
// ============================================

import { tokenService } from './tokenService';
import {
  Volunteer,
  VolunteerFilters,
  VolunteersResponse,
  UploadBatch,
  UploadBatchesResponse,
  BulkValidationResult,
  CNICValidationResponse,
  PrintBatch,
  DispatchPackage,
  CoveringSheet,
  DashboardStats,
  DashboardFilters,
  VolunteerUploadFormData,
  VolunteerApprovalFormData,
  PrintBatchFormData,
  DispatchFormData,
  Region,
  VolunteerStatus,
  PrintStatus,
  Event,
  DutyType,
  DataSource,
  AccessLevel,
  JamatKhana,
  LocalCouncil,
  RegionalCouncil,
} from '../types/volunteer';
import { EVENTS, DUTY_TYPES, REGIONS, DATA_SOURCES } from '../constants/volunteerConstants';

const API_BASE_URL = 'https://api-volunteer.azurewebsites.net';
const USE_MOCK_API = true; // Enable mock mode for development

// ============================================
// MOCK DATA GENERATOR
// ============================================

const generateMockVolunteers = (count: number = 50): Volunteer[] => {
  const statuses: VolunteerStatus[] = [
    VolunteerStatus.VALID,
    VolunteerStatus.PENDING,
    VolunteerStatus.DISCREPANT,
    VolunteerStatus.APPROVED,
    VolunteerStatus.PRINTED,
  ];
  
  const volunteers: Volunteer[] = [];
  
  for (let i = 1; i <= count; i++) {
    const region = REGIONS[Math.floor(Math.random() * REGIONS.length)].value;
    const event = EVENTS[Math.floor(Math.random() * EVENTS.length)];
    const dutyType = DUTY_TYPES[Math.floor(Math.random() * DUTY_TYPES.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const source = DATA_SOURCES[Math.floor(Math.random() * DATA_SOURCES.length)].value;
    
    volunteers.push({
      id: `vol-${i}`,
      volunteerId: `VID-${String(i).padStart(6, '0')}`,
      cnic: `${12345 + i}-${1234567 + i}-${i % 10}`,
      name: `Volunteer ${i}`,
      eventId: event.id,
      eventNumber: event.eventNumber,
      dutyTypeId: dutyType.id,
      dutyTypeName: dutyType.name,
      accessLevel: dutyType.accessLevel,
      accessLevelName: getAccessLevelName(dutyType.accessLevel),
      region,
      source,
      sourceEntityId: `source-${i}`,
      sourceEntityName: `Source Entity ${i}`,
      uploadBatchId: `batch-${Math.ceil(i / 10)}`,
      status,
      validationErrors: [],
      printStatus: status === VolunteerStatus.PRINTED ? PrintStatus.PRINTED : PrintStatus.NOT_PRINTED,
      cnicVerified: status !== VolunteerStatus.PENDING,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }
  
  return volunteers;
};

const getAccessLevelName = (level: AccessLevel): string => {
  const names: Record<AccessLevel, string> = {
    [AccessLevel.STAGE]: 'Stage',
    [AccessLevel.PANDAL]: 'Pandal',
    [AccessLevel.OUTSIDE_HOLDING_AREA]: 'Outside Holding Area',
    [AccessLevel.OUTSIDE_AREA]: 'Outside Area',
    [AccessLevel.HEALTH_AREA]: 'Health Area',
  };
  return names[level];
};

const mockVolunteers = generateMockVolunteers(100);

// ============================================
// API SERVICE CLASS
// ============================================

class VolunteerApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await tokenService.getAccessToken();
    
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    console.log('Volunteer API Request:', { url, method: config.method || 'GET' });

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Volunteer API Error:', error);
      throw error;
    }
  }

  // ============================================
  // VOLUNTEER CRUD OPERATIONS
  // ============================================

  async getVolunteers(filters: VolunteerFilters = {}): Promise<VolunteersResponse> {
    if (USE_MOCK_API) {
      let filtered = [...mockVolunteers];
      
      if (filters.region) {
        filtered = filtered.filter(v => v.region === filters.region);
      }
      if (filters.status) {
        filtered = filtered.filter(v => v.status === filters.status);
      }
      if (filters.eventId) {
        filtered = filtered.filter(v => v.eventId === filters.eventId);
      }
      if (filters.accessLevel) {
        filtered = filtered.filter(v => v.accessLevel === filters.accessLevel);
      }
      if (filters.cnic) {
        filtered = filtered.filter(v => v.cnic.includes(filters.cnic!));
      }
      if (filters.name) {
        filtered = filtered.filter(v => 
          v.name.toLowerCase().includes(filters.name!.toLowerCase())
        );
      }
      
      const page = filters.page || 1;
      const pageSize = filters.pageSize || 10;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      
      return {
        data: filtered.slice(start, end),
        pagination: {
          total: filtered.length,
          page,
          pageSize,
          totalPages: Math.ceil(filtered.length / pageSize),
          hasNext: end < filtered.length,
          hasPrevious: page > 1,
        },
      };
    }

    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    return this.makeRequest<VolunteersResponse>(`/api/volunteers?${queryParams}`);
  }

  async getVolunteerById(id: string): Promise<Volunteer> {
    if (USE_MOCK_API) {
      const volunteer = mockVolunteers.find(v => v.id === id);
      if (!volunteer) throw new Error('Volunteer not found');
      return volunteer;
    }

    return this.makeRequest<Volunteer>(`/api/volunteers/${id}`);
  }

  async getVolunteerByCnic(cnic: string): Promise<Volunteer[]> {
    if (USE_MOCK_API) {
      return mockVolunteers.filter(v => v.cnic === cnic);
    }

    return this.makeRequest<Volunteer[]>(`/api/volunteers/cnic/${cnic}`);
  }

  // ============================================
  // UPLOAD & VALIDATION
  // ============================================

  async uploadVolunteerData(formData: VolunteerUploadFormData): Promise<UploadBatch> {
    if (USE_MOCK_API) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing
      
      return {
        id: `batch-${Date.now()}`,
        fileName: 'volunteers.xlsx',
        region: formData.region,
        uploadedBy: 'current-user',
        uploadedByName: 'Current User',
        totalRecords: 50,
        validRecords: 40,
        rejectedRecords: 5,
        discrepantRecords: 5,
        status: 'completed',
        source: formData.source,
        sourceEntityId: formData.sourceEntityId,
        sourceEntityName: 'Source Entity',
        createdAt: new Date().toISOString(),
        processedAt: new Date().toISOString(),
      };
    }

    const body = new FormData();
    body.append('file', formData.file);
    body.append('region', formData.region);
    body.append('source', formData.source);
    body.append('sourceEntityId', formData.sourceEntityId);

    return this.makeRequest<UploadBatch>('/api/volunteers/upload', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: body as any,
    });
  }

  async validateCnic(cnic: string): Promise<CNICValidationResponse> {
    if (USE_MOCK_API) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate 90% success rate
      const isValid = Math.random() > 0.1;
      return {
        isValid,
        isRegistered: isValid,
        name: isValid ? 'Mock User Name' : undefined,
        message: isValid ? 'CNIC verified successfully' : 'CNIC not found in system',
      };
    }

    return this.makeRequest<CNICValidationResponse>(`/api/enrollment/validate/${cnic}`);
  }

  async getValidationResult(batchId: string): Promise<BulkValidationResult> {
    if (USE_MOCK_API) {
      const batchVolunteers = mockVolunteers.filter(v => v.uploadBatchId === batchId);
      
      return {
        batchId,
        totalRecords: batchVolunteers.length,
        validRecords: batchVolunteers.filter(v => v.status === VolunteerStatus.VALID),
        rejectedRecords: batchVolunteers
          .filter(v => v.status === VolunteerStatus.REJECTED)
          .map(v => ({ ...v, errors: v.validationErrors })),
        discrepantRecords: batchVolunteers
          .filter(v => v.status === VolunteerStatus.DISCREPANT)
          .map(v => ({ ...v, errors: v.validationErrors })),
      };
    }

    return this.makeRequest<BulkValidationResult>(`/api/volunteers/validation/${batchId}`);
  }

  // ============================================
  // MAKER WORKFLOW
  // ============================================

  async approveVolunteers(data: VolunteerApprovalFormData): Promise<{ success: boolean; message: string }> {
    if (USE_MOCK_API) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      data.volunteerIds.forEach(id => {
        const volunteer = mockVolunteers.find(v => v.id === id);
        if (volunteer) {
          volunteer.status = data.action === 'approve' 
            ? VolunteerStatus.APPROVED 
            : VolunteerStatus.REJECTED;
          volunteer.approvedAt = new Date().toISOString();
          volunteer.approvedBy = 'current-user';
        }
      });

      return {
        success: true,
        message: `${data.volunteerIds.length} volunteers ${data.action}d successfully`,
      };
    }

    return this.makeRequest('/api/volunteers/approve', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async submitVolunteers(volunteerIds: string[]): Promise<{ success: boolean; message: string }> {
    if (USE_MOCK_API) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      volunteerIds.forEach(id => {
        const volunteer = mockVolunteers.find(v => v.id === id);
        if (volunteer) {
          volunteer.status = VolunteerStatus.SUBMITTED;
          volunteer.submittedAt = new Date().toISOString();
          volunteer.submittedBy = 'current-user';
          // Generate Volunteer ID if not exists
          if (!volunteer.volunteerId.startsWith('VID-')) {
            volunteer.volunteerId = `VID-${String(Date.now()).slice(-6)}`;
          }
        }
      });

      return {
        success: true,
        message: `${volunteerIds.length} volunteers submitted successfully`,
      };
    }

    return this.makeRequest('/api/volunteers/submit', {
      method: 'POST',
      body: JSON.stringify({ volunteerIds }),
    });
  }

  // ============================================
  // CHECKER WORKFLOW
  // ============================================

  async getSubmittedVolunteers(region?: Region): Promise<VolunteersResponse> {
    return this.getVolunteers({
      status: VolunteerStatus.SUBMITTED,
      region,
    });
  }

  async createPrintBatch(data: PrintBatchFormData): Promise<PrintBatch> {
    if (USE_MOCK_API) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const batch: PrintBatch = {
        id: `print-${Date.now()}`,
        region: data.region,
        volunteerIds: data.volunteerIds,
        totalBadges: data.volunteerIds.length,
        printedBy: 'current-user',
        printedByName: 'Current User',
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      return batch;
    }

    return this.makeRequest<PrintBatch>('/api/print/batch', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async printBadges(printBatchId: string): Promise<{ success: boolean; pdfUrl?: string }> {
    if (USE_MOCK_API) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update volunteer statuses
      mockVolunteers.forEach(v => {
        if (v.printBatchId === printBatchId || Math.random() > 0.8) {
          v.printStatus = PrintStatus.PRINTED;
          v.status = VolunteerStatus.PRINTED;
          v.printedAt = new Date().toISOString();
          v.printedBy = 'current-user';
        }
      });

      return {
        success: true,
        pdfUrl: 'https://example.com/badges.pdf',
      };
    }

    return this.makeRequest(`/api/print/batch/${printBatchId}/print`, {
      method: 'POST',
    });
  }

  async generateCoveringSheet(printBatchId: string): Promise<CoveringSheet[]> {
    if (USE_MOCK_API) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const sheets: CoveringSheet[] = Object.values(AccessLevel)
        .filter(v => typeof v === 'number')
        .map(level => ({
          id: `sheet-${level}-${Date.now()}`,
          printBatchId,
          region: Region.GILGIT,
          accessLevel: level as AccessLevel,
          bandColor: getAccessLevelColor(level as AccessLevel),
          volunteers: mockVolunteers
            .filter(v => v.accessLevel === level)
            .slice(0, 10)
            .map(v => ({
              cnic: v.cnic,
              name: v.name,
              volunteerId: v.volunteerId,
            })),
          generatedAt: new Date().toISOString(),
          generatedBy: 'current-user',
        }));

      return sheets;
    }

    return this.makeRequest<CoveringSheet[]>(`/api/print/batch/${printBatchId}/covering-sheet`);
  }

  // ============================================
  // DISPATCH MANAGEMENT
  // ============================================

  async prepareDispatchPackage(data: DispatchFormData): Promise<DispatchPackage> {
    if (USE_MOCK_API) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        id: `pkg-${Date.now()}`,
        printBatchIds: data.printBatchIds,
        region: Region.GILGIT,
        destination: data.destination,
        destinationEntityId: data.destinationEntityId,
        destinationEntityName: 'Destination Entity',
        totalBadges: 50,
        totalBands: 50,
        coveringSheetIds: ['sheet-1', 'sheet-2'],
        status: 'preparing',
        preparedBy: 'current-user',
        createdAt: new Date().toISOString(),
      };
    }

    return this.makeRequest<DispatchPackage>('/api/dispatch/package', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async dispatchPackage(packageId: string): Promise<{ success: boolean; message: string }> {
    if (USE_MOCK_API) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        message: 'Package dispatched successfully',
      };
    }

    return this.makeRequest(`/api/dispatch/package/${packageId}/dispatch`, {
      method: 'POST',
    });
  }

  async getDispatchPackages(region?: Region): Promise<DispatchPackage[]> {
    if (USE_MOCK_API) {
      return [
        {
          id: 'pkg-1',
          printBatchIds: ['print-1'],
          region: Region.GILGIT,
          destination: DataSource.LOCAL_COUNCIL,
          destinationEntityId: 'lc-1',
          destinationEntityName: 'Local Council Gilgit',
          totalBadges: 100,
          totalBands: 100,
          coveringSheetIds: ['sheet-1'],
          status: 'dispatched',
          preparedBy: 'user-1',
          dispatchedAt: new Date().toISOString(),
          dispatchedBy: 'user-1',
          createdAt: new Date().toISOString(),
        },
      ];
    }

    const params = region ? `?region=${region}` : '';
    return this.makeRequest<DispatchPackage[]>(`/api/dispatch/packages${params}`);
  }

  // ============================================
  // DASHBOARD & ANALYTICS
  // ============================================

  async getDashboardStats(filters: DashboardFilters = {}): Promise<DashboardStats> {
    if (USE_MOCK_API) {
      const totalRequired = EVENTS.reduce((sum, e) => sum + e.requiredVolunteers, 0);
      const totalReceived = mockVolunteers.length;
      const totalPrinted = mockVolunteers.filter(v => v.printStatus === PrintStatus.PRINTED).length;
      
      return {
        region: filters.region,
        totalRequired,
        totalReceived,
        totalValidated: mockVolunteers.filter(v => v.cnicVerified).length,
        totalApproved: mockVolunteers.filter(v => v.status === VolunteerStatus.APPROVED).length,
        totalPrinted,
        totalDispatched: mockVolunteers.filter(v => v.printStatus === PrintStatus.DISPATCHED).length,
        receivedPercentage: Math.round((totalReceived / totalRequired) * 100),
        printedPercentage: Math.round((totalPrinted / totalRequired) * 100),
        byAccessLevel: Object.values(AccessLevel)
          .filter(v => typeof v === 'number')
          .map(level => {
            const levelVolunteers = mockVolunteers.filter(v => v.accessLevel === level);
            return {
              accessLevel: level as AccessLevel,
              accessLevelName: getAccessLevelName(level as AccessLevel),
              required: Math.floor(totalRequired / 5),
              received: levelVolunteers.length,
              printed: levelVolunteers.filter(v => v.printStatus === PrintStatus.PRINTED).length,
            };
          }),
        byEvent: EVENTS.map(event => {
          const eventVolunteers = mockVolunteers.filter(v => v.eventId === event.id);
          return {
            eventId: event.id,
            eventName: event.name,
            eventNumber: event.eventNumber,
            required: event.requiredVolunteers,
            received: eventVolunteers.length,
            printed: eventVolunteers.filter(v => v.printStatus === PrintStatus.PRINTED).length,
          };
        }),
        byRegion: REGIONS.map(region => {
          const regionVolunteers = mockVolunteers.filter(v => v.region === region.value);
          const required = Math.floor(totalRequired / REGIONS.length);
          return {
            region: region.value,
            regionName: region.label,
            required,
            received: regionVolunteers.length,
            printed: regionVolunteers.filter(v => v.printStatus === PrintStatus.PRINTED).length,
            receivedPercentage: Math.round((regionVolunteers.length / required) * 100),
            printedPercentage: Math.round(
              (regionVolunteers.filter(v => v.printStatus === PrintStatus.PRINTED).length / required) * 100
            ),
          };
        }),
      };
    }

    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, String(value));
    });

    return this.makeRequest<DashboardStats>(`/api/dashboard/stats?${queryParams}`);
  }

  // ============================================
  // MASTER DATA
  // ============================================

  async getEvents(): Promise<Event[]> {
    if (USE_MOCK_API) {
      return EVENTS;
    }

    return this.makeRequest<Event[]>('/api/events');
  }

  async getDutyTypes(): Promise<DutyType[]> {
    if (USE_MOCK_API) {
      return DUTY_TYPES;
    }

    return this.makeRequest<DutyType[]>('/api/duty-types');
  }

  async getLocalCouncils(region?: Region): Promise<LocalCouncil[]> {
    if (USE_MOCK_API) {
      return [
        { id: 'lc-1', regionalCouncilId: 'rc-1', name: 'Local Council 1', code: 'LC1', createdAt: new Date().toISOString() },
        { id: 'lc-2', regionalCouncilId: 'rc-1', name: 'Local Council 2', code: 'LC2', createdAt: new Date().toISOString() },
        { id: 'lc-3', regionalCouncilId: 'rc-2', name: 'Local Council 3', code: 'LC3', createdAt: new Date().toISOString() },
      ];
    }

    const params = region ? `?region=${region}` : '';
    return this.makeRequest<LocalCouncil[]>(`/api/local-councils${params}`);
  }

  async getJamatKhanas(localCouncilId?: string): Promise<JamatKhana[]> {
    if (USE_MOCK_API) {
      return [
        { id: 'jk-1', localCouncilId: 'lc-1', name: 'Jamat Khana 1', code: 'JK1', region: Region.GILGIT, isActive: true, createdAt: new Date().toISOString() },
        { id: 'jk-2', localCouncilId: 'lc-1', name: 'Jamat Khana 2', code: 'JK2', region: Region.HUNZA, isActive: true, createdAt: new Date().toISOString() },
      ];
    }

    const params = localCouncilId ? `?localCouncilId=${localCouncilId}` : '';
    return this.makeRequest<JamatKhana[]>(`/api/jamat-khanas${params}`);
  }

  // ============================================
  // UPLOAD BATCHES
  // ============================================

  async getUploadBatches(region?: Region): Promise<UploadBatchesResponse> {
    if (USE_MOCK_API) {
      const batches: UploadBatch[] = [
        {
          id: 'batch-1',
          fileName: 'volunteers_gilgit_batch1.xlsx',
          region: Region.GILGIT,
          uploadedBy: 'user-1',
          uploadedByName: 'Ali Ahmed',
          totalRecords: 50,
          validRecords: 45,
          rejectedRecords: 3,
          discrepantRecords: 2,
          status: 'completed',
          source: DataSource.LOCAL_COUNCIL,
          sourceEntityId: 'lc-1',
          sourceEntityName: 'Local Council Gilgit',
          createdAt: '2026-04-10T10:00:00Z',
          processedAt: '2026-04-10T10:05:00Z',
        },
        {
          id: 'batch-2',
          fileName: 'volunteers_hunza_batch1.xlsx',
          region: Region.HUNZA,
          uploadedBy: 'user-2',
          uploadedByName: 'Sara Khan',
          totalRecords: 30,
          validRecords: 28,
          rejectedRecords: 1,
          discrepantRecords: 1,
          status: 'completed',
          source: DataSource.REGIONAL_EVENT_MANAGER,
          sourceEntityId: 'rem-1',
          sourceEntityName: 'Regional Event Manager Hunza',
          createdAt: '2026-04-12T14:00:00Z',
          processedAt: '2026-04-12T14:03:00Z',
        },
      ];

      const filtered = region ? batches.filter(b => b.region === region) : batches;

      return {
        data: filtered,
        pagination: {
          total: filtered.length,
          page: 1,
          pageSize: 10,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
      };
    }

    const params = region ? `?region=${region}` : '';
    return this.makeRequest<UploadBatchesResponse>(`/api/upload-batches${params}`);
  }
}

// Helper function
const getAccessLevelColor = (level: AccessLevel): string => {
  const colors: Record<AccessLevel, string> = {
    [AccessLevel.STAGE]: '#FFD700',
    [AccessLevel.PANDAL]: '#4169E1',
    [AccessLevel.OUTSIDE_HOLDING_AREA]: '#32CD32',
    [AccessLevel.OUTSIDE_AREA]: '#FFA500',
    [AccessLevel.HEALTH_AREA]: '#FF0000',
  };
  return colors[level];
};

export const volunteerApiService = new VolunteerApiService();
export default volunteerApiService;
