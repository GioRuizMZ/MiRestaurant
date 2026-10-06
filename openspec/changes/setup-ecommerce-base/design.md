# Design

## Context

`MiRestaurant` es un repositorio git en la rama `main`, todavía sin commits. Por ahora solo tiene `openspec/`. La aplicación se crea en la **raíz del repo**, al lado de `openspec/`. La motivación está en proposal.md y el comportamiento esperado en las specs de este cambio. Este documento define cómo se construye y cuál es la base que irá en el primer commit de `main`.

Restricciones conocidas:
- El JWT es fijo y se entrega por variable de entorno. Al ser una SPA, queda incluido en el bundle.
- Todavía no conocemos la API real. Se trabaja contra un contrato provisional (ver Decisión 9).

## Goals / Non-Goals

**Goals:**
- Una base ejecutable (`dev`, `build`, `lint`, `test`, `test:e2e`) que respete los estándares de las specs desde el primer commit.
- Estructura de carpetas que haga obvio dónde va cada cosa y que el linter haga cumplir.
- Las tres features (catálogo, detalle, carrito) y la búsqueda, cada una con sus `.feature`.

**Non-Goals:**
- Checkout, pagos, login de usuarios o gestión de pedidos en el backend.
- Server-side rendering.
- Internacionalización: los textos están en español dentro del código.
- Despliegue y pipeline de CI. Los scripts quedan listos para conectarlos después.

## Decisions

### 1. Stack y tooling

| Área | Elección | Alternativa descartada |
|---|---|---|
| Build | Vite + React + TypeScript (`strict`) | CRA (deprecado) |
| Estilos | Tailwind CSS v4 (plugin `@tailwindcss/vite`, tokens en `@theme`) | CSS Modules: va contra la regla de no tener CSS por componente |
| Routing | React Router (modo data: `createBrowserRouter`) | TanStack Router: es más tipado, pero el equipo eligió React Router |
| Estado del servidor | TanStack Query | Guardar respuestas en Zustand: duplica datos e invalida mal |
| Estado del cliente | Zustand (+ middleware `persist` para `cart`) | Context: re-renders amplios y sin selectores |
| HTTP | Axios con interceptores | fetch: habría que reimplementar interceptores y la normalización de errores |
| Unit + `@component` | Vitest + Testing Library + `@amiceli/vitest-cucumber` + MSW | Cucumber.js: no se integra con el pipeline de Vite |
| `@e2e` | Playwright + `playwright-bdd` + MSW en el navegador | Cypress + cucumber preprocessor: más lento y con más configuración |
| Lint | ESLint (flat config) + `no-restricted-imports` por carpeta | eslint-plugin-boundaries: más potente, pero por ahora sobra |

### 2. Estructura de carpetas

```
MiRestaurant/
+-- openspec/
+-- public/
+-- src/
|   +-- main.tsx                 # monta <AppProviders><RouterProvider/></AppProviders>
|   +-- app/
|   |   +-- providers.tsx        # QueryClientProvider (+ Devtools en dev)
|   |   +-- queryClient.ts       # defaults: staleTime 5m, retry 1 (sin 4xx)
|   |   +-- router.tsx           # definicion de rutas
|   +-- config/
|   |   +-- env.ts               # lee y valida VITE_API_URL / VITE_API_TOKEN
|   +-- api/
|   |   +-- apiClient.ts         # instancia axios + interceptores
|   |   +-- apiError.ts          # ApiError { status, message }
|   +-- services/
|   |   +-- productService.ts    # getProducts(), getProduct(id)
|   +-- types/
|   |   +-- product.ts           # Product, CartItem
|   +-- hooks/
|   |   +-- queries/
|   |   |   +-- queryKeys.ts     # productKeys.all / productKeys.detail(id)
|   |   |   +-- useProducts.ts
|   |   |   +-- useProduct.ts
|   |   +-- useCart.ts           # fachada sobre cartStore (+ derivados)
|   |   +-- useProductSearch.ts  # debounce + umbral + filtro
|   |   +-- useDebouncedValue.ts
|   +-- store/
|   |   +-- cartStore.ts         # persist
|   |   +-- uiStore.ts           # sidebarOpen
|   |   +-- searchStore.ts       # term
|   +-- lib/
|   |   +-- formatPrice.ts
|   |   +-- normalizeText.ts     # minusculas + sin tildes
|   +-- components/              # SOLO presentacion (sin api/store/hooks de datos)
|   |   +-- atoms/               # Button, IconButton, Input, Badge, Price, Image, Skeleton, Spinner
|   |   +-- molecules/           # SearchBar, ProductCard, QuantitySelector, CartLine, EmptyState, ErrorState, NavItem
|   |   +-- organisms/           # TopBar, Sidebar, ProductGrid, ProductInfo, CartSummary, CartList
|   |   +-- templates/           # AppLayout (TopBar + Sidebar + slot de contenido)
|   +-- layouts/
|   |   +-- AppLayoutContainer.tsx  # lee stores/hooks -> props de AppLayout, renderiza <Outlet/>
|   +-- pages/
|   |   +-- CatalogPage.tsx
|   |   +-- ProductDetailPage.tsx
|   |   +-- CartPage.tsx
|   |   +-- NotFoundPage.tsx
|   +-- mocks/
|   |   +-- data/products.ts     # fixtures compartidos
|   |   +-- handlers.ts          # handlers MSW compartidos
|   |   +-- server.ts            # setupServer (vitest)
|   |   +-- browser.ts           # setupWorker (e2e / dev opcional)
|   +-- features/                # nivel @component
|   |   +-- product-catalog/
|   |   |   +-- product-catalog.feature
|   |   |   +-- product-catalog.steps.tsx
|   |   +-- product-search/ ...
|   |   +-- product-detail/ ...
|   |   +-- shopping-cart/ ...
|   |   +-- app-layout/ ...
|   +-- test/
|       +-- setup.ts             # MSW server, jest-dom, reset de stores
|       +-- renderWithProviders.tsx  # QueryClient nuevo + MemoryRouter
+-- tests/
|   +-- e2e/
|       +-- features/            # nivel @e2e (*.feature)
|       +-- steps/               # step definitions de playwright-bdd
+-- .env.example
+-- eslint.config.js
+-- playwright.config.ts
+-- vite.config.ts               # incluye config de vitest
+-- tsconfig.json
+-- package.json
```

