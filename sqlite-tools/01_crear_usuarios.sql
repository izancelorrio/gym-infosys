-- =====================================================
-- SCRIPT: 01_crear_usuarios.sql
-- DESCRIPCION: Migrado a crear_base_datos.sql
-- FECHA: 2025-10-16
-- AUTOR: Sistema Gym Management
-- =====================================================
-- 
-- NOTA: La estructura de la tabla users ha sido migrada
-- al archivo unificado crear_base_datos.sql
-- Este archivo ahora solo contiene los datos de población
-- 
-- =====================================================

-- =====================================================
-- POBLAR DATOS INICIALES
-- =====================================================

-- Usuarios Administradores
INSERT INTO users (id, name, email, password, email_verified, role, created_at, updated_at) VALUES
(11, 'Alejo', 'alejo@unizar.es', '$2b$12$PwP5YwooSLfutYinHldKPOlQ5N8AB1PpMPRg78sMTdim0wSOCUuxm', 1, 'admin', '2024-01-01 00:00:00', '2024-01-01 00:00:00');

-- Usuarios Entrenadores
INSERT INTO users (id, name, email, password, email_verified, role, created_at, updated_at) VALUES
(9, 'Izan2', 'izan@unizar.es', '$2b$12$W7BG35v33HLbeWPUplyyouc4kUDKR1U/swk71s/n2YJ46aqltBpCC', 1, 'entrenador', '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(35, 'Pedro Martín González', 'pedro.martin@email.com', '$2b$12$QklJzRYttpT5snjyUz8g6eNWIH64KOce2Qb5y6jo/Xkzbc6L3pl5i', 1, 'entrenador', '2024-01-01 00:00:00', '2024-01-01 00:00:00');

-- Usuarios Clientes (con plan activo)
INSERT INTO users (id, name, email, password, email_verified, role, created_at, updated_at) VALUES
(8, 'David Celorrio Garcia', 'dcelorrio@gmail.com', '$2b$12$yyZVKp7LGZkNPBtRYSHmbOIjRziv/lBSSiuVUlunZrP3wQ3pDngDe', 1, 'cliente', '2024-01-01 00:00:00', '2025-10-02 18:32:08'),
(22, 'Carlos García', 'carlos@email.com', '$2b$12$GdSaKKHlkZ0I1Y7FOfcWTuYisgrkC6.FLnzYV.9yey0o8F5AJ3vwO', 1, 'cliente', '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(23, 'María López', 'maría@email.com', '$2b$12$Lod4iHjgPOEiXNoitGmfoOIy9nB0PwxPxy8a0kgX9JLJZyxkNcB2a', 1, 'cliente', '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(24, 'Juan Martínez', 'juan@email.com', '$2b$12$0YVh2R.ZqgusRKKuF0PL7u0fuqGLmpq2mHk.g1Vb4T0PwQB8Jb8ny', 1, 'cliente', '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(25, 'Ana Rodríguez', 'ana@email.com', '$2b$12$o4wuU2BE14nW77QOtMGTpOnoxAOhJECFBGTzIPP7qICiYd1cQXU0O', 1, 'cliente', '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(26, 'Pedro Sánchez', 'pedro@email.com', '$2b$12$afgRHGDVglhex2mjCv1KWOkzkfcy2AL6jewyVsc1lcykzsYBHiP9K', 1, 'cliente', '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(27, 'Laura Fernández', 'laura@email.com', '$2b$12$8jsLOlA5LL9caCjRFJzuB.vyYn2gPcJ7948pz6uleGawfLgLtHoci', 1, 'cliente', '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(28, 'Miguel González Franco', 'miguel@email.com', '$2b$12$V.K8ZRI9nvv6T0DJaSnm.e6oLh.66dhVjYq2G7x1C7cbjj4GQDWRO', 1, 'cliente', '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(29, 'Carmen Ruiz', 'carmen@email.com', '$2b$12$EWb7eufIc67J2icY23.coOon/LeKO/jyy4Yq4FO2QPNlMp2ivgnLy', 1, 'cliente', '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(30, 'Antonio Jiménez', 'antonio@email.com', '$2b$12$oDQlgfWIsH.1NJls9.kja.aM8voda7DsJpkg4NaK9zpkjFSOmFyei', 1, 'cliente', '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(31, 'Isabel Moreno', 'isabel@email.com', '$2b$12$E/jVGfveXok8DtWWJ4Ybd.JN1MsJ0A8UZoXOVD6DxziDeqacssNfO', 1, 'cliente', '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(36, 'Lucía Fernández Ruiz', 'lucia.fernandez@email.com', '$2b$12$f7sOiTMUo81ua0.NkZDpIe14A3skviVskL.z87eJv6yNzzi7RUzKy', 1, 'cliente', '2024-01-01 00:00:00', '2024-01-01 00:00:00');

-- Usuarios básicos (sin plan)
INSERT INTO users (id, name, email, password, email_verified, role, created_at, updated_at) VALUES
(32, 'María García Martínez', 'maria.garcia@email.com', '$2b$12$K31JiYd1EjwF.He7birTYex7kVE2pvCbtKLSs4PwFLd1e6n2127BO', 1, 'usuario', '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(33, 'Juan Pérez López', 'juan.perez@email.com', '$2b$12$yOhPwJoS1lG.97HWyx9ou.nC9zkGkLDhZqwnh7uCrHqW2xb2Lz9JS', 1, 'usuario', '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
(34, 'Ana Rodríguez Sánchez', 'ana.rodriguez@email.com', '$2b$12$rE7f80XyCnNV/dns.h6C9Ofy/cs4voryOZlvoEBfw.pHsQQOnNusa', 1, 'usuario', '2024-01-01 00:00:00', '2024-01-01 00:00:00');

-- =====================================================
-- VERIFICAR CREACION
-- =====================================================

-- Mostrar estructura de la tabla
.schema users

-- Mostrar resumen de usuarios por rol
SELECT 
    role as 'Rol',
    COUNT(*) as 'Cantidad',
    COUNT(CASE WHEN email_verified = 1 THEN 1 END) as 'Verificados'
FROM users 
GROUP BY role 
ORDER BY 
    CASE role 
        WHEN 'admin' THEN 1 
        WHEN 'administrador' THEN 2 
        WHEN 'entrenador' THEN 3 
        WHEN 'cliente' THEN 4 
        WHEN 'clientepro' THEN 5 
        WHEN 'usuario' THEN 6 
    END;

-- Mostrar todos los usuarios
SELECT 
    id,
    name as 'Nombre',
    email as 'Email',
    role as 'Rol',
    CASE email_verified WHEN 1 THEN 'Sí' ELSE 'No' END as 'Verificado',
    created_at as 'Creado',
    updated_at as 'Actualizado'
FROM users 
ORDER BY id;

-- =====================================================
-- NOTAS IMPORTANTES:
-- =====================================================
-- 1. Las contraseñas están hasheadas con bcrypt
-- 2. Los hashes de ejemplo deben ser reemplazados por hashes reales
-- 3. El trigger actualiza automáticamente updated_at en cada UPDATE
-- 4. Los índices mejoran el rendimiento de las consultas frecuentes
-- 5. El CHECK constraint valida que el rol sea uno de los permitidos
-- 6. created_at y updated_at se establecen automáticamente para nuevos registros
-- =====================================================