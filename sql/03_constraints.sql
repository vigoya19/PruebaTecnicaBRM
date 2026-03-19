ALTER TABLE btg.inscripcion
    ADD CONSTRAINT fk_inscripcion_producto
        FOREIGN KEY (id_producto) REFERENCES btg.producto (id),
    ADD CONSTRAINT fk_inscripcion_cliente
        FOREIGN KEY (id_cliente) REFERENCES btg.cliente (id);

ALTER TABLE btg.disponibilidad
    ADD CONSTRAINT fk_disponibilidad_sucursal
        FOREIGN KEY (id_sucursal) REFERENCES btg.sucursal (id),
    ADD CONSTRAINT fk_disponibilidad_producto
        FOREIGN KEY (id_producto) REFERENCES btg.producto (id);

ALTER TABLE btg.visitan
    ADD CONSTRAINT fk_visitan_sucursal
        FOREIGN KEY (id_sucursal) REFERENCES btg.sucursal (id),
    ADD CONSTRAINT fk_visitan_cliente
        FOREIGN KEY (id_cliente) REFERENCES btg.cliente (id);
