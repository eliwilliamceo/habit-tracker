import * as SQLite from "expo-sqlite";

// Singleton: la DB se abre y se migra UNA sola vez por sesión.
// Todas las llamadas concurrentes a initDB() comparten la misma promesa,
// evitando race conditions con execAsync sobre el módulo nativo.
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

const setupDB = async (): Promise<SQLite.SQLiteDatabase> => {
  const db = await SQLite.openDatabaseAsync("habits.db");

  // Tabla de Hábitos
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      frequency TEXT NOT NULL,
      anchor TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migración: añade columna 'anchor' a DBs creadas antes del paso 5.
  const cols = await db.getAllAsync<{ name: string }>(
    `PRAGMA table_info(habits)`,
  );
  if (!cols.some((c) => c.name === "anchor")) {
    await db.execAsync(`ALTER TABLE habits ADD COLUMN anchor TEXT`);
  }

  // Tabla de Check-ins
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS checkins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habitId INTEGER,
      date TEXT NOT NULL,
      FOREIGN KEY (habitId) REFERENCES habits (id)
    );
  `);

  // Migración: deduplica check-ins existentes + UNIQUE(habitId, date).
  await db.execAsync(`
    DELETE FROM checkins WHERE id NOT IN (
      SELECT MIN(id) FROM checkins GROUP BY habitId, date
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_checkins_habit_date ON checkins(habitId, date);
  `);

  // Migración a múltiples recordatorios por hábito.
  // Schema anterior: habitId como PRIMARY KEY (1:1). Nuevo: id propio (1:N).
  const remindersTable = await db.getFirstAsync<{ name: string }>(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='reminders'`,
  );
  if (remindersTable) {
    const cols = await db.getAllAsync<{ name: string }>(
      `PRAGMA table_info(reminders)`,
    );
    const hasIdColumn = cols.some((c) => c.name === "id");
    if (!hasIdColumn) {
      // Schema viejo. Renombramos, recreamos con id propio y copiamos datos.
      await db.execAsync(`
        ALTER TABLE reminders RENAME TO reminders_v1_old;
        CREATE TABLE reminders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          habitId INTEGER NOT NULL,
          hour INTEGER NOT NULL,
          minute INTEGER NOT NULL,
          FOREIGN KEY (habitId) REFERENCES habits (id)
        );
        INSERT INTO reminders (habitId, hour, minute)
          SELECT habitId, hour, minute FROM reminders_v1_old;
        DROP TABLE reminders_v1_old;
      `);
    }
  }

  // Tabla de Recordatorios (schema nuevo — no-op si ya existe tras la migración)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habitId INTEGER NOT NULL,
      hour INTEGER NOT NULL,
      minute INTEGER NOT NULL,
      FOREIGN KEY (habitId) REFERENCES habits (id)
    );
  `);

  // Key-value genérico para flags del usuario (onboarding visto, etc).
  // Evita añadir AsyncStorage solo para esto.
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  return db;
};

export const initDB = (): Promise<SQLite.SQLiteDatabase> => {
  if (!dbPromise) {
    dbPromise = setupDB().catch((err) => {
      // Si el setup falla, permite reintentar en la siguiente llamada.
      dbPromise = null;
      throw err;
    });
  }
  return dbPromise;
};
