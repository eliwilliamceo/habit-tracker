// app/(tabs)/dashboard.tsx
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { useHabitStore } from "../src/store/useHabitStore";

export default function DashboardScreen() {
  const habits = useHabitStore((state) => state.habits);
  const today = new Date().toISOString().split("T")[0];

  // Calcular estadísticas
  const completedToday = habits.filter((h) =>
    h.completedDates.includes(today),
  ).length;
  const totalHabits = habits.length;
  const completionRate =
    totalHabits === 0 ? 0 : Math.round((completedToday / totalHabits) * 100);

  // Calcular mejor racha
  const bestStreak = 0;

  // Calcular total de completados históricos
  const totalCompleted = habits.reduce(
    (acc, h) => acc + (h.completedDates?.length || 0),
    0,
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Tu Progreso</Text>

        {/* Tarjetas de Estadísticas */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="today" size={24} color="#10B981" />
            <Text style={styles.statValue}>{completionRate}%</Text>
            <Text style={styles.statLabel}>Hoy</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="flame" size={24} color="#F59E0B" />
            <Text style={styles.statValue}>{bestStreak}</Text>
            <Text style={styles.statLabel}>Mejor Racha</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
            <Text style={styles.statValue}>{totalCompleted}</Text>
            <Text style={styles.statLabel}>Completados</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="list" size={24} color="#8B5CF6" />
            <Text style={styles.statValue}>{totalHabits}</Text>
            <Text style={styles.statLabel}>Hábitos</Text>
          </View>
        </View>

        {/* Lista de Hábitos con Rachas */}
        <Text style={styles.sectionTitle}>Tus Hábitos</Text>
        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Aún no hay hábitos registrados</Text>
          </View>
        ) : (
          habits.map((habit) => (
            <View key={habit.id} style={styles.habitRow}>
              <View style={styles.habitInfo}>
                <View
                  style={[
                    styles.categoryDot,
                    {
                      backgroundColor:
                        habit.category === "health"
                          ? "#10B981"
                          : habit.category === "work"
                            ? "#3B82F6"
                            : "#8B5CF6",
                    },
                  ]}
                />
                <Text style={styles.habitName}>{habit.title}</Text>
              </View>
              <View style={styles.streakInfo}>
                <Ionicons name="flame" size={16} color="#F59E0B" />
                <Text style={styles.streakValue}>{habit.streak}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  content: { padding: 20 },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  statCard: {
    backgroundColor: "#fff",
    flex: 1,
    padding: 20,
    borderRadius: 16,
    marginHorizontal: 5,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginTop: 10,
  },
  statLabel: { fontSize: 12, color: "#6B7280", marginTop: 5 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
    marginTop: 20,
    marginBottom: 15,
  },
  habitRow: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  habitInfo: { flexDirection: "row", alignItems: "center" },
  categoryDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  habitName: { fontSize: 16, color: "#1F2937", fontWeight: "600" },
  streakInfo: { flexDirection: "row", alignItems: "center" },
  streakValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F59E0B",
    marginLeft: 5,
  },
  emptyState: { alignItems: "center", padding: 30 },
  emptyText: { color: "#9CA3AF", fontSize: 16 },
});
