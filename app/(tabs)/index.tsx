import React, { useEffect, useState } from 'react';
import { StyleSheet, Platform, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/app/context/theme';

export default function HomeScreen() {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);

  const theme = {
    background: isDarkMode ? '#000000' : '#F2F3F7',
    cardBackground: isDarkMode ? '#1D1D1D' : '#FFFFFF',
    textColor: isDarkMode ? '#FFFFFF' : '#000000',
    secondaryText: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    accentColor: '#2688EB',
    green: '#34C759',
    yellow: '#FFCC00',
    red: '#FF3B30',
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const tokens = await AsyncStorage.getItem('auth_tokens');
    if (!tokens) {
      router.replace('/auth');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <ThemedView style={styles.loadingContainer}>
          <ThemedText>Загрузка...</ThemedText>
        </ThemedView>
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
        <ThemedText style={[styles.pageTitle, { color: theme.textColor }]}>
          Главная
        </ThemedText>

        <ThemedView style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <ThemedView style={styles.cardHeader}>
            <ThemedText style={[styles.cardTitle, { color: theme.textColor }]}>
              Сегодня
            </ThemedText>
            <TouchableOpacity>
              <ThemedText style={{ color: theme.accentColor }}>
                Всё расписание
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>

          <ThemedView style={styles.scheduleList}>
            <ThemedView style={[styles.scheduleItem, { borderColor: theme.borderColor }]}>
              <ThemedView style={styles.scheduleTime}>
                <ThemedText style={{ color: theme.secondaryText }}>8:30</ThemedText>
                <ThemedText style={{ color: theme.secondaryText }}>10:00</ThemedText>
              </ThemedView>
              <ThemedView style={styles.scheduleInfo}>
                <ThemedText style={{ color: theme.textColor }}>Математический анализ</ThemedText>
                <ThemedText style={{ color: theme.secondaryText }}>А-404</ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        <ThemedView style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <ThemedView style={styles.cardHeader}>
            <ThemedText style={[styles.cardTitle, { color: theme.textColor }]}>
              Успеваемость
            </ThemedText>
            <TouchableOpacity onPress={() => router.push('/marks')}>
              <ThemedText style={{ color: theme.accentColor }}>
                Подробнее
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
          
          <ThemedView style={styles.statsGrid}>
            <ThemedView style={[styles.statCard, { backgroundColor: theme.background }]}>
              <IconSymbol name="star.fill" size={24} color={theme.yellow} />
              <ThemedText style={[styles.statValue, { color: theme.textColor }]}>4.7</ThemedText>
              <ThemedText style={{ color: theme.secondaryText }}>Средний балл</ThemedText>
            </ThemedView>

            <ThemedView style={[styles.statCard, { backgroundColor: theme.background }]}>
              <IconSymbol name="checkmark.circle.fill" size={24} color={theme.green} />
              <ThemedText style={[styles.statValue, { color: theme.textColor }]}>12</ThemedText>
              <ThemedText style={{ color: theme.secondaryText }}>Сдано</ThemedText>
            </ThemedView>

            <ThemedView style={[styles.statCard, { backgroundColor: theme.background }]}>
              <IconSymbol name="exclamationmark.circle.fill" size={24} color={theme.red} />
              <ThemedText style={[styles.statValue, { color: theme.textColor }]}>2</ThemedText>
              <ThemedText style={{ color: theme.secondaryText }}>Долги</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        <ThemedView style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <ThemedView style={styles.cardHeader}>
            <ThemedText style={[styles.cardTitle, { color: theme.textColor }]}>
              Быстрые действия
            </ThemedText>
          </ThemedView>
          
          <ThemedView style={[styles.actionGrid, { paddingTop: 0 }]}>
            <TouchableOpacity style={styles.actionButton}>
              <ThemedView style={[styles.actionIcon, { backgroundColor: theme.background }]}>
                <IconSymbol name="doc.fill" size={24} color={theme.accentColor} />
              </ThemedView>
              <ThemedText style={[styles.actionText, { color: theme.textColor }]}>
                Справка
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <ThemedView style={[styles.actionIcon, { backgroundColor: theme.background }]}>
                <IconSymbol name="calendar" size={24} color={theme.accentColor} />
              </ThemedView>
              <ThemedText style={[styles.actionText, { color: theme.textColor }]}>
                Расписание
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <ThemedView style={[styles.actionIcon, { backgroundColor: theme.background }]}>
                <IconSymbol name="person.2.fill" size={24} color={theme.accentColor} />
              </ThemedView>
              <ThemedText style={[styles.actionText, { color: theme.textColor }]}>
                Преподаватели
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <ThemedView style={[styles.actionIcon, { backgroundColor: theme.background }]}>
                <IconSymbol name="books.vertical.fill" size={24} color={theme.accentColor} />
              </ThemedView>
              <ThemedText style={[styles.actionText, { color: theme.textColor }]}>
                Библиотека
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </ScrollView>
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
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  scheduleList: {
    gap: 8,
    padding: 16,
    paddingTop: 0,
  },
  scheduleItem: {
    flexDirection: 'row',
    gap: 16,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  scheduleTime: {
    gap: 4,
  },
  scheduleInfo: {
    flex: 1,
    gap: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    paddingTop: 8,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '45%',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
});