Los tests unitarios van junto al archivo que prueban (`cartStore.test.ts`, `productService.test.ts`, etc.).

### 3. Flujo de datos y separación de la lógica

```
 pages / AppLayoutContainer   <-- unico lugar con hooks de datos
   |  useProducts / useProduct ----> productService ----> apiClient ----> API
   |  useCart / useProductSearch --> cartStore / searchStore
   |  useUi -----------------------> uiStore
   v  (props)
 organisms --> molecules --> atoms           (presentacion pura)
```

Regla de ESLint (`no-restricted-imports`) aplicada a `src/components/**`: prohíbe `@/api/*`, `@/services/*`, `@/store/*`, `@/hooks/*`, `axios`, `zustand` y `@tanstack/react-query`. Además se aplican reglas por nivel: `atoms` no importa `molecules`, `organisms` ni `templates`; `molecules` no importa `organisms` ni `templates`; y así sucesivamente. Se usa el alias `@/` → `src/`.

### 4. Cliente API

- `config/env.ts` valida al importarse: si falta alguna variable lanza `Error("Falta la variable de entorno VITE_API_TOKEN")`. `main.tsx` lo importa primero, así la app no arranca sin configuración.
- `apiClient = axios.create({ baseURL: env.apiUrl, timeout: 10000 })`.
- El interceptor de request agrega `Authorization: Bearer ${env.apiToken}`.
- El interceptor de response convierte todo error en `ApiError { status: number | null, message }`, con mensajes en español para la red, el 401 y el 5xx.
- Los tipos de `import.meta.env` se declaran en `src/vite-env.d.ts`.

### 5. Estado del servidor

- `productKeys = { all: ['products'] as const, detail: (id) => ['products', id] as const }`.
- `useProduct(id)` usa `initialData` desde la caché de `productKeys.all` (buscando por id) para mostrar el detalle de inmediato al venir del catálogo, y siempre consulta `GET /products/:id`. Así se cumple el requisito "Datos inmediatos desde el catálogo".
- `retry: (count, err) => count < 1 && !(err.status >= 400 && err.status < 500)`.

### 6. Búsqueda

- `searchStore.term` es el texto que escribe el usuario. El input es controlado y se actualiza con cada tecla.
- `useProductSearch(products)`: aplica `useDebouncedValue(term, 300)`, luego `trim`, y si `length > 3` filtra con `normalizeText` sobre `name + category`. Si no, devuelve todos los productos.
- Por qué se filtra en el cliente: el catálogo de un restaurante es chico y ya está en caché, así que filtrar en el cliente no agrega peticiones. Si después la API ofrece búsqueda, solo cambia el hook: pasaría a ser `useQuery(['products', 'search', term])`, sin tocar los componentes.
- Si se escribe fuera de `/`, `AppLayoutContainer` navega a `/` cuando el término supera el umbral (ver el escenario "Buscar desde otra pantalla").
- El término no se persiste: se pierde al recargar y se conserva al navegar.

