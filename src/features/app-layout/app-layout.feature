@component
Feature: app-layout
  Estructura común de la aplicación: barra superior, barra lateral y área de contenido.

  Scenario: Navegar entre pantallas
    Given el usuario está en el catálogo
    When abre el detalle de un producto
    Then el área de contenido muestra el detalle
    And la barra superior y la barra lateral siguen visibles sin volver a montarse

  Scenario: Indicador del carrito
    Given el carrito tiene 3 unidades en total
    When se muestra la barra superior
    Then el acceso al carrito muestra el indicador "3"

  Scenario: Carrito vacío
    Given el carrito está vacío
    When se muestra la barra superior
    Then el acceso al carrito no muestra indicador numérico

  Scenario: Volver al inicio
    Given el usuario está en el carrito
    When el usuario hace click en el logo
    Then la aplicación navega al catálogo

  Scenario: Ruta activa
    When el usuario está en el menú principal
    Then el enlace "Menú" de la barra lateral aparece resaltado
    And la barra lateral no tiene un enlace "Carrito"

  Scenario: Colapsar en escritorio
    Given el viewport mide 1280 px y la barra lateral está expandida
    When el usuario pulsa el botón de menú
    Then la barra lateral se colapsa y el contenido ocupa el espacio liberado

  Scenario: Móvil
    Given el viewport mide 375 px y el usuario está en el carrito
    When el usuario abre el menú y elige "Menú"
    Then la aplicación navega al menú principal y el panel lateral se cierra

  Scenario: Ruta inexistente
    When el usuario visita "/no-existe"
    Then ve la página de "no encontrado" dentro del layout con un enlace al catálogo
