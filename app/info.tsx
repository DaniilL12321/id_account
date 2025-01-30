import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, Animated, Platform, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/app/context/theme';
import { CheckResponse, UserDetailsResponse } from '@/types/api';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Constants from 'expo-constants';

const { OAUTH_URL, API_URL } = Constants.expoConfig?.extra || {};

interface InfoItemProps {
  label: string;
  value: string;
  theme: any;
  isDark?: boolean;
  style?: any;
}

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
  const [fadeAnim] = useState(new Animated.Value(0.3));

  const theme = {
    background: isDarkMode ? '#000000' : '#F2F3F7',
    cardBackground: isDarkMode ? '#1D1D1D' : '#FFFFFF',
    textColor: isDarkMode ? '#FFFFFF' : '#000000',
    secondaryText: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    accentColor: '#2688EB',
    skeletonBackground: isDarkMode ? '#333333' : '#DEDEDE',
  };

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
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
          'Authorization': `Bearer ${access_token}`,
        },
      });

      if (!checkResponse.ok) {
        throw new Error('Ошибка получения данных профиля');
      }

      const checkData: CheckResponse = await checkResponse.json();
      setUserInfo(checkData.auth_info.user);

      const detailsResponse = await fetch(`${API_URL}/s/general/v1/user/my`, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
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

  const InfoItem = ({ label, value, theme, isDark = false, style }: InfoItemProps) => (
    <View style={[
      styles.infoItem, 
      { backgroundColor: isDark ? '#2A2A2A' : '#F5F5F5' },
      style
    ]}>
      <ThemedText style={{ color: theme.secondaryText }}>{label}</ThemedText>
      <ThemedText style={{ color: theme.textColor }}>{value}</ThemedText>
    </View>
  );

  const SkeletonItem = () => (
    <View style={[
      styles.infoItem, 
      { backgroundColor: isDarkMode ? '#2A2A2A' : '#F5F5F5' },
    ]}>
      <Animated.View 
        style={[
          styles.skeletonText,
          styles.skeletonLabel,
          { 
            backgroundColor: theme.skeletonBackground,
            opacity: fadeAnim,
          }
        ]} 
      />
      <Animated.View 
        style={[
          styles.skeletonText,
          styles.skeletonValue,
          { 
            backgroundColor: theme.skeletonBackground,
            opacity: fadeAnim,
          }
        ]} 
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <ScrollView 
          style={[styles.container, { backgroundColor: theme.background }]}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <IconSymbol name="chevron.left" size={24} color={theme.textColor} />
            </TouchableOpacity>
            <ThemedText style={[styles.title, { color: theme.textColor }]}>
              Общая информация
            </ThemedText>
          </View>

          <View style={[styles.infoGrid, { backgroundColor: theme.cardBackground }]}>
            <SkeletonItem />
            <SkeletonItem />
            <SkeletonItem />
            <SkeletonItem />
            <SkeletonItem />
            <SkeletonItem />
            <SkeletonItem />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.error}>{error || 'Не удалось загрузить данные'}</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color={theme.textColor} />
          </TouchableOpacity>
          <ThemedText style={[styles.title, { color: theme.textColor }]}>
            Общая информация
          </ThemedText>
        </View>

        <View style={[styles.infoGrid, { backgroundColor: theme.cardBackground }]}>
          <InfoItem label="ФИО" value={userInfo?.fullName || ''} theme={theme} isDark={isDarkMode} />
          <InfoItem 
            label="Номер студенческого" 
            value={userDetails?.recordBook || ''} 
            theme={theme} 
            isDark={isDarkMode} 
          />
          <InfoItem 
            label="Курс" 
            value={`${userDetails?.course || ''}` } 
            theme={theme} 
            isDark={isDarkMode} 
          />
          <InfoItem 
            label="Форма обучения" 
            value={userDetails?.sourceFinancingStr || ''} 
            theme={theme} 
            isDark={isDarkMode} 
          />
          <InfoItem 
            label="Email" 
            value={userDetails?.man.email || ''} 
            theme={theme} 
            isDark={isDarkMode} 
          />
          <InfoItem 
            label="Телефон" 
            value={userDetails?.man.telephone || ''} 
            theme={theme} 
            isDark={isDarkMode} 
          />
          <InfoItem 
            label="Дата рождения" 
            value={userDetails ? format(new Date(userDetails.man.birthDate), 'dd MMMM yyyy', { locale: ru }) : ''} 
            theme={theme} 
            isDark={isDarkMode} 
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingBottom: -40,
    ...(Platform.OS === 'web' ? {
      height: '100vh',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
    } as unknown as ViewStyle : {}),
  },
  container: {
    flex: 1,
    ...(Platform.OS === 'web' ? {
      maxWidth: 768,
      width: '100%',
    } as unknown as ViewStyle : {}),
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
    ...(Platform.OS === 'web' ? {
      paddingTop: 40,
    } as unknown as ViewStyle : {}),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: '#FF3B30',
    textAlign: 'center',
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
  infoGrid: {
    gap: 8,
    borderRadius: 12,
    padding: 16,
  },
  infoItem: {
    padding: 12,
    borderRadius: 8,
    gap: 4,
  },
  skeletonText: {
    height: 24,
    borderRadius: 6,
  },
  skeletonLabel: {
    width: '60%',
  },
  skeletonValue: {
    width: '85%',
  },
}); 