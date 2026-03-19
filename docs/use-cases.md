# Casos de Uso

Este documento describe los casos de uso funcionales principales cubiertos por la solucion.

## Actor principal

- `Cliente autenticado`

## Actor secundario

- `Plataforma AWS`
  - `Cognito`
  - `DynamoDB`
  - `SES`
  - `SNS`

## Caso de uso 1 - Registrar cliente

### Objetivo

Permitir que un cliente cree una cuenta y quede listo para operar fondos.

### Endpoint

- `POST /auth/register`

### Precondiciones

- el correo no debe existir previamente en Cognito
- la configuracion de Cognito debe estar disponible

### Flujo principal

1. el cliente envía correo, password, nombre, telefono y preferencia de notificacion
2. la API crea el usuario en Cognito
3. la API establece la password permanente
4. la API agrega el usuario al grupo `customer`
5. la API consulta el `sub` generado por Cognito
6. la API crea el perfil de negocio en DynamoDB
7. la API autentica al usuario y devuelve tokens

### Postcondiciones

- el usuario existe en Cognito
- el perfil existe en DynamoDB
- el cliente queda autenticado

## Caso de uso 2 - Iniciar sesion

### Objetivo

Permitir que un cliente existente obtenga un JWT valido para consumir la API protegida.

### Endpoint

- `POST /auth/login`

### Precondiciones

- el usuario debe existir en Cognito
- la password debe ser valida

### Flujo principal

1. el cliente envía correo y password
2. la API llama `InitiateAuth` en Cognito
3. Cognito devuelve `idToken`, `accessToken` y `refreshToken`
4. la API decodifica el JWT
5. la API asegura la existencia del perfil de negocio en DynamoDB
6. la API devuelve tokens y datos del cliente

### Postcondiciones

- el cliente queda autenticado
- el perfil del cliente queda disponible para operar

## Caso de uso 3 - Consultar perfil y saldo

### Objetivo

Permitir que el cliente consulte su informacion base y el saldo disponible para vincularse a fondos.

### Endpoint

- `GET /customers/me`

### Precondiciones

- el cliente debe estar autenticado con JWT valido

### Flujo principal

1. el cliente invoca la ruta protegida
2. API Gateway valida el token
3. la API obtiene el `sub` y datos del usuario desde los claims
4. la API consulta o asegura el perfil en DynamoDB
5. la API devuelve el perfil y `availableBalance`

## Caso de uso 4 - Consultar catalogo de fondos

### Objetivo

Permitir que el cliente vea los fondos disponibles antes de suscribirse.

### Endpoint

- `GET /funds`

### Precondiciones

- el cliente debe estar autenticado
- el seed de fondos debe haberse ejecutado

### Flujo principal

1. el cliente consulta la ruta protegida
2. la API lee los fondos activos en DynamoDB
3. la API devuelve el catalogo

## Caso de uso 5 - Suscribirse a un fondo

### Objetivo

Permitir que el cliente abra una suscripcion a un fondo y descuente el monto minimo correspondiente.

### Endpoint

- `POST /customers/me/subscriptions`

### Precondiciones

- el cliente debe estar autenticado
- el fondo debe existir y estar activo
- el cliente no debe tener una suscripcion activa a ese fondo
- el cliente debe tener saldo suficiente

### Flujo principal

1. el cliente envía `fundId` y `notificationPreference`
2. la API asegura el perfil del cliente
3. la API consulta el fondo
4. la API valida saldo y ausencia de suscripcion activa
5. la API ejecuta la operacion en DynamoDB
   - descuenta saldo
   - crea suscripcion
   - crea transaccion `OPEN`
6. la API intenta enviar notificacion por `SES` o `SNS`
7. la API actualiza `notificationStatus`
8. la API devuelve el resultado de la suscripcion

### Postcondiciones

- el saldo queda descontado
- la suscripcion queda activa
- la transaccion queda registrada

### Flujos alternos

- si el fondo no existe:
  - responde `404 Fund not found`
- si ya existe una suscripcion activa:
  - responde `409 The customer already has an active subscription for this fund`
- si no hay saldo suficiente:
  - responde `400 No tiene saldo disponible para vincularse al fondo <Nombre del fondo>`

## Caso de uso 6 - Cancelar una suscripcion

### Objetivo

Permitir que el cliente cancele una suscripcion activa y recupere el valor vinculado.

### Endpoint

- `DELETE /customers/me/subscriptions/:fundId`

### Precondiciones

- el cliente debe estar autenticado
- debe existir una suscripcion activa para ese fondo

### Flujo principal

1. el cliente solicita la cancelacion
2. la API consulta la suscripcion activa
3. la API ejecuta la cancelacion en DynamoDB
   - elimina o cierra la suscripcion activa
   - devuelve saldo al cliente
   - registra transaccion `CANCEL`
4. la API devuelve el resultado final

### Postcondiciones

- el saldo queda restituido
- la suscripcion deja de estar activa
- la transaccion de cancelacion queda registrada

## Caso de uso 7 - Consultar historial de transacciones

### Objetivo

Permitir que el cliente consulte aperturas y cancelaciones realizadas.

### Endpoint

- `GET /customers/me/transactions`

### Precondiciones

- el cliente debe estar autenticado

### Flujo principal

1. el cliente invoca la ruta protegida
2. la API asegura el perfil
3. la API consulta las transacciones del cliente en DynamoDB
4. la API devuelve el historial ordenado

### Datos relevantes del historial

- `transactionId`
- `type`
- `fundId`
- `fundName`
- `amount`
- `balanceBefore`
- `balanceAfter`
- `notificationChannel`
- `notificationStatus`
- `createdAt`

## Caso de uso 8 - Supervisar clientes como administrador

### Objetivo

Permitir que un usuario con rol `admin` consulte informacion de clientes y su actividad para fines de soporte o auditoria.

Nota de alcance:

- para facilitar la demo, la API permite crear un usuario `admin` a demanda mediante `POST /auth/register` con `role: "admin"`
- esta decision se tomo especificamente para pruebas y demostracion
- las capacidades del admin en la solucion actual son de solo lectura
- el admin consulta informacion de usuarios `customer`, pero no altera su estado

### Endpoints

- `GET /admin/customers`
- `GET /admin/customers/:customerId`
- `GET /admin/customers/:customerId/transactions`

### Precondiciones

- el usuario debe estar autenticado
- el usuario debe pertenecer al grupo `admin` en Cognito

### Flujo principal

1. el administrador invoca una ruta administrativa
2. API Gateway valida el JWT
3. la aplicacion extrae el rol desde los claims
4. `authz.service.js` valida que el principal sea `admin`
5. la API consulta DynamoDB
6. la API devuelve perfiles o transacciones segun la ruta

### Postcondiciones

- no modifica datos de negocio
- permite visibilidad operativa sobre clientes y transacciones
