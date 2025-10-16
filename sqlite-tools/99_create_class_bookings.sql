-- Tabla de reservas para clases grupales
CREATE TABLE IF NOT EXISTS class_bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    class_id INTEGER NOT NULL,
    booking_date DATE NOT NULL, -- fecha de la clase específica
    booking_time TIME, -- hora de la clase (por si cambia)
    reservation_status VARCHAR(20) DEFAULT 'reservado', -- 'reservado', 'confirmado', 'cancelado', 'asistio', 'no_asistio'
    booking_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    cancellation_reason TEXT, -- motivo si se cancela
    notes TEXT, -- notas adicionales
    waitlist_position INTEGER, -- posición en lista de espera si clase llena
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES gym_classes(id) ON DELETE CASCADE,
    UNIQUE(client_id, class_id, booking_date) -- un cliente no puede reservar la misma clase el mismo día dos veces
);

-- Insertar reservas realistas basadas en los clientes existentes
INSERT INTO class_bookings (client_id, class_id, booking_date, booking_time, reservation_status, notes) VALUES

-- Reservas para la semana del 25-31 marzo 2024
-- David Celorrio (cliente activo) - le gustan las clases de CrossFit 
(1, 2, '2024-03-25', '18:00', 'asistio', 'Primera clase de CrossFit, buen rendimiento'),
(1, 13, '2024-03-30', '11:00', 'reservado', NULL),

-- María López (principiante) - prefiere clases más suaves
(3, 1, '2024-03-25', '07:30', 'asistio', 'Primera clase de yoga, muy relajante'),
(3, 4, '2024-03-26', '09:00', 'asistio', 'Pilates principiantes perfecto para ella'),
(3, 15, '2024-03-31', '10:00', 'reservado', NULL),

-- Ana Rodríguez (experimentada) - variedad de clases
(5, 6, '2024-03-27', '18:30', 'asistio', 'Yoga flow, excelente flexibilidad'),
(5, 8, '2024-03-28', '19:30', 'confirmado', NULL),
(5, 11, '2024-03-29', '12:00', 'reservado', NULL),

-- Laura Fernández (activa) - le gusta el desafío
(7, 2, '2024-03-25', '18:00', 'asistio', 'CrossFit intenso, mantuvo buen ritmo'),
(7, 5, '2024-03-26', '19:00', 'asistio', 'Boxing fitness, técnica a mejorar'),
(7, 12, '2024-03-30', '10:30', 'confirmado', NULL),

-- Carmen Ruiz (enfoque cardio) - clases cardiovasculares
(9, 3, '2024-03-25', '20:00', 'asistio', 'Spinning nocturno, excelente resistencia'),
(9, 10, '2024-03-29', '12:00', 'asistio', 'HIIT express, completó todos los intervalos'),
(9, 12, '2024-03-30', '09:00', 'reservado', NULL),

-- Isabel Moreno (nueva) - clases para principiantes
(11, 1, '2024-03-25', '07:30', 'no_asistio', 'Se sintió intimidada, reagendar'),
(11, 15, '2024-03-31', '10:00', 'reservado', 'Clase familiar más apropiada'),

-- Carlos García (experimentado) - clases desafiantes
(2, 2, '2024-03-25', '18:00', 'asistio', 'CrossFit intenso, excelente técnica'),
(2, 9, '2024-03-28', '18:00', 'asistio', 'Entrenamiento funcional con buen peso'),
(2, 13, '2024-03-30', '11:00', 'reservado', NULL),

-- Juan Martínez (lesión rodilla) - clases adaptadas
(4, 1, '2024-03-25', '07:30', 'asistio', 'Yoga matutino, adaptaciones para rodilla'),
(4, 7, '2024-03-27', '10:00', 'asistio', 'Aqua fitness perfecto para sus articulaciones'),
(4, 16, '2024-03-31', '11:00', 'reservado', NULL),

-- Pedro Sánchez (pérdida peso) - cardio y aqua
(6, 3, '2024-03-25', '20:00', 'asistio', 'Spinning nocturno, buen esfuerzo'),
(6, 7, '2024-03-27', '10:00', 'asistio', 'Aqua fitness ideal para su condición'),
(6, 8, '2024-03-28', '19:30', 'cancelado', 'Problema horario trabajo'),

-- Miguel González (dolor lumbar) - clases suaves
(8, 1, '2024-03-25', '07:30', 'asistio', 'Yoga con modificaciones para lumbar'),
(8, 4, '2024-03-26', '09:00', 'asistio', 'Pilates fortalecimiento core'),
(8, 11, '2024-03-29', '20:00', 'reservado', NULL),

-- Antonio Jiménez (diabetes) - actividad controlada
(10, 7, '2024-03-27', '10:00', 'asistio', 'Aqua fitness, monitoreo glucosa OK'),
(10, 15, '2024-03-31', '10:00', 'confirmado', NULL),

-- Reservas adicionales para próxima semana (1-7 abril)
(1, 9, '2024-04-04', '18:00', 'reservado', 'Probando entrenamiento funcional'),
(3, 11, '2024-04-05', '20:00', 'reservado', 'Yoga relajante fin de semana'),
(5, 10, '2024-04-05', '12:00', 'reservado', 'HIIT express desafío'),
(7, 13, '2024-04-06', '11:00', 'reservado', 'CrossFit open sábado'),
(9, 3, '2024-04-01', '20:00', 'reservado', 'Spinning nocturno regular');

-- Algunas reservas en lista de espera para clases populares
INSERT INTO class_bookings (client_id, class_id, booking_date, booking_time, reservation_status, waitlist_position, notes) VALUES
(11, 12, '2024-03-30', '10:30', 'reservado', 1, 'Lista de espera - Pilates Intermedio lleno'),
(6, 2, '2024-04-01', '18:00', 'reservado', 2, 'Lista de espera - CrossFit muy demandado');