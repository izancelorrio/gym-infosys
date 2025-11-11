-- Users table seed data with correct integer values for email_verified
INSERT INTO users (name, email, password, email_verified, role, created_at, updated_at) 
VALUES 
('Lucía Fernández Ruiz', 'lucia.fernandez@email.com', '$2b$12$f7sOiTMUo81ua0.NkZDpIe14A3skviVskL.z87eJv6yNzzi7RUzKy', 1, 'cliente', '2024-01-01', '2024-01-01'),
('Pedro Martín González', 'pedro.martin@email.com', '$2b$12$QklJzRYttpT5snjyUz8g6eNWIH64KOce2Qb5y6jo/Xkzbc6L3pl5i', 1, 'entrenador', '2024-01-01', '2024-01-01'),
('Ana Rodríguez Sánchez', 'ana.rodriguez@email.com', '$2b$12$rE7f80XyCnNV/dns.h6C9Ofy/cs4voryOZlvoEBfw.pHsQQOnNusa', 1, 'usuario', '2024-01-01', '2024-01-01'),
('Juan Pérez López', 'juan.perez@email.com', '$2b$12$yOhPwJoS1lG.97HWyx9ou.nC9zkGkLDhZqwnh7uCrHqW2xb2Lz9JS', 1, 'usuario', '2024-01-01', '2024-01-01'),
('María García Martínez', 'maria.garcia@email.com', '$2b$12$K31JiYd1EjwF.He7birTYex7kVE2pvCbtKLSs4PwFLd1e6n2127BO', 1, 'usuario', '2024-01-01', '2024-01-01'),
('Isabel Moreno', 'isabel@email.com', '$2b$12$E/jVGfveXok8DtWWJ4Ybd.JN1MsJ0A8UZoXOVD6DxziDeqacssNfO', 1, 'cliente', '2024-01-01', '2024-01-01'),
('Antonio Jiménez', 'antonio@email.com', '$2b$12$oDQlgfWIsH.1NJls9.kja.aM8voda7DsJpkg4NaK9zpkjFSOmFyei', 1, 'cliente', '2024-01-01', '2024-01-01'),
('Carmen Ruiz', 'carmen@email.com', '$2b$12$EWb7eufIc67J2icY23.coOon/LeKO/jyy4Yq4FO2QPNlMp2ivgnLy', 1, 'cliente', '2024-01-01', '2024-01-01'),
('Miguel González Franco', 'miguel@email.com', '$2b$12$V.K8ZRI9nvv6T0DJaSnm.e6oLh.66dhVjYq2G7x1C7cbjj4GQDWRO', 1, 'cliente', '2024-01-01', '2024-01-01'),
('Laura Fernández', 'laura@email.com', '$2b$12$8jsLOlA5LL9caCjRFJzuB.vyYn2gPcJ7948pz6uleGawfLgLtHoci', 1, 'cliente', '2024-01-01', '2024-01-01'),
('Pedro Sánchez', 'pedro@email.com', '$2b$12$afgRHGDVglhex2mjCv1KWOkzkfcy2AL6jewyVsc1lcykzsYBHiP9K', 1, 'cliente', '2024-01-01', '2024-01-01'),
('Ana Rodríguez', 'ana@email.com', '$2b$12$o4wuU2BE14nW77QOtMGTpOnoxAOhJECFBGTzIPP7qICiYd1cQXU0O', 1, 'cliente', '2024-01-01', '2024-01-01'),
('Juan Martínez', 'juan@email.com', '$2b$12$0YVh2R.ZqgusRKKuF0PL7u0fuqGLmpq2mHk.g1Vb4T0PwQB8Jb8ny', 1, 'cliente', '2024-01-01', '2024-01-01'),
('María López', 'maría@email.com', '$2b$12$Lod4iHjgPOEiXNoitGmfoOIy9nB0PwxPxy8a0kgX9JLJZyxkNcB2a', 1, 'cliente', '2024-01-01', '2024-01-01'),
('Carlos García', 'carlos@email.com', '$2b$12$GdSaKKHlkZ0I1Y7FOfcWTuYisgrkC6.FLnzYV.9yey0o8F5AJ3vwO', 1, 'cliente', '2024-01-01', '2024-01-01'),
('Alejo', 'alejo@unizar.es', '$2b$12$PwP5YwooSLfutYinHldKPOlQ5N8AB1PpMPRg78sMTdim0wSOCUuxm', 1, 'admin', '2024-01-01', '2024-01-01'),
('Izan2', 'izan@unizar.es', '$2b$12$W7BG35v33HLbeWPUplyyouc4kUDKR1U/swk71s/n2YJ46aqltBpCC', 1, 'entrenador', '2024-01-01', '2024-01-01'),
('David Celorrio Garcia', 'dcelorrio@gmail.com', '$2b$12$yyZVKp7LGZkNPBtRYSHmbOIjRziv/lBSSiuVUlunZrP3wQ3pDngDe', 1, 'cliente', '2024-01-01', '2025-10-02 18:32:08'),
('Izan Celorrio', 'izan.celorrio.caballero@gmail.com', '$2b$12$lKmGIZmVeioVxVmKxTKlcuUsw7kj.IKfY4///wt9qj96bkvKsn.lW', 1, 'cliente', '2025-10-16 15:59:19', '2025-10-16 17:32:39');

