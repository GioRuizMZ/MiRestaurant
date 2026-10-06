@component
Feature: product-detail
  Detalle del producto en /producto/:id: imagen, nombre, descripción, precio y SKU,
  agregar al pedido con cantidad y regreso al menú principal. "Recargar la página" se ejecuta en el nivel @e2e.

  Scenario: Ver detalle
    Given existe el producto id 7 "Hamburguesa", SKU "PLT-007", precio 12.50, con imagen y descripción
    When el usuario abre "/producto/7"
    Then ve la imagen de "Hamburguesa", el nombre "Hamburguesa", su descripción, el precio "$12.50" y el SKU "PLT-007"

  Scenario: Producto sin imagen
    Given el producto id 7 "Hamburguesa" no tiene imagen
    When el usuario abre "/producto/7"
    Then ve un fondo neutro en el lugar de la imagen
    And ve el nombre, la descripción, el precio y el SKU

  Scenario: Agregar varias unidades
    Given el pedido está vacío y el usuario está en "/producto/7"
    When aumenta la cantidad a 3 y pulsa "Agregar al pedido"
    Then el pedido tiene 3 unidades de "Hamburguesa" y el encabezado muestra "3 productos" y "$37.50"
    And ve el aviso "Agregado al pedido: 3 × Hamburguesa" y el contador vuelve a 1

  Scenario: Sumar a un producto que ya está en el pedido
    Given el pedido ya tiene 1 unidad de "Hamburguesa" y el usuario está en "/producto/7"
    When aumenta la cantidad a 2 y pulsa "Agregar al pedido"
    Then el pedido tiene 3 unidades de "Hamburguesa" en una sola línea

  Scenario: Cantidad mínima
    Given el usuario está en "/producto/7" con la cantidad en 1
    When intenta disminuir la cantidad
    Then la cantidad sigue en 1 y el botón "Disminuir cantidad" está deshabilitado

  Scenario: Volver al menú principal
    Given el usuario está en "/producto/7"
    When pulsa "Volver al menú principal"
    Then la aplicación navega a "/" y ve el menú principal

  Scenario: Abrir el detalle por URL
    Given el usuario no visitó el menú principal
    When abre "/producto/7" directamente
    Then ve el detalle de "Hamburguesa"

  Scenario: Venir desde el menú principal
    Given el menú principal ya mostró "Hamburguesa"
    When el usuario hace click en su tarjeta
    Then ve el nombre, el precio y el SKU sin indicador de carga

  Scenario: Id inexistente
    Given no existe un producto con id 999
    When el usuario abre "/producto/999"
    Then ve "Producto no encontrado" y el botón "Volver al menú principal"

  Scenario: Id no válido
    When el usuario abre "/producto/abc"
    Then ve "Producto no encontrado" y el botón "Volver al menú principal"

  Scenario: Carga del detalle
    When el usuario abre "/producto/7" y la API todavía no responde
    Then ve un skeleton del detalle

  Scenario: Error de servidor
    Given la API responde con error 500
    When el usuario abre "/producto/7"
    Then ve el mensaje "No pudimos cargar el producto" y el botón "Reintentar"
