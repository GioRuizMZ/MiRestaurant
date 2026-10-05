# Spec Delta

## Purpose

Gestiona el pedido del usuario como estado global: qué productos lleva, en qué cantidades y cuánto suma, disponible desde cualquier pantalla.

## ADDED Requirements

### Requirement: Agregar un producto nuevo
Agregar un producto que no está en el carrito SHALL crear una línea con ese producto y la cantidad indicada.

#### Scenario: Primer producto
- **GIVEN** el carrito está vacío
- **WHEN** el usuario agrega 1 "Hamburguesa"
- **THEN** el carrito tiene una línea "Hamburguesa" con cantidad 1

### Requirement: Acumular cantidad del mismo producto
Agregar un producto que ya está en el carrito SHALL aumentar la cantidad de su línea existente, sin crear una línea nueva.

#### Scenario: Agregar el mismo producto dos veces
- **GIVEN** el carrito tiene 1 "Hamburguesa"
- **WHEN** el usuario agrega otra vez 1 "Hamburguesa"
- **THEN** el carrito tiene una sola línea "Hamburguesa" con cantidad 2

#### Scenario: Agregar el mismo producto desde el detalle
- **GIVEN** el carrito tiene 2 "Hamburguesa"
- **WHEN** el usuario agrega 3 "Hamburguesa" desde el detalle
- **THEN** el carrito tiene una sola línea "Hamburguesa" con cantidad 5

### Requirement: Estado compartido en toda la aplicación
El carrito SHALL ser el mismo en todas las pantallas: un cambio hecho en una pantalla se refleja de inmediato en el indicador de la barra superior y en la pantalla del carrito.

#### Scenario: Indicador sincronizado
- **GIVEN** el indicador de la barra superior muestra "2"
- **WHEN** el usuario agrega 1 producto desde el catálogo
- **THEN** el indicador muestra "3" sin recargar la página

### Requirement: Pantalla del carrito
La ruta `/cart` SHALL listar cada línea con imagen, nombre, precio unitario, cantidad y subtotal (precio × cantidad), además del total del pedido y el total de unidades.

#### Scenario: Ver el pedido
- **GIVEN** el carrito tiene 2 "Hamburguesa" a $12.50 y 1 "Ensalada" a $8.00
- **WHEN** el usuario abre `/cart`
- **THEN** ve el subtotal $25.00 para "Hamburguesa" y $8.00 para "Ensalada"
- **AND** ve el total $33.00 y 3 unidades

### Requirement: Modificar cantidades
En la pantalla del carrito el usuario SHALL poder aumentar o disminuir la cantidad de cada línea. Disminuir desde 1 elimina la línea.

#### Scenario: Aumentar cantidad
- **GIVEN** la línea "Ensalada" tiene cantidad 1
- **WHEN** el usuario pulsa aumentar
- **THEN** la línea tiene cantidad 2 y los totales se recalculan

#### Scenario: Disminuir desde 1
- **GIVEN** la línea "Ensalada" tiene cantidad 1
- **WHEN** el usuario pulsa disminuir
- **THEN** la línea "Ensalada" desaparece del carrito

### Requirement: Quitar y vaciar
El usuario SHALL poder quitar una línea completa y vaciar todo el carrito. Vaciar pide confirmación.

#### Scenario: Quitar línea
- **WHEN** el usuario pulsa "Quitar" en la línea "Hamburguesa"
- **THEN** la línea desaparece y los totales se recalculan

#### Scenario: Vaciar carrito
- **GIVEN** el carrito tiene productos
- **WHEN** el usuario pulsa "Vaciar carrito" y confirma
- **THEN** el carrito queda vacío

### Requirement: Carrito vacío
Cuando el carrito no tiene líneas, la pantalla SHALL mostrar "Tu carrito está vacío" y un enlace al catálogo.

#### Scenario: Abrir carrito vacío
- **GIVEN** el carrito está vacío
- **WHEN** el usuario abre `/cart`
- **THEN** ve "Tu carrito está vacío" y un enlace "Ver productos"

### Requirement: Precio guardado al agregar
Cada línea SHALL conservar el nombre, la imagen y el precio unitario que tenía el producto al momento de agregarlo, para que el carrito se muestre sin pedir datos a la API.

#### Scenario: Carrito sin conexión a la API
- **GIVEN** el carrito tiene 1 "Hamburguesa" y la API no responde
- **WHEN** el usuario abre `/cart`
- **THEN** ve la línea "Hamburguesa" con su precio y los totales correctos
