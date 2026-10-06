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
|   |   +-- molecules/           # SearchBar, ProductCard, QuantitySelector, BackLink, OrderLine, EmptyState, ErrorState, NavItem
|   |   +-- organisms/           # TopBar, Sidebar, ProductGrid, ProductInfo, OrderList, OrderSummary
|   |   +-- templates/           # AppLayout (TopBar + Sidebar + slot de contenido)
|   +-- layouts/
|   |   +-- AppLayoutContainer.tsx  # lee stores/hooks -> props de AppLayout, renderiza <Outlet/>
|   +-- pages/
|   |   +-- CatalogPage.tsx
|   |   +-- ProductDetailPage.tsx
|   |   +-- OrderPage.tsx        # /pedido
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
- `useProduct(id)` obtiene el listado con `queryClient.ensureQueryData(productKeys.all)` y busca el id en él (la API no tiene endpoint por id, ver §9). Si el listado está fresco en caché, no hace ninguna petición. Si no lo está (URL directa o recarga), lo pide una vez y lo deja en caché, también para el menú. Mientras tanto usa `placeholderData` con el producto del listado. Ver §14.
- `retry: (count, err) => count < 1 && !(err.status >= 400 && err.status < 500)`.

### 6. Búsqueda

- `searchStore.term` es el texto que escribe el usuario. El input es controlado y se actualiza con cada tecla.
- `useProductSearch(products)`: aplica `useDebouncedValue(term, 250)`, luego `trim`, y si `length > 3` filtra con `normalizeText(name).includes(normalizeText(term))`. Si no, devuelve todos los productos. Ver §16.
- Por qué se filtra en el cliente: el catálogo de un restaurante es chico y ya está en caché, así que filtrar en el cliente no agrega peticiones. Si después la API ofrece búsqueda, solo cambia el hook: pasaría a ser `useQuery(['products', 'search', term])`, sin tocar los componentes.
- Si se escribe fuera de `/`, `AppLayoutContainer` navega a `/` cuando el término supera el umbral (ver el escenario "Buscar desde otra pantalla").
- El término no se persiste: se pierde al recargar y se conserva al navegar.

### 7. Carrito (en la interfaz, "pedido")

- `cartStore`: `items: CartItem[]` con `{ id, sku, name, image, price, quantity }` (`image` se suma en la feature 3, ver §15). Acciones: `addItem(product, qty = 1)` (si el id ya existe, suma), `increment(id)`, `decrement(id)` (si llega a 0, quita la línea), `removeItem(id)` y `clear()`.
- Los valores derivados (`totalItems`, `totalPrice`, `subtotal`) se calculan en `useCart` con selectores, no se guardan en el store.
- `persist` usa la clave `mirestaurant-cart` con `version: 2` (la 2 agrega `image`) y una función `migrate`. Si el JSON está corrupto, se arranca con el carrito vacío.
- El precio guardado en la línea es una decisión de la spec: el carrito no depende de la API.

### 8. Layout y rutas

```
createBrowserRouter([
  { element: <AppLayoutContainer/>, errorElement: <NotFoundPage/>, children: [
      { path: '/',             element: <CatalogPage/> },
      { path: '/producto/:id', element: <ProductDetailPage/> },
      { path: '/pedido',       element: <OrderPage/> },
      { path: '*',             element: <NotFoundPage/> },
  ]}
])
```

`AppLayout` (template) recibe `orderCount`, `orderTotal`, `searchValue`, `onSearchChange`, `sidebarOpen`, `onToggleSidebar` y `children`, y no sabe nada de los stores. Breakpoint `md` (768 px): por debajo, el sidebar es un drawer superpuesto que se cierra con cada cambio de `location`.

### 9. Contrato de la API (SrKiosco)

```
GET <VITE_API_URL>     p. ej. https://srkiosco-api-beta.azurewebsites.net/SrKioscoRemote/GetProducts?KioskID=8
Authorization: Bearer <VITE_API_TOKEN>
-> { isSuccess: boolean, code: string, message: string, data: ProductDto[] | null }

ProductDto = { id, sku, barcode, name, description, image, price, isAvailable,
               reference, category, orderIndex, printers[], modifier[] }
Product    = { id: number; sku: string; name: string; description: string; price: number; image: string }
```

