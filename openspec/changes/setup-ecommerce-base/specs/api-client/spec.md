# Spec Delta

## Purpose

Define un único punto de acceso HTTP a la API de MiRestaurant: dónde se configura, cómo se autentica con el JWT fijo y cómo se normalizan los errores.

## ADDED Requirements

### Requirement: Cliente HTTP único
Toda petición a la API SHALL pasar por un único cliente HTTP centralizado. Ningún componente, hook o store SHALL hacer peticiones directas a la red; solo la capa de servicios usa el cliente.

#### Scenario: Una pantalla obtiene datos
- **WHEN** cualquier pantalla necesita datos de la API
- **THEN** la petición sale del cliente centralizado a través de un servicio
- **AND** no existe ninguna otra instancia ni llamada HTTP en el código de la aplicación

### Requirement: URL absoluta desde el entorno
La URL del endpoint de productos SHALL tomarse de la variable de entorno `VITE_API_URL` como URL absoluta, incluida su ruta y su query (por ejemplo `KioskID`), y usarse tal cual, sin agregarle rutas ni barras. Esa URL no se escribe en ningún otro lugar del código.

#### Scenario: Petición a la URL absoluta
- **GIVEN** `VITE_API_URL` vale `https://srkiosco-api-beta.azurewebsites.net/SrKioscoRemote/GetProducts?KioskID=8`
- **WHEN** la aplicación pide la lista de productos
- **THEN** la petición se envía exactamente a esa URL

### Requirement: Respuesta envuelta de la API
La API responde con un sobre `{ isSuccess, code, message, data }`. Los productos SHALL leerse de `data`, sin depender de `isSuccess`, porque la API lo devuelve en `false` incluso cuando responde con éxito. Si `data` es nulo, la lista se trata como vacía.

#### Scenario: isSuccess en false con datos
- **GIVEN** la API responde `isSuccess: false`, `code: "0000"` y 3 productos en `data`
- **WHEN** la aplicación pide la lista de productos
- **THEN** obtiene los 3 productos

### Requirement: Autenticación con JWT fijo
El cliente SHALL adjuntar a cada petición la cabecera `Authorization: Bearer <token>`, con el token leído de la variable de entorno `VITE_API_TOKEN`.

#### Scenario: Cabecera de autorización presente
- **WHEN** el cliente envía cualquier petición
- **THEN** la petición incluye `Authorization: Bearer <valor de VITE_API_TOKEN>`

### Requirement: Validación de configuración al arrancar
La aplicación MUST fallar al arrancar con un mensaje claro que nombre la variable faltante si `VITE_API_URL` o `VITE_API_TOKEN` no están definidas o están vacías. Nunca SHALL enviar peticiones con un token indefinido.

#### Scenario: Falta el token
- **WHEN** la aplicación arranca sin `VITE_API_TOKEN`
- **THEN** el arranque falla con un error que menciona `VITE_API_TOKEN`
- **AND** no se envía ninguna petición a la API

### Requirement: Errores normalizados
El cliente SHALL convertir toda respuesta fallida o error de red en un error de la aplicación con `status` (número o `null` si es error de red) y `message` legible. Las capas superiores nunca manejan errores crudos del transporte.

#### Scenario: Respuesta 500
- **WHEN** la API responde con estado 500
- **THEN** quien llamó recibe un error con `status` 500 y un `message` legible

#### Scenario: Sin conexión
- **WHEN** la petición falla por un error de red
- **THEN** quien llamó recibe un error con `status` `null` y un `message` que indica problema de conexión

#### Scenario: Token rechazado
- **WHEN** la API responde con estado 401
- **THEN** quien llamó recibe un error con `status` 401 que indica que el token de la API no es válido

### Requirement: El token no se versiona
Los valores reales de las variables de entorno MUST quedar fuera del control de versiones. El repositorio SHALL incluir un archivo de ejemplo con las claves y sin valores reales.

#### Scenario: Repositorio clonado
- **WHEN** alguien clona el repositorio
- **THEN** encuentra `.env.example` con `VITE_API_URL` y `VITE_API_TOKEN`
- **AND** no encuentra ningún archivo `.env` con valores reales
