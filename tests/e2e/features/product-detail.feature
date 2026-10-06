@e2e
Feature: product-detail

  Scenario: Ver detalle
    Given el usuario abre el detalle en "/producto/7"
    Then ve el detalle de "Hamburguesa" con la imagen cargada, el precio "$12.50" y el SKU "PLT-007"

  Scenario: Agregar varias unidades
    Given el usuario abre el detalle en "/producto/7"
    When aumenta la cantidad a 3 y pulsa "Agregar al carrito"
    Then el indicador de la barra superior muestra "3"
    And ve el aviso "Agregado al carrito: 3 × Hamburguesa" y el contador vuelve a 1

  Scenario: Volver al menú principal
    Given el usuario abre el detalle en "/producto/7"
    When pulsa el botón "Volver al menú principal"
    Then la aplicación navega a "/"
    And ve el título "Menú principal"

  Scenario: Recargar la página
    Given el usuario abre el detalle en "/producto/7"
    When recarga la página
    Then la aplicación navega a "/producto/7"
    And ve el detalle de "Hamburguesa" con la imagen cargada, el precio "$12.50" y el SKU "PLT-007"
