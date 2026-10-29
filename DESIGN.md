---
# DESIGN.md — Sistema de diseño de Bambú Tech Services
# Formato: tokens en YAML (front matter) + racional en Markdown (spec DESIGN.md de Google Labs)
name: bambu-tech-services
version: 1.0.0
description: >
  Identidad tecnológica de alto contraste: negro profundo, verde eléctrico como
  acento de marca y tipografía geométrica. Oscuro por defecto en pantallas,
  claro y sobrio en documentos impresos.

colors:
  brand:
    green-neon:        "#00FF00"   # verde de marca en pantallas oscuras (acento, glow, partículas)
    green-corporate:   "#52D93E"   # verde de marca en documentos y fondos claros (títulos, bordes)
    green-teal:        "#00C896"   # segundo tono, extremo de gradientes
    black:             "#000000"
    white:             "#FFFFFF"
    gray-text:         "#4D4D4D"   # texto de cuerpo en documentos
  dark:                            # modo por defecto en web, apps y presentaciones
    background:        "#000000"
    surface:           "#0D0D0D"   # cards
    surface-raised:    "#1A1A1A"   # cards secundarias, código, inputs
    surface-glass:     "rgba(20, 22, 20, 0.78)"
    ui-chrome:         "#0A0E0B"   # barras, toolbars
    border:            "rgba(255, 255, 255, 0.12)"
    border-accent:     "rgba(0, 255, 0, 0.50)"
    text-primary:      "#FFFFFF"
    text-secondary:    "#CCCCCC"
    text-muted:        "#8C968D"
    accent:            "#00FF00"
    accent-2:          "#00C896"
    accent-text:       "#00FF00"
    accent-subtle:     "rgba(0, 255, 0, 0.12)"
    accent-glow:       "rgba(0, 255, 0, 0.22)"
    on-accent:         "#000000"
    danger:            "#FF6A5C"
  light:
    background:        "#F4F8F4"
    backdrop:          "#E4EAE4"
    surface:           "#FFFFFF"
    surface-raised:    "#EEF3EE"
    surface-glass:     "rgba(255, 255, 255, 0.86)"
    ui-chrome:         "#FFFFFF"
    border:            "rgba(0, 0, 0, 0.10)"
    border-accent:     "rgba(0, 150, 30, 0.42)"
    text-primary:      "#0B110C"
    text-secondary:    "#3A443C"
    text-muted:        "#69736A"
    accent:            "#00C21A"   # rellenos, bordes, íconos
    accent-2:          "#009E7A"
    accent-text:       "#0A8A1F"   # verde para texto sobre claro (cumple AA)
    accent-subtle:     "rgba(0, 170, 30, 0.09)"
    accent-glow:       "rgba(0, 120, 20, 0.14)"
    on-accent:         "#FFFFFF"
    danger:            "#C0392B"
  document:                        # PDF / Word (A4)
    page:              "#FFFFFF"
    title:             "#52D93E"
    heading-bar-bg:    "#000000"
    heading-bar-text:  "#FFFFFF"
    body:              "#4D4D4D"
    table-header-bg:   "#000000"
    table-header-text: "#FFFFFF"
    table-row-alt:     "#F5F5F5"
    table-grid:        "#E0E0E0"
    table-border:      "#52D93E"
    code-bg:           "#1A1A1A"
    code-text:         "#A8E890"
  charts:
    dark:  ["#00FF00", "#00C896", "#8CFFB8", "#169C45", "#5E6B60"]
    light: ["#00B81A", "#00977A", "#4FC474", "#0B6B2C", "#98A39A"]

