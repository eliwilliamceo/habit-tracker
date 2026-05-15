# CLAUDE_HISTORY

> Bitácora cronológica de las sesiones de trabajo con Claude (asistente IA).
> Útil para: contexto en futuras sesiones, trazabilidad de decisiones, y
> recordar por qué algo se hizo como se hizo.
>
> Formato de cada entrada: fecha · qué se hizo · decisiones tomadas · notas.

---

## Sesión 1 — Análisis inicial + check-in dedupe (2026-05-08)

**Punto de partida**: app heredada con scaffolding de `create-expo-app`. Funcionalidades básicas: CRUD de hábitos, check-in diario, racha. SQLite local. Spanish hardcoded everywhere. Sin tests, sin Sentry, mucho boilerplate del template.

**Acciones**:
- Análisis general del proyecto y stack.
- Detectado bug crítico: la tabla `checkins` no tenía constraint UNIQUE, taps rápidos al ✓ creaban filas duplicadas y rompían el cálculo de racha.
- Implementado UNIQUE(habitId, date) con migración de dedupe + `INSERT OR IGNORE` defensivo en el servicio.
- UI: botón ✓ se pone verde + deshabilita cuando ya hay check-in del día.

**Decisión clave**: tratar la deuda técnica antes de añadir features nuevas. "Cerrar lo empezado antes de abrir frente nuevo".

---

## Sesión 2 — Memoria del path del proyecto (2026-05-08)

**Contexto**: el usuario notó que la sesión inicial tenía la ruta confundida (`portfolio-habit-app` vs el verdadero `portfolio-habit-app/habit-tracker`).

**Acciones**:
- Guardado en memoria (`~/.claude/projects/.../memory/`) el path real del proyecto y un overview general.
- A partir de aquí, futuras sesiones cargan ese contexto al arrancar.

---

## Sesión 3 — Recordatorios completos (2026-05-08)

**Acciones**:
- Reescrito `notificationService` para API moderna SDK 54 (`shouldShowBanner`/`shouldShowList` reemplazando deprecated `shouldShowAlert`).
- Cancelación granular por hábito (antes el código llamaba `cancelAllScheduledNotificationsAsync` antes de cada schedule → bug: añadir un 2º recordatorio borraba los previos).
- UI: chips de presets (Mañana/Mediodía/Tarde/Antes de dormir) + opción Personalizado con HH:MM.
- App.tsx reprograma todos los recordatorios al arrancar (resilencia ante limpieza del SO).
- Badge en la Home mostrando hora del recordatorio.
- Log de debug en `__DEV__` para ver notifs programadas en consola Expo.

---

## Sesión 4 — Limpieza profunda del template (2026-05-08)

**Decisión**: limpiar todo el boilerplate del `create-expo-app` que no se usaba.

**Acciones**:
- Eliminados 11 archivos boilerplate (themed-text, parallax-scroll-view, external-link, etc.).
- Eliminadas carpetas: `src/components/ui/`, `src/hooks/`, `constants/`.
- Reorganizado `assets/` de `src/assets/` a raíz (convención Expo).
- `npm uninstall` de 12 paquetes directos (51 incluyendo transitivos): expo-router, expo-symbols, expo-web-browser, nativewind, tailwindcss, async-storage, expo-device, expo-image, expo-font, @expo/vector-icons, expo-linking, expo-secure-store.
- `app.json` y `tsconfig.json` saneados.

**Mantenidos para uso futuro**: expo-haptics, react-native-reanimated (paso 7 polish), react-dom + react-native-web (preview web).

---

## Sesión 5 — Borrar hábitos (2026-05-08)

**Acciones**:
- Long-press en tarjeta de la Home → confirmación con `Alert` nativo → cascade delete (habit + checkins + reminder + notif cancelada).
- Hint visible bajo la lista para descubrimiento.
- Haptic medio al iniciar long-press.

---

## Sesión 6 — Habit stacking (anchor) (2026-05-08)

