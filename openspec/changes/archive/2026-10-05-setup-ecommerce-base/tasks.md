# Tasks

> Flujo de ramas (ver design.md §12): los grupos 1 a 6 forman la base y se publican en `main`. Los grupos 7 a 10 son una rama `feature/*` cada uno, creada desde `develop`, y terminan con un PR a `develop`. El grupo 11 es el release `develop` → `main`.

## 1. Scaffolding y tooling (base, rama `main`)

- [x] 1.1 Crear el proyecto Vite React + TypeScript en la raíz de `MiRestaurant` (sin pisar `openspec/`), con `strict` y el alias `@/` → `src/`. Verificar que `npm run dev` sirve la app y que `npm run typecheck` pasa.
- [x] 1.2 Instalar las dependencias de runtime (react-router, zustand, axios, @tanstack/react-query, @tanstack/react-query-devtools, tailwindcss, @tailwindcss/vite). Verificar que `npm ls` no muestra dependencias faltantes.
- [x] 1.3 Configurar Tailwind con los tokens de diseño (`@theme`: colores primary/neutral, radios, fuentes) en `src/index.css`. Verificar que una clase `bg-primary` se aplica en el navegador.
- [x] 1.4 Crear `.gitignore` (node_modules, dist, .env, .env.*, !.env.example, test-results, playwright-report, .features-gen) y `.env.example` con `VITE_API_URL` y `VITE_API_TOKEN`. Verificar con `git status` que `.env` queda ignorado.
- [x] 1.5 Crear las carpetas de la estructura definida en el design (atoms, molecules, organisms, templates, layouts, pages, hooks, store, services, api, config, mocks, features, test, tests/e2e). Verificar que existen.
- [x] 1.6 Configurar ESLint con `no-restricted-imports` para `src/components/**` y para cada nivel de atomic design. Verificar con un archivo de prueba temporal que importar `@/store/cartStore` desde un atom hace fallar `npm run lint`.
- [x] 1.7 Agregar los scripts `typecheck`, `test`, `test:watch`, `test:e2e`, `check:traceability` y `verify` a `package.json`. Verificar que `npm run lint && npm run typecheck` pasa.

## 2. Infraestructura de pruebas BDD (base)

- [x] 2.1 Instalar y configurar Vitest (jsdom), Testing Library, jest-dom y MSW. Crear `src/test/setup.ts` y `renderWithProviders`. Verificar que un test de ejemplo pasa con `npm test`.
- [x] 2.2 Crear `src/mocks/data/products.ts` (incluye Hamburguesa id 7, Hot dog, Ensalada, Café americano, Coca-Cola/Bebidas), `handlers.ts`, `server.ts` y `browser.ts`. Verificar que un test de ejemplo recibe los productos mockeados.
- [x] 2.3 Configurar `@amiceli/vitest-cucumber` con un `.feature` de prueba en `src/features/`. Verificar que `npm test` ejecuta el escenario.
- [x] 2.4 Configurar Playwright + `playwright-bdd` con `webServer` en `vite --mode e2e` (MSW en el navegador). Verificar que un `.feature` de humo en `tests/e2e/features/` pasa con `npm run test:e2e`.
- [x] 2.5 Implementar `check:traceability` con la lista de capacidades verificadas (inicialmente solo `app-layout`). Verificar que falla si se quita un `Scenario` de `app-layout.feature` y que lista el escenario faltante.

## 3. Cliente API y estado del servidor (base: api-client, server-state)

- [x] 3.1 Implementar `config/env.ts` con validación y `vite-env.d.ts`. Verificar con tests unitarios que, si falta una variable, el error la nombra.
- [x] 3.2 Implementar `apiClient` (baseURL, Bearer, timeout) y `ApiError` con normalización (500, red, 401). Verificar con tests unitarios usando MSW cada escenario de `api-client`.
- [x] 3.3 Implementar `productService` (`getProducts`, `getProduct`) con mapeo API → `Product`. Verificar con tests unitarios.
- [x] 3.4 Implementar `queryClient` (staleTime 5 min, retry 1 sin 4xx), `providers.tsx`, `queryKeys`, `useProducts` y `useProduct` (con `initialData` tomado del listado). Verificar con tests de hooks que se reutiliza la caché y que un 404 no se reintenta.

## 4. Estado global (base: global-state)

