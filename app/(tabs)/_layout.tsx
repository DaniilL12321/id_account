import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/app/context/theme';

export default function TabLayout() {
  const { isDarkMode, themeMode } = useTheme();
  const colorScheme = isDarkMode ? 'dark' : 'light';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        tabBarInactiveTintColor: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: Platform.OS === 'ios' ? TabBarBackground : undefined,
        tabBarStyle: {
          backgroundColor: themeMode === 'system' 
            ? (isDarkMode ? '#000000' : '#FFFFFF')
            : themeMode === 'dark' ? '#000000' : '#FFFFFF',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          ...Platform.select({
            ios: {
              position: 'absolute',
            },
          }),
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Главная',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="student"
        options={{
          title: 'Студент',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Настройки',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