### 7. Carrito

- `cartStore`: `items: CartItem[]` con `{ id, sku, name, price, quantity }`. Acciones: `addItem(product, qty = 1)` (si el id ya existe, suma), `increment(id)`, `decrement(id)` (si llega a 0, quita la línea), `removeItem(id)` y `clear()`.
- Los valores derivados (`totalItems`, `totalPrice`, `subtotal`) se calculan en `useCart` con selectores, no se guardan en el store.
- `persist` usa la clave `mirestaurant-cart` con `version: 1` y una función `migrate`. Si el JSON está corrupto, se arranca con el carrito vacío.
- El precio guardado en la línea es una decisión de la spec: el carrito no depende de la API.

### 8. Layout y rutas

```
createBrowserRouter([
  { element: <AppLayoutContainer/>, errorElement: <NotFoundPage/>, children: [
      { path: '/',             element: <CatalogPage/> },
      { path: '/products/:id', element: <ProductDetailPage/> },
      { path: '/cart',         element: <CartPage/> },
      { path: '*',             element: <NotFoundPage/> },
  ]}
])
```

`AppLayout` (template) recibe `cartCount`, `searchValue`, `onSearchChange`, `sidebarOpen`, `onToggleSidebar` y `children`, y no sabe nada de los stores. Breakpoint `md` (768 px): por debajo, el sidebar es un drawer superpuesto que se cierra con cada cambio de `location`.

### 9. Contrato de la API (SrKiosco)

```
GET <VITE_API_URL>     p. ej. https://srkiosco-api-beta.azurewebsites.net/SrKioscoRemote/GetProducts?KioskID=8
Authorization: Bearer <VITE_API_TOKEN>
-> { isSuccess: boolean, code: string, message: string, data: ProductDto[] | null }

ProductDto = { id, sku, barcode, name, description, image, price, isAvailable,
               reference, category, orderIndex, printers[], modifier[] }
Product    = { id: number; sku: string; name: string; description: string; price: number }
```

- `VITE_API_URL` es la **URL absoluta** del endpoint y se usa tal cual: el cliente no tiene `baseURL` ni concatena rutas.
- Los productos se leen de `data`. `isSuccess` se ignora porque llega en `false` incluso con `code: "0000"` ("Procesado exitosamente").
- **No hay endpoint por id**: `getProduct(id)` busca en la lista y lanza `ApiError` 404 si no existe.
- El mapeo `ProductDto → Product` vive solo en `productService`. La API sí trae `image`, `category` e `isAvailable`, pero hoy el modelo `Product` no los usa (ver §13 y Open Questions).
- MSW simula el endpoint `*/SrKioscoRemote/GetProducts` con el mismo sobre.

### 10. BDD en dos niveles

- **@component**: `src/features/<capacidad>/<capacidad>.feature` + `*.steps.tsx` con `@amiceli/vitest-cucumber` (`loadFeature` / `describeFeature`). Usa `renderWithProviders` con un `QueryClient` nuevo por escenario (con `retry: false`), MSW con `server.use()` para los casos de error, y reinicia los stores en `beforeEach`.
- **@e2e**: `tests/e2e/features/*.feature` con `playwright-bdd` (`defineBddConfig`). La app se levanta con `vite --mode e2e`, que activa el worker de MSW con los mismos `handlers.ts`. Escenario mínimo: buscar "Hamb" → abrir detalle → agregar 2 → indicador "2" → `/cart` con total correcto.
- Los nombres de `Feature` y `Scenario` copian literalmente los de las specs. El script `check:traceability` (un script de Node) compara los encabezados `#### Scenario:` de `openspec/specs/**` con los `Scenario:` de los `.feature` y falla si falta alguno.
- **Alcance de la trazabilidad**: el script revisa solo las capacidades de comportamiento de la UI (`app-layout`, `product-catalog`, `product-search`, `product-detail`, `shopping-cart`), definidas en una lista dentro del script. Las capacidades de estándar (`api-client`, `server-state`, `global-state`, `component-architecture`, `testing-bdd`) se verifican con tests unitarios y con el lint. `git-workflow` se verifica con la protección de ramas de GitHub y con la revisión de los PRs.
- **La lista crece con cada rama**: en la base solo incluye `app-layout`. Cada rama `feature/*` agrega su capacidad a la lista en el mismo PR que trae sus `.feature`. Así `verify` pasa en cada punto de la historia y ninguna feature puede integrarse sin todos sus escenarios.

### 11. Scripts

