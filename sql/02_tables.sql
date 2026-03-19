CREATE TABLE IF NOT EXISTS btg.cliente (
    id BIGINT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    ciudad VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS btg.sucursal (
    id BIGINT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    ciudad VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS btg.producto (
    id BIGINT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo_producto VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS btg.inscripcion (
    id_producto BIGINT NOT NULL,
    id_cliente BIGINT NOT NULL,
    PRIMARY KEY (id_producto, id_cliente)
);

CREATE TABLE IF NOT EXISTS btg.disponibilidad (
    id_sucursal BIGINT NOT NULL,
    id_producto BIGINT NOT NULL,
    PRIMARY KEY (id_sucursal, id_producto)
);

CREATE TABLE IF NOT EXISTS btg.visitan (
    id_sucursal BIGINT NOT NULL,
    id_cliente BIGINT NOT NULL,
    fecha_visita DATE NOT NULL,
    PRIMARY KEY (id_sucursal, id_cliente)
);
