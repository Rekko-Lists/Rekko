# Rekko — CLAUDE.md

## Qué es Rekko

Rekko es una **plataforma social de anime** (SPA web). Los usuarios pueden:

- Descubrir y explorar anime (catálogo, temporadas, géneros, filtros)
- Gestionar su lista personal de anime (añadir, puntuar, marcar estado)
- Publicar posts relacionados con animes (texto + imagen del usuario + portadas de animes relacionados)
- Dar like, comentar y compartir posts del feed social
- Ver un leaderboard de reputación de la comunidad
- Jugar a Animedle (juego tipo Wordle para adivinar animes)
- Consultar su perfil y el de otros usuarios

**Referencia de diseño:** Ver `README.md`, `colors_and_type.css` y `ui_kits/rekko/index.html` para el sistema visual completo. El Figma original es `Rekko.fig`.

---

## Stack tecnológico

| Capa          | Tecnología                        | Notas                                      |
| ------------- | --------------------------------- | ------------------------------------------ |
| Framework     | **React 18**                      | Hooks only, no class components            |
| Build         | **Vite**                          | `vite.config.js` en raíz                   |
| Estilos       | **Tailwind CSS v3** + **DaisyUI** | Ver sección de estilos                     |
| Routing       | **React Router v6**               | `createBrowserRouter` + `<RouterProvider>` |
| Estado global | **Zustand**                       | Un store por dominio                       |
| Custom hooks  | Sí                                | Separar lógica de UI siempre               |
| Fuente        | **Gabarito** (variable font)      | `fonts/Gabarito-VariableFont_wght.ttf`     |
| Iconos        | **Lucide React**                  | `lucide-react` package                     |

---

## Estructura de carpetas

```
rekko/
├── public/
│   └── fonts/
│       └── Gabarito-VariableFont_wght.ttf
├── src/
│   ├── assets/                  # Logos, imágenes de marca
│   │   ├── rekko_logo.png
│   │   ├── rekko_sword.png
│   │   └── ...
│   ├── components/              # Componentes reutilizables
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   └── MainLayout.jsx
│   │   ├── ui/
│   │   │   ├── Button.jsx
│   │   │   ├── AnimeCard.jsx
│   │   │   ├── PostCard.jsx
│   │   │   ├── Avatar.jsx
│   │   │   └── Badge.jsx
│   │   └── shared/
│   │       └── AnimeCovers.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Feed.jsx
│   │   ├── Explore.jsx
│   │   ├── Animes.jsx
│   │   ├── List.jsx
│   │   ├── Profile.jsx
│   │   └── Animedle.jsx
│   ├── router/
│   │   └── index.jsx            # createBrowserRouter config
│   ├── store/
│   │   ├── useAuthStore.js      # Usuario autenticado, sesión
│   │   ├── useAnimeStore.js     # Lista personal, catálogo
│   │   └── useFeedStore.js      # Posts, likes, comentarios
│   ├── hooks/
│   │   ├── useAnimeSearch.js    # Lógica de búsqueda + filtros
│   │   ├── useAnimeList.js      # CRUD lista personal
│   │   ├── useFeed.js           # Fetch + paginación del feed
│   │   └── useProfile.js        # Datos de perfil de usuario
│   ├── lib/
│   │   └── api.js               # Fetch wrapper / cliente API
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

---

## Convenciones de estilos

### Tailwind + DaisyUI como CSS Modules

Aunque no usamos CSS Modules literalmente, el patrón es el mismo: **cada componente tiene sus clases agrupadas en constantes locales** al principio del archivo. Esto permite editar estilos como si fueran módulos sin perder la co-localización de Tailwind.

```jsx
// Button.jsx — ejemplo del patrón
const styles = {
  base: "font-gabarito inline-flex items-center justify-center gap-2 transition-opacity",
  primary:
    "bg-gradient-to-b from-slate-500 to-gray-900 text-white rounded-[10px] h-[50px] px-8 text-2xl",
  pill: "bg-gradient-to-b from-slate-500 to-gray-900 text-white rounded-full h-[50px] px-6 text-xl",
  amber: "bg-amber-600 text-white rounded-[5px] h-[26px] px-3 text-base",
};

