import React, { useEffect, useState } from 'react';
import { StyleSheet, Platform, ScrollView, Image, TouchableOpacity, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Container } from '@/components/ui/Container';
import { useTheme } from '@/app/context/theme';
import Constants from 'expo-constants';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withSequence,
  withTiming,
  useSharedValue,
  withDelay
} from 'react-native-reanimated';

const { API_URL, OAUTH_URL } = Constants.expoConfig?.extra || {};

interface AuthInfo {
  auth: number;
  userId: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    patronymic: string;
    fullName: string;
    initials: string;
    photoUrl: string;
    birthday: string;
    login: string;
    groupName: string;
  };
}

interface Lesson {
  number: number;
  startAt: string;
  endAt: string;
  timeRange: string;
  parity: number;
  lessonName: string;
  type: number;
  isStream: boolean;
  duration: number;
  durationMinutes: number;
  isDivision: boolean;
  teacherName?: string;
  teacherId?: number;
  auditoryName?: string;
  isDistant: boolean;
  isShort: boolean;
  isLecture: boolean;
}

interface ScheduleDay {
  info: {
    type: number;
    weekNumber: number;
    date: string;
  };
  lessons: Lesson[];
}

interface ScheduleResponse {
  isCache: boolean;
  items: {
    number: number;
    days: ScheduleDay[];
  }[];
}

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

interface Semester {
  number: number;
  marks: Mark[];
}

type DayOffset = 0 | 1 | 2;

const DAY_LABELS: Record<DayOffset, string> = {
  0: 'Сегодня',
  1: 'Завтра',
  2: 'Послезавтра',
};

const webStyles = {
  minHeight: '100vh',
} as unknown as ViewStyle;

const SkeletonLoader = ({ style }: { style: ViewStyle }) => {
  const opacity = useSharedValue(0.3);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withDelay(
          Math.random() * 500,
          withTiming(0.7, { duration: 1000 })
        ),
        withTiming(0.3, { duration: 1000 })
      ),
      -1,
      true
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

const HomeScreenSkeleton = ({ theme }: { theme: any }) => {
  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        styles.scrollContent,
        { padding: 16, gap: 16, paddingBottom: 80 }
      ]}
      showsVerticalScrollIndicator={false}
    >
      <ThemedView style={styles.headerContainer}>
        <SkeletonLoader style={{ width: 150, height: 28, borderRadius: 8 }} />
        <SkeletonLoader style={{ width: 110, height: 32, borderRadius: 16 }} />
      </ThemedView>
      
      <SkeletonLoader style={{ width: 200, height: 16, borderRadius: 8 }} />

      <ThemedView style={[styles.card, { backgroundColor: theme.cardBackground }]}>
        <ThemedView style={styles.cardHeader}>
          <SkeletonLoader style={{ width: 120, height: 24, borderRadius: 8 }} />
          <SkeletonLoader style={{ width: 80, height: 20, borderRadius: 8 }} />
        </ThemedView>

        <ThemedView style={styles.statsGrid}>
          <ThemedView style={[styles.statCard, styles.statCardWide, { backgroundColor: theme.background }]}>
            <SkeletonLoader style={{ width: 24, height: 24, borderRadius: 12 }} />
            <SkeletonLoader style={{ width: 40, height: 28, borderRadius: 8 }} />
            <SkeletonLoader style={{ width: 80, height: 16, borderRadius: 8 }} />
          </ThemedView>

          {[1, 2].map((i) => (
            <ThemedView key={i} style={[styles.statCard, { backgroundColor: theme.background }]}>
              <SkeletonLoader style={{ width: 24, height: 24, borderRadius: 12 }} />
              <SkeletonLoader style={{ width: 30, height: 28, borderRadius: 8 }} />
              <SkeletonLoader style={{ width: 60, height: 16, borderRadius: 8 }} />
            </ThemedView>
          ))}
        </ThemedView>
      </ThemedView>

      <ThemedView style={[styles.card, { backgroundColor: theme.cardBackground }]}>
        <ThemedView style={styles.cardHeader}>
          <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <SkeletonLoader style={{ width: 100, height: 24, borderRadius: 8 }} />
            <SkeletonLoader style={{ width: 80, height: 16, borderRadius: 8 }} />
          </ThemedView>
          <SkeletonLoader style={{ width: 100, height: 20, borderRadius: 8 }} />
        </ThemedView>

        <ThemedView style={styles.segmentedControlContainer}>
          <ThemedView style={styles.segmentedControl}>
            {[1, 2, 3].map((i) => (
              <SkeletonLoader
                key={i}
                style={{
                  flex: 1,
                  height: 36,
                  borderRadius: 10,
                  marginHorizontal: 2
                }}
              />
            ))}
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.scheduleList}>
          {[1, 2, 3].map((i) => (
            <ThemedView
              key={i}
              style={[styles.scheduleItem, { borderColor: theme.borderColor }]}
            >
              <ThemedView style={styles.scheduleTime}>
                <SkeletonLoader style={{ width: 40, height: 16, borderRadius: 8 }} />
                <SkeletonLoader style={{ width: 40, height: 16, borderRadius: 8 }} />
              </ThemedView>

              <SkeletonLoader style={{ width: 3, height: '100%', borderRadius: 1.5 }} />

              <ThemedView style={styles.scheduleInfo}>
                <SkeletonLoader style={{ width: '80%', height: 20, borderRadius: 8 }} />
                <ThemedView style={styles.lessonDetails}>
                  <SkeletonLoader style={{ width: 120, height: 16, borderRadius: 8 }} />
                  <SkeletonLoader style={{ width: 100, height: 16, borderRadius: 8 }} />
                </ThemedView>
              </ThemedView>
            </ThemedView>
          ))}
        </ThemedView>
      </ThemedView>

      <ThemedView style={[styles.card, { backgroundColor: theme.cardBackground }]}>
        <ThemedView style={styles.cardHeader}>
          <SkeletonLoader style={{ width: 140, height: 24, borderRadius: 8 }} />
        </ThemedView>

        <ThemedView style={[styles.actionGrid, { paddingTop: 0 }]}>
          {[1, 2, 3, 4].map((i) => (
            <ThemedView key={i} style={styles.actionButton}>
              <SkeletonLoader style={{ width: 48, height: 48, borderRadius: 12 }} />
              <SkeletonLoader style={{ width: 80, height: 16, borderRadius: 8 }} />
            </ThemedView>
          ))}
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
};

