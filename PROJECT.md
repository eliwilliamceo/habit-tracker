# Habit Tracker — Documentación de proyecto

> Última actualización: 2026-05-09
> Versión: 1.0.0 (pre-lanzamiento, en desarrollo activo)
> Plataformas: iOS, Android (web preview disponible vía Expo)

---

## 1. Objetivo del proyecto

### Para qué se construye

Este proyecto tiene **tres objetivos en orden de prioridad**, definidos tras una decisión estratégica explícita:

1. **Vehículo de aprendizaje del ciclo completo de un producto móvil**
   Cubrir auth, sync con backend, IAP, push notifications reales, crash reporting, analytics, ASO, soporte y distribución en stores. Aprender haciendo, no leyendo.

2. **Portfolio profesional ejecutado a nivel producción**
   Una app shipped en App Store y Google Play que sirva como prueba tangible de capacidad full-stack móvil. El propósito es generar oportunidades de freelance / B2B / contrato (donde el revenue está realmente, no en el long tail de habit trackers).

3. **Side project con monetización simbólica opcional**
   IAP cosmético (temas extra, badge "Supporter") para implementar el pipeline completo de pagos sin gatekear valor real. La monetización **no es objetivo primario**; el revenue será métrica vanity.

### Lo que NO es objetivo

- Competir con Streaks, Habitify, Productive en el mercado de habit trackers (mercado saturado, distribución power-law muy desfavorable).
- Generar ingreso suficiente para sustituir un salario.
- Maximizar conversión de usuarios free a pago.

### El producto

Aplicación móvil que ayuda a construir hábitos consistentes mediante técnicas validadas de psicología del comportamiento:

- **Habit stacking** (Atomic Habits): vincular cada hábito nuevo a una rutina existente como ancla.
- **Implementation intentions**: el usuario define cuándo y dónde hará el hábito vía recordatorios.
- **Streak tracking**: visualización de racha actual y máxima como refuerzo identitario.
- **Heatmap visual**: panorama de las últimas 5 semanas para evidenciar consistencia.

El posicionamiento conceptual es la cuña diferenciadora, aunque no constituye un moat técnico.

---

## 2. Estado actual

| Área | Estado |
|---|---|
| Funcionalidad core (CRUD hábitos + check-ins + rachas) | Completa |
| Recordatorios locales (1 por hábito) | Completa |
| Habit stacking (anchors) | Completa |
| Dashboard de detalle (stats + heatmap) | Completa |
| Edición de hábitos | Completa |
| Theming (light + dark, sigue al SO) | Completa |
| Splash screen JS animado + logo | Completa |
| Crash reporting (Sentry) | Integrado, requiere DSN |
| Persistencia | Local (SQLite) |
| Auth + cloud sync | Pendiente |
| IAP / paywall | Pendiente |
| Push notifications server-side | Pendiente |
| i18n | Pendiente (todo está hardcoded en español) |
| Distribución en stores | Pendiente |
| Iconos nativos (icon.png, splash-icon.png) | Placeholders del template Expo |

---

## 3. Stack técnico

### Núcleo

| Tecnología | Versión | Propósito |
|---|---|---|
| React Native | 0.81 | Framework móvil multiplataforma |
| Expo | SDK 54 | Toolchain, build, OTA, plugins nativos |
| TypeScript | 5.9 | Tipado estático en todo el código |
| Zustand | 5.0 | Estado global (más ligero que Redux, ideal para esta escala) |
| expo-sqlite | 16.0 | Persistencia local SQL |

### UI / UX

| Tecnología | Propósito |
|---|---|
| `@react-navigation/native` + `stack` | Navegación entre pantallas (3 screens hoy) |
| `react-native-reanimated` 4 | Animaciones (check-in bounce, splash entrance) |
| `lucide-react-native` | Sistema de iconos (Flame, Check, Bell, Link2, Target, etc.) |
| `expo-haptics` | Feedback táctil en check-in, long-press, save |

### Notificaciones

| Tecnología | Propósito |
|---|---|
| `expo-notifications` | Notificaciones locales programadas (recordatorios diarios) |

### Observabilidad

| Tecnología | Propósito |
|---|---|
| `@sentry/react-native` | Crash + error reporting (condicional según DSN) |

### Lo que se descartó deliberadamente

