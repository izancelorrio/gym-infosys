from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import bcrypt
import uuid
import smtplib
from email.mime.text import MIMEText
from datetime import datetime, timedelta
import socket
import os
import psycopg2

# Configuración del entorno
# Cambia esta URL según tu entorno: desarrollo local o producción
FRONTEND_BASE_URL = "http://localhost:3000"  # Para desarrollo local
# FRONTEND_BASE_URL = "https://v0-gym-landing-page-steel.vercel.app"  # Para producción

app = FastAPI()

# Configuración de CORS para desarrollo local y Docker
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://192.168.0.201:3000",   # Frontend en Docker
        "http://frontend:3000",        # Nombre del servicio en Docker
        "http://192.168.0.201:8000",   # Backend en Docker
        "http://api:8000",             # Nombre del servicio de API en Docker
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

def print_server_ip():
    try:
        hostname = socket.gethostname()
        local_ip = socket.gethostbyname(hostname)
        print(f"API iniciada. Accede en: http://{local_ip}:8000")
    except Exception as e:
        print("No se pudo determinar la IP local:", e)

print_server_ip()

@app.get("/health")
def health_check():
    """Simple health check endpoint that doesn't depend on database"""
    return {"status": "ok", "message": "API is running"}

# ----------------------------------------------------
# RESUMEN DE ENDPOINTS DE ESTE FICHERO
# ----------------------------------------------------
# POST   /login              - Login de usuario
# POST   /register           - Registro de usuario
# POST   /change-password    - Cambiar contraseña (requiere email y contraseña actual)
# POST   /send-reset-email   - Enviar email de recuperación de contraseña
# POST   /reset-password     - Cambiar contraseña usando token de recuperación
# GET    /count-members      - Obtener número total de usuarios registrados
# POST   /verify-email       - Verificar email de usuario mediante token
# GET    /planes             - Obtener todos los planes disponibles
# GET    /planes/{id}        - Obtener plan específico por ID
# POST   /contract-plan      - Contratar plan (cambia rol usuario -> cliente, independiente del plan)
# GET    /admin/users        - Obtener todos los usuarios (solo admin)
# GET    /admin/users/{id}   - Obtener usuario específico por ID (solo admin)
# PUT    /admin/users/{id}   - Actualizar usuario específico (solo admin)
# GET    /gym-clases         - Obtener todos los tipos de clases activas del gimnasio
# GET    /entrenadores       - Obtener todos los usuarios con rol de entrenador
# GET    /clases-programadas - Obtener todas las clases programadas activas
# POST   /clases-programadas - Guardar múltiples clases programadas en el calendario
# ----------------------------------------------------

def get_db_connection():
    """Obtiene la conexión a la base de datos PostgreSQL"""
    
    # Conexión SQLite (comentada)
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    db_path = os.path.join(project_root, "users.db")
    return sqlite3.connect(db_path)
    """
    
    # Preferir DATABASE_URL si está presente (forma estándar para containers)
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        try:
            print(f"[DEBUG] Connecting to Postgres using DATABASE_URL")
            return psycopg2.connect(database_url)
        except Exception as e:
            print(f"[ERROR] Failed to connect using DATABASE_URL: {e}")

    # Fallback: usar variables individuales o valores por defecto
    host = os.getenv("DB_HOST")
    if not host:
        raise RuntimeError("DB_HOST environment variable must be set")
    port = os.getenv("DB_PORT", "5432")
    database = os.getenv("DB_NAME", "infosis_db")
    user = os.getenv("DB_USER", "icelorrio")
    password = os.getenv("DB_PASS", "y^FL^@2KDqDv%H&x")
    try:
        print(f"[DEBUG] Connecting to Postgres at {host}:{port}, db={database}, user={user}")
        return psycopg2.connect(host=host, port=port, database=database, user=user, password=password)
    except Exception as e:
        print(f"[ERROR] Failed to connect to Postgres at {host}:{port} db={database} user={user}: {e}")
        raise

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))



class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class ChangePasswordRequest(BaseModel):
    email: str
    current_password: str
    new_password: str

class SendResetEmailRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    newPassword: str

class VerifyEmailRequest(BaseModel):
    token: str

class ContractPlanRequest(BaseModel):
    user_id: int
    plan_id: int
    dni: str
    numero_telefono: str
    fecha_nacimiento: str
    genero: str
    num_tarjeta: str
    fecha_tarjeta: str
    cvv: str

class UpdateUserRequest(BaseModel):
    name: str
    email: str
    role: str
    # Campos opcionales para clientes
    dni: str = None
    numero_telefono: str = None
    fecha_nacimiento: str = None
    genero: str = None
    num_tarjeta: str = None
    fecha_tarjeta: str = None
    cvv: str = None
    plan_id: int = None
    crear_cliente: bool = None

class ClaseProgramadaRequest(BaseModel):
    fecha: str
    hora: str
    idClase: int  # Cambiado de tipoClase a idClase
    instructor: str

class GuardarClasesRequest(BaseModel):
    clases: list[ClaseProgramadaRequest]

class CrearReservaRequest(BaseModel):
    id_cliente: int
    id_clase_programada: int

class CancelarReservaRequest(BaseModel):
    id_reserva: int

def send_reset_email(to_email: str, reset_link: str):
    # Configura estos valores según tu servidor SMTP
    SMTP_SERVER = "smtp.gmail.com"
    SMTP_PORT = 587
    SMTP_USER = "izan.celorrio.caballero@gmail.com"
    SMTP_PASS = "eksd jgro hfyw hkgq"
    FROM_EMAIL = SMTP_USER

    subject = "Recuperación de contraseña"
    body = f"Haz clic en el siguiente enlace para restablecer tu contraseña:\n\n{reset_link}\n\nEste enlace es válido por 1 hora."
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = FROM_EMAIL
    msg["To"] = to_email

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.sendmail(FROM_EMAIL, [to_email], msg.as_string())

def send_verification_email(to_email: str, verify_link: str):
    SMTP_SERVER = "smtp.gmail.com"
    SMTP_PORT = 587
    SMTP_USER = "izan.celorrio.caballero@gmail.com"
    SMTP_PASS = "eksd jgro hfyw hkgq"
    FROM_EMAIL = SMTP_USER

    subject = "Verifica tu correo electrónico"
    body = f"Haz clic en el siguiente enlace para verificar tu correo:\n\n{verify_link}\n\nEste enlace es válido por 24 horas."
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = FROM_EMAIL
    msg["To"] = to_email

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.sendmail(FROM_EMAIL, [to_email], msg.as_string())

@app.middleware("http")
async def log_request_body(request: Request, call_next):
    body = await request.body()
    # Imprime la IP, método, ruta y cuerpo recibido
    print(f"INFO: {request.client.host} - \"{request.method} {request.url.path}\" Body: {body.decode('utf-8')}")
    response = await call_next(request)
    return response

## Endpoint para iniciar sesión de usuario
@app.post("/login")
def login(req: LoginRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    # Intento de obtener el usuario por email
    try:
        cursor.execute("SELECT id, name, email, password, email_verified, role FROM users WHERE email=%s", (req.email,))
        user = cursor.fetchone()
        print(f"[DEBUG] /login - queried email={req.email} -> result={'FOUND' if user else 'NOT_FOUND'}")
        if user:
            # No imprimir el password directamente en logs en producción; aquí es solo debug local
            masked_pw = user[3][:6] + '...' if user[3] else None
            print(f"[DEBUG] /login - user row id={user[0]} email={user[2]} password_preview={masked_pw} email_verified={user[4]} role={user[5]}")
    except Exception as e:
        print(f"[ERROR] /login - DB query failed for email={req.email}: {e}")
        conn.close()
        raise HTTPException(status_code=500, detail="Error interno al consultar usuario")
    
    if user and verify_password(req.password, user[3]):
        if not user[4]:
            print(f"[INFO] /login - user {user[2]} attempted login but email not verified")
            conn.close()
            raise HTTPException(status_code=403, detail="Debes verificar tu email antes de iniciar sesión")
        
        user_data = {"id": user[0], "email": user[2], "name": user[1], "role": user[5]}
        
        # Si es un cliente, cargar también sus datos específicos
        if user[5] == "cliente":
            cursor.execute("""
                SELECT id, dni, numero_telefono, plan_id, fecha_nacimiento, genero, 
                       num_tarjeta, fecha_tarjeta, cvv, fecha_inscripcion, estado 
                FROM clientes WHERE id_usuario = %s
            """, (user[0],))
            cliente_data = cursor.fetchone()
            
            if cliente_data:
                user_data["cliente"] = {
                    "id": cliente_data[0],
                    "dni": cliente_data[1],
                    "numero_telefono": cliente_data[2],
                    "plan_id": cliente_data[3],
                    "fecha_nacimiento": cliente_data[4],
                    "genero": cliente_data[5],
                    "num_tarjeta": cliente_data[6],
                    "fecha_tarjeta": cliente_data[7],
                    "cvv": cliente_data[8],
                    "fecha_inscripcion": cliente_data[9],
                    "estado": cliente_data[10]
                }
        
        conn.close()
        
        response = {
            "success": True,
            "message": "Login exitoso",
            "user": user_data
        }
        print("[DEBUG] Login response:", response)
        return response
    else:
        # Log específico para distinguir user-not-found vs bad-password
        if not user:
            print(f"[WARN] /login - no user found for email={req.email}")
        else:
            print(f"[WARN] /login - password mismatch for user id={user[0]} email={user[2]}")
        conn.close()
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

## Endpoint para registrar un nuevo usuario
@app.post("/register")
def register(req: RegisterRequest):
    print(f"[DEBUG] Intentando registrar usuario: {req.email}")
    conn = get_db_connection()
    cursor = conn.cursor()
    hashed_pw = hash_password(req.password)
    try:
        cursor.execute(
            "INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
            (req.name, req.email, hashed_pw, "usuario")
        )
        conn.commit()
        user_id = cursor.lastrowid
        print(f"[DEBUG] Usuario registrado con id: {user_id}")
        
        # Generar token de verificación y enviar email
        token = str(uuid.uuid4())
        expires_at = (datetime.utcnow() + timedelta(hours=24)).isoformat()
        cursor.execute(
            "INSERT INTO email_verifications (user_id, token, expires_at) VALUES (%s, %s, %s)",
            (user_id, token, expires_at)
        )
        conn.commit()
        
        verify_link = f"{FRONTEND_BASE_URL}/verify-email?token={token}"
        print(f"[DEBUG] Link de verificación generado: {verify_link}")
        
        try:
            send_verification_email(req.email, verify_link)
            print("[DEBUG] Email de verificación enviado correctamente")
        except Exception as e:
            print("[DEBUG] Error enviando email de verificación:", e)
            print("[DEBUG] Link de verificación (solo debug):", verify_link)
            
    except sqlite3.IntegrityError as e:
        print(f"[DEBUG] Error de integridad en la base de datos: {e}")
        print(f"[DEBUG] Email que causó el error: {req.email}")
        conn.close()
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    except Exception as e:
        print(f"[DEBUG] Error inesperado durante el registro: {e}")
        conn.close()
        raise HTTPException(status_code=500, detail="Error interno del servidor")
        
    conn.close()
    return {
        "success": True,
        "message": "Usuario registrado exitosamente. Revisa tu correo para verificar tu email.",
        "user": {
            "id": user_id,
            "name": req.name,
            "email": req.email,
            "role": "usuario"
        }
    }

## Endpoint para cambiar la contraseña de un usuario
@app.post("/change-password")
def change_password(req: ChangePasswordRequest):
    if not req.email or not req.current_password or not req.new_password:
        raise HTTPException(status_code=400, detail="Todos los campos son requeridos")
    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="La nueva contraseña debe tener al menos 6 caracteres")
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, password FROM users WHERE email=%s", (req.email,))
    user = cursor.fetchone()
    if not user or not verify_password(req.current_password, user[1]):
        conn.close()
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    hashed_new = hash_password(req.new_password)
    cursor.execute("UPDATE users SET password=%s WHERE id=%s", (hashed_new, user[0]))
    conn.commit()
    conn.close()
    return {
        "success": True,
        "message": "Contraseña cambiada exitosamente"
    }

## Endpoint para enviar email de recuperación de contraseña
@app.post("/send-reset-email")
def send_reset_email_endpoint(req: SendResetEmailRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE email=%s", (req.email,))
    user = cursor.fetchone()
    if not user:
        conn.close()
        return {"success": True, "message": "Email de recuperación enviado"}
    user_id = user[0]
    token = str(uuid.uuid4())
    expires_at = (datetime.utcnow() + timedelta(hours=1)).isoformat()
    cursor.execute("INSERT INTO reset_tokens (user_id, token, expires_at) VALUES (%s, %s, %s)", (user_id, token, expires_at))
    conn.commit()
    conn.close()    
    reset_link = f"{FRONTEND_BASE_URL}/reset-password?token={token}"
    try:
        send_reset_email(req.email, reset_link)
    except Exception as e:
        print("[DEBUG] Error enviando email:", e)
        print("[DEBUG] Link de recuperación (solo debug):", reset_link)
    return {"success": True, "message": "Email de recuperación enviado"}

## Endpoint para restablecer la contraseña usando un token
@app.post("/reset-password")
def reset_password(req: ResetPasswordRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT user_id, expires_at FROM reset_tokens WHERE token =%s", (req.token,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=400, detail="Token inválido")
    user_id, expires_at = row
    if datetime.utcnow() > datetime.fromisoformat(expires_at):
        cursor.execute("DELETE FROM reset_tokens WHERE token=%s", (req.token,))
        conn.commit()
        conn.close()
        raise HTTPException(status_code=400, detail="Token expirado")
    # Actualizar contraseña
    hashed_pw = hash_password(req.newPassword)
    cursor.execute("UPDATE users SET password=%s WHERE id=%s", (hashed_pw, user_id))
    cursor.execute("DELETE FROM reset_tokens WHERE token=%s", (req.token,))
    conn.commit()
    conn.close()
    return {"success": True, "message": "Contraseña actualizada correctamente"}

## Endpoint para verificar el email del usuario
@app.post("/verify-email")
def verify_email(req: VerifyEmailRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT user_id, expires_at FROM email_verifications WHERE token=%s", (req.token,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=400, detail="Token inválido")
    user_id, expires_at = row
    if datetime.utcnow() > datetime.fromisoformat(expires_at):
        cursor.execute("DELETE FROM email_verifications WHERE token=%s", (req.token,))
        conn.commit()
        conn.close()
        raise HTTPException(status_code=400, detail="Token expirado")
    # Marcar email como verificado
    cursor.execute("UPDATE users SET email_verified=1 WHERE id%s", (user_id,))
    cursor.execute("DELETE FROM email_verifications WHERE token=%s", (req.token,))
    conn.commit()
    conn.close()
    return {"success": True, "message": "Email verificado correctamente"}

## Endpoint para obtener el número total de usuarios registrados
@app.get("/count-members")
def count_members():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'cliente'")
    count = cursor.fetchone()[0]
    conn.close()
    return {"count": count}

@app.get("/count-trainers")
def count_trainers():
    """Obtener el número total de entrenadores activos"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'entrenador'")
        count = cursor.fetchone()[0]
        conn.close()
        return {"count": count}
    except Exception as e:
        print(f"[ERROR] Error al contar entrenadores: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al obtener el conteo de entrenadores: {str(e)}")

