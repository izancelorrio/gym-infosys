-- Tabla de estadísticas y progreso de clientes
CREATE TABLE IF NOT EXISTS client_statistics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    measurement_date DATE NOT NULL,
    weight_kg DECIMAL(5,2),
    body_fat_percentage DECIMAL(4,2),
    muscle_mass_kg DECIMAL(5,2),
    bmi DECIMAL(4,2),
    chest_cm DECIMAL(5,2), -- contorno pecho
    waist_cm DECIMAL(5,2), -- contorno cintura
    hip_cm DECIMAL(5,2), -- contorno cadera
    arm_cm DECIMAL(4,2), -- contorno brazo
    thigh_cm DECIMAL(4,2), -- contorno muslo
    resting_heart_rate INTEGER,
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    notes TEXT, -- observaciones generales
    measured_by INTEGER, -- trainer que tomó las medidas
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (measured_by) REFERENCES trainers(id) ON DELETE SET NULL
);

-- Insertar mediciones iniciales y de progreso para los clientes
INSERT INTO client_statistics (client_id, measurement_date, weight_kg, body_fat_percentage, muscle_mass_kg, bmi, chest_cm, waist_cm, hip_cm, arm_cm, thigh_cm, resting_heart_rate, blood_pressure_systolic, blood_pressure_diastolic, notes, measured_by) VALUES

-- David Celorrio (cliente 1) - Medición inicial
(1, '2024-01-15', 75.2, 18.5, 58.3, 23.6, 98.5, 82.0, 95.0, 32.5, 58.0, 65, 120, 80, 'Medición inicial - buen estado físico base', 1),
-- Progreso después de 2 meses
(1, '2024-03-15', 77.8, 16.2, 62.1, 24.4, 101.0, 80.5, 96.0, 34.0, 60.5, 62, 118, 78, 'Excelente progreso en ganancia muscular', 1),

-- María López (cliente 3) - Medición inicial (objetivo pérdida peso)
(3, '2024-02-01', 58.3, 28.5, 39.2, 21.4, 86.0, 78.5, 98.0, 26.5, 52.0, 78, 135, 85, 'Medición inicial - enfoque en pérdida de grasa', 1),
-- Progreso después de 6 semanas
(3, '2024-03-15', 55.8, 24.8, 40.1, 20.5, 84.5, 74.0, 94.5, 26.0, 50.5, 72, 125, 80, 'Buena pérdida de grasa, manteniendo músculo', 1),

-- Ana Rodríguez (cliente 5) - Medición inicial
(5, '2024-03-01', 62.8, 22.0, 46.2, 21.7, 88.0, 68.5, 92.0, 28.0, 54.0, 68, 125, 82, 'Cliente activa, buena condición física base', 1),

-- Laura Fernández (cliente 7) - Medición inicial (ganancia muscular femenina)
(7, '2024-03-15', 55.5, 24.0, 40.8, 21.0, 85.0, 65.0, 95.0, 25.5, 53.5, 70, 115, 75, 'Objetivo: tonificación y ganancia muscular', 1),

-- Carmen Ruiz (cliente 9) - Medición inicial (resistencia)
(9, '2024-02-25', 60.2, 26.5, 42.1, 21.3, 87.5, 72.0, 96.5, 26.8, 52.8, 75, 130, 85, 'Enfoque en mejora cardiovascular', 1),
-- Progreso después de 3 semanas
(9, '2024-03-18', 59.1, 25.2, 42.8, 20.9, 87.0, 70.5, 95.0, 27.0, 53.0, 68, 122, 78, 'Mejora significativa en capacidad cardiovascular', 1),

-- Isabel Moreno (cliente 11) - Medición inicial (principiante)
(11, '2024-03-20', 52.0, 30.0, 34.8, 20.3, 82.0, 68.0, 88.0, 24.0, 48.5, 82, 140, 90, 'Primera medición - principiante completa', 1),

-- Mediciones adicionales de otros clientes para tener más datos
-- Carlos García (cliente 2)
(2, '2024-02-15', 80.5, 16.8, 64.2, 24.2, 105.0, 85.0, 98.0, 35.5, 62.0, 60, 115, 75, 'Cliente experimientado, objetivo fuerza', 1),

-- Juan Martínez (cliente 4) 
(4, '2024-02-20', 78.0, 20.5, 59.1, 25.5, 102.0, 88.0, 100.0, 33.0, 59.5, 65, 125, 80, 'Buen estado físico, lesión rodilla controlada', 1),

-- Pedro Sánchez (cliente 6)
(6, '2024-02-15', 85.0, 25.8, 60.2, 26.2, 108.0, 95.0, 105.0, 34.5, 61.0, 72, 135, 88, 'Objetivo pérdida de peso, hipertensión controlada', 1),

-- Miguel González (cliente 8) 
(8, '2024-02-10', 73.5, 19.2, 56.8, 23.4, 96.0, 80.0, 93.0, 31.5, 57.0, 70, 128, 82, 'Dolor lumbar, rutinas adaptadas', 1),

-- Antonio Jiménez (cliente 10)
(10, '2024-03-10', 88.5, 32.0, 57.8, 26.3, 112.0, 102.0, 108.0, 36.0, 64.0, 78, 145, 92, 'Diabetes tipo 2, seguimiento médico', 1);