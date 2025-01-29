import React, { useEffect, useState } from 'react';
import { StyleSheet, Platform, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/app/context/theme';
import Constants from 'expo-constants';
import { MaterialIcons } from '@expo/vector-icons';

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
    const now = new Date("2024-11-11");
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

      const now = new Date("2024-11-11");
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
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <ThemedView style={styles.loadingContainer}>
          <ThemedText>Загрузка...</ThemedText>
        </ThemedView>
      </SafeAreaView>
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.content}
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
            <ThemedText style={[styles.cardTitle, { color: theme.textColor }]}>
              Расписание
            </ThemedText>
            <TouchableOpacity>
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
                Пар нет
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

            <TouchableOpacity style={[styles.actionButton, { opacity: 0.5 }]}
              disabled={true}>
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
    paddingBottom: 80,
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
    fontSize: 20,
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
});
