# Spec Delta

## Purpose

Pantalla de detalle de un producto: muestra su información completa (imagen, nombre, descripción, precio y SKU) en una ruta propia, permite agregar al carrito la cantidad elegida y volver al menú principal.

## ADDED Requirements

### Requirement: Información completa del producto
La ruta `/producto/:id` SHALL mostrar la imagen, el nombre, la descripción, el precio formateado en moneda y el SKU del producto con ese id.

#### Scenario: Ver detalle
- **GIVEN** existe el producto id 7 "Hamburguesa", SKU "PLT-007", precio 12.50, con imagen y descripción
- **WHEN** el usuario abre `/producto/7`
- **THEN** ve la imagen de "Hamburguesa", el nombre "Hamburguesa", su descripción, el precio "$12.50" y el SKU "PLT-007"

### Requirement: Imagen no disponible
Si el producto no tiene imagen o la imagen no carga, el detalle SHALL mostrar en su lugar un fondo neutro del mismo tamaño y el resto de la información sin cambios.

#### Scenario: Producto sin imagen
- **GIVEN** el producto id 7 "Hamburguesa" no tiene imagen
- **WHEN** el usuario abre `/producto/7`
- **THEN** ve un fondo neutro en el lugar de la imagen
- **AND** ve el nombre, la descripción, el precio y el SKU

### Requirement: Agregar al carrito con cantidad
Debajo de la descripción, el detalle SHALL tener un contador de cantidad (inicial 1, mínimo 1, máximo 99) con botones "Disminuir cantidad" y "Aumentar cantidad", y un botón "Agregar al carrito" que suma esa cantidad al pedido. Al agregar, SHALL mostrar el aviso "Agregado al carrito: <cantidad> × <nombre>" y el contador vuelve a 1.

#### Scenario: Agregar varias unidades
- **GIVEN** el carrito está vacío y el usuario está en `/producto/7`
- **WHEN** aumenta la cantidad a 3 y pulsa "Agregar al carrito"
- **THEN** el carrito tiene 3 unidades de "Hamburguesa" y el indicador de la barra superior muestra "3"
- **AND** ve el aviso "Agregado al carrito: 3 × Hamburguesa" y el contador vuelve a 1

#### Scenario: Sumar a un producto que ya está en el carrito
- **GIVEN** el carrito ya tiene 1 unidad de "Hamburguesa" y el usuario está en `/producto/7`
- **WHEN** aumenta la cantidad a 2 y pulsa "Agregar al carrito"
- **THEN** el carrito tiene 3 unidades de "Hamburguesa" en una sola línea

#### Scenario: Cantidad mínima
- **GIVEN** el usuario está en `/producto/7` con la cantidad en 1
- **WHEN** intenta disminuir la cantidad
- **THEN** la cantidad sigue en 1 y el botón "Disminuir cantidad" está deshabilitado

### Requirement: Volver al menú principal
El detalle SHALL tener un botón "Volver al menú principal" que lleva a `/`.

#### Scenario: Volver al menú principal
- **GIVEN** el usuario está en `/producto/7`
- **WHEN** pulsa "Volver al menú principal"
- **THEN** la aplicación navega a `/` y ve el menú principal

### Requirement: Ruta propia que funciona al recargar
El detalle SHALL poder abrirse escribiendo su URL directamente o recargando la página, sin haber pasado antes por el menú principal.

#### Scenario: Abrir el detalle por URL
- **GIVEN** el usuario no visitó el menú principal
- **WHEN** abre `/producto/7` directamente
- **THEN** ve el detalle de "Hamburguesa"

#### Scenario: Recargar la página
- **GIVEN** el usuario está viendo el detalle de "Hamburguesa" en `/producto/7`
- **WHEN** recarga la página
- **THEN** sigue en `/producto/7` y ve el detalle de "Hamburguesa"

### Requirement: Datos inmediatos desde el menú
Si el producto ya se cargó en el menú principal, el detalle SHALL mostrar sus datos de inmediato, sin estado de carga.

#### Scenario: Venir desde el menú principal
- **GIVEN** el menú principal ya mostró "Hamburguesa"
- **WHEN** el usuario hace click en su tarjeta
- **THEN** ve el nombre, el precio y el SKU sin indicador de carga

### Requirement: Producto inexistente
Si no existe un producto con ese id, o el id no es un número, la pantalla SHALL mostrar "Producto no encontrado" y el botón "Volver al menú principal".

#### Scenario: Id inexistente
- **GIVEN** no existe un producto con id 999
- **WHEN** el usuario abre `/producto/999`
- **THEN** ve "Producto no encontrado" y el botón "Volver al menú principal"

#### Scenario: Id no válido
- **WHEN** el usuario abre `/producto/abc`
- **THEN** ve "Producto no encontrado" y el botón "Volver al menú principal"

### Requirement: Estados de carga y error
Mientras carga, el detalle SHALL mostrar un skeleton con la forma de la pantalla. Si la petición falla por un motivo distinto a que el producto no exista, SHALL mostrar el mensaje "No pudimos cargar el producto" y el botón "Reintentar".

#### Scenario: Carga del detalle
- **WHEN** el usuario abre `/producto/7` y la API todavía no responde
- **THEN** ve un skeleton del detalle

#### Scenario: Error de servidor
- **GIVEN** la API responde con error 500
- **WHEN** el usuario abre `/producto/7`
- **THEN** ve el mensaje "No pudimos cargar el producto" y el botón "Reintentar"
