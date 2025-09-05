import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/app/context/theme';

export default function TabLayout() {
  const { isDarkMode, themeMode } = useTheme();
  const colorScheme = isDarkMode ? 'dark' : 'light';

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8E8E93',
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground:
            Platform.OS === 'ios' ? TabBarBackground : undefined,
          tabBarStyle: Platform.select({
            ios: {
              position: 'absolute',
              backgroundColor:
                themeMode === 'system'
                  ? isDarkMode
                    ? '#000000'
                    : '#FFFFFF'
                  : themeMode === 'dark'
                    ? '#000000'
                    : '#FFFFFF',
              borderTopWidth: 0,
              elevation: 0,
              shadowOpacity: 0,
            },
            web: {
              position: 'fixed',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              maxWidth: 768,
              width: '100%',
              height: 60,
              paddingTop: 8,
              paddingBottom: 8,
              backgroundColor:
                themeMode === 'system'
                  ? isDarkMode
                    ? '#000000'
                    : '#FFFFFF'
                  : themeMode === 'dark'
                    ? '#000000'
                    : '#FFFFFF',
              borderTopWidth: 0,
              elevation: 0,
              shadowOpacity: 0,
              zIndex: 1000,
            },
            default: {
              backgroundColor:
                themeMode === 'system'
                  ? isDarkMode
                    ? '#000000'
                    : '#FFFFFF'
                  : themeMode === 'dark'
                    ? '#000000'
                    : '#FFFFFF',
              borderTopWidth: 0,
              elevation: 0,
              shadowOpacity: 0,
            },
          }),
          tabBarLabelStyle: Platform.select({
            web: {
              fontSize: 12,
              marginTop: 4,
            },
          }),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Главная',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="house.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="student"
          options={{
            title: 'Студент',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="person.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Настройки',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="gearshape.fill" color={color} />
            ),
          }}
        />
      </Tabs>
      {Platform.OS === 'web' && (
        <View style={styles.tabBarContainer}>
          <View style={styles.tabBarContent} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBarContainer: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'inherit',
    zIndex: -1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  tabBarContent: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    maxWidth: 768,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
});
