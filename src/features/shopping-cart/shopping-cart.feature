@component
Feature: shopping-cart
  Pedido global: agregar sin duplicar, resumen en el encabezado de todas las pantallas
  y pantalla /pedido para revisarlo y modificarlo.

  Scenario: Primer producto
    Given el pedido está vacío
    When el usuario agrega 1 "Hamburguesa" desde el menú principal
    Then el pedido tiene una línea "Hamburguesa" con cantidad 1

  Scenario: Agregar el mismo producto dos veces
    Given el pedido tiene 1 "Hamburguesa"
    When el usuario agrega otra vez 1 "Hamburguesa" desde el menú principal
    Then el pedido tiene una sola línea "Hamburguesa" con cantidad 2

  Scenario: Agregar el mismo producto desde el detalle
    Given el pedido tiene 2 "Hamburguesa"
    When el usuario elige cantidad 3 en el detalle y pulsa "Agregar al pedido"
    Then el pedido tiene una sola línea "Hamburguesa" con cantidad 5

  Scenario: Resumen en el menú y en el detalle
    Given el pedido tiene 2 "Hamburguesa" a $12.50 y 1 "Ensalada" a $8.00
    When el usuario está en el menú principal y después abre "/producto/7"
    Then en las dos pantallas el encabezado muestra "3 productos" y "$33.00"

  Scenario: Pedido vacío en el encabezado
    Given el pedido está vacío
    When el usuario abre el menú principal
    Then el encabezado muestra "0 productos" y "$0.00"

  Scenario: Encabezado actualizado al agregar
    Given el pedido tiene 2 "Hamburguesa" a $12.50
    When el usuario pulsa "Agregar" en la tarjeta de "Ensalada"
    Then el encabezado muestra "3 productos" y "$33.00" sin recargar la página

  Scenario: Navegar sin perder el pedido
    Given el usuario agregó 2 "Hamburguesa" desde "/producto/7"
    When vuelve al menú principal y abre el detalle de "Ensalada"
    Then el encabezado sigue mostrando "2 productos" y "$25.00"

  Scenario: Abrir el pedido desde el encabezado
    When el usuario pulsa el resumen del pedido en el encabezado
    Then la aplicación navega a "/pedido"

  Scenario: Ver el pedido
    Given el pedido tiene 2 "Hamburguesa" a $12.50 y 1 "Ensalada" a $8.00
    When el usuario abre "/pedido"
    Then ve el subtotal $25.00 para "Hamburguesa" y $8.00 para "Ensalada"
    And ve el total $33.00 y 3 productos

  Scenario: Aumentar cantidad
    Given la línea "Ensalada" tiene cantidad 1
    When el usuario pulsa aumentar en esa línea
    Then la línea tiene cantidad 2 y los totales se recalculan

  Scenario: Disminuir desde 1
    Given la línea "Ensalada" tiene cantidad 1
    When el usuario pulsa disminuir en esa línea
    Then la línea "Ensalada" desaparece del pedido

  Scenario: Quitar línea
    Given el pedido tiene 2 "Hamburguesa" a $12.50 y 1 "Ensalada" a $8.00
    When el usuario pulsa "Quitar" en la línea "Hamburguesa"
    Then la línea desaparece y los totales se recalculan

  Scenario: Vaciar pedido
    Given el pedido tiene productos
    When el usuario pulsa "Vaciar pedido" y confirma
    Then el pedido queda vacío

  Scenario: Cancelar vaciado
    Given el pedido tiene productos
    When el usuario pulsa "Vaciar pedido" y cancela
    Then el pedido conserva todas sus líneas

  Scenario: Abrir pedido vacío
    Given el pedido está vacío
    When el usuario abre "/pedido"
    Then ve "Tu pedido está vacío" y un enlace "Ver el menú"

  Scenario: Pedido sin conexión a la API
    Given el pedido tiene 1 "Hamburguesa" y la API no responde
    When el usuario abre "/pedido"
    Then ve la línea "Hamburguesa" con su precio y los totales correctos
