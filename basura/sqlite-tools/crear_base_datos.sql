-- =====================================================
-- SCRIPT DE CREACIÓN COMPLETA DE BASE DE DATOS
-- Sistema de Gestión de Gimnasio
-- =====================================================
-- Este archivo contiene todas las tablas, índices, 
-- triggers y claves foráneas del sistema
-- =====================================================

-- =====================================================
-- TABLA: USERS (Usuarios del sistema)
-- =====================================================

-- Eliminar tabla usuarios si existe (para recrearla)
DROP TABLE IF EXISTS users;

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS update_users_timestamp;

-- =====================================================
-- CREAR TABLA USUARIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email_verified INTEGER DEFAULT 0,
    role TEXT NOT NULL DEFAULT 'usuario' CHECK (role IN ('admin', 'entrenador', 'cliente', 'usuario')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- CREAR INDICES PARA OPTIMIZAR CONSULTAS
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
CREATE INDEX IF NOT EXISTS idx_users_updated_at ON users(updated_at);

-- =====================================================
-- CREAR TRIGGER PARA ACTUALIZAR updated_at
-- =====================================================
CREATE TRIGGER update_users_timestamp 
    AFTER UPDATE ON users 
BEGIN 
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; 
END;

-- =====================================================
-- TABLA: EMAIL_VERIFICATIONS (Tokens de verificación de email)
-- =====================================================

-- Eliminar tabla email_verifications si existe (para recrearla)
DROP TABLE IF EXISTS email_verifications;

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS update_email_verifications_timestamp;

-- =====================================================
-- CREAR TABLA EMAIL_VERIFICATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS email_verifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- CREAR INDICES PARA OPTIMIZAR CONSULTAS
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_email_verifications_user_id ON email_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(token);
CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at ON email_verifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_email_verifications_updated_at ON email_verifications(updated_at);

-- =====================================================
-- CREAR TRIGGER PARA ACTUALIZAR updated_at
-- =====================================================
CREATE TRIGGER update_email_verifications_timestamp
    AFTER UPDATE ON email_verifications
BEGIN
    UPDATE email_verifications SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- =====================================================
-- TABLA: RESET_TOKENS (Tokens para recuperación de contraseña)
-- =====================================================

-- Eliminar tabla reset_tokens si existe (para recrearla)
DROP TABLE IF EXISTS reset_tokens;

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS update_reset_tokens_timestamp;

-- =====================================================
-- CREAR TABLA RESET_TOKENS
-- =====================================================
CREATE TABLE IF NOT EXISTS reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- CREAR INDICES PARA OPTIMIZAR CONSULTAS
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_reset_tokens_user_id ON reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_token ON reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_expires_at ON reset_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_updated_at ON reset_tokens(updated_at);

-- =====================================================
-- CREAR TRIGGER PARA ACTUALIZAR updated_at
-- =====================================================
CREATE TRIGGER update_reset_tokens_timestamp
    AFTER UPDATE ON reset_tokens
BEGIN
    UPDATE reset_tokens SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;


-- =====================================================
-- TABLA: PLANES (Planes de membresía del gimnasio)
-- =====================================================

-- Eliminar tabla planes si existe (para recrearla)
DROP TABLE IF EXISTS planes;

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS update_planes_timestamp;

-- =====================================================
-- CREAR TABLA PLANES
-- =====================================================
CREATE TABLE IF NOT EXISTS planes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE,
    precio_mensual DECIMAL(10,2) NOT NULL,
    caracteristicas TEXT NOT NULL, -- JSON string con las características
    acceso_entrenador INTEGER DEFAULT 0, -- 0 = no (cliente normal), 1 = sí (cliente pro)
    activo INTEGER DEFAULT 1, -- 0 = inactivo, 1 = activo
    color_tema TEXT DEFAULT '#3b82f6', -- Color para el UI
    orden_display INTEGER DEFAULT 1, -- Orden de visualización
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- CREAR INDICES PARA OPTIMIZAR CONSULTAS
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_planes_nombre ON planes(nombre);
CREATE INDEX IF NOT EXISTS idx_planes_activo ON planes(activo);
CREATE INDEX IF NOT EXISTS idx_planes_acceso_entrenador ON planes(acceso_entrenador);
CREATE INDEX IF NOT EXISTS idx_planes_orden_display ON planes(orden_display);
CREATE INDEX IF NOT EXISTS idx_planes_updated_at ON planes(updated_at);

-- =====================================================
-- CREAR TRIGGER PARA ACTUALIZAR updated_at
-- =====================================================
CREATE TRIGGER update_planes_timestamp 
    AFTER UPDATE ON planes
BEGIN
    UPDATE planes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- =====================================================
-- TABLA: CLIENTES (Información detallada de clientes)
-- =====================================================

-- Eliminar tabla clientes si existe (para recrearla)
DROP TABLE IF EXISTS clientes;

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS update_clientes_timestamp;

-- =====================================================
-- CREAR TABLA CLIENTES
-- =====================================================
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES planes(id)
);