typography:
  families:
    brand:     "'Sansation', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"  # web, apps, presentaciones
    doc-body:  "'Lexend', 'Sansation', system-ui, sans-serif"                                # documentos: títulos y cuerpo
    doc-data:  "'Noto Sans', system-ui, sans-serif"                                          # documentos: tablas, metadatos
    mono:      "'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace"
  weights: { light: 300, regular: 400, bold: 700 }
  roles:                           # escala para pantallas (web / app)
    display:   { family: brand, size: 56px, weight: 700, line-height: 1.08, tracking: -0.005em }
    h1:        { family: brand, size: 40px, weight: 700, line-height: 1.15 }
    h2:        { family: brand, size: 30px, weight: 700, line-height: 1.2 }
    h3:        { family: brand, size: 22px, weight: 700, line-height: 1.25 }
    lead:      { family: brand, size: 20px, weight: 400, line-height: 1.4 }
    body:      { family: brand, size: 16px, weight: 400, line-height: 1.55 }
    label:     { family: brand, size: 14px, weight: 700, line-height: 1.3 }
    caption:   { family: brand, size: 13px, weight: 300, line-height: 1.4 }
    metric:    { family: brand, size: 64px, weight: 700, line-height: 1.0, numeric: tabular-nums }
    code:      { family: mono,  size: 14px, weight: 400, line-height: 1.6 }
  document-roles:                  # escala para PDF / Word (pt)
    cover-l1:     { family: doc-body, size: 28pt, weight: 700, color: "#000000" }
    cover-l2:     { family: doc-body, size: 22pt, weight: 700, color: "#52D93E" }
    section:      { family: doc-body, size: 15pt, weight: 700, color: "#52D93E" }
    heading-bar:  { family: doc-body, size: 11pt, weight: 700, color: "#FFFFFF", background: "#000000" }
    body:         { family: doc-body, size: 10pt, weight: 400, color: "#4D4D4D", leading: 15pt }
    table:        { family: doc-data, size: 9pt,  weight: 400, color: "#4D4D4D" }
    table-header: { family: doc-data, size: 9pt,  weight: 700, color: "#FFFFFF" }
    code:         { family: doc-data, size: 8.5pt, weight: 400, color: "#A8E890" }
    page-number:  { family: doc-data, size: 9pt,  weight: 400, color: "#4D4D4D" }

spacing:
  base: 4px
  scale: [0, 4, 8, 12, 16, 24, 32, 40, 48, 64, 96, 120]

radius:
  sm: 6px      # barras de progreso, chips
  md: 8px      # cards, botones, inputs (radio de marca)
  lg: 12px     # paneles, modales, media
  full: 9999px # badges numéricos, checks, avatares

borders:
  card: "1.5px solid var(--border-accent)"
  focus-ring: "0 0 0 1px var(--accent)"
  number-badge: "2.5px solid var(--accent)"

elevation:
  dark:
    none:  "none"
    glow:  "0 0 42px rgba(0, 255, 0, 0.22)"           # elemento activo / destacado
  light:
    card:  "0 8px 28px rgba(10, 40, 15, 0.06)"
    panel: "0 18px 50px rgba(10, 50, 15, 0.10)"
    glow:  "0 10px 34px rgba(0, 120, 20, 0.14)"

layout:
  container: 1200px
  reading-width: 720px
  sidebar-width: 272px
  breakpoints: { sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px }
  slide-canvas: { width: 1920px, height: 1080px, content: "1704x698px" }
  document-page: A4

motion:
  duration: { fast: 150ms, base: 350ms, reveal: 700ms, progress: 900ms }
  easing:   { brand: "cubic-bezier(0.2, 0.7, 0.2, 1)" }
  hover-lift: "translateY(-8px)"
---

# Sistema de diseño de Bambú Tech Services

## 1. Visión general

Bambú se ve como lo que es: una consultora de software y nube, técnica y confiable. El sistema descansa en tres ideas:

- **Negro y verde eléctrico.** El contraste máximo entre un fondo negro y un verde puro es la firma de la marca. En pantallas el modo oscuro es el predeterminado; el modo claro existe y se respeta, pero no es la cara principal.
- **El verde marca lo importante.** Bordes de tarjeta, números, cifras clave, estado activo, progreso. El texto corrido es blanco o gris, nunca verde.
- **Tecnología viva, no decorada.** El fondo de partículas verdes que flotan y el resplandor (`glow`) en el elemento activo dan movimiento. No se usan ilustraciones genéricas, emojis ni gradientes multicolor.

