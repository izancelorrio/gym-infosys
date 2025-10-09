-- Crear tabla de reservas de clases
CREATE TABLE IF NOT EXISTS reservas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_cliente INTEGER NOT NULL,
    id_clase_programada INTEGER NOT NULL,
    fecha_reserva DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'activa',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Claves foráneas
    FOREIGN KEY (id_cliente) REFERENCES clientes(id) ON DELETE CASCADE,
    FOREIGN KEY (id_clase_programada) REFERENCES clases_programadas(id) ON DELETE CASCADE,
    
    -- Restricciones únicas: un cliente no puede reservar la misma clase dos veces
    UNIQUE(id_cliente, id_clase_programada)
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_reservas_cliente ON reservas(id_cliente);
CREATE INDEX IF NOT EXISTS idx_reservas_clase ON reservas(id_clase_programada);
CREATE INDEX IF NOT EXISTS idx_reservas_estado ON reservas(estado);

-- Comentario sobre estados posibles
-- Estados: 'activa', 'cancelada', 'completada'