-- =====================================================
-- CREAR INDICES PARA OPTIMIZAR CONSULTAS
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_clientes_id_usuario ON clientes(id_usuario);
CREATE INDEX IF NOT EXISTS idx_clientes_dni ON clientes(dni);
CREATE INDEX IF NOT EXISTS idx_clientes_plan_id ON clientes(plan_id);
CREATE INDEX IF NOT EXISTS idx_clientes_estado ON clientes(estado);
CREATE INDEX IF NOT EXISTS idx_clientes_updated_at ON clientes(updated_at);

-- =====================================================
-- CREAR TRIGGER PARA ACTUALIZAR updated_at
-- =====================================================
CREATE TRIGGER update_clientes_timestamp 
    AFTER UPDATE ON clientes
BEGIN
    UPDATE clientes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- =====================================================
-- TABLA: GYM_CLASES (Tipos de clases del gimnasio)
-- =====================================================

-- Eliminar tabla gym_clases si existe (para recrearla)
DROP TABLE IF EXISTS gym_clases;

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS update_gym_clases_timestamp;

-- =====================================================
-- CREAR TABLA GYM_CLASES
-- =====================================================
CREATE TABLE IF NOT EXISTS gym_clases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    duracion_minutos INTEGER DEFAULT 45,
    nivel VARCHAR(20) DEFAULT 'todos', -- 'principiante', 'intermedio', 'avanzado', 'todos'
    max_participantes INTEGER DEFAULT 20,
    activo INTEGER DEFAULT 1, -- 1=activo, 0=inactivo
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    color VARCHAR(50) DEFAULT 'bg-gray-100 border-gray-300 text-gray-800'
);

-- =====================================================
-- CREAR INDICES PARA OPTIMIZAR CONSULTAS
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_gym_clases_nombre ON gym_clases(nombre);
CREATE INDEX IF NOT EXISTS idx_gym_clases_nivel ON gym_clases(nivel);
CREATE INDEX IF NOT EXISTS idx_gym_clases_activo ON gym_clases(activo);
CREATE INDEX IF NOT EXISTS idx_gym_clases_duracion ON gym_clases(duracion_minutos);
CREATE INDEX IF NOT EXISTS idx_gym_clases_updated_at ON gym_clases(updated_at);

-- =====================================================
-- CREAR TRIGGER PARA ACTUALIZAR updated_at
-- =====================================================
CREATE TRIGGER update_gym_clases_timestamp 
    AFTER UPDATE ON gym_clases 
BEGIN 
    UPDATE gym_clases SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; 
END;

-- =====================================================
-- TABLA: CLASES_PROGRAMADAS (Clases programadas del gimnasio)
-- =====================================================

-- Eliminar tabla clases_programadas si existe (para recrearla)
DROP TABLE IF EXISTS clases_programadas;

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS update_clases_programadas_timestamp;

