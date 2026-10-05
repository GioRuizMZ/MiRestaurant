# Spec Delta

## Purpose

Define el flujo de ramas del repositorio (main > develop > feature) y cómo se integra cada feature, para que `main` siempre tenga una versión estable y cada cambio llegue revisado y verificado.

## ADDED Requirements

### Requirement: Ramas permanentes
El repositorio SHALL tener dos ramas permanentes: `main`, que contiene solo versiones estables y liberadas, y `develop`, que es la rama de integración de las features terminadas. `develop` se crea a partir de `main`.

#### Scenario: Ramas disponibles
- **WHEN** alguien clona el repositorio
- **THEN** encuentra las ramas `main` y `develop` en el remoto

### Requirement: Base inicial del proyecto
La base del proyecto (tooling, estándares, layout y specs) SHALL ser el primer commit de `main`. Es la única vez que se commitea directamente en `main`. A continuación se crea `develop` desde ese commit.

#### Scenario: Arranque del repositorio
- **GIVEN** el repositorio no tiene commits
- **WHEN** se publica la base del proyecto
- **THEN** `main` tiene el commit base
- **AND** `develop` apunta al mismo commit que `main`

### Requirement: Una rama por feature desde develop
Cada feature SHALL desarrollarse en su propia rama creada desde la última versión de `develop`, con el nombre `feature/<nombre-en-kebab-case>`. Ninguna feature se desarrolla directamente en `develop` ni en `main`.

#### Scenario: Empezar la feature del carrito
- **WHEN** se empieza a trabajar en el carrito
- **THEN** se crea la rama `feature/shopping-cart` desde `develop` actualizado

### Requirement: Pull request a develop al terminar cada feature
Al terminar una feature SHALL abrirse un pull request de `feature/<nombre>` hacia `develop`. El PR referencia el cambio de OpenSpec que implementa y lista las capacidades afectadas.

#### Scenario: Feature terminada
- **GIVEN** todas las tareas de la feature del catálogo están completas en `feature/product-catalog`
- **WHEN** se termina la feature
- **THEN** existe un PR de `feature/product-catalog` hacia `develop` que menciona el cambio de OpenSpec correspondiente

### Requirement: Verificación obligatoria antes del merge
Un PR SHALL integrarse solo si la verificación completa del proyecto (lint, typecheck, tests, trazabilidad de escenarios y E2E) pasa sobre la rama del PR.

#### Scenario: Verificación fallida
- **GIVEN** un PR hacia `develop` cuyo escenario `@component` falla
- **WHEN** se intenta integrar
- **THEN** el PR no se integra hasta que la verificación pase

### Requirement: Sin commits directos en ramas permanentes
Después del commit base, `main` y `develop` SHALL recibir cambios solo mediante pull requests.

#### Scenario: Push directo a develop
- **WHEN** alguien intenta hacer push directo a `develop`
- **THEN** el remoto lo rechaza y el cambio debe entrar por PR

### Requirement: Liberación de develop a main
Cuando el conjunto de features integradas en `develop` es estable, SHALL abrirse un pull request de `develop` hacia `main` para publicar la versión. `main` solo avanza mediante estos PRs.

#### Scenario: Publicar versión
- **GIVEN** `develop` integra catálogo, búsqueda, detalle y carrito, y su verificación pasa
- **WHEN** se decide publicar
- **THEN** se abre un PR de `develop` hacia `main` y, una vez integrado, ambas ramas tienen el mismo contenido

### Requirement: Limpieza de ramas de feature
Una rama `feature/*` SHALL eliminarse del remoto después de integrarse en `develop`.

#### Scenario: Feature integrada
- **WHEN** se integra el PR de `feature/product-detail` en `develop`
- **THEN** la rama `feature/product-detail` deja de existir en el remoto
