// ============================================
// VOLUNTEER NAVIGATOR
// Navigation stack for Volunteer Management System
// ============================================

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  Home,
  Upload,
  FileCheck,
  Printer,
  Package,
  BarChart3,
  Users,
} from 'lucide-react-native';

import {
  MakerHomeScreen,
  VolunteerUploadScreen,
  VolunteerReviewScreen,
  CheckerHomeScreen,
  PrintBadgesScreen,
  DispatchPackagesScreen,
  DashboardScreen,
} from '../screens/volunteer';

import { colors } from '../theme';
import {
  Region,
  VolunteerStatus,
  UserRole,
} from '../types/volunteer';

// ============================================
// TYPE DEFINITIONS
// ============================================

export type MakerStackParamList = {
  MakerHome: undefined;
  VolunteerUpload: undefined;
  VolunteerReview: { batchId?: string; status?: VolunteerStatus };
  VolunteerDetail: { volunteerId: string };
};

export type CheckerStackParamList = {
  CheckerHome: undefined;
  CheckerReview: { region?: Region };
  PrintBadges: undefined;
  DispatchPackages: undefined;
  VolunteerDetail: { volunteerId: string };
};

export type DashboardStackParamList = {
  Dashboard: undefined;
  RegionDetail: { region: Region };
  EventDetail: { eventId: string };
};

export type VolunteerTabParamList = {
  HomeTab: undefined;
  UploadTab: undefined;
  ReviewTab: undefined;
  PrintTab: undefined;
  DashboardTab: undefined;
};

// ============================================
// STACK NAVIGATORS
// ============================================

const MakerStack = createNativeStackNavigator<MakerStackParamList>();
const CheckerStack = createNativeStackNavigator<CheckerStackParamList>();
const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();
const Tab = createBottomTabNavigator<VolunteerTabParamList>();

// ============================================
// MAKER NAVIGATOR
// ============================================

export const MakerNavigator: React.FC = () => {
  return (
    <MakerStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <MakerStack.Screen name="MakerHome" component={MakerHomeScreen} />
      <MakerStack.Screen name="VolunteerUpload" component={VolunteerUploadScreen} />
      <MakerStack.Screen name="VolunteerReview" component={VolunteerReviewScreen} />
    </MakerStack.Navigator>
  );
};

// ============================================
// CHECKER NAVIGATOR
// ============================================

export const CheckerNavigator: React.FC = () => {
  return (
    <CheckerStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <CheckerStack.Screen name="CheckerHome" component={CheckerHomeScreen} />
      <CheckerStack.Screen name="PrintBadges" component={PrintBadgesScreen} />
      <CheckerStack.Screen name="DispatchPackages" component={DispatchPackagesScreen} />
    </CheckerStack.Navigator>
  );
};

// ============================================
// DASHBOARD NAVIGATOR
// ============================================

export const DashboardNavigator: React.FC = () => {
  return (
    <DashboardStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <DashboardStack.Screen name="Dashboard" component={DashboardScreen} />
    </DashboardStack.Navigator>
  );
};

// ============================================
// MAKER TAB NAVIGATOR
// ============================================

export const MakerTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.cardBackground,
          borderTopColor: colors.border,
          paddingTop: 8,
          paddingBottom: 8,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarIcon: ({ focused, color, size }) => {
          switch (route.name) {
            case 'HomeTab':
              return <Home size={24} color={color} />;
            case 'UploadTab':
              return <Upload size={24} color={color} />;
            case 'ReviewTab':
              return <FileCheck size={24} color={color} />;
            case 'DashboardTab':
              return <BarChart3 size={24} color={color} />;
            default:
              return <Home size={24} color={color} />;
          }
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={MakerNavigator}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="UploadTab"
        component={VolunteerUploadScreen}
        options={{ tabBarLabel: 'Upload' }}
      />
      <Tab.Screen
        name="ReviewTab"
        component={VolunteerReviewScreen}
        options={{ tabBarLabel: 'Review' }}
        initialParams={{}}
      />
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Dashboard' }}
      />
    </Tab.Navigator>
  );
};

// ============================================
// CHECKER TAB NAVIGATOR
// ============================================

export const CheckerTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.cardBackground,
          borderTopColor: colors.border,
          paddingTop: 8,
          paddingBottom: 8,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarIcon: ({ focused, color, size }) => {
          switch (route.name) {
            case 'HomeTab':
              return <Home size={24} color={color} />;
            case 'ReviewTab':
              return <FileCheck size={24} color={color} />;
            case 'PrintTab':
              return <Printer size={24} color={color} />;
            case 'DashboardTab':
              return <BarChart3 size={24} color={color} />;
            default:
              return <Home size={24} color={color} />;
          }
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={CheckerNavigator}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="ReviewTab"
        component={VolunteerReviewScreen}
        options={{ tabBarLabel: 'Review' }}
        initialParams={{}}
      />
      <Tab.Screen
        name="PrintTab"
        component={PrintBadgesScreen}
        options={{ tabBarLabel: 'Print' }}
      />
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Dashboard' }}
      />
    </Tab.Navigator>
  );
};

// ============================================
// GET NAVIGATOR BY ROLE
// ============================================

export const getNavigatorByRole = (role: UserRole) => {
  switch (role) {
    case UserRole.MAKER:
      return MakerTabNavigator;
    case UserRole.CHECKER:
      return CheckerTabNavigator;
    case UserRole.VIEW_ONLY:
    default:
      return DashboardNavigator;
  }
};

export default {
  MakerNavigator,
  CheckerNavigator,
  DashboardNavigator,
  MakerTabNavigator,
  CheckerTabNavigator,
  getNavigatorByRole,
};