```
dev, build (tsc -b && vite build), preview,
lint, typecheck (tsc -b --noEmit),
test (vitest run), test:watch,
test:e2e (bddgen && playwright test),
check:traceability,
verify (lint && typecheck && test && check:traceability && test:e2e)
```

### 12. Flujo de ramas: main > develop > feature/*

```
main      *----------------------------------------------*  (PR release)
           \ base                                       /
develop     *------*---------*---------*---------*-----*
                    \       / \       / \       / \   /
feature/product-catalog *--*   |     |   |     |   | |
feature/product-search         *----*    |     |   | |
feature/product-detail                   *----*    | |
feature/shopping-cart                              *-*
```

- **Base en `main`**: el primer commit incluye `openspec/` (con este cambio), el tooling, la infraestructura de pruebas, el cliente API, los stores, los atoms, el layout, las rutas con páginas vacías y `NotFoundPage`. Es decir, los grupos 1 a 5 de tasks.md. Ese commit no incluye ninguna de las features.
- `develop` se crea desde ese commit y se publica en `origin`.
- **Una rama por feature**, en este orden: `feature/product-catalog` → `feature/product-search` → `feature/product-detail` → `feature/shopping-cart`. El orden importa: la búsqueda filtra el catálogo y el carrito integra los botones "Agregar" del catálogo y del detalle. Cada rama se crea desde `develop` actualizado, después de integrar la anterior.
- **Agregar desde el catálogo y el detalle**: como el `cartStore` ya existe en la base, los botones "Agregar" de las features 1 y 2 funcionan desde el primer momento. La feature del carrito agrega la página `/cart`, la gestión de líneas y el escenario E2E del flujo completo.
- **PR a `develop`** al terminar cada feature, creado con `gh pr create --base develop`. El cuerpo del PR enlaza `openspec/changes/setup-ecommerce-base` y lista las capacidades y los escenarios cubiertos. Para hacer merge, `npm run verify` tiene que pasar en la rama. Después del merge se borra la rama remota.
- **Release**: con las cuatro features en `develop`, se abre un PR de `develop` a `main`.
- **Protección de ramas en GitHub** para `main` y `develop`: requerir PR, bloquear push directo y force-push. Si se agrega un workflow de CI más adelante, se suma como check obligatorio el job de `verify`.
- Merge con **squash** desde `feature/*` a `develop` (un commit por feature) y **merge commit** desde `develop` a `main` (conserva la historia de la versión).
- `.gitignore` incluye `node_modules`, `dist`, `.env`, `.env.*` (excepto `.env.example`), `test-results`, `playwright-report` y `.features-gen`.

### 13. Feature 1: Menú principal

```
+--------------------------------------------------------------+
| Menu principal                                               |
|                                                              |
| +------------+  +------------+  +------------+  +----------+ |
| | Cafe       |  | Coca-Cola  |  | Ensalada   |  | Hamburg. | |   <- sin imagen:
| | americano  |  |            |  |            |  |          | |      nombre arriba,
| |            |  |            |  |            |  |          | |      precio y boton
| | $3.50 [Agr]|  | $2.50 [Agr]|  | $8.00 [Agr]|  |$12.50 [A]| |      abajo
| +------------+  +------------+  +------------+  +----------+ |
+--------------------------------------------------------------+
  grilla: 1 col (movil) / 2 (sm) / 3 (lg) / 4 (xl)
```

**Orden alfabético**
- `lib/sortProductsByName.ts` ordena una copia con `Intl.Collator('es', { sensitivity: 'base', numeric: true })`. Con eso las mayúsculas y las tildes no afectan el orden, y "Ñ" queda después de "N".
- El orden lo aplica la página sobre los datos de `useProducts()`, con `useMemo`, sin tocar la caché. Si después se suma la búsqueda, primero se filtra y luego se ordena, así los resultados filtrados también quedan de la A a la Z.
- Alternativa descartada: usar `select` en `useProducts`. Mezcla una decisión de presentación con la query y obligaría a que todos los consumidores reciban la lista ordenada.

**Sin imagen**
- Los productos no tienen imagen, así que la tarjeta no reserva un área para ella: muestra el nombre (hasta 2 líneas) arriba y, abajo, el precio y el botón "Agregar". El skeleton de carga tiene la misma forma.
- Se descartó un placeholder con la inicial: ocupaba espacio sin aportar información.

