-- =====================================================
-- SCRIPT: 13_create_reservas.sql
-- DESCRIPCION: Datos de población para tabla reservas
-- FECHA: 2025-10-16
-- AUTOR: Sistema Gym Management
-- =====================================================
-- 
-- NOTA: La estructura de la tabla reservas está en crear_base_datos.sql
-- Este archivo contiene solo los datos de población
-- 
-- =====================================================

-- Insertar algunas reservas de ejemplo
-- Usando IDs de clientes existentes del archivo 03_crear_clientes.sql
-- y clases programadas que se crearán del archivo 11_create_clases_programadas.sql
INSERT INTO reservas (id_cliente, id_clase_programada, estado) VALUES
(8, 1, 'activa'),   -- David Celorrio en clase programada 1
(22, 1, 'activa'),  -- Carlos García en clase programada 1
(23, 2, 'activa'),  -- María López en clase programada 2
(24, 3, 'activa'),  -- Juan Martínez en clase programada 3
(25, 4, 'activa'),  -- Ana Rodríguez en clase programada 4
(26, 5, 'activa'),  -- Pedro Sánchez en clase programada 5
(27, 6, 'activa'),  -- Laura Fernández en clase programada 6
(28, 2, 'activa'),  -- Miguel González en clase programada 2
(29, 3, 'activa'),  -- Carmen Ruiz en clase programada 3
(30, 4, 'activa'),  -- Antonio Jiménez en clase programada 4
(31, 1, 'activa'),  -- Isabel Moreno en clase programada 1
(8, 5, 'activa'),   -- David Celorrio en clase programada 5
(22, 6, 'activa'),  -- Carlos García en clase programada 6
(23, 7, 'activa'),  -- María López en clase programada 7
(24, 8, 'activa');  -- Juan Martínez en clase programada 8

-- =====================================================
-- NOTAS:
-- =====================================================
-- Estados posibles: 'activa', 'cancelada', 'completada'
-- Cada cliente puede reservar múltiples clases diferentes
-- Un cliente NO puede reservar la misma clase dos veces (UNIQUE constraint)
-- =====================================================