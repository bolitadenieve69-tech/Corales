---
trigger: always_on
---


# CoralApp — Reglas y Buenas Prácticas del Proyecto

> Fuente de verdad para el desarrollo de CoralApp.
> Versión: 1.0 | Marzo 2026

---

## 0. Contexto del Proyecto

CoralApp es una plataforma web y móvil para la **gestión y ensayo de agrupaciones corales**
y la **enseñanza de música a nivel básico**. Tres roles: Administrador, Director de Coro, Coralista.

Principios de producto:

- 🎵 **Moderno** — Visual limpio, tipografía expresiva, jerarquía clara.
- 🤝 **Asequible** — Interfaces que se explican solas. Sin asumir conocimientos musicales ni técnicos.
- 🏗️ **Robusto** — Sistema de componentes coherente. Todos los estados contemplados. A11y como base.

---

## 1. Stack Tecnológico Obligatorio

No añadir dependencias fuera de este stack sin consenso explícito.

### Frontend Web

- React 18 + TypeScript (strict: true, sin `any`)
- Tailwind CSS + CSS custom properties (tokens)
- Radix UI — componentes headless accesibles
- Framer Motion — animaciones con soporte prefers-reduced-motion
- Zustand — estado global
- TanStack Query v5 — fetching y caché de datos remotos
- OpenSheetMusicDisplay (OSMD) — renderizado de partituras MusicXML
- Tone.js — motor MIDI en el navegador
- react-i18next — i18n desde el día 1

### App Móvil

- React Native + Expo

### Backend

- Node.js + Fastify | PostgreSQL | Prisma | Redis
- AWS S3 o Cloudflare R2 — almacenamiento de archivos
- Resend o SendGrid — emails transaccionales

### Autenticación

- NextAuth.js o Auth0 (2FA + OAuth obligatorio)

---

## 2. Estructura de Carpetas (obligatoria)

```
src/
├── components/
│   ├── ui/           # Button, Input, Card, Badge, Modal, Toast…
│   ├── rehearsal/    # RehearsalPanel, VoiceMixer, Metronome, ScoreViewer, PlaybackBar
│   ├── library/      # ScoreCard, ScoreList, ScoreUploadForm, MidiAttachForm
│   ├── academy/      # LessonCard, LessonView, QuizBlock, ProgressBar, ModuleGrid
│   ├── seasons/      # SeasonCard, SeasonForm, RepertoireList, ProgramDndList
│   ├── choir/        # MemberList, InvitationForm, ClausCard
│   └── layout/       # Sidebar, BottomNav, Header, PageWrapper, Breadcrumbs
├── pages/            # Solo rutas, SIN lógica de negocio
├── hooks/            # usePlayback, useMetronome, useMidi, useScoreSync, useAuth…
├── store/            # playbackStore, uiStore, userStore (Zustand)
├── lib/              # Clientes API, utilidades puras
├── styles/           # tokens.css, reset.css, globals.css
└── types/            # Interfaces TypeScript globales de dominio
```

Un componente = un archivo. El archivo lleva el mismo nombre que el componente.

---

## 3. Convenciones de Código

### TypeScript

- Nunca usar `any`. Si el tipo es desconocido, usar `unknown` con type guards.
- Props siempre tipadas con `interface` nombrada.
- Modelos de dominio en `src/types/`.

```typescript
// ✅ Correcto
interface ScoreCardProps {
  score: Score;
  isActive?: boolean;
  onRehearseClick: (scoreId: string) => void;
}

// ❌ Incorrecto
const ScoreCard = ({ score, isActive, onRehearseClick }: any) => { ... }
```

### Nomenclatura

- Componentes React: PascalCase → `RehearsalPanel`
- Hooks: camelCase con prefijo `use` → `usePlayback`
- Stores: camelCase con sufijo `Store` → `playbackStore`
- Constantes globales: UPPER_SNAKE_CASE → `DEFAULT_BPM`
- CSS tokens: kebab-case con prefijo → `--color-primary-500`, `--space-4`

### Componentes React

- Lógica de negocio en hooks, NO en componentes.
- No prop drilling más de 2 niveles → usar store.
- No usar índices de array como `key` → usar IDs de dominio.
- Lazy loading obligatorio para módulos pesados (ensayo, academia, visor).

```typescript
// ✅ Correcto — lógica en hook
const RehearsalPanel = ({ scoreId }: RehearsalPanelProps) => {
  const { isPlaying, tempo, togglePlay } = usePlayback(scoreId);
  return <PlaybackControls isPlaying={isPlaying} tempo={tempo} onToggle={togglePlay} />;
};
```

### Estilos