**Tarjeta clicable con un botón dentro**
- Se usa el patrón de "stretched link": el nombre es un `<Link to="/products/:id">` con un pseudo-elemento `after:absolute after:inset-0` que cubre toda la tarjeta. El botón "Agregar" va en `relative z-10`, así queda encima del enlace y no navega.
- Se descartó envolver toda la tarjeta en un `<a>`: un `<button>` dentro de un `<a>` es HTML inválido y rompe la navegación con teclado.
- El foco visible se aplica con `focus-within:ring` en la tarjeta.

**Paleta neutra, minimalista y moderna**
- Se reemplazan los tokens de `@theme` (en `index.css`) por una escala neutra:
  - `--color-primary` pasa a `#171717` (neutral-900), con hover `#404040`;
  - `canvas` a `#fafafa`, `line` a `#e5e5e5`, `muted` a `#737373` y `primary-50` a `#f5f5f5`.
- Como los componentes ya usan tokens, el TopBar, el Sidebar y los botones cambian de paleta sin tocar su código.
- Tarjeta: fondo `surface`, borde `line`, `rounded-card`. En hover: `shadow-md`, `-translate-y-0.5` y transición de 150 ms. Respeta `prefers-reduced-motion` con `motion-safe:`.
- Botón "Agregar": variante `secondary`. En hover pasa a fondo `primary` y texto blanco.
- Tipografía: nombre en `font-medium`, precio en `tabular-nums`, título "Menú principal" en `text-2xl font-semibold tracking-tight`.

**Nivel de cada escenario**
- Los escenarios de "Respuesta visual a la interacción" se ejecutan en `@e2e`, porque jsdom no calcula estilos de hover. Playwright compara el `background-color` computado antes y durante el `hover()`, y comprueba el foco con `toBeFocused` y el estilo del contenedor.
- El resto de los escenarios corren en `@component`.
- "Abrir detalle" y "Orden A a Z" también tienen escenario `@e2e`, para cubrir el flujo real en el navegador.

## Risks / Trade-offs

- [El JWT es visible en el bundle] → Es aceptable solo porque se trata de un token fijo del reto. Queda documentado en `.env.example` y en el README. Si se pasa a producción, el token debería moverse a un proxy o BFF.
- [El contrato de la API es supuesto] → El mapeo queda aislado en `productService` y los fixtures de MSW siguen el contrato provisional. Al conocer la API real cambian solo esos dos archivos.
- [Filtrar en el cliente no escala con catálogos grandes] → Para el tamaño de un restaurante no es problema, y el hook permite cambiar a búsqueda en el servidor sin tocar la UI.
- [`@amiceli/vitest-cucumber` es una librería pequeña] → Si deja de mantenerse, los `.feature` siguen valiendo y solo se reescriben los step files (por ejemplo con `quickpickle`).
- [Las reglas de ESLint por nivel pueden volverse verbosas] → Si crecen demasiado, se migra a `eslint-plugin-boundaries`.
- [Persistir el carrito con un esquema que cambie] → `persist` lleva `version` y `migrate` desde el día uno.
- [Sin CI, "verify antes del merge" depende de la disciplina del equipo] → Se ejecuta `npm run verify` antes de abrir cada PR y su resultado se anota en el cuerpo del PR. Agregar un workflow de GitHub Actions es el siguiente paso natural.
- [La protección de ramas requiere permisos de administrador en el repo] → Si `gh api` no tiene permisos, la tarea queda documentada para configurarla a mano.
- [Un solo cambio de OpenSpec repartido en varias ramas] → Cada PR marca en tasks.md solo las tareas de su grupo. El cambio se archiva cuando el release llega a `main`.

## Migration Plan

No hay nada que migrar porque el repositorio está vacío. Rollback: como es el primer commit, revertirlo devuelve el repo al estado actual.

## Open Questions

- Los valores reales de `VITE_API_URL` y `VITE_API_TOKEN` y los nombres de campo de la API real. Solo afectan a `productService`, los fixtures y `.env`, no a las specs.
- **`category` e `isAvailable`** llegan en la respuesta de la API pero el modelo `Product` no los usa. Se decide al planificar búsqueda y detalle.
- **KioskID**: el kiosco es el 8 (`KioskID=8`, 54 productos). Se configura solo en `VITE_API_URL`.
- **El modelo sin `image` ni `category` afecta a otras specs**, que todavía los mencionan: `product-search` (coincidencia por categoría), `product-detail` (imagen y categoría) y `shopping-cart` (imagen de cada línea). Se resuelven al planificar cada una de esas features. No bloquean el menú principal.
- La moneda y el locale de los precios. Por ahora se usa `en-US` con `USD`, que produce `$12.50` como piden los escenarios (`es` produciría `12,50 US$`). Es configurable en `formatPrice`, pero si se cambia hay que actualizar los escenarios.
