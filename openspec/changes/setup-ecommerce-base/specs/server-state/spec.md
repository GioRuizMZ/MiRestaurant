# Spec Delta

## Purpose

Define cómo la aplicación obtiene, guarda en caché y reutiliza los datos que vienen de la API, para no repetir peticiones innecesarias y que las pantallas pasen por estados de carga y error predecibles.

## ADDED Requirements

### Requirement: Los datos del servidor viven en la caché de queries
Todo dato que viene de la API SHALL obtenerse y guardarse en la caché de queries, identificado por una clave estable. Ningún store global SHALL guardar copias de respuestas del servidor.

#### Scenario: Listado de productos
- **WHEN** una pantalla necesita el listado de productos
- **THEN** lo obtiene de la caché de queries con la clave `["products"]`
- **AND** el listado no se copia a ningún store global

### Requirement: Claves de caché centralizadas
Las claves de caché SHALL definirse en un único módulo de claves por dominio (por ejemplo `["products"]` y `["products", id]`). Ningún componente ni hook SHALL escribir claves a mano.

#### Scenario: Detalle de producto
- **WHEN** se pide el producto con id 7
- **THEN** la clave usada es `["products", 7]`, generada por el módulo de claves

### Requirement: Reutilización de datos en caché
Mientras un dato esté fresco (por defecto 5 minutos), volver a una pantalla que lo usa SHALL mostrarlo de inmediato desde la caché, sin un nuevo estado de carga.

#### Scenario: Volver al catálogo
- **GIVEN** el catálogo se cargó hace menos de 5 minutos
- **WHEN** el usuario navega al detalle y vuelve al catálogo
- **THEN** el listado aparece de inmediato, sin indicador de carga
- **AND** no se hace una nueva petición a la API

### Requirement: Estados de carga y error explícitos
Toda pantalla que consume datos del servidor SHALL mostrar un estado de carga mientras no hay datos y un estado de error con opción de reintentar si la petición falla.

#### Scenario: Error con reintento
- **GIVEN** la petición de productos falló
- **WHEN** el usuario pulsa "Reintentar"
- **THEN** se vuelve a pedir el dato y se muestra el estado de carga

### Requirement: Reintentos limitados
Una petición fallida SHALL reintentarse como máximo 1 vez antes de mostrar el error. Los errores 4xx no se reintentan.

#### Scenario: 404 sin reintento
- **WHEN** la API responde 404 a una query
- **THEN** el error se muestra sin reintentos automáticos
