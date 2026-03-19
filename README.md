# BTG Funds Platform

Backend serverless para la prueba tecnica de BTG Pactual. La solucion implementa la gestion de fondos solicitada con `Node.js`, `Fastify`, `AWS Lambda`, `API Gateway HTTP API`, `Amazon Cognito`, `DynamoDB`, `SNS/SES` y `Serverless Framework`.

## Portada

**Solucion entregada**

- Parte 1: plataforma de fondos serverless en AWS
- Parte 2: scripts SQL para PostgreSQL
- Infraestructura, autenticacion, roles, pruebas, Postman y documentacion tecnica

**Navegacion rapida**

- [Que resuelve la solucion](#que-resuelve-la-solucion)
- [Arquitectura](#arquitectura)
- [Endpoints implementados](#endpoints-implementados)
- [Instalacion local](#instalacion-local)
- [Despliegue en AWS](#despliegue-en-aws)
- [Prueba directa contra el ambiente ya desplegado](#prueba-directa-contra-el-ambiente-ya-desplegado)
- [Seed de fondos](#seed-de-fondos)
- [Postman](#postman)
- [Flujo recomendado de validacion](#flujo-recomendado-de-validacion)
- [Como probar endpoint por endpoint](#como-probar-endpoint-por-endpoint)
- [Notificaciones: como interpretarlas](#notificaciones-como-interpretarlas)
- [Roles y autorizacion](#roles-y-autorizacion)
- [Parte 2 - SQL](#parte-2---sql)
- [Resumen de validacion rapida](#resumen-de-validacion-rapida)
- [Validacion en 5 minutos](#validacion-en-5-minutos)

**Documentacion complementaria**

- [Arquitectura funcional](docs/architecture.md)
- [Arquitectura cloud](docs/cloud-architecture.md)
- [Casos de uso](docs/use-cases.md)
- [Estructura tecnica del codigo](docs/code-structure.md)
- [Librerias utilizadas](docs/libraries-used.md)
- [Cobertura del enunciado](docs/requirements-coverage.md)
- [Diagrama en PDF](docs/arquitectura.pdf)
- [Coleccion Postman](docs/postman/BTG_Funds.postman_collection.json)
- [Environment Postman](docs/postman/BTG_Funds_AWS.postman_environment.json)

**Ruta sugerida para el revisor**

1. Leer esta portada y la seccion [Resumen de validacion rapida](#resumen-de-validacion-rapida).
2. Si quiere ir al detalle tecnico, revisar [Arquitectura](#arquitectura) y [Roles y autorizacion](#roles-y-autorizacion).
3. Si quiere probar la solucion, ir directo a [Postman](#postman) y [Como probar endpoint por endpoint](#como-probar-endpoint-por-endpoint).
4. Si quiere revisar la Parte 2, ir a [Parte 2 - SQL](#parte-2---sql).

## Que resuelve la solucion

La API permite que un cliente:

- se registre e inicie sesion
- consulte su perfil y saldo disponible
- consulte el catalogo de fondos
- se suscriba a un fondo
- cancele una suscripcion
- consulte su historial de transacciones
- reciba una notificacion por email o SMS segun su preferencia

La entrega incluye adicionalmente:

- modelo NoSQL en DynamoDB
- infraestructura como codigo con Serverless Framework
- autenticacion y autorizacion con Cognito
- pruebas unitarias
- coleccion y environment de Postman
- scripts SQL para la parte 2

## Arquitectura

- `API Gateway HTTP API` expone la API
- `JWT Authorizer` valida los tokens emitidos por `Amazon Cognito`
- `AWS Lambda` ejecuta la aplicacion `Fastify`
- `DynamoDB` persiste fondos, perfiles, transacciones y suscripciones
- `SNS` y `SES` manejan notificaciones por SMS y email
- `CloudWatch Logs` centraliza observabilidad
- `Serverless Framework` despliega la infraestructura


<p align="center">
  <img src="docs/images/arquitectura.png" alt="BTG Funds Cloud Architecture" width="900" />
</p>

Documentacion adicional:

- `docs/architecture.md`
- `docs/cloud-architecture.md`
- `docs/use-cases.md`
- `docs/code-structure.md`
- `docs/libraries-used.md`
- `docs/requirements-coverage.md`
- `docs/arquitectura.pdf`

## Reglas de negocio implementadas

- saldo inicial por cliente: `COP 500000`
- cada fondo tiene un monto minimo de vinculacion
- al abrir una suscripcion se descuenta el monto minimo del fondo
- al cancelar una suscripcion se devuelve el valor vinculado
- cada transaccion tiene identificador unico
- si no hay saldo suficiente se responde:
  - `No tiene saldo disponible para vincularse al fondo <Nombre del fondo>`
- no se permite tener dos suscripciones activas al mismo fondo para el mismo cliente

## Catalogo de fondos sembrado

| ID | Nombre | Monto minimo | Categoria |
| --- | --- | ---: | --- |
| 1 | `FPV_BTG_PACTUAL_RECAUDADORA` | `75000` | `FPV` |
| 2 | `FPV_BTG_PACTUAL_ECOPETROL` | `125000` | `FPV` |
| 3 | `DEUDAPRIVADA` | `50000` | `FIC` |
| 4 | `FDO-ACCIONES` | `250000` | `FIC` |
| 5 | `FPV_BTG_PACTUAL_DINAMICA` | `100000` | `FPV` |

## Endpoints implementados

| Metodo | Ruta | Token | Descripcion |
| --- | --- | --- | --- |
| `GET` | `/health` | No | Healthcheck del servicio |
| `POST` | `/auth/register` | No | Crea usuario en Cognito y perfil de negocio en DynamoDB |
| `POST` | `/auth/login` | No | Inicia sesion en Cognito y devuelve tokens |
| `GET` | `/customers/me` | Si | Retorna perfil y saldo del usuario autenticado |
| `GET` | `/funds` | Si | Lista el catalogo de fondos |
| `POST` | `/customers/me/subscriptions` | Si | Abre una suscripcion |
| `DELETE` | `/customers/me/subscriptions/:fundId` | Si | Cancela una suscripcion |
| `GET` | `/customers/me/transactions` | Si | Lista historial de transacciones |
| `GET` | `/admin/customers` | Si, rol `admin` | Lista perfiles de clientes |
| `GET` | `/admin/customers/:customerId` | Si, rol `admin` | Consulta el perfil de un cliente |
| `GET` | `/admin/customers/:customerId/transactions` | Si, rol `admin` | Consulta transacciones de un cliente |

## Estructura del proyecto

```text
src/
  config/
  controllers/
  errors/
  hooks/
  lib/
  repositories/
  routes/
  schemas/
  services/
docs/
  images/
  postman/
sql/
scripts/
tests/
serverless.yml
package.json
```

## Requisitos previos

Para instalar, desplegar y probar la solucion se necesita:

- `Node.js 20` o superior
- `npm`
- una cuenta AWS con permisos sobre:
  - Lambda
  - API Gateway
  - DynamoDB
  - Cognito
  - CloudWatch
  - SNS
  - SES
- AWS CLI configurado localmente

Archivos AWS CLI tipicos en Windows:

- `C:\Users\<usuario>\.aws\credentials`
- `C:\Users\<usuario>\.aws\config`

Ejemplo de verificacion rapida:

```bash
aws sts get-caller-identity
```

## Instalacion local

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd PruebaTecnica
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Crear el archivo `.env`

Crear un `.env` en la raiz del proyecto. Ejemplo minimo:

```env
PORT=3000
AWS_REGION=us-east-1
FUNDS_TABLE_NAME=btg-funds-platform-dev
SES_FROM_EMAIL=correo-verificado@example.com
DYNAMODB_ENDPOINT=
COGNITO_USER_POOL_ID=
COGNITO_USER_POOL_CLIENT_ID=
LOCAL_AUTH_BYPASS=true
```

Notas:

- `DYNAMODB_ENDPOINT` debe quedar vacio si se va a usar DynamoDB real en AWS
- `COGNITO_USER_POOL_ID` y `COGNITO_USER_POOL_CLIENT_ID` se inyectan automaticamente en Lambda durante el deploy
- `LOCAL_AUTH_BYPASS=true` solo sirve para desarrollo local; en AWS la proteccion real la hace API Gateway con JWT authorizer

## Scripts disponibles

| Script | Uso |
| --- | --- |
| `npm run dev` | levanta el servidor local |
| `npm run start` | levanta el servidor local |
| `npm test` | ejecuta pruebas unitarias |
| `npm test -- --coverage` | genera coverage |
| `npm run seed:funds` | inserta el catalogo de fondos en DynamoDB |
| `npm run deploy` | despliega con Serverless |
| `npm run remove` | elimina el stack |
| `npm run offline` | levanta serverless offline |

## Ejecucion local

Para correr la API localmente:

```bash
npm run dev
```

Base URL local:

```text
http://localhost:3000
```

## Pruebas unitarias

Ejecutar:

```bash
npm test
```

Coverage:

```bash
npm test -- --coverage
```

Ultimo coverage esperado:

- `98.29%` statements
- `88.57%` branch
- `100%` functions
- `98.17%` lines

## Despliegue en AWS

### 1. Desplegar el stack

```bash
npx serverless deploy --stage dev --region us-east-1
```

Este comando crea:

- HTTP API
- Lambda principal
- tabla DynamoDB
- Cognito User Pool
- Cognito User Pool Client
- grupos `admin` y `customer`

### 2. Ver la configuracion resuelta

```bash
npx serverless print --stage dev --region us-east-1
```

### 3. Ver informacion del despliegue

```bash
npx serverless info --stage dev --region us-east-1
```

### 4. Identificar la URL de API Gateway

El despliegue devuelve una URL como:

```text
https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com
```

Esa URL se debe cargar en Postman como `baseUrl`.

## Prueba directa contra el ambiente ya desplegado

Si el revisor quiere validar la solucion sin desplegar primero su propio stack, puede consumir directamente el ambiente actualmente desplegado en mi cuenta AWS usando esta URL base:

```text
https://8ru2lbghw2.execute-api.us-east-1.amazonaws.com
```

Endpoints disponibles en ese ambiente:

- `GET https://8ru2lbghw2.execute-api.us-east-1.amazonaws.com/health`
- `POST https://8ru2lbghw2.execute-api.us-east-1.amazonaws.com/auth/register`
- `POST https://8ru2lbghw2.execute-api.us-east-1.amazonaws.com/auth/login`
- `GET https://8ru2lbghw2.execute-api.us-east-1.amazonaws.com/customers/me`
- `GET https://8ru2lbghw2.execute-api.us-east-1.amazonaws.com/funds`
- `POST https://8ru2lbghw2.execute-api.us-east-1.amazonaws.com/customers/me/subscriptions`
- `DELETE https://8ru2lbghw2.execute-api.us-east-1.amazonaws.com/customers/me/subscriptions/{fundId}`
- `GET https://8ru2lbghw2.execute-api.us-east-1.amazonaws.com/customers/me/transactions`
- `GET https://8ru2lbghw2.execute-api.us-east-1.amazonaws.com/admin/customers`
- `GET https://8ru2lbghw2.execute-api.us-east-1.amazonaws.com/admin/customers/{customerId}`
- `GET https://8ru2lbghw2.execute-api.us-east-1.amazonaws.com/admin/customers/{customerId}/transactions`

Para este escenario:

- basta con importar la coleccion y el environment de Postman
- verificar que `baseUrl` apunte a la URL anterior
- ejecutar `Register Customer`, `Login Customer`, `Register Admin` o `Login Admin`
- continuar con el resto del flujo

Si el revisor quiere una validacion totalmente aislada sobre su propia cuenta AWS, entonces debe seguir la seccion de despliegue y usar su propio `baseUrl`.

## Seed de fondos

El catalogo de fondos no se crea automaticamente con el deploy. Debe poblarse con el script:

```bash
npm run seed:funds
```

Antes de correrlo, verifica:

- `AWS_REGION=us-east-1`
- `FUNDS_TABLE_NAME=btg-funds-platform-dev`
- `DYNAMODB_ENDPOINT=` vacio

Validacion posterior:

- `GET /funds` no debe devolver `items: []`

Si `GET /funds` devuelve vacio, normalmente significa que el deploy salio bien pero el seed aun no se ha ejecutado.

## Postman

### Archivos a importar

Coleccion:

- `docs/postman/BTG_Funds.postman_collection.json`

Environment:

- `docs/postman/BTG_Funds_AWS.postman_environment.json`

### Variables incluidas en el environment

| Variable | Uso |
| --- | --- |
| `baseUrl` | URL de API Gateway |
| `token` | token bearer usado por toda la coleccion |
| `idToken` | JWT principal retornado por register/login |
| `accessToken` | access token de Cognito |
| `refreshToken` | refresh token de Cognito |
| `customerEmail` | correo del usuario cliente |
| `customerPassword` | password del usuario cliente |
| `customerName` | nombre del usuario cliente |
| `customerPhone` | telefono del usuario cliente |
| `adminEmail` | correo del usuario admin |
| `adminPassword` | password del usuario admin |
| `adminName` | nombre del usuario admin |
| `adminPhone` | telefono del usuario admin |
| `fundId` | fondo a usar en apertura/cancelacion |
| `notificationPreference` | `email` o `sms` |
| `customerId` | id del cliente autenticado en el flujo customer |
| `adminCustomerId` | id del usuario autenticado en el flujo admin |
| `targetCustomerId` | id del cliente que el admin va a consultar |

### Configuracion correcta en Postman

1. Importar la coleccion `BTG_Funds.postman_collection.json`.
2. Importar el environment `BTG_Funds_AWS.postman_environment.json`.
3. En la esquina superior derecha de Postman seleccionar el environment `BTG Funds AWS`.
4. Editar `baseUrl` si el revisor desplego una API distinta.
5. Ajustar `customerEmail`, `customerPassword`, `customerName`, `customerPhone` y `notificationPreference` si quiere crear un cliente distinto.
6. Ajustar `adminEmail`, `adminPassword`, `adminName` y `adminPhone` si quiere crear un admin de prueba.

Valor por defecto incluido en el environment:

```text
baseUrl=https://8ru2lbghw2.execute-api.us-east-1.amazonaws.com
```

Eso permite probar directamente el ambiente ya desplegado sin modificar nada, salvo que el revisor prefiera apuntar a su propio stack.

Importante:

- si Postman muestra `No environment selected`, los scripts de `Register` y `Login` no podran guardar `token`
- si `token` no se guarda, cualquier endpoint protegido devolvera `401 Unauthorized`

### Estructura de la coleccion

La coleccion esta organizada por carpetas:

- `01 - Public / Auth`
  - `Health`
  - `Register Customer`
  - `Login Customer`
  - `Register Admin`
  - `Login Admin`
- `02 - Customer`
  - `Get My Profile`
  - `List Funds`
  - `Open Subscription`
  - `List Transactions`
  - `Cancel Subscription`
- `03 - Admin`
  - `List Customers`
  - `Get Customer By Id`
  - `Get Customer Transactions`

### Scripts automaticos incluidos

Las requests de autenticacion ya traen scripts de test que actualizan automaticamente:

- `token`
- `idToken`
- `accessToken`
- `refreshToken`
- `customerId`
- `adminCustomerId`
- `targetCustomerId`
- `customerEmail`
- `customerName`
- `customerPhone`
- `adminEmail`
- `adminName`
- `adminPhone`
- `notificationPreference`

Por eso el flujo recomendado es:

1. ejecutar una request de login o registro
2. dejar que Postman guarde el JWT
3. consumir el resto de endpoints sin escribir manualmente el bearer token

## Flujo recomendado de validacion

Orden sugerido para un revisor funcional:

1. `Health`
2. `Register Customer`
3. `Login Customer`
4. `Get My Profile`
5. `List Funds`
6. `Open Subscription`
7. `Get My Profile`
8. `List Transactions`
9. `Cancel Subscription`
10. `Get My Profile`
11. `List Transactions`

Que debe observarse:

- el usuario se crea en Cognito y en DynamoDB
- `Login Customer` devuelve tokens y actualiza el environment
- el perfil inicia con `availableBalance: 500000`
- la apertura descuenta saldo
- la cancelacion devuelve el saldo
- el historial registra apertura y cancelacion
- `notificationStatus` muestra el resultado del intento de envio

## Como probar endpoint por endpoint

### 1. `GET /health`

Uso:

- validar que API Gateway, Lambda y Fastify estan operativos

Request:

```http
GET /health
```

Respuesta esperada:

```json
{
  "service": "btg-funds-platform",
  "status": "ok",
  "timestamp": "2026-03-18T00:00:00.000Z"
}
```

### 2. `POST /auth/register`

Uso:

- crear un usuario en Cognito
- crear su perfil de negocio en DynamoDB
- iniciar sesion inmediatamente y devolver tokens

Body:

```json
{
  "email": "cliente.demo@example.com",
  "password": "Temp1234!",
  "name": "Cliente Demo",
  "phone": "+573001112233",
  "notificationPreference": "email"
}
```

Body alterno para demo administrativa:

```json
{
  "email": "admin.demo@example.com",
  "password": "Temp1234!",
  "name": "Admin Demo",
  "phone": "+573001119999",
  "notificationPreference": "email",
  "role": "admin"
}
```

Respuesta esperada:

- `idToken`
- `accessToken`
- `refreshToken`
- `customer`

Observaciones:

- las requests `Register Customer` y `Register Admin` usan este mismo endpoint
- `role` es opcional; por defecto la API crea usuarios `customer`
- para la demo, `Register Admin` envia `role: "admin"` y crea un administrador de solo lectura
- si el usuario ya existe en Cognito, el revisor puede cambiar el correo o pasar directamente a `Login`

### 3. `POST /auth/login`

Uso:

- autenticar un usuario ya creado
- obtener el JWT para los endpoints protegidos

Body:

```json
{
  "email": "cliente.demo@example.com",
  "password": "Temp1234!"
}
```

Respuesta esperada:

- `idToken`
- `accessToken`
- `refreshToken`
- `customer`

Observaciones:

- esta request vuelve a cargar el environment
- `token` queda apuntando al `idToken`

### 4. `GET /customers/me`

Uso:

- consultar el perfil del cliente autenticado
- ver el saldo disponible antes y despues de operar fondos

Header requerido:

```http
Authorization: Bearer {{token}}
```

Respuesta esperada:

```json
{
  "customerId": "...",
  "email": "cliente.demo@example.com",
  "name": "Cliente Demo",
  "phone": "+573001112233",
  "notificationPreference": "email",
  "availableBalance": 500000
}
```

### 5. `GET /funds`

Uso:

- consultar el catalogo de fondos disponibles

Header requerido:

```http
Authorization: Bearer {{token}}
```

Respuesta esperada:

```json
{
  "items": [
    {
      "fundId": 1,
      "name": "FPV_BTG_PACTUAL_RECAUDADORA",
      "minimumAmount": 75000,
      "category": "FPV"
    }
  ]
}
```

Si devuelve:

```json
{
  "items": []
}
```

entonces falta ejecutar el seed de fondos.

### 6. `POST /customers/me/subscriptions`

Uso:

- abrir una suscripcion para el cliente autenticado
- descontar el monto minimo del fondo
- registrar transaccion de apertura
- intentar enviar notificacion

Body:

```json
{
  "fundId": 1,
  "notificationPreference": "email"
}
```

Respuesta esperada:

```json
{
  "transactionId": "...",
  "customerId": "...",
  "fundId": 1,
  "fundName": "FPV_BTG_PACTUAL_RECAUDADORA",
  "amount": 75000,
  "balanceAfter": 425000,
  "status": "ACTIVE",
  "notificationStatus": "SENT"
}
```

Estados posibles de `notificationStatus`:

- `SENT`
- `FAILED`
- `SIMULATED`

Respuesta esperada en error de negocio:

```json
{
  "message": "No tiene saldo disponible para vincularse al fondo <Nombre del fondo>"
}
```

Respuesta esperada si el cliente ya estaba suscrito:

```json
{
  "message": "The customer already has an active subscription for this fund"
}
```

### 7. `DELETE /customers/me/subscriptions/:fundId`

Uso:

- cancelar una suscripcion activa
- devolver el valor vinculado al saldo disponible
- registrar transaccion de cancelacion

Ejemplo:

```http
DELETE /customers/me/subscriptions/1
```

Respuesta esperada:

```json
{
  "transactionId": "...",
  "customerId": "...",
  "fundId": 1,
  "fundName": "FPV_BTG_PACTUAL_RECAUDADORA",
  "amount": 75000,
  "balanceAfter": 500000,
  "status": "CANCELLED"
}
```

### 8. `GET /customers/me/transactions`

Uso:

- consultar aperturas y cancelaciones del usuario autenticado
- validar trazabilidad completa

Respuesta esperada:

```json
{
  "items": [
    {
      "transactionId": "...",
      "type": "OPEN",
      "fundId": 1,
      "fundName": "FPV_BTG_PACTUAL_RECAUDADORA",
      "amount": 75000,
      "balanceBefore": 500000,
      "balanceAfter": 425000,
      "notificationChannel": "email",
      "notificationStatus": "SENT",
      "createdAt": "2026-03-18T00:00:00.000Z"
    }
  ]
}
```

### 9. `GET /admin/customers`

Uso:

- listar perfiles de clientes desde un principal con rol `admin`
- soportar auditoria operativa o soporte

Respuesta esperada:

```json
{
  "items": [
    {
      "customerId": "...",
      "email": "cliente.demo@example.com",
      "name": "Cliente Demo",
      "availableBalance": 500000,
      "role": "customer"
    }
  ]
}
```

### 10. `GET /admin/customers/:customerId`

Uso:

- consultar el perfil de un cliente especifico desde un principal con rol `admin`

Respuesta esperada:

```json
{
  "customerId": "...",
  "email": "cliente.demo@example.com",
  "name": "Cliente Demo",
  "phone": "+573001112233",
  "notificationPreference": "email",
  "availableBalance": 500000,
  "role": "customer"
}
```

### 11. `GET /admin/customers/:customerId/transactions`

Uso:

- consultar transacciones de cualquier cliente desde un principal con rol `admin`

Respuesta esperada:

```json
{
  "items": [
    {
      "transactionId": "...",
      "type": "OPEN",
      "fundId": 1,
      "fundName": "FPV_BTG_PACTUAL_RECAUDADORA",
      "amount": 75000
    }
  ]
}
```

## Uso recomendado de la coleccion Postman

Los nombres de las requests corresponden a endpoints reales. La idea es ejecutar la misma request varias veces durante el flujo para ver el cambio de estado. Por ejemplo:

- ejecutar `Get My Profile` antes de suscribirse para ver `500000`
- ejecutar `Get My Profile` despues de suscribirse para ver `425000`
- ejecutar `Get My Profile` despues de cancelar para ver de nuevo `500000`

Lo mismo aplica para `List Transactions`, que debe mostrar primero la apertura y luego apertura + cancelacion.

## Notificaciones: como interpretarlas

La aplicacion intenta enviar notificaciones usando:

- `SES` para email
- `SNS` para SMS

Estados posibles:

- `SENT`: el proveedor AWS respondio correctamente
- `FAILED`: el proveedor fallo o el entorno lo restringio
- `SIMULATED`: no habia canal aplicable para envio real

Importante para el revisor:

- la operacion de negocio no se revierte si falla la notificacion
- el saldo y la suscripcion siguen siendo consistentes
- el resultado del canal se deja trazado en la transaccion

## Roles y autorizacion

La solucion define dos roles:

- `customer`
- `admin`

### `customer`

Puede:

- registrarse
- iniciar sesion
- consultar su perfil
- ver fondos
- suscribirse
- cancelar suscripciones
- consultar su propio historial

### `admin`

Puede:

- consultar perfiles de clientes
- consultar el perfil de un cliente especifico
- consultar transacciones de cualquier cliente

El rol `admin` esta pensado para:

- auditoria
- soporte operativo
- supervision de actividad de clientes

Alcance actual del rol `admin`:

- los endpoints administrativos son de solo lectura
- no crean, modifican ni eliminan informacion de clientes
- su objetivo es visibilidad operativa y trazabilidad sobre usuarios `customer`

En Cognito esto se representa con grupos:

- `customer`
- `admin`

La API valida el JWT en `API Gateway` y luego hace autorizacion fina dentro de la aplicacion usando el rol presente en los claims.

### Como crear y probar una cuenta `admin`

En esta version pensada para demo, `POST /auth/register` acepta tambien `role: "admin"` y puede crear un usuario administrativo directamente.

Importante:

- esta capacidad se habilito especificamente para facilitar la demo y las pruebas del evaluador
- el objetivo es poder mostrar de forma directa las funcionalidades administrativas sin requerir un paso manual adicional en Cognito
- aun con ese flujo de creacion a demanda, el alcance del admin sigue siendo de solo lectura sobre datos de clientes
- en un escenario productivo, la alta de admins deberia quedar restringida a un proceso controlado y no a un registro publico abierto

Si el revisor quiere probar los endpoints administrativos, este es el flujo recomendado:

#### Paso 1. Registrar el usuario que sera admin

En Postman ejecutar:

- `01 - Public / Auth -> Register Admin`

Eso crea un usuario en Cognito usando:

- `adminEmail`
- `adminPassword`
- `adminName`
- `adminPhone`

#### Paso 2. Iniciar sesion como admin

En Postman ejecutar:

- `01 - Public / Auth -> Login Admin`

Esto actualiza automaticamente:

- `token`
- `adminCustomerId`

#### Paso 3. Consultar un cliente objetivo

Primero conviene haber ejecutado `Register Customer` o `Login Customer`, porque esas requests llenan:

- `customerId`
- `targetCustomerId`

Luego el admin puede usar la carpeta:

- `03 - Admin`

#### Endpoints administrativos disponibles

- `GET /admin/customers`
- `GET /admin/customers/:customerId`
- `GET /admin/customers/:customerId/transactions`

#### Requests equivalentes en Postman

- `03 - Admin -> List Customers`
- `03 - Admin -> Get Customer By Id`
- `03 - Admin -> Get Customer Transactions`

En ambientes AWS restringidos, especialmente con SES sandbox:

- un correo destino no verificado puede producir `notificationStatus: FAILED`
- eso no es un fallo del core del negocio sino una restriccion operativa del servicio administrado

## Limitacion actual del ambiente desplegado en mi cuenta

El ambiente ya desplegado en mi cuenta AWS sirve para validar completamente:

- registro
- login
- consulta de perfil
- consulta de fondos
- apertura de suscripcion
- cancelacion
- historial de transacciones

La limitacion conocida de ese ambiente esta en el canal de notificaciones:

- mi cuenta AWS no tiene habilitado un entorno de mensajeria completamente abierto para terceros
- en particular, `SES` puede seguir operando con restricciones de sandbox o con identidades verificadas limitadas
- por esa razon, un revisor que use su propio correo puede ver `notificationStatus: FAILED`
- aun en ese caso, la suscripcion, el saldo y la transaccion quedan correctamente persistidos

En otras palabras:

- la integracion con `SES` y `SNS` existe
- la logica de negocio esta implementada
- la restriccion es operativa del entorno AWS desde el cual estoy enviando
- no afecta el flujo principal ni la consistencia del negocio

## Recomendacion para el revisor si despliega su propio stack

Si el revisor quiere validar la parte de notificaciones contra su propia cuenta AWS y recibir mensajes reales, recomiendo configurar adicionalmente:

### Email con SES

1. definir `SES_FROM_EMAIL` con un remitente valido
2. verificar ese remitente o dominio en `Amazon SES`
3. si la cuenta sigue en sandbox:
   - verificar tambien los destinatarios de prueba
4. si desea que cualquier correo no verificado pueda recibir mensajes:
   - solicitar acceso a produccion en `SES`

### SMS con SNS

1. entrar a `Amazon SNS`
2. configurar `Text messaging preferences`
3. definir el tipo de mensaje como `Transactional`
4. revisar limites de gasto para SMS
5. si la cuenta esta en sandbox de SMS:
   - verificar el numero destino
6. si desea enviar a cualquier numero:
   - sacar la cuenta del sandbox de SMS

Resumen practico:

- si prueban contra mi ambiente, el flujo funcional principal ya se puede validar directamente
- si quieren validar tambien la entrega real de email/SMS a sus propios destinos, deben desplegar su stack y habilitar `SES` y `SNS` en su cuenta

## Troubleshooting

### `401 Unauthorized`

Revisar:

- que se haya ejecutado `Login Customer`, `Login Admin`, `Register Customer` o `Register Admin`
- que el environment `BTG Funds AWS` este seleccionado en Postman
- que la variable `token` tenga valor

### `GET /funds` devuelve `items: []`

Revisar:

- que el stack este desplegado
- que `FUNDS_TABLE_NAME` apunte a la tabla correcta
- que se haya ejecutado `npm run seed:funds`

### `notificationStatus: FAILED`

Revisar:

- `SES_FROM_EMAIL` configurado
- si el remitente esta verificado en SES
- si el entorno AWS permite enviar al destinatario

Esto no invalida la transaccion financiera; solo refleja que el canal no pudo completarse.

### El login funciona pero los otros endpoints siguen fallando

La causa mas comun es Postman mal configurado:

- `No environment selected`
- `token` vacio
- `baseUrl` apuntando a otra API

## Variables de entorno

| Variable | Descripcion |
| --- | --- |
| `PORT` | Puerto local |
| `AWS_REGION` | Region AWS |
| `FUNDS_TABLE_NAME` | Nombre de la tabla DynamoDB |
| `COGNITO_USER_POOL_ID` | User Pool de Cognito |
| `COGNITO_USER_POOL_CLIENT_ID` | App Client de Cognito |
| `SES_FROM_EMAIL` | Remitente usado por SES |
| `DYNAMODB_ENDPOINT` | endpoint de DynamoDB local, vacio para AWS real |
| `LOCAL_AUTH_BYPASS` | bypass local de autenticacion |

## Parte 2 - SQL

La Parte 2 del enunciado no pide construir otro servicio backend ni otra API. Lo que pide es entregar los scripts SQL correspondientes para PostgreSQL, contemplando:

- creacion de la base logica para el ejercicio
- creacion del esquema
- creacion de tablas
- definicion de llaves foraneas
- datos de ejemplo
- consulta solicitada

En esta solucion, esa parte se entrega como un conjunto ordenado de scripts listos para ejecutar en PostgreSQL.

### Opcion rapida con Docker

Para facilitar la revision, tambien se entrega una forma de levantar PostgreSQL con Docker y ejecutar automaticamente todos los scripts SQL al iniciar el contenedor.

Archivos:

- `Dockerfile.postgres`
- `docker-compose.postgres.yml`

Comando:

```bash
docker compose -f docker-compose.postgres.yml up --build
```

Que hace:

- levanta un contenedor PostgreSQL
- crea la base `btg`
- copia los scripts `sql/` al directorio `/docker-entrypoint-initdb.d/`
- ejecuta automaticamente los archivos en este orden:
  - `01_schema.sql`
  - `02_tables.sql`
  - `03_constraints.sql`
  - `04_seed.sql`
  - `05_queries.sql`

Credenciales por defecto del contenedor:

- base de datos: `btg`
- usuario: `postgres`
- password: `postgres`
- puerto: `5432`

Importante:

- los scripts de inicializacion de Postgres solo se ejecutan automaticamente la primera vez que se crea el volumen
- si se quiere reinicializar la base desde cero y volver a ejecutar todos los scripts, usar:

```bash
docker compose -f docker-compose.postgres.yml down -v
docker compose -f docker-compose.postgres.yml up --build
```

### Archivos entregados

- `sql/01_schema.sql`
  - crea el esquema `btg`
- `sql/02_tables.sql`
  - crea las tablas:
    - `btg.cliente`
    - `btg.sucursal`
    - `btg.producto`
    - `btg.inscripcion`
    - `btg.disponibilidad`
    - `btg.visitan`
- `sql/03_constraints.sql`
  - crea las relaciones entre tablas con llaves foraneas
- `sql/04_seed.sql`
  - inserta datos de ejemplo para validar la consulta
- `sql/05_queries.sql`
  - contiene la consulta pedida en el enunciado

### Que consulta resuelve el punto 2

La consulta entregada resuelve el requerimiento:

- obtener los nombres de los clientes que tienen inscrito algun producto disponible solo en las sucursales que visitan

La logica implementada usa:

- `EXISTS`
- `NOT EXISTS`

Esto permite validar correctamente dos condiciones:

1. que el cliente tenga una inscripcion a un producto
2. que no exista ninguna sucursal con ese producto que el cliente no haya visitado

### Orden de ejecucion sugerido en PostgreSQL

Si el revisor quiere probar la Parte 2 manualmente en PostgreSQL, el orden recomendado es:

1. ejecutar `sql/01_schema.sql`
2. ejecutar `sql/02_tables.sql`
3. ejecutar `sql/03_constraints.sql`
4. ejecutar `sql/04_seed.sql`
5. ejecutar `sql/05_queries.sql`

### Ejemplo de ejecucion con `psql`

Si ya existe una base de datos PostgreSQL creada por el revisor, por ejemplo `btg`, puede ejecutar:

```bash
psql -d btg -f sql/01_schema.sql
psql -d btg -f sql/02_tables.sql
psql -d btg -f sql/03_constraints.sql
psql -d btg -f sql/04_seed.sql
psql -d btg -f sql/05_queries.sql
```

Nota:

- el repositorio entrega los scripts SQL completos
- la creacion fisica de la base de datos PostgreSQL puede hacerla el revisor previamente con el nombre que prefiera
- una vez creada la base, estos scripts ya resuelven el resto del punto 2

### Resultado esperado con los datos de ejemplo

Con el seed actual, la consulta debe devolver los clientes que cumplen la condicion de estar inscritos en productos disponibles exclusivamente en las sucursales que visitan.

## Archivos relevantes para el revisor

- `serverless.yml`
- `package.json`
- `docs/use-cases.md`
- `docs/code-structure.md`
- `docs/libraries-used.md`
- `docs/postman/BTG_Funds.postman_collection.json`
- `docs/postman/BTG_Funds_AWS.postman_environment.json`
- `docs/architecture.md`
- `docs/cloud-architecture.md`
- `docs/requirements-coverage.md`
- `sql/01_schema.sql`
- `sql/02_tables.sql`
- `sql/03_constraints.sql`
- `sql/04_seed.sql`
- `sql/05_queries.sql`

## Resumen de validacion rapida

Si el revisor solo quiere confirmar el flujo principal, el minimo es:

1. `npm install`
2. `npx serverless deploy --stage dev --region us-east-1`
3. actualizar `baseUrl` en Postman con la URL desplegada
4. `npm run seed:funds`
5. importar coleccion y environment de Postman
6. seleccionar `BTG Funds AWS`
7. ejecutar `Register Customer`
8. ejecutar `Get My Profile`
9. ejecutar `List Funds`
10. ejecutar `Open Subscription`
11. ejecutar `List Transactions`
12. ejecutar `Cancel Subscription`

Con ese flujo ya se validan autenticacion, fondos, saldo, suscripcion, cancelacion e historial.

## Validacion en 5 minutos

Si el evaluador dispone de muy poco tiempo, esta es la validacion mas corta y efectiva:

1. importar la coleccion y el environment de Postman
2. seleccionar `BTG Funds AWS`
3. ejecutar `Register Customer`
4. ejecutar `Get My Profile`
5. ejecutar `List Funds`
6. ejecutar `Open Subscription`
7. ejecutar `List Transactions`
8. ejecutar `Cancel Subscription`

Que deberia verificar rapidamente:

- `Register Customer`
  - crea el usuario
  - devuelve tokens
  - llena automaticamente el environment
- `Get My Profile`
  - muestra saldo inicial de `500000`
- `List Funds`
  - devuelve el catalogo de 5 fondos
- `Open Subscription`
  - descuenta saldo
  - crea la transaccion
  - devuelve `notificationStatus`
- `List Transactions`
  - muestra al menos una transaccion `OPEN`
- `Cancel Subscription`
  - devuelve el saldo
  - deja trazabilidad de cancelacion

Resultado esperado:

- autenticacion funcionando
- reglas de negocio funcionando
- persistencia funcionando
- trazabilidad funcionando
- integracion de notificaciones implementada