export function Button({ variant = "primary", children, ...props }) {
  return (
    <button className={`${styles.base} ${styles[variant]}`} {...props}>
      {children}
    </button>
  );
}
```

### Tokens de diseño en Tailwind config

Todos los tokens de `colors_and_type.css` deben estar en `tailwind.config.js`:

```js
// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#FF9E00",
        "primary-dark": "#E89308",
        "gradient-start": "#788397",
        "gradient-end": "#212834",
        surface: "#FFFFFF",
        "app-bg": "#F4F4F4",
        border: "#C5C5C5",
        "border-light": "#D9D9D9",
        "text-muted": "rgba(0,0,0,0.39)",
        "status-green": "#4EBB22",
        "status-red": "#FF6464",
        "status-blue": "#2280BB",
      },
      fontFamily: {
        gabarito: ["Gabarito", "sans-serif"],
      },
      borderRadius: {
        card: "5px",
        btn: "10px",
        pill: "30px",
      },
      boxShadow: {
        card: "0 3px 7px rgba(0,0,0,0.25)",
        input: "inset 0 2px 4px rgba(0,0,0,0.25)",
        social: "0 0 2px rgba(0,0,0,0.70)",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        rekko: {
          primary: "#FF9E00",
          secondary: "#788397",
          accent: "#E89308",
          neutral: "#212834",
          "base-100": "#F4F4F4",
          "base-200": "#FFFFFF",
          info: "#2280BB",
          success: "#4EBB22",
          warning: "#FF9E00",
          error: "#FF6464",
        },
      },
    ],
    darkTheme: false,
  },
};
```

---

## Routing — React Router v6

La app es una SPA. El layout principal (`MainLayout`) contiene el `<Navbar>` y un `<Outlet>` donde se renderizan las páginas. La ruta `/` redirige a `/feed` si hay sesión, o a `/login` si no.

```jsx
// router/index.jsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import Login from "@/pages/Login";
import Feed from "@/pages/Feed";
import Explore from "@/pages/Explore";
import Animes from "@/pages/Animes";
import List from "@/pages/List";
import Profile from "@/pages/Profile";
import Animedle from "@/pages/Animedle";

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    path: "/",
    element: <MainLayout />, // Navbar + Outlet
    children: [
      { index: true, element: <Navigate to="/feed" replace /> },
      { path: "feed", element: <Feed /> },
      { path: "explore", element: <Explore /> },
      { path: "animes", element: <Animes /> },
      { path: "list", element: <List /> },
      { path: "profile/:username", element: <Profile /> },
      { path: "animedle", element: <Animedle /> },
    ],
  },
]);
```

---

## Estado global — Zustand

Un store por dominio. Los stores son simples: estado + acciones. Sin middleware complejo salvo `persist` de zustand/middleware cuando hace falta.

```js
// store/useAuthStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: "rekko-auth" },
  ),
);
```

```js
// store/useAnimeStore.js
import { create } from "zustand";

export const useAnimeStore = create((set, get) => ({
  list: [], // lista personal del usuario
  catalogue: [], // resultados del catálogo/explore
  filters: { genre: [], rating: [0, 10], type: null },
  setList: (list) => set({ list }),
  addToList: (anime) => set({ list: [...get().list, anime] }),
  removeFromList: (id) => set({ list: get().list.filter((a) => a.id !== id) }),
  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
}));
```

---

## Custom Hooks

Cada hook encapsula lógica de negocio y efectos. Los componentes solo llaman al hook y usan lo que devuelve.

```js
// hooks/useAnimeSearch.js
import { useState, useEffect, useCallback } from "react";
import { useAnimeStore } from "@/store/useAnimeStore";

