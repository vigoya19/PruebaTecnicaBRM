# Librerias Utilizadas

Este documento resume las librerias principales usadas en la solucion y el motivo de su eleccion.

## Dependencias de produccion

### `fastify`

Uso:

- framework HTTP principal de la API

Motivo:

- rapido
- simple
- buen fit para Lambda

### `@fastify/aws-lambda`

Uso:

- adaptador entre Fastify y AWS Lambda

Motivo:

- permite exponer una sola aplicacion HTTP sobre Lambda sin reescribir handlers manuales por endpoint

### `dotenv`

Uso:

- carga de variables de entorno en desarrollo local

Motivo:

- simplifica configuracion local

### `zod`

Uso:

- validacion de payloads y contratos de entrada

Motivo:

- API simple
- tipado claro
- facil de mantener

## AWS SDK v3

### `@aws-sdk/client-cognito-identity-provider`

Uso:

- registro y login con Cognito
- administracion de usuarios y grupos

### `@aws-sdk/client-dynamodb`

Uso:

- acceso de bajo nivel a DynamoDB

### `@aws-sdk/lib-dynamodb`

Uso:

- `DocumentClient`
- simplifica lectura y escritura de items en DynamoDB

### `@aws-sdk/client-sesv2`

Uso:

- envio de correos con Amazon SES

### `@aws-sdk/client-sns`

Uso:

- envio de SMS con Amazon SNS

## Dependencias de desarrollo

### `jest`

Uso:

- pruebas unitarias

Motivo:

- simple
- suficiente para el alcance de la prueba

### `serverless`

Uso:

- despliegue e infraestructura como codigo

Motivo:

- cumple el requerimiento de IaC
- acelera el deploy serverless

### `serverless-offline`

Uso:

- emulacion local del entorno serverless

Motivo:

- facilita pruebas locales sin desplegar en AWS en cada cambio

## Librerias nativas de Node.js

### `node:crypto`

Uso:

- generacion de `transactionId` con `randomUUID()`

Motivo:

- evita dependencia extra para identificadores unicos

### `Buffer`

Uso:

- decodificacion del payload del JWT emitido por Cognito

## Resumen de seleccion tecnica

Las librerias se eligieron con tres criterios:

- simplicidad operativa
- alineacion con AWS serverless
- bajo nivel de complejidad para una prueba tecnica

La intencion fue evitar sobreingenieria y priorizar:

- mantenibilidad
- claridad
- despliegue reproducible
