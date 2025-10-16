-- Tabla de sesiones de entrenamiento completadas
CREATE TABLE IF NOT EXISTS workout_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    workout_id INTEGER NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    duration_minutes INTEGER, -- duración real de la sesión
    trainer_id INTEGER, -- puede ser NULL para entrenamientos auto-dirigidos
    status VARCHAR(20) DEFAULT 'completado', -- 'completado', 'parcial', 'cancelado'
    client_notes TEXT, -- notas del cliente
    trainer_notes TEXT, -- observaciones del entrenador
    overall_rating INTEGER CHECK(overall_rating >= 1 AND overall_rating <= 5), -- satisfacción 1-5
    calories_burned INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
    FOREIGN KEY (trainer_id) REFERENCES trainers(id) ON DELETE SET NULL
);

-- Insertar sesiones de entrenamiento históricas
INSERT INTO workout_sessions (client_id, workout_id, session_date, start_time, end_time, duration_minutes, trainer_id, status, client_notes, trainer_notes, overall_rating, calories_burned) VALUES
-- Sesiones de David Celorrio (cliente 1)
(1, 1, '2024-01-22', '09:00', '10:00', 60, 1, 'completado', 'Me sentí bien, pude aumentar peso en press de banca', 'Excelente progresión, técnica mejorada', 5, 420),
(1, 1, '2024-01-24', '09:00', '09:55', 55, 1, 'completado', 'Día de piernas intenso', 'Profundidad perfecta en sentadillas', 4, 380),
(1, 1, '2024-01-26', '09:00', '10:05', 65, 1, 'completado', 'Dominadas más fáciles hoy', 'Fuerza de tracción mejorando', 5, 440),

-- Sesiones de María López (cliente 3)
(3, 2, '2024-02-03', '18:00', '18:45', 45, 1, 'completado', 'Primera sesión, fue desafiante pero bien', 'Buena actitud, necesita trabajar en técnica', 4, 285),
(3, 2, '2024-02-05', '18:00', '18:40', 40, 1, 'parcial', 'Me cansé mucho en el cardio final', 'Normal para principiante, reducir intensidad cardio', 3, 240),
(3, 2, '2024-02-08', '18:00', '18:45', 45, 1, 'completado', 'Mejor que la vez pasada!', 'Técnica mejorando, ya puede hacer plancha completa', 4, 290),

-- Sesiones de Ana Rodríguez (cliente 5) 
(5, 3, '2024-03-03', '10:30', '11:20', 50, 1, 'completado', 'Me encantan los kettlebell swings', 'Cliente experimientada, puede aumentar peso', 5, 350),
(5, 3, '2024-03-06', '10:30', '11:15', 45, 1, 'completado', 'Box jumps un poco duros hoy', 'Altura del cajón perfecta, mantener', 4, 320),

-- Sesiones de Laura Fernández (cliente 7)
(7, 4, '2024-03-17', '16:00', '16:55', 55, 1, 'completado', 'Rutina perfecta para mis objetivos', 'Excelente activación de glúteos', 5, 385),
(7, 4, '2024-03-19', '16:00', '16:50', 50, 1, 'completado', 'Peso muerto se siente más natural', 'Técnica excelente, listo para aumentar peso', 5, 370),

-- Sesiones de Carmen Ruiz (cliente 9)
(9, 5, '2024-02-27', '07:30', '08:10', 40, 1, 'completado', 'El cardio me está gustando más', 'Resistencia cardiovascular mejorando notablemente', 4, 310),
(9, 5, '2024-03-01', '07:30', '08:05', 35, 1, 'completado', 'HIIT intenso pero lo completé!', 'Excelente progreso en burpees', 5, 280),

-- Sesiones de Isabel Moreno (cliente 11)
(11, 6, '2024-03-22', '19:00', '19:35', 35, 1, 'completado', 'Primera vez en un gimnasio, nerviosa pero bien', 'Muy buena para principiante, enfoque en confianza', 4, 180),
(11, 6, '2024-03-24', '19:00', '19:30', 30, 1, 'completado', 'Menos nerviosa hoy, me gustó', 'Ya se siente más cómoda, aumentar gradualmente', 4, 170);