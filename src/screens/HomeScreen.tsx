import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { useHabitStore } from '../store/useHabitStore';
import { ThemeColors } from '../theme/colors';
import { useThemeColors } from '../theme/useTheme';
import { Plus, Flame, Check, Bell, Link2, Target } from 'lucide-react-native';
import { calculateStreak } from '../utils/streakCalculator';
import { habitService } from '../services/habitService';

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const greetingKeyForHour = (h: number) => {
  if (h < 12) return 'home.greeting.morning';
  if (h < 19) return 'home.greeting.afternoon';
  return 'home.greeting.evening';
};

const HabitCard = ({ item, recordCheckIn, removeHabit, navigation }: any) => {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);
  const { t } = useTranslation();

  const [streak, setStreak] = React.useState(0);
  const scale = useSharedValue(1);
  const animatedCheckStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // La racha se calcula localmente; completedToday viene del store.
  const refreshStreak = React.useCallback(async () => {
    const dates = await habitService.getCheckInsForHabit(item.id);
    setStreak(calculateStreak(dates));
  }, [item.id]);

  React.useEffect(() => {
    refreshStreak();
  }, [refreshStreak]);

  const completedToday = !!item.completedToday;

  const handlePress = async () => {
    if (completedToday) return;
    scale.value = withSequence(
      withTiming(0.82, { duration: 90 }),
      withSpring(1, { damping: 8, stiffness: 220 }),
    );
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await recordCheckIn(item.id);
    await refreshStreak();
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      t('home.deleteConfirm.title'),
      t('home.deleteConfirm.message', { name: item.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => removeHabit(item.id),
        },
      ],
    );
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.habitCard, pressed && styles.habitCardPressed]}
      onPress={() => navigation.navigate('HabitDetail', { habitId: item.id })}
      onLongPress={handleLongPress}
      delayLongPress={400}
    >
      <View style={styles.habitInfo}>
        <Text style={styles.habitName}>{item.name}</Text>
        {item.anchor && (
          <View style={styles.anchorRow}>
            <Link2 size={12} color={colors.textSecondary} />
            <Text style={styles.anchorText}>
              {t('home.anchor', { anchor: item.anchor })}
            </Text>
          </View>
        )}
        <View style={styles.detailsRow}>
          <View style={styles.streakBadge}>
            <Flame size={14} color={colors.streakFg} />
            <Text style={styles.streakText}>{streak}</Text>
          </View>
          {item.reminders && item.reminders.length > 0 && (
            <View style={styles.reminderBadge}>
              <Bell size={12} color={colors.reminderFg} />
              <Text style={styles.reminderText}>
                {item.reminders.length === 1
                  ? `${String(item.reminders[0].hour).padStart(2, '0')}:${String(item.reminders[0].minute).padStart(2, '0')}`
                  : `×${item.reminders.length}`}
              </Text>
            </View>
          )}
        </View>
      </View>

      <Animated.View style={animatedCheckStyle}>
        <TouchableOpacity
          style={[styles.checkButton, completedToday && styles.checkButtonDone]}
          onPress={handlePress}
          disabled={completedToday}
          activeOpacity={0.7}
        >
          {completedToday ? (
            <Check color="white" size={22} strokeWidth={3} />
          ) : (
            <Text style={styles.checkText}>✓</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    </Pressable>
  );
};

