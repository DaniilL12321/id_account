import { StyleSheet, Platform, ScrollView, useColorScheme, SafeAreaView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface InfoItemProps {
  label: string;
  value: string;
  theme: {
    background: string;
    cardBackground: string;
    textColor: string;
    secondaryText: string;
    borderColor: string;
    accentColor: string;
  };
  isDark?: boolean;
  style?: any;
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
  theme: {
    background: string;
    cardBackground: string;
    textColor: string;
    secondaryText: string;
    borderColor: string;
    accentColor: string;
  };
}

interface ActionButtonProps {
  icon: string;
  text: string;
  theme: {
    background: string;
    cardBackground: string;
    textColor: string;
    secondaryText: string;
    borderColor: string;
    accentColor: string;
  };
  style?: any;
  onPress: () => void;
  isDark?: boolean;
}

export default function StudentProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const theme = {
    background: isDark ? '#000000' : '#F2F3F7',
    cardBackground: isDark ? '#1D1D1D' : '#FFFFFF',
    textColor: isDark ? '#FFFFFF' : '#000000',
    secondaryText: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    accentColor: '#2688EB',
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with student info */}
        <ThemedView style={[styles.header, { borderBottomColor: theme.borderColor }]}>
          <IconSymbol
            size={60}
            color={theme.accentColor}
            name="person.circle.fill"
            style={styles.avatar}
          />
          <ThemedView style={styles.headerInfo}>
            <ThemedText style={[styles.headerName, { color: theme.textColor }]}>
              Иван Иванов
            </ThemedText>
            <ThemedText style={{ color: theme.accentColor }}>Группа: ИС-201</ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Personal Information Card */}
        <ThemedView style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <ThemedText style={[styles.cardTitle, { color: theme.textColor }]}>
            Личная информация
          </ThemedText>
          <ThemedView style={[styles.infoGrid, { backgroundColor: theme.cardBackground }]}>
            <InfoItem label="ФИО" value="Иванов Иван Иванович" theme={theme} isDark={isDark} />
            <ThemedView style={[styles.infoRow, { backgroundColor: theme.cardBackground }]}>
              <InfoItem 
                label="Группа" 
                value="ИС-201" 
                theme={theme} 
                isDark={isDark}
                style={styles.halfInfoItem} 
              />
              <InfoItem 
                label="Дата рождения" 
                value="01.01.2000" 
                theme={theme} 
                isDark={isDark}
                style={styles.halfInfoItem} 
              />
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Educational Activities */}
        <ThemedView style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <ThemedText style={[styles.cardTitle, { color: theme.textColor }]}>
            Учебная деятельность
          </ThemedText>
          <ThemedView style={[styles.buttonGroup, { backgroundColor: theme.cardBackground }]}>
            <ActionButton
              icon="person"
              text="Общая информация"
              theme={theme}
              isDark={isDark}
              onPress={() => {/* handle press */}}
            />
            <ActionButton
              icon="graduationcap"
              text="Оценки и успеваемость"
              theme={theme}
              isDark={isDark}
              onPress={() => {/* handle press */}}
            />
            <ActionButton
              icon="calendar"
              text="Учебный план"
              theme={theme}
              isDark={isDark}
              onPress={() => {/* handle press */}}
            />
          </ThemedView>
        </ThemedView>

        {/* Documents and Portfolio */}
        <ThemedView style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <ThemedText style={[styles.cardTitle, { color: theme.textColor }]}>
            Документы и портфолио
          </ThemedText>
          <ThemedView style={[styles.buttonGroup, { backgroundColor: theme.cardBackground }]}>
            <ThemedView style={[styles.buttonRow, { backgroundColor: theme.cardBackground }]}>
              <ActionButton
                icon="doc.text"
                text="Мои заявки"
                theme={theme}
                isDark={isDark}
                style={styles.halfButton}
                onPress={() => {/* handle press */}}
              />
              <ActionButton
                icon="photo"
                text="Портфолио"
                theme={theme}
                isDark={isDark}
                style={styles.halfButton}
                onPress={() => {/* handle press */}}
              />
            </ThemedView>
            <ActionButton
              icon="qrcode"
              text="QR Сертификаты"
              theme={theme}
              isDark={isDark}
              onPress={() => {/* handle press */}}
            />
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoItem = ({ label, value, theme, isDark = false, style }: InfoItemProps) => (
  <ThemedView style={[
    styles.infoItem, 
    { backgroundColor: isDark ? '#2A2A2A' : '#F5F5F5' },
    style
  ]}>
    <ThemedText style={{ color: theme.secondaryText }}>{label}</ThemedText>
    <ThemedText style={{ color: theme.textColor }}>{value}</ThemedText>
  </ThemedView>
);

const ActionButton = ({ icon, text, theme, style, onPress, isDark }: ActionButtonProps) => (
  <ThemedView 
    style={[
      styles.button,
      { backgroundColor: isDark ? '#2A2A2A' : '#F5F5F5' },
      style
    ]}
    onTouchEnd={onPress}
  >
    <IconSymbol name={icon} size={24} color={theme.accentColor} />
    <ThemedText style={{ color: theme.textColor }}>{text}</ThemedText>
  </ThemedView>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  headerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  avatar: {
    width: 60,
    height: 60,
  },
  card: {
    margin: 16,
    marginTop: 12,
    padding: 16,
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoGrid: {
    gap: 8,
  },
  infoItem: {
    gap: 4,
    padding: 8,
    borderRadius: 8,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  halfInfoItem: {
    flex: 1,
  },
  buttonGroup: {
    gap: 8,
    padding: 4,
    borderRadius: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  halfButton: {
    flex: 1,
  },
});