Tres contextos comparten la identidad con ajustes propios: **pantallas** (web, apps, dashboards), **presentaciones** (lienzo 16:9) y **documentos** (PDF y Word en A4).

## 2. Color

- **Dos verdes de marca según contexto.** `green-neon` (`#00FF00`) solo sobre negro, donde brilla y cumple contraste. Sobre blanco no es legible: en modo claro se usa `accent` (`#00C21A`) para rellenos y bordes y `accent-text` (`#0A8A1F`) para texto. En documentos impresos el verde oficial es `green-corporate` (`#52D93E`); no uses `#00FF00` en papel.
- **Superficies oscuras por capas:** `background` negro → `surface` `#0D0D0D` para cards → `surface-raised` `#1A1A1A` para código, inputs y cards secundarias. La jerarquía se construye con capas y bordes verdes, no con sombras.
- **Texto:** `text-primary` para contenido, `text-secondary` para descripciones, `text-muted` para metadatos y fuentes.
- **Gradiente permitido:** solo verde → teal (`accent` → `accent-2`) en barras de progreso, gráficas e íconos de marca. Nada de otros gradientes.
- **Gráficas:** usar la paleta `charts` del modo correspondiente en orden; el primer color siempre para la serie principal.
- **Contraste:** texto de cuerpo AA (4.5:1) en ambos modos. Revisa siempre los verdes en modo claro.

## 3. Tipografía

- **Sansation** es la voz de la marca en todo lo digital: títulos, cuerpo, botones, cifras. Pesos 300 (captions), 400 (cuerpo) y 700 (títulos, labels, cifras). La cursiva bold en verde se reserva para la segunda línea de portadas y el año en carátulas.
- **Lexend** (títulos y cuerpo) y **Noto Sans** (tablas, metadatos, código) son las fuentes de los documentos PDF/Word, con la escala `document-roles`.
- Cifras grandes en verde, bold y `tabular-nums`; son el recurso visual más fuerte de la marca.
- Mayúsculas con tracking solo en badges de portada y pies de diapositiva; nunca en botones, menús ni títulos de sección.
- En presentaciones el mínimo es 26px para texto y 36px para títulos de tarjeta.

## 4. Layout y espaciado

```
Pantalla (web / app)                     Documento (A4)
┌───────┬──────────────────────────┐     ┌───────────────────────────┐
│Sidebar│ Título            [CTA]  │     │[logo izq]       [logo der]│
│ chrome│ ┌──────┐┌──────┐┌──────┐ │     │ SECCIÓN (verde 15pt)      │
│       │ │ 128  ││ 94%  ││ 12   │ │     │ ▓ Barra negra · texto blanco│
│       │ │cifra ││cifra ││cifra │ │     │ Cuerpo gris Lexend 10pt   │
│       │ └──────┘└──────┘└──────┘ │     │ ┌ tabla: header negro ──┐ │
│       │ ┌─────────────────────┐  │     │ └ borde verde, filas alt┘ │
│       │ │ Card · borde verde  │  │     │                     [pág] │
│       │ └─────────────────────┘  │     │ ═══ barra footer marca ══ │
└───────┴──────────────────────────┘     └───────────────────────────┘
```

- Grid base de 4px. Separación entre cards 24–32px; entre secciones 64–96px.
- Texto alineado a la izquierda. Centrado solo en cifras destacadas, portadas y estados vacíos.
- Grids de 2×2, 3 o 4 columnas de cards; en móvil colapsan a una columna.
- Documentos: A4, cada sección o caso de uso inicia en página nueva; header con los dos logos y footer con la barra de marca y número de página a la derecha.

## 5. Formas, bordes y elevación

- **Radio de marca: 8px** para cards, botones e inputs. 12px para paneles y media; círculo completo para badges numéricos y checks.
- **Bordes como estructura:** card con `1.5px` en `border-accent`; al activarse, borde `accent` sólido más `glow`.
- En modo oscuro no hay sombras, solo resplandor verde en el elemento activo. En modo claro, sombras muy suaves con tinte verde (`elevation.light`).

