@e2e
Feature: purchase-flow
  Flujo de compra completo (spec testing-bdd): búsqueda, detalle, agregar al pedido y resumen.

  Scenario: Flujo de compra completo
    Given el usuario está en el menú principal
    When busca "Hamb" en la barra superior
    Then ve solo la tarjeta de "Hamburguesa"
    When el usuario hace click sobre el precio de la tarjeta de "Hamburguesa"
    And aumenta la cantidad a 2 y pulsa "Agregar al pedido"
    Then el encabezado muestra "2 productos" y "$25.00"
    When abre el pedido desde la barra superior
    Then ve el total "$25.00" en el pedido