- **`nativewind` / Tailwind**: estaba instalado del template, sin uso real, removido.
- **`expo-router`**: el proyecto usa Stack clásico de React Navigation. Removido para reducir superficie.
- **`@react-native-async-storage/async-storage`**: SQLite es suficiente.
- **`@expo/vector-icons`, `expo-symbols`, `expo-image`**: solo en boilerplate del template, removidos.

---

## 4. Arquitectura

### Capas

```
┌──────────────────────────────────────────┐
│  Screens (UI + navegación)               │
│  - HomeScreen                            │
│  - CreateHabitScreen (crear + editar)    │
│  - HabitDetailScreen                     │
└────────────────┬─────────────────────────┘
                 │ uses hooks
┌────────────────▼─────────────────────────┐
│  Store (Zustand)                         │
│  - useHabitStore                         │
│    Acciones: fetchHabits, addHabit,      │
│    removeHabit, recordCheckIn,           │
│    setReminder, removeReminder,          │
│    updateHabit                           │
└────────────────┬─────────────────────────┘
                 │ calls
┌────────────────▼─────────────────────────┐
│  Services (lógica de dominio)            │
│  - habitService (CRUD + queries)         │
│  - notificationService (schedule/cancel) │
└────────────────┬─────────────────────────┘
                 │
        ┌────────┴────────┐
┌───────▼─────┐  ┌────────▼──────────┐
│  SQLite     │  │  expo-notifications│
│  (singleton)│  │  (sistema OS)      │
└─────────────┘  └────────────────────┘
```

### Decisiones arquitectónicas notables

#### DB como singleton

`initDB()` cachea la promesa de inicialización. Llamadas concurrentes durante el primer arranque comparten el mismo await, las migraciones corren exactamente una vez por sesión.

**Razón**: descubierto por bug en producción interno: tap rápido al check-in → múltiples `initDB()` paralelos → `NullPointerException` en `execAsync` (módulo nativo de SQLite no maneja bien la concurrencia interna).

```ts
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export const initDB = (): Promise<SQLite.SQLiteDatabase> => {
  if (!dbPromise) {
    dbPromise = setupDB().catch((err) => {
      dbPromise = null; // permite reintentar si el setup falla
      throw err;
    });
  }
  return dbPromise;
};
```

#### `completedToday` vive en el store, no en cada card

Antes cada `HabitCard` hacía su propio query a `getCheckInsForHabit` para saber si estaba completado hoy. Ahora `getAllHabits` hace un `LEFT JOIN` a la tabla `checkins` filtrado por `c.date = today` y devuelve `completedToday: boolean` por hábito.

Beneficios:
- 1 query en vez de N
- El sort y el progreso del día son derivados directos del store
- Tras un check-in, el store actualiza el campo y la UI re-ordena/cuenta automáticamente

#### Tematización por hook + `makeStyles(colors)`

```ts
const colors = useThemeColors();
const styles = React.useMemo(() => makeStyles(colors), [colors]);
```

`useThemeColors` lee `useColorScheme()` del SO. Cambiar el modo del sistema → `useColorScheme()` re-emite → React re-renderiza con la nueva paleta. Sin context provider, sin propagación manual.

`StyleSheet.create` se llama dentro de `makeStyles(colors)` para construir estilos dinámicos. `useMemo` evita recrear el objeto en cada render.

#### Fechas siempre en hora local, nunca UTC

Bug temprano: `new Date().toISOString()` devuelve UTC. Para timezones al oeste de UTC, en horas de la noche local, esto daba el día siguiente. Resultado: marcabas un check-in el viernes y aparecía el sábado.

Fix: util `localDateStr()` que usa `getFullYear/getMonth/getDate` (locales). Todo el código usa este helper, cero `toISOString` en lógica de fechas.

#### Notificaciones: 1 identifier por hábito

`reminderId(habitId) = `habit-reminder-${habitId}``. Cancelar y reschedule son siempre por id específico. Idempotente: re-programar el mismo hábito cancela el previo y crea el nuevo.

Antes (bug del template): el código original llamaba a `cancelAllScheduledNotificationsAsync()` antes de cada schedule, así que añadir un segundo recordatorio borraba todos los anteriores.

#### Sentry condicional

