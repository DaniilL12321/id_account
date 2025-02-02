import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, Image, Alert, TextInput, KeyboardAvoidingView, Platform, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, Stack, useLocalSearchParams } from 'expo-router';
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
  const params = useLocalSearchParams<{ login?: string; password?: string }>();
  const { isDarkMode } = useTheme();
  const [login, setLogin] = useState(params.login || '');
  const [password, setPassword] = useState(params.password || '');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef<TextInput>(null);

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
        let errorMessage = 'Произошла ошибка при входе';
        
        if (response.status === 401 || response.status === 400) {
          errorMessage = 'Неверный логин или пароль';
        } else if (data.message) {
          errorMessage = data.message;
        }

        throw new Error(errorMessage);
      }

      await AsyncStorage.setItem('auth_tokens', JSON.stringify(data));
      router.replace('/');
    } catch (error) {
      if (Platform.OS === 'web') {
        const errorMessage = error instanceof Error ? error.message : 'Произошла ошибка';
        const alertContainer = document.createElement('div');
        alertContainer.style.position = 'fixed';
        alertContainer.style.top = '20px';
        alertContainer.style.left = '50%';
        alertContainer.style.transform = 'translateX(-50%)';
        alertContainer.style.backgroundColor = isDarkMode ? '#1D1D1D' : '#FFFFFF';
        alertContainer.style.color = isDarkMode ? '#FFFFFF' : '#000000';
        alertContainer.style.padding = '16px 24px';
        alertContainer.style.borderRadius = '12px';
        alertContainer.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        alertContainer.style.zIndex = '9999';
        alertContainer.style.maxWidth = '90%';
        alertContainer.style.width = 'auto';
        alertContainer.style.textAlign = 'center';
        alertContainer.innerText = errorMessage;
        
        document.body.appendChild(alertContainer);
        
        setTimeout(() => {
          alertContainer.style.opacity = '0';
          alertContainer.style.transition = 'opacity 0.3s ease';
          setTimeout(() => {
            document.body.removeChild(alertContainer);
          }, 300);
        }, 3000);
      } else {
        Alert.alert('Ошибка', error instanceof Error ? error.message : 'Произошла ошибка');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.login && params.password) {
      handleLogin();
    }
  }, []);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[
          styles.content,
          Platform.OS === 'web' ? {
            maxWidth: 400,
            width: '100%',
            marginHorizontal: 'auto',
            paddingTop: 80,
          } as ViewStyle : {}
        ]}>
          <View style={styles.header}>
            <Image
              source={require('@/assets/images/ystu-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <ThemedText style={styles.title}>
              ЯГТУ ID
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Единая система авторизации
            </ThemedText>
          </View>

          <View style={[
            styles.form,
            { backgroundColor: theme.cardBackground },
            Platform.OS === 'web' ? {
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            } as ViewStyle : {}
          ]}>
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
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                blurOnSubmit={false}
              />
              <View style={styles.passwordContainer}>
                <TextInput
                  ref={passwordRef}
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
                  returnKeyType="go"
                  onSubmitEditing={handleLogin}
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

          <View style={styles.actions}>
            <TouchableOpacity onPress={() => router.push('/restore')}>
              <ThemedText style={[styles.link, { color: theme.accentColor }]}>
                Получить учетные данные
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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