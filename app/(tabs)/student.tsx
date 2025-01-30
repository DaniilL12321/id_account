import { StyleSheet, Platform, ScrollView, SafeAreaView, Image, TouchableOpacity, View, ViewStyle } from 'react-native';
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
} as unknown as ViewStyle;

export default function StudentProfileScreen() {
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

  if (loading || error || !userInfo || !userDetails) {
    return (
      <Container>
        <SafeAreaView style={styles.container}>
          <ThemedView style={styles.loadingContainer}>
            {loading ? (
              <ThemedText>Загрузка...</ThemedText>
            ) : (
              <ThemedText style={styles.error}>{error || 'Не удалось загрузить данные'}</ThemedText>
            )}
          </ThemedView>
        </SafeAreaView>
      </Container>
    );
  }

  return (
    <Container>
      <SafeAreaView style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { padding: 16, gap: 16, paddingBottom: 80 }
          ]}
          showsVerticalScrollIndicator={false}
        >
          <ThemedView style={[styles.profileHeader, { backgroundColor: theme.cardBackground }]}>
            {userInfo.photoUrl ? (
              <Image source={{ uri: userInfo.photoUrl }} style={styles.avatar} />
            ) : (
              <ThemedView style={[styles.avatarPlaceholder, { backgroundColor: theme.accentColor }]}>
                <ThemedText style={styles.avatarText}>
                  {userInfo.firstName[0]}{userInfo.lastName[0]}
                </ThemedText>
              </ThemedView>
            )}
            <ThemedText style={[styles.userName, { color: theme.textColor }]}>
              {userInfo.firstName} {userInfo.lastName}
            </ThemedText>
            <ThemedText style={[styles.userGroup, { color: theme.secondaryText }]}>
              {userInfo.groupName} • {userDetails.course} курс • {userDetails.sourceFinancingStr}
            </ThemedText>
          </ThemedView>

          <ThemedView style={[styles.section, { backgroundColor: theme.cardBackground }]}>
            <TouchableOpacity 
              style={styles.sectionItem}
              onPress={() => router.push('/info')}
            >
              <IconSymbol name="person.fill" size={20} color={theme.accentColor} />
              <ThemedText style={[styles.sectionItemText, { color: theme.textColor }]}>
                Личная информация
              </ThemedText>
              <IconSymbol name="chevron.right" size={16} color={theme.secondaryText} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.sectionItem}
              onPress={() => router.push('/marks')}
            >
              <IconSymbol name="chart.bar.fill" size={20} color={theme.accentColor} />
              <ThemedText style={[styles.sectionItemText, { color: theme.textColor }]}>
                Полная успеваемость
              </ThemedText>
              <IconSymbol name="chevron.right" size={16} color={theme.secondaryText} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.sectionItem, { opacity: 0.5 }]} 
              disabled={true}
            >
              <IconSymbol name="photo.fill" size={20} color={theme.accentColor} />
              <ThemedText style={[styles.sectionItemText, { color: theme.textColor }]}>
                Портфолио
              </ThemedText>
              <IconSymbol name="chevron.right" size={16} color={theme.secondaryText} />
            </TouchableOpacity>
          </ThemedView>

          <ThemedView style={[styles.section, { backgroundColor: theme.cardBackground }]}>
            <ThemedText style={[styles.sectionTitle, { color: theme.textColor }]}>
              Документы
            </ThemedText>
            
            <TouchableOpacity 
              style={[styles.sectionItem, { opacity: 0.5 }]}
              disabled={true}
            >
              <IconSymbol name="doc.fill" size={20} color={theme.accentColor} />
              <ThemedText style={[styles.sectionItemText, { color: theme.textColor }]}>
                Справки
              </ThemedText>
              {/* <ThemedView style={styles.badge}>
                <ThemedText style={styles.badgeText}>Новое</ThemedText>
              </ThemedView> */}
              <IconSymbol name="chevron.right" size={16} color={theme.secondaryText} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.sectionItem, { opacity: 0.5 }]}
              disabled={true}
            >
              <IconSymbol name="doc.text.fill" size={20} color={theme.accentColor} />
              <ThemedText style={[styles.sectionItemText, { color: theme.textColor }]}>
                Заявления
              </ThemedText>
              <IconSymbol name="chevron.right" size={16} color={theme.secondaryText} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.sectionItem, { opacity: 0.5 }]}
              disabled={true}
            >
              <IconSymbol name="qrcode" size={20} color={theme.accentColor} />
              <ThemedText style={[styles.sectionItemText, { color: theme.textColor }]}>
                QR Сертификаты
              </ThemedText>
              <IconSymbol name="chevron.right" size={16} color={theme.secondaryText} />
            </TouchableOpacity>
          </ThemedView>

          <ThemedView style={[styles.section, { backgroundColor: theme.cardBackground }]}>
            <TouchableOpacity 
              style={[styles.sectionItem, { opacity: 0.5 }]}
              disabled={true}
            >
              <IconSymbol name="gear" size={20} color={theme.accentColor} />
              <ThemedText style={[styles.sectionItemText, { color: theme.textColor }]}>
                Настройки профиля
              </ThemedText>
              <IconSymbol name="chevron.right" size={16} color={theme.secondaryText} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.sectionItem, { opacity: 0.5 }]}
              disabled={true}
            >
              <IconSymbol name="bell" size={20} color={theme.accentColor} />
              <ThemedText style={[styles.sectionItemText, { color: theme.textColor }]}>
                Уведомления
              </ThemedText>
              <IconSymbol name="chevron.right" size={16} color={theme.secondaryText} />
            </TouchableOpacity>
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
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
});

