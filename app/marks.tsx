import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, Stack } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/app/context/theme';
import Constants from 'expo-constants';

const { API_URL } = Constants.expoConfig?.extra || {};

interface Mark {
  inDiplom: number;
  markName: string;
  mark: number;
  semester: number;
  controlTypeName: string;
  years: string;
  course: number;
  lessonName: string;
  creditUnit: number;
  hasDebt: number;
}

export default function MarksScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <MarksContent />
    </>
  );
}

function MarksContent() {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [semesters, setSemesters] = useState<number[]>([]);

  const theme = {
    background: isDarkMode ? '#000000' : '#F2F3F7',
    cardBackground: isDarkMode ? '#1D1D1D' : '#FFFFFF',
    textColor: isDarkMode ? '#FFFFFF' : '#000000',
    secondaryText: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    accentColor: '#2688EB',
    green: '#34C759',
    yellow: '#FFCC00',
    blue: '#2688EB',
    red: '#FF3B30',
    gray: isDarkMode ? '#636366' : '#8E8E93',
  };

  useEffect(() => {
    fetchMarks();
  }, []);

  const fetchMarks = async () => {
    try {
      const tokens = await AsyncStorage.getItem('auth_tokens');
      if (!tokens) {
        router.replace('/auth');
        return;
      }

      const { access_token } = JSON.parse(tokens);
      const response = await fetch(`${API_URL}/s/general/v1/mark/my`, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка получения оценок');
      }

      const data: Mark[] = await response.json();
      setMarks(data);

      const uniqueSemesters = [...new Set(data.map(mark => mark.semester))].sort((a, b) => b - a);
      setSemesters(uniqueSemesters);
      setSelectedSemester(uniqueSemesters[0] || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageGrade = (allMarks: Mark[]) => {
    const numericMarks = allMarks
      .filter(mark => mark.mark > 0)
      .map(mark => mark.mark);

    if (numericMarks.length === 0) return '-';

    const sum = numericMarks.reduce((acc, curr) => acc + curr, 0);
    return (sum / numericMarks.length).toFixed(2);
  };

  const getMarkDisplay = (mark: Mark) => {
    if (mark.markName === null) return '-';
    if (mark.mark === 0) return '✓';
    if (mark.mark > 0) return mark.mark.toString();
    return '-';
  };

  const getMarkColor = (mark: Mark) => {
    if (mark.markName === null) return theme.gray;
    if (mark.mark === 0) return theme.green;
    if (mark.mark === 5) return theme.green;
    if (mark.mark === 4) return theme.yellow;
    if (mark.mark === 3) return theme.blue;
    if (mark.mark === 2) return theme.red;
    return theme.gray;
  };

  const filteredMarks = marks
    .filter(mark => mark.semester === selectedSemester)
    .sort((a, b) => {
      if (a.markName === null && b.markName !== null) return -1;
      if (a.markName !== null && b.markName === null) return 1;
      
      return b.mark - a.mark;
    });
  const averageGrade = calculateAverageGrade(marks);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accentColor} />
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <ThemedView style={styles.errorContainer}>
          <ThemedText style={styles.error}>{error}</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
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
            <IconSymbol name="chevron.left" size={24} color={theme.textColor} />
          </TouchableOpacity>
          <ThemedText style={[styles.title, { color: theme.textColor }]}>
            Успеваемость
          </ThemedText>
        </View>

        <ThemedView style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <ThemedView style={styles.cardHeader}>
            <ThemedText style={[styles.cardTitle, { color: theme.textColor }]}>
              Средний балл за все время
            </ThemedText>
            <ThemedText style={[styles.averageGrade, { color: theme.textColor }]}>
              {averageGrade}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.semesterScroll}
          contentContainerStyle={styles.semesterContainer}
        >
          {semesters.map(semester => (
            <TouchableOpacity
              key={semester}
              style={[
                styles.semesterButton,
                {
                  backgroundColor: selectedSemester === semester ? theme.accentColor : theme.cardBackground,
                },
              ]}
              onPress={() => setSelectedSemester(semester)}
            >
              <ThemedText
                style={[
                  styles.semesterText,
                  { color: selectedSemester === semester ? '#FFFFFF' : theme.textColor },
                ]}
              >
                {semester} семестр
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.marksList}>
          {filteredMarks.map((mark, index) => (
            <ThemedView
              key={index}
              style={[styles.markCard, { backgroundColor: theme.cardBackground }]}
            >
              <View style={styles.markInfo}>
                <ThemedText style={[styles.disciplineName, { color: theme.textColor }]}>
                  {mark.lessonName}
                </ThemedText>
                <ThemedText style={[styles.markType, { color: theme.secondaryText }]}>
                  {mark.controlTypeName}
                </ThemedText>
              </View>
              <View
                style={[
                  styles.markBadge,
                  { backgroundColor: getMarkColor(mark) }
                ]}
              >
                <ThemedText style={styles.markValue}>
                  {getMarkDisplay(mark)}
                </ThemedText>
              </View>
            </ThemedView>
          ))}
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
    } as unknown as ViewStyle : {}),
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
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
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      } as unknown as ViewStyle,
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  averageGrade: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  semesterScroll: {
    marginBottom: 8,
  },
  semesterContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  semesterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  semesterText: {
    fontSize: 15,
    fontWeight: '600',
  },
  marksList: {
    gap: 12,
  },
  markCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
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
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      } as unknown as ViewStyle,
    }),
  },
  markInfo: {
    flex: 1,
    gap: 4,
  },
  disciplineName: {
    fontSize: 16,
    fontWeight: '500',
  },
  markType: {
    fontSize: 14,
  },
  markBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
}); 