@e2e
Feature: app-layout

  Scenario: Navegar entre pantallas
    Given el usuario está en el catálogo
    When abre el carrito desde la barra lateral
    Then el área de contenido muestra el carrito
    And la barra superior y la barra lateral siguen visibles

  Scenario: Ruta inexistente
    When el usuario visita "/no-existe"
    Then ve la página de "no encontrado" dentro del layout con un enlace al catálogo
