-- Tabla de asignaciones entrenador-cliente
CREATE TABLE IF NOT EXISTS trainer_client_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trainer_id INTEGER NOT NULL,
    client_id INTEGER NOT NULL,
    assigned_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'activo', -- 'activo', 'pausado', 'finalizado'
    notes TEXT, -- notas sobre la asignación
    sessions_per_week INTEGER DEFAULT 2,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trainer_id) REFERENCES trainers(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    UNIQUE(trainer_id, client_id)
);

-- Insertar asignaciones coherentes (el entrenador Izan con algunos clientes)
INSERT INTO trainer_client_assignments (trainer_id, client_id, assigned_date, status, notes, sessions_per_week) VALUES
(1, 1, '2024-01-20', 'activo', 'Cliente motivado, objetivo ganancia muscular', 3),
(1, 3, '2024-02-01', 'activo', 'Principiante, necesita orientación básica', 2),
(1, 5, '2024-03-01', 'activo', 'Cliente experimentado, entrenamiento variado', 2),
(1, 7, '2024-03-15', 'activo', 'Objetivo ganancia muscular femenina', 3),
(1, 9, '2024-02-25', 'activo', 'Entrenamiento de resistencia y cardio', 2),
(1, 11, '2024-03-20', 'activo', 'Cliente nueva, evaluación inicial completada', 2);