**Acciones**:
- Columna `anchor` (TEXT, nullable) en `habits` con migración segura vía `PRAGMA table_info`.
- Sección "Vincular a una rutina" en el form con prefijo fijo "Después de" + input libre con `maxLength: 60`.
- Badge "🔗 Después de X" debajo del nombre en cada tarjeta cuando hay ancla.

**Decisión**: anchor es texto libre (no dropdown de hábitos existentes). Para v1 esto evita complejidad y permite anclar a rutinas no-trackeadas ("después del café"). Si en feedback emergen ancla = otros hábitos, se puede iterar.

---

## Sesión 7 — Bug DB singleton (2026-05-08)

**Síntoma**: tap rápido al check-in tiraba `NullPointerException` en `execAsync`.

**Diagnóstico**: cada operación llamaba `initDB()`, que ejecutaba todas las migraciones. Con taps rápidos, múltiples `initDB()` corrían en paralelo sobre la misma conexión → el módulo nativo de expo-sqlite no maneja bien la concurrencia interna en multi-statement execs.

**Fix**: convertir `initDB` en singleton cacheando la promesa de inicialización. Llamadas concurrentes durante el primer arranque comparten el mismo `await`, migraciones corren exactamente una vez por sesión. Si el setup falla, se permite reintentar.

**Aprendizaje**: bug latente desde el paso 1. El paso 5 (habit stacking) añadió `PRAGMA + ALTER` a la cadena de migraciones y aumentó el tiempo total de `initDB`, lo que destapó la race condition.

---

## Sesión 8 — Dashboard de progreso (2026-05-08)

**Acciones**:
- Nueva pantalla `HabitDetailScreen` con hero (racha actual), 3 stat cards (Mejor racha, Total, % últimos 30d), heatmap 5×7 alineado a Lunes-Domingo.
- `useFocusEffect` para refresco automático de stats al volver a la pantalla.
- Tap en tarjeta de la Home → navega a detail.
- Si el hábito se elimina mientras está abierto el detail, `useEffect` detecta y hace `goBack()`.

**Decisión de scope**: 5 semanas (35 celdas) en el heatmap. Suficiente para portfolio, no abrumador. Si el usuario quiere histórico completo, se añade en una vista expandida después.

---

## Sesión 9 — Fix de timezone (2026-05-08)

**Síntoma reportado por el usuario**: "marco hoy y queda marcado en sábado que es mañana".

**Diagnóstico**: `new Date().toISOString().split('T')[0]` devuelve UTC. Para timezones al oeste de UTC, en horas de la noche local, el resultado es el día siguiente.

**Fix**: util `localDateStr()` que usa `getFullYear/getMonth/getDate` (locales). Reemplazado en todo el código (recordCheckIn, streakCalculator, heatmap, HomeScreen). Verificado por grep que cero `toISOString` queda en lógica de fechas.

**Aprendizaje**: bug clásico. Documentar el helper con comentario explícito de por qué existe, así no se vuelve a introducir.

---

## Sesión 10 — Polish táctil (2026-05-08)

**Acciones**:
- Animación spring del botón ✓ con `withSequence + withTiming + withSpring`.
- Haptics: `Success` en check-in y save, `Medium` en long-press.
- Empty state mejorado: icono Target en círculo + título + subtítulo + CTA grande.

---

## Sesión 11 — Dark mode (2026-05-08)

**Acciones**:
- Paletas duales `lightColors` / `darkColors` con tokens semánticos (streakBg, reminderBg, surfaceAlt, etc.).
- Hook `useThemeColors()` lee `useColorScheme()` del SO — sin context provider.
- Refactor de los 3 screens a `makeStyles(colors)` con `useMemo`.
- `NavigationContainer` con tema dinámico (background/card/text/border).
- `StatusBar` se adapta automáticamente.

**Decisión**: seguir SO automáticamente, sin toggle manual en v1. Si demanda emerge en feedback, añadir toggle en una pantalla Settings futura.

---

## Sesión 12 — Identidad visual: Logo + Splash (2026-05-08)

