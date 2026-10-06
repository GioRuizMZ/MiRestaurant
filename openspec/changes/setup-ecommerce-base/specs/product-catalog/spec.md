# Spec Delta

## Purpose

Menú principal de MiRestaurant: muestra los productos disponibles ordenados por nombre y es el punto de entrada para ver el detalle de un producto o agregarlo al pedido.

## ADDED Requirements

### Requirement: Listado de productos
La pantalla principal (`/`) SHALL mostrar, bajo el título "Menú principal", todos los productos devueltos por la API en una grilla de tarjetas. Cada tarjeta muestra la imagen del producto que envía la API, el nombre y el precio formateado en moneda.

#### Scenario: Menú con productos
- **GIVEN** la API devuelve 3 productos
- **WHEN** el usuario abre la pantalla principal
- **THEN** ve el título "Menú principal" y 3 tarjetas, cada una con imagen, nombre y precio

### Requirement: Imagen que no carga
Si un producto no tiene imagen o su imagen no carga, la tarjeta SHALL mostrar en su lugar un fondo neutro del mismo tamaño, para que la grilla conserve su forma.

#### Scenario: Producto sin imagen en el menú
- **GIVEN** la API devuelve "Hamburguesa" sin imagen
- **WHEN** el usuario abre la pantalla principal
- **THEN** la tarjeta de "Hamburguesa" muestra un fondo neutro en lugar de la imagen, con su nombre, su precio y el botón "Agregar"

### Requirement: Orden alfabético por nombre
Los productos SHALL mostrarse ordenados por nombre de la A a la Z, sin distinguir mayúsculas, minúsculas ni tildes, independientemente del orden en que los devuelva la API.

#### Scenario: Orden A a Z
- **GIVEN** la API devuelve "Hot dog", "Hamburguesa", "Ensalada", "Coca-Cola" y "Café americano" en ese orden
- **WHEN** el usuario abre la pantalla principal
- **THEN** ve las tarjetas en el orden "Café americano", "Coca-Cola", "Ensalada", "Hamburguesa", "Hot dog"

#### Scenario: Orden sin distinguir mayúsculas ni tildes
- **GIVEN** la API devuelve "Ñoquis", "agua mineral", "Éclair" y "Burrito"
- **WHEN** el usuario abre la pantalla principal
- **THEN** ve las tarjetas en el orden "agua mineral", "Burrito", "Éclair", "Ñoquis"

### Requirement: Estado de carga
Mientras los productos se cargan, la pantalla SHALL mostrar tarjetas skeleton con la forma de la grilla.

#### Scenario: Carga inicial
- **WHEN** el usuario abre la pantalla principal y la API todavía no responde
- **THEN** ve tarjetas skeleton en lugar de productos

### Requirement: Estado de error
Si la carga de productos falla, la pantalla SHALL mostrar un mensaje de error y un botón "Reintentar" que vuelve a pedir los productos.

#### Scenario: API caída
- **GIVEN** la API responde con error 500
- **WHEN** el usuario abre la pantalla principal
- **THEN** ve el mensaje "No pudimos cargar los productos" y el botón "Reintentar"

#### Scenario: Reintentar tras el error
- **GIVEN** se muestra el error de carga y la API ya responde correctamente
- **WHEN** el usuario pulsa "Reintentar"
- **THEN** ve las tarjetas de los productos

### Requirement: Menú vacío
Si la API devuelve una lista vacía, la pantalla SHALL mostrar el mensaje "No hay productos disponibles".

#### Scenario: Sin productos
- **GIVEN** la API devuelve una lista vacía
- **WHEN** el usuario abre la pantalla principal
- **THEN** ve el mensaje "No hay productos disponibles"

### Requirement: Navegación al detalle
Hacer click en cualquier parte de una tarjeta de producto (imagen, nombre, precio o espacio libre), salvo en su botón "Agregar", SHALL navegar a la pantalla de detalle de ese producto.

#### Scenario: Abrir detalle
- **WHEN** el usuario hace click en la tarjeta de "Hamburguesa" (id 7)
- **THEN** la aplicación navega a `/producto/7`

### Requirement: Agregar desde el menú
Cada tarjeta SHALL tener un botón "Agregar" que suma una unidad del producto al pedido sin salir del menú principal ni abrir el detalle.

#### Scenario: Agregar desde la tarjeta
- **GIVEN** el pedido está vacío
- **WHEN** el usuario pulsa "Agregar" en la tarjeta de "Hamburguesa"
- **THEN** el pedido tiene 1 unidad de "Hamburguesa" y el encabezado muestra "1 producto" y "$12.50"
- **AND** el usuario sigue en la pantalla principal

### Requirement: Respuesta visual a la interacción
Las tarjetas y los botones del menú SHALL cambiar su apariencia al pasar el puntero por encima (hover) y mostrar un indicador de foco visible al navegar con teclado.

#### Scenario: Hover sobre el botón Agregar
- **WHEN** el usuario pasa el puntero sobre el botón "Agregar" de una tarjeta
- **THEN** el color de fondo del botón cambia respecto a su estado normal

#### Scenario: Foco con teclado
- **WHEN** el usuario llega con la tecla Tab a la tarjeta de "Hamburguesa"
- **THEN** la tarjeta muestra un indicador de foco visible