## Endpoints para planes
@app.get("/planes")
def get_planes():
    """Obtener todos los planes activos"""
    try:
        print("[DEBUG] Iniciando consulta de planes")
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, nombre, precio_mensual, acceso_entrenador, activo
            FROM planes 
            WHERE activo = 1 
            ORDER BY id ASC
        """)
        
        planes = []
        for row in cursor.fetchall():
            plan = {
                "id": row[0],
                "nombre": row[1],
                "precio_mensual": float(row[2]) if row[2] is not None else 0.0,
                "acceso_entrenador": bool(row[3]),
                "activo": bool(row[4]),
                # Campos opcionales con valores por defecto
                "descripcion": "",
                "caracteristicas": [],
                "color_tema": "#000000",
                "orden_display": 0,
                "created_at": None,
                "updated_at": None,
                # Campos de compatibilidad con el frontend
                "precio_anual": None,
                "duracion_meses": 1,
                "limite_clases": None,
                "acceso_nutricionista": row[1].lower() in ['estándar', 'premium'],
                "acceso_entrenador_personal": bool(row[3]),
                "acceso_areas_premium": bool(row[3]),
                "popular": row[1].lower() == 'estándar'
            }
            planes.append(plan)
        
        conn.close()
        print("[DEBUG] Planes encontrados:", planes)
        return {"planes": planes}
        
    except Exception as e:
        print("[ERROR] Error al obtener planes:", str(e))
        if 'conn' in locals():
            conn.close()
        raise HTTPException(status_code=500, detail=f"Error al obtener planes: {str(e)}")

@app.get("/planes/{plan_id}")
def get_plan_by_id(plan_id: int):
    """Obtener un plan específico por ID"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, nombre, descripcion, precio_mensual, caracteristicas, 
                   acceso_entrenador, activo, color_tema, orden_display, 
                   created_at, updated_at
            FROM planes 
            WHERE id =%s AND activo = 1
        """, (plan_id,))
        
        row = cursor.fetchone()
        if not row:
            conn.close()
            raise HTTPException(status_code=404, detail="Plan no encontrado")
        
        # Parsear características JSON
        import json
        try:
            caracteristicas = json.loads(row[4])
        except:
            caracteristicas = []
        
            plan = {
                "id": row[0],
                "nombre": row[1],
                "precio_mensual": float(row[2]) if row[2] is not None else 0.0,
                "acceso_entrenador": bool(row[3]),
                "activo": bool(row[4]),
                # Campos opcionales con valores por defecto
                "descripcion": "",
                "caracteristicas": [],
                "color_tema": "#000000",
                "orden_display": 0,
                "created_at": None,
                "updated_at": None,
                # Campos de compatibilidad con el frontend
                "precio_anual": None,
                "duracion_meses": 1,
                "limite_clases": None,
                "acceso_nutricionista": row[1].lower() in ['estándar', 'premium'],
                "acceso_entrenador_personal": bool(row[3]),
                "acceso_areas_premium": bool(row[3]),
                "popular": row[1].lower() == 'estándar'
            }
        conn.close()
        return plan
        
    except HTTPException:
        raise
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Error al obtener plan: {str(e)}")

## Endpoint para contratar un plan
@app.post("/contract-plan")
def contract_plan(req: ContractPlanRequest):
    print(f"[DEBUG] Usuario {req.user_id} contratando plan {req.plan_id}")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # 1. Verificar que el usuario existe y tiene rol 'usuario'
        cursor.execute("SELECT id, name, email, role FROM users WHERE id =%s", (req.user_id,))
        user = cursor.fetchone()
        
        if not user:
            conn.close()
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        if user[3] != "usuario":
            conn.close()
            raise HTTPException(status_code=400, detail="Solo los usuarios pueden contratar planes")
        
        # 2. Verificar que el plan existe y obtener información del acceso_entrenador
        cursor.execute("SELECT id, nombre, acceso_entrenador FROM planes WHERE id =%s AND activo = 1", (req.plan_id,))
        plan = cursor.fetchone()
        
        if not plan:
            conn.close()
            raise HTTPException(status_code=404, detail="Plan no encontrado o inactivo")
        
        # 3. Todos los usuarios que contratan un plan se convierten en 'cliente'
        # La diferencia está en el campo acceso_entrenador del plan, no en el rol del usuario
        nuevo_rol = "cliente"
        
        # 4. Actualizar el rol del usuario a cliente
        cursor.execute("UPDATE users SET role =%s WHERE id =%s", (nuevo_rol, req.user_id,))
        
        # 4. Crear registro en la tabla clientes
        cursor.execute("""
            INSERT INTO clientes (
                id_usuario, dni, numero_telefono, plan_id, fecha_nacimiento, 
                genero, num_tarjeta, fecha_tarjeta, cvv, fecha_inscripcion, estado
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP, 'activo')
        """, (
            req.user_id, req.dni, req.numero_telefono, req.plan_id,
            req.fecha_nacimiento, req.genero, req.num_tarjeta, 
            req.fecha_tarjeta, req.cvv
        ))
        
        # 5. Obtener el ID del cliente recién creado
        cliente_id = cursor.lastrowid
        
        conn.commit()
        
        # 6. Obtener los datos completos del usuario actualizado (incluyendo datos de cliente)
        cursor.execute("""
            SELECT id, dni, numero_telefono, plan_id, fecha_nacimiento, genero, 
                   num_tarjeta, fecha_tarjeta, cvv, fecha_inscripcion, estado 
            FROM clientes WHERE id =%s
        """, (cliente_id,))
        cliente_data = cursor.fetchone()
        
        conn.close()
        
        # 7. Retornar datos actualizados del usuario con el rol correcto
        updated_user = {
            "id": user[0],
            "name": user[1],
            "email": user[2],
            "role": nuevo_rol,  # Usar el rol determinado por el plan
            "cliente": {
                "id": cliente_data[0],
                "dni": cliente_data[1],
                "numero_telefono": cliente_data[2],
                "plan_id": cliente_data[3],
                "fecha_nacimiento": cliente_data[4],
                "genero": cliente_data[5],
                "num_tarjeta": cliente_data[6],
                "fecha_tarjeta": cliente_data[7],
                "cvv": cliente_data[8],
                "fecha_inscripcion": cliente_data[9],
                "estado": cliente_data[10]
            }
        }
        
        return {
            "success": True,
            "message": f"Plan {plan[1]} contratado exitosamente. Rol asignado: {nuevo_rol}",
            "user": updated_user
        }
        
    except HTTPException:
        conn.close()
        raise
    except Exception as e:
        conn.close()
        print(f"[ERROR] Error al contratar plan: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al contratar plan: {str(e)}")

## Endpoint para obtener todos los usuarios (solo para administradores)
@app.get("/admin/users")
def get_all_users(response: Response):
    print("[DEBUG] Obteniendo todos los usuarios para administración")
    
    # Agregar headers anti-cache
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Obtener todos los usuarios con información básica
        cursor.execute("""
            SELECT id, name, email, role, email_verified, created_at, updated_at
            FROM users 
            ORDER BY id ASC
        """)
        users_data = cursor.fetchall()
        
        users_list = []
        
        for user_row in users_data:
            user_info = {
                "id": user_row[0],
                "name": user_row[1],
                "email": user_row[2],
                "role": user_row[3],
                "email_verified": bool(user_row[4]),
                "created_at": user_row[5],
                "updated_at": user_row[6],
                "cliente": None
            }
            
            # Si es un cliente, obtener datos adicionales de la tabla clientes
            if user_row[3] == "cliente":
                cursor.execute("""
                    SELECT id, dni, numero_telefono, plan_id, fecha_nacimiento, genero, 
                           fecha_inscripcion, estado, created_at, updated_at
                    FROM clientes 
                    WHERE id_usuario = %s
                """, (user_row[0],))
                cliente_data = cursor.fetchone()
                
                if cliente_data:
                    # Obtener nombre del plan
                    cursor.execute("SELECT nombre FROM planes WHERE id = %s", (cliente_data[3],))
                    plan_data = cursor.fetchone()
                    plan_name = plan_data[0] if plan_data else "Sin plan"
                    
                    user_info["cliente"] = {
                        "id": cliente_data[0],
                        "dni": cliente_data[1],
                        "numero_telefono": cliente_data[2],
                        "plan_id": cliente_data[3],
                        "plan_name": plan_name,
                        "fecha_nacimiento": cliente_data[4],
                        "genero": cliente_data[5],
                        "fecha_inscripcion": cliente_data[6],
                        "estado": cliente_data[7],
                        "created_at": cliente_data[8],
                        "updated_at": cliente_data[9]
                    }
            
            users_list.append(user_info)
        
        # Calcular estadísticas
        stats = {
            "total": len(users_list),
            "admin": len([u for u in users_list if u["role"] == "admin"]),
            "entrenador": len([u for u in users_list if u["role"] == "entrenador"]),
            "cliente": len([u for u in users_list if u["role"] == "cliente"]),
            "usuario": len([u for u in users_list if u["role"] == "usuario"]),
            "verified": len([u for u in users_list if u["email_verified"]]),
            "unverified": len([u for u in users_list if not u["email_verified"]])
        }
        
        conn.close()
        
        return {
            "success": True,
            "users": users_list,
            "stats": stats
        }
        
    except Exception as e:
        conn.close()
        print(f"[ERROR] Error al obtener usuarios: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al obtener usuarios: {str(e)}")

## Endpoint para obtener un usuario específico por ID (solo para administradores)
@app.get("/admin/users/{user_id}")
def get_user_by_id(user_id: int, response: Response):
    print(f"[DEBUG] Obteniendo usuario con ID: {user_id}")
    
    # Agregar headers anti-cache
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Obtener usuario específico
        cursor.execute("""
            SELECT id, name, email, role, email_verified, created_at, updated_at
            FROM users 
            WHERE id = %s
        """, (user_id,))
        user_data = cursor.fetchone()
        
        if not user_data:
            conn.close()
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        user_info = {
            "id": user_data[0],
            "name": user_data[1],
            "email": user_data[2],
            "role": user_data[3],
            "email_verified": bool(user_data[4]),
            "created_at": user_data[5],
            "updated_at": user_data[6],
            "cliente": None
        }
        
        # Si es un cliente, obtener datos adicionales
        if user_data[3] == "cliente":
            cursor.execute("""
                SELECT id, dni, numero_telefono, plan_id, fecha_nacimiento, genero, 
                       fecha_inscripcion, estado, created_at, updated_at,
                       num_tarjeta, fecha_tarjeta, cvv
                FROM clientes 
                WHERE id_usuario = %s
            """, (user_id,))
            cliente_data = cursor.fetchone()
            
            if cliente_data:
                # Obtener nombre del plan
                cursor.execute("SELECT nombre FROM planes WHERE id = %s", (cliente_data[3],))
                plan_data = cursor.fetchone()
                plan_name = plan_data[0] if plan_data else "Sin plan"
                
                user_info["cliente"] = {
                    "id": cliente_data[0],
                    "dni": cliente_data[1],
                    "numero_telefono": cliente_data[2],
                    "plan_id": cliente_data[3],
                    "plan_name": plan_name,
                    "fecha_nacimiento": cliente_data[4],
                    "genero": cliente_data[5],
                    "fecha_inscripcion": cliente_data[6],
                    "estado": cliente_data[7],
                    "created_at": cliente_data[8],
                    "updated_at": cliente_data[9],
                    "num_tarjeta": cliente_data[10],
                    "fecha_tarjeta": cliente_data[11],
                    "cvv": cliente_data[12]
                }
        
        conn.close()
        
        return {
            "success": True,
            "user": user_info
        }
        
    except HTTPException:
        conn.close()
        raise
    except Exception as e:
        conn.close()
        print(f"[ERROR] Error al obtener usuario: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al obtener usuario: {str(e)}")

## Endpoint para actualizar un usuario específico (solo para administradores)
@app.put("/admin/users/{user_id}")
def update_user(user_id: int, req: UpdateUserRequest, response: Response):
    print(f"[DEBUG] Actualizando usuario con ID: {user_id}")
    
    # Agregar headers anti-cache
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Verificar que el usuario existe
        cursor.execute("SELECT id, role FROM users WHERE id = %s", (user_id,))
        user_data = cursor.fetchone()
        
        if not user_data:
            conn.close()
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        current_role = user_data[1]
        
        # Si está cambiando de usuario a cliente y se va a crear un nuevo cliente
        if current_role == "usuario" and req.role == "cliente" and req.crear_cliente:
            required_fields = [
                (req.dni, "DNI"),
                (req.plan_id, "Plan"),
                (req.fecha_nacimiento, "Fecha de nacimiento"),
                (req.genero, "Género"),
                (req.numero_telefono, "Número de teléfono")
            ]

            for value, field_name in required_fields:
                if not value:
                    raise HTTPException(status_code=400, detail=f"El {field_name} es obligatorio para crear un cliente")
            
            # Verificar que el DNI no esté ya registrado
            cursor.execute("SELECT id FROM clientes WHERE dni = %s", (req.dni,))
            if cursor.fetchone():
                raise HTTPException(status_code=400, detail="El DNI ya está registrado")
            
            # Verificar que el plan existe
            cursor.execute("SELECT id FROM planes WHERE id = %s AND activo = 1", (req.plan_id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=400, detail="El plan seleccionado no existe o no está activo")
        
        # Si está cambiando de cliente a usuario, eliminar el registro de cliente
        if current_role == "cliente" and req.role == "usuario":
            # Primero verificar si hay reservas activas
            cursor.execute("""
                SELECT COUNT(*) FROM reservas r
                JOIN clientes c ON r.id_cliente = c.id
                WHERE c.id_usuario = %s AND r.estado = 'activa'
            """, (user_id,))
            reservas_activas = cursor.fetchone()[0]
            
            if reservas_activas > 0:
                raise HTTPException(
                    status_code=400, 
                    detail="No se puede cambiar el rol a usuario porque tiene reservas activas"
                )
            
            # Eliminar el registro de cliente (las reservas se eliminarán en cascada)
            cursor.execute("DELETE FROM clientes WHERE id_usuario = %s", (user_id,))
        
        # Actualizar datos básicos del usuario
        cursor.execute("""
            UPDATE users 
            SET name = %s, email = %s, role = %s
            WHERE id = %s
        """, (req.name, req.email, req.role, user_id))
        
        # Si el usuario se convierte en cliente o ya es cliente y hay datos para actualizar
        if req.role == "cliente":
            # Verificar si ya existe un registro de cliente
            cursor.execute("SELECT id FROM clientes WHERE id_usuario = %s", (user_id,))
            cliente_exists = cursor.fetchone()
            
            if cliente_exists and any([req.dni, req.numero_telefono, req.fecha_nacimiento, req.genero]):
                # Actualizar datos existentes del cliente
                update_fields = []
                update_values = []
                
                if req.dni:
                    update_fields.append("dni = %s")
                    update_values.append(req.dni)
                
                if req.numero_telefono:
                    update_fields.append("numero_telefono = %s")
                    update_values.append(req.numero_telefono)
                
                if req.fecha_nacimiento:
                    update_fields.append("fecha_nacimiento = %s")
                    update_values.append(req.fecha_nacimiento)
                
                if req.genero:
                    update_fields.append("genero = %s")
                    update_values.append(req.genero)
                
                if req.num_tarjeta:
                    update_fields.append("num_tarjeta = %s")
                    update_values.append(req.num_tarjeta)
                
                if req.fecha_tarjeta:
                    update_fields.append("fecha_tarjeta = %s")
                    update_values.append(req.fecha_tarjeta)
                
                if req.cvv:
                    update_fields.append("cvv = %s")
                    update_values.append(req.cvv)
                
                if update_fields:
                    update_fields.append("updated_at = CURRENT_TIMESTAMP")
                    update_values.append(user_id)
                    
                    update_query = f"UPDATE clientes SET {', '.join(update_fields)} WHERE id_usuario = %s"
                    cursor.execute(update_query, update_values)
            elif not cliente_exists and req.crear_cliente:
                # Crear nuevo registro de cliente
                cursor.execute("""
                    INSERT INTO clientes (
                        id_usuario, dni, numero_telefono, fecha_nacimiento, genero,
                        num_tarjeta, fecha_tarjeta, cvv, plan_id,
                        fecha_inscripcion, estado
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_DATE, 'activo'
                    )
                """, (
                    user_id,
                    req.dni,
                    req.numero_telefono or None,
                    req.fecha_nacimiento or None,
                    req.genero or None,
                    req.num_tarjeta or None,
                    req.fecha_tarjeta or None,
                    req.cvv or None,
                    req.plan_id
                ))
        
        conn.commit()
        print(f"[DEBUG] Datos actualizados en BD para usuario {user_id}")
        
        # Obtener los datos actualizados del usuario
        cursor.execute("""
            SELECT id, name, email, role, email_verified, created_at, updated_at
            FROM users 
            WHERE id = %s
        """, (user_id,))
        updated_user_data = cursor.fetchone()
        print(f"[DEBUG] Datos leídos de users: {updated_user_data}")
        
        updated_user_info = {
            "id": updated_user_data[0],
            "name": updated_user_data[1],
            "email": updated_user_data[2],
            "role": updated_user_data[3],
            "email_verified": bool(updated_user_data[4]),
            "created_at": updated_user_data[5],
            "updated_at": updated_user_data[6],
            "cliente": None
        }
        print(f"[DEBUG] Usuario info construido: {updated_user_info}")
        
        # Si es cliente, obtener datos actualizados del cliente
        if updated_user_data[3] == "cliente":
            cursor.execute("""
                SELECT id, dni, numero_telefono, plan_id, fecha_nacimiento, genero, 
                       fecha_inscripcion, estado, created_at, updated_at,
                       num_tarjeta, fecha_tarjeta, cvv
                FROM clientes 
                WHERE id_usuario = %s
            """, (user_id,))
            cliente_data = cursor.fetchone()
            
            if cliente_data:
                # Obtener nombre del plan
                cursor.execute("SELECT nombre FROM planes WHERE id = %s", (cliente_data[3],))
                plan_data = cursor.fetchone()
                plan_name = plan_data[0] if plan_data else "Sin plan"
                
                updated_user_info["cliente"] = {
                    "id": cliente_data[0],
                    "dni": cliente_data[1],
                    "numero_telefono": cliente_data[2],
                    "plan_id": cliente_data[3],
                    "plan_name": plan_name,
                    "fecha_nacimiento": cliente_data[4],
                    "genero": cliente_data[5],
                    "fecha_inscripcion": cliente_data[6],
                    "estado": cliente_data[7],
                    "created_at": cliente_data[8],
                    "updated_at": cliente_data[9],
                    "num_tarjeta": cliente_data[10],
                    "fecha_tarjeta": cliente_data[11],
                    "cvv": cliente_data[12]
                }
        
        conn.close()
        
        print(f"[DEBUG] Respuesta final del PUT: usuario = {updated_user_info}")
        
        return {
            "success": True,
            "message": "Usuario actualizado correctamente",
            "user": updated_user_info
        }
        
    except HTTPException:
        conn.close()
        raise
    except Exception as e:
        conn.close()
        print(f"[ERROR] Error al actualizar usuario: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al actualizar usuario: {str(e)}")

# ----------------------------------------------------
# ENDPOINTS DE TIPOS DE CLASES GIMNASIO
# ----------------------------------------------------

@app.get("/gym-clases")
async def get_gym_clases(response: Response):
    """
    Obtener todos los tipos de clases activas del gimnasio
    """
    # Headers anti-cache
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache" 
    response.headers["Expires"] = "0"
    
    try:
        print(f"[DEBUG] Obteniendo tipos de clases del gimnasio...")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Obtener todos los tipos de clases activas
        cursor.execute("""
            SELECT id, nombre, descripcion, duracion_minutos, nivel, max_participantes, 
                   created_at, updated_at, color
            FROM gym_clases 
            WHERE activo = 1 
            ORDER BY nombre
        """)
        
        clases = cursor.fetchall()
        conn.close()
        
        # Formatear los datos
        gym_clases = []
        for clase in clases:
            gym_clases.append({
                "id": clase[0],
                "nombre": clase[1], 
                "descripcion": clase[2],
                "duracion_minutos": clase[3],
                "nivel": clase[4],
                "max_participantes": clase[5],
                "created_at": clase[6],
                "updated_at": clase[7],
                "color": clase[8]
            })
        
        print(f"[DEBUG] Se encontraron {len(gym_clases)} tipos de clases activas")
        
        return gym_clases
        
    except Exception as e:
        print(f"[ERROR] Error al obtener tipos de clases: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al obtener tipos de clases: {str(e)}")

@app.get("/entrenadores")
async def get_entrenadores(response: Response):
    """
    Obtener todos los usuarios con rol de entrenador
    """
    # Headers anti-cache
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache" 
    response.headers["Expires"] = "0"
    
    try:
        print(f"[DEBUG] Obteniendo entrenadores...")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Obtener todos los usuarios con rol entrenador
        cursor.execute("""
            SELECT id, name, email, role, created_at, updated_at
            FROM users 
            WHERE role = 'entrenador' 
            ORDER BY name
        """)
        
        entrenadores_data = cursor.fetchall()
        conn.close()
        
        # Formatear los datos
        entrenadores = []
        for entrenador in entrenadores_data:
            entrenadores.append({
                "id": entrenador[0],
                "name": entrenador[1], 
                "email": entrenador[2],
                "role": entrenador[3],
                "created_at": entrenador[4],
                "updated_at": entrenador[5]
            })
        
        print(f"[DEBUG] Se encontraron {len(entrenadores)} entrenadores")
        
        return entrenadores
        
    except Exception as e:
        print(f"[ERROR] Error al obtener entrenadores: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al obtener entrenadores: {str(e)}")

@app.post("/clases-programadas")
async def guardar_clases_programadas(request: GuardarClasesRequest, response: Response):
    """
    Guardar múltiples clases programadas en el calendario
    """
    # Headers anti-cache
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache" 
    response.headers["Expires"] = "0"
    
    try:
        print(f"[DEBUG] Guardando {len(request.clases)} clases programadas...")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        clases_guardadas = []
        clases_con_error = []
        
        for clase in request.clases:
            try:
                # Validar que los campos obligatorios no estén vacíos
                if not all([clase.fecha, clase.hora, clase.idClase, clase.instructor]):
                    clases_con_error.append({
                        "clase": f"{clase.fecha} {clase.hora} - ID:{clase.idClase}",
                        "error": "Campos obligatorios faltantes"
                    })
                    continue
                
                # Buscar el ID del instructor por su nombre
                cursor.execute("SELECT id FROM users WHERE name = %s AND role = 'entrenador'", (clase.instructor,))
                instructor_result = cursor.fetchone()
                
                if not instructor_result:
                    clases_con_error.append({
                        "clase": f"{clase.fecha} {clase.hora} - ID:{clase.idClase}",
                        "error": f"Instructor '{clase.instructor}' no encontrado"
                    })
                    continue
                
                id_instructor = instructor_result[0]
                
                # Obtener información de capacidad desde gym_clases usando ID
                cursor.execute("SELECT max_participantes, nombre FROM gym_clases WHERE id = %s", (clase.idClase,))
                capacidad_result = cursor.fetchone()
                if not capacidad_result:
                    clases_con_error.append({
                        "clase": f"{clase.fecha} {clase.hora} - ID:{clase.idClase}",
                        "error": f"Tipo de clase con ID {clase.idClase} no encontrado"
                    })
                    continue
                
                capacidad_maxima = capacidad_result[0]
                nombre_clase = capacidad_result[1]
                
                # Verificar si ya existe una clase con el mismo instructor, fecha y hora
                cursor.execute("""
                    SELECT id FROM clases_programadas 
                    WHERE fecha =%s AND hora =%s AND id_instructor =%s AND estado = 'programada'
                """, (clase.fecha, clase.hora, id_instructor))
                
                if cursor.fetchone():
                    clases_con_error.append({
                        "clase": f"{clase.fecha} {clase.hora} - {nombre_clase}",
                        "error": f"El instructor {clase.instructor} ya tiene una clase programada a esta hora"
                    })
                    continue
                
                # Insertar la clase con el nuevo esquema
                cursor.execute("""
                    INSERT INTO clases_programadas 
                    (fecha, hora, id_clase, id_instructor, capacidad_maxima)
                    VALUES (%s, %s, %s, %s, %s)
                """, (clase.fecha, clase.hora, clase.idClase, id_instructor, capacidad_maxima))
                
                clase_id = cursor.lastrowid
                clases_guardadas.append({
                    "id": clase_id,
                    "fecha": clase.fecha,
                    "hora": clase.hora,
                    "id_clase": clase.idClase,
                    "tipo_clase": nombre_clase,
                    "instructor": clase.instructor,
                    "capacidad_maxima": capacidad_maxima
                })
                
            except Exception as e:
                clases_con_error.append({
                    "clase": f"{clase.fecha} {clase.hora} - ID:{clase.idClase}",
                    "error": str(e)
                })
        
        conn.commit()
        conn.close()
        
        print(f"[DEBUG] Guardadas: {len(clases_guardadas)} clases, Errores: {len(clases_con_error)}")
        
        return {
            "success": True,
            "message": f"Proceso completado. {len(clases_guardadas)} clases guardadas",
            "clases_guardadas": clases_guardadas,
            "clases_con_error": clases_con_error,
            "total_guardadas": len(clases_guardadas),
            "total_errores": len(clases_con_error)
        }
        
    except Exception as e:
        if 'conn' in locals():
            conn.close()
        print(f"[ERROR] Error al guardar clases programadas: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al guardar clases: {str(e)}")

@app.get("/clases-programadas")
async def get_clases_programadas(response: Response):
    """
    Obtener todas las clases programadas activas
    """
    # Headers anti-cache
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache" 
    response.headers["Expires"] = "0"
    
    try:
        print(f"[DEBUG] Obteniendo clases programadas...")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Obtener clases programadas disponibles a partir de la fecha y hora actual
        cursor.execute("""
            SELECT cp.id, cp.fecha, cp.hora, cp.id_clase, gc.nombre as tipo_clase, gc.color,
                   cp.id_instructor, u.name as instructor_nombre,
                   cp.capacidad_maxima, cp.estado, 
                   cp.created_at, cp.updated_at, gc.descripcion, gc.duracion_minutos,
                   COALESCE(r.reservas_activas, 0) as reservas_activas
            FROM clases_programadas cp
            JOIN gym_clases gc ON cp.id_clase = gc.id
            JOIN users u ON cp.id_instructor = u.id
            LEFT JOIN (
                SELECT id_clase_programada, COUNT(*) as reservas_activas
                FROM reservas 
                WHERE estado = 'activa'
                GROUP BY id_clase_programada
            ) r ON cp.id = r.id_clase_programada
            WHERE cp.estado IN ('activa', 'programada')
            AND (cp.fecha > CURRENT_DATE 
                 OR (cp.fecha = CURRENT_DATE AND cp.hora > CURRENT_TIME))
            AND (COALESCE(r.reservas_activas, 0) < cp.capacidad_maxima OR cp.capacidad_maxima IS NULL)
            ORDER BY cp.fecha, cp.hora
        """)
        
        clases_data = cursor.fetchall()
        conn.close()
        
        # Formatear los datos
        clases_programadas = []
        for clase in clases_data:
            capacidad_maxima = clase[8] or 15  # Default 15 si no está definida
            reservas_activas = clase[14]  # Número real de reservas activas (índice actualizado)
            plazas_libres = capacidad_maxima - reservas_activas
            
            clases_programadas.append({
                "id": clase[0],
                "fecha": clase[1],
                "hora": clase[2],
                "id_clase": clase[3],
                "tipo_clase": clase[4],
                "color": clase[5],
                "id_instructor": clase[6],
                "instructor_nombre": clase[7],
                "capacidad_maxima": capacidad_maxima,
                "participantes_actuales": reservas_activas,  # Calculado dinámicamente desde reservas
                "plazas_libres": plazas_libres,
                "estado": clase[9],  # índice actualizado
                "created_at": clase[10],  # índice actualizado
                "updated_at": clase[11],  # índice actualizado 
                "descripcion": clase[12],  # índice actualizado
                "duracion_minutos": clase[13]  # índice actualizado
            })
        
        print(f"[DEBUG] Se encontraron {len(clases_programadas)} clases programadas")
        
        return clases_programadas
        
    except Exception as e:
        print(f"[ERROR] Error al obtener clases programadas: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al obtener clases programadas: {str(e)}")

@app.delete("/clases-programadas/{clase_id}")
async def eliminar_clase_programada(clase_id: int, response: Response):
    """
    Eliminar una clase programada específica por su ID
    """
    # Headers anti-cache
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache" 
    response.headers["Expires"] = "0"
    
    try:
        print(f"[DEBUG] Eliminando clase programada con ID: {clase_id}")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verificar que la clase existe antes de eliminarla
        cursor.execute("SELECT id, fecha, hora, id_clase FROM clases_programadas WHERE id = %s", (clase_id,))
        clase_existente = cursor.fetchone()
        
        if not clase_existente:
            conn.close()
            raise HTTPException(status_code=404, detail=f"Clase programada con ID {clase_id} no encontrada")
        
        # Eliminar la clase programada
        cursor.execute("DELETE FROM clases_programadas WHERE id = %s", (clase_id,))
        filas_afectadas = cursor.rowcount
        
        conn.commit()
        conn.close()
        
        if filas_afectadas > 0:
            print(f"[DEBUG] Clase programada {clase_id} eliminada exitosamente")
            return {
                "success": True,
                "message": f"Clase programada eliminada correctamente",
                "id": clase_id,
                "fecha": clase_existente[1],
                "hora": clase_existente[2]
            }
        else:
            raise HTTPException(status_code=500, detail="No se pudo eliminar la clase programada")
        
    except HTTPException:
        # Re-lanzar HTTPExceptions sin modificar
        raise
    except Exception as e:
        print(f"[ERROR] Error al eliminar clase programada: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al eliminar clase programada: {str(e)}")

## Endpoints para reservas de clases

@app.post("/reservas")
async def crear_reserva(request: CrearReservaRequest, response: Response):
    """
    Crear nueva reserva de clase
    """
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    
    try:
        print(f"[DEBUG] Creando reserva - Cliente: {request.id_cliente}, Clase: {request.id_clase_programada}")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verificar que el cliente existe
        cursor.execute("SELECT id FROM clientes WHERE id =%s", (request.id_cliente,))
        cliente_existente = cursor.fetchone()
        if not cliente_existente:
            conn.close()
            raise HTTPException(status_code=404, detail="Cliente no encontrado")
        
        # Verificar que la clase existe y obtener información
        cursor.execute("""
            SELECT cp.id, cp.capacidad_maxima, gc.nombre as tipo_clase, cp.fecha, cp.hora
            FROM clases_programadas cp
            JOIN gym_clases gc ON cp.id_clase = gc.id
            WHERE cp.id =%s AND cp.estado IN ('activa', 'programada')
        """, (request.id_clase_programada,))
        clase_existente = cursor.fetchone()
        
        if not clase_existente:
            conn.close()
            raise HTTPException(status_code=404, detail="Clase programada no encontrada")
        
        # Contar reservas actuales para esta clase
        cursor.execute("""
            SELECT COUNT(*) FROM reservas 
            WHERE id_clase_programada =%s AND estado = 'activa'
        """, (request.id_clase_programada,))
        reservas_actuales = cursor.fetchone()[0]
        
        capacidad_maxima = clase_existente[1] or 15  # Default 15 si no está definida
        
        # Verificar si hay plazas disponibles
        if reservas_actuales >= capacidad_maxima:
            conn.close()
            raise HTTPException(status_code=400, detail="No hay plazas disponibles para esta clase")
        
        # Verificar que el cliente no tenga ya una reserva para esta clase
        cursor.execute("""
            SELECT id FROM reservas 
            WHERE id_cliente =%s AND id_clase_programada =%s AND estado = 'activa'
        """, (request.id_cliente, request.id_clase_programada))
        reserva_existente = cursor.fetchone()
        
        if reserva_existente:
            conn.close()
            raise HTTPException(status_code=400, detail="Ya tienes una reserva activa para esta clase")
        
        # Crear la reserva
        cursor.execute("""
            INSERT INTO reservas (id_cliente, id_clase_programada, estado)
            VALUES (%s, %s, 'activa')
        """, (request.id_cliente, request.id_clase_programada))
        
        reserva_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        print(f"[DEBUG] Reserva creada exitosamente - ID: {reserva_id}")
        
        return {
            "success": True,
            "message": "Reserva creada exitosamente",
            "reserva_id": reserva_id,
            "clase_info": {
                "tipo": clase_existente[2],
                "fecha": clase_existente[3],
                "hora": clase_existente[4]
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Error al crear reserva: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al crear reserva: {str(e)}")

@app.get("/reservas/{cliente_id}")
async def get_reservas_cliente(cliente_id: int, response: Response):
    """
    Obtener todas las reservas de un cliente (usando cliente_id)
    """
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    
    try:
        print(f"[DEBUG] Obteniendo reservas del cliente {cliente_id}")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Obtener reservas del cliente con información de la clase
        cursor.execute("""
            SELECT r.id, r.id_clase_programada, r.estado,
                   cp.fecha, cp.hora, gc.nombre as tipo_clase, gc.color,
                   u.name as instructor_nombre
            FROM reservas r
            JOIN clases_programadas cp ON r.id_clase_programada = cp.id
            JOIN gym_clases gc ON cp.id_clase = gc.id
            JOIN users u ON cp.id_instructor = u.id
            WHERE r.id_cliente =%s
            ORDER BY cp.fecha, cp.hora
        """, (cliente_id,))
        
        reservas_data = cursor.fetchall()
        conn.close()
        
        # Formatear los datos
        reservas = []
        for reserva in reservas_data:
            reservas.append({
                "id": reserva[0],
                "id_clase_programada": reserva[1],
                "estado": reserva[2],
                "clase": {
                    "fecha": reserva[3],
                    "hora": reserva[4],
                    "tipo": reserva[5],
                    "color": reserva[6],
                    "instructor": reserva[7]
                }
            })
        
        print(f"[DEBUG] Se encontraron {len(reservas)} reservas para el cliente {cliente_id}")
        
        return reservas
        
    except Exception as e:
        print(f"[ERROR] Error al obtener reservas: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al obtener reservas: {str(e)}")

@app.get("/user/{user_id}/reservas")
async def get_reservas_por_usuario(user_id: int, response: Response):
    """
    Obtener todas las reservas de un cliente (usando user_id)
    """
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    
    try:
        print(f"[DEBUG] Obteniendo reservas del usuario {user_id}")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Obtener reservas del usuario con información de la clase (JOIN con clientes)
        cursor.execute("""
            WITH reservas_usuario AS (
                SELECT r.id, r.id_clase_programada, r.estado,
                       cp.fecha, cp.hora, gc.nombre as tipo_clase, gc.color,
                       u.name as instructor_nombre
                FROM reservas r
                JOIN clientes c ON r.id_cliente = c.id
                JOIN clases_programadas cp ON r.id_clase_programada = cp.id
                JOIN gym_clases gc ON cp.id_clase = gc.id
                JOIN users u ON cp.id_instructor = u.id
                WHERE c.id_usuario = %s
            )
            SELECT * FROM reservas_usuario ORDER BY fecha, hora
        """, (user_id,))
        
        reservas_data = cursor.fetchall()
        conn.close()
        
        # Formatear los datos
        reservas = []
        for reserva in reservas_data:
            reservas.append({
                "id": reserva[0],
                "id_clase_programada": reserva[1],
                "estado": reserva[2],
                "clase": {
                    "fecha": reserva[3],
                    "hora": reserva[4],
                    "tipo": reserva[5],
                    "color": reserva[6],
                    "instructor": reserva[7]
                }
            })
        
        print(f"[DEBUG] Se encontraron {len(reservas)} reservas para el usuario {user_id}")
        
        return reservas
        
    except Exception as e:
        print(f"[ERROR] Error al obtener reservas por usuario: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al obtener reservas: {str(e)}")
        
        # Formatear los datos
        reservas = []
        for reserva in reservas_data:
            reservas.append({
                "id": reserva[0],
                "id_clase_programada": reserva[1],
                "estado": reserva[2],
                "clase": {
                    "fecha": reserva[3],
                    "hora": reserva[4],
                    "tipo": reserva[5],
                    "color": reserva[6],
                    "instructor": reserva[7]
                }
            })
        
        print(f"[DEBUG] Se encontraron {len(reservas)} reservas para el cliente {cliente_id}")
        
        return reservas
        
    except Exception as e:
        print(f"[ERROR] Error al obtener reservas: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al obtener reservas: {str(e)}")

@app.delete("/reservas/{reserva_id}")
async def cancelar_reserva(reserva_id: int, response: Response):
    """
    Cancelar una reserva
    """
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    
    try:
        print(f"[DEBUG] Cancelando reserva {reserva_id}")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verificar que la reserva existe y está activa
        cursor.execute("""
            SELECT r.id, r.id_cliente, cp.fecha, cp.hora, gc.nombre as tipo_clase
            FROM reservas r
            JOIN clases_programadas cp ON r.id_clase_programada = cp.id
            JOIN gym_clases gc ON cp.id_clase = gc.id
            WHERE r.id =%s AND r.estado = 'activa'
        """, (reserva_id,))
        reserva_existente = cursor.fetchone()
        
        if not reserva_existente:
            conn.close()
            raise HTTPException(status_code=404, detail="Reserva no encontrada o ya cancelada")
        
        # Eliminar la reserva completamente
        cursor.execute("""
            DELETE FROM reservas WHERE id =%s
        """, (reserva_id,))
        
        filas_afectadas = cursor.rowcount
        conn.commit()
        conn.close()
        
        if filas_afectadas > 0:
            print(f"[DEBUG] Reserva {reserva_id} eliminada exitosamente")
            return {
                "success": True,
                "message": "Reserva anulada exitosamente",
                "reserva_id": reserva_id,
                "clase_info": {
                    "tipo": reserva_existente[4],
                    "fecha": reserva_existente[2],
                    "hora": reserva_existente[3]
                }
            }
        else:
            raise HTTPException(status_code=500, detail="No se pudo anular la reserva")
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Error al anular reserva: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al anular reserva: {str(e)}")


@app.post("/reservas/{reserva_id}/registrar-asistencia")
async def registrar_asistencia_clase(reserva_id: int, response: Response):
    """
    Registrar asistencia a una clase reservada
    """
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    
    try:
        print(f"[DEBUG] Registrando asistencia para reserva {reserva_id}")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verificar que la reserva existe y está activa
        cursor.execute("""
            SELECT r.id, r.id_cliente, r.id_clase_programada, cp.fecha, cp.hora, 
                   gc.nombre as tipo_clase, gc.duracion_minutos,
                   u.name as instructor_nombre
            FROM reservas r
            JOIN clases_programadas cp ON r.id_clase_programada = cp.id
            JOIN gym_clases gc ON cp.id_clase = gc.id
            JOIN users u ON cp.id_instructor = u.id
            WHERE r.id =%s AND r.estado = 'activa'
        """, (reserva_id,))
        reserva_info = cursor.fetchone()
        
        if not reserva_info:
            conn.close()
            raise HTTPException(status_code=404, detail="Reserva no encontrada o ya cancelada")
        
        # Extraer información de la reserva
        reserva_id_db, cliente_id, clase_programada_id, fecha, hora, tipo_clase, duracion_minutos, instructor = reserva_info
        
        # Solo marcar la reserva como completada
        cursor.execute("""
            UPDATE reservas 
            SET estado = 'completada'
            WHERE id =%s
        """, (reserva_id,))
        
        conn.commit()
        conn.close()
        
        print(f"[DEBUG] Asistencia registrada exitosamente para reserva {reserva_id}")
        
        return {
            "success": True,
            "message": "Asistencia registrada exitosamente",
            "clase_info": {
                "tipo": tipo_clase,
                "fecha": fecha,
                "hora": hora,
                "instructor": instructor,
                "duracion_minutos": duracion_minutos
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Error al registrar asistencia: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al registrar asistencia: {str(e)}")


# ====== ENDPOINTS PARA ASIGNACIONES ENTRENADOR-CLIENTE ======

@app.get("/asignaciones-entrenador")
async def get_asignaciones_entrenador(response: Response):
    """
    Obtener todas las asignaciones entrenador-cliente y clientes sin asignar que tengan plan con entrenador
    """
    # Headers anti-cache
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache" 
    response.headers["Expires"] = "0"
    
    try:
        print(f"[DEBUG] Obteniendo asignaciones entrenador-cliente...")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Obtener todos los entrenadores con sus clientes asignados
        cursor.execute("""
            SELECT 
                u.id as entrenador_id,
                u.name as entrenador_nombre,
                u.email as entrenador_email,
                COALESCE(COUNT(eca.id), 0) as total_clientes,
                COALESCE(
                    json_agg(
                        CASE WHEN eca.id IS NOT NULL THEN
                            json_build_object(
                                'cliente_id', c.id,
                                'cliente_nombre', c.name,
                                'cliente_email', c.email,
                                'plan_nombre', p.nombre,
                                'fecha_asignacion', eca.fecha_asignacion,
                                'estado', eca.estado,
                                'asignacion_id', eca.id
                            )
                        ELSE NULL
                        END
                    ) FILTER (WHERE eca.id IS NOT NULL),
                    '[]'
                ) as clientes_asignados
            FROM users u
            LEFT JOIN entrenador_cliente_asignaciones eca ON u.id = eca.id_entrenador AND eca.estado = 'activa'
            LEFT JOIN clientes cl ON eca.id_cliente = cl.id AND cl.estado = 'activo'
            LEFT JOIN users c ON cl.id_usuario = c.id
            LEFT JOIN planes p ON cl.plan_id = p.id
            WHERE u.role = 'entrenador'
            GROUP BY u.id, u.name, u.email
            ORDER BY u.name
        """)
        
        entrenadores_data = cursor.fetchall()
        
        # Obtener clientes sin asignar que tengan plan estándar o premium (incluyen entrenador)
        cursor.execute("""
            SELECT 
                u.id as cliente_id,
                u.name as cliente_nombre,
                u.email as cliente_email,
                p.nombre as plan_nombre,
                cl.fecha_inscripcion,
                cl.estado
            FROM users u
            JOIN clientes cl ON u.id = cl.id_usuario AND cl.estado = 'activo'
            JOIN planes p ON cl.plan_id = p.id
            LEFT JOIN entrenador_cliente_asignaciones eca ON cl.id = eca.id_cliente AND eca.estado = 'activa'
            WHERE u.role = 'cliente' 
                AND p.acceso_entrenador = 1
                AND eca.id IS NULL
            ORDER BY u.name
        """)
        
        clientes_sin_asignar_data = cursor.fetchall()
        conn.close()
        
        # Formatear datos de entrenadores
        entrenadores = []
        for entrenador in entrenadores_data:
            entrenadores.append({
                "entrenador_id": entrenador[0],
                "entrenador_nombre": entrenador[1],
                "entrenador_email": entrenador[2],
                "total_clientes": entrenador[3],
                "clientes_asignados": entrenador[4] if entrenador[4] else []
            })
        
        # Formatear datos de clientes sin asignar
        clientes_sin_asignar = []
        for cliente in clientes_sin_asignar_data:
            clientes_sin_asignar.append({
                "cliente_id": cliente[0],
                "cliente_nombre": cliente[1],
                "cliente_email": cliente[2],
                "plan_nombre": cliente[3],
                "fecha_inscripcion": cliente[4],
                "estado": cliente[5]
            })
        
        return {
            "success": True,
            "entrenadores": entrenadores,
            "clientes_sin_asignar": clientes_sin_asignar,
            "total_entrenadores": len(entrenadores),
            "total_clientes_sin_asignar": len(clientes_sin_asignar)
        }
        
    except Exception as e:
        print(f"[ERROR] Error al obtener asignaciones: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al obtener asignaciones: {str(e)}")


@app.post("/asignar-entrenador")
async def asignar_entrenador(request: dict):
    """
    Asignar un entrenador a un cliente
    """
    try:
        id_entrenador = request.get("id_entrenador")
        id_cliente = request.get("id_cliente")
        notas = request.get("notas", "")
        
        if not id_entrenador or not id_cliente:
            raise HTTPException(status_code=400, detail="ID del entrenador e ID del cliente son requeridos")
        
        print(f"[DEBUG] Asignando entrenador {id_entrenador} a cliente {id_cliente}")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verificar que el entrenador existe y es entrenador
        cursor.execute("SELECT id, name FROM users WHERE id = %s AND role = 'entrenador'", (id_entrenador,))
        entrenador = cursor.fetchone()
        if not entrenador:
            raise HTTPException(status_code=404, detail="Entrenador no encontrado")
        
        # Verificar que el cliente existe, es cliente y tiene plan con entrenador
        cursor.execute("""
            SELECT u.id, u.name, p.nombre 
            FROM users u
            JOIN clientes cl ON u.id = cl.id_usuario AND cl.estado = 'activo'
            JOIN planes p ON cl.plan_id = p.id
            WHERE u.id = %s AND u.role = 'cliente' AND p.acceso_entrenador = 1
        """, (id_cliente,))
        cliente = cursor.fetchone()
        if not cliente:
            raise HTTPException(status_code=404, detail="Cliente no encontrado o no tiene plan con entrenador")
        
        # Obtener el ID de cliente de la tabla clientes
        cursor.execute("SELECT id FROM clientes WHERE id_usuario = %s", (id_cliente,))
        cliente_row = cursor.fetchone()
        if not cliente_row:
            raise HTTPException(status_code=404, detail="Registro de cliente no encontrado")
        
        cliente_table_id = cliente_row[0]
        
        # Verificar que no existe una asignación activa
        cursor.execute("""
            SELECT id FROM entrenador_cliente_asignaciones 
            WHERE id_cliente = %s AND estado = 'activa'
        """, (cliente_table_id,))
        asignacion_existente = cursor.fetchone()
        if asignacion_existente:
            raise HTTPException(status_code=400, detail="El cliente ya tiene un entrenador asignado")
        
        # Crear la nueva asignación
        cursor.execute("""
            INSERT INTO entrenador_cliente_asignaciones 
            (id_entrenador, id_cliente, notas) 
            VALUES (%s, %s, %s)
        """, (id_entrenador, cliente_table_id, notas))
        
        asignacion_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "message": f"Entrenador {entrenador[1]} asignado exitosamente a cliente {cliente[1]}",
            "asignacion_id": asignacion_id,
            "entrenador": {"id": entrenador[0], "nombre": entrenador[1]},
            "cliente": {"id": cliente[0], "nombre": cliente[1], "plan": cliente[2]}
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Error al asignar entrenador: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al asignar entrenador: {str(e)}")


@app.delete("/desasignar-entrenador/{asignacion_id}")
async def desasignar_entrenador(asignacion_id: int):
    """
    Desasignar un entrenador de un cliente (cambiar estado a inactiva)
    """
    try:
        print(f"[DEBUG] Desasignando entrenador - asignación ID: {asignacion_id}")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verificar que la asignación existe y está activa
        cursor.execute("""
            SELECT eca.id, u1.name as entrenador_nombre, u2.name as cliente_nombre
            FROM entrenador_cliente_asignaciones eca
            JOIN users u1 ON eca.id_entrenador = u1.id
            JOIN clientes cl ON eca.id_cliente = cl.id
            JOIN users u2 ON cl.id_usuario = u2.id
            WHERE eca.id = %s AND eca.estado = 'activa'
        """, (asignacion_id,))
        
        asignacion = cursor.fetchone()
        if not asignacion:
            raise HTTPException(status_code=404, detail="Asignación no encontrada o ya está inactiva")
        
        # Cambiar estado a inactiva
        cursor.execute("""
            UPDATE entrenador_cliente_asignaciones 
            SET estado = 'inactiva', updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """, (asignacion_id,))
        
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "message": f"Asignación desactivada: {asignacion[1]} ya no entrena a {asignacion[2]}",
            "asignacion_id": asignacion_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Error al desasignar entrenador: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al desasignar entrenador: {str(e)}")


# ====== ENDPOINTS PARA PANEL DE ENTRENADOR ======

@app.get("/entrenador/{entrenador_id}/clientes")
async def get_clientes_entrenador(entrenador_id: int, response: Response):
    """
    Obtener todos los clientes asignados a un entrenador específico
    """
    # Headers anti-cache
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache" 
    response.headers["Expires"] = "0"
    
    try:
        print(f"[DEBUG] Obteniendo clientes del entrenador {entrenador_id}...")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verificar que el entrenador existe
        cursor.execute("SELECT id, name FROM users WHERE id =%s AND role = 'entrenador'", (entrenador_id,))
        entrenador = cursor.fetchone()
        if not entrenador:
            conn.close()
            raise HTTPException(status_code=404, detail="Entrenador no encontrado")
        
        # Obtener clientes asignados al entrenador con información completa
        cursor.execute("""
            SELECT 
                u.id as cliente_user_id,
                u.name as cliente_nombre,
                u.email as cliente_email,
                cl.id as cliente_id,
                cl.fecha_inscripcion,
                cl.estado as cliente_estado,
                p.nombre as plan_nombre,
                p.color_tema as plan_color,
                eca.fecha_asignacion,
                eca.notas,
                eca.id as asignacion_id
            FROM entrenador_cliente_asignaciones eca
            JOIN clientes cl ON eca.id_cliente = cl.id AND cl.estado = 'activo'
            JOIN users u ON cl.id_usuario = u.id
            JOIN planes p ON cl.plan_id = p.id
            WHERE eca.id_entrenador =%s AND eca.estado = 'activa'
            ORDER BY u.name
        """, (entrenador_id,))
        
        clientes_data = cursor.fetchall()
        
        # Formatear datos de clientes
        clientes = []
        for cliente in clientes_data:
            # Calcular estadísticas básicas del cliente (puedes expandir esto)
            cliente_info = {
                "id": cliente[0],  # user_id para compatibilidad con frontend
                "cliente_id": cliente[3],  # id de tabla clientes
                "name": cliente[1],
                "email": cliente[2],
                "fecha_inscripcion": cliente[4],
                "estado": cliente[5],
                "plan_nombre": cliente[6],
                "plan_color": cliente[7],
                "fecha_asignacion": cliente[8],
                "notas": cliente[9],
                "asignacion_id": cliente[10],
                # Datos simulados por ahora - puedes agregar tablas de entrenamientos después
                "last_activity": cliente[4],  # Por ahora usar fecha_inscripcion
                "total_workouts": 0,  # Por ahora 0, expandir después
                "status": "activo" if cliente[5] == "activo" else "inactivo"
            }
            clientes.append(cliente_info)
        
        conn.close()
        
        # Calcular estadísticas generales
        total_clientes = len(clientes)
        clientes_activos = len([c for c in clientes if c["status"] == "activo"])
        clientes_inactivos = total_clientes - clientes_activos
        
        return {
            "success": True,
            "entrenador": {
                "id": entrenador[0],
                "name": entrenador[1]
            },
            "clientes": clientes,
            "estadisticas": {
                "total_clientes": total_clientes,
                "clientes_activos": clientes_activos,
                "clientes_inactivos": clientes_inactivos
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Error al obtener clientes del entrenador: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al obtener clientes del entrenador: {str(e)}")


@app.get("/entrenador/{entrenador_id}/estadisticas")
async def get_estadisticas_entrenador(entrenador_id: int, response: Response):
    """
    Obtener estadísticas generales del entrenador
    """
    # Headers anti-cache
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache" 
    response.headers["Expires"] = "0"
    
    try:
        print(f"[DEBUG] Obteniendo estadísticas del entrenador {entrenador_id}...")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verificar que el entrenador existe
        cursor.execute("SELECT id, name FROM users WHERE id =%s AND role = 'entrenador'", (entrenador_id,))
        entrenador = cursor.fetchone()
        if not entrenador:
            conn.close()
            raise HTTPException(status_code=404, detail="Entrenador no encontrado")
        
        # Obtener estadísticas básicas
        cursor.execute("""
            SELECT COUNT(*) as total_clientes
            FROM entrenador_cliente_asignaciones eca
            JOIN clientes cl ON eca.id_cliente = cl.id AND cl.estado = 'activo'
            WHERE eca.id_entrenador =%s AND eca.estado = 'activa'
        """, (entrenador_id,))
        total_clientes = cursor.fetchone()[0]
        
        # Obtener distribución por planes
        cursor.execute("""
            SELECT p.nombre, COUNT(*) as cantidad
            FROM entrenador_cliente_asignaciones eca
            JOIN clientes cl ON eca.id_cliente = cl.id AND cl.estado = 'activo'
            JOIN planes p ON cl.plan_id = p.id
            WHERE eca.id_entrenador =%s AND eca.estado = 'activa'
            GROUP BY p.nombre
        """, (entrenador_id,))
        distribucion_planes = cursor.fetchall()
        
        conn.close()
        
        # Formatear estadísticas
        estadisticas = {
            "total_clientes": total_clientes,
            "clientes_activos": total_clientes,  # Por ahora todos los asignados están activos
            "clientes_inactivos": 0,
            "distribucion_planes": [
                {"plan": plan[0], "cantidad": plan[1]} 
                for plan in distribucion_planes
            ],
            # Estadísticas expandibles para el futuro
            "total_entrenamientos": 0,  # Expandir cuando tengas tabla de entrenamientos
            "entrenamientos_esta_semana": 0,
            "promedio_entrenamientos": 0.0
        }
        
        return {
            "success": True,
            "entrenador": {
                "id": entrenador[0],
                "name": entrenador[1]
            },
            "estadisticas": estadisticas
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Error al obtener estadísticas del entrenador: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al obtener estadísticas del entrenador: {str(e)}")

@app.get("/ejercicios")
async def get_ejercicios(response: Response):
    """
    Obtener todos los ejercicios disponibles
    """
    # Headers anti-cache
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache" 
    response.headers["Expires"] = "0"
    
    try:
        print("[DEBUG] Obteniendo ejercicios...")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Obtener todos los ejercicios activos
        cursor.execute("""
            SELECT id, nombre, categoria, descripcion
            FROM ejercicios 
            WHERE estado = 'activo'
            ORDER BY categoria, nombre
        """)
        
        ejercicios_data = cursor.fetchall()
        conn.close()
        
        # Formatear datos de ejercicios
        ejercicios = []
        for ejercicio in ejercicios_data:
            ejercicio_info = {
                "id": ejercicio[0],
                "nombre": ejercicio[1],
                "categoria": ejercicio[2],
                "descripcion": ejercicio[3] or ""
            }
            ejercicios.append(ejercicio_info)
        
        return {
            "success": True,
            "ejercicios": ejercicios,
            "total": len(ejercicios)
        }
        
    except Exception as e:
        print(f"[ERROR] Error al obtener ejercicios: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al obtener ejercicios: {str(e)}")

@app.post("/entrenador/{entrenador_id}/cliente/{cliente_id}/plan-entrenamiento")
async def guardar_plan_entrenamiento(
    entrenador_id: int, 
    cliente_id: int,  # Este es el user_id del cliente, no el cliente_id de la tabla clientes
    plan_data: dict,
    response: Response
):
    """
    Guardar plan de entrenamiento asignado por un entrenador a un cliente
    Nota: cliente_id es el user_id del cliente, se convertirá internamente al cliente_id de la tabla clientes
    """
    # Headers anti-cache
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache" 
    response.headers["Expires"] = "0"
    
    try:
        print(f"[DEBUG] Guardando plan de entrenamiento - Entrenador: {entrenador_id}, Cliente: {cliente_id}")
        print(f"[DEBUG] Datos del plan: {plan_data}")
        
        # Validar datos de entrada
        entrenamientos = plan_data.get("entrenamientos", [])
        if not entrenamientos:
            raise HTTPException(status_code=400, detail="No se proporcionaron entrenamientos")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verificar que el entrenador existe
        cursor.execute("SELECT id FROM users WHERE id =%s AND role = 'entrenador'", (entrenador_id,))
        if not cursor.fetchone():
            conn.close()
            raise HTTPException(status_code=404, detail="Entrenador no encontrado")
        
        # Verificar que el cliente existe y obtener su cliente_id
        cursor.execute("SELECT c.id FROM clientes c JOIN users u ON c.id_usuario = u.id WHERE u.id =%s", (cliente_id,))
        cliente_row = cursor.fetchone()
        if not cliente_row:
            conn.close()
            raise HTTPException(status_code=404, detail="Cliente no encontrado")
        
        cliente_real_id = cliente_row[0]  # Este es el ID real en la tabla clientes
        
        # Verificar que el cliente está asignado al entrenador
        cursor.execute("""
            SELECT id FROM entrenador_cliente_asignaciones 
            WHERE id_entrenador =%s AND id_cliente =%s AND estado = 'activa'
        """, (entrenador_id, cliente_real_id))
        if not cursor.fetchone():
            conn.close()
            raise HTTPException(status_code=403, detail="Cliente no asignado a este entrenador")
        
        # Insertar entrenamientos
        entrenamientos_guardados = []
        for entrenamiento in entrenamientos:
            fecha = entrenamiento.get("fecha")
            ejercicio_nombre = entrenamiento.get("ejercicio")
            series = entrenamiento.get("series", 1)
            
            if not fecha or not ejercicio_nombre or not series:
                print(f"[WARNING] Entrenamiento incompleto: {entrenamiento}")
                continue
            
            # Buscar el ID del ejercicio por nombre
            cursor.execute("SELECT id FROM ejercicios WHERE nombre = %s AND estado = 'activo'", (ejercicio_nombre,))
            ejercicio_row = cursor.fetchone()
            if not ejercicio_row:
                print(f"[WARNING] Ejercicio no encontrado: {ejercicio_nombre}")
                continue
            
            ejercicio_id = ejercicio_row[0]
            
            # Insertar o actualizar entrenamiento asignado
            cursor.execute("""
                INSERT INTO entrenamientos_asignados 
                (id_entrenador, id_cliente, id_ejercicio, fecha_entrenamiento, series, estado)
                VALUES (%s, %s, %s, %s, %s, 'pendiente')
                ON CONFLICT (id_entrenador, id_cliente, id_ejercicio, fecha_entrenamiento) 
                DO UPDATE SET series = EXCLUDED.series
            """, (entrenador_id, cliente_real_id, ejercicio_id, fecha, series))
            
            entrenamiento_id = cursor.lastrowid
            entrenamientos_guardados.append({
                "id": entrenamiento_id,
                "ejercicio": ejercicio_nombre,
                "fecha": fecha,
                "series": series,
                "estado": "pendiente"
            })
        
        conn.commit()
        conn.close()
        
        if not entrenamientos_guardados:
            raise HTTPException(status_code=400, detail="No se pudieron guardar los entrenamientos")
        
        return {
            "success": True,
            "message": f"Plan de entrenamiento guardado exitosamente. {len(entrenamientos_guardados)} entrenamientos asignados.",
            "entrenamientos_guardados": entrenamientos_guardados,
            "total": len(entrenamientos_guardados)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Error al guardar plan de entrenamiento: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al guardar plan de entrenamiento: {str(e)}")

@app.get("/cliente/{cliente_user_id}/entrenamientos-pendientes")
async def get_entrenamientos_pendientes(cliente_user_id: int, response: Response):
    """
    Obtener entrenamientos pendientes asignados a un cliente
    """
    # Headers anti-cache
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache" 
    response.headers["Expires"] = "0"
    
    try:
        print(f"[DEBUG] Obteniendo entrenamientos pendientes del cliente {cliente_user_id}...")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Obtener cliente_id real desde user_id
        cursor.execute("SELECT c.id FROM clientes c JOIN users u ON c.id_usuario = u.id WHERE u.id = %s", (cliente_user_id,))
        cliente_row = cursor.fetchone()
        if not cliente_row:
            conn.close()
            raise HTTPException(status_code=404, detail="Cliente no encontrado")
        
        cliente_id = cliente_row[0]
        
        # Obtener entrenamientos pendientes con información del ejercicio
        cursor.execute("""
            SELECT 
                ea.id,
                ea.fecha_entrenamiento,
                ea.series,
                e.id as ejercicio_id,
                e.nombre as ejercicio_nombre,
                e.categoria as ejercicio_categoria,
                e.descripcion as ejercicio_descripcion,
                u.name as entrenador_nombre
            FROM entrenamientos_asignados ea
            JOIN ejercicios e ON ea.id_ejercicio = e.id
            JOIN users u ON ea.id_entrenador = u.id
            WHERE ea.id_cliente = %s AND ea.estado = 'pendiente'
            ORDER BY ea.fecha_entrenamiento ASC
        """, (cliente_id,))
        
        entrenamientos_data = cursor.fetchall()
        conn.close()
        
        # Formatear datos
        entrenamientos = []
        for entrenamiento in entrenamientos_data:
            entrenamiento_info = {
                "id": entrenamiento[0],
                "fecha_entrenamiento": entrenamiento[1],
                "series_planificadas": entrenamiento[2],
                "ejercicio": {
                    "id": entrenamiento[3],
                    "nombre": entrenamiento[4],
                    "categoria": entrenamiento[5],
                    "descripcion": entrenamiento[6] or ""
                },
                "entrenador_nombre": entrenamiento[7]
            }
            entrenamientos.append(entrenamiento_info)
        
        return {
            "success": True,
            "entrenamientos_pendientes": entrenamientos,
            "total": len(entrenamientos)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Error al obtener entrenamientos pendientes: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al obtener entrenamientos pendientes: {str(e)}")

@app.post("/cliente/{cliente_user_id}/registrar-actividad")
async def registrar_actividad(cliente_user_id: int, actividad_data: dict, response: Response):
    """
    Registrar actividad completada por un cliente
    """
    # Headers anti-cache
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache" 
    response.headers["Expires"] = "0"
    
    try:
        print(f"[DEBUG] Registrando actividad del cliente {cliente_user_id}...")
        print(f"[DEBUG] Datos de actividad: {actividad_data}")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Obtener cliente_id real desde user_id
        cursor.execute("SELECT c.id FROM clientes c JOIN users u ON c.id_usuario = u.id WHERE u.id = %s", (cliente_user_id,))
        cliente_row = cursor.fetchone()
        if not cliente_row:
            conn.close()
            raise HTTPException(status_code=404, detail="Cliente no encontrado")
        
        cliente_id = cliente_row[0]
        
        # Extraer datos de la actividad
        id_ejercicio = actividad_data.get("id_ejercicio")
        id_entrenamiento_asignado = actividad_data.get("id_entrenamiento_asignado")  # NULL para actividad libre
        fecha_realizacion = actividad_data.get("fecha_realizacion")
        series_realizadas = actividad_data.get("series_realizadas")
        repeticiones = actividad_data.get("repeticiones")
        peso_kg = actividad_data.get("peso_kg")
        tiempo_segundos = actividad_data.get("tiempo_segundos")
        distancia_metros = actividad_data.get("distancia_metros")
        notas = actividad_data.get("notas", "")
        valoracion = actividad_data.get("valoracion")
        
        # Validaciones
        if not id_ejercicio or not fecha_realizacion or not series_realizadas:
            raise HTTPException(status_code=400, detail="Faltan datos obligatorios: ejercicio, fecha y series")
        
        # Determinar tipo de registro
        tipo_registro = "planificado" if id_entrenamiento_asignado else "libre"
        
        # Insertar registro de actividad
        cursor.execute("""
            INSERT INTO entrenamientos_realizados 
            (id_cliente, id_ejercicio, id_entrenamiento_asignado, fecha_realizacion, 
             series_realizadas, repeticiones, peso_kg, tiempo_segundos, distancia_metros, 
             notas, valoracion, tipo_registro)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (cliente_id, id_ejercicio, id_entrenamiento_asignado, fecha_realizacion,
              series_realizadas, repeticiones, peso_kg, tiempo_segundos, distancia_metros,
              notas, valoracion, tipo_registro))
        
        actividad_id = cursor.lastrowid
        
        # Si es un entrenamiento planificado, actualizamos su estado a completado
        if id_entrenamiento_asignado:
            cursor.execute("""
                UPDATE entrenamientos_asignados
                SET estado = 'completado'
                WHERE id = %s
            """, (id_entrenamiento_asignado,))
            print(f"[DEBUG] Actualizado estado de entrenamiento asignado {id_entrenamiento_asignado} a completado")
        
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "message": "Actividad registrada exitosamente",
            "actividad_id": actividad_id,
            "tipo_registro": tipo_registro
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Error al registrar actividad: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al registrar actividad: {str(e)}")