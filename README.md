# Proyecto MI RESTAURANT

E-commerce de MiRestaurant: catálogo de productos, detalle y carrito de pedido.

El proyecto se desarrolla con **SDD** (Spec-Driven Development, con [OpenSpec](./openspec)) y **BDD**: cada escenario de las specs se ejecuta como un `Scenario` de un archivo `.feature`.

## Stack

| Área | Tecnología |
|---|---|
| Base | React 19 + TypeScript (strict) + Vite |
| Estilos | Tailwind CSS v4 (tokens en `src/index.css`) |
| Rutas | React Router (TopBar + Sidebar + `<Outlet />`) |
| Estado del servidor | TanStack Query (caché de datos de la API) |
| Estado del cliente | Zustand (carrito persistido, UI, búsqueda) |
| HTTP | Axios: un único `apiClient` con JWT |
| Tests | Vitest + Testing Library + vitest-cucumber (`@component`), Playwright + playwright-bdd (`@e2e`), MSW |

## Requisitos

- Node.js 22 o superior
- npm 11 o superior

## Puesta en marcha

```bash
npm install
cp .env.example .env      # completa VITE_API_URL y VITE_API_TOKEN
npx playwright install chromium   # solo para los tests e2e
npm run dev
```

### Variables de entorno

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base de la API, sin barra final |
| `VITE_API_TOKEN` | JWT fijo que se envía como `Authorization: Bearer <token>` |

La app **no arranca** si falta alguna de las dos variables: muestra un mensaje con el nombre de la que falta.

> ⚠️ Toda variable `VITE_*` queda incluida en el bundle que descarga el navegador. Usar `VITE_API_TOKEN` solo con tokens de entornos no productivos. En producción, el token debería vivir en un proxy o backend.

`.env` está en `.gitignore`. Nunca subas valores reales al repositorio.

## Scripts

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Typecheck y build de producción |
| `npm run lint` | ESLint, incluidas las reglas de dependencia entre capas |
| `npm run typecheck` | `tsc -b` |
| `npm test` | Tests unitarios y features `@component` (Vitest) |
| `npm run test:watch` | Vitest en modo watch |
| `npm run test:e2e` | Features `@e2e` con Playwright (levanta Vite en modo `e2e` con MSW) |
| `npm run check:traceability` | Comprueba que cada escenario de las specs trazadas tenga su `Scenario` en un `.feature` |
| `npm run verify` | Todo lo anterior. Es obligatorio que pase antes de abrir un PR |

## Estructura

```
src/
  app/          providers, queryClient, rutas
  config/       lectura y validación de variables de entorno
  api/          apiClient (axios + interceptores) y ApiError
  services/     llamadas a la API (único lugar que usa apiClient)
  hooks/        lógica: queries (TanStack Query), carrito, búsqueda...
  store/        stores de Zustand (cart, ui, search)
  components/   atomic design, SOLO presentación
    atoms/ molecules/ organisms/ templates/
  layouts/      AppLayoutContainer: conecta stores con el template y renderiza <Outlet />
  pages/        páginas de cada ruta: usan hooks y pasan props
  mocks/        datos y handlers de MSW compartidos por ambos niveles de test
  features/     .feature + steps del nivel @component
  test/         utilidades de test
tests/e2e/      .feature + steps del nivel @e2e
openspec/       specs y cambios (SDD)
```

### Reglas de arquitectura

- Los componentes de `components/` reciben datos por props y avisan eventos con callbacks. No importan `api/`, `services/`, `store/`, `hooks/`, axios, zustand ni TanStack Query. **ESLint lo verifica.**
- Cada nivel de atomic design solo compone niveles inferiores (atoms → molecules → organisms → templates).
- Los datos de la API viven en la caché de TanStack Query. Zustand nunca guarda copias de respuestas del servidor.
- Solo los servicios usan el `apiClient`.

## Flujo de ramas

```
main  <-- PR release --  develop  <-- PR por feature --  feature/<nombre>
```

- `main`: solo versiones estables. Recibe cambios únicamente por PR desde `develop`.
- `develop`: integración de las features terminadas.
- `feature/<nombre-en-kebab-case>`: una rama por feature, creada desde `develop` actualizado.
- Al terminar una feature se abre un **PR a `develop`** que enlaza el cambio de OpenSpec. Para hacer merge, `npm run verify` debe pasar. Después del merge se borra la rama.

## SDD con OpenSpec

```bash
openspec list            # cambios en curso
openspec list --specs    # capacidades vigentes
openspec validate <cambio> --strict
```

Cada escenario de una spec de comportamiento tiene un `Scenario` con el mismo nombre en un `.feature`. Al agregar una capacidad nueva, súmala a `TRACED_CAPABILITIES` en `scripts/check-traceability.mjs`.