- `VITE_API_URL` es la **URL absoluta** del endpoint y se usa tal cual: el cliente no tiene `baseURL` ni concatena rutas.
- Los productos se leen de `data`. `isSuccess` se ignora porque llega en `false` incluso con `code: "0000"` ("Procesado exitosamente").
- **No hay endpoint por id**: `getProduct(id)` busca en la lista y lanza `ApiError` 404 si no existe.
- El mapeo `ProductDto → Product` vive solo en `productService`. `image` es una URL absoluta (blob de Azure) y se convierte en `''` si llega `null`. `category` (un id numérico) e `isAvailable` todavía no se usan (ver Open Questions).
- MSW simula el endpoint `*/SrKioscoRemote/GetProducts` con el mismo sobre.

### 10. BDD en dos niveles

- **@component**: `src/features/<capacidad>/<capacidad>.feature` + `*.steps.tsx` con `@amiceli/vitest-cucumber` (`loadFeature` / `describeFeature`). Usa `renderWithProviders` con un `QueryClient` nuevo por escenario (con `retry: false`), MSW con `server.use()` para los casos de error, y reinicia los stores en `beforeEach`.
- **@e2e**: `tests/e2e/features/*.feature` con `playwright-bdd` (`defineBddConfig`). La app se levanta con `vite --mode e2e`, que activa el worker de MSW con los mismos `handlers.ts`. Escenario mínimo: buscar "Hamb" → abrir detalle → agregar 2 al pedido → encabezado "2 productos" y "$25.00" → `/pedido` con total correcto.
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
- **Una rama por feature**. El orden real quedó así: `feature/product-catalog` → `feature/product-detail` → `feature/shopping-cart` → `feature/product-search`. El detalle no dependía de la búsqueda, y la búsqueda (punto extra del enunciado) va al final, junto con el escenario E2E del flujo completo, que la necesita. Cada rama se crea desde `develop` actualizado, después de integrar la anterior.
- **Agregar desde el catálogo y el detalle**: como el `cartStore` ya existe en la base, los botones "Agregar" de las features 1 y 2 funcionan desde el primer momento. La feature del pedido agrega el resumen del encabezado, la página `/pedido` y la gestión de líneas.
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
| | [ imagen ] |  | [ imagen ] |  | [ imagen ] |  | [imagen] | |   <- imagen 4:3 arriba
| | Cafe       |  | Coca-Cola  |  | Ensalada   |  | Hamburg. | |      (fondo neutro si
| | americano  |  |            |  |            |  |          | |      falta o no carga),
| | $3.50 [Agr]|  | $2.50 [Agr]|  | $8.00 [Agr]|  |$12.50 [A]| |      nombre, precio y boton
| +------------+  +------------+  +------------+  +----------+ |
+--------------------------------------------------------------+
  grilla: 1 col (movil) / 2 (sm) / 3 (lg) / 4 (xl)
```

**Orden alfabético**
- `lib/sortProductsByName.ts` ordena una copia con `Intl.Collator('es', { sensitivity: 'base', numeric: true })`. Con eso las mayúsculas y las tildes no afectan el orden, y "Ñ" queda después de "N".
- El orden lo aplica la página sobre los datos de `useProducts()`, con `useMemo`, sin tocar la caché. Si después se suma la búsqueda, primero se filtra y luego se ordena, así los resultados filtrados también quedan de la A a la Z.
- Alternativa descartada: usar `select` en `useProducts`. Mezcla una decisión de presentación con la query y obligaría a que todos los consumidores reciban la lista ordenada.

**Imagen de la tarjeta** (actualizado en la feature 2)
- Al principio la tarjeta no tenía imagen. Al revisar la API se vio que los 54 productos del kiosco traen `image` y que 53 de esas URLs cargan (una responde 404), así que la tarjeta muestra la imagen arriba, en un área `aspect-[4/3]` con `object-cover`.
- Si `image` está vacío o la imagen falla (`onError`), el atom `Image` muestra un fondo neutro del mismo tamaño. Así todas las tarjetas tienen la misma altura y la grilla conserva su forma.
- En la tarjeta la imagen es decorativa (`alt=""`): el nombre ya está en el enlace y repetirlo haría que el lector de pantalla lo leyera dos veces. El skeleton de carga incluye el área de la imagen.

**Tarjeta clicable con un botón dentro**
- Se usa el patrón de "stretched link": el nombre es un `<Link to="/producto/:id">` con un pseudo-elemento `after:absolute after:inset-0` que cubre toda la tarjeta. El botón "Agregar" va en `relative z-10`, así queda encima del enlace y no navega.
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

### 14. Feature 2: Detalle del producto

```
+--------------------------------------------------------------+
| [<- Volver al menu principal]                                |
|                                                              |
| +-------------------------+   Hamburguesa          (h1)      |
| |                         |   SKU: PLT-007         (muted)   |
| |   imagen 1:1            |   $12.50               (grande)  |
| |   (fondo neutro si      |                                  |
| |    falta o no carga)    |   Descripcion                    |
| +-------------------------+   Hamburguesa de res a la ...    |
|                               [-] 1 [+]  [Agregar al pedido] |
|                               Agregado al pedido: 1 × ...    |
+--------------------------------------------------------------+
  movil: una columna (imagen arriba). md+: dos columnas.
