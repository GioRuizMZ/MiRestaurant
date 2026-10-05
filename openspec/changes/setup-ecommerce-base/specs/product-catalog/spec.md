# Spec Delta

## Purpose

Pantalla principal de MiRestaurant: muestra el listado de productos disponibles y es el punto de entrada para ver el detalle o agregar productos al pedido.

## ADDED Requirements

### Requirement: Listado de productos
La pantalla principal (`/`) SHALL mostrar todos los productos devueltos por la API en una grilla de tarjetas. Cada tarjeta muestra imagen, nombre, categoría y precio formateado en moneda.

#### Scenario: Catálogo con productos
- **GIVEN** la API devuelve 3 productos
- **WHEN** el usuario abre la pantalla principal
- **THEN** ve 3 tarjetas, cada una con imagen, nombre, categoría y precio

### Requirement: Estado de carga
Mientras los productos se cargan, la pantalla SHALL mostrar un indicador de carga con la forma de la grilla (skeleton).

#### Scenario: Carga inicial
- **WHEN** el usuario abre la pantalla principal y la API todavía no responde
- **THEN** ve tarjetas skeleton en lugar de productos

### Requirement: Estado de error
Si la carga de productos falla, la pantalla SHALL mostrar un mensaje de error y un botón "Reintentar".

#### Scenario: API caída
- **GIVEN** la API responde con error 500
- **WHEN** el usuario abre la pantalla principal
- **THEN** ve el mensaje "No pudimos cargar los productos" y el botón "Reintentar"

### Requirement: Catálogo vacío
Si la API devuelve una lista vacía, la pantalla SHALL mostrar el mensaje "No hay productos disponibles".

#### Scenario: Sin productos
- **GIVEN** la API devuelve una lista vacía
- **WHEN** el usuario abre la pantalla principal
- **THEN** ve el mensaje "No hay productos disponibles"

### Requirement: Navegación al detalle
Hacer click en una tarjeta de producto (fuera de su botón de agregar) SHALL navegar al detalle de ese producto.

#### Scenario: Abrir detalle
- **WHEN** el usuario hace click en la tarjeta de "Hamburguesa" (id 7)
- **THEN** la aplicación navega a `/products/7`

### Requirement: Agregar desde el catálogo
Cada tarjeta SHALL tener un botón "Agregar" que añade una unidad del producto al carrito sin salir del catálogo.

#### Scenario: Agregar desde la tarjeta
- **WHEN** el usuario pulsa "Agregar" en la tarjeta de "Hamburguesa"
- **THEN** el carrito suma una unidad de "Hamburguesa"
- **AND** el usuario sigue en la pantalla principal
