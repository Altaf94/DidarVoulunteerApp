import { tokenService } from './tokenService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginCredentials, LoginResponse, ApiError } from '../types';
import { btoa } from '../utils/base64';

// API service for handling all API calls
const API_BASE_URL = 'https://api-mhip.azurewebsites.net';
const USE_MOCK_API = true; // Temporarily enable mock mode since backend is not available

console.log('API Configuration:', {
  API_BASE_URL,
  USE_MOCK_API,
});

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    console.log('API Service initialized with base URL:', this.baseUrl);
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    console.log('Making API request:', {
      url,
      method: config.method || 'GET',
    });

    try {
      const response = await fetch(url, config);

      console.log('Response received:', {
        status: response.status,
        statusText: response.statusText,
      });

      if (!response.ok) {
        let errorData: ApiError = {};
        try {
          errorData = await response.json();
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error('API Error Response:', errorData);
        throw new Error(this.formatError(errorData));
      }

      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        const textResponse = await response.text();
        try {
          return JSON.parse(textResponse);
        } catch (parseError) {
          return { message: textResponse } as T;
        }
      }
    } catch (error) {
      console.error('API request failed:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to the server');
      }
      throw error;
    }
  }

  private formatError(errorData: ApiError): string {
    if (errorData.detail && Array.isArray(errorData.detail)) {
      return errorData.detail.map(err => err.msg).join(', ');
    }
    return errorData.message || 'An error occurred';
  }

  // Test API connectivity
  async testConnection(): Promise<boolean> {
    if (USE_MOCK_API) {
      console.log('Using mock API - connection test will always pass');
      return true;
    }

    try {
      console.log('Testing API connection to:', this.baseUrl);
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      console.log('Health check response:', response.status);
      return response.ok;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    console.log('Login attempt with credentials:', {
      username: credentials.username,
      password: credentials.password ? '[REDACTED]' : 'undefined',
    });

    if (USE_MOCK_API) {
      console.log('Using mock API for login');
      return new Promise(resolve => {
        setTimeout(() => {
          const mockPayload = {
            sub: '1',
            username: credentials.username,
            email: credentials.username,
            role: 3,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
          };

          const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
          const payload = btoa(JSON.stringify(mockPayload));
          const signature = 'mock_signature';
          const mockToken = `${header}.${payload}.${signature}`;

          resolve({
            access_token: mockToken,
            refresh_token: 'mock_refresh_token_' + Date.now(),
            token_type: 'bearer',
            user: {
              id: 1,
              username: credentials.username,
              email: credentials.username,
              role: 3,
            },
          });
        }, 1000);
      });
    }

    // Convert to form-encoded format
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const requestBody = formData.toString();

    return this.makeRequest<LoginResponse>('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: requestBody,
    });
  }

  async logout(): Promise<void> {
    return this.makeRequest<void>('/logout', {
      method: 'POST',
    });
  }

  async getProfile(): Promise<any> {
    const isAuth = await tokenService.isAuthenticated();
    if (!isAuth) {
      throw new Error('No authentication token available');
    }

    const token = await tokenService.getValidAccessToken();
    return this.makeRequest<any>('/profile', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Get users with filters
  async getUsers(filters: {
    RoleId?: number;
    StatusId?: number;
    Email?: string;
    JamatKhanaId?: string;
    PageNumber?: number;
    PageSize?: number;
  } = {}): Promise<any> {
    console.log('Getting users with filters:', filters);

    if (USE_MOCK_API) {
      return new Promise(resolve => {
        setTimeout(() => {
          const mockUsers = [
            {
              Id: '1',
              Email: 'admin@mhip.com',
              FullName: 'Administrator',
              PhoneNumber: '+1234567890',
              RoleId: 3,
              StatusId: 1,
              JamatKhanaIds: ['JK001', 'JK002'],
              IsActive: true,
              CreatedAt: new Date().toISOString(),
              UpdatedAt: null,
            },
            {
              Id: '2',
              Email: 'checker@mhip.com',
              FullName: 'Checker User',
              PhoneNumber: '+1234567891',
              RoleId: 2,
              StatusId: 1,
              JamatKhanaIds: ['JK001'],
              IsActive: true,
              CreatedAt: new Date().toISOString(),
              UpdatedAt: null,
            },
            {
              Id: '3',
              Email: 'maker@mhip.com',
              FullName: 'Maker User',
              PhoneNumber: '+1234567892',
              RoleId: 1,
              StatusId: 1,
              JamatKhanaIds: ['JK001'],
              IsActive: true,
              CreatedAt: new Date().toISOString(),
              UpdatedAt: null,
            },
          ];

          resolve({
            Users: mockUsers,
            Pagination: {
              Total: mockUsers.length,
              Page: filters.PageNumber || 1,
              TotalPages: 1,
              PageSize: filters.PageSize || 10,
              HasNext: false,
              HasPrevious: false,
              NextPage: null,
              PreviousPage: null,
            },
          });
        }, 500);
      });
    }

    const isAuth = await tokenService.isAuthenticated();
    if (!isAuth) {
      throw new Error('No authentication token available');
    }

    const queryParams = new URLSearchParams();
    if (filters.RoleId) queryParams.append('RoleId', filters.RoleId.toString());
    if (filters.StatusId)
      queryParams.append('StatusId', filters.StatusId.toString());
    if (filters.Email) queryParams.append('Email', filters.Email);
    if (filters.JamatKhanaId)
      queryParams.append('JamatKhanaId', filters.JamatKhanaId);
    if (filters.PageNumber)
      queryParams.append('PageNumber', filters.PageNumber.toString());
    if (filters.PageSize)
      queryParams.append('PageSize', filters.PageSize.toString());

    const endpoint = `/users/?${queryParams.toString()}`;

    const token = await tokenService.getValidAccessToken();
    return this.makeRequest<any>(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Get form by ID
  async getFormById(formId: string): Promise<any> {
    const isAuth = await tokenService.isAuthenticated();
    if (!isAuth) {
      throw new Error('No authentication token available');
    }

    const token = await tokenService.getValidAccessToken();
    return this.makeRequest<any>(`/forms/${formId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Update form status
  async updateFormStatus(
    formId: string,
    status: number,
    jamatKhanaId: string,
    rejectReasonText?: string
  ): Promise<any> {
    if (USE_MOCK_API) {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            FormId: formId,
            FormStatus: status,
            JamatKhanaId: jamatKhanaId,
            RejectReasonText: rejectReasonText,
            UpdatedAt: new Date().toISOString(),
          });
        }, 500);
      });
    }

    const isAuth = await tokenService.isAuthenticated();
    if (!isAuth) {
      throw new Error('No authentication token available');
    }

    const body: any = {
      FormStatus: status,
      JamatKhanaId: jamatKhanaId,
    };

    if (rejectReasonText) {
      body.RejectReasonText = rejectReasonText;
    }

    const token = await tokenService.getValidAccessToken();
    return this.makeRequest<any>(`/forms/${formId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  }

  // Get Jamatkhanas
  async getJamatkhanas(): Promise<any> {
    if (USE_MOCK_API) {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve([
            { id: 'JK001', name: 'Jamat Khana 1' },
            { id: 'JK002', name: 'Jamat Khana 2' },
            { id: 'JK003', name: 'Jamat Khana 3' },
          ]);
        }, 300);
      });
    }

    const isAuth = await tokenService.isAuthenticated();
    if (!isAuth) {
      throw new Error('No authentication token available');
    }

    const token = await tokenService.getValidAccessToken();
    return this.makeRequest<any>('/jamatkhanas/', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Get all lookup tables
  async getAllLookupTables(): Promise<any> {
    if (USE_MOCK_API) {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            Genders: [
              { Id: 1, Name: 'Male' },
              { Id: 2, Name: 'Female' },
            ],
            RelationshipsToHead: [
              { Id: 1, Name: 'Self' },
              { Id: 2, Name: 'Spouse' },
              { Id: 3, Name: 'Child' },
              { Id: 4, Name: 'Parent' },
            ],
            MaritalStatuses: [
              { Id: 1, Name: 'Single' },
              { Id: 2, Name: 'Married' },
              { Id: 3, Name: 'Divorced' },
            ],
            BankTypes: [
              { Id: 1, Name: 'Savings' },
              { Id: 2, Name: 'Current' },
            ],
            IncomeBands: [
              { Id: 1, Name: 'Under PKR 50,000' },
              { Id: 2, Name: 'PKR 50,000 - 100,000' },
              { Id: 3, Name: 'PKR 100,000 - 200,000' },
              { Id: 4, Name: 'Above PKR 200,000' },
            ],
            FamilyIncomeStatus: [
              { Id: 1, Name: 'Salary' },
              { Id: 2, Name: 'Business' },
              { Id: 3, Name: 'Remittance' },
            ],
          });
        }, 300);
      });
    }

    const isAuth = await tokenService.isAuthenticated();
    if (!isAuth) {
      throw new Error('No authentication token available');
    }

    const token = await tokenService.getValidAccessToken();
    return this.makeRequest<any>('/all-lookup-tables', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Forgot password
  async forgotPassword(email: string): Promise<any> {
    if (USE_MOCK_API) {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({ message: 'Password reset email sent successfully' });
        }, 500);
      });
    }

    return this.makeRequest<any>('/users/forget-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Email: email.toLowerCase(),
      }),
    });
  }

  // Create user
  async createUser(userData: {
    Email: string;
    FullName: string;
    PhoneNumber: string;
    RoleId: number;
    StatusId: number;
    JamatKhanaIds: string[];
    IsActive: boolean;
  }): Promise<any> {
    if (USE_MOCK_API) {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            Id: Date.now().toString(),
            ...userData,
            CreatedAt: new Date().toISOString(),
            UpdatedAt: null,
          });
        }, 500);
      });
    }

    const isAuth = await tokenService.isAuthenticated();
    if (!isAuth) {
      throw new Error('No authentication token available');
    }

    const token = await tokenService.getValidAccessToken();
    return this.makeRequest<any>('/users/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
  }

  // Update user
  async updateUser(
    userId: string,
    userData: {
      FullName: string;
      PhoneNumber: string;
      JamatKhanaIds: string[];
      IsActive: boolean;
    }
  ): Promise<any> {
    if (USE_MOCK_API) {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            Id: userId,
            ...userData,
            UpdatedAt: new Date().toISOString(),
          });
        }, 500);
      });
    }

    const isAuth = await tokenService.isAuthenticated();
    if (!isAuth) {
      throw new Error('No authentication token available');
    }

    const token = await tokenService.getValidAccessToken();
    return this.makeRequest<any>(`/users/${userId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
  }

  // Delete user
  async deleteUser(userId: string): Promise<any> {
    if (USE_MOCK_API) {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({ message: 'User deleted successfully' });
        }, 500);
      });
    }

    const isAuth = await tokenService.isAuthenticated();
    if (!isAuth) {
      throw new Error('No authentication token available');
    }

    const token = await tokenService.getValidAccessToken();
    return this.makeRequest<any>(`/users/${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

export const apiService = new ApiService();
export default apiService;
