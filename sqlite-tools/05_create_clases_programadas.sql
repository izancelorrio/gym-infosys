-- =====================================================
-- SCRIPT: 11_create_clases_programadas.sql
-- DESCRIPCION: Datos de población para tabla clases_programadas
-- FECHA: 2025-10-16
-- AUTOR: Sistema Gym Management
-- =====================================================
-- 
-- NOTA: La estructura de la tabla clases_programadas está en crear_base_datos.sql
-- Este archivo contiene solo los datos de población
-- 
-- =====================================================

-- Insertar algunas clases de ejemplo para la próxima semana
-- Entrenadores disponibles: ID 9 (Izan), ID 35 (Pedro Martín González)
-- Clases disponibles: 1=Pilates, 2=Zumba, 3=CrossFit, 4=Spinning, 5=Yoga, 10=Body Pump, etc.
INSERT INTO clases_programadas (fecha, hora, id_clase, id_instructor, capacidad_maxima, ubicacion, duracion_minutos) VALUES
('2025-10-17', '09:00', 1, 9, 15, 'Sala 1', 50),  -- Pilates con Izan
('2025-10-17', '18:00', 2, 35, 25, 'Sala Principal', 45),  -- Zumba con Pedro
('2025-10-18', '07:00', 3, 9, 12, 'Box CrossFit', 60),  -- CrossFit con Izan
('2025-10-18', '19:00', 5, 35, 18, 'Sala Zen', 60),  -- Yoga con Pedro
('2025-10-19', '10:00', 4, 9, 20, 'Sala Spinning', 45),  -- Spinning con Izan
('2025-10-19', '17:00', 10, 35, 18, 'Sala de Pesas', 55),  -- Body Pump con Pedro
('2025-10-20', '08:00', 6, 9, 20, 'Sala Cardio', 45),  -- Aeróbicos con Izan
('2025-10-20', '16:00', 7, 35, 16, 'Área Funcional', 50),  -- Funcional con Pedro
('2025-10-21', '11:00', 8, 9, 14, 'Ring de Boxing', 45),  -- Boxing con Izan
('2025-10-21', '20:00', 11, 35, 22, 'Sala Principal', 50);  -- Body Combat con Pedro

-- =====================================================
-- VERIFICAR CREACION
-- =====================================================

-- Mostrar estructura de la tabla
.schema clases_programadas

-- Mostrar todas las clases programadas con JOIN
SELECT 
    cp.id,
    cp.fecha,
    cp.hora,
    cp.tipo_clase as 'Tipo',
    u.name as 'Instructor',
    cp.capacidad_maxima as 'Capacidad',
    cp.estado as 'Estado'
FROM clases_programadas cp
JOIN users u ON cp.instructor_id = u.id
ORDER BY cp.fecha, cp.hora;

-- Resumen por instructor
SELECT 
    u.name as 'Instructor',
    COUNT(*) as 'Clases Programadas'
FROM clases_programadas cp
JOIN users u ON cp.instructor_id = u.id
WHERE cp.estado = 'programada'
GROUP BY cp.instructor_id, u.name;

-- =====================================================
-- NOTAS:
-- =====================================================
-- 1. Tabla con restricciones para evitar conflictos de horarios
-- 2. Trigger automático para updated_at
-- 3. Índices para optimizar consultas frecuentes
-- 4. Datos de ejemplo para testing
-- 5. Capacidades basadas en los tipos de clase de gym_clases
-- =====================================================