import { Habit, Reminder } from "../store/useHabitStore";
import { localDateStr } from "../utils/date";
import { initDB } from "./db";

export const habitService = {
  // 1. Obtener todos los hábitos con todos sus recordatorios + si completó hoy.
  //
  // Estrategia: 2 queries para evitar la explosión cartesiana del LEFT JOIN
  // cuando un hábito tiene N recordatorios y M check-ins.
  async getAllHabits(): Promise<Habit[]> {
    const db = await initDB();
    const today = localDateStr();
    const habitRows = (await db.getAllAsync(
      `
      SELECT h.id, h.name, h.anchor,
             CASE WHEN c.id IS NOT NULL THEN 1 ELSE 0 END AS completedTodayInt
      FROM habits h
      LEFT JOIN checkins c ON c.habitId = h.id AND c.date = ?
      ORDER BY h.id DESC
      `,
      [today],
    )) as any[];

    const reminderRows = (await db.getAllAsync(
      `SELECT id, habitId, hour, minute FROM reminders ORDER BY hour, minute`,
    )) as any[];

    const remindersByHabit = new Map<number, Reminder[]>();
    for (const r of reminderRows) {
      const arr = remindersByHabit.get(r.habitId) ?? [];
      arr.push({ id: r.id, hour: r.hour, minute: r.minute });
      remindersByHabit.set(r.habitId, arr);
    }

    return habitRows.map((r) => ({
      id: r.id,
      name: r.name,
      anchor: r.anchor,
      completedToday: r.completedTodayInt === 1,
      reminders: remindersByHabit.get(r.id) ?? [],
    }));
  },

  // 2. Fechas de check-in de un hábito (para calcular rachas y heatmap)
  async getCheckInsForHabit(habitId: number): Promise<string[]> {
    const db = await initDB();
    const rows = await db.getAllAsync(
      "SELECT date FROM checkins WHERE habitId = ?",
      [habitId],
    );
    return rows.map((row) => (row as any).date);
  },

  // 3. Guardar nuevo hábito.
  // 'frequency' se mantiene en DB por compat pero siempre escribimos 'daily'.
  async createHabit(name: string, anchor: string | null = null) {
    const db = await initDB();
    const result = await db.runAsync(
      "INSERT INTO habits (name, frequency, anchor) VALUES (?, 'daily', ?)",
      [name, anchor],
    );
    return result.lastInsertRowId;
  },

  // 4. Registrar check-in (idempotente vía UNIQUE en checkins)
  async recordCheckIn(habitId: number) {
    const db = await initDB();
    await db.runAsync(
      "INSERT OR IGNORE INTO checkins (habitId, date) VALUES (?, ?)",
      [habitId, localDateStr()],
    );
  },

  // 4b. Editar hábito (nombre + ancla)
  async updateHabit(id: number, name: string, anchor: string | null = null) {
    const db = await initDB();
    await db.runAsync(
      "UPDATE habits SET name = ?, anchor = ? WHERE id = ?",
      [name, anchor, id],
    );
  },

  // 5. Eliminar hábito + sus check-ins + todos sus recordatorios (cascada)
  async deleteHabit(id: number) {
    const db = await initDB();
    await db.runAsync("DELETE FROM habits WHERE id = ?", [id]);
    await db.runAsync("DELETE FROM checkins WHERE habitId = ?", [id]);
    await db.runAsync("DELETE FROM reminders WHERE habitId = ?", [id]);
  },

  // 6. Recordatorios (1:N)
  async addReminder(
    habitId: number,
    hour: number,
    minute: number,
  ): Promise<number> {
    const db = await initDB();
    const result = await db.runAsync(
      "INSERT INTO reminders (habitId, hour, minute) VALUES (?, ?, ?)",
      [habitId, hour, minute],
    );
    return result.lastInsertRowId;
  },

  async removeReminder(reminderId: number) {
    const db = await initDB();
    await db.runAsync("DELETE FROM reminders WHERE id = ?", [reminderId]);
  },

  async getRemindersForHabit(habitId: number): Promise<Reminder[]> {
    const db = await initDB();
    const rows = (await db.getAllAsync(
      "SELECT id, hour, minute FROM reminders WHERE habitId = ? ORDER BY hour, minute",
      [habitId],
    )) as any[];
    return rows.map((r) => ({ id: r.id, hour: r.hour, minute: r.minute }));
  },

  // Borra TODOS los recordatorios de un hábito. Usado en edición.
  async removeAllRemindersForHabit(habitId: number) {
    const db = await initDB();
    await db.runAsync("DELETE FROM reminders WHERE habitId = ?", [habitId]);
  },

  // Todos los recordatorios con el nombre del hábito.
  // Usado al iniciar para reprogramar todas las notificaciones.
  async getAllReminders(): Promise<
    { id: number; habitId: number; hour: number; minute: number; name: string }[]
  > {
    const db = await initDB();
    const rows = await db.getAllAsync(`
      SELECT r.id, r.habitId, r.hour, r.minute, h.name
      FROM reminders r
      JOIN habits h ON h.id = r.habitId
    `);
    return rows as {
      id: number;
      habitId: number;
      hour: number;
      minute: number;
      name: string;
    }[];
  },
};
