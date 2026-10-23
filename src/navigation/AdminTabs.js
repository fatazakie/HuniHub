import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../theme';

import DashboardScreen from '../screens/admin/DashboardScreen';
import PropertyListScreen from '../screens/admin/PropertyListScreen';
import PropertyFormScreen from '../screens/admin/PropertyFormScreen';
import BookingListScreen from '../screens/admin/BookingListScreen';
import AdminBookingDetailScreen from '../screens/admin/AdminBookingDetailScreen';
import AdminProfileScreen from '../screens/admin/AdminProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export const AdminBottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderLight,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          ...typography.captionBold,
          fontSize: 11,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Hunian') {
            iconName = focused ? 'business' : 'business-outline';
          } else if (route.name === 'Reservasi') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'Profil') {
            iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Hunian" component={PropertyListScreen} />
      <Tab.Screen name="Reservasi" component={BookingListScreen} />
      <Tab.Screen name="Profil" component={AdminProfileScreen} />
    </Tab.Navigator>
  );
};

export const AdminNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="AdminTabs" component={AdminBottomTabs} />
      <Stack.Screen name="PropertyForm" component={PropertyFormScreen} />
      <Stack.Screen name="AdminBookingDetail" component={AdminBookingDetailScreen} />
    </Stack.Navigator>
  );
};

export default AdminNavigator;
