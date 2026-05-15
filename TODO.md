# TODO

> Lista de tareas pendientes organizada por fase. Para contexto del por qué
> de cada fase ver `PROJECT_CONTEXT.md`. Para detalle técnico de lo ya
> hecho ver `ARCHITECTURE.md`. Para historia de decisiones ver
> `CLAUDE_HISTORY.md`.

Última actualización: 2026-05-09

---

## En foco AHORA — Camino B (distribución)

Decisión tomada: shippear la app a stores antes de implementar backend/sync.
Razones documentadas en `PROJECT_CONTEXT.md` sección 7.

### Punto 1 — Iconos nativos
- [x] SVG fuente del logo creado (`assets/icon-source.svg`)
- [x] Script generador con `@resvg/resvg-js` (`scripts/generate-icons.js`)
- [x] 6 PNGs generados: `icon`, `splash-icon`, `favicon`,
      `android-icon-foreground/background/monochrome`
- [x] Script accesible vía `npm run generate-icons`

### Punto 2 — EAS Build setup (EN PROGRESO)
- [x] `eas-cli` instalado globalmente
- [x] Cuenta Expo creada por el usuario
- [ ] **Decisión pendiente**: bundle identifier / package name (`com.eliwilliam.habittracker` u otro)
- [ ] **Decisión pendiente**: nombre final de la app en la store
- [ ] `eas login` (interactivo — debe hacerlo el usuario)
- [ ] `eas init` para linkear proyecto a la cuenta Expo
- [ ] Actualizar `app.json` con `ios.bundleIdentifier`, `android.package`, `name` final
- [ ] Crear `eas.json` con perfiles `preview` (APK Android) y `production`
- [ ] Primera build de prueba: `eas build --profile preview --platform android`
- [ ] Verificar APK instalando en dispositivo físico

### Punto 3 — Screenshots para stores
- [ ] Capturar Home (vacía con CTA + con hábitos + completados)
- [ ] Capturar Create habit con form completo
- [ ] Capturar HabitDetail con racha alta + heatmap activo
- [ ] Capturar onboarding (3 slides)
- [ ] Generar para los tamaños requeridos:
  - iPhone 6.7" (1290×2796)
  - iPhone 6.5" (1242×2688)
  - iPhone 5.5" (1242×2208) — aún requerido por App Store en algunos casos
  - iPad Pro 12.9" (2048×2732)
  - Android phone (1080×1920 mínimo)
  - Android tablet (opcional)
- [ ] Considerar AppFigures, Screenshot Builder o Figma para frames

### Punto 4 — ASO research + descripción + keywords
- [ ] Investigar keywords de habit trackers en español (tools: AppFigures
      trial, Sensor Tower, búsqueda manual en App Store)
- [ ] Decidir nombre final con keywords (ej. "Hábitos: rutinas y rachas")
- [ ] Escribir descripción larga (4000 chars max App Store)
- [ ] Escribir descripción corta / promotional text
- [ ] Lista de keywords (App Store, 100 chars)
- [ ] Subtitle (App Store, 30 chars)
- [ ] What's New text para release 1.0
- [ ] Traducir a inglés y subir EN como locale secundario

### Punto 5 — Cuentas de developer
- [ ] Cuenta Apple Developer ($99/año) — registro y verificación tarda 1-3 días
- [ ] Cuenta Google Play Console ($25 una vez) — verificación 1-3 días
- [ ] Configurar perfiles de pago, fiscal, etc.

### Punto 6 — Beta cerrada
- [ ] Build de producción en EAS
- [ ] Subir a TestFlight (iOS) e Internal Testing (Play Console)
- [ ] Reclutar 10-20 testers reales (no familia/amigos cercanos — gente que sí lo va a usar)
- [ ] Recolectar feedback durante 1-2 semanas
- [ ] Iterar bugs y mejoras prioritarias
- [ ] Confirmar crash-free rate > 99% en Sentry

### Punto 7 — Submission y release
- [ ] Submit a App Store Review (revisión 24h-7 días)
- [ ] Submit a Play Console (revisión más rápida, suele ser horas-1 día)
- [ ] Responder posibles rejection notes y resubmit
- [ ] Release público en ambas stores
- [ ] LinkedIn post de lanzamiento

---

## Fase 1 — Backend + cuentas (POST shipping)

A evaluar después de tener usuarios reales en v1 local-only y entender qué
demanda realmente sync.

Stack planeado: **Supabase** (Postgres + Auth + Realtime, free tier).

- [ ] Auth: email + Apple Sign In (obligatorio para App Store) + Google
- [ ] Esquema en Postgres equivalente a SQLite local
- [ ] Sync delta offline-first con last-write-wins
- [ ] Recovery flow (cambio de teléfono → login → vuelven hábitos)
- [ ] RLS policies para aislamiento por usuario

Esfuerzo estimado: 3-5 semanas part-time.

---

## Fase 2 — IAP cosmético (POST sync, opcional)

Stack: RevenueCat free tier.

- [ ] Tier gratis: todo funcional, ilimitado
- [ ] Tier "Supporter" cosmético: 2-3 temas extra + badge en perfil
- [ ] Pricing simbólico: $2.99 lifetime o $0.99/mes
- [ ] Restore purchases flow
- [ ] Pantalla Settings con "Become a supporter"

Esfuerzo estimado: 1 semana.

---

## Fase 3 — Push reales (paralelo a Fase 1)

- [ ] Expo Push Service tokens almacenados por usuario en Supabase
- [ ] Edge Function en Supabase que dispara recordatorios server-side
- [ ] Fallback / coexistencia con notificaciones locales

Esfuerzo estimado: 3-5 días.

---

## Fase 5 — Posicionamiento (continuo)

- [ ] Landing page simple (Webflow, Notion, o Next.js)
- [ ] LinkedIn post bien armado con screenshots + stack + lecciones
- [ ] Show HN ("Show HN: I built a habit tracker grounded in behavioral psychology")
- [ ] Reddit r/iOSProgramming, r/reactnative ("Lessons shipping my first prod app")
- [ ] **NO** spend en ads — el producto es portfolio, no negocio

---

## No-goals (NO entran salvo cambio de estrategia)

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

---

## Decisiones estratégicas pendientes

Documentadas en `PROJECT_CONTEXT.md` también:

1. **Audiencia objetivo concreta**: ¿LATAM hispanohablante general? ¿bilingüe?
   ¿nicho específico (ADHD, recuperación, atletas)?
2. **Hosting de Supabase**: free tier alcanza ~10k MAU. ¿Región?
3. **Política de datos**: ¿qué sincroniza al backend cuando entre Fase 1?
4. **Términos de privacidad**: GDPR / CCPA / LGPD según mercado. Revisar
   antes de tener usuarios reales en backend.

---

## Métricas de éxito

Dado el objetivo del proyecto (portfolio + side project, no producto
comercial competitivo), las métricas relevantes:

| Métrica | Target |
|---|---|
| App publicada en App Store y Google Play | Sí / No |
| Stack completo demostrado (auth, sync, IAP, push, analytics, ASO) | Sí / No |
| Crash-free rate (Sentry) | > 99.5% |
| Conversaciones B2B/freelance generadas en 12 meses | >= 3 |
| Usuarios reales en beta cerrada | >= 30 |
| Reviews promedio en stores | >= 4.0 |

**Métricas vanity (no objetivo, solo curiosidad)**: descargas, revenue por
IAP cosmético, DAU/MAU.
