@e2e
Feature: product-catalog

  Scenario: Orden A a Z
    Given el usuario está en el menú principal
    Then ve las tarjetas en el orden "Café americano", "Coca-Cola", "Ensalada", "Hamburguesa", "Hot dog"

  Scenario: Abrir detalle
    Given el usuario está en el menú principal
    When el usuario hace click sobre el precio de la tarjeta de "Hamburguesa"
    Then la aplicación navega a "/producto/7"

  Scenario: Hover sobre el botón Agregar
    Given el usuario está en el menú principal
    When el usuario pasa el puntero sobre el botón "Agregar" de la tarjeta de "Hamburguesa"
    Then el color de fondo del botón cambia respecto a su estado normal

  Scenario: Foco con teclado
    Given el usuario está en el menú principal
    When el usuario llega con la tecla Tab a la tarjeta de "Hamburguesa"
    Then la tarjeta muestra un indicador de foco visible
