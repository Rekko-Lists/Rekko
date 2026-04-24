# Rekko

Rekko es una SPA social de anime construida con React + Vite + TypeScript.

## Stack

- React 18
- Vite 5
- TypeScript 5
- React Router 6
- Zustand
- Tailwind CSS 3
- DaisyUI
- Lucide React

## Requisitos

- Node.js 20+ recomendado
- npm 10+

## Instalacion

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

Abre la URL que muestra Vite (normalmente http://localhost:5173).

## Build de produccion

```bash
npm run build
npm run preview
```

## Estructura principal

```text
src/
  components/
    layout/
  pages/
  router/
  store/
```

## Alias de imports

Se usa alias `@` apuntando a `src`.

Ejemplo:

```ts
import Navbar from '@/components/layout/Navbar';
```

## Estado actual

- Base inicial del frontend montada.
- Routing principal configurado.
- Layout y navbar iniciales listos.
- Configuracion preparada para continuar desarrollo por features.

## Proximos pasos sugeridos

1. Implementar componentes UI reutilizables (`Button`, `PostCard`, `Avatar`, `Badge`).
2. Añadir hooks de dominio (`useAnimeSearch`, `useFeed`, etc.).
3. Conectar stores con datos mock/API.
4. Completar assets del design system en `src/assets` y `public/fonts`.