```

**Ruta en español: `/producto/:id`**
- Reemplaza a `/products/:id` en el router, en el enlace de la tarjeta del menú y en las specs `app-layout`, `product-catalog` y `product-search`. La ruta vieja deja de existir y cae en `NotFoundPage`. No hace falta redirigirla porque la app todavía no se publicó.

**Funciona al recargar**
- La app es una SPA con `createBrowserRouter`. `vite` y `vite preview` ya devuelven `index.html` para cualquier ruta (history fallback): al recargar `/producto/7` se monta la app y el router resuelve la ruta.
- El detalle no depende de nada que solo exista en memoria: con la caché vacía, `useProduct` pide el listado y busca el id. Se prueba en dos niveles: "Abrir el detalle por URL" (`@component`, caché vacía) y "Recargar la página" (`@e2e`, `page.reload()` en un navegador real).
- Si la app se publica en un hosting estático, hay que configurar el mismo fallback (por ejemplo `_redirects` en Netlify o `rewrites` en Vercel). Queda anotado en Risks.

**Obtención de datos sin pedir dos veces**
- `useProduct(id)` usa como `queryFn` `ensureQueryData(productKeys.all)` seguido de `findProductById(list, id)` (de `productService`), que lanza `ApiError` 404 si no encuentra el id. Al venir del menú, la caché está fresca: no hay petición y los datos salen por `placeholderData` en el primer render. Así se cumple "Venir desde el menú principal".
- Se descartó dejar `getProduct(id)` como `queryFn`: pide el listado completo en cada visita al detalle y no llena la caché del menú.
- El 404 no se reintenta (`shouldRetry` ya excluye los 4xx), así que "Producto no encontrado" aparece de inmediato.

**Id no válido**
- `ProductDetailPage` valida `useParams().id` con `/^\d+$/`. Si no es un número, muestra "Producto no encontrado" sin llamar a la API (la query queda con `enabled: false`).

**Componentes**
- Organism `ProductInfo` (presentación): recibe `product` (`name`, `description`, `price`, `sku`, `image`) y pinta la grilla de dos columnas. También exporta `ProductInfoSkeleton`, con la misma forma y `role="status"` con el nombre "Cargando producto".
- Atom `Image`: conserva el fallback a un fondo neutro y le suma un ícono de imagen centrado. Si `alt` está vacío, el fallback queda `aria-hidden` (decorativo). En el detalle, `alt` es el nombre del producto y la imagen usa `loading="eager"` porque es el contenido principal.
- "Volver al menú principal" es un `<Link to="/">` con estilo de botón y el ícono `arrow-left`. Es un enlace y no un `<button>` porque navega: se puede abrir en otra pestaña y el lector de pantalla lo anuncia como enlace. Va arriba del contenido y también en los estados de "no encontrado" y de error.
- `ProductDetailPage` (page): lee el id, llama a `useProduct` y elige entre skeleton, error con "Reintentar", "Producto no encontrado" o `ProductInfo`. No tiene marcado propio de la información del producto.
- Molecule `QuantitySelector` (presentación): `value`, `min`, `max` y `onChange`. Pinta los botones "Disminuir cantidad" y "Aumentar cantidad" (`IconButton` con `minus` y `plus`), que se deshabilitan en los límites, y el valor con `aria-live="polite"`. El estado de la cantidad vive en la page, no en el store: es un dato de la pantalla.
- `ProductInfo` recibe la cantidad, `onQuantityChange`, `onAdd` y `addedMessage` por props, y pinta el contador y el botón "Agregar al pedido" (variante `primary`, ícono `cart`; antes "Agregar al carrito", ver §15) debajo de la descripción. El aviso va en un `role="status"` para que el lector de pantalla lo anuncie.
- `ProductDetailPage` llama a `useAddToCart()` con `addItem(product, quantity)`. El store ya suma a la línea existente. Después vuelve la cantidad a 1 y guarda el texto del aviso. El aviso se borra al cambiar la cantidad o de producto. No hay un toast global: el aviso aparece junto al botón, donde el usuario está mirando.
- Máximo 99 unidades por agregado: evita cantidades accidentales y mantiene el contador angosto.
- Quedan fuera de esta feature la categoría y conservar la búsqueda al volver.

**Datos de prueba**
- Los fixtures de `src/mocks/data/products.ts` agregan `image: '/mock-images/<id>.svg'`. Un handler de MSW responde a `*/mock-images/:file` con un SVG generado. Así el nivel `@e2e` muestra imágenes reales sin agregar archivos a `public/` ni depender del blob de Azure.

**Nivel de cada escenario**
- `@component`: todos menos "Recargar la página".
- `@e2e`: "Recargar la página", "Ver detalle", "Volver al menú principal" y "Agregar varias unidades", para cubrir la URL real, la imagen cargada y el resumen del pedido en el navegador.

### 15. Feature 3: Pedido

```
+-----------------------------------------------------------------------+
| [=] MiRestaurant  [ Buscar productos...      ]  [(cart) 3 productos   |
|                                                         $33.00     ]  | <- enlace a /pedido
+-----------------------------------------------------------------------+
  movil: [(cart)3] $33.00  (el numero va en un badge sobre el icono)

