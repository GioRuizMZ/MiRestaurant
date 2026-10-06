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
- [x] 5.3 Crear el template `AppLayout`, `AppLayoutContainer`, el router (`/`, `/products/:id`, `/cart`, `*`), páginas placeholder y `NotFoundPage`. Verificar que las rutas renderizan dentro del layout en el navegador.
- [x] 5.4 Escribir `src/features/app-layout/app-layout.feature` con sus steps (indicador, logo, ruta activa, colapso, móvil, ruta inexistente). Verificar que `npm test` y `npm run check:traceability` pasan.

## 6. Publicar la base y preparar el flujo de ramas (git-workflow)

- [x] 6.1 Escribir el `README.md` (requisitos, `.env`, scripts, estructura, aviso sobre el token en el bundle y flujo `main` > `develop` > `feature/*`). Verificar que los comandos documentados funcionan tal como están escritos.
- [x] 6.2 Ejecutar `npm run verify` y hacer el commit base en `main` con push a `origin`. Verificar con `git log origin/main` que el commit existe.
- [x] 6.3 Crear `develop` desde `main` y publicarla. Verificar que `git rev-parse origin/develop` es igual a `origin/main`.
- [ ] 6.4 Configurar la protección de `main` y `develop` en GitHub (requerir PR, sin push directo ni force-push) con `gh api`, o documentar los pasos manuales si faltan permisos. Verificar que un `git push origin develop` directo es rechazado.

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

## 8. Búsqueda (rama `feature/product-search` → PR a `develop`)

- [ ] 8.1 Crear `feature/product-search` desde `develop` actualizado (con el catálogo ya integrado). Verificar con `git log` que incluye el merge del catálogo.
- [ ] 8.2 Implementar `normalizeText` y `useProductSearch` (debounce de 300 ms, `trim`, más de 3 caracteres, nombre + categoría). Verificar con tests unitarios de umbral, tildes y categoría.
- [ ] 8.3 Conectar la SearchBar en el TopBar, el estado sin resultados con "Limpiar búsqueda" y la navegación a `/` desde otras rutas. Verificar en el navegador.
- [ ] 8.4 Escribir `product-search.feature` con todos los escenarios y sus steps (fake timers para el debounce), y agregar `product-search` a la lista de trazabilidad. Verificar que `npm test` y `npm run check:traceability` pasan.
- [ ] 8.5 Ejecutar `npm run verify`, hacer push y abrir el PR a `develop`. Verificar con `gh pr view`.

## 9. Feature 2: Detalle (rama `feature/product-detail` → PR a `develop`)

- [ ] 9.1 Crear `feature/product-detail` desde `develop` actualizado. Verificar con `git branch --show-current`.
- [ ] 9.2 Crear la molecule `QuantitySelector` y el organism `ProductInfo`. Verificar con tests de render (mínimo 1).
- [ ] 9.3 Implementar `ProductDetailPage` (datos inmediatos, 404, error con reintento, agregar con cantidad y aviso, volver conservando la búsqueda). Verificar en el navegador.
- [ ] 9.4 Escribir `product-detail.feature` con sus steps y agregar `product-detail` a la lista de trazabilidad. Verificar que `npm test` y `npm run check:traceability` pasan.
- [ ] 9.5 Ejecutar `npm run verify`, hacer push y abrir el PR a `develop`. Verificar con `gh pr view`.

## 10. Feature 3: Carrito (rama `feature/shopping-cart` → PR a `develop`)

- [ ] 10.1 Crear `feature/shopping-cart` desde `develop` actualizado. Verificar con `git branch --show-current`.
- [ ] 10.2 Crear la molecule `CartLine` y los organisms `CartList` y `CartSummary`. Verificar con tests de render.
- [ ] 10.3 Implementar `CartPage` (líneas, subtotales, totales, +/−, quitar, vaciar con confirmación, estado vacío). Verificar en el navegador.
- [ ] 10.4 Escribir `shopping-cart.feature` con sus steps y agregar `shopping-cart` a la lista de trazabilidad. Verificar que `npm test` y `npm run check:traceability` pasan.
- [ ] 10.5 Escribir el escenario `@e2e` del flujo completo (buscar "Hamb" → detalle → agregar 2 → indicador "2" → `/cart` con total correcto) en `tests/e2e/features/`. Verificar que `npm run test:e2e` pasa.
- [ ] 10.6 Ejecutar `npm run verify`, hacer push y abrir el PR a `develop`. Verificar con `gh pr view`.

## 11. Release a main

- [ ] 11.1 Con las cuatro features integradas, ejecutar `npm run verify` sobre `develop`. Verificar que termina con código 0.
- [ ] 11.2 Abrir el PR de `develop` a `main` con el resumen de las capacidades entregadas. Verificar con `gh pr view` y, después del merge, que `origin/main` contiene todos los commits de `develop`.
