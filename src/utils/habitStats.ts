import { localDateStr } from "./date";
import { calculateStreak } from "./streakCalculator";

const todayDate = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export interface HeatmapCell {
  date: string;
  completed: boolean;
  isToday: boolean;
  isFuture: boolean;
}

export interface HabitStats {
  currentStreak: number;
  bestStreak: number;
  totalCheckins: number;
  last30DaysRate: number; // 0-1
  last30DaysCount: number;
  // 5 filas × 7 columnas, alineado a Lunes-Domingo (la última columna de la última fila es el domingo de la semana actual)
  heatmap: HeatmapCell[][];
}

const computeBestStreak = (sortedDates: string[]): number => {
  if (sortedDates.length === 0) return 0;
  let best = 1;
  let cur = 1;
  let prev = new Date(sortedDates[0] + "T00:00:00");
  for (let i = 1; i < sortedDates.length; i++) {
    const next = new Date(sortedDates[i] + "T00:00:00");
    const diffDays = Math.round(
      (next.getTime() - prev.getTime()) / 86400000,
    );
    cur = diffDays === 1 ? cur + 1 : 1;
    if (cur > best) best = cur;
    prev = next;
  }
  return best;
};

const buildHeatmap = (
  checkinDates: Set<string>,
  weeks = 5,
): HeatmapCell[][] => {
  const today = todayDate();
  const todayStr = localDateStr(today);

  // dayOfWeek: 0=Dom ... 6=Sáb. Semana ES empieza Lunes.
  // Días desde hoy hasta el próximo domingo (último día del grid):
  const dayOfWeek = today.getDay();
  const daysToSunday = (7 - dayOfWeek) % 7;
  const lastDayOfGrid = new Date(today);
  lastDayOfGrid.setDate(today.getDate() + daysToSunday);

  const totalCells = weeks * 7;
  const grid: HeatmapCell[] = [];
  for (let i = totalCells - 1; i >= 0; i--) {
    const d = new Date(lastDayOfGrid);
    d.setDate(lastDayOfGrid.getDate() - i);
    const dateStr = localDateStr(d);
    grid.push({
      date: dateStr,
      completed: checkinDates.has(dateStr),
      isToday: dateStr === todayStr,
      isFuture: d > today,
    });
  }

  // Agrupar en filas semanales (Lunes-Domingo)
  const rows: HeatmapCell[][] = [];
  for (let i = 0; i < weeks; i++) {
    rows.push(grid.slice(i * 7, (i + 1) * 7));
  }
  return rows;
};

export const buildHabitStats = (checkinDates: string[]): HabitStats => {
  const dateSet = new Set(checkinDates);
  const sortedAsc = [...checkinDates].sort();

  // Últimos 30 días (no en el futuro)
  const today = todayDate();
  let last30Count = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (dateSet.has(localDateStr(d))) last30Count++;
  }

  return {
    currentStreak: calculateStreak(checkinDates),
    bestStreak: computeBestStreak(sortedAsc),
    totalCheckins: checkinDates.length,
    last30DaysCount: last30Count,
    last30DaysRate: last30Count / 30,
    heatmap: buildHeatmap(dateSet),
  };
};
