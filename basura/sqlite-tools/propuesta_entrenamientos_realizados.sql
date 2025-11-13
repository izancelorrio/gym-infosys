-- =====================================================
-- TABLA: ENTRENAMIENTOS_REALIZADOS (Registro de actividad completada)
-- =====================================================

-- Eliminar tabla entrenamientos_realizados si existe (para recrearla)
DROP TABLE IF EXISTS entrenamientos_realizados;

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS update_entrenamientos_realizados_timestamp;

-- =====================================================
-- CREAR TABLA ENTRENAMIENTOS_REALIZADOS
-- =====================================================
CREATE TABLE IF NOT EXISTS entrenamientos_realizados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_cliente INTEGER NOT NULL,
    id_ejercicio INTEGER NOT NULL,
    id_entrenamiento_asignado INTEGER, -- NULL si es actividad libre, FK si viene de plan
    fecha_realizacion DATE NOT NULL,
    hora_inicio TIME,
    hora_fin TIME,
    series_realizadas INTEGER NOT NULL CHECK (series_realizadas > 0),
    repeticiones INTEGER CHECK (repeticiones > 0),
    peso_kg DECIMAL(5,2) CHECK (peso_kg >= 0),
    tiempo_segundos INTEGER CHECK (tiempo_segundos > 0),
    distancia_metros DECIMAL(8,2) CHECK (distancia_metros > 0),
    notas TEXT,
    valoracion INTEGER CHECK (valoracion >= 1 AND valoracion <= 5), -- 1-5 estrellas
    tipo_registro VARCHAR(20) DEFAULT 'libre' CHECK (tipo_registro IN ('libre', 'planificado')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Claves foráneas
    FOREIGN KEY (id_cliente) REFERENCES clientes(id) ON DELETE CASCADE,
    FOREIGN KEY (id_ejercicio) REFERENCES ejercicios(id) ON DELETE RESTRICT,
    FOREIGN KEY (id_entrenamiento_asignado) REFERENCES entrenamientos_asignados(id) ON DELETE SET NULL
);

-- =====================================================
-- CREAR INDICES PARA OPTIMIZAR CONSULTAS
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_entrenamientos_realizados_cliente ON entrenamientos_realizados(id_cliente);
CREATE INDEX IF NOT EXISTS idx_entrenamientos_realizados_ejercicio ON entrenamientos_realizados(id_ejercicio);
CREATE INDEX IF NOT EXISTS idx_entrenamientos_realizados_fecha ON entrenamientos_realizados(fecha_realizacion);
CREATE INDEX IF NOT EXISTS idx_entrenamientos_realizados_asignado ON entrenamientos_realizados(id_entrenamiento_asignado);
CREATE INDEX IF NOT EXISTS idx_entrenamientos_realizados_tipo ON entrenamientos_realizados(tipo_registro);
CREATE INDEX IF NOT EXISTS idx_entrenamientos_realizados_updated_at ON entrenamientos_realizados(updated_at);

-- =====================================================
-- CREAR TRIGGER PARA ACTUALIZAR updated_at
-- =====================================================
CREATE TRIGGER update_entrenamientos_realizados_timestamp 
    AFTER UPDATE ON entrenamientos_realizados
BEGIN
    UPDATE entrenamientos_realizados SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- =====================================================
-- TRIGGER PARA ACTUALIZAR ESTADO DE ENTRENAMIENTO ASIGNADO
-- =====================================================
CREATE TRIGGER update_entrenamiento_asignado_completado
    AFTER INSERT ON entrenamientos_realizados
    WHEN NEW.id_entrenamiento_asignado IS NOT NULL
BEGIN
    UPDATE entrenamientos_asignados 
    SET estado = 'completado', updated_at = CURRENT_TIMESTAMP 
    WHERE id = NEW.id_entrenamiento_asignado;
END;

