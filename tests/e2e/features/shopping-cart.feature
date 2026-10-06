@e2e
Feature: shopping-cart

  Scenario: Resumen en el menú y en el detalle
    Given el usuario está en el menú principal
    When pulsa "Agregar" en las tarjetas de "Hamburguesa", "Hamburguesa" y "Ensalada"
    Then el encabezado muestra "3 productos" y "$33.00"
    When el usuario hace click sobre el precio de la tarjeta de "Hamburguesa"
    Then la aplicación navega a "/producto/7"
    And el encabezado muestra "3 productos" y "$33.00"

  Scenario: Navegar sin perder el pedido
    Given el usuario abre el detalle en "/producto/7"
    When aumenta la cantidad a 2 y pulsa "Agregar al pedido"
    And pulsa el botón "Volver al menú principal"
    And el usuario hace click sobre el precio de la tarjeta de "Ensalada"
    Then el encabezado muestra "2 productos" y "$25.00"
