import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Platform,
  ScrollView,
  Image,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
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
  withDelay,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { API_URL, OAUTH_URL, OAUTH_CLIENT_ID, OAUTH_SCOPE } =
  Constants.expoConfig?.extra || {};

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

const HomeScreenSkeleton = ({ theme }: { theme: any }) => {
  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        styles.scrollContent,
        { padding: 16, gap: 16, paddingBottom: 80 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <ThemedView style={styles.headerContainer}>
        <SkeletonLoader style={{ width: 150, height: 28, borderRadius: 8 }} />
        <SkeletonLoader style={{ width: 110, height: 32, borderRadius: 16 }} />
      </ThemedView>

      <SkeletonLoader style={{ width: 200, height: 16, borderRadius: 8 }} />

      <ThemedView
        style={[styles.card, { backgroundColor: theme.cardBackground }]}
      >
        <ThemedView style={styles.cardHeader}>
          <SkeletonLoader style={{ width: 120, height: 24, borderRadius: 8 }} />
          <SkeletonLoader style={{ width: 80, height: 20, borderRadius: 8 }} />
        </ThemedView>

        <ThemedView style={styles.statsGrid}>
          <ThemedView
            style={[
              styles.statCard,
              styles.statCardWide,
              { backgroundColor: theme.background },
            ]}
          >
            <SkeletonLoader
              style={{ width: 24, height: 24, borderRadius: 12 }}
            />
            <SkeletonLoader
              style={{ width: 40, height: 28, borderRadius: 8 }}
            />
            <SkeletonLoader
              style={{ width: 80, height: 16, borderRadius: 8 }}
            />
          </ThemedView>

          {[1, 2].map((i) => (
            <ThemedView
              key={i}
              style={[styles.statCard, { backgroundColor: theme.background }]}
            >
              <SkeletonLoader
                style={{ width: 24, height: 24, borderRadius: 12 }}
              />
              <SkeletonLoader
                style={{ width: 30, height: 28, borderRadius: 8 }}
              />
              <SkeletonLoader
                style={{ width: 60, height: 16, borderRadius: 8 }}
              />
            </ThemedView>
          ))}
        </ThemedView>
      </ThemedView>

      <ThemedView
        style={[styles.card, { backgroundColor: theme.cardBackground }]}
      >
        <ThemedView style={styles.cardHeader}>
          <ThemedView
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
          >
            <SkeletonLoader
              style={{ width: 100, height: 24, borderRadius: 8 }}
            />
            <SkeletonLoader
              style={{ width: 80, height: 16, borderRadius: 8 }}
            />
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
                  marginHorizontal: 2,
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
                <SkeletonLoader
                  style={{ width: 40, height: 16, borderRadius: 8 }}
                />
                <SkeletonLoader
                  style={{ width: 40, height: 16, borderRadius: 8 }}
                />
              </ThemedView>

              <SkeletonLoader
                style={{ width: 3, height: '100%', borderRadius: 1.5 }}
              />

              <ThemedView style={styles.scheduleInfo}>
                <SkeletonLoader
                  style={{ width: '80%', height: 20, borderRadius: 8 }}
                />
                <ThemedView style={styles.lessonDetails}>
                  <SkeletonLoader
                    style={{ width: 120, height: 16, borderRadius: 8 }}
                  />
                  <SkeletonLoader
                    style={{ width: 100, height: 16, borderRadius: 8 }}
                  />
                </ThemedView>
              </ThemedView>
            </ThemedView>
          ))}
        </ThemedView>
      </ThemedView>

      <ThemedView
        style={[styles.card, { backgroundColor: theme.cardBackground }]}
      >
        <ThemedView style={styles.cardHeader}>
          <SkeletonLoader style={{ width: 140, height: 24, borderRadius: 8 }} />
        </ThemedView>

        <ThemedView style={[styles.actionGrid, { paddingTop: 0 }]}>
          {[1, 2, 3, 4].map((i) => (
            <ThemedView key={i} style={styles.actionButton}>
              <SkeletonLoader
                style={{ width: 48, height: 48, borderRadius: 12 }}
              />
              <SkeletonLoader
                style={{ width: 80, height: 16, borderRadius: 8 }}
              />
            </ThemedView>
          ))}
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
};

