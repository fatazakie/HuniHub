import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../theme';

import HomeScreen from '../screens/guest/HomeScreen';
import ExploreScreen from '../screens/guest/ExploreScreen';
import FavoritesScreen from '../screens/guest/FavoritesScreen';
import MyBookingsScreen from '../screens/guest/MyBookingsScreen';
import ProfileScreen from '../screens/guest/ProfileScreen';
import PropertyDetailScreen from '../screens/guest/PropertyDetailScreen';
import BookingFormScreen from '../screens/guest/BookingFormScreen';
import BookingSummaryScreen from '../screens/guest/BookingSummaryScreen';
import BookingDetailScreen from '../screens/guest/BookingDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export const GuestBottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
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

          if (route.name === 'Beranda') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Eksplorasi') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Favorit') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Pesanan') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Profil') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Beranda" component={HomeScreen} />
      <Tab.Screen name="Eksplorasi" component={ExploreScreen} />
      <Tab.Screen name="Favorit" component={FavoritesScreen} />
      <Tab.Screen name="Pesanan" component={MyBookingsScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export const GuestNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="GuestTabs" component={GuestBottomTabs} />
      <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
      <Stack.Screen name="BookingForm" component={BookingFormScreen} />
      <Stack.Screen name="BookingSummary" component={BookingSummaryScreen} />
      <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
    </Stack.Navigator>
  );
};

export default GuestNavigator;