- Tailwind para layout y utilidades. CSS custom properties para tokens.
- Nunca `style={{}}` inline salvo valores dinámicos imposibles de expresar con Tailwind.
- Nunca colores hexadecimales sueltos. Solo referencias a tokens de `tokens.css`.

---

## 4. Tokens de Diseño (tokens.css — fuente única de verdad)

```css
/* Primarios */
--color-primary-900: #0D1B2A;
--color-primary-800: #1A2E44;
--color-primary-700: #1F4068;
--color-primary-500: #2E75B6;   /* Acción primaria */
--color-primary-300: #6DAAD9;
--color-primary-100: #D6E9F8;

/* Acento */
--color-accent-500:  #F0A500;   /* CTA principal */
--color-accent-300:  #F7CB6E;
--color-accent-100:  #FEF3D7;

/* Neutrales */
--color-neutral-900: #0F0F0F;
--color-neutral-800: #1C1C1E;
--color-neutral-600: #4A4A5A;
--color-neutral-300: #C8C8D6;
--color-neutral-100: #F4F5F9;
--color-neutral-000: #FFFFFF;

/* Cuerdas vocales — INVARIABLES en toda la app */
--color-voice-soprano: #E8A0BF;
--color-voice-alto:    #F0A500;
--color-voice-tenor:   #4EA8DE;
--color-voice-bajo:    #6C5CE7;

/* Semánticos */
--color-success: #27AE60;
--color-warning: #E67E22;
--color-error:   #E74C3C;

/* Tipografía */
--font-display: 'Cormorant Garamond', serif;
--font-ui:      'DM Sans', sans-serif;
--font-mono:    'DM Mono', monospace;

/* Espaciado (múltiplos de 4px) */
--space-1:4px; --space-2:8px; --space-3:12px; --space-4:16px;
--space-5:20px; --space-6:24px; --space-8:32px; --space-10:40px;
--space-12:48px; --space-16:64px;

/* Radios */
--radius-sm:6px; --radius-md:10px; --radius-lg:16px;
--radius-xl:24px; --radius-full:9999px;

/* Sombras */
--shadow-sm:  0 1px 3px rgba(0,0,0,.08);
--shadow-md:  0 4px 12px rgba(0,0,0,.10);
--shadow-lg:  0 8px 24px rgba(0,0,0,.12);
--shadow-glow-accent:  0 0 20px rgba(240,165,0,0.35);
--shadow-glow-primary: 0 0 20px rgba(46,117,182,0.30);
```

> Los colores de cuerda vocal (`--color-voice-*`) son la firma visual de cada coralista.
> Deben ser consistentes en TODOS los módulos sin excepción.

---

## 5. Accesibilidad (A11y) — No Negociable

- Contraste mínimo: 4.5:1 texto normal, 3:1 texto grande (WCAG 2.1 AA).
- Foco visible siempre: `outline: 2px solid var(--color-accent-500)`. Nunca `outline: none` sin reemplazo.
- Área táctil mínima: 44×44px en móvil.
- Labels siempre presentes en formularios. Nunca solo placeholder.
- `aria-label` en todos los botones de icono sin texto visible.
- ARIA en sliders de voz, metrónomo, reproductor MIDI y visor de partitura.
- `prefers-reduced-motion`: todas las animaciones se desactivan o reducen.
- jest-axe obligatorio en todos los componentes de `src/components/ui/`.

```tsx
// ✅ Correcto
<button aria-label="Reproducir partitura" onClick={handlePlay}>
  <PlayIcon size={24} aria-hidden="true" />
</button>
// ❌ Incorrecto
<div onClick={handlePlay}><PlayIcon /></div>
```

---

## 6. Roles y Permisos

- Los permisos se validan SIEMPRE en el backend. La UI es orientativa, no de seguridad.
- El director solo puede gestionar su propio coro.
- El número clausus es un límite duro: el sistema lo impone aunque el enlace esté activo.
- Tokens de invitación: criptográficamente aleatorios, mínimo 32 bytes. No UUIDs simples.
- Rate limiting en todos los endpoints de auth, registro e invitación.

---

## 7. Módulo de Ensayo — Reglas Críticas

### Sincronización MIDI ↔ Partitura

- Latencia máxima tolerable: **100 ms**.
- Cursor siempre en `linear` (sin easing). El easing genera percepción de desincronización.
- Usar `requestAnimationFrame` para el cursor. Nunca `setInterval`.
- Referencia de tiempo: `Tone.Transport`. Nunca `Date.now()`.

### Control de voces

- 4 canales completamente independientes (S, A, T, B).
- Sliders usan `--color-voice-*`. Sin excepciones.
- Preset SOLO: silencia todo menos la voz seleccionada.
- Preset CORO: todas al 100%.
- Estado por defecto al abrir: CORO. Los presets no persisten entre sesiones.

