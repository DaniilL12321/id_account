import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  View,
  Modal,
  Animated,
  PanResponder,
  ViewStyle,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Container } from '@/components/ui/Container';
import { useTheme } from '@/app/context/theme';
import Constants from 'expo-constants';

const { OAUTH_URL } = Constants.expoConfig?.extra || {};

const webStyles = {
  minHeight: '100vh',
  marginTop: 16,
  margin: -16,
  paddingBottom: 80,
} as unknown as ViewStyle;

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
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isAdvancedMode, setIsAdvancedMode] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [logoutFadeAnim] = useState(new Animated.Value(0));
  const buildDate = new Date('2025-05-02'); // TODO: надо бы нормально конечно сделать, но пока так 😂
  const buildNumber = 5; // TODO: тут бы тоже 🙃
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

  const panResponder = useRef(
    PanResponder.create({
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
    }),
  ).current;

  const theme = {
    background: isDarkMode ? '#000000' : '#F2F3F7',
    cardBackground: isDarkMode ? '#1D1D1D' : '#FFFFFF',
    textColor: isDarkMode ? '#FFFFFF' : '#000000',
    secondaryText: isDarkMode
      ? 'rgba(255, 255, 255, 0.6)'
      : 'rgba(0, 0, 0, 0.6)',
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
    if (Platform.OS === 'web') {
      setShowLogoutModal(true);
      Animated.timing(logoutFadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Alert.alert('Выход', 'Вы уверены, что хотите выйти?', [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Выйти',
          style: 'destructive',
          onPress: performLogout,
        },
      ]);
    }
  };

  const hideLogoutModal = () => {
    Animated.timing(logoutFadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowLogoutModal(false);
    });
  };

  const performLogout = async () => {
    try {
      const tokens = await AsyncStorage.getItem('auth_tokens');
      if (!tokens) {
        router.replace('/auth');
        return;
      }
      const { access_token } = JSON.parse(tokens);

      const response = await fetch(`${OAUTH_URL}/logout`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      await response.json();

      await AsyncStorage.removeItem('auth_tokens');
      router.replace('/auth');
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось выйти из аккаунта');
    }
  };

  const ThemeOption = ({
    title,
    value,
  }: {
    title: string;
    value: ThemeMode;
  }) => (
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

  const downloadUrl = 'https://github.com/DaniilL12321/id_account/releases';
  const webAppUrl = 'https://ystu.expo.app/';

  return (
    <Container>
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <ScrollView
          style={[styles.scrollView, { backgroundColor: theme.background }]}
          contentContainerStyle={[
            styles.scrollContent,
            { padding: 16, gap: 16, paddingBottom: 80 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <ThemedText style={[styles.title, { color: theme.textColor }]}>
              Настройки
            </ThemedText>
          </View>

          <ThemedView
            style={[styles.section, { backgroundColor: theme.cardBackground }]}
          >
            <TouchableOpacity
              style={styles.settingsItem}
              onPress={() => setShowThemeModal(true)}
            >
              <IconSymbol
                name="moon.fill"
                size={20}
                color={theme.accentColor}
              />
              <ThemedText
                style={[styles.settingsItemText, { color: theme.textColor }]}
              >
                Тема
              </ThemedText>
              <ThemedText style={{ color: theme.secondaryText }}>
                {themeMode === 'light'
                  ? 'Светлая'
                  : themeMode === 'dark'
                  ? 'Тёмная'
                  : 'Системная'}
              </ThemedText>
              <IconSymbol
                name="chevron.right"
                size={16}
                color={theme.secondaryText}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.settingsItem, { opacity: 0.5 }]}
              disabled={true}
            >
              <IconSymbol
                name="gearshape.fill"
                size={20}
                color={theme.accentColor}
              />
              <ThemedText
                style={[styles.settingsItemText, { color: theme.textColor }]}
              >
                Расширенный режим
              </ThemedText>
              <IconSymbol
                name="chevron.right"
                size={16}
                color={theme.secondaryText}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.settingsItem, { opacity: 0.5 }]}
              disabled={true}
            >
              <IconSymbol
                name="bell.fill"
                size={20}
                color={theme.accentColor}
              />
              <ThemedText
                style={[styles.settingsItemText, { color: theme.textColor }]}
              >
                Уведомления
              </ThemedText>
              <IconSymbol
                name="chevron.right"
                size={16}
                color={theme.secondaryText}
              />
            </TouchableOpacity>
          </ThemedView>

          <ThemedView
            style={[styles.section, { backgroundColor: theme.cardBackground }]}
          >
            <TouchableOpacity
              style={[styles.settingsItem, { opacity: 0.5 }]}
              disabled={true}
            >
              <IconSymbol name="globe" size={20} color={theme.accentColor} />
              <ThemedText
                style={[styles.settingsItemText, { color: theme.textColor }]}
              >
                Язык
              </ThemedText>
              <ThemedText style={{ color: theme.secondaryText }}>
                Русский
              </ThemedText>
              <IconSymbol
                name="chevron.right"
                size={16}
                color={theme.secondaryText}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingsItem} onPress={showModal}>
              <IconSymbol
                name="info.circle.fill"
                size={20}
                color={theme.accentColor}
              />
              <ThemedText
                style={[styles.settingsItemText, { color: theme.textColor }]}
              >
                О приложении
              </ThemedText>
              <IconSymbol
                name="chevron.right"
                size={16}
                color={theme.secondaryText}
              />
            </TouchableOpacity>
          </ThemedView>

          {Platform.OS === 'web' ? (
            <ThemedView
              style={[
                styles.section,
                { backgroundColor: theme.cardBackground },
              ]}
            >
              <TouchableOpacity
                style={styles.settingsItem}
                onPress={() => Linking.openURL(downloadUrl)}
              >
                <IconSymbol
                  name="arrow.down.circle"
                  size={20}
                  color={theme.accentColor}
                />
                <ThemedText
                  style={[styles.settingsItemText, { color: theme.textColor }]}
                >
                  Скачать приложение
                </ThemedText>
                <IconSymbol
                  name="chevron.right"
                  size={16}
                  color={theme.secondaryText}
                />
              </TouchableOpacity>
            </ThemedView>
          ) : (
            <ThemedView
              style={[
                styles.section,
                { backgroundColor: theme.cardBackground },
              ]}
            >
              <TouchableOpacity
                style={styles.settingsItem}
                onPress={() => Linking.openURL(webAppUrl)}
              >
                <IconSymbol name="globe" size={20} color={theme.accentColor} />
                <ThemedText
                  style={[styles.settingsItemText, { color: theme.textColor }]}
                >
                  Открыть веб-версию
                </ThemedText>
                <IconSymbol
                  name="chevron.right"
                  size={16}
                  color={theme.secondaryText}
                />
              </TouchableOpacity>
            </ThemedView>
          )}

          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: '#FF3B30' }]}
            onPress={handleLogout}
          >
            <ThemedText style={styles.logoutButtonText}>
              Выйти из аккаунта
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

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
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.cardBackground,
                ...(Platform.OS === 'web'
                  ? {
                      maxWidth: 400,
                      marginHorizontal: 'auto',
                    }
                  : {}),
              },
            ]}
          >
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
        <Animated.View
          style={[
            styles.modalContainer,
            Platform.OS === 'web'
              ? {
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: fadeAnim,
                }
              : {},
          ]}
        >
          <TouchableOpacity
            style={styles.modalContainerTouchable}
            activeOpacity={1}
            onPress={hideModal}
          >
            <Animated.View
              style={[
                styles.infoModalContent,
                {
                  backgroundColor: theme.cardBackground,
                  transform:
                    Platform.OS === 'web'
                      ? [
                          {
                            scale: fadeAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.95, 1],
                            }),
                          },
                        ]
                      : [
                          {
                            translateY: Animated.add(
                              fadeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [300, 0],
                              }),
                              panY,
                            ),
                          },
                        ],
                  ...(Platform.OS === 'web'
                    ? {
                        position: 'relative',
                        maxWidth: 600,
                        width: '100%',
                        marginHorizontal: 'auto',
                        borderRadius: 16,
                        bottom: 'auto',
                      }
                    : {}),
                },
              ]}
              {...(Platform.OS !== 'web' ? panResponder.panHandlers : {})}
              onStartShouldSetResponder={() => true}
              onTouchEnd={(e) => e.stopPropagation()}
            >
              {Platform.OS !== 'web' && <View style={styles.dragIndicator} />}
              <View style={styles.infoModalHeader}>
                <ThemedText
                  style={[styles.infoModalTitle, { color: theme.textColor }]}
                >
                  О приложении
                </ThemedText>
                <TouchableOpacity onPress={hideModal}>
                  <IconSymbol
                    name="xmark"
                    size={20}
                    color={theme.secondaryText}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.infoContent}>
                <View style={styles.infoRow}>
                  <ThemedText style={{ color: theme.secondaryText }}>
                    Название
                  </ThemedText>
                  <ThemedText style={{ color: theme.textColor }}>
                    ЯГТУ ID
                  </ThemedText>
                </View>

                <View style={styles.infoRow}>
                  <ThemedText style={{ color: theme.secondaryText }}>
                    Версия
                  </ThemedText>
                  <ThemedText style={{ color: theme.textColor }}>
                    0.0.1
                  </ThemedText>
                </View>

                <View style={styles.infoRow}>
                  <ThemedText style={{ color: theme.secondaryText }}>
                    Сборка
                  </ThemedText>
                  <ThemedText style={{ color: theme.textColor }}>
                    {buildNumber}
                  </ThemedText>
                </View>

                <View style={styles.infoRow}>
                  <ThemedText style={{ color: theme.secondaryText }}>
                    Дата сборки
                  </ThemedText>
                  <ThemedText style={{ color: theme.textColor }}>
                    {buildDate.toLocaleDateString('ru-RU')}
                  </ThemedText>
                </View>

                <View style={[styles.infoRow, { alignItems: 'flex-start' }]}>
                  <ThemedText style={{ color: theme.secondaryText }}>
                    Описание
                  </ThemedText>
                  <ThemedText
                    style={[
                      { color: theme.textColor, flex: 1, textAlign: 'right' },
                    ]}
                  >
                    Мобильное приложение для студентов ЯГТУ
                  </ThemedText>
                </View>
              </View>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </Modal>

      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="none"
        onRequestClose={hideLogoutModal}
      >
        <Animated.View
          style={[
            styles.modalContainer,
            Platform.OS === 'web'
              ? {
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: logoutFadeAnim,
                }
              : {},
          ]}
        >
          <TouchableOpacity
            style={styles.modalContainerTouchable}
            activeOpacity={1}
            onPress={hideLogoutModal}
          >
            <Animated.View
              style={[
                styles.logoutModalContent,
                {
                  backgroundColor: theme.cardBackground,
                  transform:
                    Platform.OS === 'web'
                      ? [
                          {
                            scale: logoutFadeAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.95, 1],
                            }),
                          },
                        ]
                      : [],
                },
              ]}
              onStartShouldSetResponder={() => true}
              onTouchEnd={(e) => e.stopPropagation()}
            >
              <View style={styles.logoutModalHeader}>
                <ThemedText
                  style={[styles.logoutModalTitle, { color: theme.textColor }]}
                >
                  Выход
                </ThemedText>
              </View>

              <View style={styles.logoutModalBody}>
                <ThemedText
                  style={[styles.logoutModalText, { color: theme.textColor }]}
                >
                  Вы уверены, что хотите выйти?
                </ThemedText>
              </View>

              <View style={styles.logoutModalActions}>
                <TouchableOpacity
                  style={[
                    styles.logoutModalButton,
                    { backgroundColor: theme.cardBackground },
                  ]}
                  onPress={hideLogoutModal}
                >
                  <ThemedText
                    style={[
                      styles.logoutModalButtonText,
                      { color: theme.textColor },
                    ]}
                  >
                    Отмена
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.logoutModalButton,
                    styles.logoutModalButtonDanger,
                  ]}
                  onPress={() => {
                    hideLogoutModal();
                    performLogout();
                  }}
                >
                  <ThemedText
                    style={[styles.logoutModalButtonText, { color: '#FFFFFF' }]}
                  >
                    Выйти
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  } as ViewStyle,
  scrollView: {
    flex: 1,
    width: '100%',
  } as ViewStyle,
  scrollContent: {
    flexGrow: 1,
    ...Platform.select({
      web: webStyles,
    }),
  } as ViewStyle,
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
    padding: 16,
  },
  modalContent: {
    borderRadius: 14,
    padding: 8,
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
    ...Platform.select({
      web: {
        position: 'relative',
        maxWidth: 600,
        width: '100%',
        borderRadius: 16,
      },
      default: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      },
    }),
    paddingBottom: 40,
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
    ...Platform.select({
      web: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      },
      default: {
        flex: 1,
      },
    }),
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainerTouchable: {
    flex: 1,
    justifyContent: Platform.OS === 'web' ? 'center' : 'flex-end',
    alignItems: Platform.OS === 'web' ? 'center' : 'stretch',
    padding: Platform.OS === 'web' ? 16 : 0,
  },
  logoutModalContent: {
    ...Platform.select({
      web: {
        position: 'relative',
        maxWidth: 400,
        width: '100%',
        borderRadius: 16,
      },
      default: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      },
    }),
  },
  logoutModalHeader: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128, 128, 128, 0.3)',
  },
  logoutModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  logoutModalBody: {
    padding: 16,
  },
  logoutModalText: {
    fontSize: 16,
    textAlign: 'center',
  },
  logoutModalActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  logoutModalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutModalButtonDanger: {
    backgroundColor: '#FF3B30',
  },
  logoutModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
