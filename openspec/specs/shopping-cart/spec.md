# shopping-cart Specification

## Purpose
Gestiona el pedido del usuario como estado global: qué productos lleva, en qué cantidades y cuánto suma. Un resumen en el encabezado lo muestra en todas las pantallas, y la pantalla `/pedido` permite revisarlo y modificarlo.

## Requirements

### Requirement: Agregar un producto nuevo
Agregar un producto que no está en el pedido SHALL crear una línea con ese producto y la cantidad indicada.

#### Scenario: Primer producto
- **GIVEN** el pedido está vacío
- **WHEN** el usuario agrega 1 "Hamburguesa"
- **THEN** el pedido tiene una línea "Hamburguesa" con cantidad 1

### Requirement: Acumular cantidad del mismo producto
Agregar un producto que ya está en el pedido SHALL aumentar la cantidad de su línea, sin crear una línea nueva, tanto desde el menú principal como desde el botón "Agregar al pedido" del detalle.

#### Scenario: Agregar el mismo producto dos veces
- **GIVEN** el pedido tiene 1 "Hamburguesa"
- **WHEN** el usuario agrega otra vez 1 "Hamburguesa"
- **THEN** el pedido tiene una sola línea "Hamburguesa" con cantidad 2

#### Scenario: Agregar el mismo producto desde el detalle
- **GIVEN** el pedido tiene 2 "Hamburguesa"
- **WHEN** el usuario elige cantidad 3 en el detalle y pulsa "Agregar al pedido"
- **THEN** el pedido tiene una sola línea "Hamburguesa" con cantidad 5

### Requirement: Resumen del pedido en el encabezado
El encabezado (barra superior) SHALL mostrar en todas las pantallas la cantidad total de productos del pedido (suma de las unidades de todas las líneas) y el monto total en moneda. Con 1 unidad dice "1 producto". Con el pedido vacío muestra "0 productos" y "$0.00".

#### Scenario: Resumen en el menú y en el detalle
- **GIVEN** el pedido tiene 2 "Hamburguesa" a $12.50 y 1 "Ensalada" a $8.00
- **WHEN** el usuario está en el menú principal y después abre `/producto/7`
- **THEN** en las dos pantallas el encabezado muestra "3 productos" y "$33.00"

#### Scenario: Pedido vacío en el encabezado
- **GIVEN** el pedido está vacío
- **WHEN** el usuario abre el menú principal
- **THEN** el encabezado muestra "0 productos" y "$0.00"

#### Scenario: Encabezado actualizado al agregar
- **GIVEN** el pedido tiene 2 "Hamburguesa" a $12.50
- **WHEN** el usuario pulsa "Agregar" en la tarjeta de "Ensalada"
- **THEN** el encabezado muestra "3 productos" y "$33.00" sin recargar la página

### Requirement: El pedido se mantiene al navegar
El pedido SHALL ser el mismo en todas las pantallas y conservarse al navegar entre el menú principal, el detalle y la pantalla del pedido.

#### Scenario: Navegar sin perder el pedido
- **GIVEN** el usuario agregó 2 "Hamburguesa" desde `/producto/7`
- **WHEN** vuelve al menú principal y abre el detalle de "Ensalada"
- **THEN** el encabezado sigue mostrando "2 productos" y "$25.00"

### Requirement: Pantalla del pedido
La ruta `/pedido` SHALL listar cada línea con imagen, nombre, precio unitario, cantidad y subtotal (precio × cantidad), además del total de productos y el monto total. Pulsar el resumen del encabezado SHALL abrir esta pantalla.

#### Scenario: Abrir el pedido desde el encabezado
- **WHEN** el usuario pulsa el resumen del pedido en el encabezado
- **THEN** la aplicación navega a `/pedido`

#### Scenario: Ver el pedido
- **GIVEN** el pedido tiene 2 "Hamburguesa" a $12.50 y 1 "Ensalada" a $8.00
- **WHEN** el usuario abre `/pedido`
- **THEN** ve el subtotal $25.00 para "Hamburguesa" y $8.00 para "Ensalada"
- **AND** ve el total $33.00 y 3 productos

### Requirement: Modificar cantidades
En la pantalla del pedido el usuario SHALL poder aumentar o disminuir la cantidad de cada línea. Disminuir desde 1 elimina la línea.

#### Scenario: Aumentar cantidad
- **GIVEN** la línea "Ensalada" tiene cantidad 1
- **WHEN** el usuario pulsa aumentar en esa línea
- **THEN** la línea tiene cantidad 2 y los totales se recalculan

#### Scenario: Disminuir desde 1
- **GIVEN** la línea "Ensalada" tiene cantidad 1
- **WHEN** el usuario pulsa disminuir en esa línea
- **THEN** la línea "Ensalada" desaparece del pedido

### Requirement: Quitar y vaciar
El usuario SHALL poder quitar una línea completa y vaciar todo el pedido. Vaciar pide confirmación dentro de la pantalla.

#### Scenario: Quitar línea
- **WHEN** el usuario pulsa "Quitar" en la línea "Hamburguesa"
- **THEN** la línea desaparece y los totales se recalculan

#### Scenario: Vaciar pedido
- **GIVEN** el pedido tiene productos
- **WHEN** el usuario pulsa "Vaciar pedido" y confirma
- **THEN** el pedido queda vacío

#### Scenario: Cancelar vaciado
- **GIVEN** el pedido tiene productos
- **WHEN** el usuario pulsa "Vaciar pedido" y cancela
- **THEN** el pedido conserva todas sus líneas

### Requirement: Pedido vacío
Cuando el pedido no tiene líneas, la pantalla SHALL mostrar "Tu pedido está vacío" y un enlace "Ver el menú" que lleva al menú principal.

#### Scenario: Abrir pedido vacío
- **GIVEN** el pedido está vacío
- **WHEN** el usuario abre `/pedido`
- **THEN** ve "Tu pedido está vacío" y un enlace "Ver el menú"

### Requirement: Datos guardados al agregar
Cada línea SHALL conservar el nombre, la imagen y el precio unitario que tenía el producto al momento de agregarlo, para que el pedido se muestre sin pedir datos a la API.

#### Scenario: Pedido sin conexión a la API
- **GIVEN** el pedido tiene 1 "Hamburguesa" y la API no responde
- **WHEN** el usuario abre `/pedido`
- **THEN** ve la línea "Hamburguesa" con su precio y los totales correctos