Si no hay `EXPO_PUBLIC_SENTRY_DSN` en `.env`, todo el código de Sentry es no-op. `Sentry.wrap(App)` solo se aplica si el DSN existe. Cero overhead en dev sin DSN.

---

## 5. Modelo de datos

### Esquema SQLite

```sql
-- Tabla principal
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

-- Recordatorios (1 por hábito por ahora)
CREATE TABLE IF NOT EXISTS reminders (
  habitId INTEGER PRIMARY KEY,
  hour INTEGER NOT NULL,
  minute INTEGER NOT NULL,
  FOREIGN KEY (habitId) REFERENCES habits (id)
);
```

### Migraciones

Idempotentes, corren al abrir la DB:

1. `ALTER TABLE habits ADD COLUMN anchor TEXT` — protegido con `PRAGMA table_info` para detectar si ya existe.
2. Dedupe + UNIQUE en `checkins`: borra duplicados quedándose con el menor `id` por `(habitId, date)`, luego crea el índice único.

### Tipo `Habit` en JS

```ts
export interface Habit {
  id: number;
  name: string;
  anchor?: string | null;
  reminderHour?: number | null;
  reminderMinute?: number | null;
  completedToday: boolean;       // calculado en getAllHabits via JOIN
}
```

`frequency` se omite del tipo TS — siempre vale `'daily'` y la columna queda como deuda controlada.

---

## 6. Features implementadas (cronológico)

### Paso 1 — Bloqueo de check-ins duplicados
- Índice UNIQUE(habitId, date) + dedupe migration
- `INSERT OR IGNORE` defensivo en `recordCheckIn`
- Botón ✓ pasa a verde y se deshabilita cuando ya está marcado hoy

### Paso 2 — Recordatorios locales
- Tabla `reminders` + servicio CRUD
- `expo-notifications` con `SchedulableTriggerInputTypes.DAILY`
- Identifiers por hábito → cancelación granular
- App.tsx reprograma todos los recordatorios al arranque (resilencia ante limpieza del OS)
- Permisos pedidos solo cuando el usuario elige un recordatorio
- UI de chips (Mañana / Mediodía / Tarde / Antes de dormir / Personalizado HH:MM)
- Log de debug en `__DEV__` con todas las notifs programadas

### Paso 3 — Limpieza del template
- 11 archivos boilerplate eliminados (themed-text, parallax-scroll-view, etc.)
- 51 paquetes npm desinstalados (12 directos + 39 transitivos)
- `app.json` y `tsconfig.json` saneados
- Path de assets reorganizado a la convención Expo

### Paso 4 — Borrar hábitos
- Long-press en la tarjeta → Alert de confirmación → cascade delete (habit + checkins + reminder + notif cancelada)
- Hint visible bajo la lista para descubrimiento

### Paso 5 — Habit stacking
- Columna `anchor` con migración segura
- Sección "Vincular a una rutina" en el form con prefijo fijo "Después de"
- Badge "🔗 Después de X" en cada tarjeta cuando hay ancla

### Paso 6 — Dashboard de progreso
- Pantalla `HabitDetailScreen` con hero (racha actual), 3 stat cards, heatmap 5×7
- Cálculo de mejor racha consecutiva, total, % últimos 30 días
- Heatmap alineado a Lunes-Domingo en hora local
- `useFocusEffect` para refresco automático al volver

### Paso 7a — Polish táctil
- Animación spring del check button con `withSequence + withTiming + withSpring`
- Haptics: `Success` en check-in, `Medium` en long-press, `Success` en save
- Empty state rico: icono Target en círculo + título + subtítulo + CTA grande

### Paso 7b — Dark mode
- Paletas duales `lightColors` / `darkColors` con tokens semánticos (streakBg, reminderBg, surfaceAlt)
- Hook `useThemeColors()` lee `useColorScheme()` del SO
- `NavigationContainer` con tema dinámico (background/card/text/border)
- `StatusBar` cambia entre `light`/`dark` automáticamente
- Refactor de los 3 screens a `makeStyles(colors)` con `useMemo`

### Paso 8 — Identidad visual
- `<Logo />` reutilizable: cuadrado redondeado primary + Flame blanca + sombra coloreada
- `<SplashOverlay />` animado: logo entra con spring, texto fade-in con translateY, hold 2s, fade-out 550ms
- Wiring con `expo-splash-screen.preventAutoHideAsync()` para evitar parpadeo nativo→JS
- `assets/icon-source.svg` con instrucciones para exportar a los 6 PNGs nativos

