export type ThemeColors = {
  primary: string;
  background: string;
  surface: string;
  surfaceAlt: string;
  textMain: string;
  textSecondary: string;
  accent: string;
  error: string;
  border: string;
  warning: string;

  streakBg: string;
  streakFg: string;
  reminderBg: string;
  reminderFg: string;

  cardPressedBg: string;
};

export const lightColors: ThemeColors = {
  primary: "#6366f1",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  surfaceAlt: "#EEF2FF",
  textMain: "#1E293B",
  textSecondary: "#64748B",
  accent: "#10B981",
  error: "#EF4444",
  border: "#E2E8F0",
  warning: "#F59E0B",

  streakBg: "#FEE2E2",
  streakFg: "#EF4444",
  reminderBg: "#EEF2FF",
  reminderFg: "#6366f1",

  cardPressedBg: "#F1F5F9",
};

export const darkColors: ThemeColors = {
  primary: "#818CF8",
  background: "#0B1220",
  surface: "#172033",
  surfaceAlt: "#1F2A44",
  textMain: "#F1F5F9",
  textSecondary: "#94A3B8",
  accent: "#34D399",
  error: "#F87171",
  border: "#2A3654",
  warning: "#FBBF24",

  streakBg: "rgba(239, 68, 68, 0.18)",
  streakFg: "#FCA5A5",
  reminderBg: "rgba(129, 140, 248, 0.2)",
  reminderFg: "#A5B4FC",

  cardPressedBg: "#1F2A44",
};
