-- Tabla de entrenamientos/rutinas
CREATE TABLE IF NOT EXISTS workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    trainer_id INTEGER NOT NULL,
    client_id INTEGER NOT NULL,
    workout_type VARCHAR(50), -- 'fuerza', 'cardio', 'hiit', 'funcional', 'mixto'
    difficulty_level VARCHAR(20), -- 'principiante', 'intermedio', 'avanzado'
    estimated_duration INTEGER, -- en minutos
    description TEXT,
    notes TEXT, -- notas del entrenador
    status VARCHAR(20) DEFAULT 'activo', -- 'activo', 'pausado', 'completado'
    created_date DATE DEFAULT CURRENT_DATE,
    start_date DATE,
    end_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trainer_id) REFERENCES trainers(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Insertar planes de entrenamiento coherentes con las asignaciones existentes
INSERT INTO workouts (name, trainer_id, client_id, workout_type, difficulty_level, estimated_duration, description, notes, start_date, end_date) VALUES
-- Para David Celorrio (cliente 1) - objetivo ganancia muscular
('Rutina Push-Pull-Legs - David', 1, 1, 'fuerza', 'intermedio', 60, 'Rutina dividida en 3 días para ganancia muscular', 'Cliente con experiencia previa, aumentar progresivamente las cargas', '2024-01-20', '2024-04-20'),

-- Para María López (cliente 3) - objetivo pérdida de peso, principiante
('Circuito Principiante - María', 1, 3, 'mixto', 'principiante', 45, 'Combinación de fuerza y cardio para pérdida de peso', 'Enfoque en técnica correcta, progresión gradual', '2024-02-01', '2024-05-01'),

-- Para Ana Rodríguez (cliente 5) - objetivo general, moderado
('Entrenamiento Funcional - Ana', 1, 5, 'funcional', 'intermedio', 50, 'Rutina de entrenamiento funcional variado', 'Cliente experimientada, le gusta la variedad', '2024-03-01', '2024-06-01'),

-- Para Laura Fernández (cliente 7) - objetivo ganancia muscular
('Fuerza Femenina - Laura', 1, 7, 'fuerza', 'intermedio', 55, 'Rutina de fuerza específica para mujeres', 'Enfoque en glúteos y tren superior', '2024-03-15', '2024-06-15'),

-- Para Carmen Ruiz (cliente 9) - objetivo resistencia
('Cardio & Resistencia - Carmen', 1, 9, 'cardio', 'intermedio', 40, 'Plan de mejora cardiovascular y resistencia', 'Combinar HIIT con cardio moderado', '2024-02-25', '2024-05-25'),

-- Para Isabel Moreno (cliente 11) - objetivo general, nueva
('Introducción al Fitness - Isabel', 1, 11, 'mixto', 'principiante', 35, 'Plan de iniciación completo', 'Cliente nueva, evaluación cada 2 semanas', '2024-03-20', '2024-06-20');