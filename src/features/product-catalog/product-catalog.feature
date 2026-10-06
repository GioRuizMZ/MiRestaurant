@component
Feature: product-catalog
  Menú principal: productos con imagen ordenados de la A a la Z, con acceso al detalle y al carrito.
  Los escenarios de hover y foco se ejecutan en el nivel @e2e.

  Scenario: Menú con productos
    Given la API devuelve 3 productos
    When el usuario abre la pantalla principal
    Then ve el título "Menú principal" y 3 tarjetas, cada una con imagen, nombre y precio

  Scenario: Producto sin imagen en el menú
    Given la API devuelve "Hamburguesa" sin imagen
    When el usuario abre la pantalla principal
    Then la tarjeta de "Hamburguesa" muestra un fondo neutro en lugar de la imagen, con su nombre, su precio y el botón "Agregar"

  Scenario: Orden A a Z
    Given la API devuelve "Hot dog", "Hamburguesa", "Ensalada", "Coca-Cola" y "Café americano" en ese orden
    When el usuario abre la pantalla principal
    Then ve las tarjetas en el orden "Café americano", "Coca-Cola", "Ensalada", "Hamburguesa", "Hot dog"

  Scenario: Orden sin distinguir mayúsculas ni tildes
    Given la API devuelve "Ñoquis", "agua mineral", "Éclair" y "Burrito"
    When el usuario abre la pantalla principal
    Then ve las tarjetas en el orden "agua mineral", "Burrito", "Éclair", "Ñoquis"

  Scenario: Carga inicial
    When el usuario abre la pantalla principal y la API todavía no responde
    Then ve tarjetas skeleton en lugar de productos

  Scenario: API caída
    Given la API responde con error 500
    When el usuario abre la pantalla principal
    Then ve el mensaje "No pudimos cargar los productos" y el botón "Reintentar"

  Scenario: Reintentar tras el error
    Given se muestra el error de carga y la API ya responde correctamente
    When el usuario pulsa "Reintentar"
    Then ve las tarjetas de los productos

  Scenario: Sin productos
    Given la API devuelve una lista vacía
    When el usuario abre la pantalla principal
    Then ve el mensaje "No hay productos disponibles"

  Scenario: Abrir detalle
    When el usuario hace click en la tarjeta de "Hamburguesa" (id 7)
    Then la aplicación navega a "/producto/7"

  Scenario: Agregar desde la tarjeta
    Given el carrito está vacío
    When el usuario pulsa "Agregar" en la tarjeta de "Hamburguesa"
    Then el carrito tiene 1 unidad de "Hamburguesa" y el indicador de la barra superior muestra "1"
    And el usuario sigue en la pantalla principal
