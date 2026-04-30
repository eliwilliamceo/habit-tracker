// app/(tabs)/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useHabitStore } from "../src/store/useHabitStore";

const COLORS = {
  health: "#10B981",
  work: "#3B82F6",
  mind: "#8B5CF6",
  bg: "#F3F4F6",
  card: "#FFFFFF",
};

export default function HomeScreen() {
  const { habits, toggleHabit, addHabit } = useHabitStore();
  const today = new Date().toISOString().split("T")[0];

  // Calcular porcentaje de completado hoy
  const completedToday = habits.filter((h) =>
    h.completedDates.includes(today),
  ).length;
  const completionRate =
    habits.length === 0
      ? 0
      : Math.round((completedToday / habits.length) * 100);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hola, Constructor</Text>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {completionRate}% Completado Hoy
          </Text>
          <View style={styles.progressBarBg}>
            <View
              style={[styles.progressBarFill, { width: `${completionRate}%` }]}
            />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="leaf-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>Comienza tu primer hábito hoy</Text>
          </View>
        ) : (
          habits.map((habit) => {
            const isDone = habit.completedDates.includes(today);
            return (
              <TouchableOpacity
                key={habit.id}
                style={[
                  styles.card,
                  { borderLeftColor: COLORS[habit.category] },
                ]}
                onPress={() => toggleHabit(habit.id)}
                activeOpacity={0.7}
              >
                <View style={styles.cardContent}>
                  <View>
                    <Text style={styles.habitTitle}>{habit.title}</Text>
                    {habit.stackTrigger && (
                      <Text style={styles.stackText}>
                        🔗 {habit.stackTrigger}
                      </Text>
                    )}
                    <View style={styles.streakBadge}>
                      <Ionicons name="flame" size={12} color="#F59E0B" />
                      <Text style={styles.streakText}>{habit.streak} días</Text>
                    </View>
                  </View>
                  <Ionicons
                    name={isDone ? "checkmark-circle" : "ellipse-outline"}
                    size={32}
                    color={isDone ? COLORS[habit.category] : "#D1D5DB"}
                  />
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  header: { padding: 20, paddingTop: 40 },
  greeting: { fontSize: 28, fontWeight: "800", color: "#111827" },
  progressContainer: { marginTop: 15 },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 5,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: 4,
  },
  list: { padding: 20, paddingBottom: 100 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 6,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  habitTitle: { fontSize: 18, fontWeight: "700", color: "#1F2937" },
  streakBadge: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  streakText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#F59E0B",
    marginLeft: 4,
  },
  emptyState: { alignItems: "center", marginTop: 50 },
  emptyText: { fontSize: 16, color: "#9CA3AF", marginTop: 10 },
  stackText: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
    fontStyle: "italic",
  },
});