-- =====================================================
-- CREAR TABLA CLASES_PROGRAMADAS
-- =====================================================
CREATE TABLE IF NOT EXISTS clases_programadas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_clase INTEGER NOT NULL,
    id_instructor INTEGER NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    capacidad_maxima INTEGER NOT NULL DEFAULT 20,
    estado VARCHAR(20) DEFAULT 'activa',
    ubicacion VARCHAR(100),
    duracion_minutos INTEGER DEFAULT 60,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Claves foráneas
    FOREIGN KEY (id_clase) REFERENCES gym_clases(id) ON DELETE CASCADE,
    FOREIGN KEY (id_instructor) REFERENCES users(id) ON DELETE CASCADE,

    -- Restricciones únicas: no se puede programar la misma clase con el mismo instructor a la misma hora y fecha
    UNIQUE(id_clase, id_instructor, fecha, hora)
);

-- =====================================================
-- CREAR INDICES PARA OPTIMIZAR CONSULTAS
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_clases_programadas_fecha ON clases_programadas(fecha);
CREATE INDEX IF NOT EXISTS idx_clases_programadas_instructor ON clases_programadas(id_instructor);
CREATE INDEX IF NOT EXISTS idx_clases_programadas_clase ON clases_programadas(id_clase);
CREATE INDEX IF NOT EXISTS idx_clases_programadas_estado ON clases_programadas(estado);
CREATE INDEX IF NOT EXISTS idx_clases_programadas_updated_at ON clases_programadas(updated_at);

-- =====================================================
-- CREAR TRIGGER PARA ACTUALIZAR updated_at
-- =====================================================
CREATE TRIGGER update_clases_programadas_timestamp
    AFTER UPDATE ON clases_programadas
BEGIN
    UPDATE clases_programadas SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- =====================================================
-- TABLA: RESERVAS (Reservas de clases programadas)
-- =====================================================

-- Eliminar tabla reservas si existe (para recrearla)
DROP TABLE IF EXISTS reservas;

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS update_reservas_timestamp;

-- =====================================================
-- CREAR TABLA RESERVAS
-- =====================================================
CREATE TABLE IF NOT EXISTS reservas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_cliente INTEGER NOT NULL,
    id_clase_programada INTEGER NOT NULL,
    estado VARCHAR(20) DEFAULT 'activa',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Claves foráneas
    FOREIGN KEY (id_cliente) REFERENCES clientes(id) ON DELETE CASCADE,
    FOREIGN KEY (id_clase_programada) REFERENCES clases_programadas(id) ON DELETE CASCADE,

    -- Restricciones únicas: un cliente no puede reservar la misma clase dos veces
    UNIQUE(id_cliente, id_clase_programada)
);

-- =====================================================
-- CREAR INDICES PARA OPTIMIZAR CONSULTAS
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_reservas_cliente ON reservas(id_cliente);
CREATE INDEX IF NOT EXISTS idx_reservas_clase ON reservas(id_clase_programada);
CREATE INDEX IF NOT EXISTS idx_reservas_estado ON reservas(estado);
CREATE INDEX IF NOT EXISTS idx_reservas_updated_at ON reservas(updated_at);

-- =====================================================
-- CREAR TRIGGER PARA ACTUALIZAR updated_at
-- =====================================================
CREATE TRIGGER update_reservas_timestamp
    AFTER UPDATE ON reservas
BEGIN
    UPDATE reservas SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- =====================================================
-- TABLA: ENTRENADOR_CLIENTE_ASIGNACIONES (Asignaciones entrenador-cliente)
-- =====================================================

-- Eliminar tabla entrenador_cliente_asignaciones si existe (para recrearla)
DROP TABLE IF EXISTS entrenador_cliente_asignaciones;

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS update_entrenador_cliente_asignaciones_updated_at;

-- =====================================================
-- CREAR TABLA ENTRENADOR_CLIENTE_ASIGNACIONES
-- =====================================================
CREATE TABLE IF NOT EXISTS entrenador_cliente_asignaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_entrenador INTEGER NOT NULL,
    id_cliente INTEGER NOT NULL,
    estado TEXT DEFAULT 'activa' CHECK (estado IN ('activa', 'inactiva', 'completada')),
    fecha_asignacion DATE DEFAULT CURRENT_DATE,
    notas TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Claves foráneas
    FOREIGN KEY (id_entrenador) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id) ON DELETE CASCADE,
    
    -- Constraint único para evitar asignaciones duplicadas activas
    UNIQUE(id_entrenador, id_cliente, estado) 
);