interface CachedSchedule {
  timestamp: number;
  data: Record<DayOffset, Lesson[]>;
}

const CACHE_DURATION = 20000;

const getCachedSchedule = async () => {
  try {
    const cached = await AsyncStorage.getItem('home_schedule_cache');
    if (cached) {
      const parsedCache: CachedSchedule = JSON.parse(cached);
      const now = Date.now();
      if (now - parsedCache.timestamp < CACHE_DURATION) {
        return parsedCache.data;
      }
    }
    return null;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
};

const setCachedSchedule = async (data: Record<DayOffset, Lesson[]>) => {
  try {
    const cacheData: CachedSchedule = {
      timestamp: Date.now(),
      data,
    };
    await AsyncStorage.setItem(
      'home_schedule_cache',
      JSON.stringify(cacheData),
    );
  } catch (error) {
    console.error('Error setting cache:', error);
  }
};

export default function HomeScreen() {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<AuthInfo['user'] | null>(null);
  const [schedule, setSchedule] = useState<Record<DayOffset, Lesson[]>>(
    {} as Record<DayOffset, Lesson[]>,
  );
  const [upcomingExams, setUpcomingExams] = useState<Lesson[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayOffset>(0);
  const [stats, setStats] = useState({
    averageGrade: 0,
    completedCount: 0,
    debtsCount: 0,
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  const theme = {
    background: isDarkMode ? '#000000' : '#F2F3F7',
    cardBackground: isDarkMode ? '#1D1D1D' : '#FFFFFF',
    textColor: isDarkMode ? '#FFFFFF' : '#000000',
    secondaryText: isDarkMode
      ? 'rgba(255, 255, 255, 0.6)'
      : 'rgba(0, 0, 0, 0.6)',
    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    segmentBackground: isDarkMode
      ? '#2C2C2E'
      : Platform.select({ ios: '#F2F3F7', android: '#E8E8E8' }),
    accentColor: '#2688EB',
    green: '#34C759',
    yellow: '#FFCC00',
    red: '#FF3B30',
  };

  const isTokenExpired = (token: string) => {
    const { issued_at, expires_in } = JSON.parse(token);
    const now = Date.now();
    return now - issued_at > expires_in * 1000;
  };

  const refreshToken = async () => {
    const tokens = await AsyncStorage.getItem('auth_tokens');
    if (!tokens) {
      router.replace('/auth');
      return;
    }

    const { refresh_token } = JSON.parse(tokens);

    const response = await fetch(
      `${OAUTH_URL}/access_token?client_id=${OAUTH_CLIENT_ID}&grant_type=refresh_token&refresh_token=${refresh_token}`,
      {
        method: 'POST',
      },
    );

    const data = await response.json();
    await AsyncStorage.setItem(
      'auth_tokens',
      JSON.stringify({ ...data, issued_at: Date.now() }),
    );

    return data;
  };

  const fetchUserInfo = async (accessToken: string) => {
    try {
      const response = await fetch(`${OAUTH_URL}/check`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
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
      const cachedData = await getCachedSchedule();
      if (cachedData) {
        setSchedule(cachedData);
        return;
      }

      const response = await fetch(
        `${API_URL}/s/schedule/v1/schedule/group/${encodeURIComponent(
          groupName,
        )}`,
      );
      const data: ScheduleResponse = await response.json();

      const days = data.items.flatMap((item) => item.days);
      const newSchedule: Record<DayOffset, Lesson[]> = {} as Record<
        DayOffset,
        Lesson[]
      >;

      const allExams = days
        .flatMap((day) => day.lessons)
        .filter((lesson) => lesson.type === 256)
        .sort((a, b) => {
          if (!a.startAt || !b.startAt) return 0;
          return new Date(a.startAt).getTime() - new Date(b.startAt).getTime();
        });

      setUpcomingExams(allExams);

      const now = new Date();
      now.setHours(now.getHours());

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
          const isCurrentAcademicYear =
            scheduleMonth >= 9
              ? scheduleYear === academicYear
              : scheduleYear === academicYear + 1;

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
          console.log(
            'Found schedule for:',
            targetDateStr,
            'with',
            daySchedule.lessons.length,
            'lessons',
          );
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
          },
        );
      });

      console.log('Final schedule:', newSchedule);

      await setCachedSchedule(newSchedule);
      setSchedule(newSchedule);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };

  const fetchMarks = async (accessToken: string) => {
    try {
      const response = await fetch(`${API_URL}/s/general/v1/mark/my`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
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

      const lastSemester = Math.max(
        ...Object.keys(marksBySemester).map(Number),
      );

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
        debtsCount,
      });
    } catch (error) {
      console.error('Error fetching marks:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      let tokens = await AsyncStorage.getItem('auth_tokens');
      if (!tokens) {
        router.replace('/auth');
        return;
      }

      if (isTokenExpired(tokens)) {
        const data = await refreshToken();
        await AsyncStorage.setItem(
          'auth_tokens',
          JSON.stringify({ ...data, issued_at: Date.now() }),
        );
        tokens = await AsyncStorage.getItem('auth_tokens');
      }

      const { access_token } = JSON.parse(tokens as string);
      const groupName = await fetchUserInfo(access_token);
      if (groupName) {
        await Promise.all([fetchSchedule(groupName), fetchMarks(access_token)]);
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
      weekday: 'long',
    };
    return 'Сегодня, ' + date.toLocaleDateString('ru-RU', options);
  };

  const handleDaySelect = async (day: DayOffset) => {
    if (Platform.OS !== 'web') {
      await Haptics.selectionAsync();
    }
    setSelectedDay(day);
  };

  const handleQuickAction = async (action: string) => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    switch (action) {
      case 'schedule':
        router.push('/schedule');
        break;
    }
  };

  if (loading) {
    return (
      <Container>
        <SafeAreaView
          style={[styles.container, { backgroundColor: theme.background }]}
        >
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

  const getDayNumber = (offset: number) => {
    const date = new Date();
    date.setHours(date.getHours());
    date.setDate(date.getDate() + offset);
    return date.getDate();
  };

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
          <ThemedView style={styles.headerContainer}>
            <ThemedText style={[styles.pageTitle, { color: theme.textColor }]}>
              Привет, {userInfo?.firstName}
            </ThemedText>
          </ThemedView>
          <ThemedText style={[styles.dateText, { color: theme.secondaryText }]}>
            {formatDate(currentTime)}
          </ThemedText>

          {upcomingExams.length > 0 && (
            <ThemedView style={styles.examTimelineContainer}>
              <ThemedView style={styles.examTimelineHeader}>
                <ThemedView style={styles.examTimelineTitleContainer}>
                  <IconSymbol
                    name="flame.fill"
                    size={20}
                    color={theme.accentColor}
                  />
                  <ThemedText
                    style={[
                      styles.examTimelineTitle,
                      { color: theme.textColor },
                    ]}
                  >
                    Сессия
                  </ThemedText>
                </ThemedView>
                <ThemedText
                  style={[
                    styles.examTimelineSubtitle,
                    { color: theme.secondaryText },
                  ]}
                >
                  {upcomingExams.length}{' '}
                  {upcomingExams.length === 1
                    ? 'экзамен'
                    : upcomingExams.length < 5
                    ? 'экзамена'
                    : 'экзаменов'}
                </ThemedText>
              </ThemedView>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.examTimelineScroll}
              >
                {upcomingExams.map((exam, index) => {
                  const examDate = exam.startAt
                    ? new Date(exam.startAt)
                    : new Date();
                  const daysLeft = Math.ceil(
                    (examDate.getTime() - new Date().getTime()) /
                      (1000 * 60 * 60 * 24),
                  );
                  const isToday = daysLeft === 0;
                  const isTomorrow = daysLeft === 1;
                  const isPassed = daysLeft < 0;

                  const progress = Math.max(
                    0,
                    Math.min(1, index / (upcomingExams.length - 1)),
                  );
                  const hue = 200 + progress * 160;
                  const color = `hsl(${hue}, 85%, ${isDarkMode ? 65 : 55}%)`;

                  return (
                    <ThemedView
                      key={index}
                      style={[
                        styles.examTimelineCard,
                        {
                          backgroundColor: theme.cardBackground,
                          borderColor: color,
                          borderWidth: isToday ? 2 : 0,
                          marginBottom: 16,
                          opacity: isPassed ? 0.5 : 1,
                        },
                      ]}
                    >
                      <ThemedView style={styles.examTimelineCardHeader}>
                        <ThemedView
                          style={[
                            styles.examTimelineBadge,
                            { backgroundColor: `${color}20` },
                          ]}
                        >
                          <ThemedText
                            style={[
                              styles.examTimelineDays,
                              { color: theme.textColor },
                            ]}
                          >
                            {isPassed
                              ? 'Прошел'
                              : isToday
                              ? 'Сегодня'
                              : isTomorrow
                              ? 'Завтра'
                              : `${daysLeft} дн.`}
                          </ThemedText>
                        </ThemedView>
                        <IconSymbol
                          name={
                            isPassed
                              ? 'checkmark.circle.fill'
                              : isToday
                              ? 'exclamationmark.circle.fill'
                              : 'calendar'
                          }
                          size={20}
                          color={color}
                        />
                      </ThemedView>

                      <ThemedText
                        style={[
                          styles.examTimelineName,
                          { color: theme.textColor },
                        ]}
                        numberOfLines={2}
                      >
                        {exam.lessonName}
                      </ThemedText>

                      <ThemedView style={styles.examTimelineDetails}>
                        {exam.auditoryName && (
                          <ThemedView style={styles.examTimelineDetail}>
                            <IconSymbol
                              name="mappin.circle.fill"
                              size={16}
                              color={color}
                            />
                            <ThemedText
                              style={[
                                styles.examTimelineDetailText,
                                { color: theme.secondaryText },
                              ]}
                            >
                              {exam.auditoryName}
                            </ThemedText>
                          </ThemedView>
                        )}
                        <ThemedText
                          style={[
                            styles.examTimelineDate,
                            { color: theme.secondaryText },
                          ]}
                        >
                          {examDate.toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                          })}
                        </ThemedText>
                      </ThemedView>

                      <ThemedView
                        style={[
                          styles.examTimelineProgress,
                          { backgroundColor: `${color}20` },
                        ]}
                      >
                        <Animated.View
                          style={[
                            styles.examTimelineProgressBar,
                            {
                              backgroundColor: color,
                              width: isPassed ? '100%' : '100%',
                            },
                          ]}
                        />
                      </ThemedView>
                    </ThemedView>
                  );
                })}
              </ScrollView>
            </ThemedView>
          )}

          <ThemedView
            style={[styles.card, { backgroundColor: theme.cardBackground }]}
          >
            <ThemedView style={styles.cardHeader}>
              <ThemedText
                style={[styles.cardTitle, { color: theme.textColor }]}
              >
                Успеваемость
              </ThemedText>
              <TouchableOpacity
                onPress={async () => {
                  if (Platform.OS !== 'web') {
                    await Haptics.impactAsync(
                      Haptics.ImpactFeedbackStyle.Medium,
                    );
                  }
                  router.push('/marks');
                }}
              >
                <ThemedText style={{ color: theme.accentColor }}>
                  Подробнее
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>

            <ThemedView style={styles.statsGrid}>
              <ThemedView
                style={[
                  styles.statCard,
                  styles.statCardWide,
                  { backgroundColor: theme.background },
                ]}
              >
                <IconSymbol name="star.fill" size={24} color={theme.yellow} />
                <ThemedText
                  style={[styles.statValue, { color: theme.textColor }]}
                >
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

              <ThemedView
                style={[styles.statCard, { backgroundColor: theme.background }]}
              >
                <IconSymbol
                  name="checkmark.circle.fill"
                  size={24}
                  color={theme.green}
                />
                <ThemedText
                  style={[styles.statValue, { color: theme.textColor }]}
                >
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

              <ThemedView
                style={[styles.statCard, { backgroundColor: theme.background }]}
              >
                <IconSymbol
                  name="exclamationmark.circle.fill"
                  size={24}
                  color={theme.red}
                />
                <ThemedText
                  style={[styles.statValue, { color: theme.textColor }]}
                >
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

          <ThemedView
            style={[styles.card, { backgroundColor: theme.cardBackground }]}
          >
            <ThemedView style={styles.cardHeader}>
              <ThemedView
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
              >
                <ThemedText
                  style={[styles.cardTitle, { color: theme.textColor }]}
                >
                  Расписание
                </ThemedText>
                <ThemedText
                  style={[styles.groupText, { color: theme.secondaryText }]}
                >
                  •
                </ThemedText>
                <ThemedText
                  style={[styles.groupText, { color: theme.secondaryText }]}
                >
                  {userInfo?.groupName}
                </ThemedText>
              </ThemedView>
              <TouchableOpacity
                onPress={async () => {
                  if (Platform.OS !== 'web') {
                    await Haptics.impactAsync(
                      Haptics.ImpactFeedbackStyle.Light,
                    );
                  }
                  router.push('/schedule');
                }}
              >
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
                      {
                        backgroundColor:
                          selectedDay === Number(key)
                            ? theme.accentColor
                            : theme.background,
                      },
                      Platform.select({
                        ios: {
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity:
                            selectedDay === Number(key) ? 0.1 : 0.05,
                          shadowRadius: 4,
                        },
                        android: {
                          elevation: selectedDay === Number(key) ? 4 : 2,
                        },
                      }),
                    ]}
                    onPress={() => handleDaySelect(Number(key) as DayOffset)}
                  >
                    <ThemedText
                      style={[
                        styles.dayNumber,
                        {
                          color:
                            selectedDay === Number(key)
                              ? '#FFFFFF'
                              : theme.secondaryText,
                        },
                      ]}
                    >
                      {getDayNumber(Number(key))}
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.segmentText,
                        {
                          color:
                            selectedDay === Number(key)
                              ? '#FFFFFF'
                              : theme.secondaryText,
                        },
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
                <ThemedText
                  style={{
                    color: theme.secondaryText,
                    textAlign: 'center',
                    padding: 16,
                  }}
                >
                  {`${DAY_LABELS[selectedDay]} пар нет`}
                </ThemedText>
              ) : (
                currentSchedule.map((lesson, index) => {
                  const typeInfo = getLessonTypeInfo(lesson.type);
                  return (
                    <ThemedView
                      key={index}
                      style={[
                        styles.scheduleItem,
                        { borderColor: theme.borderColor },
                      ]}
                    >
                      <ThemedView style={styles.scheduleTime}>
                        {lesson.timeRange ? (
                          <>
                            <ThemedText
                              style={[
                                styles.timeText,
                                { color: theme.secondaryText },
                              ]}
                            >
                              {lesson.timeRange.split('-')[0]}
                            </ThemedText>
                            <ThemedText
                              style={[
                                styles.timeText,
                                { color: theme.secondaryText },
                              ]}
                            >
                              {lesson.timeRange.split('-')[1]}
                            </ThemedText>
                          </>
                        ) : (
                          <ThemedText
                            style={[
                              styles.infinitySymbol,
                              { color: typeInfo.color },
                            ]}
                          >
                            ∞
                          </ThemedText>
                        )}
                      </ThemedView>

                      <ThemedView
                        style={[
                          styles.lessonTypeLine,
                          { backgroundColor: typeInfo.color },
                        ]}
                      />

                      <ThemedView style={styles.scheduleInfo}>
                        <ThemedText
                          style={[
                            styles.lessonName,
                            { color: theme.textColor },
                          ]}
                        >
                          {lesson.lessonName}
                          {!lesson.timeRange && (
                            <ThemedText
                              style={[
                                styles.examLabel,
                                { color: typeInfo.color },
                              ]}
                            >
                              {' • ' + typeInfo.label}
                            </ThemedText>
                          )}
                        </ThemedText>
                        <ThemedView style={styles.lessonDetails}>
                          {lesson.auditoryName && (
                            <ThemedView style={styles.detailItem}>
                              <IconSymbol
                                name="mappin.circle.fill"
                                size={14}
                                color={theme.secondaryText}
                              />
                              <ThemedText
                                style={{ color: theme.secondaryText }}
                              >
                                {lesson.auditoryName}
                              </ThemedText>
                            </ThemedView>
                          )}
                          {lesson.teacherName && (
                            <ThemedView style={styles.detailItem}>
                              <IconSymbol
                                name="person.fill"
                                size={14}
                                color={theme.secondaryText}
                              />
                              <ThemedText
                                style={{ color: theme.secondaryText }}
                              >
                                {lesson.teacherName}
                              </ThemedText>
                            </ThemedView>
                          )}
                          {lesson.isDistant && (
                            <ThemedView style={styles.detailItem}>
                              <IconSymbol
                                name="video.fill"
                                size={14}
                                color={theme.secondaryText}
                              />
                              <ThemedText
                                style={{ color: theme.secondaryText }}
                              >
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

          <ThemedView
            style={[styles.card, { backgroundColor: theme.cardBackground }]}
          >
            <ThemedView style={styles.cardHeader}>
              <ThemedText
                style={[styles.cardTitle, { color: theme.textColor }]}
              >
                Быстрые действия
              </ThemedText>
            </ThemedView>

            <ThemedView style={[styles.actionGrid, { paddingTop: 0 }]}>
              <TouchableOpacity
                style={[styles.actionButton, { opacity: 0.5 }]}
                onPress={async () => {
                  if (Platform.OS !== 'web') {
                    await Haptics.notificationAsync(
                      Haptics.NotificationFeedbackType.Warning,
                    );
                  }
                }}
                disabled={true}
              >
                <ThemedView
                  style={[
                    styles.actionIcon,
                    { backgroundColor: theme.background },
                  ]}
                >
                  <IconSymbol
                    name="doc.fill"
                    size={24}
                    color={theme.accentColor}
                  />
                </ThemedView>
                <ThemedText
                  style={[styles.actionText, { color: theme.textColor }]}
                >
                  Справка
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton]}
                onPress={async () => {
                  await handleQuickAction('schedule');
                }}
              >
                <ThemedView
                  style={[
                    styles.actionIcon,
                    { backgroundColor: theme.background },
                  ]}
                >
                  <IconSymbol
                    name="calendar"
                    size={24}
                    color={theme.accentColor}
                  />
                </ThemedView>
                <ThemedText
                  style={[styles.actionText, { color: theme.textColor }]}
                >
                  Расписание
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { opacity: 0.5 }]}
                disabled={true}
              >
                <ThemedView
                  style={[
                    styles.actionIcon,
                    { backgroundColor: theme.background },
                  ]}
                >
                  <IconSymbol
                    name="person.2.fill"
                    size={24}
                    color={theme.accentColor}
                  />
                </ThemedView>
                <ThemedText
                  style={[styles.actionText, { color: theme.textColor }]}
                >
                  Преподаватели
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { opacity: 0.5 }]}
                disabled={true}
              >
                <ThemedView
                  style={[
                    styles.actionIcon,
                    { backgroundColor: theme.background },
                  ]}
                >
                  <IconSymbol
                    name="books.vertical.fill"
                    size={24}
                    color={theme.accentColor}
                  />
                </ThemedView>
                <ThemedText
                  style={[styles.actionText, { color: theme.textColor }]}
                >
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
    marginTop: -10,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: -15,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
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
    paddingVertical: 2,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  segmentText: {
    marginTop: -8,
    fontSize: 12,
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
  },
  dayNumber: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  examTimelineContainer: {
    borderRadius: 16,
    marginBottom: 16,
  },
  examTimelineHeader: {
    marginTop: 16,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  examTimelineTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  examTimelineTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  examTimelineSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  examTimelineScroll: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 4,
  },
  examTimelineCard: {
    width: 270,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  examTimelineCardHeader: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  examTimelineBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  examTimelineDays: {
    fontSize: 13,
    fontWeight: '600',
  },
  examTimelineName: {
    fontSize: 17,
    fontWeight: '600',
    minHeight: 44,
  },
  examTimelineDetails: {
    backgroundColor: 'transparent',
    gap: 8,
  },
  examTimelineDetail: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  examTimelineDetailText: {
    fontSize: 13,
  },
  examTimelineDate: {
    fontSize: 13,
  },
  examTimelineProgress: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  examTimelineProgressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    borderRadius: 2,
  },
});
