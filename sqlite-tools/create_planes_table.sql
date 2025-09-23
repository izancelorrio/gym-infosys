-- Script para crear tabla de planes y poblar con datos de ejemplo

-- Crear tabla planes
CREATE TABLE IF NOT EXISTS "planes" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "precio_mensual" DECIMAL(10,2) NOT NULL,
    "precio_anual" DECIMAL(10,2),
    "duracion_meses" INTEGER NOT NULL DEFAULT 1,
    "caracteristicas" TEXT NOT NULL, -- JSON string con las características
    "limite_clases" INTEGER DEFAULT NULL, -- NULL = ilimitado
    "acceso_nutricionista" INTEGER DEFAULT 0, -- 0 = no, 1 = sí
    "acceso_entrenador_personal" INTEGER DEFAULT 0, -- 0 = no, 1 = sí
    "acceso_areas_premium" INTEGER DEFAULT 0, -- 0 = no, 1 = sí
    "popular" INTEGER DEFAULT 0, -- 0 = no destacado, 1 = plan popular
    "activo" INTEGER DEFAULT 1, -- 0 = inactivo, 1 = activo
    "color_tema" TEXT DEFAULT '#3b82f6', -- Color para el UI
    "orden_display" INTEGER DEFAULT 1, -- Orden de visualización
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insertar planes de ejemplo
INSERT INTO planes (nombre, descripcion, precio_mensual, precio_anual, duracion_meses, caracteristicas, limite_clases, acceso_nutricionista, acceso_entrenador_personal, acceso_areas_premium, popular, color_tema, orden_display) VALUES
('Básico', 'Plan perfecto para comenzar tu transformación', 29.99, 299.99, 1, '["Acceso a todas las máquinas", "Vestuarios y duchas", "Wi-Fi gratuito", "Horario estándar (6:00 - 22:00)"]', 8, 0, 0, 0, 0, '#10b981', 1),

('Estándar', 'El plan más popular para usuarios regulares', 49.99, 499.99, 1, '["Todo lo del plan Básico", "Acceso a clases grupales", "Horario extendido (24/7)", "1 sesión mensual con nutricionista", "Descuentos en tienda"]', NULL, 1, 0, 0, 1, '#3b82f6', 2),

('Premium', 'Para los más exigentes y comprometidos', 89.99, 899.99, 1, '["Todo lo del plan Estándar", "Entrenador personal (2 sesiones/mes)", "Acceso a áreas premium", "Evaluaciones corporales mensuales", "Invitado gratis semanal", "Toallas incluidas"]', NULL, 1, 1, 1, 0, '#8b5cf6', 3),

('Anual Básico', 'Plan básico con descuento anual', 24.99, 299.88, 12, '["Acceso a todas las máquinas", "Vestuarios y duchas", "Wi-Fi gratuito", "Horario estándar (6:00 - 22:00)", "2 meses gratis al año"]', 10, 0, 0, 0, 0, '#059669', 4),

('Estudiante', 'Tarifa especial para estudiantes', 19.99, 199.99, 1, '["Acceso básico a máquinas", "Vestuarios", "Horario limitado (9:00 - 17:00)", "Válido con credencial estudiantil"]', 5, 0, 0, 0, 0, '#f59e0b', 5);

-- Crear trigger para actualizar updated_at automáticamente
CREATE TRIGGER IF NOT EXISTS update_planes_timestamp 
    AFTER UPDATE ON planes
BEGIN
    UPDATE planes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;