export function useAnimeSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const filters = useAnimeStore((s) => s.filters);

  const search = useCallback(async (q, f) => {
    setLoading(true);
    try {
      // const data = await api.searchAnime(q, f);
      // setResults(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (query.length > 1) search(query, filters);
  }, [query, filters, search]);

  return { query, setQuery, results, loading };
}
```

---

## Componentes clave a implementar

### PostCard

El post tiene tres secciones bien diferenciadas:

1. **Header**: avatar + username + timestamp + "Related to: [anime]"
2. **Body**: texto del post
3. **Media**:
   - **Izquierda**: 2 portadas de anime (pequeñas, clickables → página del anime)
   - **Derecha**: imagen subida por el usuario (tamaño variable)
4. **Action bar**: fondo con degradado oscuro, likes + comentarios + share en blanco

### Navbar

Dos filas separadas por líneas que NO tocan los bordes de pantalla:

- **Fila 1**: logo (izquierda) | pill "Post something!" con espada solapando su borde derecho + "username" + avatar (derecha)
- **Fila 2**: tabs centrados (Feed, Animes, List, Explore) con subrayado amber en el activo (en el borde inferior de la fila)

### Button variants

- `primary`: degradado slate→dark, r=10, h=50px, texto 24px
- `pill`: degradado slate→dark, r=30, h=50px — incluye espada rotada como icono
- `amber`: fondo #E89308, r=5, h=26px
- `like`: degradado slate→dark, r=30, h=22px, con HeartIcon

---

## Visual Design Reference

- **Font**: Gabarito (variable, 400–600). Cargar desde `/fonts/Gabarito-VariableFont_wght.ttf`
- **Colores**: Ver `colors_and_type.css` y `tailwind.config.js`
- **Fondo app**: `#F4F4F4`
- **Cards**: `bg-white border border-[#C5C5C5] rounded-[5px]`
- **Inputs**: `bg-[rgba(246,246,246,0.6)] rounded-[10px] shadow-input h-[50px]`
- **Iconos**: Lucide React — stroke, 2px weight, rounded ends
- **Estrella rating**: filled amber `#FF9E00`
- **Espada en botones**: `rekko_sword.png` rotada ~35° para dirección horizontal
- **Líneas divisorias nav**: `rgba(0,0,0,0.15)`, con margen horizontal (~6% cada lado)
- **Degradado banner de perfil**: `from-[#FF7700] to-[#FF9E00]` vertical

---

## Estructura del Figma y guía de componentización

El Figma (`Rekko.fig`) tiene **1 página** con frames de 1600×900px. Todos los elementos son de posición absoluta (sin Auto Layout). A continuación se describe cada frame y cómo debe traducirse a componentes React.

---

### Frames y su mapping a componentes

#### `/Login` → `src/pages/Login.tsx`

- Fondo plano `#F4F4F4`. Sin mascota, sin GitHub, sin API Docs.
- Tarjeta centrada `600×800px`, `border-radius: 10px`, `box-shadow: card`.
- Contenido de la tarjeta (de arriba a abajo):
  - Título "Login" — `font-size: 55px`, Gabarito, centrado
  - Input Email — `h=50px`, `bg rgba(246,246,246,0.6)`, `border-radius:10px`, `box-shadow: input`
  - Input Password — igual que email
  - Fila "Remember me" (checkbox circular) + "Forgot password?" (link amber, underline)
  - Botón LOGIN — degradado slate→dark, `h=50px`, `r=10px`, text 24px
  - Separador "- o -"
  - 3 botones sociales (Google, Facebook, Microsoft) — `h=40px`, `r=10px`, `box-shadow: 0 0 2px rgba(0,0,0,0.7)`, fuente Roboto, icono PNG a la izquierda

**Componentes a crear:**

```
<LoginCard>
  <LoginInput />         — input reutilizable con inset shadow
  <RememberMeRow />      — checkbox + link
  <SocialLoginButton />  — variante por provider
</LoginCard>
```

---

#### `/Feed` → `src/pages/Feed.tsx`

Layout de 3 columnas dentro del `<MainLayout>`:

- **Columna izquierda** (~230px): noticias de anime + links (About, FAQ)
- **Columna central** (~800px): lista vertical de `<PostCard>`
- **Columna derecha** (~230px): `<ReputationLeaderboard>` + Popular Recommendations

**PostCard** — componente clave. Estructura exacta:

1. **Header**: `avatar (40px circle)` + `username (bold, 16px)` + `timestamp + "Related to: [anime]" (12px, amber)` + menú `...`
2. **Body**: texto del post (16px, `line-height: 1.5`)
3. **Media row** (separada por bordes `1.5px #C5C5C5`):
   - **Izquierda**: hasta 2 portadas de anime apiladas verticalmente (`60×82px`, `r=5px`, con label superpuesto en negro/55% opacity, **clickables → `/animes/:id`**)
   - **Derecha**: imagen subida por el usuario (`flex:1`, altura variable `120–200px`, `r=5px`)
