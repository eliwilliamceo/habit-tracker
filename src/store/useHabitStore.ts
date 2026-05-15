import { create } from "zustand";
import { habitService } from "../services/habitService";
import { notificationService } from "../services/notificationService";

export interface Reminder {
  id: number;
  hour: number;
  minute: number;
}

export interface Habit {
  id: number;
  name: string;
  anchor?: string | null;
  reminders: Reminder[];
  completedToday: boolean;
}

// Lo que el form pasa al store antes de tener un id en DB.
export type ReminderInput = { hour: number; minute: number };

interface HabitState {
  habits: Habit[];
  isLoading: boolean;
  fetchHabits: () => Promise<void>;
  addHabit: (
    name: string,
    options?: {
      reminders?: ReminderInput[];
      anchor?: string | null;
    },
  ) => Promise<void>;
  removeHabit: (id: number) => Promise<void>;
  recordCheckIn: (id: number) => Promise<void>;
  updateHabit: (
    id: number,
    options: {
      name: string;
      anchor: string | null;
      reminders: ReminderInput[];
    },
  ) => Promise<void>;
}

// Helper interno: persiste recordatorios para un hábito + agenda notificaciones.
// Pide permisos si hay al menos uno y aún no se concedieron.
async function persistRemindersFor(
  habitId: number,
  habitName: string,
  inputs: ReminderInput[],
): Promise<Reminder[]> {
  if (inputs.length === 0) return [];

  const granted = await notificationService.requestPermissions();
  if (!granted) return [];

  const persisted: Reminder[] = [];
  for (const r of inputs) {
    const reminderId = await habitService.addReminder(habitId, r.hour, r.minute);
    await notificationService.scheduleReminder(reminderId, habitName, r.hour, r.minute);
    persisted.push({ id: reminderId, hour: r.hour, minute: r.minute });
  }
  return persisted;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  isLoading: false,

  fetchHabits: async () => {
    set({ isLoading: true });
    try {
      const habits = await habitService.getAllHabits();
      set({ habits, isLoading: false });
    } catch (error) {
      console.error("Error fetching habits:", error);
      set({ isLoading: false });
    }
  },

  addHabit: async (name, options = {}) => {
    const { reminders: reminderInputs = [], anchor = null } = options;
    try {
      const id = await habitService.createHabit(name, anchor);
      const reminders = await persistRemindersFor(id, name, reminderInputs);
      set((state) => ({
        habits: [
          { id, name, anchor, reminders, completedToday: false },
          ...state.habits,
        ],
      }));
    } catch (error) {
      console.error("Error adding habit:", error);
    }
  },

  removeHabit: async (id) => {
    try {
      // Cancela todas las notificaciones de este hábito
      const habit = get().habits.find((h) => h.id === id);
      for (const r of habit?.reminders ?? []) {
        await notificationService.cancelReminder(r.id);
      }
      await habitService.deleteHabit(id);
      set((state) => ({
        habits: state.habits.filter((h) => h.id !== id),
      }));
    } catch (error) {
      console.error("Error removing habit:", error);
    }
  },

  recordCheckIn: async (id) => {
    try {
      await habitService.recordCheckIn(id);
      set((state) => ({
        habits: state.habits.map((h) =>
          h.id === id ? { ...h, completedToday: true } : h,
        ),
      }));
    } catch (error) {
      console.error("Error recording check-in:", error);
    }
  },

  // Edición: actualiza nombre/ancla + reconcilia la lista completa de
  // recordatorios (borra todos y reinserta — simple y robusto a esta escala).
  updateHabit: async (id, { name, anchor, reminders: reminderInputs }) => {
    try {
      await habitService.updateHabit(id, name, anchor);

      // Cancela y borra recordatorios actuales
      const current = get().habits.find((h) => h.id === id);
      for (const r of current?.reminders ?? []) {
        await notificationService.cancelReminder(r.id);
      }
      await habitService.removeAllRemindersForHabit(id);

      const newReminders = await persistRemindersFor(id, name, reminderInputs);

      set((state) => ({
        habits: state.habits.map((h) =>
          h.id === id ? { ...h, name, anchor, reminders: newReminders } : h,
        ),
      }));
    } catch (error) {
      console.error("Error updating habit:", error);
    }
  },
}));
