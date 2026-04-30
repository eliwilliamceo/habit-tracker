// app/(tabs)/add.tsx
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useHabitStore } from "../src/store/useHabitStore";

export default function AddHabitScreen() {
  const addHabit = useHabitStore((state) => state.addHabit);
  const [title, setTitle] = useState("");
  const [trigger, setTrigger] = useState("");
  const [category, setCategory] = useState<"health" | "work" | "mind">(
    "health",
  );

  const handleSave = () => {
    if (!title.trim()) return;
    addHabit({
      title: title.trim(),
      category,
      color: "#fff",
      stackTrigger: trigger.trim() || undefined,
    });
    setTitle("");
    setTrigger("");
    alert("¡Hábito creado!");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Nuevo Hábito</Text>

        <Text style={styles.label}>Nombre del hábito</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. Leer 10 páginas"
          value={title}
          onChangeText={setTitle}
        />
        <Text style={styles.label}>Actividad Detonante (Opcional)</Text>
        <Text style={styles.subLabel}>¿Después de qué actividad lo harás?</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. Después de beber mi café..."
          value={trigger}
          onChangeText={setTrigger}
        />

        <Text style={styles.label}>Categoría</Text>
        <View style={styles.categories}>
          {[
            { id: "health", label: "Salud", icon: "heart", color: "#10B981" },
            {
              id: "work",
              label: "Trabajo",
              icon: "briefcase",
              color: "#3B82F6",
            },
            { id: "mind", label: "Mente", icon: "brain", color: "#8B5CF6" },
          ].map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.catBtn,
                category === cat.id && {
                  backgroundColor: cat.color,
                  borderColor: cat.color,
                },
              ]}
              onPress={() => setCategory(cat.id as "health" | "work" | "mind")}
            >
              <Ionicons
                name={cat.icon as any}
                size={20}
                color={category === cat.id ? "#fff" : "#6B7280"}
              />
              <Text
                style={[
                  styles.catText,
                  category === cat.id && { color: "#fff" },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>Crear Hábito</Text>
        </TouchableOpacity>
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
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
    marginTop: 10,
  },
  subLabel: { fontSize: 13, color: "#6B7280", marginBottom: 8 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
  },
  categories: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  catBtn: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginHorizontal: 5,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  catText: { marginTop: 5, fontSize: 12, fontWeight: "600", color: "#6B7280" },
  saveBtn: {
    backgroundColor: "#111827",
    padding: 18,
    borderRadius: 16,
    marginTop: 40,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
