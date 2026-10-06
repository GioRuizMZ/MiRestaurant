# product-search Specification

## Purpose
Permite encontrar productos rápido desde la barra superior: filtra el catálogo en tiempo real mientras el usuario escribe y avisa cuando no hay coincidencias.

## Requirements

### Requirement: Barra de búsqueda siempre disponible
La barra superior SHALL contener un campo de búsqueda con el placeholder "Buscar productos..." visible en todas las rutas.

#### Scenario: Búsqueda visible en el pedido
- **WHEN** el usuario está en `/pedido`
- **THEN** ve el campo de búsqueda en la barra superior

### Requirement: Umbral mínimo de 4 caracteres
El filtrado SHALL activarse solo cuando el término, sin espacios al inicio ni al final, tiene más de 3 caracteres. Con 3 caracteres o menos el catálogo muestra todos los productos.

#### Scenario: Término corto
- **GIVEN** el catálogo tiene "Hamburguesa", "Hot dog" y "Ensalada"
- **WHEN** el usuario escribe "Ham"
- **THEN** el catálogo sigue mostrando los 3 productos

#### Scenario: Término suficiente
- **GIVEN** el catálogo tiene "Hamburguesa", "Hot dog" y "Ensalada"
- **WHEN** el usuario escribe "Hamb"
- **THEN** el catálogo muestra solo "Hamburguesa"

#### Scenario: Borrar hasta el umbral
- **GIVEN** el catálogo está filtrado por "Hamb"
- **WHEN** el usuario borra hasta dejar "Ham"
- **THEN** el catálogo vuelve a mostrar todos los productos

### Requirement: Filtrado en tiempo real
El resultado SHALL actualizarse mientras el usuario escribe, sin pulsar Enter ni un botón, después de una pausa de escritura de 300 ms como máximo.

#### Scenario: Escritura continua
- **WHEN** el usuario escribe "Ensa" y deja de escribir
- **THEN** en menos de 300 ms el catálogo muestra solo "Ensalada"

### Requirement: Coincidencia flexible
La coincidencia SHALL buscar el término dentro del nombre del producto, en cualquier posición, sin distinguir mayúsculas, minúsculas ni tildes.

#### Scenario: Sin distinguir tildes ni mayúsculas
- **GIVEN** existe el producto "Café americano"
- **WHEN** el usuario escribe "CAFE"
- **THEN** el catálogo muestra "Café americano"

#### Scenario: Coincidencia en medio del nombre
- **GIVEN** existe el producto "Café americano"
- **WHEN** el usuario escribe "amer"
- **THEN** el catálogo muestra "Café americano"

### Requirement: Sin resultados
Si ningún producto coincide con un término activo, el catálogo SHALL mostrar el mensaje "No encontramos productos para \"<término>\"" y una acción para limpiar la búsqueda.

#### Scenario: Ninguna coincidencia
- **WHEN** el usuario escribe "pizza" y ningún producto coincide
- **THEN** ve el mensaje "No encontramos productos para \"pizza\""
- **AND** ve un botón "Limpiar búsqueda"

#### Scenario: Limpiar búsqueda
- **GIVEN** se muestra el mensaje de sin resultados
- **WHEN** el usuario pulsa "Limpiar búsqueda"
- **THEN** el campo queda vacío y el catálogo muestra todos los productos

### Requirement: Buscar desde otra pantalla
Si el usuario escribe un término activo estando fuera del catálogo, la aplicación SHALL navegar al catálogo y mostrar los resultados filtrados.

#### Scenario: Buscar desde el detalle
- **GIVEN** el usuario está en `/producto/7`
- **WHEN** escribe "Ensa"
- **THEN** la aplicación navega a `/` y muestra solo "Ensalada"
