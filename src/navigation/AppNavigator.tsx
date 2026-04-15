import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import UserManagementScreen from '../screens/applications/UserManagementScreen';
import ApplicationViewScreen from '../screens/applications/ApplicationViewScreen';

// Types
import { FormData } from '../types';

export type RootStackParamList = {
  Login: undefined;
  UserManagement: undefined;
  ApplicationView: { formData: FormData };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="UserManagement" component={UserManagementScreen} />
        <Stack.Screen name="ApplicationView" component={ApplicationViewScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