/pedido
+--------------------------------------------------------------+
| [<- Volver al menu principal]                                |
| Tu pedido                                                    |
| +--------------------------------------+  +----------------+ |
| | [img] Hamburguesa     $12.50 c/u     |  | 3 productos    | |
| |       [-] 2 [+]   $25.00   [Quitar]  |  | Total  $33.00  | |
| | [img] Ensalada        $8.00 c/u      |  |                | |
| |       [-] 1 [+]   $8.00    [Quitar]  |  | [Vaciar pedido]| |
| +--------------------------------------+  +----------------+ |
+--------------------------------------------------------------+
  movil: una columna, el resumen debajo de las lineas
```

**"Pedido" en la interfaz, `cart` en el código**
- Todo el texto visible dice "pedido": el botón "Agregar al pedido" del detalle, el aviso "Agregado al pedido: 3 × Hamburguesa", la ruta `/pedido`, el título "Tu pedido" y "Vaciar pedido".
- En el código se mantienen `cartStore`, `useCart` y `CartItem`. Renombrarlos tocaría el store, su clave de `localStorage` y todos los tests sin cambiar nada visible. Los componentes y la página nuevos sí usan "Order" (`OrderPage`, `OrderLine`, `OrderList`, `OrderSummary`), porque nombran pantallas del dominio.
- La ruta `/cart` desaparece y cae en `NotFoundPage`. No hace falta redirigir porque la app no se publicó.

**Resumen en el encabezado**
- `useCart.ts` agrega `useOrderSummary()`, que devuelve `{ count, total }` con dos selectores de valores primitivos (`reduce` sobre `items`). Así el encabezado solo se vuelve a renderizar cuando cambia alguno de los dos números. Reemplaza a `useCartCount()`.
- `AppLayoutContainer` pasa `orderCount` y `orderTotal` al template. `TopBar` (presentación) pinta un `<Link to="/pedido">` con el ícono, "N producto(s)" (`data-testid="order-count"`) y el monto con `formatPrice` (`data-testid="order-total"`). El `aria-label` es "Ver pedido: 3 productos, $33.00".
- Se ve siempre, también con el pedido vacío ("0 productos", "$0.00"). Así el usuario sabe dónde va a aparecer lo que agregue. Esto reemplaza al badge que antes se ocultaba con el carrito vacío.
- En móvil, el texto "productos" se oculta (`sm:inline`): el número va en un badge sobre el ícono, al lado del monto, para que el resumen quepa junto al buscador.
- Pluralización: una función `formatProductCount(n)` en `lib/` devuelve "1 producto" o "N productos". La usan el encabezado y la página.

**Imagen en las líneas**
- `CartItem` agrega `image`, y `addItem` la copia del producto, igual que el nombre y el precio ("Datos guardados al agregar").
- `persist` pasa a `version: 2`. `sanitizeItems` acepta líneas sin `image` (guardadas con la versión 1) y les pone `''`. Así un pedido ya guardado no se pierde al actualizar la app, y la línea muestra el fondo neutro del atom `Image`.

**Pantalla `/pedido`**
- Molecule `OrderLine`: imagen (decorativa, 64 px), nombre, precio unitario "c/u", `QuantitySelector`, subtotal y botón "Quitar". `QuantitySelector` suma la prop `itemLabel`, así los botones de cada línea tienen un nombre único ("Aumentar cantidad de Ensalada"), y en esta pantalla se usa con `min={0}`: disminuir desde 1 llama a `decrement`, que quita la línea.
- Organism `OrderList`: lista (`<ul aria-label="Líneas del pedido">`) de `OrderLine`.
- Organism `OrderSummary`: total de productos, monto total y "Vaciar pedido". La confirmación es en línea ("¿Vaciar el pedido?" con "Sí, vaciar" y "Cancelar"), con estado local del organism. Se descartó `window.confirm`: bloquea la página, no se puede estilizar y complica las pruebas.
- `OrderPage` (page): usa `useCart()` y pasa líneas, totales y acciones como props. Con el pedido vacío muestra `EmptyState` con "Tu pedido está vacío" y el enlace "Ver el menú". Arriba, `BackLink` "Volver al menú principal".
- El pedido no pide nada a la API: se pinta solo con el store ("Pedido sin conexión a la API").

**Se mantiene al navegar**
- Ya pasa con Zustand: el store vive fuera del árbol de rutas, así que cambiar de pantalla no lo reinicia. Además `persist` lo conserva al recargar (spec `global-state`). El escenario "Navegar sin perder el pedido" lo comprueba con el router en memoria, sin recargar.

**Nivel de cada escenario**
- `@component`: todos los de `shopping-cart`.
- `@e2e`: "Resumen en el menú y en el detalle" y "Navegar sin perder el pedido", con navegación real en el navegador.

### 16. Búsqueda (punto extra)

Se mantiene la spec `product-search` existente (buscador en la barra superior, umbral de 4 caracteres, navegación al menú desde otras pantallas), con dos ajustes:

- **Solo por nombre**. La API envía `category` como un id numérico sin nombre, así que no hay texto de categoría con el que comparar. Se reemplazó el escenario "Coincidencia por categoría" por "Coincidencia en medio del nombre". Si más adelante la API envía el nombre de la categoría, se agrega al texto que compara `useProductSearch`, sin cambiar los componentes.
- **Debounce de 250 ms**. El escenario "Escritura continua" pide el resultado en menos de 300 ms después de dejar de escribir. Con 250 ms queda margen para el render.

**Flujo**
- `CatalogPage` aplica primero `useProductSearch(data)` y después `sortProductsByName`, así los resultados también quedan de la A a la Z.
- Sin coincidencias: `EmptyState` con 'No encontramos productos para "<término>"' y el botón "Limpiar búsqueda", que llama a `searchStore.clear()`.
- El contador "N productos" del título refleja los resultados filtrados.
- Buscar desde otra pantalla: el handler `onSearchChange` de `AppLayoutContainer` navega a `/` cuando el nuevo término, sin espacios, tiene más de 3 caracteres y la ruta no es `/`. Usa el término sin debounce para que la navegación sea inmediata; el filtrado igual espera el debounce. Va en el handler y no en un efecto: con un efecto, abrir un detalle con una búsqueda activa devolvería al usuario al menú.
- Los tests del debounce usan `vi.useFakeTimers` y el `advanceTimers` de `renderApp`, que ya existe.

**Flujo E2E completo** (spec `testing-bdd`, "Flujo de compra completo"): en `tests/e2e/features/purchase-flow.feature`: buscar "Hamb" → abrir "Hamburguesa" → agregar 2 al pedido → el encabezado muestra "2 productos" y "$25.00" → abrir `/pedido` y ver el total $25.00. Va en esta rama porque es la última y la que completa el flujo.

## Risks / Trade-offs

- [Pedido guardado con la versión 1 del store] → `migrate` y `sanitizeItems` completan `image` con `''`. La línea se muestra con el fondo neutro en vez de perderse.
- [Encabezado angosto en móvil con buscador y resumen] → En pantallas chicas el resumen se reduce al ícono con badge y el monto. Se verifica a 375 px.

- [Recarga en un hosting estático sin fallback] → `/producto/7` respondería 404 desde el servidor. En desarrollo y en `vite preview` funciona. Al publicar, el hosting tiene que reescribir las rutas a `index.html` (ver §14).
- [Imágenes externas que no cargan] → Hoy una de las 54 responde 404. El fallback neutro del atom `Image` cubre ese caso en el menú y en el detalle.

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
- **`category` e `isAvailable`** llegan en la respuesta de la API, pero el modelo `Product` no los usa. `category` es un id numérico sin nombre, así que ni el detalle ni la búsqueda lo usan (ver §16).
- **KioskID**: el kiosco es el 8 (`KioskID=8`, 54 productos). Se configura solo en `VITE_API_URL`.
- La moneda y el locale de los precios. Por ahora se usa `en-US` con `USD`, que produce `$12.50` como piden los escenarios (`es` produciría `12,50 US$`). Es configurable en `formatPrice`, pero si se cambia hay que actualizar los escenarios.
