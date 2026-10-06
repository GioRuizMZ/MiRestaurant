# global-state Specification

## Purpose
Define qué estado del cliente es global (el pedido, el estado de la UI y el término de búsqueda), cómo se organiza en stores por dominio y qué parte de él sobrevive a una recarga.

## Requirements

### Requirement: Un store por dominio
El estado global del cliente SHALL organizarse en stores independientes por dominio: `cart` (pedido), `ui` (sidebar) y `search` (término de búsqueda). Ningún store SHALL guardar datos obtenidos de la API.

#### Scenario: Agregar al pedido
- **WHEN** se agrega un producto al pedido
- **THEN** el store `cart` guarda solo lo necesario para el pedido (id, sku, nombre, imagen, precio, cantidad)
- **AND** el listado de productos no se guarda en ningún store

### Requirement: Acceso por selectores
Los consumidores SHALL leer el estado global mediante selectores que devuelven solo la porción que necesitan, para que un cambio en una parte no vuelva a renderizar consumidores que no la usan.

#### Scenario: Cambio en el sidebar
- **WHEN** se colapsa el sidebar
- **THEN** los consumidores que solo leen el pedido no se vuelven a renderizar

### Requirement: Persistencia del pedido
El estado del pedido SHALL persistir en el almacenamiento local del navegador y restaurarse al recargar. El estado de UI y el término de búsqueda no se persisten.

#### Scenario: Recargar con productos en el pedido
- **GIVEN** el pedido tiene 2 unidades de "Hamburguesa"
- **WHEN** el usuario recarga la página
- **THEN** el pedido sigue teniendo 2 unidades de "Hamburguesa"

#### Scenario: Almacenamiento no disponible
- **WHEN** el almacenamiento local no está disponible o tiene datos corruptos
- **THEN** la aplicación arranca con el pedido vacío y sin errores visibles

### Requirement: Mutaciones solo mediante acciones
El estado global SHALL modificarse solo mediante las acciones que expone cada store. Ningún consumidor SHALL modificar el estado directamente.

#### Scenario: Cambiar cantidad
- **WHEN** un componente necesita cambiar la cantidad de un producto
- **THEN** lo hace llamando a la acción del store `cart` y no editando el estado directamente