-- Planes table seed data
INSERT INTO planes (nombre, precio_mensual, caracteristicas, activo, color_tema, orden_display, created_at, updated_at, acceso_entrenador) 
VALUES 
('Premium', 79.99, '["Todo lo del plan Estándar", "Entrenador personal asignado", "Acceso 24/7 al gimnasio", "Áreas VIP exclusivas", "Evaluaciones corporales mensuales", "Planes de nutrición personalizados", "Acceso a sauna y spa", "Invitado gratis semanal"]', 1, '#8b5cf6', 3, '2025-09-22 20:54:57', '2025-10-16 14:23:15', 1),
('Estándar', 49.99, '["Todo lo del plan Básico", "Acceso a clases grupales", "Horario extendido (24/7)", "1 sesión mensual con nutricionista", "Descuentos en tienda"]', 1, '#3b82f6', 2, '2025-09-22 20:54:57', '2025-09-22 20:54:57', 0),
('Básico', 29.99, '["Acceso a todas las máquinas", "Vestuarios y duchas", "Wi-Fi gratuito", "Horario estándar (6:00 - 22:00)"]', 1, '#10b981', 1, '2025-09-22 20:54:57', '2025-09-22 20:54:57', 0);

-- Clientes table seed data
INSERT INTO clientes (id_usuario, dni, numero_telefono, plan_id, fecha_nacimiento, genero, num_tarjeta, fecha_tarjeta, cvv, fecha_inscripcion, estado, created_at, updated_at) 
VALUES 
(1, 'X0000001A', '600000001', 1, '2000-01-01', 'femenino', '4532000000001111', '2025-12-01', '123', '2025-10-16', 'activo', '2025-10-16 17:27:58', '2025-10-16 17:27:58'),
(6, 'X0000006B', '600000006', 1, '2000-01-01', 'femenino', '4532000000006666', '2025-12-01', '456', '2025-10-16', 'activo', '2025-10-16 17:27:58', '2025-10-16 17:27:58'),
(7, 'X0000007C', '600000007', 1, '2000-01-01', 'masculino', '4532000000007777', '2025-12-01', '789', '2025-10-16', 'activo', '2025-10-16 17:27:58', '2025-10-16 17:27:58'),
(8, 'X0000008D', '600000008', 1, '2000-01-01', 'femenino', '4532000000008888', '2025-12-01', '234', '2025-10-16', 'activo', '2025-10-16 17:27:58', '2025-10-16 17:27:58'),
(9, 'X0000009E', '600000009', 1, '2000-01-01', 'masculino', '4532000000009999', '2025-12-01', '567', '2025-10-16', 'activo', '2025-10-16 17:27:58', '2025-10-16 17:27:58'),
(10, 'X0000010F', '600000010', 1, '2000-01-01', 'femenino', '4532000000010000', '2025-12-01', '890', '2025-10-16', 'activo', '2025-10-16 17:27:58', '2025-10-16 17:27:58'),
(11, 'X0000011G', '600000011', 1, '2000-01-01', 'masculino', '4532000000011111', '2025-12-01', '345', '2025-10-16', 'activo', '2025-10-16 17:27:58', '2025-10-16 17:27:58'),
(12, 'X0000012H', '600000012', 1, '2000-01-01', 'femenino', '4532000000012222', '2025-12-01', '678', '2025-10-16', 'activo', '2025-10-16 17:27:58', '2025-10-16 17:27:58'),
(13, 'X0000013I', '600000013', 1, '2000-01-01', 'masculino', '4532000000013333', '2025-12-01', '901', '2025-10-16', 'activo', '2025-10-16 17:27:58', '2025-10-16 17:27:58'),
(14, 'X0000014J', '600000014', 1, '2000-01-01', 'femenino', '4532000000014444', '2025-12-01', '234', '2025-10-16', 'activo', '2025-10-16 17:27:58', '2025-10-16 17:27:58'),
(15, 'X0000015K', '600000015', 1, '2000-01-01', 'masculino', '4532000000015555', '2025-12-01', '567', '2025-10-16', 'activo', '2025-10-16 17:27:58', '2025-10-16 17:27:58'),
(18, 'X0000018L', '600000018', 1, '2000-01-01', 'masculino', '4532000000018888', '2025-12-01', '890', '2025-10-16', 'activo', '2025-10-16 17:27:58', '2025-10-16 17:27:58'),
(19, 'X0000019M', '600000019', 1, '2000-01-01', 'masculino', '4532000000019999', '2025-12-01', '123', '2025-10-16', 'activo', '2025-10-16 17:27:58', '2025-10-16 17:27:58');

