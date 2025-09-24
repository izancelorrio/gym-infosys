-- Tabla de ejercicios específicos dentro de cada workout
CREATE TABLE IF NOT EXISTS workout_exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_id INTEGER NOT NULL,
    exercise_id INTEGER NOT NULL,
    day_of_week INTEGER, -- 1=Lunes, 2=Martes, etc. (para rutinas semanales)
    exercise_order INTEGER, -- orden dentro del día/rutina
    sets INTEGER DEFAULT 1,
    reps VARCHAR(20), -- puede ser número o rango "8-12" o "30 seg"
    weight_kg DECIMAL(5,2), -- peso sugerido
    rest_seconds INTEGER DEFAULT 60, -- descanso entre series
    notes TEXT, -- notas específicas del ejercicio
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);

-- Insertar ejercicios para la rutina Push-Pull-Legs de David (workout_id = 1)
INSERT INTO workout_exercises (workout_id, exercise_id, day_of_week, exercise_order, sets, reps, weight_kg, rest_seconds, notes) VALUES
-- DÍA 1 - PUSH (Pecho, hombros, tríceps)
(1, 1, 1, 1, 4, '8-10', 60.0, 90, 'Ejercicio principal, técnica perfecta'),
(1, 5, 1, 2, 3, '10-12', 40.0, 60, 'Press militar, core activado'),
(1, 1, 1, 3, 3, '12-15', 45.0, 60, 'Press inclinado con mancuernas'),

-- DÍA 2 - PULL (Espalda, bíceps)  
(1, 4, 2, 1, 4, '6-8', 0.0, 90, 'Dominadas, usar asistencia si es necesario'),
(1, 3, 2, 2, 4, '8-10', 70.0, 90, 'Peso muerto, técnica crucial'),

-- DÍA 3 - LEGS (Piernas)
(1, 2, 3, 1, 4, '10-12', 80.0, 90, 'Sentadillas, profundidad completa'),
(1, 3, 3, 2, 3, '8-10', 80.0, 90, 'Peso muerto rumano');

-- Ejercicios para el Circuito Principiante de María (workout_id = 2)
INSERT INTO workout_exercises (workout_id, exercise_id, day_of_week, exercise_order, sets, reps, weight_kg, rest_seconds, notes) VALUES
-- Circuito de cuerpo completo
(2, 8, 1, 1, 3, '10', 0.0, 45, 'Jumping jacks para calentamiento'),
(2, 2, 1, 2, 3, '15', 20.0, 60, 'Sentadillas con peso corporal o mancuerna ligera'),
(2, 14, 1, 3, 3, '30 seg', 0.0, 30, 'Plancha, mantener forma correcta'),
(2, 7, 1, 4, 3, '30 seg', 0.0, 45, 'Mountain climbers, ritmo controlado'),
(2, 9, 1, 5, 3, '15 min', 0.0, 0, 'Cinta caminando, inclinación media');

-- Ejercicios para Entrenamiento Funcional de Ana (workout_id = 3)
INSERT INTO workout_exercises (workout_id, exercise_id, day_of_week, exercise_order, sets, reps, weight_kg, rest_seconds, notes) VALUES
(3, 11, 1, 1, 4, '15', 16.0, 60, 'Kettlebell swings, técnica de cadera'),
(3, 12, 1, 2, 4, '10', 0.0, 60, 'Box jumps, aterrizaje suave'),
(3, 6, 1, 3, 3, '10', 0.0, 90, 'Burpees, mantener ritmo constante'),
(3, 13, 1, 4, 3, '20 pasos', 0.0, 45, 'Bear crawl, core activado');

-- Ejercicios para Fuerza Femenina de Laura (workout_id = 4)
INSERT INTO workout_exercises (workout_id, exercise_id, day_of_week, exercise_order, sets, reps, weight_kg, rest_seconds, notes) VALUES
-- Enfoque en glúteos y tren superior
(4, 2, 1, 1, 4, '12-15', 40.0, 75, 'Sentadillas sumo, activación glúteos'),
(4, 3, 1, 2, 4, '10-12', 45.0, 90, 'Peso muerto rumano, squeeze glúteos'),
(4, 1, 1, 3, 3, '12-15', 30.0, 60, 'Press con mancuernas, rango completo'),
(4, 4, 1, 4, 3, '8-10', 0.0, 90, 'Dominadas asistidas o lat pulldown');

-- Ejercicios para Cardio & Resistencia de Carmen (workout_id = 5)
INSERT INTO workout_exercises (workout_id, exercise_id, day_of_week, exercise_order, sets, reps, weight_kg, rest_seconds, notes) VALUES
(5, 9, 1, 1, 1, '20 min', 0.0, 0, 'Cinta de correr, ritmo moderado'),
(5, 6, 1, 2, 5, '8', 0.0, 30, 'Burpees HIIT, máxima intensidad'),
(5, 10, 1, 3, 1, '15 min', 0.0, 0, 'Bicicleta estática, intervalos'),
(5, 7, 1, 4, 4, '45 seg', 0.0, 15, 'Mountain climbers, alta intensidad');

-- Ejercicios para Introducción al Fitness de Isabel (workout_id = 6)
INSERT INTO workout_exercises (workout_id, exercise_id, day_of_week, exercise_order, sets, reps, weight_kg, rest_seconds, notes) VALUES
(6, 8, 1, 1, 2, '15', 0.0, 30, 'Calentamiento con jumping jacks'),
(6, 2, 1, 2, 2, '10', 0.0, 60, 'Sentadillas peso corporal, técnica perfecta'),
(6, 14, 1, 3, 2, '20 seg', 0.0, 45, 'Plancha modificada si es necesario'),
(6, 16, 1, 4, 1, '30 seg', 0.0, 0, 'Estiramiento isquiotibiales'),
(6, 18, 1, 5, 2, '5 rep', 0.0, 30, 'Cat-cow para relajación');