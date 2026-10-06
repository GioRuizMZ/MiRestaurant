# Spec Delta

## Purpose

Define la estructura visual común de la aplicación (barra superior, barra lateral y área de contenido) y cómo se navega entre pantallas sin perder esa estructura.

## ADDED Requirements

### Requirement: Layout con TopBar, Sidebar y Outlet
Todas las rutas de la aplicación SHALL renderizarse dentro de un layout común con barra superior, barra lateral y área de contenido. Al navegar solo cambia el área de contenido.

#### Scenario: Navegar entre pantallas
- **GIVEN** el usuario está en el catálogo
- **WHEN** abre el detalle de un producto
- **THEN** el área de contenido muestra el detalle
- **AND** la barra superior y la barra lateral siguen visibles sin volver a montarse

### Requirement: Contenido de la barra superior
La barra superior SHALL mostrar el logo o nombre de la tienda (enlace al catálogo), la barra de búsqueda y un acceso al carrito con un indicador del total de unidades.

#### Scenario: Indicador del carrito
- **GIVEN** el carrito tiene 3 unidades en total
- **WHEN** se muestra la barra superior
- **THEN** el acceso al carrito muestra el indicador "3"

#### Scenario: Carrito vacío
- **GIVEN** el carrito está vacío
- **WHEN** se muestra la barra superior
- **THEN** el acceso al carrito no muestra indicador numérico

#### Scenario: Volver al inicio
- **WHEN** el usuario hace click en el logo
- **THEN** la aplicación navega al catálogo

### Requirement: Navegación lateral
La barra lateral SHALL contener un único enlace, "Menú", con un ícono de menú, que lleva al menú principal (`/`) y se resalta cuando esa ruta está activa. El carrito no aparece en la barra lateral: se accede desde la barra superior.

#### Scenario: Ruta activa
- **WHEN** el usuario está en el menú principal
- **THEN** el enlace "Menú" de la barra lateral aparece resaltado
- **AND** la barra lateral no tiene un enlace "Carrito"

### Requirement: Barra lateral colapsable y responsive
La barra lateral SHALL poder colapsarse y expandirse desde un botón de la barra superior. En pantallas menores a 768 px empieza oculta y se abre como panel superpuesto que se cierra al navegar.

#### Scenario: Colapsar en escritorio
- **GIVEN** el viewport mide 1280 px y la barra lateral está expandida
- **WHEN** el usuario pulsa el botón de menú
- **THEN** la barra lateral se colapsa y el contenido ocupa el espacio liberado

#### Scenario: Móvil
- **GIVEN** el viewport mide 375 px y el usuario está en el carrito
- **WHEN** el usuario abre el menú y elige "Menú"
- **THEN** la aplicación navega al menú principal y el panel lateral se cierra

### Requirement: Animación de la barra lateral
Abrir y cerrar la barra lateral SHALL animarse con una transición de 200 ms: en escritorio cambia su ancho y en móvil se desliza desde la izquierda mientras el fondo se oscurece o se aclara. Si el usuario pidió reducir el movimiento (`prefers-reduced-motion`), el cambio es inmediato. Mientras está cerrada, sus enlaces no son accesibles ni con teclado ni con lector de pantalla.

#### Scenario: Animación al abrir y cerrar
- **GIVEN** el viewport mide 1280 px y la barra lateral está expandida
- **WHEN** el usuario pulsa el botón de menú
- **THEN** la barra lateral se cierra con una transición de 200 ms
- **AND** al terminar, el enlace "Menú" no recibe el foco con el teclado

#### Scenario: Panel móvil deslizante
- **GIVEN** el viewport mide 375 px
- **WHEN** el usuario abre el menú
- **THEN** el panel lateral entra deslizándose desde la izquierda con una transición de 200 ms

### Requirement: Rutas de la aplicación
La aplicación SHALL exponer las rutas `/` (catálogo), `/products/:id` (detalle) y `/cart` (carrito). Cualquier otra ruta muestra una página de "no encontrado" dentro del layout, con un enlace al catálogo.

#### Scenario: Ruta inexistente
- **WHEN** el usuario visita `/no-existe`
- **THEN** ve la página de "no encontrado" dentro del layout con un enlace al catálogo
