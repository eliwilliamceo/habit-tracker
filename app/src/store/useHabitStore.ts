// src/store/useHabitStore.ts
import * as SecureStore from "expo-secure-store"; // ⭐ Cambiar esta línea
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const expoStorage = {
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  getItem: (key: string) => SecureStore.getItemAsync(key),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};
// 1. Definimos qué es un "Hábito" para que TypeScript nos ayude
export interface Habit {
  id: string;
  title: string;
  category: "health" | "work" | "mind";
  streak: number;
  bestStreak: number;
  completedDates: string[];
  stackTrigger?: string; // ⭐ Agregar esta línea
  color: string;
}

// 2. Definimos el estado inicial y las acciones
interface HabitState {
  habits: Habit[];
  addHabit: (
    habit: Omit<Habit, "id" | "streak" | "bestStreak" | "completedDates">,
  ) => void;
  toggleHabit: (id: string) => void;
}

// Función auxiliar para obtener la fecha de hoy en texto
const getTodayString = () => new Date().toISOString().split("T")[0];

// 3. Creamos el Store (La Mochila)
export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [], // Empezamos sin hábitos

      // Acción: Agregar un hábito nuevo
      addHabit: (habitData) =>
        set((state) => ({
          habits: [
            ...state.habits,
            {
              ...habitData,
              id: Math.random().toString(36).substr(2, 9),
              streak: 0,
              bestStreak: 0, // ⭐ Asegurar que siempre se inicialice
              completedDates: [],
            },
          ],
        })),

      // Acción: Marcar/Demarcar hábito como completado
      toggleHabit: (id) => {
        const today = getTodayString();
        set((state) => {
          const habits = state.habits.map((h) => {
            if (h.id !== id) return h;

            const isCompletedToday = h.completedDates.includes(today);
            let newDates = [...h.completedDates];
            let newStreak = h.streak;

            if (isCompletedToday) {
              // Si ya estaba hecho, lo deshacemos (permitir errores es clave psicológico)
              newDates = newDates.filter((d) => d !== today);
              newStreak = Math.max(0, newStreak - 1);
            } else {
              // Si no estaba hecho, lo completamos
              newDates.push(today);
              newStreak += 1;
            }

            return { ...h, completedDates: newDates, streak: newStreak };
          });
          return { habits };
        });
      },
    }),
    {
      name: "habit-storage",
      storage: createJSONStorage(() => expoStorage), // ⭐ Usar nuestro adaptador
    },
  ),
);
