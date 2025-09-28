-- Script para convertir usuarios (ID 22-31) a rol 'cliente'
-- Ejecutar después de crear la tabla clientes para que coincidan los roles

UPDATE users SET role = 'cliente' WHERE id >= 22 AND id <= 31;

-- Verificar los cambios
SELECT id, name, email, role FROM users WHERE id >= 22 AND id <= 31;