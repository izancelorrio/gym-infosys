-- Tabla de membresías activas de usuarios vinculadas a planes
CREATE TABLE IF NOT EXISTS user_memberships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    plan_id INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'activa', -- 'activa', 'pausada', 'vencida', 'cancelada'
    payment_status VARCHAR(20) DEFAULT 'pagado', -- 'pagado', 'pendiente', 'vencido'
    auto_renewal BOOLEAN DEFAULT 1, -- renovación automática
    discount_percentage DECIMAL(4,2) DEFAULT 0.00, -- descuento aplicado
    final_price DECIMAL(8,2), -- precio final después de descuentos
    payment_method VARCHAR(30), -- 'efectivo', 'tarjeta', 'transferencia', 'domiciliacion'
    notes TEXT, -- notas sobre la membresía
    created_by INTEGER, -- quien creó/vendió la membresía
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES planes(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Insertar membresías activas para los clientes existentes
-- Primero necesitamos verificar qué planes están disponibles en la tabla 'planes'
-- Asumiendo que tenemos planes con id 1,2,3,4 (básico, premium, VIP, etc.)

INSERT INTO user_memberships (client_id, plan_id, start_date, end_date, status, payment_status, auto_renewal, discount_percentage, final_price, payment_method, notes, created_by) VALUES

-- David Celorrio (cliente 1) - Plan Premium por ser cliente activo con entrenador
(1, 2, '2024-01-15', '2024-07-15', 'activa', 'pagado', 1, 10.00, 54.00, 'domiciliacion', 'Descuento por fidelidad - 6 meses', 11),

-- Carlos García (cliente 2) - Plan VIP por ser cliente experimentado  
(2, 3, '2024-02-01', '2024-08-01', 'activa', 'pagado', 1, 0.00, 89.00, 'tarjeta', 'Cliente VIP, acceso completo', 11),

-- María López (cliente 3) - Plan Básico como principiante
(3, 1, '2024-02-01', '2024-05-01', 'activa', 'pagado', 1, 15.00, 25.50, 'transferencia', 'Descuento estudiante - 3 meses', 11),

-- Juan Martínez (cliente 4) - Plan Premium con adaptaciones médicas
(4, 2, '2024-02-15', '2024-08-15', 'activa', 'pagado', 1, 0.00, 60.00, 'domiciliacion', 'Plan adaptado por lesión rodilla', 11),

-- Ana Rodríguez (cliente 5) - Plan Premium 
(5, 2, '2024-03-01', '2024-09-01', 'activa', 'pagado', 1, 5.00, 57.00, 'tarjeta', 'Descuento por recomendación', 11),

-- Pedro Sánchez (cliente 6) - Plan Premium por condición médica especial
(6, 2, '2024-02-10', '2024-08-10', 'activa', 'pagado', 1, 0.00, 60.00, 'domiciliacion', 'Seguimiento médico hipertensión', 11),

-- Laura Fernández (cliente 7) - Plan Premium
(7, 2, '2024-03-15', '2024-09-15', 'activa', 'pagado', 1, 0.00, 60.00, 'tarjeta', 'Plan standard premium', 11),

-- Miguel González (cliente 8) - Plan Básico por limitación dolor lumbar
(8, 1, '2024-01-30', '2024-07-30', 'activa', 'pagado', 1, 20.00, 24.00, 'efectivo', 'Plan adaptado por problema lumbar', 11),

-- Carmen Ruiz (cliente 9) - Plan Premium enfocado en cardio
(9, 2, '2024-02-20', '2024-08-20', 'activa', 'pagado', 1, 0.00, 60.00, 'domiciliacion', 'Especialización cardiovascular', 11),

-- Antonio Jiménez (cliente 10) - Plan Básico con seguimiento médico
(10, 1, '2024-03-05', '2024-09-05', 'activa', 'pagado', 1, 10.00, 27.00, 'transferencia', 'Plan diabetes tipo 2 - seguimiento', 11),

-- Isabel Moreno (cliente 11) - Plan Básico principiante
(11, 1, '2024-03-20', '2024-06-20', 'activa', 'pagado', 1, 25.00, 22.50, 'efectivo', 'Promoción primera vez - 3 meses', 11);

-- Algunos registros históricos de membresías vencidas/renovadas
INSERT INTO user_memberships (client_id, plan_id, start_date, end_date, status, payment_status, auto_renewal, discount_percentage, final_price, payment_method, notes, created_by) VALUES

-- David renovó desde un plan básico anterior
(1, 1, '2023-07-15', '2024-01-15', 'vencida', 'pagado', 1, 0.00, 30.00, 'domiciliacion', 'Primera membresía - renovado a Premium', 11),

-- Carlos tuvo un plan Premium antes del VIP
(2, 2, '2023-08-01', '2024-02-01', 'vencida', 'pagado', 1, 0.00, 60.00, 'tarjeta', 'Actualizado a plan VIP', 11),

-- Membresía pausada temporal de Pedro por viaje
INSERT INTO user_memberships (client_id, plan_id, start_date, end_date, status, payment_status, auto_renewal, discount_percentage, final_price, payment_method, notes, created_by) VALUES
(6, 2, '2023-11-10', '2024-02-10', 'pausada', 'pagado', 1, 0.00, 60.00, 'domiciliacion', 'Pausada 1 mes por viaje trabajo - dic 2023', 11);