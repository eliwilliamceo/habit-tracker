import { initDB } from "./db";

// Wrapper genérico key-value sobre la tabla app_settings.
// Pensado para flags del usuario (onboarding visto, override de idioma, etc.).
export const settingsService = {
  async get(key: string): Promise<string | null> {
    const db = await initDB();
    const row = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM app_settings WHERE key = ?",
      [key],
    );
    return row?.value ?? null;
  },

  async set(key: string, value: string): Promise<void> {
    const db = await initDB();
    await db.runAsync(
      "INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)",
      [key, value],
    );
  },

  async getBoolean(key: string): Promise<boolean> {
    return (await this.get(key)) === "true";
  },

  async setBoolean(key: string, value: boolean): Promise<void> {
    await this.set(key, value ? "true" : "false");
  },
};

export const SETTING_KEYS = {
  onboardingSeen: "onboarding_seen_v1",
} as const;
