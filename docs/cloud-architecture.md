# Diagrama de Arquitectura Cloud

## Vista de despliegue AWS

<p align="center">
  <img src="images/arquitectura.png" alt="BTG Funds Cloud Architecture" width="1000" />
</p>

Archivo fuente adicional:

- `docs/arquitectura.pdf`

## Vista funcional

La imagen de arquitectura representa este flujo funcional:

1. el cliente se registra o inicia sesion
2. Cognito autentica y entrega el JWT
3. API Gateway valida el token con el `JWT authorizer`
4. Lambda ejecuta `Fastify` y enruta la solicitud
5. la capa de servicios aplica reglas de negocio
6. DynamoDB actualiza saldo, suscripcion y transaccion
7. el servicio de notificaciones decide entre `SES` o `SNS`
8. el resultado del envio se refleja en `notificationStatus`

## Componentes clave

- `API Gateway HTTP API`
  Expone endpoints publicos y protegidos.

- `Amazon Cognito`
  Gestiona usuarios, login y emision de JWT.

- `AWS Lambda`
  Ejecuta la API Node.js con Fastify.

- `DynamoDB`
  Persiste perfil del cliente, saldo, fondos, suscripciones e historial.

- `SES`
  Canal de notificacion por correo.

- `SNS`
  Canal de notificacion por SMS.

- `CloudWatch`
  Centraliza logs y trazabilidad operativa.

## Narrativa para sustentacion

1. El cliente se registra o inicia sesion contra la API.
2. La API orquesta Cognito para obtener el JWT.
3. Las rutas protegidas pasan por `JWT authorizer` en API Gateway.
4. Lambda ejecuta Fastify y aplica la logica de negocio.
5. DynamoDB conserva el estado financiero y el historial del cliente.
6. El sistema intenta enviar notificacion por `SES` o `SNS`.
7. El resultado del envio queda trazado en `notificationStatus`.
