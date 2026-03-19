SELECT DISTINCT c.nombre, c.apellidos
FROM btg.cliente c
JOIN btg.inscripcion i
  ON i.id_cliente = c.id
WHERE EXISTS (
    SELECT 1
    FROM btg.visitan v
    JOIN btg.disponibilidad d
      ON d.id_sucursal = v.id_sucursal
     AND d.id_producto = i.id_producto
    WHERE v.id_cliente = c.id
)
AND NOT EXISTS (
    SELECT 1
    FROM btg.disponibilidad d2
    WHERE d2.id_producto = i.id_producto
      AND NOT EXISTS (
          SELECT 1
          FROM btg.visitan v2
          WHERE v2.id_cliente = c.id
            AND v2.id_sucursal = d2.id_sucursal
      )
);
