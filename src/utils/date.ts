// Devuelve YYYY-MM-DD en la zona horaria LOCAL del dispositivo.
// Crítico: usar getFullYear/getMonth/getDate (locales) en vez de toISOString
// (UTC), porque toISOString cambia el día cuando la hora local cruza UTC.
export const localDateStr = (d: Date = new Date()): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
