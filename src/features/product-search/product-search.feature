@component
Feature: product-search
  Buscador de la barra superior: filtra el menú por nombre en tiempo real desde 4 caracteres
  y avisa cuando no hay coincidencias.

  Scenario: Búsqueda visible en el pedido
    When el usuario está en "/pedido"
    Then ve el campo de búsqueda en la barra superior

  Scenario: Término corto
    Given el catálogo tiene "Hamburguesa", "Hot dog" y "Ensalada"
    When el usuario escribe "Ham"
    Then el catálogo sigue mostrando los 3 productos

  Scenario: Término suficiente
    Given el catálogo tiene "Hamburguesa", "Hot dog" y "Ensalada"
    When el usuario escribe "Hamb"
    Then el catálogo muestra solo "Hamburguesa"

  Scenario: Borrar hasta el umbral
    Given el catálogo está filtrado por "Hamb"
    When el usuario borra hasta dejar "Ham"
    Then el catálogo vuelve a mostrar todos los productos

  Scenario: Escritura continua
    When el usuario escribe "Ensa" y deja de escribir
    Then en menos de 300 ms el catálogo muestra solo "Ensalada"

  Scenario: Sin distinguir tildes ni mayúsculas
    Given existe el producto "Café americano"
    When el usuario escribe "CAFE"
    Then el catálogo muestra "Café americano"

  Scenario: Coincidencia en medio del nombre
    Given existe el producto "Café americano"
    When el usuario escribe "amer"
    Then el catálogo muestra "Café americano"

  Scenario: Ninguna coincidencia
    When el usuario escribe "pizza" y ningún producto coincide
    Then ve el mensaje de que no hay productos para "pizza"
    And ve un botón "Limpiar búsqueda"

  Scenario: Limpiar búsqueda
    Given se muestra el mensaje de sin resultados
    When el usuario pulsa "Limpiar búsqueda"
    Then el campo queda vacío y el catálogo muestra todos los productos

  Scenario: Buscar desde el detalle
    Given el usuario está en "/producto/7"
    When escribe "Ensa"
    Then la aplicación navega a "/" y muestra solo "Ensalada"
