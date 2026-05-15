# ARCHITECTURE

> Documento técnico profundo. Para el qué y el por qué del proyecto ver
> `PROJECT_CONTEXT.md`. Para tareas pendientes `TODO.md`.

---

## 1. Stack

### Núcleo

| Tecnología | Versión | Propósito |
|---|---|---|
| React Native | 0.81 | Framework móvil multiplataforma |
| Expo | SDK 54 | Toolchain, build, OTA, plugins nativos |
| TypeScript | 5.9 (strict) | Tipado estático |
| Zustand | 5.0 | Estado global (más ligero que Redux) |
| expo-sqlite | 16.0 | Persistencia local SQL |

### UI y feedback

| Tecnología | Propósito |
|---|---|
| `@react-navigation/native` + `stack` | Navegación entre pantallas |
| `react-native-reanimated` 4 | Animaciones (check spring, splash entrance) |
| `lucide-react-native` | Sistema de iconos |
| `expo-haptics` | Feedback táctil |

### Notificaciones y observabilidad

| Tecnología | Propósito |
|---|---|
| `expo-notifications` | Notificaciones locales programadas |
| `@sentry/react-native` | Crash + error reporting (condicional según DSN) |
| `expo-localization` + `i18next` + `react-i18next` | i18n ES/EN |

### Iconos / Identidad visual

| Tecnología | Propósito |
|---|---|
| `@resvg/resvg-js` (dev) | Generación SVG → PNG (6 iconos nativos) |

### Lo descartado deliberadamente

- `nativewind` / Tailwind — cero uso real
- `expo-router` — usamos Stack clásico de React Navigation
- `@react-native-async-storage/async-storage` — SQLite es suficiente
- `@expo/vector-icons`, `expo-symbols`, `expo-image` — solo en boilerplate del template

---

## 2. Capas

```
┌─────────────────────────────────────────────────────┐
│  Screens (UI + navegación)                          │
│  - HomeScreen          (lista + saludo + progreso)  │
│  - CreateHabitScreen   (form crear/editar)          │
│  - HabitDetailScreen   (stats + heatmap)            │
│  - LegalScreen         (privacy + terms)            │
└────────────────────────┬────────────────────────────┘
                         │ uses hooks
┌────────────────────────▼────────────────────────────┐
│  Store (Zustand) — useHabitStore                    │
│  Acciones: fetchHabits, addHabit, updateHabit,      │
│  removeHabit, recordCheckIn                         │
│  Helpers internos: persistRemindersFor              │
└────────────────────────┬────────────────────────────┘
                         │ calls
┌────────────────────────▼────────────────────────────┐
│  Services                                           │
│  - habitService          (CRUD + queries)           │
│  - notificationService   (schedule/cancel notifs)   │
│  - settingsService       (key-value generic)        │
└────────────────────────┬────────────────────────────┘
                         │
              ┌──────────┴──────────┐
   ┌──────────▼──────┐   ┌──────────▼──────────┐
   │  SQLite         │   │  expo-notifications │
   │  (singleton)    │   │  (sistema OS)       │
   └─────────────────┘   └─────────────────────┘
```

---

## 3. Decisiones arquitectónicas notables

### 3.1 DB como singleton

`initDB()` cachea la promesa de inicialización. Llamadas concurrentes durante
el primer arranque comparten el mismo await, las migraciones corren
exactamente una vez por sesión.

```ts
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export const initDB = (): Promise<SQLite.SQLiteDatabase> => {
  if (!dbPromise) {
    dbPromise = setupDB().catch((err) => {
      dbPromise = null;
      throw err;
    });
  }
  return dbPromise;
};
```

**Razón**: descubierto por bug en producción interno (tap rápido al check-in
→ múltiples `initDB()` paralelos → `NullPointerException` en `execAsync`).
El módulo nativo de expo-sqlite no maneja bien la concurrencia interna en
multi-statement execs.

### 3.2 `completedToday` vive en el store, no en cada card

Antes cada `HabitCard` hacía su propio query a `getCheckInsForHabit` para
saber si estaba completado hoy. Ahora `getAllHabits` hace un `LEFT JOIN` a
la tabla `checkins` filtrado por `c.date = today` y devuelve
`completedToday: boolean` por hábito.

Beneficios:
- 1 query en vez de N
- El sort y el progreso del día son derivados directos del store
- Tras un check-in, el store actualiza el campo y la UI re-ordena/cuenta
  automáticamente

### 3.3 Tematización por hook + `makeStyles(colors)`

```ts
const colors = useThemeColors();
const styles = React.useMemo(() => makeStyles(colors), [colors]);
```

`useThemeColors` lee `useColorScheme()` del SO. Cambiar el modo del sistema
→ React re-renderiza con la nueva paleta. Sin context provider, sin
propagación manual.

