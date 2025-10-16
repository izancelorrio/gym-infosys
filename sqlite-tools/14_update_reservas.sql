-- Actualizar tabla reservas: quitar campo fecha_reserva
-- SQLite no soporta DROP COLUMN directamente, así que recreamos la tabla

BEGIN TRANSACTION;

-- Crear tabla temporal con la nueva estructura
CREATE TABLE reservas_temp (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_cliente INTEGER NOT NULL,
    id_clase_programada INTEGER NOT NULL,
    estado VARCHAR(20) DEFAULT 'activa',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Claves foráneas
    FOREIGN KEY (id_cliente) REFERENCES clientes(id) ON DELETE CASCADE,
    FOREIGN KEY (id_clase_programada) REFERENCES clases_programadas(id) ON DELETE CASCADE,
    
    -- Restricciones únicas: un cliente no puede reservar la misma clase dos veces
    UNIQUE(id_cliente, id_clase_programada)
);

-- Copiar datos existentes (sin el campo fecha_reserva)
INSERT INTO reservas_temp (id, id_cliente, id_clase_programada, estado, created_at, updated_at)
SELECT id, id_cliente, id_clase_programada, estado, created_at, updated_at
FROM reservas;

-- Eliminar tabla original
DROP TABLE reservas;

-- Renombrar tabla temporal
ALTER TABLE reservas_temp RENAME TO reservas;

-- Recrear índices
CREATE INDEX IF NOT EXISTS idx_reservas_cliente ON reservas(id_cliente);
CREATE INDEX IF NOT EXISTS idx_reservas_clase ON reservas(id_clase_programada);
CREATE INDEX IF NOT EXISTS idx_reservas_estado ON reservas(estado);

COMMIT;