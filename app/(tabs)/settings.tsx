import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert, View, Modal, Animated, PanResponder } from 'react-native';
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
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isAdvancedMode, setIsAdvancedMode] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const buildDate = new Date();
  const buildNumber = Math.floor((Date.now() - buildDate.getTime()) / (1000 * 60 * 60 * 24));
  const [modalVisible, setModalVisible] = useState(false);
  const panY = useRef(new Animated.Value(0)).current;
  const resetPositionAnim = Animated.timing(panY, {
    toValue: 0,
    duration: 200,
    useNativeDriver: true,
  });

  const closeAnim = Animated.timing(panY, {
    toValue: 300,
    duration: 200,
    useNativeDriver: true,
  });

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        panY.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 50) {
        closeAnim.start(() => {
          hideModal();
          panY.setValue(0);
        });
      } else {
        resetPositionAnim.start();
      }
    },
  })).current;

  const theme = {
    background: isDarkMode ? '#000000' : '#F2F3F7',
    cardBackground: isDarkMode ? '#1D1D1D' : '#FFFFFF',
    textColor: isDarkMode ? '#FFFFFF' : '#000000',
    secondaryText: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    accentColor: '#2688EB',
  };

  const showModal = () => {
    panY.setValue(0);
    setModalVisible(true);
    setShowInfoModal(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const hideModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      panY.setValue(0);
      setModalVisible(false);
      setShowInfoModal(false);
    });
  };

  useEffect(() => {
    if (showInfoModal) {
      showModal();
    }
  }, [showInfoModal]);

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

          <TouchableOpacity style={[styles.settingsItem, { opacity: 0.5 }]}
              disabled={true}>
            <IconSymbol name="gearshape.fill" size={20} color={theme.accentColor} />
            <ThemedText style={[styles.settingsItemText, { color: theme.textColor }]}>
              Расширенный режим
            </ThemedText>
            <IconSymbol name="chevron.right" size={16} color={theme.secondaryText} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingsItem, { opacity: 0.5 }]}
              disabled={true}>
            <IconSymbol name="bell.fill" size={20} color={theme.accentColor} />
            <ThemedText style={[styles.settingsItemText, { color: theme.textColor }]}>
              Уведомления
            </ThemedText>
            <IconSymbol name="chevron.right" size={16} color={theme.secondaryText} />
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <TouchableOpacity style={[styles.settingsItem, { opacity: 0.5 }]}
              disabled={true}>
            <IconSymbol name="globe" size={20} color={theme.accentColor} />
            <ThemedText style={[styles.settingsItemText, { color: theme.textColor }]}>
              Язык
            </ThemedText>
            <ThemedText style={{ color: theme.secondaryText }}>
              Русский
            </ThemedText>
            <IconSymbol name="chevron.right" size={16} color={theme.secondaryText} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingsItem}
            onPress={showModal}
          >
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

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={hideModal}
      >
        <View style={styles.modalContainer}>
          <Animated.View 
            style={[
              styles.modalOverlay,
              {
                opacity: fadeAnim,
              }
            ]}
          >
            <TouchableOpacity 
              style={{ flex: 1 }}
              activeOpacity={1} 
              onPress={hideModal}
            />
          </Animated.View>
          <Animated.View 
            style={[
              styles.infoModalContent,
              { 
                backgroundColor: theme.cardBackground,
                transform: [
                  {
                    translateY: Animated.add(
                      fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [300, 0],
                      }),
                      panY
                    ),
                  },
                ],
              }
            ]}
            {...panResponder.panHandlers}
          >
            <View style={styles.dragIndicator} />
            <View style={styles.infoModalHeader}>
              <ThemedText style={[styles.infoModalTitle, { color: theme.textColor }]}>
                О приложении
              </ThemedText>
              <TouchableOpacity onPress={hideModal}>
                <IconSymbol name="xmark" size={20} color={theme.secondaryText} />
              </TouchableOpacity>
            </View>

            <View style={styles.infoContent}>
              <View style={styles.infoRow}>
                <ThemedText style={{ color: theme.secondaryText }}>Название</ThemedText>
                <ThemedText style={{ color: theme.textColor }}>ЯГТУ ID</ThemedText>
              </View>
              
              <View style={styles.infoRow}>
                <ThemedText style={{ color: theme.secondaryText }}>Версия</ThemedText>
                <ThemedText style={{ color: theme.textColor }}>1.0.0</ThemedText>
              </View>

              <View style={styles.infoRow}>
                <ThemedText style={{ color: theme.secondaryText }}>Сборка</ThemedText>
                <ThemedText style={{ color: theme.textColor }}>{buildNumber}</ThemedText>
              </View>

              <View style={styles.infoRow}>
                <ThemedText style={{ color: theme.secondaryText }}>Дата сборки</ThemedText>
                <ThemedText style={{ color: theme.textColor }}>
                  {buildDate.toLocaleDateString('ru-RU')}
                </ThemedText>
              </View>

              <View style={[styles.infoRow, { alignItems: 'flex-start' }]}>
                <ThemedText style={{ color: theme.secondaryText }}>Описание</ThemedText>
                <ThemedText style={[{ color: theme.textColor, flex: 1, textAlign: 'right' }]}>
                  Мобильное приложение для студентов ЯГТУ
                </ThemedText>
              </View>
            </View>
          </Animated.View>
        </View>
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
  },
  modalContent: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '80%',
    transform: [{ translateX: -150 }, { translateY: -75 }],
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'white',
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
  infoModalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    transform: [{ translateY: 0 }],
  },
  dragIndicator: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(128, 128, 128, 0.3)',
    borderRadius: 2,
    marginTop: 8,
    marginBottom: 4,
    alignSelf: 'center',
  },
  infoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128, 128, 128, 0.3)',
  },
  infoModalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  infoContent: {
    padding: 16,
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
  },
}); 