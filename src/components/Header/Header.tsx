import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
} from 'react-native';
import { ChevronDown, Bell } from 'lucide-react-native';
import { colors } from '../../theme';
import { tokenService } from '../../services/tokenService';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decodeJWT } from '../../utils/base64';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showNotifications?: boolean;
  showProfile?: boolean;
  onLogout?: () => void;
  onChangePassword?: () => void;
}

interface UserProfile {
  name: string;
  email: string;
  initial: string;
  role?: number;
}

// Import logo image - you'll need to add the logo to assets folder
const ismailiLogo = require('../../assets/images/ismaililogo.png');

const Header: React.FC<HeaderProps> = ({
  title = 'Welcome to MHIP',
  subtitle,
  showNotifications = true,
  showProfile = true,
  onLogout,
  onChangePassword,
}) => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'User',
    email: '',
    initial: 'U',
  });
  const { logout } = useAuth();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');

      if (token) {
        const decodedToken = decodeJWT(token);
        
        if (decodedToken) {
          const name =
            decodedToken.name || decodedToken.username || decodedToken.sub || 'User';
          let email = decodedToken.email;

          if (!email) {
            const rememberedEmail = await AsyncStorage.getItem('rememberedEmail');
            if (rememberedEmail) {
              email = rememberedEmail;
            }
          }

          if (!email && userData) {
            try {
              const parsedUserData = JSON.parse(userData);
              email = parsedUserData.email || parsedUserData.username || '';
            } catch (parseError) {
              console.error('Error parsing user data:', parseError);
            }
          }

          setUserProfile({
            name,
            email: email || '',
            initial: name.charAt(0).toUpperCase(),
            role: decodedToken.role,
          });
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const getRoleName = (role: number): string => {
    switch (role) {
      case 1:
        return 'Maker';
      case 2:
        return 'Checker';
      case 3:
        return 'Admin';
      default:
        return 'User';
    }
  };

  const handleLogout = async () => {
    setIsProfileDropdownOpen(false);
    await logout();
    if (onLogout) {
      onLogout();
    }
  };

  const renderTitle = () => {
    if (title === 'Welcome to MHIP') {
      return (
        <>
          <Text style={styles.titleText}>Welcome to</Text>
          <Text style={styles.titleText}>MHIP</Text>
        </>
      );
    } else if (title === 'Enrolment Portal') {
      return (
        <>
          <Text style={styles.titleText}>Enrolment Portal</Text>
          <Text style={styles.titleText}>for Pakistan</Text>
        </>
      );
    } else {
      return <Text style={styles.titleText}>{title}</Text>;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <Image source={ismailiLogo} style={styles.logo} resizeMode="contain" />
        <View style={styles.titleContainer}>
          {renderTitle()}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>

      {showProfile && (
        <View style={styles.rightSection}>
          <TouchableOpacity
            onPress={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            style={styles.profileButton}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userProfile.initial}</Text>
            </View>
            <ChevronDown color={colors.primaryDark} size={16} />
          </TouchableOpacity>

          <Modal
            visible={isProfileDropdownOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setIsProfileDropdownOpen(false)}>
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setIsProfileDropdownOpen(false)}>
              <View style={styles.dropdown}>
                <View style={styles.dropdownHeader}>
                  <Text style={styles.dropdownName} numberOfLines={1}>
                    {userProfile.name}
                  </Text>
                  <Text style={styles.dropdownEmail} numberOfLines={1}>
                    {userProfile.email}
                  </Text>
                  {userProfile.role && (
                    <Text style={styles.dropdownRole}>
                      {getRoleName(userProfile.role)}
                    </Text>
                  )}
                </View>
                <View style={styles.dropdownDivider} />
                {onChangePassword && (
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setIsProfileDropdownOpen(false);
                      onChangePassword();
                    }}>
                    <Text style={styles.dropdownItemText}>Change Password</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={handleLogout}>
                  <Text style={[styles.dropdownItemText, styles.logoutText]}>
                    Logout
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  titleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryDark,
    lineHeight: 18,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 80,
    paddingRight: 16,
  },
  dropdown: {
    backgroundColor: colors.white,
    borderRadius: 8,
    width: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownHeader: {
    padding: 12,
  },
  dropdownName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  dropdownEmail: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  dropdownRole: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
    marginTop: 4,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownItemText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  logoutText: {
    color: colors.errorLight,
  },
});

export default Header;
