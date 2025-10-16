-- =====================================================
-- INSERTAR DATOS INICIALES DE EJERCICIOS
-- =====================================================
-- Insertar los ejercicios que actualmente están hardcodeados
INSERT OR IGNORE INTO ejercicios (nombre, categoria, descripcion, estado) VALUES
    ('Press de banca', 'Fuerza', 'Ejercicio de empuje para pecho, hombros y tríceps', 'activo'),
    ('Sentadillas', 'Fuerza', 'Ejercicio fundamental para piernas y glúteos', 'activo'),
    ('Peso muerto', 'Fuerza', 'Ejercicio completo para cadena posterior', 'activo'),
    ('Press militar', 'Fuerza', 'Ejercicio de empuje vertical para hombros', 'activo'),
    ('Remo con barra', 'Fuerza', 'Ejercicio de tracción para espalda', 'activo'),
    ('Dominadas', 'Fuerza', 'Ejercicio de tracción vertical', 'activo'),
    ('Fondos', 'Fuerza', 'Ejercicio de empuje para tríceps y pecho', 'activo'),
    ('Curl de bíceps', 'Fuerza', 'Ejercicio de aislamiento para bíceps', 'activo'),
    ('Extensiones de tríceps', 'Fuerza', 'Ejercicio de aislamiento para tríceps', 'activo'),
    ('Elevaciones laterales', 'Fuerza', 'Ejercicio de aislamiento para deltoides', 'activo'),
    ('Prensa de piernas', 'Fuerza', 'Ejercicio de empuje para cuádriceps', 'activo'),
    ('Curl femoral', 'Fuerza', 'Ejercicio de aislamiento para isquiotibiales', 'activo'),
    ('Extensiones de cuádriceps', 'Fuerza', 'Ejercicio de aislamiento para cuádriceps', 'activo'),
    ('Caminadora', 'Cardio', 'Ejercicio cardiovascular de bajo impacto', 'activo'),
    ('Bicicleta estática', 'Cardio', 'Ejercicio cardiovascular para piernas', 'activo'),
    ('Elíptica', 'Cardio', 'Ejercicio cardiovascular de cuerpo completo', 'activo');