- [x] 4.1 Implementar `cartStore` con `persist` (clave `mirestaurant-cart`, `version`, `migrate`, tolerancia a datos corruptos) y sus acciones. Verificar con tests unitarios que se acumula la cantidad, que `decrement` desde 1 quita la línea y que el estado se restaura.
- [x] 4.2 Implementar `uiStore` y `searchStore` (sin persistencia) y los hooks `useCart` (totales derivados con selectores) y `useDebouncedValue`. Verificar con tests unitarios.

## 5. Componentes base y layout (base: component-architecture, app-layout)

- [x] 5.1 Crear los atoms (Button, IconButton, Input, Badge, Price, Image, Skeleton, Spinner) con `formatPrice`. Verificar con tests de render y que `npm run lint` pasa.
- [x] 5.2 Crear las molecules base (SearchBar, NavItem, EmptyState, ErrorState) y los organisms TopBar y Sidebar como presentación pura. Verificar con tests de render basados en props.
- [x] 5.3 Crear el template `AppLayout`, `AppLayoutContainer`, el router (`/`, `/products/:id` (hoy `/producto/:id`, ver 9.3), `/cart`, `*`), páginas placeholder y `NotFoundPage`. Verificar que las rutas renderizan dentro del layout en el navegador.
- [x] 5.4 Escribir `src/features/app-layout/app-layout.feature` con sus steps (indicador, logo, ruta activa, colapso, móvil, ruta inexistente). Verificar que `npm test` y `npm run check:traceability` pasan.

## 6. Publicar la base y preparar el flujo de ramas (git-workflow)

- [x] 6.1 Escribir el `README.md` (requisitos, `.env`, scripts, estructura, aviso sobre el token en el bundle y flujo `main` > `develop` > `feature/*`). Verificar que los comandos documentados funcionan tal como están escritos.
- [x] 6.2 Ejecutar `npm run verify` y hacer el commit base en `main` con push a `origin`. Verificar con `git log origin/main` que el commit existe.
- [x] 6.3 Crear `develop` desde `main` y publicarla. Verificar que `git rev-parse origin/develop` es igual a `origin/main`.
- [x] 6.4 Configurar la protección de `main` y `develop` en GitHub (requerir PR, sin push directo ni force-push) con `gh api`, o documentar los pasos manuales si faltan permisos. Verificar que un `git push origin develop` directo es rechazado.

## 7. Feature 1: Menú principal (rama `feature/product-catalog` → PR a `develop`)

- [x] 7.1 Crear `feature/product-catalog` desde `develop` actualizado. Verificar con `git branch --show-current`.
- [x] 7.2 Reemplazar los tokens de `@theme` por la paleta neutra (design §13). Verificar que `npm test` sigue pasando y que el TopBar, el Sidebar y los botones se ven en tonos neutros en el navegador.
- [x] 7.3 Implementar `lib/sortProductsByName` con `Intl.Collator('es', { sensitivity: 'base' })`, sin mutar la entrada. Verificar con tests unitarios el orden A→Z, mayúsculas, tildes y Ñ.
- [x] 7.4 Confirmar que la tarjeta no muestra imagen (los productos no tienen imagen). Verificar con tests de render que la tarjeta no tiene `role="img"`.
- [x] 7.5 Crear la molecule `ProductCard` (stretched link al detalle, nombre, precio, botón "Agregar" en `z-10`, hover y `focus-within`) y el organism `ProductGrid` (grilla responsive y estado skeleton). Verificar con tests de render que el click en "Agregar" no navega y que `npm run lint` pasa.
- [x] 7.6 Implementar `CatalogPage` (título "Menú principal", `useProducts` + `sortProductsByName` con `useMemo`, carga, error con reintento, vacío y `addItem` del carrito). Verificar en el navegador contra MSW.
- [x] 7.7 Escribir `src/features/product-catalog/product-catalog.feature` (`@component`) con sus steps y agregar `product-catalog` a `TRACED_CAPABILITIES`. Verificar que `npm test` y `npm run check:traceability` pasan.
- [x] 7.8 Escribir `tests/e2e/features/product-catalog.feature` (`@e2e`) con "Orden A a Z", "Abrir detalle", "Hover sobre el botón Agregar" y "Foco con teclado" y sus steps. Verificar que `npm run test:e2e` pasa.
- [x] 7.10 Sidebar: dejar solo el enlace "Menú" (ícono `menu-book`), quitar "Carrito" (se accede desde la barra superior) y animar la apertura y el cierre en 200 ms (ancho en escritorio, deslizamiento y fondo en móvil, `inert` al cerrarse, `motion-reduce`). Verificar con los escenarios de `app-layout` en `@component` y `@e2e`.
- [x] 7.9 Ejecutar `npm run verify`, hacer push y abrir un PR a `develop` con `gh pr create --base develop` que enlace el cambio de OpenSpec y liste los escenarios. Verificar que el PR existe con `gh pr view`.

