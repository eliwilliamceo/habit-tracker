import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  ArrowLeft,
  Flame,
  Trophy,
  CheckCircle2,
  Percent,
  Bell,
  Link2,
  Pencil,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { ThemeColors } from "../theme/colors";
import { useThemeColors } from "../theme/useTheme";
import { habitService } from "../services/habitService";
import { useHabitStore } from "../store/useHabitStore";
import {
  buildHabitStats,
  HabitStats,
  HeatmapCell,
} from "../utils/habitStats";

const formatTime = (h: number, m: number) =>
  `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

export default function HabitDetailScreen({ route, navigation }: any) {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);
  const { t } = useTranslation();
  const weekLabels = t("detail.weekDays", { returnObjects: true }) as string[];

  const { habitId } = route.params as { habitId: number };
  const habit = useHabitStore((state) =>
    state.habits.find((h) => h.id === habitId),
  );
  const [stats, setStats] = React.useState<HabitStats | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      let cancelled = false;
      const load = async () => {
        const dates = await habitService.getCheckInsForHabit(habitId);
        if (!cancelled) setStats(buildHabitStats(dates));
      };
      load();
      return () => {
        cancelled = true;
      };
    }, [habitId]),
  );

  React.useEffect(() => {
    if (!habit) navigation.goBack();
  }, [habit, navigation]);

  if (!habit || !stats) {
    return <View style={styles.container} />;
  }

  const reminders = habit.reminders ?? [];
  const hasConfig = !!habit.anchor || reminders.length > 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color={colors.textMain} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={2}>
          {habit.name}
        </Text>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() =>
            navigation.navigate("CreateHabit", { habitId: habit.id })
          }
        >
          <Pencil size={20} color={colors.textMain} />
        </TouchableOpacity>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroFlameRow}>
          <Flame size={36} color={colors.streakFg} fill={colors.streakFg} />
          <Text style={styles.heroNumber}>{stats.currentStreak}</Text>
        </View>
        <Text style={styles.heroLabel}>
          {t("detail.streak", { count: stats.currentStreak })}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <StatCard
          styles={styles}
          icon={<Trophy size={18} color={colors.warning} />}
          value={stats.bestStreak.toString()}
          label={t("detail.bestStreak")}
          unit={t("detail.bestStreakUnit", { count: stats.bestStreak })}
        />
        <StatCard
          styles={styles}
          icon={<CheckCircle2 size={18} color={colors.accent} />}
          value={stats.totalCheckins.toString()}
          label={t("detail.total")}
          unit={t("detail.totalUnit", { count: stats.totalCheckins })}
        />
        <StatCard
          styles={styles}
          icon={<Percent size={18} color={colors.primary} />}
          value={Math.round(stats.last30DaysRate * 100).toString()}
          label={t("detail.last30Days")}
          unit="%"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("detail.heatmapTitle")}</Text>
        <View style={styles.weekHeaders}>
          {weekLabels.map((label, i) => (
            <Text key={i} style={styles.weekHeader}>
              {label}
            </Text>
          ))}
        </View>
        <View>
          {stats.heatmap.map((week, wi) => (
            <View key={wi} style={styles.heatmapRow}>
              {week.map((cell, ci) => (
                <HeatmapCellView key={ci} cell={cell} styles={styles} />
              ))}
            </View>
          ))}
        </View>
      </View>

      {hasConfig && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("detail.configTitle")}</Text>
          {habit.anchor && (
            <View style={styles.infoRow}>
              <Link2 size={16} color={colors.textSecondary} />
              <Text style={styles.infoText}>
                {t("detail.configAnchor", { anchor: habit.anchor })}
              </Text>
            </View>
          )}
          {reminders.length === 1 && (
            <View style={styles.infoRow}>
              <Bell size={16} color={colors.primary} />
              <Text style={styles.infoText}>
                {t("detail.configReminder", {
                  time: formatTime(reminders[0].hour, reminders[0].minute),
                })}
              </Text>
            </View>
          )}
          {reminders.length > 1 && (
            <View>
              <View style={styles.infoRow}>
                <Bell size={16} color={colors.primary} />
                <Text style={styles.infoText}>
                  {t("detail.configRemindersMultiple")}
                </Text>
              </View>
              <View style={styles.reminderChips}>
                {reminders.map((r) => (
                  <View key={r.id} style={styles.reminderChip}>
                    <Text style={styles.reminderChipText}>
                      {formatTime(r.hour, r.minute)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const StatCard = ({
  styles,
  icon,
  value,
  label,
  unit,
}: {
  styles: ReturnType<typeof makeStyles>;
  icon: React.ReactNode;
  value: string;
  label: string;
  unit?: string;
}) => (
  <View style={styles.statCard}>
    {icon}
    <Text style={styles.statValue}>
      {value}
      {unit ? <Text style={styles.statUnit}> {unit}</Text> : null}
    </Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const HeatmapCellView = ({
  cell,
  styles,
}: {
  cell: HeatmapCell;
  styles: ReturnType<typeof makeStyles>;
}) => {
  const style = [
    styles.cellSquare,
    cell.isFuture && styles.cellFuture,
    !cell.isFuture && !cell.completed && styles.cellEmpty,
    cell.completed && styles.cellDone,
    cell.isToday && styles.cellToday,
  ];
  return <View style={style} />;
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, paddingTop: 60, paddingBottom: 40 },

    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 28,
    },
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
    },
    title: {
      flex: 1,
      fontSize: 24,
      fontWeight: "800",
      color: colors.textMain,
    },

    hero: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      paddingVertical: 28,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
    },
    heroFlameRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    heroNumber: {
      fontSize: 64,
      fontWeight: "800",
      color: colors.textMain,
      lineHeight: 72,
    },
    heroLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
      fontWeight: "500",
    },

    statsRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 24,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      padding: 14,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 6,
    },
    statValue: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.textMain,
    },
    statUnit: {
      fontSize: 13,
      fontWeight: "500",
      color: colors.textSecondary,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: "500",
    },

    section: { marginBottom: 24 },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.textMain,
      marginBottom: 12,
    },

    weekHeaders: {
      flexDirection: "row",
      marginBottom: 6,
    },
    weekHeader: {
      flex: 1,
      textAlign: "center",
      fontSize: 11,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    heatmapRow: {
      flexDirection: "row",
      marginBottom: 4,
    },
    cellSquare: {
      flex: 1,
      aspectRatio: 1,
      marginHorizontal: 2,
      borderRadius: 6,
    },
    cellEmpty: { backgroundColor: colors.border },
    cellDone: { backgroundColor: colors.accent },
    cellFuture: { backgroundColor: "transparent" },
    cellToday: {
      borderWidth: 2,
      borderColor: colors.primary,
    },

    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingVertical: 8,
    },
    infoText: {
      fontSize: 14,
      color: colors.textMain,
      flex: 1,
    },
    reminderChips: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 8,
      marginLeft: 24,
    },
    reminderChip: {
      backgroundColor: colors.reminderBg,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
    },
    reminderChipText: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.reminderFg,
    },
  });
