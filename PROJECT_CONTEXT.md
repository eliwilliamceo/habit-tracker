# PROJECT_CONTEXT

> Documento de entrada. Léelo primero. Contiene el qué, el porqué y el dónde
> mirar para detalles. Para arquitectura técnica ver `ARCHITECTURE.md`,
> para tareas pendientes `TODO.md`, para historia de decisiones `CLAUDE_HISTORY.md`.

---

## 1. Qué es

**Habit Tracker** — aplicación móvil (iOS + Android, React Native + Expo) para
construir hábitos consistentes mediante técnicas validadas de psicología del
comportamiento.

Funcionalidades centrales:

- Registro de hábitos con check-in diario y cálculo de racha
- Habit stacking (vincular cada hábito nuevo a una rutina existente como ancla)
- Múltiples recordatorios diarios por hábito (notificaciones locales)
- Dashboard de detalle con racha actual, mejor racha, total, % últimos 30 días
  y heatmap visual de 5 semanas
- Tema claro/oscuro siguiendo la preferencia del sistema
- Localización en español e inglés
- Onboarding de 3 pantallas para nuevos usuarios

---

## 2. Para qué se construye

Este proyecto tiene **tres objetivos en orden de prioridad** definidos tras una
decisión estratégica explícita el 2026-05-08 (ver `CLAUDE_HISTORY.md`):

### Objetivo 1 — Vehículo de aprendizaje del ciclo completo de un producto móvil

Cubrir auth, sync con backend, IAP, push notifications reales, crash reporting,
analytics, ASO, soporte y distribución en stores. **Aprender haciendo, no leyendo.**

### Objetivo 2 — Portfolio profesional ejecutado a nivel producción

Una app shipped en App Store y Google Play que sirva como prueba tangible de
capacidad full-stack móvil. **El propósito último es generar oportunidades de
freelance / B2B / contrato** — donde el revenue real está, no en el long tail
de habit trackers.

### Objetivo 3 — Side project con monetización simbólica opcional

IAP cosmético (temas extra, badge "Supporter") para implementar el pipeline
completo de pagos sin gatekear valor real. **La monetización no es objetivo
primario; el revenue será métrica vanity.**

---

## 3. Lo que NO es objetivo

- Competir con Streaks, Habitify, Productive en el mercado masivo de habit
  trackers (saturado, distribución power-law desfavorable, churn brutal).
- Generar ingreso suficiente para sustituir un salario.
- Maximizar conversión de usuarios free a pago.
- Convertirse en empresa o equipo.

Tener esto explícito evita scope creep y decisiones equivocadas.

---

## 4. Audiencia y posicionamiento

- **Idioma principal**: español (LATAM y España). Inglés disponible vía i18n
  para no cerrar el mercado anglosajón, pero la marca y el copy se piensan en
  español.
- **Perfil de usuario imaginado**: persona adulta que ya conoció *Atomic Habits*
  de James Clear o ideas similares y quiere una herramienta minimalista,
  honesta y bonita.
- **Diferenciación de marketing**: posicionamiento en psicología del
  comportamiento (habit stacking, identidad, racha como refuerzo). Es una
  historia, no un moat técnico — competidores pueden copiar.

---

## 5. Modelo de negocio

| Decisión | Valor |
|---|---|
| Pricing del core | **Gratis** (todas las funciones, sin anuncios) |
| Monetización | IAP **cosmético opcional** (temas extra) ~$2.99 lifetime |
| Telemetría | Sentry para errores + analytics minimalista (PostHog/Mixpanel) |
| Servidor | Supabase (free tier) cuando entre Fase 1 |
| Hosting de pagos | RevenueCat (free tier hasta $10k MRR) |

**El revenue esperado es residual.** El ROI real del proyecto se mide en
oportunidades de freelance/B2B/contrato que abra el portfolio una vez
publicado.

---

## 6. Estado actual (2026-05-09)

| Bloque | Estado |
|---|---|
| Fase 0 — Cierre técnico (editar, Sentry, i18n, onboarding, multi-recordatorios) | Completa |
| Camino B — Distribución | En progreso (iconos generados; EAS Build setup pendiente) |
| Fase 1 — Backend + auth + sync | Pendiente (se evalúa orden tras shipping inicial) |
| Fase 2 — IAP cosmético | Pendiente |
| Fase 3 — Push reales | Pendiente |
| Fase 5 — Posicionamiento (LinkedIn, ShowHN) | Pendiente |

Ver `TODO.md` para el detalle granular.

---

## 7. Decisión clave en curso

Tras cerrar Fase 0, se eligió **Camino B**: shippear la app a stores *antes*
de implementar sync con backend.

Razones:

1. La app está funcionalmente lista — posponer publicación es perfeccionismo,
   no ingeniería.
2. ASO, screenshots, submission y soporte real son skills concretos que solo
   se aprenden haciendo.
3. Sin usuarios reales, Fase 1 (sync) es ejercicio académico — con usuarios,
   se sabe qué construir realmente.
4. Habit trackers exitosos vivieron años sin sync (precedente: Streaks).
5. Costo psicológico de "casi listo" durante meses es real.

La narrativa para el usuario: "v1 es local-only por privacidad — tus datos
viven solo en tu dispositivo". Posición legítima y consistente con la
ausencia actual de backend.

---

## 8. Dónde mirar para detalles

- **Arquitectura técnica + modelo de datos + decisiones de ingeniería** →
  `ARCHITECTURE.md`
- **Tareas pendientes ordenadas por fase, con esfuerzos estimados** →
  `TODO.md`
- **Bitácora cronológica de sesiones de trabajo con Claude, decisiones
  tomadas y por qué** → `CLAUDE_HISTORY.md`
- **Borrador inicial unificado (legacy, puede deprecarse)** → `PROJECT.md`
- **Información legal (privacy + terms)** → ver pantalla `LegalScreen.tsx` o
  navegar a Privacidad·Términos desde el footer de la Home

---

## 9. Contacto

Desarrollador: eliwilliamceo@gmail.com
