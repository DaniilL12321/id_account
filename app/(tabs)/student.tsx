import {
  StyleSheet,
  Platform,
  ScrollView,
  Image,
  TouchableOpacity,
  View,
  ViewStyle,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { CheckResponse, UserDetailsResponse } from '@/types/api';
import Constants from 'expo-constants';
import { useTheme } from '@/app/context/theme';
import { Container } from '@/components/ui/Container';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
  withDelay,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';

const { OAUTH_URL, API_URL } = Constants.expoConfig?.extra || {};

interface InfoItemProps {
  label: string;
  value: string;
  theme: ThemeConfig;
  isDark?: boolean;
  style?: any;
}

interface ActionButtonProps {
  icon: string;
  text: string;
  theme: ThemeConfig;
  style?: any;
  onPress: () => void;
  isDark?: boolean;
}

interface ThemeConfig {
  background: string;
  cardBackground: string;
  textColor: string;
  secondaryText: string;
  borderColor: string;
  accentColor: string;
}

const webStyles = {
  minHeight: '100vh',
  marginTop: 16,
  margin: -16,
  paddingBottom: 80,
} as unknown as ViewStyle;

const SkeletonLoader = ({ style }: { style: ViewStyle }) => {
  const opacity = useSharedValue(0.3);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withDelay(Math.random() * 500, withTiming(0.7, { duration: 1000 })),
        withTiming(0.3, { duration: 1000 }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        style,
        animatedStyle,
        { backgroundColor: 'rgba(120, 120, 128, 0.2)' },
      ]}
    />
  );
};

const StudentProfileSkeleton = ({ theme }: { theme: ThemeConfig }) => {
  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        styles.scrollContent,
        { padding: 16, gap: 16, paddingBottom: 80 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <ThemedView
        style={[
          styles.profileHeader,
          { backgroundColor: theme.cardBackground },
        ]}
      >
        <SkeletonLoader style={{ width: 80, height: 80, borderRadius: 40 }} />
        <SkeletonLoader
          style={{ width: 200, height: 24, borderRadius: 8, marginTop: 16 }}
        />
        <SkeletonLoader
          style={{ width: 250, height: 18, borderRadius: 8, marginTop: 4 }}
        />
      </ThemedView>

      <ThemedView
        style={[styles.section, { backgroundColor: theme.cardBackground }]}
      >
        {[1, 2, 3].map((i) => (
          <ThemedView key={i} style={styles.sectionItem}>
            <SkeletonLoader
              style={{ width: 20, height: 20, borderRadius: 10 }}
            />
            <SkeletonLoader style={{ flex: 1, height: 20, borderRadius: 8 }} />
            <SkeletonLoader
              style={{ width: 16, height: 16, borderRadius: 8 }}
            />
          </ThemedView>
        ))}
      </ThemedView>

      <ThemedView
        style={[styles.section, { backgroundColor: theme.cardBackground }]}
      >
        <SkeletonLoader
          style={{
            width: 120,
            height: 22,
            borderRadius: 8,
            margin: 16,
            marginBottom: 8,
          }}
        />
        {[1, 2, 3].map((i) => (
          <ThemedView key={i} style={styles.sectionItem}>
            <SkeletonLoader
              style={{ width: 20, height: 20, borderRadius: 10 }}
            />
            <SkeletonLoader style={{ flex: 1, height: 20, borderRadius: 8 }} />
            <SkeletonLoader
              style={{ width: 16, height: 16, borderRadius: 8 }}
            />
          </ThemedView>
        ))}
      </ThemedView>

      <ThemedView
        style={[styles.section, { backgroundColor: theme.cardBackground }]}
      >
        {[1, 2].map((i) => (
          <ThemedView key={i} style={styles.sectionItem}>
            <SkeletonLoader
              style={{ width: 20, height: 20, borderRadius: 10 }}
            />
            <SkeletonLoader style={{ flex: 1, height: 20, borderRadius: 8 }} />
            <SkeletonLoader
              style={{ width: 16, height: 16, borderRadius: 8 }}
            />
          </ThemedView>
        ))}
      </ThemedView>
    </ScrollView>
  );
};

