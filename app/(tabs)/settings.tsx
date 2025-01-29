import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert, View, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/app/context/theme';

type ThemeMode = 'light' | 'dark' | 'system';

export default function SettingsScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SettingsContent />
    </>
  );
}

function SettingsContent() {
  const { themeMode, setThemeMode, isDarkMode } = useTheme();
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [isAdvancedMode, setIsAdvancedMode] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const theme = {
    background: isDarkMode ? '#000000' : '#F2F3F7',
    cardBackground: isDarkMode ? '#1D1D1D' : '#FFFFFF',
    textColor: isDarkMode ? '#FFFFFF' : '#000000',
    secondaryText: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    accentColor: '#2688EB',
  };

  const handleLogout = async () => {
    Alert.alert(
      'Выход',
      'Вы уверены, что хотите выйти?',
      [
        {
          text: 'Отмена',
          style: 'cancel'
        },
        {
          text: 'Выйти',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('auth_tokens');
              router.replace('/auth');
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось выйти из аккаунта');
            }
          }
        }
      ]
    );
  };

  const ThemeOption = ({ title, value }: { title: string; value: ThemeMode }) => (
    <TouchableOpacity
      style={[styles.themeOption, themeMode === value && styles.selectedOption]}
      onPress={() => {
        setThemeMode(value);
        setShowThemeModal(false);
      }}
    >
      <ThemedText style={styles.themeOptionText}>{title}</ThemedText>
      {themeMode === value && (
        <IconSymbol name="checkmark" size={20} color={theme.textColor} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText style={[styles.title, { color: theme.textColor }]}>
            Настройки
          </ThemedText>
        </View>

        <ThemedView style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <TouchableOpacity 
            style={styles.settingsItem}
            onPress={() => setShowThemeModal(true)}
          >
            <IconSymbol name="moon.fill" size={20} color={theme.accentColor} />
            <ThemedText style={[styles.settingsItemText, { color: theme.textColor }]}>
              Тема
            </ThemedText>
            <ThemedText style={{ color: theme.secondaryText }}>
              {themeMode === 'light' ? 'Светлая' : themeMode === 'dark' ? 'Тёмная' : 'Системная'}
            </ThemedText>
            <IconSymbol name="chevron.right" size={16} color={theme.secondaryText} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsItem}>
            <IconSymbol name="gearshape.fill" size={20} color={theme.accentColor} />
            <ThemedText style={[styles.settingsItemText, { color: theme.textColor }]}>
              Расширенный режим
            </ThemedText>
            <IconSymbol name="chevron.right" size={16} color={theme.secondaryText} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsItem}>
            <IconSymbol name="bell.fill" size={20} color={theme.accentColor} />
            <ThemedText style={[styles.settingsItemText, { color: theme.textColor }]}>
              Уведомления
            </ThemedText>
            <IconSymbol name="chevron.right" size={16} color={theme.secondaryText} />
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <TouchableOpacity style={styles.settingsItem}>
            <IconSymbol name="globe" size={20} color={theme.accentColor} />
            <ThemedText style={[styles.settingsItemText, { color: theme.textColor }]}>
              Язык
            </ThemedText>
            <ThemedText style={{ color: theme.secondaryText }}>
              Русский
            </ThemedText>
            <IconSymbol name="chevron.right" size={16} color={theme.secondaryText} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsItem}>
            <IconSymbol name="info.circle.fill" size={20} color={theme.accentColor} />
            <ThemedText style={[styles.settingsItemText, { color: theme.textColor }]}>
              О приложении
            </ThemedText>
            <IconSymbol name="chevron.right" size={16} color={theme.secondaryText} />
          </TouchableOpacity>
        </ThemedView>

        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: '#FF3B30' }]}
          onPress={handleLogout}
        >
          <ThemedText style={styles.logoutButtonText}>
            Выйти из аккаунта
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showThemeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1} 
          onPress={() => setShowThemeModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <ThemeOption title="Светлая" value="light" />
            <ThemeOption title="Тёмная" value="dark" />
            <ThemeOption title="Системная" value="system" />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  settingsItemText: {
    flex: 1,
    fontSize: 16,
  },
  logoutButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 14,
    overflow: 'hidden',
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  selectedOption: {
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
  },
  themeOptionText: {
    fontSize: 17,
  },
}); 