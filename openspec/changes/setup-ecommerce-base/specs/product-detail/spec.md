# Spec Delta

## Purpose

Pantalla de detalle de un producto: muestra toda su información y permite agregar la cantidad elegida al pedido.

## ADDED Requirements

### Requirement: Información completa del producto
La ruta `/products/:id` SHALL mostrar la imagen ampliada, el nombre, la categoría, la descripción y el precio formateado del producto con ese id.

#### Scenario: Ver detalle
- **GIVEN** existe el producto id 7 "Hamburguesa", categoría "Platos", precio 12.50
- **WHEN** el usuario abre `/products/7`
- **THEN** ve la imagen, el nombre "Hamburguesa", la categoría "Platos", la descripción y el precio "$12.50"

### Requirement: Datos inmediatos desde el catálogo
Si el producto ya se cargó en el catálogo, el detalle SHALL mostrar de inmediato los datos disponibles mientras se completa la información restante.

#### Scenario: Venir desde el catálogo
- **GIVEN** el catálogo ya mostró "Hamburguesa"
- **WHEN** el usuario hace click en su tarjeta
- **THEN** el nombre, la imagen y el precio aparecen sin indicador de carga de pantalla completa

### Requirement: Producto inexistente
Si la API responde que el producto no existe, la pantalla SHALL mostrar "Producto no encontrado" y un enlace para volver al catálogo.

#### Scenario: Id inexistente
- **GIVEN** la API responde 404 para el id 999
- **WHEN** el usuario abre `/products/999`
- **THEN** ve "Producto no encontrado" y un enlace "Volver al catálogo"

### Requirement: Estados de carga y error
El detalle SHALL mostrar un skeleton mientras carga y un mensaje de error con "Reintentar" si la petición falla por un motivo distinto a 404.

#### Scenario: Error de servidor
- **GIVEN** la API responde 500 para el id 7
- **WHEN** el usuario abre `/products/7`
- **THEN** ve un mensaje de error y el botón "Reintentar"

### Requirement: Agregar al carrito con cantidad
El detalle SHALL tener un selector de cantidad (mínimo 1, inicial 1) y un botón "Agregar al carrito" que suma esa cantidad al pedido y confirma la acción con un aviso visible.

#### Scenario: Agregar varias unidades
- **GIVEN** el carrito está vacío
- **WHEN** el usuario elige cantidad 3 y pulsa "Agregar al carrito"
- **THEN** el carrito tiene 3 unidades de "Hamburguesa"
- **AND** ve el aviso "Hamburguesa agregado al carrito"

#### Scenario: Cantidad mínima
- **WHEN** la cantidad es 1 y el usuario pulsa disminuir
- **THEN** la cantidad sigue en 1

### Requirement: Volver al catálogo
El detalle SHALL ofrecer un enlace para volver al catálogo que conserve la búsqueda activa.

#### Scenario: Volver con búsqueda activa
- **GIVEN** el usuario llegó al detalle desde el catálogo filtrado por "Hamb"
- **WHEN** pulsa "Volver al catálogo"
- **THEN** ve el catálogo todavía filtrado por "Hamb"
