@e2e
Feature: app-layout

  Scenario: Navegar entre pantallas
    Given el usuario está en el catálogo
    When abre el pedido desde la barra superior
    Then el área de contenido muestra el pedido
    And la barra superior y la barra lateral siguen visibles

  Scenario: Ruta inexistente
    When el usuario visita "/no-existe"
    Then ve la página de "no encontrado" dentro del layout con un enlace al catálogo

  Scenario: Animación al abrir y cerrar
    Given el viewport mide 1280 px y la barra lateral está expandida
    When el usuario pulsa el botón de menú
    Then la barra lateral se cierra con una transición de 200 ms
    And al terminar, el enlace "Menú" no recibe el foco con el teclado

  Scenario: Panel móvil deslizante
    Given el viewport mide 375 px
    When el usuario abre el menú
    Then el panel lateral entra deslizándose desde la izquierda con una transición de 200 ms
