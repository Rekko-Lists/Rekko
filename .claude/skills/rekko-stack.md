# Skill: Rekko Stack

## Objetivo

Mantener consistencia tecnica en el frontend de Rekko.

## Reglas

- React 18 con function components y hooks.
- TypeScript estricto.
- Router con React Router v6 (`createBrowserRouter`).
- Estado global con Zustand (un store por dominio).
- Estilos con Tailwind + DaisyUI.
- Mantener clases de Tailwind agrupadas por componente en constantes locales cuando ayude a legibilidad.
- Iconos con `lucide-react`.

## Imports y rutas

- Preferir alias `@` para imports desde `src`.
- Evitar rutas relativas profundas (`../../..`) cuando exista alias.

## Checklist rapido antes de cerrar una tarea

1. No romper tipos TS.
2. No romper rutas del router.
3. Mantener naming consistente en componentes y stores.
4. Verificar que `npm run build` pasa.