-- Gym classes table seed data
INSERT INTO gym_clases (nombre, descripcion, duracion_minutos, nivel, max_participantes, activo, created_at, updated_at, color) 
VALUES 
('Stretching', 'Sesión de estiramientos y relajación muscular', 30, 'todos', 20, 1, '2025-10-02 19:00:51', '2025-10-09 16:06:58', 'bg-emerald-100 border-emerald-300 text-emerald-800'),
('Body Combat', 'Artes marciales coreografiadas sin contacto', 50, 'todos', 22, 1, '2025-10-02 19:00:51', '2025-10-09 16:06:58', 'bg-rose-100 border-rose-300 text-rose-800'),
('Body Pump', 'Entrenamiento con pesas al ritmo de la música', 55, 'intermedio', 18, 1, '2025-10-02 19:00:51', '2025-10-09 16:06:58', 'bg-indigo-100 border-indigo-300 text-indigo-800'),
('Aqua Aeróbicos', 'Ejercicios cardiovasculares y de resistencia en el agua', 45, 'todos', 12, 1, '2025-10-02 19:00:51', '2025-10-09 16:07:11', 'bg-cyan-100 border-cyan-300 text-cyan-800'),
('Boxing', 'Entrenamiento de boxeo sin contacto, técnica y cardio', 45, 'intermedio', 14, 1, '2025-10-02 19:00:51', '2025-10-09 18:11:41', 'bg-amber-100 border-amber-300 text-amber-800'),
('Funcional', 'Entrenamiento con movimientos naturales del cuerpo', 50, 'intermedio', 16, 1, '2025-10-02 19:00:51', '2025-10-09 16:06:58', 'bg-teal-100 border-teal-300 text-teal-800'),
('Aeróbicos', 'Ejercicios cardiovasculares con movimientos rítmicos', 45, 'principiante', 20, 1, '2025-10-02 19:00:51', '2025-10-09 16:07:11', 'bg-orange-100 border-orange-300 text-orange-800'),
('Yoga', 'Práctica de posturas, respiración y meditación', 60, 'todos', 18, 1, '2025-10-02 19:00:51', '2025-10-09 16:06:58', 'bg-purple-100 border-purple-300 text-purple-800'),
('Spinning', 'Ciclismo indoor con música motivacional', 45, 'todos', 20, 1, '2025-10-02 19:00:51', '2025-10-09 16:06:58', 'bg-green-100 border-green-300 text-green-800'),
('CrossFit', 'Entrenamiento funcional de alta intensidad', 60, 'intermedio', 12, 1, '2025-10-02 19:00:51', '2025-10-09 16:06:58', 'bg-red-100 border-red-300 text-red-800'),
('Zumba', 'Baile fitness con ritmos latinos y música energética', 45, 'todos', 25, 1, '2025-10-02 19:00:51', '2025-10-09 16:06:58', 'bg-pink-100 border-pink-300 text-pink-800'),
('Pilates', 'Ejercicios de fortalecimiento del core y flexibilidad', 50, 'todos', 15, 1, '2025-10-02 19:00:51', '2025-10-09 16:06:58', 'bg-blue-100 border-blue-300 text-blue-800');

