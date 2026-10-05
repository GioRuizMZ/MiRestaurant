# Spec Delta

## Purpose

Asegura que cada escenario de las specs del proyecto sea un test ejecutable escrito en Gherkin, para que "el test pasa" signifique "el requisito se cumple".

## ADDED Requirements

### Requirement: Escenarios de spec ejecutables como features
Cada escenario de una spec de comportamiento SHALL tener un `Scenario` con el mismo nombre en un archivo `.feature`. El nombre de cada `Feature` coincide con el nombre de la capacidad.

#### Scenario: Trazabilidad de un escenario
- **GIVEN** la spec `shopping-cart` tiene el escenario "Agregar el mismo producto dos veces"
- **WHEN** se buscan los archivos `.feature` del proyecto
- **THEN** existe un `Scenario: Agregar el mismo producto dos veces` dentro de `Feature: shopping-cart`

### Requirement: Dos niveles de ejecución
Los features SHALL ejecutarse en dos niveles: el nivel de componentes (componentes y páginas renderizados en un DOM simulado, contra una API mockeada) y el nivel E2E (la aplicación completa en un navegador real). Cada escenario declara su nivel con la etiqueta `@component` o `@e2e`.

#### Scenario: Ejecución separada
- **WHEN** se ejecuta el comando de tests de componentes
- **THEN** solo corren los escenarios `@component`
- **AND** el comando de tests E2E ejecuta solo los escenarios `@e2e`

### Requirement: Flujos críticos cubiertos en E2E
Los flujos "buscar un producto", "ver su detalle", "agregarlo al carrito" y "ver el indicador actualizado en la barra superior" SHALL estar cubiertos al menos por un escenario `@e2e`.

#### Scenario: Flujo de compra completo
- **WHEN** se ejecuta la suite E2E
- **THEN** existe un escenario que recorre búsqueda, detalle y carrito y verifica el indicador de la barra superior

### Requirement: Datos de prueba compartidos
Los dos niveles SHALL usar las mismas definiciones de respuestas mockeadas de la API, para que un escenario describa los mismos datos en ambos niveles.

#### Scenario: Catálogo mockeado
- **WHEN** un escenario `@component` y otro `@e2e` cargan el catálogo
- **THEN** ambos reciben el mismo conjunto de productos de prueba

### Requirement: Calidad verificada en integración continua
Lint, typecheck, tests unitarios, features `@component` y features `@e2e` SHALL ejecutarse con comandos de script del proyecto y cualquier fallo MUST hacer fallar la verificación.

#### Scenario: Escenario roto
- **WHEN** un step de un escenario `@component` falla
- **THEN** el comando de verificación del proyecto termina con un código distinto de cero