-- =====================================================
-- CREAR INDICES PARA OPTIMIZAR CONSULTAS
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_entrenador_cliente_entrenador ON entrenador_cliente_asignaciones(id_entrenador);
CREATE INDEX IF NOT EXISTS idx_entrenador_cliente_cliente ON entrenador_cliente_asignaciones(id_cliente);
CREATE INDEX IF NOT EXISTS idx_entrenador_cliente_estado ON entrenador_cliente_asignaciones(estado);
CREATE INDEX IF NOT EXISTS idx_entrenador_cliente_updated_at ON entrenador_cliente_asignaciones(updated_at);

-- =====================================================
-- CREAR TRIGGER PARA ACTUALIZAR updated_at
-- =====================================================
CREATE TRIGGER update_entrenador_cliente_asignaciones_updated_at
    AFTER UPDATE ON entrenador_cliente_asignaciones
BEGIN
    UPDATE entrenador_cliente_asignaciones SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- =====================================================
-- TABLA: EJERCICIOS (Catálogo de ejercicios disponibles)
-- =====================================================

-- Eliminar tabla ejercicios si existe (para recrearla)
DROP TABLE IF EXISTS ejercicios;

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS update_ejercicios_timestamp;

-- =====================================================
-- CREAR TABLA EJERCICIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS ejercicios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    categoria VARCHAR(50) NOT NULL DEFAULT 'General',
    descripcion TEXT,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- CREAR INDICES PARA OPTIMIZAR CONSULTAS
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_ejercicios_nombre ON ejercicios(nombre);
CREATE INDEX IF NOT EXISTS idx_ejercicios_categoria ON ejercicios(categoria);
CREATE INDEX IF NOT EXISTS idx_ejercicios_estado ON ejercicios(estado);
CREATE INDEX IF NOT EXISTS idx_ejercicios_updated_at ON ejercicios(updated_at);

-- =====================================================
-- CREAR TRIGGER PARA ACTUALIZAR updated_at
-- =====================================================
CREATE TRIGGER update_ejercicios_timestamp 
    AFTER UPDATE ON ejercicios
BEGIN
    UPDATE ejercicios SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- =====================================================
-- TABLA: ENTRENAMIENTOS_ASIGNADOS (Entrenamientos asignados por entrenadores)
-- =====================================================

-- Eliminar tabla entrenamientos_asignados si existe (para recrearla)
DROP TABLE IF EXISTS entrenamientos_asignados;

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS update_entrenamientos_asignados_timestamp;

-- =====================================================
-- CREAR TABLA ENTRENAMIENTOS_ASIGNADOS
-- =====================================================
CREATE TABLE IF NOT EXISTS entrenamientos_asignados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_entrenador INTEGER NOT NULL,
    id_cliente INTEGER NOT NULL,
    id_ejercicio INTEGER NOT NULL,
    fecha_entrenamiento DATE NOT NULL,
    series INTEGER NOT NULL DEFAULT 1 CHECK (series > 0 AND series <= 10),
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'completado', 'cancelado')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Claves foráneas
    FOREIGN KEY (id_entrenador) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id) ON DELETE CASCADE,
    FOREIGN KEY (id_ejercicio) REFERENCES ejercicios(id) ON DELETE RESTRICT,
    
    -- Constraint único para evitar duplicados del mismo ejercicio en la misma fecha
    UNIQUE(id_cliente, id_ejercicio, fecha_entrenamiento)
);

-- =====================================================
-- CREAR INDICES PARA OPTIMIZAR CONSULTAS
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_entrenamientos_entrenador ON entrenamientos_asignados(id_entrenador);
CREATE INDEX IF NOT EXISTS idx_entrenamientos_cliente ON entrenamientos_asignados(id_cliente);
CREATE INDEX IF NOT EXISTS idx_entrenamientos_ejercicio ON entrenamientos_asignados(id_ejercicio);
CREATE INDEX IF NOT EXISTS idx_entrenamientos_fecha ON entrenamientos_asignados(fecha_entrenamiento);
CREATE INDEX IF NOT EXISTS idx_entrenamientos_estado ON entrenamientos_asignados(estado);
CREATE INDEX IF NOT EXISTS idx_entrenamientos_updated_at ON entrenamientos_asignados(updated_at);