**Acciones**:
- Componente `<Logo />` reutilizable: cuadrado redondeado primary + Flame blanca + sombra coloreada.
- `<SplashOverlay />` animado con Reanimated: logo entra con spring, texto fade-in con translateY, hold 2s (luego ajustado a 2s tras feedback de "se va muy rápido"), fade-out 550ms.
- Wiring con `expo-splash-screen.preventAutoHideAsync()` para evitar parpadeo nativo→JS.
- `assets/icon-source.svg` con instrucciones inline para exportar a los 6 PNGs nativos.

**Pendiente entonces**: exportar el SVG a PNGs (se hizo en sesión 21).

---

## Sesión 13 — Pulido: leyenda del heatmap removida (2026-05-08)

**Contexto**: el usuario notó la leyenda "Menos / Más" del heatmap y preguntó qué hacía.

**Diagnóstico**: era decorativa, copiada de heatmaps tipo GitHub que tienen intensidades. Nuestro heatmap es binario (cumplido/no cumplido) → confusa.

**Acción**: eliminada la leyenda + estilos asociados (`legend`, `legendText`).

---

## Sesión 14 — Tiempo del splash aumentado (2026-05-08)

**Contexto**: el usuario notó que el splash desaparecía muy rápido.

**Acción**: `HOLD_MS` aumentado de 1100ms a 2000ms. `FADE_OUT_MS` de 480 a 550. Total visible pasó de ~2.3s a ~3.2s.

---

## Sesión 15 — 6 mejoras de QoL (2026-05-08)

**Acciones**:
1. Eliminado el feature incompleto "Días específicos" (toggle decorativo sin implementación).
2. Saludo dinámico ("Buenos días/tardes/noches") + fecha en español ("Viernes, 8 de mayo") usando `Intl.DateTimeFormat`.
3. Badge de progreso del día ("Hoy: 2 de 5") en el header.
4. Hábitos nuevos van al principio de la lista.
5. Pendientes arriba, completados abajo (sort estable).
6. Botón Save deshabilitado cuando el form es inválido.

**Decisión arquitectónica**: `completedToday` ahora vive en el store (calculado en `getAllHabits` via LEFT JOIN a checkins de hoy), no en cada `HabitCard`. Beneficios: 1 query en vez de N, el sort y el progreso del día son derivados directos del store, re-ordenamiento automático tras check-in.

---

## Sesión 16 — Pivot estratégico (2026-05-08)

**Contexto**: el usuario preguntó "¿cómo convierto esto de portfolio a producto monetizable?".

**Acciones**:
- Análisis honesto del mercado de habit trackers: saturado, power-law del revenue, churn brutal, CAC > LTV.
- Identificado lo que falta para producto pago: auth + sync, IAP, push reales, crash reporting, analytics, legal, onboarding, edición, ASO, distribución.
- Roadmap propuesto en 5 fases (Fase 0 cierre técnico → Fase 5 posicionamiento).
- Sugerencias de pricing si se va por monetización.

---

## Sesión 17 — Recomendación sobre el nicho (2026-05-08)

**Contexto**: el usuario pidió opinión honesta sobre si invertir en este nicho.

**Recomendación dada**: probablemente NO es buen nicho para inversión grande, salvo que tengas (1) audiencia preexistente, (2) acceso a canal B2B, o (3) nicho hiper-específico no cubierto. Matemáticas brutales: CAC $8-30 vs LTV $20-40, mercado saturado, top 10 toman 95% del revenue.

**Alternativas propuestas**: pivot a B2B con la misma base, productized service ("build me a habit app"), vertical SaaS en otro nicho, o seguir como portfolio + side project.

---

## Sesión 18 — Decisión estratégica final (2026-05-08)

**Contexto**: el usuario eligió combinar dos enfoques compatibles:
- **Vehículo de aprendizaje** del ciclo completo (auth, IAP, marketing, ASO, soporte).
- **Portfolio + side project**: terminar a buen nivel, ponerlo gratis, usarlo para conseguir freelance/B2B.

