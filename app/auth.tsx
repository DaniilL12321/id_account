import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Image, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/app/context/theme';
import Constants from 'expo-constants';
import { IconSymbol } from '@/components/ui/IconSymbol';

const { OAUTH_URL, OAUTH_CLIENT_ID, OAUTH_SCOPE } = Constants.expoConfig?.extra || {};

export default function AuthScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AuthContent />
    </>
  );
}

function AuthContent() {
  const { isDarkMode } = useTheme();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const theme = {
    background: isDarkMode ? '#000000' : '#F2F3F7',
    cardBackground: isDarkMode ? '#1D1D1D' : '#FFFFFF',
    textColor: isDarkMode ? '#FFFFFF' : '#000000',
    secondaryText: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    inputBackground: isDarkMode ? '#2A2A2A' : '#F5F5F5',
    accentColor: '#2688EB',
  };

  const handleLogin = async () => {
    if (!login || !password) {
      Alert.alert('Ошибка', 'Введите логин и пароль');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${OAUTH_URL}/access_token?client_id=${OAUTH_CLIENT_ID}&grant_type=password&scope=${OAUTH_SCOPE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: login,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Ошибка авторизации');
      }

      await AsyncStorage.setItem('auth_tokens', JSON.stringify(data));
      router.replace('/');
    } catch (error) {
      Alert.alert('Ошибка', error instanceof Error ? error.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Image
              source={require('@/assets/images/ystu-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <ThemedText style={[styles.title, { color: theme.textColor }]}>
              ЯГТУ ID
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: theme.secondaryText }]}>
              Единая система авторизации
            </ThemedText>
          </View>

          <View style={[styles.form, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.inputBackground,
                    color: theme.textColor,
                  }
                ]}
                placeholder="Логин"
                placeholderTextColor={theme.secondaryText}
                value={login}
                onChangeText={setLogin}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    {
                      backgroundColor: theme.inputBackground,
                      color: theme.textColor,
                    }
                  ]}
                  placeholder="Пароль"
                  placeholderTextColor={theme.secondaryText}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={[styles.passwordToggle, { backgroundColor: theme.inputBackground }]}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <IconSymbol
                    name={showPassword ? "eye.slash.fill" : "eye.fill"}
                    size={20}
                    color={theme.secondaryText}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.accentColor }]}
              onPress={handleLogin}
              disabled={loading}
            >
              <ThemedText style={styles.buttonText}>
                {loading ? 'Вход...' : 'Войти'}
              </ThemedText>
            </TouchableOpacity>

            <ThemedText style={[styles.hint, { color: theme.secondaryText }]}>
              Используйте учетные данные от{'\n'}личного кабинета ЯГТУ
            </ThemedText>
          </View>

          {/* TODO: тут мб потом сделать получение по зачетке логина и пароля */}

          {/* <View style={styles.actions}>
            <TouchableOpacity>
              <ThemedText style={[styles.link, { color: theme.accentColor }]}>
                Забыли пароль?
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity>
              <ThemedText style={[styles.link, { color: theme.accentColor }]}>
                Регистрация
              </ThemedText>
            </TouchableOpacity>
          </View> */}
        </View>
      </KeyboardAvoidingView>
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
    flex: 1,
    padding: 16,
    gap: 24,
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    marginLeft: 26,
    width: 180,
    height: 90,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
  },
  form: {
    borderRadius: 16,
    padding: 16,
    gap: 24,
  },
  inputContainer: {
    gap: 12,
  },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  button: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  link: {
    fontSize: 15,
  },
  hint: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: -8,
    lineHeight: 20,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  passwordToggle: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
}); 