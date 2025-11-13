-- Tabla de entrenadores
CREATE TABLE IF NOT EXISTS trainers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    specialties TEXT NOT NULL, -- JSON array o string separado por comas
    certification TEXT,
    experience_years INTEGER DEFAULT 0,
    hourly_rate DECIMAL(10,2),
    bio TEXT,
    available_hours TEXT, -- JSON con horarios disponibles
    max_clients INTEGER DEFAULT 20,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insertar datos de entrenadores basados en usuarios existentes
INSERT INTO trainers (user_id, specialties, certification, experience_years, hourly_rate, bio, available_hours, max_clients) VALUES
(9, 'Entrenamiento funcional,CrossFit,Pérdida de peso', 'Certificado NSCA-CPT, CrossFit Level 2', 5, 45.00, 'Especialista en entrenamiento funcional y CrossFit con más de 5 años de experiencia ayudando a clientes a alcanzar sus objetivos fitness.', '{"lunes": ["09:00-13:00", "16:00-20:00"], "martes": ["09:00-13:00", "16:00-20:00"], "miercoles": ["09:00-13:00"], "jueves": ["09:00-13:00", "16:00-20:00"], "viernes": ["09:00-13:00", "16:00-20:00"]}', 25);