### Paso 9 — Quality of life
- Saludo dinámico ("Buenos días/tardes/noches") + fecha en español ("Viernes, 8 de mayo")
- Badge de progreso del día ("Hoy: 2 de 5")
- Hábitos nuevos al principio de la lista
- Pendientes arriba, completados abajo (sort estable)
- Botón Save deshabilitado cuando el form es inválido
- Eliminado el feature "Días específicos" (estaba sin implementar)

### Paso 10 — Editar hábito + Sentry
- `updateHabit` en service, store y form (mismo screen, modo dual create/edit)
- Auto-detección de preset vs custom al pre-rellenar
- Reconciliación automática del recordatorio al editar
- Botón ✏️ en el header del detail
- Sentry integrado de forma condicional vía `EXPO_PUBLIC_SENTRY_DSN`

### Paso 11 — Información legal
- Pantalla `LegalScreen` con Política de privacidad (8 secciones) + Términos de uso (9 secciones)
- Borrador honesto reflejando el estado actual: datos solo locales, sin servidores, Sentry opcional
- Disclaimer visible recomendando revisión legal según jurisdicción antes de publicar
- Entry point como link discreto "Privacidad · Términos" en el footer de la Home
- Email de contacto y fecha de última actualización visibles

### Paso 12 — Internacionalización (i18n) ES + EN
- Stack: `i18next` + `react-i18next` + `expo-localization`
- Detección automática del idioma del SO al arrancar (fallback ES)
- ~85 strings centralizados en `src/i18n/locales/es.ts` y `src/i18n/locales/en.ts`
- Pluralización vía claves `_one` / `_other` (rachas, días, veces)
- Interpolación con `{{var}}` para nombres, fechas, conteos, tiempos
- `Intl.DateTimeFormat` ahora usa `i18n.language` (no `'es-ES'` hardcoded)
- LegalScreen entrega contenido bilingüe — arrays ES/EN dentro del componente, headers/disclaimer/contacto vía i18n
- Notificaciones (título + body + nombre de canal Android) localizadas vía `i18n.t` desde el service
- Cero hardcodes en pantallas/servicios — verificado por grep

### Paso 14 — Múltiples recordatorios por hábito
- Schema `reminders` migrado de 1:1 (PK habitId) a 1:N (id propio + habitId FK)
- Migración no destructiva: detecta schema viejo vía `PRAGMA table_info`, renombra → recrea → copia datos → drop
- `habitService` reescrito con `addReminder`, `removeReminder(reminderId)`, `getRemindersForHabit`, `removeAllRemindersForHabit`. Métodos antiguos `setReminder`/`removeReminder(habitId)` removidos.
- `getAllHabits` ahora hace 2 queries (habits + reminders) y agrupa en memoria — evita la explosión cartesiana del LEFT JOIN con N recordatorios y M check-ins
- Tipo `Habit.reminders: Reminder[]` reemplaza los antiguos `reminderHour` / `reminderMinute`
- `notificationService.scheduleReminder` ahora acepta `reminderId` (no habitId) → identifiers únicos
- Helper interno `persistRemindersFor` en el store: pide permisos UNA vez, persiste e inscribe cada recordatorio
- `App.tsx` arranca con `cancelAll()` de notificaciones + re-schedule completo desde DB — limpia identifiers huérfanos de migraciones
- UI: chips multi-toggle para presets (✓ cuando activos) + custom-add inline con botón "Añadir". Custom times que no coinciden con presets aparecen como chips removibles propios
- Detección de duplicados al añadir custom (no permite la misma hora dos veces)
- Home badge: 1 recordatorio muestra la hora, ≥2 muestran `×N`
- HabitDetail: 1 recordatorio muestra texto, ≥2 muestran chips listados

### Paso 13 — Onboarding
- 3 slides con swipe horizontal (FlatList paginada, cero deps nuevas)
- Slide 1: Logo + "Construye hábitos consistentes" — qué es la app
- Slide 2: Icono Link + explicación del habit stacking — la diferenciación
- Slide 3: Icono Flame + racha — el refuerzo identitario
- Indicador de progreso con dots animados (dot activo se alarga)
- Botón Skip arriba a la derecha + botón Siguiente/Empezar abajo
- Fade-out de 320ms al finalizar
- Persistencia con tabla `app_settings(key, value)` en SQLite — key `onboarding_seen_v1`
- Si la lectura del flag falla, se considera visto (no bloquea al usuario)
- Strings localizados ES + EN
- Solo aparece después de que el splash termine, para evitar overlap

