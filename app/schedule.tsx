import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Platform, ScrollView, TouchableOpacity, ViewStyle, Dimensions, View, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Container } from '@/components/ui/Container';
import { useTheme } from '@/app/context/theme';
import Constants from 'expo-constants';
import { router, Stack } from 'expo-router';

const { API_URL, OAUTH_URL } = Constants.expoConfig?.extra || {};

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

interface WeekSchedule {
  weekNumber: number;
  days: ScheduleDay[];
}

interface CachedSchedule {
  timestamp: number;
  data: ScheduleDay[];
}

const webStyles = {
  minHeight: '100vh',
} as unknown as ViewStyle;

const MAX_WEB_WIDTH = 735;

const getContainerWidth = () => {
  if (Platform.OS === 'web') {
    return Math.min(Dimensions.get('window').width, MAX_WEB_WIDTH);
  }
  return Dimensions.get('window').width;
};

const getMskDate = () => {
  const now = new Date();
  const mskOffset = 3;
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (3600000 * mskOffset));
};

const CACHE_DURATION = 20000;

const getCachedSchedule = async () => {
  try {
    const cached = await AsyncStorage.getItem('schedule_cache');
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

const setCachedSchedule = async (data: ScheduleDay[]) => {
  try {
    const cacheData: CachedSchedule = {
      timestamp: Date.now(),
      data,
    };
    await AsyncStorage.setItem('schedule_cache', JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error setting cache:', error);
  }
};

export default function ScheduleScreen() {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<number>(0);
  const [groupName, setGroupName] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [currentWeekIndex, setCurrentWeekIndex] = useState<number>(0);
  const [fadeAnim] = useState(new Animated.Value(0.3));

  const theme = {
    background: isDarkMode ? '#000000' : '#F2F3F7',
    cardBackground: isDarkMode ? '#1D1D1D' : '#FFFFFF',
    textColor: isDarkMode ? '#FFFFFF' : '#000000',
    secondaryText: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    accentColor: '#2688EB',
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
        setGroupName(data.auth_info.user.groupName);
        return data.auth_info.user.groupName;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user info:', error);
      return null;
    }
  };

  const initializeCurrentSchedule = (scheduleData: ScheduleDay[]) => {
    const now = getMskDate();
    const today = now.toISOString().split('T')[0];

    const weeks = Array.from(new Set(scheduleData.map(day => day.info.weekNumber)))
      .sort((a, b) => a - b);

    const currentWeek = scheduleData.find(day => {
      const date = new Date(day.info.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay() + 1);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(date);
      weekEnd.setDate(date.getDate() + (7 - date.getDay()));
      weekEnd.setHours(23, 59, 59, 999);

      return now >= weekStart && now <= weekEnd;
    });

    if (currentWeek) {
      const weekIndex = weeks.indexOf(currentWeek.info.weekNumber);
      setCurrentWeekIndex(Math.max(0, weekIndex));
      setSelectedWeek(Math.max(0, weekIndex));
    }

    const todaySchedule = scheduleData.find(day => {
      const scheduleDate = new Date(day.info.date);
      const scheduleDay = scheduleDate.toISOString().split('T')[0];
      return scheduleDay === today;
    });

    if (todaySchedule) {
      setSelectedDay(todaySchedule.info.date);
    } else {
      const nextDay = scheduleData
        .find(day => new Date(day.info.date) > now);
      if (nextDay) {
        setSelectedDay(nextDay.info.date);
      }
    }
  };

  const fetchSchedule = async (groupName: string) => {
    try {
      const cachedData = await getCachedSchedule();
      if (cachedData) {
        setSchedule(cachedData);
        initializeCurrentSchedule(cachedData);
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/s/schedule/v1/schedule/group/${encodeURIComponent(groupName)}`);
      const data: ScheduleResponse = await response.json();

      const allDays = data.items.flatMap(item => item.days)
        .filter(day => {
          const date = new Date(day.info.date);
          return date >= new Date();
        })
        .sort((a, b) => new Date(a.info.date).getTime() - new Date(b.info.date).getTime());

      await setCachedSchedule(allDays);

      setSchedule(allDays);
      initializeCurrentSchedule(allDays);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
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
        await fetchSchedule(groupName);
      }
    };

    init();
  }, []);

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
  }, []);

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
      case 4096:
        return { label: 'ВУЦ', color: '#FF3B30' };
      default:
        return { label: '', color: '#8E8E93' };
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    };
    return date.toLocaleDateString('ru-RU', options);
  };

  const weeks = Array.from(new Set(schedule.map(day => day.info.weekNumber)))
    .sort((a, b) => a - b);

  const groupScheduleByWeeks = (schedule: ScheduleDay[]): WeekSchedule[] => {
    const weekMap = new Map<number, ScheduleDay[]>();

    schedule.forEach(day => {
      if (!weekMap.has(day.info.weekNumber)) {
        weekMap.set(day.info.weekNumber, []);
      }
      weekMap.get(day.info.weekNumber)?.push(day);
    });

    return Array.from(weekMap.entries())
      .map(([weekNumber, days]) => ({
        weekNumber,
        days: days.sort((a, b) => new Date(a.info.date).getTime() - new Date(b.info.date).getTime())
      }));
  };

  const weekScrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (weekScrollViewRef.current && !loading) {
      const scrollToOffset = currentWeekIndex * (Platform.OS === 'web' ? MAX_WEB_WIDTH - 16 : Dimensions.get('window').width - 16);
      weekScrollViewRef.current.scrollTo({ x: scrollToOffset, animated: true });
    }
  }, [currentWeekIndex, loading]);

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <Container>
          <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <ScrollView
              style={[styles.scrollView, { backgroundColor: theme.background }]}
              contentContainerStyle={[
                styles.scrollContent,
                { padding: 16, gap: 16, paddingBottom: 80 }
              ]}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                  <IconSymbol name="chevron.left" size={24} color={theme.textColor} />
                </TouchableOpacity>
                <ThemedText style={[styles.title, { color: theme.textColor }]}>
                  Расписание
                </ThemedText>
              </View>

              <ThemedView style={[
                styles.weekContainer,
                {
                  backgroundColor: theme.cardBackground,
                  height: 121,
                  ...(Platform.OS === 'web' ? {
                    marginTop: 14,
                    marginLeft: 14,
                    height: 120,
                    maxWidth: '100%',
                    alignSelf: 'center',
                  } : {})
                }
              ]}>
                <Animated.View
                  style={[
                    styles.skeletonText,
                    {
                      backgroundColor: isDarkMode ? '#333333' : '#DEDEDE',
                      opacity: fadeAnim,
                      marginTop: -4,
                      marginLeft: -4,
                      width: '10%',
                      marginBottom: 16,
                      ...(Platform.OS === 'web' ? {
                      width: '10%',
                    } : {})
                    }
                  ]}
                />
                <View style={styles.daysGrid}>
                  {[1, 2, 3, 4, 5].map((_, index) => (
                    <Animated.View
                      key={index}
                      style={[
                        styles.skeletonDay,
                        {
                          backgroundColor: isDarkMode ? '#333333' : '#DEDEDE',
                          opacity: fadeAnim,
                        }
                      ]}
                    />
                  ))}
                </View>
              </ThemedView>

              {[1, 2].map((_, index) => (
                <ThemedView
                  key={index}
                  style={[
                    styles.lessonCard,
                    {
                      marginTop: 8,
                      height: 130,
                    }
                  ]}
                >
                  <Animated.View
                    style={[
                      styles.skeletonTime,
                      {
                        height: 100,
                        backgroundColor: isDarkMode ? '#333333' : '#DEDEDE',
                        opacity: fadeAnim,
                      }
                    ]}
                  />
                  <View style={[styles.lessonTypeLine, { backgroundColor: isDarkMode ? '#333333' : '#DEDEDE' }]} />
                  <View style={styles.lessonInfo}>
                    <Animated.View
                      style={[
                        styles.skeletonText,
                        {
                          backgroundColor: isDarkMode ? '#333333' : '#DEDEDE',
                          opacity: fadeAnim,
                          width: '80%',
                          marginBottom: 8,
                          ...(Platform.OS === 'web' ? {
                            width: '40%',
                          } : {})
                        }
                      ]}
                    />
                    <Animated.View
                      style={[
                        styles.skeletonText,
                        {
                          backgroundColor: isDarkMode ? '#333333' : '#DEDEDE',
                          opacity: fadeAnim,
                          width: '20%',
                          marginBottom: 8,
                          ...(Platform.OS === 'web' ? {
                            width: '10%',
                          } : {})
                        }
                      ]}
                    />
                    <Animated.View
                      style={[
                        styles.skeletonText,
                        {
                          backgroundColor: isDarkMode ? '#333333' : '#DEDEDE',
                          opacity: fadeAnim,
                          width: '30%',
                          marginBottom: 8,
                          ...(Platform.OS === 'web' ? {
                            width: '15%',
                          } : {})
                        }
                      ]}
                    />
                    <Animated.View
                      style={[
                        styles.skeletonText,
                        {
                          backgroundColor: isDarkMode ? '#333333' : '#DEDEDE',
                          opacity: fadeAnim,
                          width: '60%',
                          marginBottom: 8,
                          ...(Platform.OS === 'web' ? {
                            width: '25%',
                          } : {})
                        }
                      ]}
                    />
                  </View>
                </ThemedView>
              ))}
            </ScrollView>
          </SafeAreaView>
        </Container>
      </>
    );
  }

  const currentWeekSchedule = schedule.filter(day => day.info.weekNumber === weeks[selectedWeek]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Container>
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
          <ScrollView
            style={[styles.scrollView, { backgroundColor: theme.background }]}
            contentContainerStyle={[
              styles.scrollContent,
              { padding: 16, gap: 16, paddingBottom: 80 }
            ]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()}>
                <IconSymbol name="chevron.left" size={24} color={theme.textColor} />
              </TouchableOpacity>
              <ThemedText style={[styles.title, { color: theme.textColor }]}>
                Расписание
              </ThemedText>
              <ThemedText style={[styles.groupText, { color: theme.secondaryText }]}>
                •
              </ThemedText>
              <ThemedText style={[styles.groupText, { color: theme.secondaryText }]}>
                {groupName}
              </ThemedText>
            </View>

            <ScrollView
              ref={weekScrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.weekSelector}
              snapToInterval={Platform.OS === 'web' ? MAX_WEB_WIDTH - 16 : Dimensions.get('window').width - 16}
              decelerationRate="fast"
              snapToAlignment="start"
              contentContainerStyle={Platform.OS === 'web' ? {
                marginTop: 14,
                maxWidth: MAX_WEB_WIDTH,
                alignSelf: 'center'
              } : undefined}
            >
              {groupScheduleByWeeks(schedule).map((week, weekIndex) => (
                <ThemedView
                  key={week.weekNumber}
                  style={[
                    styles.weekContainer,
                    { backgroundColor: theme.cardBackground }
                  ]}
                >
                  <ThemedText style={[styles.weekTitle, { color: theme.secondaryText }]}>
                    {week.weekNumber > 0 ? `${week.weekNumber} неделя` : 'Сессия'}
                  </ThemedText>

                  <ThemedView style={styles.daysGrid}>
                    {week.days.map((day) => {
                      const date = new Date(day.info.date);
                      const isSelected = selectedDay === day.info.date;
                      return (
                        <TouchableOpacity
                          key={day.info.date}
                          style={[
                            styles.dayButton,
                            {
                              backgroundColor: isSelected ? theme.accentColor : theme.background,
                              borderColor: theme.borderColor
                            }
                          ]}
                          onPress={() => setSelectedDay(day.info.date)}
                        >
                          <ThemedText
                            style={[
                              styles.dayName,
                              { color: isSelected ? '#FFFFFF' : theme.textColor }
                            ]}
                          >
                            {date.toLocaleDateString('ru-RU', { weekday: 'short' })}
                          </ThemedText>
                          <ThemedText
                            style={[
                              styles.dayNumber,
                              { color: isSelected ? '#FFFFFF' : theme.secondaryText }
                            ]}
                          >
                            {date.getDate()}
                          </ThemedText>
                        </TouchableOpacity>
                      );
                    })}
                  </ThemedView>
                </ThemedView>
              ))}
            </ScrollView>

            {selectedDay && schedule
              .find(day => day.info.date === selectedDay)?.lessons
              .sort((a, b) => {
                if (a.timeRange && b.timeRange) {
                  return a.timeRange.localeCompare(b.timeRange);
                }
                return 0;
              })
              .map((lesson, lessonIndex) => {
                const typeInfo = getLessonTypeInfo(lesson.type);
                return (
                  <ThemedView
                    key={lessonIndex}
                    style={[
                      styles.lessonCard,
                      lessonIndex !== schedule.length - 1 && {
                        borderBottomWidth: StyleSheet.hairlineWidth,
                        borderColor: theme.borderColor
                      }
                    ]}
                  >
                    <ThemedView style={styles.lessonTime}>
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
                        <ThemedText style={[styles.examTime, { color: typeInfo.color }]}>
                          Весь день
                        </ThemedText>
                      )}
                    </ThemedView>

                    <ThemedView style={[styles.lessonTypeLine, { backgroundColor: typeInfo.color }]} />

                    <ThemedView style={styles.lessonInfo}>
                      <ThemedText style={[styles.lessonName, { color: theme.textColor }]}>
                        {lesson.lessonName}
                      </ThemedText>

                      <ThemedText style={[styles.lessonName, { color: theme.textColor }]}>
                        {typeInfo.label && (
                          <ThemedText style={[styles.lessonType, { color: typeInfo.color }]}>
                            {typeInfo.label}
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
                      </ThemedView>
                      <ThemedView style={styles.lessonDetails}>
                        {lesson.teacherName && (
                          <ThemedView style={styles.detailItem}>
                            <IconSymbol name="person.fill" size={14} color={theme.secondaryText} />
                            <ThemedText style={{ color: theme.secondaryText }}>
                              {lesson.teacherName}
                            </ThemedText>
                          </ThemedView>
                        )}
                      </ThemedView>
                      <ThemedView style={styles.lessonDetails}>
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
              })}
          </ScrollView>
        </SafeAreaView>
      </Container>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  groupText: {
    marginTop: -2,
    fontSize: 15,
  },
  weekSelector: {
    flexGrow: 0,
    marginBottom: 8,
  },
  weekContainer: {
    width: Platform.OS === 'web' ? MAX_WEB_WIDTH - 32 : Dimensions.get('window').width - 32,
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
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
        maxWidth: MAX_WEB_WIDTH - 32,
        alignSelf: 'center',
      },
    }),
  },
  weekTitle: {
    marginTop: -10,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 5,
  },
  daysGrid: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    flex: 1,
    minWidth: Platform.OS === 'web'
      ? (MAX_WEB_WIDTH - 32 - 32 - 40) / 7
      : (Dimensions.get('window').width - 32 - 32 - 40) / 5,
  },
  dayName: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dayNumber: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 4,
  },
  dayCard: {
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
  dateText: {
    fontSize: 17,
    fontWeight: '600',
    padding: 16,
    paddingBottom: 8,
  },
  noLessons: {
    padding: 16,
    paddingTop: 8,
    textAlign: 'center',
  },
  lessonsList: {
    gap: 8,
  },
  lessonCard: {
    borderRadius: 16,
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  lessonTime: {
    width: 45,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  examTime: {
    fontSize: 13,
    fontWeight: '500',
  },
  lessonTypeLine: {
    width: 3,
    borderRadius: 1.5,
    alignSelf: 'stretch',
  },
  lessonInfo: {
    flex: 1,
    gap: 0,
  },
  lessonName: {
    fontSize: 15,
    fontWeight: '500',
  },
  lessonType: {
    fontSize: 13,
    fontWeight: '500',
  },
  lessonDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 0,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  skeletonText: {
    height: 20,
    borderRadius: 6,
  },
  skeletonTime: {
    width: 45,
    height: 45,
    borderRadius: 6,
  },
  skeletonDay: {
    height: 60,
    borderRadius: 12,
    flex: 1,
    minWidth: Platform.OS === 'web'
      ? (MAX_WEB_WIDTH - 32 - 32 - 40) / 7
      : (Dimensions.get('window').width - 32 - 32 - 40) / 5,
  },
}); 