export default function HomeScreen({ navigation }: any) {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);
  const { t, i18n } = useTranslation();
  const { habits, fetchHabits, recordCheckIn, removeHabit } = useHabitStore();

  React.useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  // Saludo + fecha (re-formateamos si cambia el idioma)
  const dateInfo = React.useMemo(() => {
    const now = new Date();
    const greeting = t(greetingKeyForHour(now.getHours()));
    const formatted = new Intl.DateTimeFormat(i18n.language, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(now);
    return { greeting, dateLabel: cap(formatted) };
  }, [t, i18n.language]);

  // Pendientes arriba, completados abajo (ordenamiento estable dentro de cada grupo)
  const sortedHabits = React.useMemo(
    () =>
      [...habits].sort((a, b) => {
        if (a.completedToday === b.completedToday) return 0;
        return a.completedToday ? 1 : -1;
      }),
    [habits],
  );

  const completedCount = habits.filter((h) => h.completedToday).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.greeting}>{dateInfo.greeting}</Text>
          <Text style={styles.dateLabel}>{dateInfo.dateLabel}</Text>
          {habits.length > 0 && (
            <View style={styles.progressBadge}>
              <Check size={12} color={colors.reminderFg} strokeWidth={3} />
              <Text style={styles.progressText}>
                {t('home.progress', {
                  completed: completedCount,
                  total: habits.length,
                })}
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateHabit')}
        >
          <Plus color="white" size={24} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={sortedHabits}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <HabitCard
            item={item}
            recordCheckIn={recordCheckIn}
            removeHabit={removeHabit}
            navigation={navigation}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Target size={56} color={colors.primary} strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>{t('home.empty.title')}</Text>
            <Text style={styles.emptySubtitle}>
              {t('home.empty.subtitle')}
            </Text>
            <TouchableOpacity
              style={styles.emptyCta}
              onPress={() => navigation.navigate('CreateHabit')}
              activeOpacity={0.85}
            >
              <Plus size={18} color="white" strokeWidth={3} />
              <Text style={styles.emptyCtaText}>{t('home.empty.cta')}</Text>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={
          <View style={styles.footerWrap}>
            {habits.length > 0 && (
              <Text style={styles.hintText}>{t('home.hint')}</Text>
            )}
            <TouchableOpacity
              onPress={() => navigation.navigate('Legal')}
              activeOpacity={0.6}
            >
              <Text style={styles.aboutLink}>{t('home.legalLink')}</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
    },
    headerText: { flex: 1 },
    greeting: {
      fontSize: 26,
      fontWeight: '800',
      color: colors.textMain,
      letterSpacing: -0.3,
    },
    dateLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
      fontWeight: '500',
    },
    progressBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 4,
      backgroundColor: colors.reminderBg,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      marginTop: 10,
    },
    progressText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.reminderFg,
    },
    addButton: {
      backgroundColor: colors.primary,
      width: 45,
      height: 45,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 4,
    },
    listContent: { paddingHorizontal: 20, paddingBottom: 100 },
    habitCard: {
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    habitCardPressed: {
      transform: [{ scale: 0.98 }],
      opacity: 0.85,
    },
    habitInfo: { flex: 1, marginRight: 12 },
    habitName: { fontSize: 18, fontWeight: '600', color: colors.textMain },
    anchorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 2,
    },
    anchorText: {
      fontSize: 13,
      color: colors.textSecondary,
      fontStyle: 'italic',
      flexShrink: 1,
    },
    detailsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 6,
    },
    streakBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      backgroundColor: colors.streakBg,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
    },
    streakText: { fontSize: 12, fontWeight: 'bold', color: colors.streakFg },
    reminderBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: colors.reminderBg,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
    },
    reminderText: { fontSize: 12, fontWeight: '600', color: colors.reminderFg },
    checkButton: {
      backgroundColor: colors.border,
      width: 40,
      height: 40,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkButtonDone: {
      backgroundColor: colors.accent,
    },
    checkText: { fontSize: 20, fontWeight: 'bold', color: colors.textSecondary },
    emptyState: {
      alignItems: 'center',
      paddingTop: 60,
      paddingHorizontal: 20,
    },
    emptyIconWrap: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: colors.surfaceAlt,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    emptyTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.textMain,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 24,
      maxWidth: 280,
    },
    emptyCta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.primary,
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 14,
    },
    emptyCtaText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '700',
    },
    hintText: {
      textAlign: 'center',
      marginTop: 16,
      color: colors.textSecondary,
      fontSize: 13,
      fontStyle: 'italic',
    },
    footerWrap: {
      alignItems: 'center',
      gap: 10,
    },
    aboutLink: {
      marginTop: 8,
      fontSize: 12,
      color: colors.textSecondary,
      textDecorationLine: 'underline',
    },
  });