export default function StudentProfileScreen() {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<
    CheckResponse['auth_info']['user'] | null
  >(null);
  const [userDetails, setUserDetails] = useState<UserDetailsResponse | null>(
    null,
  );
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);

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

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const tokens = await AsyncStorage.getItem('auth_tokens');
      if (!tokens) {
        router.replace('/auth');
        return;
      }

      const { access_token } = JSON.parse(tokens);

      const checkResponse = await fetch(`${OAUTH_URL}/check`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      if (!checkResponse.ok) {
        throw new Error('Ошибка получения данных профиля');
      }

      const checkData: CheckResponse = await checkResponse.json();
      setUserInfo(checkData.auth_info.user);

      const detailsResponse = await fetch(`${API_URL}/s/general/v1/user/my`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      if (!detailsResponse.ok) {
        throw new Error('Ошибка получения детальных данных');
      }

      const detailsData: UserDetailsResponse = await detailsResponse.json();
      setUserDetails(detailsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleInfoPress = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/info');
  };

  const handleMarksPress = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push('/marks');
  };

  const handleDisabledPress = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  const handleAvatarPress = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (userInfo?.photoUrl) {
      setIsImageModalVisible(true);
    }
  };

  if (loading || error || !userInfo || !userDetails) {
    return (
      <Container>
        <SafeAreaView
          style={[styles.container, { backgroundColor: theme.background }]}
        >
          {loading ? (
            <StudentProfileSkeleton theme={theme} />
          ) : (
            <ThemedView style={styles.loadingContainer}>
              <ThemedText style={styles.error}>
                {error || 'Не удалось загрузить данные'}
              </ThemedText>
            </ThemedView>
          )}
        </SafeAreaView>
      </Container>
    );
  }

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
          <ThemedView
            style={[
              styles.profileHeader,
              { backgroundColor: theme.cardBackground },
            ]}
          >
            {userInfo.photoUrl ? (
              <TouchableOpacity onPress={handleAvatarPress}>
                <Image
                  source={{ uri: userInfo.photoUrl }}
                  style={styles.avatar}
                />
              </TouchableOpacity>
            ) : (
              <ThemedView
                style={[
                  styles.avatarPlaceholder,
                  { backgroundColor: theme.accentColor },
                ]}
              >
                <ThemedText style={styles.avatarText}>
                  {userInfo.firstName[0]}
                  {userInfo.lastName[0]}
                </ThemedText>
              </ThemedView>
            )}
            <ThemedText style={[styles.userName, { color: theme.textColor }]}>
              {userInfo.firstName} {userInfo.lastName}
            </ThemedText>
            <ThemedText
              style={[styles.userGroup, { color: theme.secondaryText }]}
            >
              {userInfo.groupName} • {userDetails.course} курс •{' '}
              {userDetails.sourceFinancingStr}
            </ThemedText>
          </ThemedView>

          <ThemedView
            style={[styles.section, { backgroundColor: theme.cardBackground }]}
          >
            <TouchableOpacity
              style={styles.sectionItem}
              onPress={handleInfoPress}
            >
              <IconSymbol
                name="person.fill"
                size={20}
                color={theme.accentColor}
              />
              <ThemedText
                style={[styles.sectionItemText, { color: theme.textColor }]}
              >
                Личная информация
              </ThemedText>
              <IconSymbol
                name="chevron.right"
                size={16}
                color={theme.secondaryText}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sectionItem}
              onPress={handleMarksPress}
            >
              <IconSymbol
                name="chart.bar.fill"
                size={20}
                color={theme.accentColor}
              />
              <ThemedText
                style={[styles.sectionItemText, { color: theme.textColor }]}
              >
                Полная успеваемость
              </ThemedText>
              <IconSymbol
                name="chevron.right"
                size={16}
                color={theme.secondaryText}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sectionItem, { opacity: 0.5 }]}
              onPress={handleDisabledPress}
              disabled={true}
            >
              <IconSymbol
                name="photo.fill"
                size={20}
                color={theme.accentColor}
              />
              <ThemedText
                style={[styles.sectionItemText, { color: theme.textColor }]}
              >
                Портфолио
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
            <ThemedText
              style={[styles.sectionTitle, { color: theme.textColor }]}
            >
              Документы
            </ThemedText>

            <TouchableOpacity
              style={[styles.sectionItem, { opacity: 0.5 }]}
              onPress={handleDisabledPress}
              disabled={true}
            >
              <IconSymbol name="doc.fill" size={20} color={theme.accentColor} />
              <ThemedText
                style={[styles.sectionItemText, { color: theme.textColor }]}
              >
                Справки
              </ThemedText>
              {/* <ThemedView style={styles.badge}>
                <ThemedText style={styles.badgeText}>Новое</ThemedText>
              </ThemedView> */}
              <IconSymbol
                name="chevron.right"
                size={16}
                color={theme.secondaryText}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sectionItem, { opacity: 0.5 }]}
              onPress={handleDisabledPress}
              disabled={true}
            >
              <IconSymbol
                name="doc.text.fill"
                size={20}
                color={theme.accentColor}
              />
              <ThemedText
                style={[styles.sectionItemText, { color: theme.textColor }]}
              >
                Заявления
              </ThemedText>
              <IconSymbol
                name="chevron.right"
                size={16}
                color={theme.secondaryText}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sectionItem, { opacity: 0.5 }]}
              onPress={handleDisabledPress}
              disabled={true}
            >
              <IconSymbol name="qrcode" size={20} color={theme.accentColor} />
              <ThemedText
                style={[styles.sectionItemText, { color: theme.textColor }]}
              >
                QR Сертификаты
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
              style={[styles.sectionItem, { opacity: 0.5 }]}
              onPress={handleDisabledPress}
              disabled={true}
            >
              <IconSymbol name="gear" size={20} color={theme.accentColor} />
              <ThemedText
                style={[styles.sectionItemText, { color: theme.textColor }]}
              >
                Настройки профиля
              </ThemedText>
              <IconSymbol
                name="chevron.right"
                size={16}
                color={theme.secondaryText}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sectionItem, { opacity: 0.5 }]}
              onPress={handleDisabledPress}
              disabled={true}
            >
              <IconSymbol name="bell" size={20} color={theme.accentColor} />
              <ThemedText
                style={[styles.sectionItemText, { color: theme.textColor }]}
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
        </ScrollView>

        <Modal
          visible={isImageModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsImageModalVisible(false)}
        >
          <BlurView intensity={100} style={styles.modalContainer}>
            <Pressable
              style={styles.modalContent}
              onPress={async () => {
                if (Platform.OS !== 'web') {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }
                setIsImageModalVisible(false);
              }}
            >
              <Image
                source={{ uri: userInfo?.photoUrl }}
                style={styles.modalImage}
                resizeMode="contain"
              />
              <IconSymbol
                name="xmark.circle.fill"
                size={32}
                color="white"
                style={styles.closeButton}
              />
            </Pressable>
          </BlurView>
        </Modal>
      </SafeAreaView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: -34,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  error: {
    color: '#FF3B30',
    textAlign: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  userGroup: {
    fontSize: 15,
  },
  section: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    padding: 16,
    paddingBottom: 8,
  },
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  sectionItemText: {
    flex: 1,
    fontSize: 16,
  },
  badge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalImage: {
    width: '120%',
    aspectRatio: 1,
    maxWidth: 315,
    borderRadius: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
});
