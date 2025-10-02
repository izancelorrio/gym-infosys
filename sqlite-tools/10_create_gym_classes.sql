-- =====================================================
-- SCRIPT: 10_create_gym_classes.sql
-- DESCRIPCION: Crear tabla tipos de clases del gimnasio
-- FECHA: 2025-10-02
-- =====================================================

-- Eliminar tabla si existe para recrearla
DROP TABLE IF EXISTS gym_clases;

-- Tabla simplificada de tipos de clases del gimnasio
CREATE TABLE IF NOT EXISTS gym_clases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    duracion_minutos INTEGER DEFAULT 45,
    nivel VARCHAR(20) DEFAULT 'todos', -- 'principiante', 'intermedio', 'avanzado', 'todos'
    max_participantes INTEGER DEFAULT 20,
    activo INTEGER DEFAULT 1, -- 1=activo, 0=inactivo
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Crear trigger para actualizar updated_at
CREATE TRIGGER update_gym_clases_timestamp 
    AFTER UPDATE ON gym_clases 
BEGIN 
    UPDATE gym_clases SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; 
END;

-- =====================================================
-- POBLAR DATOS DE TIPOS DE CLASES
-- =====================================================

-- Insertar todos los tipos de clases disponibles
INSERT INTO gym_clases (nombre, descripcion, duracion_minutos, nivel, max_participantes) VALUES
('Pilates', 'Ejercicios de fortalecimiento del core y flexibilidad', 50, 'todos', 15),
('Zumba', 'Baile fitness con ritmos latinos y música energética', 45, 'todos', 25),
('CrossFit', 'Entrenamiento funcional de alta intensidad', 60, 'intermedio', 12),
('Spinning', 'Ciclismo indoor con música motivacional', 45, 'todos', 20),
('Yoga', 'Práctica de posturas, respiración y meditación', 60, 'todos', 18),
('Aeróbicos', 'Ejercicios cardiovasculares con movimientos rítmicos', 45, 'principiante', 20),
('Funcional', 'Entrenamiento con movimientos naturales del cuerpo', 50, 'intermedio', 16),
('Boxing', 'Entrenamiento de boxeo sin contacto, técnica y cardio', 45, 'intermedio', 14),
('Aqua Aeróbicos', 'Ejercicios cardiovasculares y de resistencia en el agua', 45, 'todos', 12),
('Body Pump', 'Entrenamiento con pesas al ritmo de la música', 55, 'intermedio', 18),
('Body Combat', 'Artes marciales coreografiadas sin contacto', 50, 'todos', 22),
('Stretching', 'Sesión de estiramientos y relajación muscular', 30, 'todos', 20);

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