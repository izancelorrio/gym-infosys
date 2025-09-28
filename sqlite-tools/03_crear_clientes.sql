-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL UNIQUE,
    dni VARCHAR(20) UNIQUE NOT NULL,
    numero_telefono VARCHAR(20),
    plan_id INTEGER,
    fecha_nacimiento DATE,
    genero VARCHAR(10), -- 'masculino', 'femenino', 'otro'
    num_tarjeta VARCHAR(19), -- formato xxxx-xxxx-xxxx-xxxx
    fecha_tarjeta VARCHAR(7), -- formato MM/YYYY
    cvv VARCHAR(4), -- 3 o 4 dígitos
    fecha_inscripcion DATE DEFAULT CURRENT_DATE,
    estado VARCHAR(20) DEFAULT 'activo', -- 'activo', 'inactivo', 'suspendido'
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES planes(id)
);

-- Insertar datos de clientes basados en usuarios existentes
INSERT INTO clientes (id_usuario, dni, numero_telefono, plan_id, fecha_nacimiento, genero, num_tarjeta, fecha_tarjeta, cvv, fecha_inscripcion, estado) VALUES
(8, '12345678A', '+34-600-111-001', 1, '1990-05-15', 'masculino', '4532-1234-5678-9012', '12/2027', '123', '2024-01-15', 'activo'),
(22, '23456789B', '+34-600-111-002', 2, '1985-08-22', 'masculino', '5555-4444-3333-2222', '08/2026', '456', '2024-02-01', 'activo'),
(23, '34567890C', '+34-600-111-003', 1, '1992-03-10', 'femenino', '4111-1111-1111-1111', '03/2028', '789', '2024-01-20', 'activo'),
(24, '45678901D', '+34-600-111-004', 3, '1988-11-05', 'masculino', '3782-8224-6310-005', '11/2025', '012', '2024-02-15', 'activo'),
(25, '56789012E', '+34-600-111-005', 1, '1995-07-18', 'femenino', '6011-1111-1111-1117', '06/2027', '345', '2024-03-01', 'activo'),
(26, '67890123F', '+34-600-111-006', 2, '1991-12-30', 'masculino', '5105-1051-0510-5100', '09/2026', '678', '2024-02-10', 'activo'),
(27, '78901234G', '+34-600-111-007', 1, '1994-04-08', 'femenino', '4000-0000-0000-0002', '04/2028', '901', '2024-03-15', 'activo'),
(28, '89012345H', '+34-600-111-008', 3, '1987-09-14', 'masculino', '3714-4963-5398-431', '01/2027', '234', '2024-01-30', 'activo'),
(29, '90123456I', '+34-600-111-009', 2, '1993-06-25', 'femenino', '6759-6498-2643-8453', '07/2025', '567', '2024-02-20', 'activo'),
(30, '01234567J', '+34-600-111-010', 1, '1989-10-12', 'masculino', '4242-4242-4242-4242', '10/2026', '890', '2024-03-05', 'activo'),
(31, '11234567K', '+34-600-111-011', 2, '1996-01-03', 'femenino', '5200-8282-8282-8210', '05/2027', '123', '2024-03-20', 'activo');