### Metrónomo

- Independiente de la reproducción MIDI. Usable sin MIDI.
- Sincronización exacta con `Tone.Transport`.
- Primer tiempo diferenciado visualmente y sonoramente.
- Rango: 40–220 BPM. Compases fase 1: 2/4, 3/4, 4/4, 6/8.

### Bucle

- Definido por drag en la barra de progreso (compás inicio → fin).
- Al llegar al fin, vuelve automáticamente al inicio del bucle.

---

## 8. Biblioteca de Partituras

- Formatos de partitura: PDF, MusicXML (.xml, .mxl). Rechazar otros con error claro.
- Formatos MIDI: .mid, .midi. Rechazar otros.
- Tamaños máximos: partitura 50 MB · MIDI 10 MB.
- Límite por coro: 2 GB (plan básico).
- Máximo 5 MIDI por partitura: S, A, T, B y completo.
- Metadatos obligatorios: título y compositor.
- URLs de archivos: pre-signed con expiración máx. 1 hora. Nunca URLs públicas permanentes.

---

## 9. Academia

- 3 niveles: Iniciación, Elemental, Básico.
- Cada lección: texto + audio + cuestionario de 3–7 preguntas.
- El progreso persiste en BD. No se puede descompletar automáticamente.
- Los cuestionarios son de refuerzo, no bloquean el avance.

---

## 10. Estado Global

| Qué | Dónde |
|---|---|
| Reproducción (isPlaying, tempo, voiceVolumes, loopRange…) | `playbackStore` (Zustand) |
| UI (sidebar, modal activo, toasts) | `uiStore` (Zustand) |
| Sesión y perfil de usuario | `userStore` (Zustand) |
| Datos remotos (partituras, temporadas, lecciones…) | TanStack Query |

- No `useState` para estado compartido entre más de 2 componentes.
- No `fetch` directamente en componentes. Encapsulado en `src/lib/api/`.

---

## 11. Modo Oscuro

- Sigue `prefers-color-scheme: dark`. Override manual en perfil de usuario (persiste en BD).
- Implementado con `:root[data-theme="dark"]` sobre CSS custom properties.
- Nunca `#000000`. Usar `--color-primary-900` (#0D1B2A).
- Superficies elevadas más claras que el fondo (principio de elevación).
- `--color-accent-500` no varía entre modos.

---

## 12. Rendimiento

- Lazy loading obligatorio para academia, ensayo y visor de partitura.
- Partitura y MIDI se cargan bajo demanda, no en el listado.
- Renderizado OSMD en Web Worker.
- Paginación o scroll infinito en listas de más de 20 elementos.
- LCP objetivo: < 3s con 10 Mbps.
- Bundle inicial: < 200 KB gzipped.

---

## 13. Gestión de Errores y Estados de UI

Cada vista con datos remotos contempla siempre:

| Estado | Qué mostrar |
|---|---|
| Cargando | Skeleton loader + `aria-busy="true"` |
| Error | Mensaje legible + botón de reintento |
| Vacío | Ilustración + texto + CTA contextual |

- Nunca estado de interfaz indefinido o en blanco sin explicación.
- Errores de red: toast no bloqueante.
- Errores de validación: inline, bajo el campo afectado.
- Nunca exponer stack traces ni errores técnicos al usuario.

---

## 14. Animaciones

- `prefers-reduced-motion` obligatorio en todas las animaciones.
- Cursor de partitura: `linear` siempre.
- Pulsación del metrónomo: sincronizada al BPM con Tone.Transport.
- Apertura de modales: 220ms `cubic-bezier(0.34,1.56,0.64,1)`.
- Aparición de listas: 200ms + stagger 50ms por ítem.

---

## 15. i18n

- react-i18next desde el día 1.
- Ningún texto visible hardcodeado en componentes.
- Idioma por defecto: español. Inglés en Fase 2.

```tsx
// ✅ const { t } = useTranslation('rehearsal'); <button>{t('playback.play')}</button>
// ❌ <button>Reproducir</button>
```

---

## 16. Testing

- Cobertura mínima: 70% hooks y lógica de negocio · 50% componentes.
- Unitarios: Jest + Testing Library.
- Integración: Testing Library + MSW.
- E2E (Playwright): login, ensayo de voz, subida de partitura, invitación, lección de academia.
- A11y: jest-axe en todos los componentes de `src/components/ui/`.
- No se mergea código con tests rotos.

---

## 17. Git

### Ramas

```
main      → producción, siempre estable
develop   → integración
feature/* → nuevas funcionalidades
fix/*     → correcciones de bugs
release/* → preparación de release
```

### Conventional Commits

```
fe
