# component-architecture Specification

## Purpose
Define cómo se organizan los componentes de interfaz con atomic design y cómo se separa la presentación de la lógica, para que los componentes sean reutilizables y se puedan probar de forma aislada.

## Requirements

### Requirement: Niveles de atomic design
Los componentes de interfaz SHALL clasificarse en cinco niveles: atoms, molecules, organisms, templates y pages. Cada nivel solo puede componer niveles inferiores (un atom no usa molecules, una molecule no usa organisms, etc.).

#### Scenario: Composición válida
- **WHEN** se crea la molecule `ProductCard`
- **THEN** solo usa atoms (por ejemplo `Button`, `Price`, `Image`)
- **AND** no importa ningún organism, template ni page

### Requirement: Componentes de presentación sin lógica de datos
Los componentes de atoms, molecules, organisms y templates SHALL ser de presentación: reciben datos por props y notifican eventos mediante callbacks. No acceden a la API, a la caché de queries ni a los stores globales.

#### Scenario: TopBar muestra el pedido
- **WHEN** el organism `TopBar` muestra el total de productos y el monto del pedido
- **THEN** recibe esos valores por props
- **AND** no lee el store del pedido directamente

### Requirement: La lógica vive en hooks y containers
La obtención de datos, el acceso a stores y las reglas de negocio SHALL vivir en hooks. Las pages y los containers de layout SHALL ser los únicos que usan esos hooks y pasan el resultado como props.

#### Scenario: Página de catálogo
- **WHEN** se renderiza la página de catálogo
- **THEN** la página obtiene los productos y el término de búsqueda mediante hooks
- **AND** pasa la lista ya filtrada al organism `ProductGrid` por props

### Requirement: Reglas de dependencia verificadas automáticamente
El linter del proyecto SHALL fallar si un archivo bajo `components/` importa de la capa de API, servicios, stores o hooks de datos.

#### Scenario: Import prohibido
- **WHEN** un atom importa el store del pedido
- **THEN** el comando de lint termina con error indicando la regla violada

### Requirement: Estilos con utilidades
Los estilos de los componentes SHALL definirse con clases utilitarias del sistema de estilos del proyecto, usando los tokens de diseño compartidos (colores, espaciado, tipografía). No se escriben hojas de estilo por componente.

#### Scenario: Botón primario
- **WHEN** se estiliza el atom `Button` en su variante primaria
- **THEN** usa los tokens de color del proyecto y ningún archivo CSS propio