---

## 7. Estructura de archivos

```
habit-tracker/
├── App.tsx                          # Entry point + Sentry init + Navigation
├── app.json                         # Expo config (plugins, splash, icons)
├── package.json
├── tsconfig.json
├── babel.config.js
├── eslint.config.js
├── .env.example                     # Variables de entorno documentadas
├── PROJECT.md                       # Este documento
├── README.md
│
├── assets/
│   ├── icon-source.svg              # Logo source para exportar a PNG
│   └── images/
│       ├── icon.png                 # Placeholder Expo, pendiente reemplazar
│       ├── splash-icon.png          # Placeholder Expo
│       ├── favicon.png              # Web
│       ├── android-icon-*.png       # Adaptive icon Android
│
└── src/
    ├── components/
    │   ├── Logo.tsx                 # Marca visual reutilizable
    │   └── SplashOverlay.tsx        # Splash JS animado
    │
    ├── screens/
    │   ├── HomeScreen.tsx           # Lista + saludo + progreso del día
    │   ├── CreateHabitScreen.tsx    # Form crear/editar (dual mode)
    │   └── HabitDetailScreen.tsx    # Hero + stats + heatmap
    │
    ├── services/
    │   ├── db.ts                    # Singleton SQLite + migraciones
    │   ├── habitService.ts          # CRUD y queries
    │   └── notificationService.ts   # expo-notifications wrapper
    │
    ├── store/
    │   └── useHabitStore.ts         # Zustand store + acciones
    │
    ├── theme/
    │   ├── colors.ts                # lightColors + darkColors + ThemeColors type
    │   └── useTheme.ts              # useThemeColors, useIsDark
    │
    └── utils/
        ├── date.ts                  # localDateStr — fechas en hora local
        ├── streakCalculator.ts      # Racha actual
        └── habitStats.ts            # Mejor racha + total + % + heatmap grid
```

---

## 8. Convenciones de código

- **TypeScript estricto**: `strict: true` en `tsconfig`. Todo tipado.
- **Estilos dinámicos**: cada screen tiene su `makeStyles(colors)` y los memoiza con `useMemo`.
- **Imports**: relativos (`../theme/useTheme`), sin alias `@/` (se removió por ser dead code del template).
- **Naming**: screens en `PascalCase` con sufijo `Screen`. Servicios y stores en camelCase. Tipos exportados con `Pascal`.
- **Comentarios**: solo donde la decisión no es obvia (race conditions, timezone bugs, defensas). Comentarios en español.
- **Sin emojis en código fuente** salvo en strings que se muestran al usuario.

---

## 9. Setup local

### Requisitos

