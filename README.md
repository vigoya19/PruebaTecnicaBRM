
# Proyecto de Prueba Técnica INVENTARIO_DB
# Opcion 1

## Descripción

Este proyecto es una aplicación Node.js que utiliza Express para el servidor web, Sequelize para el ORM y MySQL como base de datos. El proyecto incluye autenticación con JWT, validación con Joi y registro de logs con Winston.

## Requisitos

- Docker
- Docker Compose

## Instalación y Despliegue

Sigue los siguientes pasos para desplegar el proyecto usando Docker:

1. **Clona el repositorio**:

   ```
   git clone https://github.com/vigoya19/PruebaTecnicaBRM
   cd PruebaTecnicaBRM
Crea un archivo .env en la raíz del proyecto con las siguientes variables:

env
```
MYSQL_USER=user
MYSQL_PASSWORD=skitiswaif123
MYSQL_DATABASE=inventario_db
MYSQL_HOST=mysql
PORT=3000
JWT_SECRET=your_jwt_secret_key
```

Construye y levanta los contenedores Docker:

```
docker-compose up --build -d
```
Esto construirá las imágenes de Docker y levantará los contenedores necesarios para la aplicación y la base de datos MySQL.



Accede a la aplicación:

Una vez que los contenedores estén levantados, podrás acceder a la aplicación en http://localhost:3000.

## Migraciones Sequalize
Las migraciones de la base de datos se ejecutan automáticamente al levantar los contenedores Docker. Puedes ejecutar manualmente las migraciones con el siguiente comando:

```

docker-compose exec app npm run migrate

```
## Problemas Comunes
El puerto 3306 ya está en uso:

Si obtienes un error que dice que el puerto 3306 ya está en uso, asegúrate de que no haya otro servicio MySQL ejecutándose en tu máquina.
Problemas de conexión a la base de datos:

Asegúrate de que las variables de entorno en tu archivo .env coincidan con las configuraciones en docker-compose.yml.
Si tienes algún problema o duda, no dudes en abrir un issue en el repositorio.


# Opcion 2

Crear la base de datos manualmente
Si no deseas utilizar Docker para desplegar el proyecto, puedes seguir estos pasos para crear las bases de datos y tablas manualmente:

* Instala MySQL: Si no tienes MySQL instalado, puedes descargarlo e instalarlo desde aquí.

* Conéctate a MySQL: Abre una terminal o consola y conéctate a tu servidor MySQL utilizando el siguiente comando:


```
mysql -u root -p
```
Ingresa tu contraseña de root cuando se te solicite.

Crea la base de datos: Ejecuta el siguiente comando para crear la base de datos inventario_db:

```
CREATE DATABASE inventario_db;
```
Selecciona la base de datos: Usa la base de datos que acabas de crear:

```
USE inventario_db;
```


Configura las variables de entorno: Crea un archivo .env en la raíz del proyecto con las siguientes variables:

```
MYSQL_USER=root
MYSQL_PASSWORD=tu_contraseña_de_root
MYSQL_DATABASE=inventario_db
MYSQL_HOST=localhost
PORT=3000
JWT_SECRET=your_jwt_secret_key
```


Crea las tablas: Copia y pega los scripts SQL proporcionados anteriormente para crear las tablas Users, Products, Purchases y PurchaseProducts.

Configura las variables de entorno: Crea un archivo .env en la raíz del proyecto con las siguientes variables:

```
MYSQL_USER=root
MYSQL_PASSWORD=tu_contraseña_de_root
MYSQL_DATABASE=inventario_db
MYSQL_HOST=localhost
PORT=3000
JWT_SECRET=your_jwt_secret_key
```


```

-- Crear tabla Users
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Crear tabla Products
CREATE TABLE Products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lotNumber VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    price FLOAT NOT NULL,
    availableQuantity INT NOT NULL,
    entryDate DATE NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Crear tabla Purchases
CREATE TABLE Purchases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT,
    purchaseDate DATE NOT NULL,
    totalAmount FLOAT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(id)
);

-- Crear tabla PurchaseProducts
CREATE TABLE PurchaseProducts (
    purchaseId INT,
    productId INT,
    quantity INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (purchaseId, productId),
    FOREIGN KEY (purchaseId) REFERENCES Purchases(id),
    FOREIGN KEY (productId) REFERENCES Products(id)
);
```

O si Prefieres Instala las dependencias y ejecuta las migraciones de la aplicación:
```
npm install
npm install --save-dev sequelize-cli
npm start
npx sequelize-cli db:migrate

```
## Documentación de la API

La documentación de la API está disponible y accesible mediante ApiDoc. Para visualizarla, sigue estos pasos:

1. Genera la documentación de ApiDoc ejecutando el siguiente comando:

    ```bash
    apidoc -i user/ -i product/ -i purchase/ -o apidoc/
    ```

2. Inicia el servidor de tu aplicación (asegúrate de que está corriendo en el puerto `3001`):

    ```bash
    npm start
    ```
## Nota
Si ya tienes tu contenedor de docker corriendo accede por esta url 
 [http://localhost:3000/docs](http://localhost:3001/docs) 

3. Accede a la documentación en tu navegador si estas sin Docker (modo local):

    [http://localhost:3001/docs](http://localhost:3001/docs)

Al acceder a esta URL, podrás visualizar la documentación completa de la API generada por ApiDoc.




Librerías Utilizadas
* bcryptjs: Para el hash de contraseñas.
* body-parser: Para parsear los cuerpos de las solicitudes.
* dotenv: Para manejar variables de entorno.
* express: Framework web para Node.js.
* joi: Para la validación de datos.
* jsonwebtoken: Para la autenticación y generación de tokens JWT.
* mysql2: Cliente MySQL para Node.js.
* sequelize: ORM para manejar la base de datos.
* winston: Para el registro de logs.
* Scripts de npm
* start: Inicia la aplicación.
* migrate: Ejecuta las migraciones de la base de datos.
* seed: Ejecuta los seeders de la base de datos.
* lint: Ejecuta ESLint para revisar el código.
* lint:fix: Ejecuta ESLint y corrige los errores que pueden ser corregidos automáticamente.
* prettier: Ejecuta Prettier para revisar el formato del código.
* prettier:fix: Ejecuta Prettier y corrige el formato del código.
* test: Ejecuta las pruebas con Jest.
* test:watch: Ejecuta las pruebas en modo watch con Jest.
* test:coverage: Ejecuta las pruebas y genera un reporte de cobertura con Jest.
* Migraciones
