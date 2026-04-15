// Token service for handling access and refresh tokens in React Native
import AsyncStorage from '@react-native-async-storage/async-storage';
import { atob } from '../utils/base64';

const API_BASE_URL = 'https://api-mhip.azurewebsites.net';

class TokenService {
  private static instance: TokenService;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
  }> = [];

  private constructor() {}

  static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }

  // Get access token from AsyncStorage
  async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      console.warn('Failed to get token from AsyncStorage:', error);
      return null;
    }
  }

  // Get refresh token from AsyncStorage
  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('refresh_token');
    } catch (error) {
      console.warn('Failed to get refresh_token from AsyncStorage:', error);
      return null;
    }
  }

  // Set tokens in AsyncStorage
  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await AsyncStorage.setItem('token', accessToken);
      await AsyncStorage.setItem('refresh_token', refreshToken);
    } catch (error) {
      console.error('Failed to store tokens in AsyncStorage:', error);
    }
  }

  // Clear tokens from AsyncStorage
  async clearTokens(): Promise<void> {
    console.log('clearTokens called, removing tokens from AsyncStorage');
    try {
      const keys = [
        'token',
        'refresh_token',
        'user',
        'selectedJamatkhana',
        'selectedJamatkhanaData',
        'applicationDraft',
        'formId',
        'lookupTables',
        'rememberedEmail',
        'rememberMe',
      ];
      await Promise.all(keys.map(key => AsyncStorage.removeItem(key)));
      console.log('Tokens cleared from AsyncStorage');
    } catch (error) {
      console.error('Failed to clear tokens from AsyncStorage:', error);
    }
  }

  // Logout function
  async logout(): Promise<void> {
    console.log('Logout called, clearing all authentication data...');
    await this.clearTokens();
    console.log('All authentication data cleared');
  }

  // Safe base64 decoding
  private safeBase64Decode(str: string): string {
    try {
      const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
      return atob(padded);
    } catch (error) {
      console.warn('Failed to decode base64:', error);
      throw error;
    }
  }

  // Check if token is expired
  isTokenExpired(token: string): boolean {
    try {
      if (!token || token.split('.').length !== 3) {
        return true;
      }

      const payload = JSON.parse(this.safeBase64Decode(token.split('.')[1]));
      const currentTime = Date.now() / 1000;

      // Add a 5-minute buffer to refresh tokens before they actually expire
      return payload.exp < currentTime + 300;
    } catch (error) {
      console.warn('Failed to parse token for expiration check:', error);
      return true;
    }
  }

  // Check if authenticated
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }

  // Get user role from token
  async getUserRole(): Promise<number | null> {
    const token = await this.getAccessToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(this.safeBase64Decode(token.split('.')[1]));
      return payload.role || null;
    } catch (error) {
      console.warn('Failed to get user role from token:', error);
      return null;
    }
  }

  // Get user ID from token
  async getUserId(): Promise<string | null> {
    const token = await this.getAccessToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(this.safeBase64Decode(token.split('.')[1]));
      return payload.sub || null;
    } catch (error) {
      console.warn('Failed to get user ID from token:', error);
      return null;
    }
  }

  // Get user name from token
  async getUserName(): Promise<string | null> {
    const token = await this.getAccessToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(this.safeBase64Decode(token.split('.')[1]));
      return payload.name || payload.username || null;
    } catch (error) {
      console.warn('Failed to get user name from token:', error);
      return null;
    }
  }

  // Get user Jamat Khana IDs from token
  async getUserJamatKhanaIds(): Promise<string[]> {
    const token = await this.getAccessToken();
    if (!token) return [];

    try {
      const payload = JSON.parse(this.safeBase64Decode(token.split('.')[1]));
      return payload.JamatKhanaIds || [];
    } catch (error) {
      console.warn('Failed to get JamatKhanaIds from token:', error);
      return [];
    }
  }

  // Refresh access token using refresh token
  private async refreshAccessToken(): Promise<string> {
    const refreshToken = await this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();

      if (data.access_token) {
        await this.setTokens(data.access_token, refreshToken);
        return data.access_token;
      } else {
        throw new Error('No access token in refresh response');
      }
    } catch (error) {
      await this.clearTokens();
      throw error;
    }
  }

  // Get a valid access token (refresh if necessary)
  async getValidAccessToken(): Promise<string> {
    const accessToken = await this.getAccessToken();

    if (!accessToken) {
      throw new Error('No access token available');
    }

    // If token is not expired, return it
    if (!this.isTokenExpired(accessToken)) {
      return accessToken;
    }

    // If token is expired, try to refresh
    if (this.isRefreshing) {
      // Wait for the current refresh to complete
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      const newToken = await this.refreshAccessToken();

      // Resolve all waiting promises
      this.failedQueue.forEach(({ resolve }) => resolve(newToken));
      this.failedQueue = [];

      return newToken;
    } catch (error) {
      // Reject all waiting promises
      this.failedQueue.forEach(({ reject }) => reject(error));
      this.failedQueue = [];

      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  // Make authenticated request
  async makeAuthenticatedRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const token = await this.getValidAccessToken();

    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  }
}

export const tokenService = TokenService.getInstance();