- Node.js LTS (>= 18)
- npm
- Expo Go en un dispositivo físico, o emulador iOS/Android
- (Opcional) Cuenta Sentry para error reporting

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
npm run ios          # arranca en simulador iOS
npm run android      # arranca en emulador Android
npm run web          # preview en navegador (limitado)
npx tsc --noEmit     # typecheck sin emitir
npm run lint         # ESLint
```

---

## 10. Roadmap

### Fase 0 — Cierre técnico (en progreso)

| Tarea | Estado | Esfuerzo |
|---|---|---|
| Editar hábito | Hecho | — |
| Sentry integrado | Hecho | — |
| Privacy policy + ToS | Hecho (borrador interno) | — |
| i18n ES + EN | Hecho | — |
| Onboarding 3 pantallas | Hecho | — |
| Múltiples recordatorios por hábito | Hecho | — |

### Fase 1 — Backend + cuentas (3-5 semanas)

Stack: **Supabase** (Postgres + Auth + Realtime).

- Auth: email + Apple Sign In (obligatorio en App Store) + Google
- Esquema en Postgres equivalente a SQLite local
- Sync delta offline-first: la app sigue funcionando sin red, sube cambios cuando vuelve
- Política de last-write-wins con timestamp de modificación
- Recovery flow: cambias de teléfono → login → vuelven todos los hábitos

### Fase 2 — IAP cosmético (1 semana)

Stack: **RevenueCat** (free tier hasta $10k MRR).

- Tier gratis: todo lo funcional, ilimitado
- Tier "Supporter": 2-3 temas extra (Sunset, Forest, Midnight) + badge en perfil
- Pricing simbólico: $2.99 lifetime o $0.99/mes
- Restore purchases flow
- Settings con "Become a supporter" y manejo de status

### Fase 3 — Push reales (3-5 días)

- Expo Push Service tokens
- Edge Function en Supabase que dispara recordatorios server-side
- Backup de notifs locales que se pierden cuando el OS limpia procesos

### Fase 4 — Distribución (2-3 semanas)

- Cuenta Apple Developer ($99/año) y Google Play ($25 una vez)
- EAS Build para producción
- Iconos nativos exportados desde `icon-source.svg`
- Screenshots para todos los tamaños (iPhone 6.5", 5.5", 6.7", iPad, Android phone, tablet)
- ASO research (keywords, descripción, primeros 3 renglones críticos)
- Beta TestFlight + Play Internal Testing con 20-50 personas
- Submission y release en ambas stores

### Fase 5 — Posicionamiento (continuo)

- Landing page simple con link a stores
- LinkedIn post de lanzamiento
- Show HN / Reddit r/iOSProgramming, r/reactnative
- **Sin spend en ads** — el producto es portfolio, no negocio

---

## 11. No-goals

Para evitar scope creep, estas cosas **no van a entrar** salvo que cambie la estrategia:

- Editor visual de tipos de gráficos / dashboards customizables
- Multi-perfil / familias / accountability social
- Apple Watch / Wear OS apps
- Geofencing / smart reminders basados en ubicación
- Gamificación tipo Habitica
- Marketplace de templates de hábitos
- AI coaching conversacional
- Backup manual con import/export
- Web app completa (más allá del preview)
- Custom fonts (system font es suficiente)

Si alguna de estas se vuelve crítica, replantearemos prioridades.

---

## 12. Métricas de éxito

Dado el objetivo del proyecto (portfolio + side project, no producto comercial), las métricas relevantes son:

| Métrica | Target |
|---|---|
| App publicada en App Store y Google Play | Sí / No |
| Stack completo demostrado (auth, sync, IAP, push, analytics, ASO) | Sí / No |
| Crash-free rate (Sentry) | > 99.5% |
| Conversaciones B2B/freelance generadas en 12 meses | >= 3 |
| Usuarios reales en beta cerrada | >= 30 |
| Reviews promedio en stores | >= 4.0 |

**Métricas vanity (no objetivo, solo curiosidad)**:
- Descargas
- Revenue por IAP cosmético
- DAU/MAU

---

## 13. Decisiones pendientes

Antes de Fase 1 hay que cerrar:

1. **Audiencia objetivo**: ¿LATAM hispanohablante? ¿bilingüe? ¿nicho específico (ADHD, recuperación, atletas)? Decide marketing y i18n priority.
2. **Hosting de Supabase**: free tier alcanza ~10k MAU. ¿En qué región? Decide latencia y privacidad.
3. **Política de datos**: ¿qué datos se sincronizan al backend? ¿hábitos sí, check-ins sí, anchors sí? ¿Algún dato sensible que no debería salir del dispositivo?
4. **Términos de privacidad**: GDPR / CCPA / LGPD aplican según mercado. Definir antes de tener usuarios reales.

---

## 14. Riesgos conocidos

| Riesgo | Mitigación |
|---|---|
| Mercado de habit trackers saturado, retención brutal | El proyecto NO depende del éxito comercial. Objetivo es portfolio, no revenue. |
| Sync con conflictos de concurrencia | Empezar con last-write-wins simple, escalar a CRDT solo si aparece dolor real |
| Sentry free tier (5k errors/mes) se agota | Sample rate 10% en producción, alertas para escalar antes de tope |
| Apple rechaza submission por algo del template | Beta cerrada extensa antes de submit; checklist de App Review guidelines |
| Supabase free tier insuficiente | Plan B: Firebase, plan C: backend propio en Hetzner $5/mes con Postgres |
| Burnout por proyecto largo solo | Treat revenue como vanity. Éxito = stack demostrado, no MRR |