## 6. Componentes

**Card**
`surface`, `radius.md`, borde `border-accent`, padding 32–40px. Título `h3` en `text-primary`, descripción `body` en `text-secondary`. Estado activo/hover: borde `accent`, `glow` y, en tarjetas de métrica, `hover-lift`.

**Badge numérico**
Círculo de 48–66px, borde `2.5px` `accent`, número bold en `accent-text`, fondo `background`. Solo para contenido realmente secuencial (pasos, fases).

**Métrica destacada**
Cifra `metric` en `accent-text`, label bold debajo en `text-primary`, descripción en `text-secondary`.

**Botones**
- Primario: fondo `accent`, texto `on-accent` (negro sobre neón; blanco sobre verde claro), bold, `radius.md`, alto 40px.
- Secundario: borde `2px` `accent`, fondo transparente, texto `text-primary`, bold.
- Ghost: sin borde, `text-secondary`; hover con `accent-subtle`.
- Foco visible siempre con `focus-ring`.

**Lista de verificación**
Ítems con check circular de borde verde a la izquierda; el ítem activo recibe borde `border-accent` y fondo `accent-subtle`. Las palabras clave en `text-primary` bold dentro de texto `text-secondary`.

**Línea de tiempo / progreso**
Línea base de 4px en `border`, relleno con gradiente `accent` → `accent-2` y glow; nodos circulares con borde verde y número.

**Tablas**
Pantalla: header `surface-raised` con texto bold, filas separadas por `border`, fila activa con `accent-subtle`. Documento: header negro con texto blanco, filas alternas `#F5F5F5`, rejilla `#E0E0E0` y contorno `#52D93E`.

**Código**
Fondo `#1A1A1A`, texto `#A8E890`, `radius.md`, en ambos modos y en documentos.

**Placeholder de media**
Borde punteado `2px` `border-accent`, fondo `accent-subtle`, texto `text-muted` centrado.

**Fondo de partículas**
Puntos verdes pequeños (~30 por pantalla, opacidad ~0.5) que flotan y titilan lentamente detrás del contenido en portadas, cierres y vistas de presentación. En apps de uso diario, solo en login, bienvenida y estados vacíos.

**Logos**
Usar solo los archivos oficiales (blanco sobre oscuro, gris sobre claro); nunca redibujar, recolorear a verde ni deformar.

## 7. Movimiento

- Revelado progresivo: elementos aparecen con fade + desplazamiento corto en `reveal` (700ms) con `easing.brand`.
- Hover de cards: elevación de 8px y glow en `base` (350ms).
- Progreso y gráficas: llenado animado en `progress` (900ms), una sola vez.
- Respetar `prefers-reduced-motion`: sin desplazamientos ni partículas; solo opacidad.

## 8. Voz y microcopy

- Español profesional mexicano, claro y directo; sentence case.
- Verbos concretos en botones: "Solicitar cotización", "Ver casos de uso", "Descargar propuesta".
- Cifras antes que adjetivos: "300+ proyectos" dice más que "amplia experiencia".
- Errores que explican qué pasó y cómo resolverlo, sin dramatismo.

## 9. Hacer / Evitar

| Hacer | Evitar |
|---|---|
| Negro con verde neón en pantallas | `#00FF00` sobre blanco o en impresos |
| `#0A8A1F` para texto verde en modo claro | Párrafos completos en verde |
| Cifras grandes en verde como protagonistas | Íconos genéricos o emojis como decoración |
| Bordes verdes finos para estructurar | Sombras grises pesadas en modo oscuro |
| Radio de 8px consistente | Mezclar radios sin jerarquía |
| Gradiente solo verde → teal | Gradientes multicolor o morados |
| Sansation en digital; Lexend/Noto en documentos | Mezclar familias fuera de su contexto |
| Partículas en portadas y estados vacíos | Animaciones en cada elemento de la pantalla |