4. **Action bar**: fondo `linear-gradient(#788397, #212834)`, iconos blancos — Heart (con contador) + MessageCircle (con contador) + Share2

**Componentes a crear:**

```
<PostCard post={Post} onLike onAnimeClick />
  <PostHeader />
  <PostBody />
  <PostMedia>
    <AnimeCoverLink />   — cover clickable con label overlay
    <UserImage />        — imagen del usuario
  </PostMedia>
  <PostActions />

<ReputationLeaderboard items={LeaderboardItem[]} />
  — rank 1: color #FF9E00, rank 2: #788397, rank 3: #CC5F00, rank 4+: #000
```

---

#### `/Explore` → `src/pages/Explore.tsx`

Layout de 3 columnas:

- **Columna izquierda** (~280px): `<TopAiringList title="Top Airing">` — lista con rank, cover, título
- **Columna central**: título "Seasonal Anime" (40px) con subrayado amber, grid horizontal de `<AnimeCard>` (portada + título + "View More +")
- **Columna derecha** (~280px): `<TopAiringList title="Top Upcoming">`
- Fondo con textura de nubes (`bg_clouds.png`, opacity baja)

**Componentes a crear:**

```
<AnimeCard anime={Anime} />          — cover 173×245px, r=5, título debajo, link "View More +"
<TopRankedList title items />        — lista numerada con cover pequeña (91×114px)
```

---

#### `/Animes` → `src/pages/Animes.tsx`

Layout de 2 columnas:

- **Columna izquierda** (~220px): panel de filtros
  - Botón "Advanced Filter" (degradado, r=5) — abre panel lateral derecho `<AdvancedFilterPanel>`
  - Filtros básicos: género (chips con radio button circular), rating (slider doble, track amber)
  - Botón "Apply Filter" (amber, r=5, `h=26px`)
- **Columna central**: tabs (Top Anime / Seasonal Anime / By Genre / Filter) + grid de `<AnimeCard>` + paginación
- **Panel de filtros avanzados** (aparece a la derecha, `353×548px`, `r=10px`, borde `1px #C5C5C5`):
  - Secciones colapsables: Genre, Episodes, Rating, Type, Season, Year
  - Slider de rating: track amber, knobs circulares
  - Checkboxes: círculo `10px` — activo amber, inactivo gris
  - Botón "Apply Filter" al pie

**Componentes a crear:**

```
<AnimeCard anime={Anime} onAddToList />   — cover 140×190px, overlay oscuro con "Add to List" + score+estrella
<FilterPanel />                           — filtros básicos en sidebar izquierdo
<AdvancedFilterPanel />                   — panel derecho con secciones colapsables
<RatingSlider min max value onChange />   — slider doble con track amber
<GenreChip label active onClick />        — chip con radio circle
<Pagination page total onChange />        — pills redondeadas, página activa amber
```

---

#### `/Profile` → `src/pages/Profile/:username.tsx`

- **Banner de perfil**: `linear-gradient(#FF7700, #FF9E00)`, altura ~100px. Ilustración decorativa a la derecha.
- **Avatar**: círculo blanco `88px` solapando el banner (bottom: -44px)
- **Botón editar**: círculo `32px`, borde `1px #C5C5C5`, icono Edit centrado — top-right del banner
- **Info de usuario**: `@username` (muted, 14px) + `"Username List —"` (40px)
- **Barra de progreso**: `height: 24px`, fondo gris, relleno amber proporcional al % visto
- **Lista de anime**: cada item:
  - Cover `50×66px` + título (20px) + episodios vistos + estado (chip verde con check) + score + estrella amber + icono Edit
  - Separador `1px #D9D9D9` entre items
- **Feed de posts del usuario**: misma `<PostCard>` que en Feed

**Componentes a crear:**

```
<ProfileBanner user onEdit />
<AnimeListItem item onEdit onScore onStatus />
<ProgressBar value max />
```

---

#### `/Animedle` → `src/pages/Animedle.tsx`

Layout especial — **sin Navbar**. Pantalla completa con 3 columnas:

