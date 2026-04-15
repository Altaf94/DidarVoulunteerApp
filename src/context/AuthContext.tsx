import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tokenService } from '../services/tokenService';
import { User, LookupData } from '../types';

interface AuthContextState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  userRole: number | null;
  lookupData: LookupData | null;
  login: (accessToken: string, refreshToken: string, user?: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  setLookupData: (data: LookupData) => void;
}

const AuthContext = createContext<AuthContextState | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<number | null>(null);
  const [lookupData, setLookupData] = useState<LookupData | null>(null);

  useEffect(() => {
    checkAuth();
    loadLookupData();
  }, []);

  const loadLookupData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('lookupTables');
      if (storedData) {
        setLookupData(JSON.parse(storedData));
      }
    } catch (error) {
      console.error('Failed to load lookup data:', error);
    }
  };

  const checkAuth = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const authenticated = await tokenService.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        const role = await tokenService.getUserRole();
        setUserRole(role);

        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      }

      return authenticated;
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    accessToken: string,
    refreshToken: string,
    userData?: any
  ): Promise<void> => {
    await tokenService.setTokens(accessToken, refreshToken);

    if (userData) {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    }

    const role = await tokenService.getUserRole();
    setUserRole(role);
    setIsAuthenticated(true);
  };

  const logout = async (): Promise<void> => {
    await tokenService.logout();
    setIsAuthenticated(false);
    setUser(null);
    setUserRole(null);
  };

  const updateLookupData = (data: LookupData) => {
    setLookupData(data);
    AsyncStorage.setItem('lookupTables', JSON.stringify(data)).catch(err =>
      console.error('Failed to save lookup data:', err)
    );
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        userRole,
        lookupData,
        login,
        logout,
        checkAuth,
        setLookupData: updateLookupData,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextState => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