export default function HomeScreen() {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<AuthInfo['user'] | null>(null);
  const [schedule, setSchedule] = useState<Record<DayOffset, Lesson[]>>({} as Record<DayOffset, Lesson[]>);
  const [selectedDay, setSelectedDay] = useState<DayOffset>(0);
  const [stats, setStats] = useState({
    averageGrade: 0,
    completedCount: 0,
    debtsCount: 0
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  const theme = {
    background: isDarkMode ? '#000000' : '#F2F3F7',
    cardBackground: isDarkMode ? '#1D1D1D' : '#FFFFFF',
    textColor: isDarkMode ? '#FFFFFF' : '#000000',
    secondaryText: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    segmentBackground: isDarkMode ? '#2C2C2E' : Platform.select({ ios: '#F2F3F7', android: '#E8E8E8' }),
    accentColor: '#2688EB',
    green: '#34C759',
    yellow: '#FFCC00',
    red: '#FF3B30',
  };

  const getDateWithOffset = (offset: number) => {
    const now = new Date();
    const mskOffset = 3;
    now.setHours(now.getHours() + mskOffset);

    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const day = now.getUTCDate();

    const date = new Date(Date.UTC(year, month, day + offset));
    return date.toISOString().split('T')[0];
  };

  const fetchUserInfo = async (accessToken: string) => {
    try {
      const response = await fetch(`${OAUTH_URL}/check`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const data = await response.json();
      if (data.auth_info?.auth === 1) {
        setUserInfo(data.auth_info.user);
        return data.auth_info.user.groupName;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user info:', error);
      return null;
    }
  };

  const fetchSchedule = async (groupName: string) => {
    try {
      const response = await fetch(`${API_URL}/s/schedule/v1/schedule/group/${encodeURIComponent(groupName)}`);
      const data: ScheduleResponse = await response.json();

      const days = data.items.flatMap(item => item.days);
      const newSchedule: Record<DayOffset, Lesson[]> = {} as Record<DayOffset, Lesson[]>;

      const now = new Date();
      const mskOffset = 3;
      now.setHours(now.getHours() + mskOffset);

      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      const academicYear = currentMonth >= 9 ? currentYear : currentYear - 1;

      [0, 1, 2].forEach((offset) => {
        const targetDate = new Date(now);
        targetDate.setDate(targetDate.getDate() + offset);
        const targetDateStr = targetDate.toISOString().split('T')[0];

        console.log('Looking for date:', targetDateStr);

        const daySchedule = days.find((day) => {
          const scheduleDate = new Date(day.info.date);
          const scheduleDateStr = scheduleDate.toISOString().split('T')[0];

          const scheduleYear = scheduleDate.getFullYear();
          const scheduleMonth = scheduleDate.getMonth() + 1;
          const isCurrentAcademicYear = scheduleMonth >= 9 ?
            scheduleYear === academicYear :
            scheduleYear === academicYear + 1;

          if (isCurrentAcademicYear) {
            const isSameMonthAndDay =
              scheduleDate.getMonth() === targetDate.getMonth() &&
              scheduleDate.getDate() === targetDate.getDate();

            if (isSameMonthAndDay) {
              console.log('Found matching date:', scheduleDateStr);
              return true;
            }
          }
          return false;
        });

        if (daySchedule) {
          console.log('Found schedule for:', targetDateStr, 'with', daySchedule.lessons.length, 'lessons');
        }

        newSchedule[offset as DayOffset] = (daySchedule?.lessons || []).sort(
          (a, b) => {
            if (a.timeRange && b.timeRange) {
              const timeA = a.timeRange.split('-')[0].trim();
              const timeB = b.timeRange.split('-')[0].trim();
              return timeA.localeCompare(timeB);
            }
            if (!a.timeRange && b.timeRange) return 1;
            if (a.timeRange && !b.timeRange) return -1;
            return a.lessonName.localeCompare(b.lessonName);
          }
        );
      });

      console.log('Final schedule:', newSchedule);
      setSchedule(newSchedule);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };

  const fetchMarks = async (accessToken: string) => {
    try {
      const response = await fetch(`${API_URL}/s/general/v1/mark/my`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const data: Mark[] = await response.json();

      if (!Array.isArray(data)) {
        console.error('Unexpected marks data format:', data);
        return;
      }

      let totalGrade = 0;
      let gradesCount = 0;
      let completedCount = 0;
      let debtsCount = 0;

      const marksBySemester = data.reduce((acc, mark) => {
        if (!acc[mark.semester]) {
          acc[mark.semester] = [];
        }
        acc[mark.semester].push(mark);
        return acc;
      }, {} as Record<number, Mark[]>);

      const lastSemester = Math.max(...Object.keys(marksBySemester).map(Number));

      data.forEach((mark) => {
        if (mark.mark > 0) {
          totalGrade += mark.mark;
          gradesCount++;
        }

        if (mark.semester === lastSemester) {
          if (!mark.hasDebt) {
            completedCount++;
          } else {
            debtsCount++;
          }
        }
      });

      setStats({
        averageGrade: gradesCount > 0 ? totalGrade / gradesCount : 0,
        completedCount,
        debtsCount
      });
    } catch (error) {
      console.error('Error fetching marks:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      const tokens = await AsyncStorage.getItem('auth_tokens');
      if (!tokens) {
        router.replace('/auth');
        return;
      }

      const { access_token } = JSON.parse(tokens);
      const groupName = await fetchUserInfo(access_token);
      if (groupName) {
        await Promise.all([
          fetchSchedule(groupName),
          fetchMarks(access_token)
        ]);
      }
      setLoading(false);
    };

    init();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      weekday: 'long'
    };
    return "Сегодня, " + date.toLocaleDateString('ru-RU', options);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container>
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
          <HomeScreenSkeleton theme={theme} />
        </SafeAreaView>
      </Container>
    );
  }

  const currentSchedule = schedule[selectedDay] || [];

  const getLessonTypeInfo = (type: number) => {
    switch (type) {
      case 2:
        return { label: 'Лекция', color: '#FF9500' };
      case 4:
        return { label: 'Практика', color: '#34C759' };
      case 8:
        return { label: 'Лаб. работа', color: '#5856D6' };
      case 256:
        return { label: 'Экзамен', color: '#2688EB' };
      default:
        return { label: '', color: '#8E8E93' };
    }
  };

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
          <ThemedView style={styles.headerContainer}>
            <ThemedText style={[styles.pageTitle, { color: theme.textColor }]}>
              Привет, {userInfo?.firstName}
            </ThemedText>
            <ThemedView style={[styles.timeCard, { backgroundColor: theme.cardBackground }]}>
              {Platform.OS === 'ios' ? (
                <IconSymbol name="clock.fill" size={16} color={theme.accentColor} />
              ) : (
                <MaterialIcons name="access-time" size={16} color={theme.accentColor} />
              )}
              <ThemedText style={[styles.timeText, { color: theme.secondaryText }]}>
                {formatTime(currentTime)}
              </ThemedText>
            </ThemedView>
          </ThemedView>
          <ThemedText style={[styles.dateText, { color: theme.secondaryText }]}>
            {formatDate(currentTime)}
          </ThemedText>

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
              <ThemedView style={[styles.statCard, styles.statCardWide, { backgroundColor: theme.background }]}>
                <IconSymbol name="star.fill" size={24} color={theme.yellow} />
                <ThemedText style={[styles.statValue, { color: theme.textColor }]}>
                  {stats.averageGrade.toFixed(1)}
                </ThemedText>
                <ThemedText
                  style={[styles.statLabel, { color: theme.secondaryText }]}
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  minimumFontScale={0.75}
                >
                  Средний балл
                </ThemedText>
              </ThemedView>

              <ThemedView style={[styles.statCard, { backgroundColor: theme.background }]}>
                <IconSymbol name="checkmark.circle.fill" size={24} color={theme.green} />
                <ThemedText style={[styles.statValue, { color: theme.textColor }]}>
                  {stats.completedCount}
                </ThemedText>
                <ThemedText
                  style={[styles.statLabel, { color: theme.secondaryText }]}
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  minimumFontScale={0.75}
                >
                  Сдано
                </ThemedText>
              </ThemedView>

              <ThemedView style={[styles.statCard, { backgroundColor: theme.background }]}>
                <IconSymbol name="exclamationmark.circle.fill" size={24} color={theme.red} />
                <ThemedText style={[styles.statValue, { color: theme.textColor }]}>
                  {stats.debtsCount}
                </ThemedText>
                <ThemedText
                  style={[styles.statLabel, { color: theme.secondaryText }]}
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  minimumFontScale={0.75}
                >
                  Долги
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>

          <ThemedView style={[styles.card, { backgroundColor: theme.cardBackground }]}>
            <ThemedView style={styles.cardHeader}>
              <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ThemedText style={[styles.cardTitle, { color: theme.textColor }]}>
                  Расписание
                </ThemedText>
                <ThemedText style={[styles.groupText, { color: theme.secondaryText }]}>
                  •
                </ThemedText>
                <ThemedText style={[styles.groupText, { color: theme.secondaryText }]}>
                  {userInfo?.groupName}
                </ThemedText>
              </ThemedView>
              <TouchableOpacity onPress={() => router.push('/schedule')}>
                <ThemedText style={{ color: theme.accentColor }}>
                  Всё расписание
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>

            <ThemedView style={styles.segmentedControlContainer}>
              <ThemedView style={[styles.segmentedControl]}>
                {Object.entries(DAY_LABELS).map(([key, label]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.segment,
                      { backgroundColor: selectedDay === Number(key) ? theme.accentColor : theme.background },
                      Platform.select({
                        ios: {
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: selectedDay === Number(key) ? 0.1 : 0.05,
                          shadowRadius: 4,
                        },
                        android: {
                          elevation: selectedDay === Number(key) ? 4 : 2,
                        },
                      }),
                    ]}
                    onPress={() => setSelectedDay(Number(key) as DayOffset)}
                  >
                    <ThemedText
                      style={[
                        styles.segmentText,
                        { color: selectedDay === Number(key) ? '#FFFFFF' : theme.secondaryText }
                      ]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.75}
                    >
                      {label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.scheduleList}>
              {currentSchedule.length === 0 ? (
                <ThemedText style={{ color: theme.secondaryText, textAlign: 'center', padding: 16 }}>
                  {`${DAY_LABELS[selectedDay]} пар нет`}
                </ThemedText>
              ) : (
                currentSchedule.map((lesson, index) => {
                  const typeInfo = getLessonTypeInfo(lesson.type);
                  return (
                    <ThemedView
                      key={index}
                      style={[styles.scheduleItem, { borderColor: theme.borderColor }]}
                    >
                      <ThemedView style={styles.scheduleTime}>
                        {lesson.timeRange ? (
                          <>
                            <ThemedText style={[styles.timeText, { color: theme.secondaryText }]}>
                              {lesson.timeRange.split('-')[0]}
                            </ThemedText>
                            <ThemedText style={[styles.timeText, { color: theme.secondaryText }]}>
                              {lesson.timeRange.split('-')[1]}
                            </ThemedText>
                          </>
                        ) : (
                          <ThemedText style={[styles.infinitySymbol, { color: typeInfo.color }]}>
                            ∞
                          </ThemedText>
                        )}
                      </ThemedView>

                      <ThemedView style={[styles.lessonTypeLine, { backgroundColor: typeInfo.color }]} />

                      <ThemedView style={styles.scheduleInfo}>
                        <ThemedText style={[styles.lessonName, { color: theme.textColor }]}>
                          {lesson.lessonName}
                          {!lesson.timeRange && (
                            <ThemedText style={[styles.examLabel, { color: typeInfo.color }]}>
                              {' • ' + typeInfo.label}
                            </ThemedText>
                          )}
                        </ThemedText>
                        <ThemedView style={styles.lessonDetails}>
                          {lesson.auditoryName && (
                            <ThemedView style={styles.detailItem}>
                              <IconSymbol name="mappin.circle.fill" size={14} color={theme.secondaryText} />
                              <ThemedText style={{ color: theme.secondaryText }}>
                                {lesson.auditoryName}
                              </ThemedText>
                            </ThemedView>
                          )}
                          {lesson.teacherName && (
                            <ThemedView style={styles.detailItem}>
                              <IconSymbol name="person.fill" size={14} color={theme.secondaryText} />
                              <ThemedText style={{ color: theme.secondaryText }}>
                                {lesson.teacherName}
                              </ThemedText>
                            </ThemedView>
                          )}
                          {lesson.isDistant && (
                            <ThemedView style={styles.detailItem}>
                              <IconSymbol name="video.fill" size={14} color={theme.secondaryText} />
                              <ThemedText style={{ color: theme.secondaryText }}>
                                Дистанционно
                              </ThemedText>
                            </ThemedView>
                          )}
                        </ThemedView>
                      </ThemedView>
                    </ThemedView>
                  );
                })
              )}
            </ThemedView>
          </ThemedView>

          <ThemedView style={[styles.card, { backgroundColor: theme.cardBackground }]}>
            <ThemedView style={styles.cardHeader}>
              <ThemedText style={[styles.cardTitle, { color: theme.textColor }]}>
                Быстрые действия
              </ThemedText>
            </ThemedView>

            <ThemedView style={[styles.actionGrid, { paddingTop: 0 }]}>
              <TouchableOpacity style={[styles.actionButton, { opacity: 0.5 }]}
                disabled={true}>
                <ThemedView style={[styles.actionIcon, { backgroundColor: theme.background }]}>
                  <IconSymbol name="doc.fill" size={24} color={theme.accentColor} />
                </ThemedView>
                <ThemedText style={[styles.actionText, { color: theme.textColor }]}>
                  Справка
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionButton]}
                onPress={() => router.push('/schedule')}>
                <ThemedView style={[styles.actionIcon, { backgroundColor: theme.background }]}>
                  <IconSymbol name="calendar" size={24} color={theme.accentColor} />
                </ThemedView>
                <ThemedText style={[styles.actionText, { color: theme.textColor }]}>
                  Расписание
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionButton, { opacity: 0.5 }]}
                disabled={true}>
                <ThemedView style={[styles.actionIcon, { backgroundColor: theme.background }]}>
                  <IconSymbol name="person.2.fill" size={24} color={theme.accentColor} />
                </ThemedView>
                <ThemedText style={[styles.actionText, { color: theme.textColor }]}>
                  Преподаватели
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionButton, { opacity: 0.5 }]}
                disabled={true}>
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
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    marginTop: -20,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: -30,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  timeCard: {
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    minWidth: 110,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  timeText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
  dateText: {
    fontSize: 13,
    fontWeight: '500',
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
    fontSize: 18,
    fontWeight: '600',
  },
  segmentedControlContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 2,
    backgroundColor: 'transparent',
    gap: 8,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scheduleList: {
    gap: 8,
    padding: 16,
    paddingTop: 0,
  },
  scheduleItem: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 64,
  },
  scheduleTime: {
    width: 45,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    alignSelf: 'stretch',
  },
  lessonTypeLine: {
    width: 3,
    borderRadius: 1.5,
    alignSelf: 'stretch',
  },
  scheduleInfo: {
    flex: 1,
    gap: 4,
    paddingVertical: 4,
  },
  lessonName: {
    fontSize: 15,
    fontWeight: '500',
  },
  lessonDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    paddingTop: 8,
  },
  statCard: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
    flex: 0.8,
  },
  statCardWide: {
    flex: 1.4,
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
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  examLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  infinitySymbol: {
    fontSize: 20,
    fontWeight: '400',
    lineHeight: 20,
  },
  statLabel: {
    textAlign: 'center',
    fontSize: 13,
  },
  groupText: {
    marginTop: 1,
    fontSize: 12,
  }
});