- **Columna izquierda** (~350px): borde derecho `1px #C5C5C5`, contador de intentos
- **Columna central** (900px): fondo blanco, contenido del juego:
  - Título "Animedle" (64px, centrado)
  - Grid 2×2 de tiles de anime (120×120px) — revelados progresivamente
  - Botones "Anterior" / "Siguiente" (degradado, `170×40px`, espada rotada)
  - Input de búsqueda (h=46px, inset shadow)
  - Lista de intentos: acierto = borde + fondo amber 17% opacity + icono ✓ amber; error = borde gris + icono ✗ rojo
- **Columna derecha** (~350px): borde izquierdo `1px #C5C5C5`
- **Top bar especial**: mascota (`rekko_mascot.png`) izquierda + icono GitHub en círculo + texto "API Docs" derecha
- Fondo con textura nubes (`bg_clouds.png`)

**Componentes a crear:**

```
<AnimedleLayout />               — layout especial sin Navbar
<AnimeGuessInput onSubmit />
<GuessResult guess isCorrect />
<AnimeTileGrid tiles revealed />
```

---

### Componentes globales reutilizables

| Componente                          | Descripción                                                       |
| ----------------------------------- | ----------------------------------------------------------------- |
| `<Button variant>`                  | primary / pill / amber / like — ver `CLAUDE.md › Button variants` |
| `<Avatar src size>`                 | Círculo con imagen o fallback gris                                |
| `<StarRating score>`                | Estrella filled amber + número                                    |
| `<StatusChip status>`               | watching/completed/dropped — color según estado                   |
| `<AnimeCovers animes onClickAnime>` | Las 2 portadas clickables del PostCard                            |
| `<NavDivider>`                      | `h-[1.5px] bg-black/15 mx-[6%]` — reutilizable                    |

---

### Notas importantes para la implementación

1. **El Figma NO usa Auto Layout** — todas las medidas son absolutas. Al componetizar, usa Flexbox/Grid, no valores `position: absolute` hardcodeados.
2. **Gabarito es la fuente de TODO** salvo botones sociales del Login (Roboto) y paginación (Inter si hace falta). Forzar `font-gabarito` en todos los componentes.
3. **`line-height: 1` (100%)** en todos los textos de UI — es el estándar del Figma.
4. **Bordes de cards**: siempre `1.5px solid #C5C5C5` para cards de contenido, `1px solid #C5C5C5` para panels de filtro.
5. **El navbar no aparece en `/login` ni en `/animedle`** — usar `MainLayout` solo para rutas autenticadas normales.
6. **Las líneas divisoras del Navbar** tienen `margin: 0 6%` — nunca tocan los bordes del viewport.
7. **La espada en botones** usa `rekko_sword.png` rotada con `transform: rotate(-35deg)` para Siguiente y `rotate(-35deg) scaleX(-1)` para Anterior. Ajustar ángulo si hace falta.

## Assets disponibles

### `public/` (referenciar como `/filename.png`)

- `rekko_logo.png`, `rekko_sword.png`, `rekko_mascot.png`, `rekko_char_illustration.png`
- `bg_clouds.png` — textura nubes (Explore, Animedle)
- `icon_google.png`, `icon_facebook.png`, `icon_microsoft.png` — social login
- `fonts/Gabarito-VariableFont_wght.ttf`

### `src/assets/` (importar con `import x from '@/assets/x.png'`)

- `rekko_logo.png`, `rekko_sword.png`

> **No existen** `anime_*.png` ni `rekko_char_illustration.png` en `src/assets/`. Usar rutas `/public` para los que estén en `public/`.

---

## Estado de implementación (actualizado)

> Los archivos son **`.tsx` / `.ts`**, NO `.jsx` / `.js` — el proyecto usa **TypeScript**.

### ✅ Implementado