-- Clases programadas table seed data
INSERT INTO clases_programadas (id_clase, id_instructor, fecha, hora, capacidad_maxima, estado, ubicacion, duracion_minutos, created_at, updated_at) 
VALUES 
(4, 2, '2025-10-25', '17:00:00', 20, 'activa', NULL, 60, '2025-10-09 18:44:42', '2025-10-16 17:36:49'),
(2, 2, '2025-10-20', '17:00:00', 25, 'activa', NULL, 60, '2025-10-09 18:44:17', '2025-10-16 17:36:49'),
(10, 17, '2025-10-20', '20:00:00', 15, 'activa', NULL, 60, '2025-10-09 18:28:15', '2025-10-16 17:36:49'),
(7, 2, '2025-10-20', '11:00:00', 16, 'activa', NULL, 60, '2025-10-09 18:28:15', '2025-10-16 17:36:49'),
(6, 17, '2025-10-20', '17:00:00', 22, 'activa', NULL, 60, '2025-10-09 18:28:15', '2025-10-16 17:36:49'),
(5, 2, '2025-10-20', '08:00:00', 18, 'activa', NULL, 60, '2025-10-09 18:28:15', '2025-10-16 17:36:49'),
(4, 17, '2025-10-19', '19:30:00', 25, 'activa', NULL, 60, '2025-10-09 18:28:15', '2025-10-16 17:36:49'),
(3, 2, '2025-10-19', '10:30:00', 12, 'activa', NULL, 60, '2025-10-09 18:28:15', '2025-10-16 17:36:49'),
(2, 17, '2025-10-19', '18:00:00', 20, 'activa', NULL, 60, '2025-10-09 18:28:15', '2025-10-16 17:36:49'),
(1, 2, '2025-10-19', '09:00:00', 15, 'activa', NULL, 60, '2025-10-09 18:28:15', '2025-10-16 17:36:49'),
(8, 2, '2025-10-19', '16:00:00', 4, 'activa', NULL, 60, '2025-10-09 18:28:15', '2025-10-16 17:36:49');

-- Reservas table seed data
INSERT INTO reservas (id_cliente, id_clase_programada, estado, created_at, updated_at) 
VALUES 
(1, 1, 'completada', '2025-10-16 17:46:27', '2025-10-16 20:31:22'),
(1, 3, 'activa', '2025-10-09 18:54:48', '2025-10-09 18:54:48'),
(1, 4, 'completada', '2025-10-09 18:54:35', '2025-10-16 20:31:15'),
(1, 8, 'activa', '2025-10-09 17:48:18', '2025-10-09 17:48:18');

-- Entrenador cliente asignaciones table seed data
INSERT INTO entrenador_cliente_asignaciones (id_entrenador, id_cliente, estado, fecha_asignacion, notas, created_at, updated_at) 
VALUES 
(17, 1, 'activa', '2025-10-16', 'puerba1', '2025-10-16 18:29:13', '2025-10-16 18:29:13');

-- Ejercicios table seed data
INSERT INTO ejercicios (nombre, categoria, descripcion, estado, created_at, updated_at) 
VALUES 
('Elíptica', 'Cardio', 'Ejercicio cardiovascular de cuerpo completo', 'activo', '2025-10-16 19:01:12', '2025-10-16 19:01:12'),
('Bicicleta estática', 'Cardio', 'Ejercicio cardiovascular para piernas', 'activo', '2025-10-16 19:01:12', '2025-10-16 19:01:12'),
('Caminadora', 'Cardio', 'Ejercicio cardiovascular de bajo impacto', 'activo', '2025-10-16 19:01:12', '2025-10-16 19:01:12'),
('Extensiones de cuádriceps', 'Fuerza', 'Ejercicio de aislamiento para cuádriceps', 'activo', '2025-10-16 19:01:12', '2025-10-16 19:01:12'),
('Curl femoral', 'Fuerza', 'Ejercicio de aislamiento para isquiotibiales', 'activo', '2025-10-16 19:01:12', '2025-10-16 19:01:12'),
('Prensa de piernas', 'Fuerza', 'Ejercicio de empuje para cuádriceps', 'activo', '2025-10-16 19:01:12', '2025-10-16 19:01:12'),
('Elevaciones laterales', 'Fuerza', 'Ejercicio de aislamiento para deltoides', 'activo', '2025-10-16 19:01:12', '2025-10-16 19:01:12'),
('Extensiones de tríceps', 'Fuerza', 'Ejercicio de aislamiento para tríceps', 'activo', '2025-10-16 19:01:12', '2025-10-16 19:01:12'),
('Curl de bíceps', 'Fuerza', 'Ejercicio de aislamiento para bíceps', 'activo', '2025-10-16 19:01:12', '2025-10-16 19:01:12'),
('Fondos', 'Fuerza', 'Ejercicio de empuje para tríceps y pecho', 'activo', '2025-10-16 19:01:12', '2025-10-16 19:01:12'),
('Dominadas', 'Fuerza', 'Ejercicio de tracción vertical', 'activo', '2025-10-16 19:01:12', '2025-10-16 19:01:12'),
('Remo con barra', 'Fuerza', 'Ejercicio de tracción para espalda', 'activo', '2025-10-16 19:01:12', '2025-10-16 19:01:12'),
('Press militar', 'Fuerza', 'Ejercicio de empuje vertical para hombros', 'activo', '2025-10-16 19:01:12', '2025-10-16 19:01:12'),
('Peso muerto', 'Fuerza', 'Ejercicio completo para cadena posterior', 'activo', '2025-10-16 19:01:12', '2025-10-16 19:01:12'),
('Sentadillas', 'Fuerza', 'Ejercicio fundamental para piernas y glúteos', 'activo', '2025-10-16 19:01:12', '2025-10-16 19:01:12'),
('Press de banca', 'Fuerza', 'Ejercicio de empuje para pecho, hombros y tríceps', 'activo', '2025-10-16 19:01:12', '2025-10-16 19:01:12');

