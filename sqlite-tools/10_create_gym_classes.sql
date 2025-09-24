-- Tabla de clases grupales del gimnasio
CREATE TABLE IF NOT EXISTS gym_classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    class_type VARCHAR(50), -- 'yoga', 'spinning', 'crossfit', 'pilates', 'zumba', 'boxing', etc.
    instructor_id INTEGER, -- puede ser NULL si es externa o rotativa
    duration_minutes INTEGER NOT NULL,
    max_capacity INTEGER DEFAULT 20,
    difficulty_level VARCHAR(20), -- 'principiante', 'intermedio', 'avanzado', 'todos'
    required_equipment TEXT, -- equipamiento necesario
    day_of_week INTEGER, -- 1=Lunes, 2=Martes, ..., 7=Domingo
    start_time TIME,
    room VARCHAR(50), -- sala donde se imparte
    price DECIMAL(8,2) DEFAULT 0.00, -- precio por clase (0 si incluida in membresía)
    status VARCHAR(20) DEFAULT 'activo', -- 'activo', 'pausado', 'cancelado'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES trainers(id) ON DELETE SET NULL
);

-- Insertar clases grupales variadas
INSERT INTO gym_classes (name, description, class_type, instructor_id, duration_minutes, max_capacity, difficulty_level, required_equipment, day_of_week, start_time, room, price, status) VALUES

-- Clases de Lunes
('Yoga Matutino', 'Sesión de yoga suave para comenzar la semana con energía', 'yoga', NULL, 60, 15, 'todos', 'esterilla', 1, '07:30', 'Sala Zen', 0.00, 'activo'),
('CrossFit Intenso', 'Entrenamiento funcional de alta intensidad con Izan', 'crossfit', 1, 45, 12, 'intermedio', 'kettlebells,barras,cajones', 1, '18:00', 'Sala CrossFit', 12.00, 'activo'),
('Spinning Nocturno', 'Clase de ciclismo indoor con música energética', 'spinning', NULL, 45, 20, 'todos', 'bicicletas spinning', 1, '20:00', 'Sala Cardio', 8.00, 'activo'),

-- Clases de Martes  
('Pilates Principiantes', 'Introducción al método Pilates, fortalecimiento del core', 'pilates', NULL, 50, 12, 'principiante', 'esterillas,pelotas pilates', 2, '09:00', 'Sala Zen', 10.00, 'activo'),
('Boxing Fitness', 'Entrenamiento de boxeo sin contacto, cardio y técnica', 'boxing', NULL, 45, 16, 'intermedio', 'guantes,sacos', 2, '19:00', 'Sala Boxing', 15.00, 'activo'),

-- Clases de Miércoles
('Yoga Flow', 'Yoga dinámico con transiciones fluidas', 'yoga', NULL, 60, 15, 'intermedio', 'esterillas,bloques', 3, '18:30', 'Sala Zen', 0.00, 'activo'),
('Aqua Fitness', 'Ejercicios cardiovasculares y de fuerza en el agua', 'aqua', NULL, 45, 10, 'todos', 'ninguno', 3, '10:00', 'Piscina', 12.00, 'activo'),

-- Clases de Jueves
('Zumba Party', 'Baile fitness con ritmos latinos y internacionales', 'zumba', NULL, 50, 25, 'todos', 'ninguno', 4, '19:30', 'Sala Multiusos', 8.00, 'activo'),
('Entrenamiento Funcional', 'Movimientos funcionales guiados por Izan', 'funcional', 1, 45, 15, 'intermedio', 'TRX,kettlebells,medicine balls', 4, '18:00', 'Sala CrossFit', 10.00, 'activo'),

-- Clases de Viernes
('HIIT Express', 'Entrenamiento intervalado de alta intensidad', 'hiit', NULL, 30, 18, 'avanzado', 'variado', 5, '12:00', 'Sala Multiusos', 8.00, 'activo'),
('Yoga Relajante', 'Sesión de yoga restaurativo para terminar la semana', 'yoga', NULL, 60, 12, 'todos', 'esterillas,mantas', 5, '20:00', 'Sala Zen', 0.00, 'activo'),

-- Clases de Sábado
('Spinning Power', 'Clase intensa de ciclismo con intervalos', 'spinning', NULL, 50, 20, 'avanzado', 'bicicletas spinning', 6, '09:00', 'Sala Cardio', 10.00, 'activo'),
('Pilates Intermedio', 'Pilates con mayor desafío y equipamiento', 'pilates', NULL, 55, 10, 'intermedio', 'reformer,esterillas', 6, '10:30', 'Sala Zen', 15.00, 'activo'),
('CrossFit Open', 'Sesión abierta de CrossFit para todos los niveles', 'crossfit', 1, 60, 15, 'todos', 'equipamiento completo', 6, '11:00', 'Sala CrossFit', 10.00, 'activo'),

-- Clases de Domingo
('Yoga Familiar', 'Yoga para practicar en familia', 'yoga', NULL, 45, 20, 'todos', 'esterillas', 7, '10:00', 'Sala Zen', 5.00, 'activo'),
('Aqua Relax', 'Ejercicios suaves en el agua, ideal para recuperación', 'aqua', NULL, 40, 8, 'todos', 'churros,tabla', 7, '11:00', 'Piscina', 10.00, 'activo');