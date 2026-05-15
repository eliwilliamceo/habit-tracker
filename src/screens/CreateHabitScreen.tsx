import { Bell, Check, Link2, Plus, X } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useHabitStore, ReminderInput } from "../store/useHabitStore";
import { ThemeColors } from "../theme/colors";
import { useThemeColors } from "../theme/useTheme";

type ReminderPreset = {
  key: "morning" | "noon" | "evening" | "night";
  hour: number;
  minute: number;
};

const REMINDER_PRESETS: ReminderPreset[] = [
  { key: "morning", hour: 7, minute: 0 },
  { key: "noon", hour: 13, minute: 0 },
  { key: "evening", hour: 19, minute: 0 },
  { key: "night", hour: 22, minute: 0 },
];

const sameTime = (a: ReminderInput, b: ReminderInput) =>
  a.hour === b.hour && a.minute === b.minute;

const isPresetTime = (r: ReminderInput) =>
  REMINDER_PRESETS.some((p) => sameTime(p, r));

const fmtTime = (h: number, m: number) =>
  `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

export default function CreateHabitScreen({ route, navigation }: any) {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);
  const { t } = useTranslation();

  const editingId: number | undefined = route?.params?.habitId;
  const isEditing = editingId != null;
  const editingHabit = useHabitStore((s) =>
    editingId != null ? s.habits.find((h) => h.id === editingId) : undefined,
  );

  // Pre-rellena al editar.
  const initial = React.useMemo(() => {
    if (!editingHabit) {
      return {
        name: "",
        anchor: "",
        reminders: [] as ReminderInput[],
      };
    }
    return {
      name: editingHabit.name,
      anchor: editingHabit.anchor ?? "",
      reminders: editingHabit.reminders.map((r) => ({
        hour: r.hour,
        minute: r.minute,
      })),
    };
  }, [editingHabit]);

  const [name, setName] = useState(initial.name);
  const [anchor, setAnchor] = useState(initial.anchor);
  const [reminders, setReminders] = useState<ReminderInput[]>(initial.reminders);
  const [customHour, setCustomHour] = useState("");
  const [customMinute, setCustomMinute] = useState("");

  const addHabit = useHabitStore((state) => state.addHabit);
  const updateHabit = useHabitStore((state) => state.updateHabit);

  const togglePreset = (preset: ReminderPreset) => {
    setReminders((rs) => {
      const existing = rs.find((r) => sameTime(r, preset));
      if (existing) {
        return rs.filter((r) => !sameTime(r, preset));
      }
      return [...rs, { hour: preset.hour, minute: preset.minute }];
    });
  };

  const removeReminder = (r: ReminderInput) => {
    setReminders((rs) => rs.filter((x) => !sameTime(x, r)));
  };

  const parsedCustom = (() => {
    const h = parseInt(customHour, 10);
    const m = parseInt(customMinute, 10);
    if (
      Number.isFinite(h) &&
      h >= 0 &&
      h <= 23 &&
      Number.isFinite(m) &&
      m >= 0 &&
      m <= 59
    ) {
      return { hour: h, minute: m };
    }
    return null;
  })();

  const customInvalid =
    (customHour !== "" || customMinute !== "") && !parsedCustom;

  const customDup = parsedCustom
    ? reminders.some((r) => sameTime(r, parsedCustom))
    : false;

  const canAddCustom = parsedCustom !== null && !customDup;

  const handleAddCustom = () => {
    if (!canAddCustom || !parsedCustom) return;
    setReminders((rs) => [...rs, parsedCustom]);
    setCustomHour("");
    setCustomMinute("");
    Haptics.selectionAsync();
  };

  const canSave = name.trim().length > 0;

  const handleSave = async () => {
    if (!canSave) return;
    const trimmedAnchor = anchor.trim();
    const anchorValue = trimmedAnchor.length > 0 ? trimmedAnchor : null;

    if (isEditing && editingId != null) {
      await updateHabit(editingId, {
        name: name.trim(),
        anchor: anchorValue,
        reminders,
      });
    } else {
      await addHabit(name.trim(), { reminders, anchor: anchorValue });
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.goBack();
  };

  const customOnly = reminders.filter((r) => !isPresetTime(r));

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.inner}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>
          {t(isEditing ? "create.titleEdit" : "create.titleNew")}
        </Text>

        <TextInput
          style={styles.input}
          placeholder={t("create.namePlaceholder")}
          placeholderTextColor={colors.textSecondary}
          value={name}
          onChangeText={setName}
          autoFocus={!isEditing}
        />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Link2 size={16} color={colors.textSecondary} />
            <Text style={styles.sectionLabel}>{t("create.anchor.label")}</Text>
            <Text style={styles.optional}>{t("common.optional")}</Text>
          </View>
          <Text style={styles.sectionHelp}>{t("create.anchor.help")}</Text>
          <View style={styles.anchorRow}>
            <Text style={styles.anchorPrefix}>{t("create.anchor.prefix")}</Text>
            <TextInput
              style={styles.anchorInput}
              placeholder={t("create.anchor.placeholder")}
              placeholderTextColor={colors.textSecondary}
              value={anchor}
              onChangeText={setAnchor}
              maxLength={60}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell size={16} color={colors.textSecondary} />
            <Text style={styles.sectionLabel}>{t("create.reminder.label")}</Text>
            <Text style={styles.optional}>{t("common.optional")}</Text>
          </View>
          <Text style={styles.sectionHelp}>
            {t("create.reminder.multipleHelp")}
          </Text>

          <View style={styles.chips}>
            {REMINDER_PRESETS.map((preset) => {
              const active = reminders.some((r) => sameTime(r, preset));
              return (
                <TouchableOpacity
                  key={preset.key}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => togglePreset(preset)}
                >
                  {active && (
                    <Check size={12} color="white" strokeWidth={3} />
                  )}
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {t(`create.reminder.presets.${preset.key}`)}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {customOnly.map((r) => (
              <TouchableOpacity
                key={`custom-${r.hour}-${r.minute}`}
                style={[styles.chip, styles.chipActive]}
                onPress={() => removeReminder(r)}
              >
                <Text style={[styles.chipText, styles.chipTextActive]}>
                  {fmtTime(r.hour, r.minute)}
                </Text>
                <X size={12} color="white" strokeWidth={3} />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.customTimeRow}>
            <TextInput
              style={[styles.timeInput, customInvalid && styles.timeInputError]}
              placeholder={t("create.reminder.hourPlaceholder")}
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
              maxLength={2}
              value={customHour}
              onChangeText={(txt) =>
                setCustomHour(txt.replace(/[^0-9]/g, ""))
              }
            />
            <Text style={styles.timeColon}>:</Text>
            <TextInput
              style={[styles.timeInput, customInvalid && styles.timeInputError]}
              placeholder={t("create.reminder.minutePlaceholder")}
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
              maxLength={2}
              value={customMinute}
              onChangeText={(txt) =>
                setCustomMinute(txt.replace(/[^0-9]/g, ""))
              }
            />
            <TouchableOpacity
              style={[styles.addBtn, !canAddCustom && styles.addBtnDisabled]}
              onPress={handleAddCustom}
              disabled={!canAddCustom}
              activeOpacity={0.7}
            >
              <Plus size={16} color="white" strokeWidth={3} />
              <Text style={styles.addBtnText}>{t("create.reminder.add")}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.customHint}>
            {customInvalid
              ? t("create.reminder.customError")
              : customDup
                ? t("create.reminder.customDup")
                : t("create.reminder.customHelp")}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!canSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveText}>
            {t(isEditing ? "create.saveEdit" : "create.saveNew")}
          </Text>
          <Check color="white" size={20} />
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    inner: { padding: 24, paddingTop: 60, paddingBottom: 40 },
    title: {
      fontSize: 32,
      fontWeight: "800",
      color: colors.textMain,
      marginBottom: 30,
    },
    input: {
      backgroundColor: colors.surface,
      padding: 18,
      borderRadius: 16,
      fontSize: 18,
      color: colors.textMain,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 24,
    },
    section: { marginBottom: 28 },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 12,
    },
    sectionLabel: {
      fontSize: 16,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    optional: {
      fontSize: 12,
      color: colors.textSecondary,
      fontStyle: "italic",
      marginLeft: "auto",
    },
    sectionHelp: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 10,
      lineHeight: 18,
    },
    anchorRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 4,
    },
    anchorPrefix: {
      fontSize: 15,
      color: colors.textSecondary,
      fontWeight: "600",
      marginRight: 6,
    },
    anchorInput: {
      flex: 1,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.textMain,
    },
    chips: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 999,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: { color: colors.textSecondary, fontWeight: "600", fontSize: 14 },
    chipTextActive: { color: "white" },
    customTimeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 14,
    },
    timeInput: {
      width: 60,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 10,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      fontSize: 18,
      fontWeight: "600",
      color: colors.textMain,
      textAlign: "center",
    },
    timeInputError: {
      borderColor: colors.error,
    },
    timeColon: { fontSize: 22, fontWeight: "700", color: colors.textMain },
    addBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: colors.primary,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 10,
      marginLeft: "auto",
    },
    addBtnDisabled: {
      opacity: 0.4,
    },
    addBtnText: {
      color: "white",
      fontSize: 14,
      fontWeight: "700",
    },
    customHint: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 6,
      marginLeft: 2,
    },
    saveButton: {
      backgroundColor: colors.primary,
      padding: 18,
      borderRadius: 16,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 10,
      marginTop: 12,
    },
    saveButtonDisabled: {
      opacity: 0.45,
    },
    saveText: { color: "white", fontSize: 18, fontWeight: "700" },
  });