| Archivo                                 | Estado                                                              |
| --------------------------------------- | ------------------------------------------------------------------- |
| `tailwind.config.js`                    | Completo — tokens, gradientes, DaisyUI                              |
| `src/index.css`                         | Font-face Gabarito cargado desde `/fonts/`                          |
| `src/router/index.tsx`                  | Rutas completas incluyendo `/settings` y `/animedle` sin MainLayout |
| `src/components/layout/Navbar.tsx`      | Completo — 2 filas, dividers inset, tabs amber activo               |
| `src/components/layout/MainLayout.tsx`  | Completo                                                            |
| `src/store/useAuthStore.ts`             | Completo                                                            |
| `src/store/useAnimeStore.ts`            | Completo                                                            |
| `src/store/useFeedStore.ts`             | Completo                                                            |
| `src/components/ui/Button.tsx`          | variants: primary, pill, amber, like                                |
| `src/components/ui/Avatar.tsx`          | sizes: sm(34px), md(55px), lg(118px)                                |
| `src/components/ui/Badge.tsx`           | status: watching, completed, on_hold, dropped, plan_to_watch        |
| `src/components/ui/AnimeCard.tsx`       | poster + overlay + icon row + title                                 |
| `src/components/ui/PostCard.tsx`        | header + body + media + actions                                     |
| `src/components/shared/AnimeCovers.tsx` | 2 small covers + optional add-to-list                               |
| `src/pages/Login.tsx`                   | Completo con datos mock                                             |
| `src/pages/Feed.tsx`                    | Completo con datos mock                                             |
| `src/pages/Animes.tsx`                  | Completo con datos mock + advanced filter                           |
| `src/pages/List.tsx`                    | Completo con datos mock                                             |
| `src/pages/Explore.tsx`                 | Completo con datos mock                                             |
| `src/pages/Profile.tsx`                 | Completo con datos mock                                             |
| `src/pages/Animedle.tsx`                | Completo — layout sin Navbar, lives, input, guesses                 |
| `src/pages/Settings.tsx`                | Completo — Account + Security sections                              |

### ⚠️ Pendiente / TODO

- Conectar stores con API real (actualmente todo mock data)
- `src/hooks/` — todos los custom hooks están pendientes (useAnimeSearch, useAnimeList, useFeed, useProfile)
- `src/lib/api.js` — cliente API pendiente
- Auth guard (redirect a /login si no hay token)
- Perfil con `rekko_char_illustration.png` — en Figma aparece en la pantalla de perfil como ilustración decorativa, no está claro exactamente dónde (¿right column?) → **VER DUDA #3**
- Animedle — imagen real de silhouette del anime (actualmente negro placeholder)
- Modal "Edit Profile" (frame Figma `550:53`) — no implementado

---

## Nota sobre Animedle en el router

`/animedle` está definido **fuera** del `<MainLayout>` — tiene su propio layout sin Navbar. Si se mueve dentro, hay que añadir lógica en MainLayout para ocultarlo.

---

## Dudas del Figma a aclarar

> Anotar aquí todo lo que no quedó claro del Figma para revisión posterior.

1. **PostCard — action bar**: En el Figma el action bar tiene fondo degradado oscuro. En la implementación actual tiene `border-top` simple. ¿Confirmar si el action bar debe tener el degradado `#788397→#212834` como fondo con iconos blancos, o borde simple con iconos grises?

2. **List page — columna Status**: Los iconos de status (check/eye/X/.../clock) están todos apilados verticalmente para CADA fila de la tabla. Esto hace las filas muy altas. ¿Es correcto, o solo se muestra el status activo y los demás se muestran en hover/dropdown?

3. **Profile — rekko_char_illustration.png**: En el Figma de Profile (frame `538:211`) hay una ilustración de personaje flotando a la derecha fuera del área de contenido principal. ¿Debe aparecer en producción? Si sí, ¿cómo se posiciona exactamente?

4. **Animedle — las 4 nubes**: Las 4 nubes superiores representan las vidas del juego (intentos restantes). Actualmente implementadas como círculos. ¿Usar `rekko_mascot.png` o el `bg_clouds.png` recortado?

5. **Settings — ruta de acceso**: No hay link a `/settings` en el Navbar. ¿Cómo navega el usuario a Settings? ¿Desde el avatar del Navbar (dropdown)?

6. **Explore — fondo de nubes**: En el Figma el fondo `bg_clouds.png` aparece DENTRO del banner naranja. ¿También debe cubrir el fondo general de la página o solo el banner?

7. **Navbar — "Post something!" pill**: El botón abre un modal/drawer para crear un nuevo post. Ese modal no está diseñado en el Figma visible. ¿Existe en algún frame no catalogado?

8. **Explore — assets y covers**: Explore usa `RekkoText.png`, `RekkoSwordBanner.png` y `bg_clouds.png` para banner/fondo. No hay covers reales para las listas de anime, así que la pantalla queda preparada con placeholders visuales.
