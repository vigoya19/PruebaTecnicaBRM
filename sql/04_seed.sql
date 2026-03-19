INSERT INTO btg.cliente (id, nombre, apellidos, ciudad) VALUES
    (1, 'Andres', 'Quintero', 'Bogota'),
    (2, 'Maria', 'Lopez', 'Medellin')
ON CONFLICT DO NOTHING;

INSERT INTO btg.sucursal (id, nombre, ciudad) VALUES
    (1, 'Sucursal Centro', 'Bogota'),
    (2, 'Sucursal Norte', 'Bogota'),
    (3, 'Sucursal Poblado', 'Medellin')
ON CONFLICT DO NOTHING;

INSERT INTO btg.producto (id, nombre, tipo_producto) VALUES
    (1, 'Producto A', 'FPV'),
    (2, 'Producto B', 'FIC')
ON CONFLICT DO NOTHING;

INSERT INTO btg.disponibilidad (id_sucursal, id_producto) VALUES
    (1, 1),
    (2, 1),
    (3, 2)
ON CONFLICT DO NOTHING;

INSERT INTO btg.visitan (id_sucursal, id_cliente, fecha_visita) VALUES
    (1, 1, DATE '2025-06-01'),
    (2, 1, DATE '2025-06-05'),
    (3, 2, DATE '2025-06-07')
ON CONFLICT DO NOTHING;

INSERT INTO btg.inscripcion (id_producto, id_cliente) VALUES
    (1, 1),
    (2, 2)
ON CONFLICT DO NOTHING;
