-- Tabla de ejercicios
CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'fuerza', 'cardio', 'flexibilidad', 'funcional'
    muscle_groups TEXT, -- JSON array o string separado por comas
    equipment VARCHAR(100), -- equipamiento necesario
    difficulty_level VARCHAR(20), -- 'principiante', 'intermedio', 'avanzado'
    description TEXT,
    instructions TEXT,
    video_url VARCHAR(255),
    calories_per_minute DECIMAL(4,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insertar catálogo de ejercicios variado
INSERT INTO exercises (name, category, muscle_groups, equipment, difficulty_level, description, instructions, calories_per_minute) VALUES
-- Ejercicios de fuerza
('Press de banca', 'fuerza', 'pecho,triceps,hombros', 'barra,banco', 'intermedio', 'Ejercicio fundamental para desarrollo del pecho', 'Acostado en el banco, baja la barra hasta el pecho y empuja hacia arriba', 8.5),
('Sentadillas', 'fuerza', 'cuadriceps,gluteos,core', 'barra', 'principiante', 'Ejercicio básico para piernas y glúteos', 'De pie con la barra en la espalda, baja como si te sentaras y sube', 7.2),
('Peso muerto', 'fuerza', 'espalda,gluteos,isquiotibiales', 'barra', 'intermedio', 'Ejercicio completo para cadena posterior', 'Con la barra en el suelo, levanta con la espalda recta', 9.1),
('Dominadas', 'fuerza', 'espalda,biceps', 'barra de dominadas', 'intermedio', 'Ejercicio de tracción vertical', 'Colgado de la barra, sube hasta que el mentón pase la barra', 8.8),
('Press militar', 'fuerza', 'hombros,triceps,core', 'barra', 'intermedio', 'Desarrollo de hombros de pie', 'De pie, empuja la barra desde los hombros hacia arriba', 7.5),

-- Ejercicios de cardio
('Burpees', 'cardio', 'cuerpo_completo', 'ninguno', 'intermedio', 'Ejercicio cardiovascular intenso', 'Flexión, salto hacia atrás, salto hacia adelante, salto vertical', 12.5),
('Mountain climbers', 'cardio', 'core,piernas', 'ninguno', 'principiante', 'Cardio y core en posición de plancha', 'En posición de plancha, alterna las rodillas al pecho rápidamente', 10.2),
('Jumping jacks', 'cardio', 'cuerpo_completo', 'ninguno', 'principiante', 'Ejercicio cardiovascular básico', 'Salta abriendo piernas y brazos simultáneamente', 8.0),
('Cinta de correr', 'cardio', 'piernas,cardiovascular', 'cinta', 'principiante', 'Carrera en cinta', 'Mantén un ritmo constante según tu nivel', 10.5),
('Bicicleta estática', 'cardio', 'piernas,cardiovascular', 'bicicleta', 'principiante', 'Ciclismo indoor', 'Pedalea manteniendo una cadencia constante', 8.8),

-- Ejercicios funcionales
('Kettlebell swings', 'funcional', 'gluteos,core,hombros', 'kettlebell', 'intermedio', 'Ejercicio balístico con kettlebell', 'Balancea la kettlebell desde las caderas hasta la altura del pecho', 11.0),
('Box jumps', 'funcional', 'piernas,core', 'cajón', 'intermedio', 'Saltos a cajón', 'Salta sobre el cajón y baja controladamente', 9.5),
('Bear crawl', 'funcional', 'cuerpo_completo', 'ninguno', 'intermedio', 'Desplazamiento en cuadrupedia', 'Camina en cuatro puntos manteniendo las rodillas cerca del suelo', 8.2),
('Plancha', 'funcional', 'core', 'ninguno', 'principiante', 'Isométrico para el core', 'Mantén el cuerpo recto apoyado en antebrazos y pies', 4.5),
('Turkish get-up', 'funcional', 'cuerpo_completo', 'kettlebell', 'avanzado', 'Ejercicio complejo de levantamiento', 'Desde acostado, levántate hasta de pie con la kettlebell arriba', 7.8),

-- Ejercicios de flexibilidad
('Estiramiento de isquiotibiales', 'flexibilidad', 'isquiotibiales', 'ninguno', 'principiante', 'Estiramiento para parte posterior del muslo', 'Sentado, inclínate hacia adelante tocando los pies', 2.0),
('Yoga warrior pose', 'flexibilidad', 'piernas,core', 'esterilla', 'principiante', 'Postura de guerrero del yoga', 'En estocada, extiende los brazos hacia arriba', 3.5),
('Cat-cow stretch', 'flexibilidad', 'espalda,core', 'esterilla', 'principiante', 'Estiramiento de columna', 'En cuadrupedia, alterna entre arquear y redondear la espalda', 2.8);