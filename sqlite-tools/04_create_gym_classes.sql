-- =====================================================
-- SCRIPT: 10_create_gym_classes.sql
-- DESCRIPCION: Datos de población para tabla gym_clases
-- FECHA: 2025-10-16
-- AUTOR: Sistema Gym Management
-- =====================================================
-- 
-- NOTA: La estructura de la tabla gym_clases está en crear_base_datos.sql
-- Este archivo contiene solo los datos de población
-- 
-- =====================================================

-- Insertar todos los tipos de clases disponibles con colores
INSERT INTO gym_clases (nombre, descripcion, duracion_minutos, nivel, max_participantes, color) VALUES
('Pilates', 'Ejercicios de fortalecimiento del core y flexibilidad', 50, 'todos', 15, 'bg-blue-100 border-blue-300 text-blue-800'),
('Zumba', 'Baile fitness con ritmos latinos y música energética', 45, 'todos', 25, 'bg-pink-100 border-pink-300 text-pink-800'),
('CrossFit', 'Entrenamiento funcional de alta intensidad', 60, 'intermedio', 12, 'bg-red-100 border-red-300 text-red-800'),
('Spinning', 'Ciclismo indoor con música motivacional', 45, 'todos', 20, 'bg-green-100 border-green-300 text-green-800'),
('Yoga', 'Práctica de posturas, respiración y meditación', 60, 'todos', 18, 'bg-purple-100 border-purple-300 text-purple-800'),
('Aeróbicos', 'Ejercicios cardiovasculares con movimientos rítmicos', 45, 'principiante', 20, 'bg-orange-100 border-orange-300 text-orange-800'),
('Funcional', 'Entrenamiento con movimientos naturales del cuerpo', 50, 'intermedio', 16, 'bg-teal-100 border-teal-300 text-teal-800'),
('Boxing', 'Entrenamiento de boxeo sin contacto, técnica y cardio', 45, 'intermedio', 14, 'bg-amber-100 border-amber-300 text-amber-800'),
('Aqua Aeróbicos', 'Ejercicios cardiovasculares y de resistencia en el agua', 45, 'todos', 12, 'bg-cyan-100 border-cyan-300 text-cyan-800'),
('Body Pump', 'Entrenamiento con pesas al ritmo de la música', 55, 'intermedio', 18, 'bg-indigo-100 border-indigo-300 text-indigo-800'),
('Body Combat', 'Artes marciales coreografiadas sin contacto', 50, 'todos', 22, 'bg-rose-100 border-rose-300 text-rose-800'),
('Stretching', 'Sesión de estiramientos y relajación muscular', 30, 'todos', 20, 'bg-emerald-100 border-emerald-300 text-emerald-800');

-- =====================================================
-- VERIFICAR CREACION
-- =====================================================

-- Mostrar estructura de la tabla
.schema gym_clases

-- Mostrar todos los tipos de clases creados
SELECT 
    id,
    nombre as 'Tipo de Clase',
    duracion_minutos as 'Duración (min)',
    nivel as 'Nivel',
    max_participantes as 'Capacidad Máx.',
    CASE activo WHEN 1 THEN 'Activo' ELSE 'Inactivo' END as 'Estado'
FROM gym_clases 
ORDER BY nombre;

-- Resumen por nivel
SELECT 
    nivel as 'Nivel',
    COUNT(*) as 'Cantidad de Clases'
FROM gym_clases 
GROUP BY nivel;

-- =====================================================
-- NOTAS:
-- =====================================================
-- 1. Tabla simplificada con los tipos básicos de clases
-- 2. Trigger automático para updated_at
-- 3. Datos basados en la imagen proporcionada
-- 4. Configuración por defecto: 45 min, todos los niveles, 20 participantes
-- 5. Valores personalizados para cada tipo según características típicas
-- =====================================================