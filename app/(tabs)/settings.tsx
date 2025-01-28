import { View, Text, Switch, StyleSheet, ScrollView, Pressable, Modal, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme, type ThemeMode } from '../context/theme';

export default function SettingsScreen() {
  const { themeMode, setThemeMode, isDarkMode } = useTheme();
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [isAdvancedMode, setIsAdvancedMode] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const theme = {
    background: isDarkMode ? '#000000' : '#f6f6f6',
    card: isDarkMode ? '#1c1c1e' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#000000',
    secondaryText: isDarkMode ? '#8e8e93' : '#666666',
    border: isDarkMode ? '#38383A' : '#cccccc',
  };

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    container: {
      flex: 1,
    },
    title: {
      fontSize: 34,
      fontWeight: 'bold',
      padding: 16,
      paddingTop: 8,
      color: theme.text,
    },
    group: {
      marginBottom: 24,
    },
    groupHeader: {
      fontSize: 13,
      color: theme.secondaryText,
      textTransform: 'uppercase',
      marginLeft: 16,
      marginBottom: 8,
    },
    groupContent: {
      backgroundColor: theme.card,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border,
    },
    settingsItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: theme.card,
      justifyContent: 'space-between',
    },
    settingsItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    settingsItemText: {
      fontSize: 17,
      color: theme.text,
    },
    icon: {
      marginRight: 16,
    },
    rightText: {
      color: theme.secondaryText,
      marginRight: 8,
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
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    selectedOption: {
      backgroundColor: 'rgba(128, 128, 128, 0.1)',
    },
    themeOptionText: {
      fontSize: 17,
    },
  });

  const SettingsGroup = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.group}>
      <Text style={styles.groupHeader}>{title}</Text>
      <View style={styles.groupContent}>
        {children}
      </View>
    </View>
  );

  const SettingsItem = ({ 
    icon, 
    title, 
    value, 
    onValueChange,
    disabled = false,
    rightText,
  }: { 
    icon?: string;
    title: string;
    value?: boolean;
    onValueChange?: (value: boolean) => void;
    disabled?: boolean;
    rightText?: string;
  }) => (
    <View style={styles.settingsItem}>
      <View style={styles.settingsItemLeft}>
        {icon && <IconSymbol name={icon} size={24} color="#666" style={styles.icon} />}
        <Text style={styles.settingsItemText}>{title}</Text>
      </View>
      {onValueChange && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
        />
      )}
      {rightText && (
        <Text style={styles.rightText}>{rightText}</Text>
      )}
    </View>
  );

  const ThemeSelector = () => (
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
        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
          <ThemeOption title="Светлая" value="light" />
          <ThemeOption title="Тёмная" value="dark" />
          <ThemeOption title="Системная" value="system" />
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const ThemeOption = ({ title, value }: { title: string; value: ThemeMode }) => (
    <TouchableOpacity
      style={[styles.themeOption, themeMode === value && styles.selectedOption]}
      onPress={() => {
        setThemeMode(value);
        setShowThemeModal(false);
      }}
    >
      <Text style={[styles.themeOptionText, { color: theme.text }]}>{title}</Text>
      {themeMode === value && (
        <IconSymbol name="checkmark" size={20} color={theme.text} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentInsetAdjustmentBehavior="automatic">
        <Text style={styles.title}>Настройки</Text>

        <SettingsGroup title="Настройки">
          <SettingsItem
            title="Расширенный режим"
            value={isAdvancedMode}
            onValueChange={setIsAdvancedMode}
            disabled
          />
          <SettingsItem
            title="Показывать уведомления"
            value={showNotifications}
            onValueChange={setShowNotifications}
            disabled
          />
          <Pressable onPress={() => setShowThemeModal(true)}>
            <SettingsItem
              icon="moon"
              title="Тема"
              rightText={
                themeMode === 'light' ? 'Светлая' :
                themeMode === 'dark' ? 'Тёмная' : 'Системная'
              }
            />
          </Pressable>
        </SettingsGroup>

        <SettingsGroup title="Настройки системы">
          <SettingsItem
            title="Язык"
            rightText="Русский"
            disabled
          />
          <Pressable>
            <SettingsItem
              icon="info.circle"
              title="О приложении"
            />
          </Pressable>
        </SettingsGroup>
      </ScrollView>
      <ThemeSelector />
    </SafeAreaView>
  );
} 