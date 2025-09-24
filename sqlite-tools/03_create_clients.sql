-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    date_of_birth DATE,
    gender VARCHAR(10), -- 'masculino', 'femenino', 'otro'
    height DECIMAL(5,2), -- en cm
    weight DECIMAL(5,2), -- en kg
    fitness_goal TEXT, -- 'perdida_peso', 'ganancia_muscular', 'resistencia', 'fuerza', 'general'
    activity_level VARCHAR(20), -- 'sedentario', 'ligero', 'moderado', 'activo', 'muy_activo'
    medical_conditions TEXT, -- condiciones médicas o limitaciones
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    join_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'activo', -- 'activo', 'inactivo', 'suspendido'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insertar datos de clientes basados en usuarios existentes
INSERT INTO clients (user_id, date_of_birth, gender, height, weight, fitness_goal, activity_level, medical_conditions, emergency_contact_name, emergency_contact_phone, join_date, status) VALUES
(8, '1990-05-15', 'masculino', 178.5, 75.2, 'ganancia_muscular', 'moderado', 'Ninguna', 'María Celorrio', '+34-123-456-789', '2024-01-15', 'activo'),
(22, '1985-08-22', 'masculino', 182.0, 80.5, 'fuerza', 'activo', 'Lesión previa en rodilla izquierda', 'Ana García', '+34-234-567-890', '2024-02-01', 'activo'),
(23, '1992-03-10', 'femenino', 165.0, 58.3, 'perdida_peso', 'ligero', 'Ninguna', 'Luis López', '+34-345-678-901', '2024-01-20', 'activo'),
(24, '1988-11-05', 'masculino', 175.5, 78.0, 'resistencia', 'moderado', 'Asma controlado', 'Carmen Martínez', '+34-456-789-012', '2024-02-15', 'activo'),
(25, '1995-07-18', 'femenino', 170.0, 62.8, 'general', 'moderado', 'Ninguna', 'Pedro Rodríguez', '+34-567-890-123', '2024-03-01', 'activo'),
(26, '1991-12-30', 'masculino', 180.0, 85.0, 'perdida_peso', 'ligero', 'Hipertensión controlada', 'Laura Sánchez', '+34-678-901-234', '2024-02-10', 'activo'),
(27, '1994-04-08', 'femenino', 162.5, 55.5, 'ganancia_muscular', 'moderado', 'Ninguna', 'Miguel Fernández', '+34-789-012-345', '2024-03-15', 'activo'),
(28, '1987-09-14', 'masculino', 177.0, 73.5, 'fuerza', 'activo', 'Dolor lumbar crónico', 'Carmen González', '+34-890-123-456', '2024-01-30', 'activo'),
(29, '1993-06-25', 'femenino', 168.0, 60.2, 'resistencia', 'activo', 'Ninguna', 'Antonio Ruiz', '+34-901-234-567', '2024-02-20', 'activo'),
(30, '1989-10-12', 'masculino', 183.5, 88.5, 'perdida_peso', 'sedentario', 'Diabetes tipo 2', 'Isabel Jiménez', '+34-012-345-678', '2024-03-05', 'activo'),
(31, '1996-01-03', 'femenino', 160.0, 52.0, 'general', 'ligero', 'Ninguna', 'Carlos Moreno', '+34-123-456-789', '2024-03-20', 'activo');