**Decisión clave**: monetización simbólica vía **IAP cosmético** (temas extra) — no gatekear valor real. Permite implementar el pipeline IAP completo (RevenueCat, restore purchases, recibos) sin culpa moral ni churn presión.

**Resultado**: la app se trata como portfolio. Revenue = vanity metric. El ROI real son las oportunidades de freelance/B2B que abre tener una app shipped a stores con stack completo.

---

## Sesión 19 — `PROJECT.md` inicial (2026-05-09)

**Acción**: creado `PROJECT.md` como documento técnico/estratégico unificado con 14 secciones (objetivo, estado, stack, arquitectura, modelo de datos, features, estructura, convenciones, setup, roadmap, no-goals, métricas, decisiones pendientes, riesgos).

**Nota**: este archivo después fue parcialmente reemplazado por la separación en 4 docs (PROJECT_CONTEXT, ARCHITECTURE, TODO, CLAUDE_HISTORY) en la sesión 22. Queda como legacy.

---

## Sesión 20 — Fase 0 completa (2026-05-09)

Fase 0 completada en una sola sesión larga:

- **Editar hábito**: pantalla CreateHabit en modo dual (crear/editar), reconciliación automática del recordatorio.
- **Sentry**: integración condicional (no-op si no hay DSN en `.env`).
- **Privacy + Terms**: `LegalScreen` con 8 secciones de privacy + 9 de terms, disclaimer recomendando revisión legal por jurisdicción, link discreto en footer de Home.
- **i18n ES + EN**: stack `i18next + react-i18next + expo-localization`, ~85 strings, pluralización, interpolación, `Intl.DateTimeFormat(i18n.language)`.
- **Onboarding 3 pantallas**: swipe horizontal con FlatList paginada, dots indicador, skip + next/start, fade-out al finalizar. Persistencia via tabla `app_settings(key, value)` en SQLite (key versionada `onboarding_seen_v1`).
- **Múltiples recordatorios por hábito**: migración schema 1:1 → 1:N (rename + recreate + copy + drop), service rediseñado, identifier de notif por `reminderId` no `habitId`, UI multi-toggle de chips + custom-add con detección de duplicados.

**Decisión de UX**: en `HomeScreen`, badge de recordatorios muestra hora si hay 1, `×N` si hay ≥2.

---

## Sesión 21 — Camino B arrancado: iconos + EAS setup (2026-05-09)

**Contexto**: tras cerrar Fase 0, decidido camino B (shippear antes de backend).

**Acciones**:
- Instalado `@resvg/resvg-js` (dev dep, ~5MB, sin compilación nativa).
- Script `scripts/generate-icons.js` con 3 variantes SVG (full icon, flame-only, solid bg) → 6 PNGs nativos. Accesible via `npm run generate-icons`.
- Verificación visual de los 6 PNGs generados.
- Instalado `eas-cli` global (514 paquetes — proceso de 4min).
- **Pendiente**: usuario debe hacer `eas login`, decidir bundle ID + nombre final, luego se configura `app.json` + `eas.json` y se dispara primera build de prueba.

---

## Sesión 22 — Reorganización de docs (2026-05-09)

**Acción**: creados 4 archivos de documentación complementarios:
- `PROJECT_CONTEXT.md` — qué + por qué + estado actual
- `ARCHITECTURE.md` — técnico profundo + decisiones de ingeniería
- `TODO.md` — pendientes priorizados por fase
- `CLAUDE_HISTORY.md` — este archivo, bitácora cronológica

`PROJECT.md` queda como legacy. Puede deprecarse cuando se confirme que los 4 nuevos cubren todo.

---

## Cómo usar este archivo

- Al iniciar una sesión nueva con Claude, **referenciar este archivo** para que tenga contexto histórico.
- Al terminar una sesión, **añadir una entrada** describiendo qué se hizo, qué se decidió y por qué. No incluir detalles minuto a minuto — solo los hitos.
- Las decisiones controversiales o que cuesta recordar el por qué deben quedar especialmente documentadas.
