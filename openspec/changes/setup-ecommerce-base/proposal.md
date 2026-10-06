# Proposal

## Why

MiRestaurant es un repositorio nuevo, sin código. Si el catálogo, el detalle y el carrito se construyen antes de acordar los estándares, cada pantalla terminará resolviendo a su manera el acceso a la API, el estado y la estructura de componentes. Este cambio fija esos estándares como specs verificables (SDD) y ejecutables como `.feature` (BDD), y define la base del proyecto que se publicará en la rama `main`.

## What Changes

- Base del proyecto en la raíz del repo: SPA en TypeScript con Tailwind CSS, React Router, Zustand, Axios y TanStack Query.
- Estándar de **cliente API centralizado**: una única instancia HTTP que adjunta un JWT fijo leído de variables de entorno.
- Estándar de **estado**: los datos del servidor viven en la caché de queries y el estado del cliente (carrito, UI) vive en stores globales, sin duplicar datos entre ambos.
- Estándar de **componentes**: atomic design (atoms, molecules, organisms, templates, pages), con componentes solo de presentación y la lógica en hooks y containers.
- **Layout** de la aplicación: barra superior, barra lateral y un outlet donde se renderizan las rutas hijas.
- Estándar de **pruebas BDD**: los escenarios de las specs se ejecutan como archivos `.feature` en dos niveles, componentes (jsdom + API mockeada) y E2E (navegador real).
- Feature 1, **menú principal**: pantalla principal con los productos ordenados de la A a la Z por nombre. Cada tarjeta muestra imagen (placeholder con la inicial mientras la API no provea imágenes), nombre, precio y un botón "Agregar". Hacer click en la tarjeta abre el detalle. La interfaz es minimalista y moderna, con colores neutros y hovers en botones y tarjetas.
- **Búsqueda**: barra que filtra productos en tiempo real a partir de 4 caracteres y muestra un estado vacío cuando no hay resultados.
- Feature 2, **detalle de producto**: al hacer click en un producto se ve su información completa.
- Feature 3, **carrito**: estado global del pedido. Agregar un producto que ya está en el carrito aumenta su cantidad.
- **Flujo de ramas** `main` > `develop` > `feature/*`: la base del proyecto va a `main`, cada feature se desarrolla en su rama y entra a `develop` por PR, y las versiones pasan de `develop` a `main` por PR.

## Capabilities

### New Capabilities

- `api-client`: acceso HTTP centralizado, configuración por entorno y autenticación con JWT fijo.
- `server-state`: obtención, caché e invalidación de los datos que vienen de la API.
- `global-state`: estado global del cliente (carrito, UI), su alcance y su persistencia.
- `component-architecture`: niveles de atomic design, separación entre presentación y lógica, y reglas de dependencia.
- `app-layout`: estructura de la aplicación con TopBar, Sidebar y Outlet, y navegación entre rutas.
- `testing-bdd`: trazabilidad entre escenarios de spec y archivos `.feature`, y niveles de ejecución.
- `product-catalog`: menú principal con el listado de productos ordenado por nombre, sus estados de carga, error y vacío, y la navegación al detalle.
- `product-search`: filtrado de productos en tiempo real desde la barra de búsqueda.
- `product-detail`: vista con la información completa de un producto.
- `shopping-cart`: gestión del pedido (agregar, acumular cantidades, modificar, quitar y totales).
- `git-workflow`: ramas permanentes, ramas de feature, PRs a `develop`, liberación a `main` y verificación antes del merge.

### Modified Capabilities

Ninguna. El proyecto todavía no tiene specs.

## Impact

- **Código**: se crea toda la base de la app en la raíz de `MiRestaurant` (`package.json`, `src/`, `tests/e2e/`, configuración de tooling).
- **Dependencias nuevas**: react, react-dom, react-router, zustand, axios, @tanstack/react-query, tailwindcss, vitest, @testing-library/react, msw, @amiceli/vitest-cucumber, @playwright/test, playwright-bdd.
- **Configuración**: `VITE_API_URL` y `VITE_API_TOKEN` en `.env` (fuera del repositorio) y un `.env.example` versionado.
- **API**: contrato provisional `GET /products` y `GET /products/:id`, pendiente de confirmar contra la API real.
- **Repositorio**: primer commit en `main` con la base y las specs, creación de `develop`, una rama `feature/*` con su PR a `develop` por cada feature, y protección de `main` y `develop` en GitHub.