`StyleSheet.create` se llama dentro de `makeStyles(colors)` para construir
estilos dinámicos. `useMemo` evita recrear el objeto en cada render.

### 3.4 Fechas siempre en hora local, nunca UTC

**Bug temprano**: `new Date().toISOString()` devuelve UTC. Para timezones al
oeste de UTC, en horas de la noche local, esto daba el día siguiente.
Resultado: el usuario marcaba un check-in el viernes y aparecía en el
sábado del heatmap.

**Fix**: util `localDateStr()` que usa `getFullYear/getMonth/getDate`
(locales). Todo el código usa este helper, **cero `toISOString` en lógica
de fechas** (verificado por grep).

### 3.5 Notificaciones: 1 identifier por recordatorio

`notifId(reminderId) = `habit-reminder-${reminderId}``. Cancelar y
reschedule son siempre por id específico. Idempotente: re-programar el
mismo recordatorio cancela el previo y crea el nuevo.

**Antes** (bug del template): el código original llamaba a
`cancelAllScheduledNotificationsAsync()` antes de cada schedule, así que
añadir un segundo recordatorio borraba todos los anteriores.

**Migración 1:1 → 1:N**: cuando se pasó de un recordatorio por hábito a
múltiples, el identifier cambió de `habit-reminder-${habitId}` a
`habit-reminder-${reminderId}`. Riesgo de colisión con notifs antiguas →
mitigación con `cancelAll()` en el startup antes de reprogramar desde DB.

### 3.6 Sentry condicional

Si no hay `EXPO_PUBLIC_SENTRY_DSN` en `.env`, todo el código de Sentry es
no-op. `Sentry.wrap(App)` solo se aplica si el DSN existe. Cero overhead
en dev sin DSN configurado.

### 3.7 Splash + Onboarding como overlays, no como rutas

El splash JS animado y el onboarding son `Animated.View` posicionadas
sobre el `NavigationContainer`. Cuando terminan, se desmontan y dejan ver
la Home (que ya estaba montada debajo). Evita parpadeos entre rutas y
permite que el splash dure exactamente el tiempo controlado por
animaciones, no por la duración de carga de la Home.

---

## 4. Modelo de datos

### Esquema SQLite

```sql
-- Hábitos
CREATE TABLE IF NOT EXISTS habits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  frequency TEXT NOT NULL,      -- legacy, siempre 'daily'
  anchor TEXT,                  -- "Después de [X]" para habit stacking
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Check-ins diarios
CREATE TABLE IF NOT EXISTS checkins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  habitId INTEGER,
  date TEXT NOT NULL,           -- YYYY-MM-DD en hora local
  FOREIGN KEY (habitId) REFERENCES habits (id)
);
CREATE UNIQUE INDEX idx_checkins_habit_date ON checkins(habitId, date);

-- Recordatorios (1:N — múltiples por hábito)
CREATE TABLE IF NOT EXISTS reminders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  habitId INTEGER NOT NULL,
  hour INTEGER NOT NULL,
  minute INTEGER NOT NULL,
  FOREIGN KEY (habitId) REFERENCES habits (id)
);

-- Configuración del usuario (flags genéricos)
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
```

### Migraciones (todas idempotentes, corren al abrir la DB)

1. **Anchor en habits**: `ALTER TABLE habits ADD COLUMN anchor TEXT` con
   guardado vía `PRAGMA table_info` para detectar si ya existe.
2. **Dedupe + UNIQUE en checkins**: borra duplicados quedándose con el
   menor `id` por `(habitId, date)`, luego crea el índice único.
3. **Reminders 1:1 → 1:N**: detecta schema viejo por ausencia de columna
   `id`, renombra a `reminders_v1_old`, crea schema nuevo, copia datos,
   dropea tabla vieja.

### Tipo `Habit` en TypeScript

```ts
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
  completedToday: boolean;       // calculado en getAllHabits via JOIN
}
```

`frequency` se omite del tipo TS — siempre vale `'daily'` y la columna
queda como deuda controlada.

---

## 5. Patrones de implementación

### 5.1 Servicios stateless

Cada `*Service.ts` exporta un objeto sin estado interno. Toda la
persistencia pasa por `initDB()`. Esto permite que las funciones se llamen
desde cualquier capa (store, screens) sin preocuparse por instanciación.

### 5.2 i18n con react-i18next

- 3 namespaces principales: `common`, `home`, `create`, `detail`,
  `splash`, `onboarding`, `notif`, `legal`
- Pluralización vía claves `_one` / `_other` (rachas, días, veces)
- Interpolación con `{{var}}` para nombres, fechas, conteos
- `Intl.DateTimeFormat(i18n.language, ...)` para fechas — nunca hardcodear
  locale

### 5.3 Manejo de permisos de notificaciones

Se piden **una sola vez** y solo cuando el usuario realmente intenta crear
un recordatorio. Si los deniega, los recordatorios no se programan pero el
hábito se crea igual (sin recordatorio). Política: no bloquear creación
del hábito por falta de permiso.

