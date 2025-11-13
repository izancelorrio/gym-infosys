-- Script para crear 5 usuarios nuevos con rol 'usuario'

INSERT INTO users (name, email, password, email_verified, role) VALUES
('María García Martínez', 'maria.garcia@email.com', '$2b$12$LQv3c1yqBWVHxkd0LQ1lqu.Z0aBvY1Y4gKj4RKE4Qnj4Xx4pGtJ6m', 1, 'usuario'),
('Juan Pérez López', 'juan.perez@email.com', '$2b$12$LQv3c1yqBWVHxkd0LQ1lqu.Z0aBvY1Y4gKj4RKE4Qnj4Xx4pGtJ6m', 1, 'usuario'),
('Ana Rodríguez Sánchez', 'ana.rodriguez@email.com', '$2b$12$LQv3c1yqBWVHxkd0LQ1lqu.Z0aBvY1Y4gKj4RKE4Qnj4Xx4pGtJ6m', 1, 'usuario'),
('Pedro Martín González', 'pedro.martin@email.com', '$2b$12$LQv3c1yqBWVHxkd0LQ1lqu.Z0aBvY1Y4gKj4RKE4Qnj4Xx4pGtJ6m', 1, 'usuario'),
('Lucía Fernández Ruiz', 'lucia.fernandez@email.com', '$2b$12$LQv3c1yqBWVHxkd0LQ1lqu.Z0aBvY1Y4gKj4RKE4Qnj4Xx4pGtJ6m', 1, 'usuario');

-- Verificar los usuarios creados
SELECT id, name, email, role, email_verified FROM users WHERE role = 'usuario' ORDER BY id DESC LIMIT 5;