-- =====================================================
-- CREAR TRIGGER PARA ACTUALIZAR updated_at
-- =====================================================
CREATE TRIGGER update_entrenamientos_asignados_timestamp 
    AFTER UPDATE ON entrenamientos_asignados
BEGIN
    UPDATE entrenamientos_asignados SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;


-- =====================================================
-- TABLA: ENTRENAMIENTOS_REALIZADOS (Registro de actividad completada)
-- =====================================================

-- Eliminar tabla entrenamientos_realizados si existe (para recrearla)
DROP TABLE IF EXISTS entrenamientos_realizados;

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS update_entrenamientos_realizados_timestamp;

-- =====================================================
-- CREAR TABLA ENTRENAMIENTOS_REALIZADOS
-- =====================================================
CREATE TABLE IF NOT EXISTS entrenamientos_realizados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_cliente INTEGER NOT NULL,
    id_ejercicio INTEGER NOT NULL,
    id_entrenamiento_asignado INTEGER, -- NULL si es actividad libre, FK si viene de plan
    fecha_realizacion DATE NOT NULL,
    hora_inicio TIME,
    hora_fin TIME,
    series_realizadas INTEGER NOT NULL CHECK (series_realizadas > 0),
    repeticiones INTEGER CHECK (repeticiones > 0),
    peso_kg DECIMAL(5,2) CHECK (peso_kg >= 0),
    tiempo_segundos INTEGER CHECK (tiempo_segundos > 0),
    distancia_metros DECIMAL(8,2) CHECK (distancia_metros > 0),
    notas TEXT,
    valoracion INTEGER CHECK (valoracion >= 1 AND valoracion <= 5), -- 1-5 estrellas
    tipo_registro VARCHAR(20) DEFAULT 'libre' CHECK (tipo_registro IN ('libre', 'planificado')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Claves foráneas
    FOREIGN KEY (id_cliente) REFERENCES clientes(id) ON DELETE CASCADE,
    FOREIGN KEY (id_ejercicio) REFERENCES ejercicios(id) ON DELETE RESTRICT,
    FOREIGN KEY (id_entrenamiento_asignado) REFERENCES entrenamientos_asignados(id) ON DELETE SET NULL
);

-- =====================================================
-- CREAR INDICES PARA OPTIMIZAR CONSULTAS
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_entrenamientos_realizados_cliente ON entrenamientos_realizados(id_cliente);
CREATE INDEX IF NOT EXISTS idx_entrenamientos_realizados_ejercicio ON entrenamientos_realizados(id_ejercicio);
CREATE INDEX IF NOT EXISTS idx_entrenamientos_realizados_fecha ON entrenamientos_realizados(fecha_realizacion);
CREATE INDEX IF NOT EXISTS idx_entrenamientos_realizados_asignado ON entrenamientos_realizados(id_entrenamiento_asignado);
CREATE INDEX IF NOT EXISTS idx_entrenamientos_realizados_tipo ON entrenamientos_realizados(tipo_registro);
CREATE INDEX IF NOT EXISTS idx_entrenamientos_realizados_updated_at ON entrenamientos_realizados(updated_at);

-- =====================================================
-- CREAR TRIGGER PARA ACTUALIZAR updated_at
-- =====================================================
CREATE TRIGGER update_entrenamientos_realizados_timestamp 
    AFTER UPDATE ON entrenamientos_realizados
BEGIN
    UPDATE entrenamientos_realizados SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- =====================================================
-- TRIGGER PARA ACTUALIZAR ESTADO DE ENTRENAMIENTO ASIGNADO
-- =====================================================
CREATE TRIGGER update_entrenamiento_asignado_completado
    AFTER INSERT ON entrenamientos_realizados
    WHEN NEW.id_entrenamiento_asignado IS NOT NULL
BEGIN
    UPDATE entrenamientos_asignados 
    SET estado = 'completado', updated_at = CURRENT_TIMESTAMP 
    WHERE id = NEW.id_entrenamiento_asignado;
END;

