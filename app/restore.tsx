import React, { useState, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View, ScrollView, Platform, ViewStyle, KeyboardAvoidingView, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedTextInput } from '@/components/ui/ThemedTextInput';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Container } from '@/components/ui/Container';
import { useTheme } from '@/app/context/theme';
import Constants from 'expo-constants';
import { router, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';

const { OAUTH_URL } = Constants.expoConfig?.extra || {};

interface RestoreResponse {
  fullName: string;
  login: string;
  password: string;
  email: string;
}

const webStyles = {
  minHeight: '100vh',
  marginTop: 16,
  margin: -16,
} as unknown as ViewStyle;

export default function RestoreScreen() {
  const { isDarkMode } = useTheme();
  const [cardNumber, setCardNumber] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<RestoreResponse | null>(null);
  const passportInputRef = useRef<any>(null);

  const theme = {
    background: isDarkMode ? '#000000' : '#F2F3F7',
    cardBackground: isDarkMode ? '#1D1D1D' : '#FFFFFF',
    textColor: isDarkMode ? '#FFFFFF' : '#000000',
    secondaryText: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    accentColor: '#2688EB',
    errorColor: '#FF3B30',
  };

  const handleBackPress = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.back();
  };

  const handleRestore = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (!cardNumber || !passportNumber) {
      setError('Заполните все поля');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${OAUTH_URL}/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          card_number: cardNumber,
          passport_number: passportNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Введены некорректные данные');
      }

      setUserData(data);
    } catch (error) {
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      setError(error instanceof Error ? error.message : 'Введены некорректные данные');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (e.nativeEvent.key === 'Enter' && !loading) {
      handleRestore();
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Container>
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <ScrollView
              style={[styles.scrollView, { backgroundColor: theme.background }]}
              contentContainerStyle={[styles.scrollContent, { padding: 16 }]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.header}>
                <TouchableOpacity onPress={handleBackPress}>
                  <IconSymbol name="chevron.left" size={24} color={theme.textColor} />
                </TouchableOpacity>
                <ThemedText style={[styles.title, { color: theme.textColor }]}>
                  Восстановление
                </ThemedText>
              </View>

              <ThemedView style={[styles.card, { backgroundColor: theme.cardBackground }]}>
                <ThemedText style={[styles.description, { color: theme.secondaryText }]}>
                  Введите номер зачетной книжки или студенческого билета и номер паспорта (без серии) для восстановления учетных данных
                </ThemedText>

                <ThemedTextInput
                  style={styles.input}
                  placeholder="Номер зачетной книжки"
                  value={cardNumber}
                  onChangeText={setCardNumber}
                  autoCapitalize="none"
                  returnKeyType="next"
                  onSubmitEditing={() => passportInputRef.current?.focus()}
                  blurOnSubmit={false}
                />

                <ThemedTextInput
                  ref={passportInputRef}
                  style={styles.input}
                  placeholder="Номер паспорта"
                  value={passportNumber}
                  onChangeText={setPassportNumber}
                  keyboardType="number-pad"
                  autoCapitalize="none"
                  secureTextEntry
                  onKeyPress={Platform.OS === 'web' ? handleKeyPress : undefined}
                />

                {error && (
                  <ThemedText style={[styles.error, { color: theme.errorColor }]}>
                    {error}
                  </ThemedText>
                )}

                <TouchableOpacity
                  style={[
                    styles.button,
                    {
                      backgroundColor: theme.accentColor,
                      opacity: loading ? 0.7 : 1,
                    },
                  ]}
                  onPress={handleRestore}
                  disabled={loading}
                >
                  <ThemedText style={styles.buttonText}>
                    {loading ? 'Загрузка...' : 'Восстановить'}
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>

              {userData && (
                <ThemedView style={[styles.card, { backgroundColor: theme.cardBackground }]}>
                  <ThemedText style={[styles.subtitle, { color: theme.textColor }]}>
                    Ваши учетные данные
                  </ThemedText>

                  <View style={styles.infoRow}>
                    <ThemedText style={{ color: theme.secondaryText }}>ФИО:</ThemedText>
                    <ThemedText style={{ color: theme.textColor }}>{userData.fullName}</ThemedText>
                  </View>

                  <View style={styles.infoRow}>
                    <ThemedText style={{ color: theme.secondaryText }}>Логин:</ThemedText>
                    <ThemedText style={{ color: theme.textColor }}>{userData.login}</ThemedText>
                  </View>

                  <View style={styles.infoRow}>
                    <ThemedText style={{ color: theme.secondaryText }}>Пароль:</ThemedText>
                    <ThemedText style={{ color: theme.textColor }}>{userData.password}</ThemedText>
                  </View>

                  <View style={styles.infoRow}>
                    <ThemedText style={{ color: theme.secondaryText }}>Email:</ThemedText>
                    <ThemedText style={{ color: theme.textColor }}>{userData.email}</ThemedText>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.button,
                      { backgroundColor: theme.accentColor, marginTop: 16 }
                    ]}
                    onPress={async () => {
                      if (Platform.OS !== 'web') {
                        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      }
                      router.replace({
                        pathname: '/auth',
                        params: { login: userData.login, password: userData.password }
                      });
                    }}
                  >
                    <ThemedText style={styles.buttonText}>
                      Войти с этими данными
                    </ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Container>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    ...(Platform.OS === 'web' ? {
      height: '100vh',
      minHeight: '100vh',
    } as unknown as ViewStyle : {}),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    ...Platform.select({
      web: webStyles,
    }),
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
    padding: 16,
    marginBottom: 16,
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
  description: {
    fontSize: 15,
    marginBottom: 16,
    lineHeight: 20,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  error: {
    fontSize: 13,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
});