import { localDateStr } from "./date";

export const calculateStreak = (checkinDates: string[]): number => {
  if (checkinDates.length === 0) return 0;

  const set = new Set(checkinDates);

  // Hoy en hora LOCAL (no UTC)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // Si no completó ni hoy ni ayer, no hay racha activa
  if (!set.has(localDateStr(today)) && !set.has(localDateStr(yesterday))) {
    return 0;
  }

  // Retrocedemos día a día desde hoy mientras haya check-in
  let streak = 0;
  const cur = new Date(today);
  while (set.has(localDateStr(cur))) {
    streak++;
    cur.setDate(cur.getDate() - 1);
  }
  return streak;
};
