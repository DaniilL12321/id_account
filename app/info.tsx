import React, { useEffect, useState } from 'react';
import { 
  ScrollView, 
  TouchableOpacity, 
  View, 
  Platform, 
  StyleSheet, 
  type ViewStyle 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Container } from '@/components/ui/Container';
import { useTheme } from '@/app/context/theme';
import { CheckResponse, UserDetailsResponse } from '@/types/api';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Constants from 'expo-constants';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
  withDelay
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import type { MaterialIcons as MaterialIconsType } from '@expo/vector-icons';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';

const { OAUTH_URL, API_URL } = Constants.expoConfig?.extra || {};

interface InfoItemProps {
  icon: keyof typeof ICON_MAPPING;
  label: string;
  value: string;
  theme: any;
}

const ICON_MAPPING = {
  'person.fill': {
    sf: 'person.fill',
    material: 'person' as keyof typeof MaterialIconsType.glyphMap
  },
  'creditcard.fill': {
    sf: 'creditcard.fill',
    material: 'credit-card' as keyof typeof MaterialIconsType.glyphMap
  },
  'number.circle.fill': {
    sf: 'number.circle.fill',
    material: 'school' as keyof typeof MaterialIconsType.glyphMap
  },
  'doc.text.fill': {
    sf: 'doc.text.fill',
    material: 'description' as keyof typeof MaterialIconsType.glyphMap
  },
  'envelope.fill': {
    sf: 'envelope.fill',
    material: 'email' as keyof typeof MaterialIconsType.glyphMap
  },
  'phone.fill': {
    sf: 'phone.fill',
    material: 'phone' as keyof typeof MaterialIconsType.glyphMap
  },
  'calendar': {
    sf: 'calendar',
    material: 'calendar-today' as keyof typeof MaterialIconsType.glyphMap
  },
  'chevron.left': {
    sf: 'chevron.left',
    material: 'chevron-left' as keyof typeof MaterialIconsType.glyphMap
  }
} as const;

export default function InfoScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <InfoContent />
    </>
  );
}

