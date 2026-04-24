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

| Capa | Tecnología | Notas |
|---|---|---|
| Framework | **React 18** | Hooks only, no class components |
| Build | **Vite** | `vite.config.js` en raíz |
| Estilos | **Tailwind CSS v3** + **DaisyUI** | Ver sección de estilos |
| Routing | **React Router v6** | `createBrowserRouter` + `<RouterProvider>` |
| Estado global | **Zustand** | Un store por dominio |
| Custom hooks | Sí | Separar lógica de UI siempre |
| Fuente | **Gabarito** (variable font) | `fonts/Gabarito-VariableFont_wght.ttf` |
| Iconos | **Lucide React** | `lucide-react` package |

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
  base: 'font-gabarito inline-flex items-center justify-center gap-2 transition-opacity',
  primary: 'bg-gradient-to-b from-slate-500 to-gray-900 text-white rounded-[10px] h-[50px] px-8 text-2xl',
  pill: 'bg-gradient-to-b from-slate-500 to-gray-900 text-white rounded-full h-[50px] px-6 text-xl',
  amber: 'bg-amber-600 text-white rounded-[5px] h-[26px] px-3 text-base',
};

export function Button({ variant = 'primary', children, ...props }) {
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
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary:   '#FF9E00',
        'primary-dark': '#E89308',
        'gradient-start': '#788397',
        'gradient-end':   '#212834',
        surface:   '#FFFFFF',
        'app-bg':  '#F4F4F4',
        border:    '#C5C5C5',
        'border-light': '#D9D9D9',
        'text-muted': 'rgba(0,0,0,0.39)',
        'status-green': '#4EBB22',
        'status-red':   '#FF6464',
        'status-blue':  '#2280BB',
      },
      fontFamily: {
        gabarito: ['Gabarito', 'sans-serif'],
      },
      borderRadius: {
        card:   '5px',
        btn:    '10px',
        pill:   '30px',
      },
      boxShadow: {
        card:   '0 3px 7px rgba(0,0,0,0.25)',
        input:  'inset 0 2px 4px rgba(0,0,0,0.25)',
        social: '0 0 2px rgba(0,0,0,0.70)',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        rekko: {
          primary:   '#FF9E00',
          secondary: '#788397',
          accent:    '#E89308',
          neutral:   '#212834',
          'base-100': '#F4F4F4',
          'base-200': '#FFFFFF',
          info:      '#2280BB',
          success:   '#4EBB22',
          warning:   '#FF9E00',
          error:     '#FF6464',
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
import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import Login from '@/pages/Login';
import Feed from '@/pages/Feed';
import Explore from '@/pages/Explore';
import Animes from '@/pages/Animes';
import List from '@/pages/List';
import Profile from '@/pages/Profile';
import Animedle from '@/pages/Animedle';

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: <MainLayout />,   // Navbar + Outlet
    children: [
      { index: true, element: <Navigate to="/feed" replace /> },
      { path: 'feed',     element: <Feed /> },
      { path: 'explore',  element: <Explore /> },
      { path: 'animes',   element: <Animes /> },
      { path: 'list',     element: <List /> },
      { path: 'profile/:username', element: <Profile /> },
      { path: 'animedle', element: <Animedle /> },
    ],
  },
]);
```

---

## Estado global — Zustand

Un store por dominio. Los stores son simples: estado + acciones. Sin middleware complejo salvo `persist` de zustand/middleware cuando hace falta.

```js
// store/useAuthStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'rekko-auth' }
  )
);
```

```js
// store/useAnimeStore.js
import { create } from 'zustand';

export const useAnimeStore = create((set, get) => ({
  list: [],          // lista personal del usuario
  catalogue: [],     // resultados del catálogo/explore
  filters: { genre: [], rating: [0, 10], type: null },
  setList: (list) => set({ list }),
  addToList: (anime) => set({ list: [...get().list, anime] }),
  removeFromList: (id) => set({ list: get().list.filter(a => a.id !== id) }),
  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
}));
```

---

## Custom Hooks

Cada hook encapsula lógica de negocio y efectos. Los componentes solo llaman al hook y usan lo que devuelve.

```js
// hooks/useAnimeSearch.js
import { useState, useEffect, useCallback } from 'react';
import { useAnimeStore } from '@/store/useAnimeStore';

export function useAnimeSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const filters = useAnimeStore(s => s.filters);

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

## Assets disponibles

Todos en `assets/` de este design system. Copiar a `public/` o `src/assets/` según uso:
- `rekko_logo.png` — logo completo
- `rekko_sword.png` — espada sola (icono en botones y nav)
- `rekko_mascot.png` — mascota Animedle
- `rekko_char_illustration.png` — ilustración decorativa perfil
- `bg_clouds.png` — fondo textura nubes (Explore, Animedle)
- `icon_google/facebook/microsoft.png` — iconos social login
- `anime_*.png` — portadas de anime de ejemplo
