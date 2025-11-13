-- =====================================================
-- SCRIPT: create_planes_table.sql
-- DESCRIPCION: Datos de población para tabla planes
-- FECHA: 2025-10-16
-- AUTOR: Sistema Gym Management
-- =====================================================
-- 
-- NOTA: La estructura de la tabla planes está en crear_base_datos.sql
-- Este archivo contiene solo los datos de población
-- 
-- =====================================================

-- Insertar los 3 planes únicos
INSERT INTO planes (nombre, precio_mensual, caracteristicas, acceso_entrenador, color_tema, orden_display) VALUES
('Básico', 29.99, '["Acceso a todas las máquinas de musculación", "Vestuarios y duchas", "Wi-Fi gratuito", "Horario estándar (6:00 - 22:00)", "Asesoramiento básico del personal"]', 0, '#10b981', 1),

('Estándar', 39.99, '["Todo lo del plan Básico", "Acceso a clases grupales ilimitadas", "Horario extendido (5:00 - 23:00)", "Zona de cardio premium", "Descuentos en productos del gimnasio", "App móvil con seguimiento de entrenamientos"]', 0, '#3b82f6', 2),

('Premium', 79.99, '["Todo lo del plan Estándar", "Entrenador personal asignado", "Acceso 24/7 al gimnasio", "Áreas VIP exclusivas", "Evaluaciones corporales mensuales", "Planes de nutrición personalizados", "Acceso a sauna y spa", "Invitado gratis semanal"]', 1, '#8b5cf6', 3);