## 8. Búsqueda, punto extra (rama `feature/product-search` → PR a `develop`)

> Va después del pedido (grupo 10): es la última rama y trae el escenario E2E del flujo completo. Coincide solo por nombre y con un debounce de 250 ms (design §16).

- [x] 8.1 Crear `feature/product-search` desde `feature/shopping-cart` (PR apilado: el PR #3 todavía no tenía merge y había que entregar las dos features). Verificar con `git log` que incluye el commit del pedido.
- [x] 8.2 Implementar `useProductSearch(products)`: `useDebouncedValue(term, 250)`, `trim`, más de 3 caracteres y `normalizeText(name).includes(...)`. Verificar con tests unitarios el umbral, las tildes, las mayúsculas, la coincidencia en medio del nombre y el término con espacios.
- [x] 8.3 En `CatalogPage`, filtrar con `useProductSearch` antes de `sortProductsByName`. Mostrar el estado sin resultados ('No encontramos productos para "<término>"' y "Limpiar búsqueda") y que el contador del título refleje los resultados. Verificar en el navegador.
- [x] 8.4 En `AppLayoutContainer`, navegar a `/` cuando el término activo (sin espacios, más de 3 caracteres) se escribe fuera del menú. Verificar desde `/producto/7` y desde `/pedido`.
- [x] 8.5 Escribir `src/features/product-search/product-search.feature` (`@component`, con fake timers para el debounce) y sus steps, y agregar `product-search` a `TRACED_CAPABILITIES`. Verificar que `npm test` y `npm run check:traceability` pasan.
- [x] 8.6 Escribir `tests/e2e/features/purchase-flow.feature` (`@e2e`): buscar "Hamb" → detalle → agregar 2 al pedido → el encabezado muestra "2 productos" y "$25.00" → `/pedido` con total $25.00. Verificar que `npm run test:e2e` pasa.
- [x] 8.7 Ejecutar `npm run verify`, hacer push y abrir el PR a `develop`. Verificar con `gh pr view`.

## 9. Feature 2: Detalle del producto (rama `feature/product-detail` → PR a `develop`)

> Se adelanta a la búsqueda (grupo 8) porque no depende de ella. La búsqueda conservada al volver pasa al grupo 8.

- [x] 9.1 Crear `feature/product-detail` desde `develop` actualizado (con el menú principal integrado). Verificar con `git branch --show-current` y que `git log` incluye el merge del PR #1.
- [x] 9.2 Agregar `image` a `Product`, mapearlo en `toProduct` (`null` → `''`), agregar `findProductById(list, id)` y la imagen a los fixtures (`/mock-images/<id>.svg`), más un handler de MSW que sirva esos SVG. Verificar con tests unitarios de `productService`.
- [x] 9.3 Cambiar la ruta del detalle a `/producto/:id` en `routes.tsx`, en el enlace del menú y en los tests y `.feature` de `app-layout` y `product-catalog`. Verificar que `npm test` y `npm run test:e2e` pasan.
- [x] 9.4 Atom `Image`: ícono en el fallback, fallback `aria-hidden` si `alt` está vacío y prop `loading`. Mostrar la imagen en `ProductCard` (4:3, decorativa) y en el skeleton de `ProductGrid`. Verificar con tests de render y con los escenarios "Menú con productos" y "Producto sin imagen en el menú".
- [x] 9.5 Cambiar `useProduct` a `ensureQueryData(productKeys.all)` + `findProductById`, manteniendo `placeholderData`. Verificar con tests de hooks que, con la caché fresca, no se hace una petición nueva y que el 404 no se reintenta.
- [x] 9.6 Crear el organism `ProductInfo` y `ProductInfoSkeleton`. Verificar con tests de render (imagen con `alt`, nombre, descripción, precio y SKU) y que `npm run lint` pasa.
- [x] 9.10 Crear la molecule `QuantitySelector` (1 a 99, botones deshabilitados en los límites) y agregar a `ProductInfo` el contador, el botón "Agregar al carrito" y el aviso, debajo de la descripción. Conectar en la page `addItem(product, quantity)`, el reinicio a 1 y el aviso. Verificar con tests de render y con los escenarios "Agregar varias unidades", "Sumar a un producto que ya está en el carrito" y "Cantidad mínima".
- [x] 9.7 Implementar `ProductDetailPage`: validar el id, mostrar skeleton, error con "Reintentar", "Producto no encontrado" e info, y el botón "Volver al menú principal". Verificar en el navegador, también al recargar `/producto/7`.
- [x] 9.8 Escribir `src/features/product-detail/product-detail.feature` (`@component`) y `tests/e2e/features/product-detail.feature` (`@e2e`: "Ver detalle", "Volver al menú principal" y "Recargar la página") con sus steps, y agregar `product-detail` a `TRACED_CAPABILITIES`. Verificar que `npm test`, `npm run check:traceability` y `npm run test:e2e` pasan.
- [x] 9.9 Ejecutar `npm run verify`, hacer push y abrir el PR a `develop`. Verificar con `gh pr view`.

## 10. Feature 3: Pedido (rama `feature/shopping-cart` → PR a `develop`)

> Va antes que la búsqueda (grupo 8). En la interfaz se dice "pedido" y en el código siguen `cartStore`, `useCart` y `CartItem` (design §15).

- [x] 10.1 Crear `feature/shopping-cart` desde `develop` actualizado (con el detalle integrado). Verificar con `git log` que incluye el merge del PR #2.
- [x] 10.2 Agregar `image` a `CartItem` y copiarla en `addItem`. Subir `persist` a `version: 2`, con `sanitizeItems` y `migrate` que completen `image: ''` en las líneas de la versión 1. Verificar con tests unitarios de `cartStore` (agregar, acumular, migrar un JSON v1 y datos corruptos).
- [x] 10.3 Agregar `useOrderSummary()` (`count` y `total` con selectores primitivos), en lugar de `useCartCount`, y `lib/formatProductCount` ("1 producto" / "N productos"). Verificar con tests unitarios.
- [x] 10.4 Resumen del pedido en `TopBar`: enlace a `/pedido` con ícono, `order-count` y `order-total`, `aria-label` "Ver pedido: …", siempre visible, y compacto en móvil. Conectarlo en `AppLayoutContainer` y `AppLayout`. Verificar con tests de render y a 375 px en el navegador.
- [x] 10.5 Cambiar la ruta `/cart` por `/pedido` (`OrderPage`) y pasar a "pedido" los textos visibles: "Agregar al pedido", "Agregado al pedido: …" y los textos del layout. Actualizar `app-layout.feature` ("Acceso al pedido" en lugar de "Indicador del carrito" y "Carrito vacío"; "Móvil" desde el pedido), `product-catalog` ("Agregar desde la tarjeta") y `product-detail` en sus dos niveles. Verificar que `npm test`, `npm run test:e2e` y `npm run check:traceability` pasan.
- [x] 10.6 Agregar `itemLabel` a `QuantitySelector` y crear la molecule `OrderLine` y los organisms `OrderList` y `OrderSummary` (vaciar con confirmación en línea). Verificar con tests de render y que `npm run lint` pasa.
- [x] 10.7 Implementar `OrderPage`: líneas, subtotales, totales, +/− (disminuir desde 1 quita la línea), "Quitar", "Vaciar pedido" con "Sí, vaciar" y "Cancelar", estado vacío con "Ver el menú" y `BackLink`. Verificar en el navegador.
- [x] 10.8 Escribir `src/features/shopping-cart/shopping-cart.feature` (`@component`) y `tests/e2e/features/shopping-cart.feature` (`@e2e`: "Resumen en el menú y en el detalle" y "Navegar sin perder el pedido") con sus steps, y agregar `shopping-cart` a `TRACED_CAPABILITIES`. Verificar que `npm test`, `npm run check:traceability` y `npm run test:e2e` pasan.
- [x] 10.9 Ejecutar `npm run verify`, hacer push y abrir el PR a `develop`. Verificar con `gh pr view`.

## 11. Release a main

- [x] 11.1 Con las cuatro features integradas (menú, detalle, pedido y búsqueda), ejecutar `npm run verify` sobre `develop`. Verificar que termina con código 0.
- [x] 11.2 Abrir el PR de `develop` a `main` con el resumen de las capacidades entregadas. Verificar con `gh pr view` y, después del merge, que `origin/main` contiene todos los commits de `develop`.