-- Entrenamientos asignados table seed data
INSERT INTO entrenamientos_asignados (id_entrenador, id_cliente, id_ejercicio, fecha_entrenamiento, series, estado, created_at, updated_at) 
VALUES 
(17, 1, 6, '2025-10-18', 1, 'pendiente', '2025-10-16 19:38:22', '2025-10-16 19:38:22'),
(17, 1, 1, '2025-10-18', 1, 'pendiente', '2025-10-16 19:38:22', '2025-10-16 19:38:22'),
(17, 1, 9, '2025-10-18', 1, 'pendiente', '2025-10-16 19:38:22', '2025-10-16 19:38:22'),
(17, 1, 4, '2025-10-18', 1, 'pendiente', '2025-10-16 19:38:22', '2025-10-16 19:38:22'),
(17, 1, 14, '2025-10-18', 1, 'completado', '2025-10-16 19:38:22', '2025-10-16 19:56:24'),
(17, 1, 11, '2025-10-16', 1, 'pendiente', '2025-10-16 19:37:18', '2025-10-16 19:37:18'),
(17, 1, 1, '2025-10-16', 1, 'completado', '2025-10-16 19:37:18', '2025-10-16 19:55:41'),
(17, 1, 6, '2025-10-16', 2, 'pendiente', '2025-10-16 19:37:18', '2025-10-16 19:37:18'),
(17, 1, 5, '2025-10-24', 1, 'pendiente', '2025-10-16 19:36:32', '2025-10-16 19:36:32'),
(17, 1, 8, '2025-10-20', 3, 'pendiente', '2025-10-16 19:35:26', '2025-10-16 19:35:26');

-- Entrenamientos realizados table seed data
INSERT INTO entrenamientos_realizados (id_cliente, id_ejercicio, id_entrenamiento_asignado, fecha_realizacion, hora_inicio, hora_fin, series_realizadas, repeticiones, peso_kg, tiempo_segundos, distancia_metros, notas, valoracion, tipo_registro, created_at, updated_at) 
VALUES 
(1, 10, NULL, '2025-10-07', NULL, NULL, 5, 5, 5, 300, 5, '', 3, 'libre', '2025-10-16 20:10:33', '2025-10-16 20:10:33'),
(1, 12, NULL, '2025-10-16', NULL, NULL, 3, 3, 55, 480, 55, 'hrhrh', 4, 'libre', '2025-10-16 20:08:10', '2025-10-16 20:08:10'),
(1, 6, 8, '2025-10-16', NULL, NULL, 1, 1, 1, 31313, 313, '', 3, 'planificado', '2025-10-16 19:56:24', '2025-10-16 19:56:24'),
(1, 14, 5, '2025-10-16', NULL, NULL, 1, 33, 33, 33, NULL, '', 3, 'planificado', '2025-10-16 19:55:41', '2025-10-16 19:55:41'),
(1, 1, 7, '2025-10-16', NULL, NULL, 1, 33, 33, 33, NULL, '', 3, 'planificado', '2025-10-16 19:55:41', '2025-10-16 19:55:41');