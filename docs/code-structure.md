# Estructura Tecnica del Codigo

Este documento describe como esta organizado el codigo y que responsabilidad tiene cada capa.

## Vision general

La aplicacion sigue una estructura modular por capas:

- `routes`
- `controllers`
- `services`
- `repositories`
- `lib`
- `hooks`
- `errors`
- `config`

El objetivo es separar:

- transporte HTTP
- reglas de negocio
- acceso a persistencia
- integraciones con AWS

## Punto de entrada

### `src/app.js`

Responsabilidad:

- construir la instancia de `Fastify`
- registrar el contenedor de dependencias
- registrar hooks globales
- registrar las rutas de la API

### `src/lambda.js`

Responsabilidad:

- adaptar Fastify al runtime de `AWS Lambda`

### `src/server.js`

Responsabilidad:

- levantar la aplicacion en modo local

## Contenedor de dependencias

### `src/container.js`

Responsabilidad:

- construir clientes AWS
- instanciar repositorios
- instanciar servicios
- inyectar dependencias entre servicios y repositorios

Clientes creados:

- `CognitoIdentityProviderClient`
- `SNSClient`
- `SESv2Client`
- `documentClient` de DynamoDB

## Capa de rutas

Responsabilidad:

- definir endpoints
- aplicar `preHandler`
- conectar rutas con controladores

Archivos:

- `src/routes/auth.routes.js`
- `src/routes/customers.routes.js`
- `src/routes/health.routes.js`
- `src/routes/funds.routes.js`
- `src/routes/subscriptions.routes.js`
- `src/routes/transactions.routes.js`

## Capa de controladores

Responsabilidad:

- recibir la request de Fastify
- extraer params, query, body y principal autenticado
- invocar el servicio correcto
- construir la respuesta HTTP

Archivos:

- `src/controllers/auth.controller.js`
- `src/controllers/customers.controller.js`
- `src/controllers/health.controller.js`
- `src/controllers/funds.controller.js`
- `src/controllers/subscriptions.controller.js`
- `src/controllers/transactions.controller.js`

## Capa de servicios

Responsabilidad:

- concentrar reglas de negocio
- validar flujos funcionales
- coordinar persistencia e integraciones externas

### `src/services/auth.service.js`

Se encarga de:

- registrar usuarios en Cognito
- autenticar usuarios existentes
- decodificar el JWT devuelto por Cognito
- asegurar o crear el perfil del cliente en DynamoDB

### `src/services/customers.service.js`

Se encarga de:

- consultar el perfil del cliente autenticado
- listar clientes para un principal `admin`
- consultar un cliente especifico para un principal `admin`

### `src/services/funds.service.js`

Se encarga de:

- listar el catalogo de fondos

### `src/services/subscriptions.service.js`

Se encarga de:

- abrir suscripciones
- cancelar suscripciones
- validar fondo activo
- validar saldo disponible
- validar duplicidad de suscripcion activa
- coordinar transaccion financiera y notificacion

### `src/services/transactions.service.js`

Se encarga de:

- listar el historial de transacciones de un cliente
- listar transacciones de cualquier cliente cuando el principal es `admin`

### `src/services/notifications.service.js`

Se encarga de:

- decidir si la notificacion sale por `SES` o `SNS`
- devolver `SENT`, `FAILED` o `SIMULATED`
- aislar el fallo del proveedor respecto al negocio principal

### `src/services/authz.service.js`

Se encarga de:

- autorizacion fina por rol cuando aplique
- asegurar acceso administrativo a endpoints de auditoria

## Capa de repositorios

Responsabilidad:

- encapsular acceso a DynamoDB
- evitar que la capa de servicios construya queries directamente

Archivos:

- `src/repositories/customers.repository.js`
- `src/repositories/funds.repository.js`
- `src/repositories/subscriptions.repository.js`
- `src/repositories/transactions.repository.js`

### Operaciones relevantes

- creacion y consulta de perfil del cliente
- lectura de fondos
- apertura y cancelacion de suscripciones
- lectura y actualizacion del historial de transacciones

## Hooks y autenticacion

### `src/hooks/auth.js`

Responsabilidad:

- leer el principal autenticado desde headers o claims
- soportar bypass local controlado

### `src/hooks/error-handler.js`

Responsabilidad:

- centralizar el manejo de errores
- transformar excepciones en respuestas HTTP consistentes

## Errores

### `src/errors/app-error.js`

Responsabilidad:

- definir errores de aplicacion con status code y mensaje controlado

Ejemplos:

- `badRequest`
- `unauthorized`
- `notFound`
- `conflict`

## Configuracion

### `src/config/env.js`

Responsabilidad:

- leer variables de entorno
- exponer configuracion normalizada

### `src/config/constants.js`

Responsabilidad:

- centralizar constantes del dominio
- preferencias de notificacion
- saldo inicial
- roles

## Librerias internas

### `src/lib/dynamodb.js`

Responsabilidad:

- construir el `DocumentClient`
- soportar conexion local o contra AWS real

### `src/lib/logger.js`

Responsabilidad:

- encapsular logging de la aplicacion

## Flujo tecnico resumido

1. `API Gateway` invoca la Lambda
2. `Fastify` enruta la request
3. el `controller` transforma la request en llamada de dominio
4. el `service` aplica reglas de negocio
5. el `repository` persiste o consulta en DynamoDB
6. el `service` devuelve el resultado al `controller`
7. el `controller` responde al cliente

## Patrones aplicados

- `Repository`
  - desacopla persistencia de negocio
- `Service Layer`
  - encapsula reglas del dominio
- `Dependency Injection` simple
  - aplicada desde `src/container.js`
- `Adapter`
  - hacia Cognito, SES, SNS y DynamoDB