### 5.4 Reescritura de reminders en update

Al editar un hábito con recordatorios, la lógica simple es: cancelar todos
los existentes (sistema + DB), persistir los nuevos. Más simple que
diffear y a esta escala (≤10 recordatorios por hábito) el costo es
trivial.

---

## 6. Estructura de archivos

```
habit-tracker/
├── App.tsx                          # Entry point + Sentry init + Navigation
├── app.json                         # Expo config
├── eas.json                         # (pendiente — EAS Build profiles)
├── package.json
├── tsconfig.json
├── babel.config.js
├── eslint.config.js
├── .env.example
│
├── PROJECT_CONTEXT.md               # Qué + por qué
├── ARCHITECTURE.md                  # Este archivo
├── TODO.md                          # Pendientes
├── CLAUDE_HISTORY.md                # Bitácora
├── PROJECT.md                       # Legacy unificado
├── README.md
│
├── assets/
│   ├── icon-source.svg              # SVG fuente del logo
│   └── images/
│       ├── icon.png                 # 1024 — generado vía script
│       ├── splash-icon.png          # 1024 — generado
│       ├── favicon.png              # 96  — generado
│       └── android-icon-*.png       # adaptive icons — generados
│
├── scripts/
│   ├── generate-icons.js            # SVG → 6 PNGs con resvg
│   └── reset-project.js             # (legacy del template)
│
└── src/
    ├── components/
    │   ├── Logo.tsx                 # Cuadrado + llama, reutilizable
    │   ├── SplashOverlay.tsx        # Splash JS animado
    │   └── OnboardingOverlay.tsx    # 3 slides + dots + skip
    │
    ├── screens/
    │   ├── HomeScreen.tsx
    │   ├── CreateHabitScreen.tsx    # Dual mode (crear/editar)
    │   ├── HabitDetailScreen.tsx
    │   └── LegalScreen.tsx
    │
    ├── services/
    │   ├── db.ts                    # Singleton + migraciones
    │   ├── habitService.ts
    │   ├── notificationService.ts
    │   └── settingsService.ts
    │
    ├── store/
    │   └── useHabitStore.ts
    │
    ├── theme/
    │   ├── colors.ts                # lightColors + darkColors
    │   └── useTheme.ts
    │
    ├── utils/
    │   ├── date.ts                  # localDateStr
    │   ├── streakCalculator.ts      # Racha actual
    │   └── habitStats.ts            # Best streak + total + % + heatmap
    │
    └── i18n/
        ├── index.ts                 # Setup i18next
        └── locales/
            ├── es.ts
            └── en.ts
```

---

## 7. Convenciones de código

- **TypeScript estricto**: `strict: true` en `tsconfig`. Todo tipado.
- **Estilos dinámicos**: cada screen tiene su `makeStyles(colors)` y los
  memoiza con `useMemo`.
- **Imports**: relativos (`../theme/useTheme`), sin alias `@/` (se removió
  por ser dead code del template).
- **Naming**: screens en `PascalCase` con sufijo `Screen`. Servicios y
  stores en camelCase. Tipos exportados con `Pascal`.
- **Comentarios**: solo donde la decisión no es obvia (race conditions,
  timezone bugs, defensas). Comentarios en español.
- **Sin emojis en código fuente** salvo en strings de UI mostrados al
  usuario.

---

## 8. Setup local

### Requisitos

- Node.js LTS (>= 18)
- npm
- Expo Go en un dispositivo físico, o emulador iOS/Android

### Pasos

```bash
git clone <repo>
cd habit-tracker
npm install

# Opcional: configurar Sentry
cp .env.example .env
# Editar .env y pegar EXPO_PUBLIC_SENTRY_DSN

npx expo start
# Escanear QR con Expo Go
```

### Comandos útiles

```bash
npm start                    # Expo dev server
npm run ios                  # simulador iOS (requiere Xcode)
npm run android              # emulador Android
npm run web                  # preview web (limitado)
npx tsc --noEmit             # typecheck
npm run lint                 # ESLint
npm run generate-icons       # regenerar iconos desde SVG
```

---

## 9. Riesgos técnicos conocidos

| Riesgo | Mitigación |
|---|---|
| Sync con conflictos cuando entre Fase 1 | Empezar con last-write-wins simple, escalar a CRDT solo si aparece dolor real |
| Sentry free tier (5k errors/mes) se agota | Sample rate 10% en producción, alertas antes de tope |
| Apple rechaza submission por algo del template | Beta cerrada extensa antes de submit; checklist de App Review |
| Supabase free tier insuficiente | Plan B: Firebase. Plan C: backend propio en Hetzner $5/mes |
| Multi-recordatorios escalando a 20+/hábito | Hard cap en UI a ~10 recordatorios por hábito |