function InfoContent() {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<CheckResponse['auth_info']['user'] | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetailsResponse | null>(null);

  const theme = {
    background: isDarkMode ? '#000000' : '#F2F3F7',
    cardBackground: isDarkMode ? '#1D1D1D' : '#FFFFFF',
    textColor: isDarkMode ? '#FFFFFF' : '#000000',
    secondaryText: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
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

      const [checkData, detailsData] = await Promise.all([
        fetch(`${OAUTH_URL}/check`, {
          headers: { 'Authorization': `Bearer ${access_token}` },
        }).then(res => res.json()),
        fetch(`${API_URL}/s/general/v1/user/my`, {
          headers: { 'Authorization': `Bearer ${access_token}` },
        }).then(res => res.json())
      ]);

      setUserInfo(checkData.auth_info.user);
      setUserDetails(detailsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const InfoItem = ({ icon, label, value, theme }: InfoItemProps) => (
    <ThemedView style={[styles.infoItem, { borderColor: theme.borderColor }]}>
      <ThemedView style={styles.infoIcon}>
        {Platform.OS === 'ios' ? (
          <IconSymbol name={ICON_MAPPING[icon].sf} size={20} color={theme.accentColor} />
        ) : (
          <MaterialIcons name={ICON_MAPPING[icon].material} size={20} color={theme.accentColor} />
        )}
      </ThemedView>
      <ThemedView style={styles.infoContent}>
        <ThemedText style={[styles.infoLabel, { color: theme.secondaryText }]}>{label}</ThemedText>
        <ThemedText style={[styles.infoValue, { color: theme.textColor }]}>{value}</ThemedText>
      </ThemedView>
    </ThemedView>
  );

  const InfoSkeleton = () => (
    <ThemedView style={[styles.infoItem, { borderColor: theme.borderColor }]}>
      <SkeletonLoader style={{ width: 20, height: 20, borderRadius: 10 }} />
      <ThemedView style={styles.infoContent}>
        <SkeletonLoader style={{ width: '40%', height: 16, borderRadius: 8 }} />
        <SkeletonLoader style={{ width: '70%', height: 20, borderRadius: 8, marginTop: 4 }} />
      </ThemedView>
    </ThemedView>
  );

  if (loading) {
    return (
      <Container>
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
          <ScrollView
            style={[styles.container, { backgroundColor: theme.background }]}
            contentContainerStyle={[
              styles.content,
              Platform.OS === 'web' ? {
                maxWidth: 768,
                width: '100%',
                marginHorizontal: 'auto',
                paddingTop: 40,
              } as ViewStyle : {}
            ]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()}>
                {Platform.OS === 'ios' ? (
                  <IconSymbol name={ICON_MAPPING['chevron.left'].sf} size={24} color={theme.textColor} />
                ) : (
                  <MaterialIcons name={ICON_MAPPING['chevron.left'].material} size={24} color={theme.textColor} />
                )}
              </TouchableOpacity>
              <ThemedText style={[styles.title, { color: theme.textColor }]}>
                Личная информация
              </ThemedText>
            </View>

            <ThemedView style={[styles.card, { backgroundColor: theme.cardBackground }]}>
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <InfoSkeleton key={i} />
              ))}
            </ThemedView>
          </ScrollView>
        </SafeAreaView>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
          <ThemedView style={styles.errorContainer}>
            <ThemedText style={styles.error}>{error}</ThemedText>
          </ThemedView>
        </SafeAreaView>
      </Container>
    );
  }

  return (
    <Container>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView
          style={[styles.container, { backgroundColor: theme.background }]}
          contentContainerStyle={[
            styles.content,
            Platform.OS === 'web' ? {
              maxWidth: 768,
              width: '100%',
              marginHorizontal: 'auto',
              paddingTop: 40,
            } as ViewStyle : {}
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              {Platform.OS === 'ios' ? (
                <IconSymbol name={ICON_MAPPING['chevron.left'].sf} size={24} color={theme.textColor} />
              ) : (
                <MaterialIcons name={ICON_MAPPING['chevron.left'].material} size={24} color={theme.textColor} />
              )}
            </TouchableOpacity>
            <ThemedText style={[styles.title, { color: theme.textColor }]}>
              Личная информация
            </ThemedText>
          </View>

          <ThemedView style={[styles.card, { backgroundColor: theme.cardBackground }]}>
            <InfoItem
              icon="person.fill"
              label="ФИО"
              value={userInfo?.fullName ?? 'Не указано'}
              theme={theme}
            />
            <InfoItem
              icon="creditcard.fill"
              label="Номер студенческого"
              value={userDetails?.recordBook ?? 'Не указано'}
              theme={theme}
            />
            <InfoItem
              icon="number.circle.fill"
              label="Курс"
              value={userDetails?.course?.toString() ?? 'Не указано'}
              theme={theme}
            />
            <InfoItem
              icon="doc.text.fill"
              label="Форма обучения"
              value={userDetails?.sourceFinancingStr ?? 'Не указано'}
              theme={theme}
            />
            <InfoItem
              icon="envelope.fill"
              label="Email"
              value={userDetails?.man.email ?? 'Не указано'}
              theme={theme}
            />
            <InfoItem
              icon="phone.fill"
              label="Телефон"
              value={userDetails?.man.telephone ?? 'Не указано'}
              theme={theme}
            />
            <InfoItem
              icon="calendar"
              label="Дата рождения"
              value={userDetails?.man.birthDate ?
                format(new Date(userDetails.man.birthDate), 'dd MMMM yyyy', { locale: ru }) :
                'Не указано'
              }
              theme={theme}
            />
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    ...Platform.select({
      ios: {
        padding: 15,
      },
      android: {
        padding: 15,
      },
    }),
    gap: 16,
  },
  container: {
    flex: 1,
    width: '100%',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
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
  card: {
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
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  infoIcon: {
    width: 20,
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    gap: 4,
  },
  infoLabel: {
    fontSize: 13,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
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
}); 