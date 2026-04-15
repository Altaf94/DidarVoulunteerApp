import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomInput from '../../components/CustomInput/CustomInput';
import Alert from '../../components/Alert/Alert';
import IsmailiLoader from '../../components/shared/IsmailiLoader';
import CustomModal from '../../components/CustomModal/CustomModal';
import { colors } from '../../theme';
import { useAlert } from '../../hooks/useAlert';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import { tokenService } from '../../services/tokenService';
import { decodeJWT } from '../../utils/base64';

// Import images
const LoginImage = require('../../assets/images/LoginImage.png');
const IsmailiLogo = require('../../assets/images/ismaililogo.png');

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  Login: undefined;
  UserManagement: undefined;
  ApplicationView: { formData: any };
};

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [emailError, setEmailError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  const { alert, showError, showSuccess, hideAlert } = useAlert();
  const [emailAlert, setEmailAlert] = useState({ isVisible: false, message: '' });
  const { login } = useAuth();

  // Email validation
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation
  const isValidPassword = (pwd: string): boolean => {
    return pwd.length >= 6;
  };

  const isFormValid = isValidEmail(username) && isValidPassword(password);

  // Load saved email on mount
  useEffect(() => {
    loadSavedCredentials();
    testApiConnection();
  }, []);

  const loadSavedCredentials = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem('rememberedEmail');
      const savedRememberMe = await AsyncStorage.getItem('rememberMe');

      if (savedEmail && savedRememberMe === 'true') {
        setUsername(savedEmail);
        setRememberMe(true);
      }
    } catch (error) {
      console.error('Error loading saved credentials:', error);
    }
  };

  const testApiConnection = async () => {
    try {
      const isConnected = await apiService.testConnection();
      setApiConnected(isConnected);
    } catch (error) {
      console.error('API connection test failed:', error);
      setApiConnected(false);
    }
  };

  const validateEmail = (email: string) => {
    if (!email.trim()) {
      setEmailError('');
      setEmailAlert({ isVisible: false, message: '' });
    } else if (!isValidEmail(email)) {
      setEmailError('Please enter a valid Email Address');
      setEmailAlert({
        isVisible: true,
        message: 'Please enter a valid Email Address',
      });
    } else {
      setEmailError('');
      setEmailAlert({ isVisible: false, message: '' });
    }
  };

  const handleEmailChange = (value: string) => {
    setUsername(value.toLowerCase());
    if (emailError) {
      setEmailError('');
      setEmailAlert({ isVisible: false, message: '' });
    }
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    validateEmail(username);
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail.trim()) {
      showError('Validation Error', 'Please enter your email address');
      return;
    }

    if (!isValidEmail(forgotPasswordEmail)) {
      showError('Validation Error', 'Please enter a valid email address');
      return;
    }

    setForgotPasswordLoading(true);
    try {
      await apiService.forgotPassword(forgotPasswordEmail);
      showSuccess(
        'Success',
        'Password reset email sent successfully! Please check your inbox.'
      );
      setShowForgotPasswordModal(false);
      setForgotPasswordEmail('');
    } catch (error: any) {
      console.error('Forgot password error:', error);
      showError(
        'Error',
        error.message || 'Failed to send reset email. Please try again.'
      );
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleSignIn = async () => {
    hideAlert();
    setLoading(true);

    if (!username.trim() || !password.trim()) {
      showError('Validation Error', 'Username and password are required');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting login...');
      const data = await apiService.login({ username, password });

      if (data.access_token && data.refresh_token) {
        // Check user role
        const decodedToken = decodeJWT(data.access_token);
        
        if (!decodedToken) {
          throw new Error('Invalid token received');
        }
        
        const userRole = decodedToken.role;

        // Only Admin (3) and Checker (2) can login
        if (userRole !== 2 && userRole !== 3) {
          throw new Error(
            'Access denied. Only Administrators and Checkers can access this system.'
          );
        }

        await login(data.access_token, data.refresh_token, data.user);

        // Handle Remember Me
        if (rememberMe) {
          await AsyncStorage.setItem('rememberedEmail', username);
          await AsyncStorage.setItem('rememberMe', 'true');
        } else {
          await AsyncStorage.removeItem('rememberedEmail');
          await AsyncStorage.removeItem('rememberMe');
        }

        console.log('Login successful! Redirecting...');
        navigation.replace('UserManagement');
      } else {
        throw new Error('Both access token and refresh token are required');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      showError(
        'Login Failed',
        err.message || 'Incorrect Email Address or Password'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <IsmailiLoader visible={loading} message="Signing In..." />

        <Alert
          type={alert.type}
          message={alert.message}
          isVisible={alert.isVisible}
          onClose={hideAlert}
          autoClose
          autoCloseDelay={15000}
        />

        <Alert
          type="error"
          message={emailAlert.message}
          isVisible={emailAlert.isVisible}
          onClose={() => setEmailAlert({ isVisible: false, message: '' })}
          autoClose
          autoCloseDelay={5000}
        />

        <View style={styles.card}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image source={IsmailiLogo} style={styles.logo} resizeMode="contain" />
          </View>

          {/* Title */}
          <Text style={styles.title}>Welcome to MHIP</Text>
          <Text style={styles.subtitle}>
            Enter the credentials shared by your respective Council
          </Text>

          {/* Form */}
          <View style={styles.form}>
            <CustomInput
              type="email"
              label="Email Address"
              placeholder="Enter your Email Address"
              value={username}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              error={emailTouched && !!emailError}
            />

            <CustomInput
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={setPassword}
            />

            {/* Remember Me & Forgot Password */}
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setRememberMe(!rememberMe)}>
                <View
                  style={[
                    styles.checkbox,
                    rememberMe && styles.checkboxChecked,
                  ]}>
                  {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Remember this device</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowForgotPasswordModal(true)}>
                <Text style={styles.forgotPassword}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* API Connection Status */}
            {apiConnected === false && (
              <Text style={styles.connectionError}>
                ⚠️ Cannot connect to server. Please check your internet
                connection.
              </Text>
            )}

            {/* Sign In Button */}
            <TouchableOpacity
              style={[
                styles.signInButton,
                (!isFormValid || loading || apiConnected === false) &&
                  styles.signInButtonDisabled,
              ]}
              onPress={handleSignIn}
              disabled={loading || apiConnected === false || !isFormValid}>
              <Text style={styles.signInButtonText}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Forgot Password Modal */}
        <CustomModal
          show={showForgotPasswordModal}
          onClose={() => {
            setShowForgotPasswordModal(false);
            setForgotPasswordEmail('');
          }}
          size="sm"
          title="Forgot Password">
          <View style={styles.modalContent}>
            <CustomInput
              type="email"
              label="Email Address *"
              placeholder="Enter your email address"
              value={forgotPasswordEmail}
              onChange={setForgotPasswordEmail}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowForgotPasswordModal(false);
                  setForgotPasswordEmail('');
                }}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (forgotPasswordLoading || !forgotPasswordEmail.trim()) &&
                    styles.submitButtonDisabled,
                ]}
                onPress={handleForgotPassword}
                disabled={forgotPasswordLoading || !forgotPasswordEmail.trim()}>
                <Text style={styles.submitButtonText}>
                  {forgotPasswordLoading ? 'Sending...' : 'Send Reset Email'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </CustomModal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 60,
    height: 57,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  form: {
    width: '100%',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  checkboxLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  forgotPassword: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
  },
  connectionError: {
    color: colors.errorLight,
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  signInButton: {
    backgroundColor: colors.primary,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  signInButtonDisabled: {
    backgroundColor: colors.textMuted,
  },
  signInButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  modalContent: {
    paddingTop: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.white,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
  },
  submitButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  submitButtonDisabled: {
    backgroundColor: colors.textMuted,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.white,
  },
});

export default LoginScreen;
