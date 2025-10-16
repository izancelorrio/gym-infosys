-- Datos de prueba para asignaciones entrenador-cliente
-- Este archivo crea algunas asignaciones de ejemplo

-- Asignar el entrenador Izan2 (id=14) al cliente Alejo González (id=1)
INSERT INTO entrenador_cliente_asignaciones (id_entrenador, id_cliente, notas)
VALUES (14, 1, 'Cliente con experiencia previa en fitness');

-- Asignar el entrenador Pedro Martín González (id=15) al cliente Ana Martínez (id=3)
INSERT INTO entrenador_cliente_asignaciones (id_entrenador, id_cliente, notas)
VALUES (15, 3, 'Cliente principiante, necesita seguimiento personalizado');

-- Asignar el entrenador Izan2 (id=14) al cliente Carlos Ruiz (id=4)
INSERT INTO entrenador_cliente_asignaciones (id_entrenador, id_cliente, notas)
VALUES (14, 4, 'Cliente enfocado en entrenamiento de fuerza');