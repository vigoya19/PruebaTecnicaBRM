# Cobertura del Enunciado

## Parte 1 - Fondos

| Requisito | Estado | Implementacion |
| --- | --- | --- |
| Suscribirse a un nuevo fondo | Cubierto | `POST /customers/me/subscriptions` |
| Cancelar suscripcion a un fondo actual | Cubierto | `DELETE /customers/me/subscriptions/:fundId` |
| Ver historial de transacciones | Cubierto | `GET /customers/me/transactions` |
| Consultar perfil y saldo del cliente autenticado | Cubierto | `GET /customers/me` |
| Consultar clientes y transacciones para supervision administrativa | Cubierto | `GET /admin/customers`, `GET /admin/customers/:customerId`, `GET /admin/customers/:customerId/transactions` |
| Notificacion por email o SMS | Cubierto | `src/services/notifications.service.js` |
| Monto inicial del cliente `COP 500000` | Cubierto | `src/config/constants.js` y autocreacion de perfil |
| Identificador unico por transaccion | Cubierto | `crypto.randomUUID()` en servicio de suscripciones |
| Validar monto minimo por fondo | Cubierto | Catalogo semilla y servicio de suscripciones |
| Devolucion del saldo al cancelar | Cubierto | `TransactWriteItems` en cancelacion |
| Mensaje por saldo insuficiente | Cubierto | `src/services/subscriptions.service.js` |
| Modelo de datos NoSQL | Cubierto | DynamoDB single-table |
| API REST | Cubierto | Fastify routes/controllers |
| Manejo de excepciones | Cubierto | `src/errors` y `src/hooks/error-handler.js` |
| Codigo limpio | Cubierto | Separacion por capas |
| Pruebas unitarias | Cubierto | `tests/unit` |
| Seguridad y mantenibilidad | Cubierto | Cognito, JWT authorizer, IAM, validacion |
| Autenticacion y autorizacion | Cubierto | `POST /auth/register`, `POST /auth/login`, Cognito + JWT authorizer + grupos |
| Perfilamiento por roles | Cubierto | grupos `admin` y `customer`, `authz.service.js` y endpoints administrativos de solo lectura |
| Infraestructura en AWS | Cubierto | `serverless.yml` |
| Justificacion de arquitectura | Cubierto | `README.md` y `docs/architecture.md` |
| Coleccion Postman | Cubierto | `docs/postman/BTG_Funds.postman_collection.json` |

## Parte 2 - SQL

| Requisito | Estado | Implementacion |
| --- | --- | --- |
| Crear schema PostgreSQL | Cubierto | `sql/01_schema.sql` |
| Crear tablas | Cubierto | `sql/02_tables.sql` |
| Crear relaciones FK | Cubierto | `sql/03_constraints.sql` |
| Semillas de ejemplo | Cubierto | `sql/04_seed.sql` |
| Consulta solicitada | Cubierto | `sql/05_queries.sql` |

## Observaciones

- El flujo local permite bypass de autenticacion solo para desarrollo y pruebas rapidas.
- En AWS, el registro y el login se realizan desde la propia API, pero la identidad sigue siendo administrada por Cognito.
- Para una demostracion completamente real en AWS se debe desplegar la infraestructura y probar con usuarios de Cognito.
