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

app = FastAPI()

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # URLs del frontend Next.js
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

def print_server_ip():
    try:
        hostname = socket.gethostname()
        local_ip = socket.gethostbyname(hostname)
        print(f"API iniciada. Accede en: http://{local_ip}:8000")
    except Exception as e:
        print("No se pudo determinar la IP local:", e)

print_server_ip()

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
# POST   /contract-plan      - Contratar plan (cambia rol usuario -> cliente)
# GET    /admin/users        - Obtener todos los usuarios (solo admin)
# GET    /admin/users/{id}   - Obtener usuario específico por ID (solo admin)
# PUT    /admin/users/{id}   - Actualizar usuario específico (solo admin)
# GET    /gym-clases         - Obtener todos los tipos de clases activas del gimnasio
# GET    /entrenadores       - Obtener todos los usuarios con rol de entrenador
# GET    /clases-programadas - Obtener todas las clases programadas activas
# POST   /clases-programadas - Guardar múltiples clases programadas en el calendario
# ----------------------------------------------------

def get_db_connection():
    """Obtiene la conexión a la base de datos users.db ubicada en la raíz del proyecto"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    db_path = os.path.join(project_root, "users.db")
    return sqlite3.connect(db_path)

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))

# Inicializar la base de datos y crear la tabla si no existe
def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            email_verified INTEGER DEFAULT 0
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reset_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS email_verifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    """)
    conn.commit()
    conn.close()

init_db()

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
    cursor.execute("SELECT id, name, email, password, email_verified, role FROM users WHERE email=?", (req.email,))
    user = cursor.fetchone()
    
    if user and verify_password(req.password, user[3]):
        if not user[4]:
            conn.close()
            raise HTTPException(status_code=403, detail="Debes verificar tu email antes de iniciar sesión")
        
        user_data = {"id": user[0], "email": user[2], "name": user[1], "role": user[5]}
        
        # Si es un cliente, cargar también sus datos específicos
        if user[5] == "cliente":
            cursor.execute("""
                SELECT id, dni, numero_telefono, plan_id, fecha_nacimiento, genero, 
                       num_tarjeta, fecha_tarjeta, cvv, fecha_inscripcion, estado 
                FROM clientes WHERE id_usuario = ?
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
            "INSERT INTO users (name, email, password, created_at, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
            (req.name, req.email, hashed_pw)
        )
        conn.commit()
        user_id = cursor.lastrowid
        print(f"[DEBUG] Usuario registrado con id: {user_id}")
        # Generar token de verificación y enviar email
        token = str(uuid.uuid4())
        expires_at = (datetime.utcnow() + timedelta(hours=24)).isoformat()
        cursor.execute(
            "INSERT INTO email_verifications (user_id, token, expires_at) VALUES (?, ?, ?)",
            (user_id, token, expires_at)
        )
        conn.commit()
        verify_link = f"https://v0-gym-landing-page-steel.vercel.app/verify-email?token={token}"
        print(f"[DEBUG] Link de verificación generado: {verify_link}")
        try:
            send_verification_email(req.email, verify_link)
            print("[DEBUG] Email de verificación enviado correctamente")
        except Exception as e:
            print("[DEBUG] Error enviando email de verificación:", e)
            print("[DEBUG] Link de verificación (solo debug):", verify_link)
    except sqlite3.IntegrityError:
        print("[DEBUG] Email ya registrado:", req.email)
        conn.close()
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    conn.close()
    return {
        "success": True,
        "message": "Usuario registrado exitosamente. Revisa tu correo para verificar tu email.",
        "user": {
            "id": user_id,
            "name": req.name,
            "email": req.email
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
    cursor.execute("SELECT id, password FROM users WHERE email=?", (req.email,))
    user = cursor.fetchone()
    if not user or not verify_password(req.current_password, user[1]):
        conn.close()
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    hashed_new = hash_password(req.new_password)
    cursor.execute("UPDATE users SET password=? WHERE id=?", (hashed_new, user[0]))
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
    cursor.execute("SELECT id FROM users WHERE email=?", (req.email,))
    user = cursor.fetchone()
    if not user:
        conn.close()
        return {"success": True, "message": "Email de recuperación enviado"}
    user_id = user[0]
    token = str(uuid.uuid4())
    expires_at = (datetime.utcnow() + timedelta(hours=1)).isoformat()
    cursor.execute("INSERT INTO reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)", (user_id, token, expires_at))
    conn.commit()
    conn.close()    
    reset_link = f"https://v0-gym-landing-page-steel.vercel.app/reset-password?token={token}"
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
    cursor.execute("SELECT user_id, expires_at FROM reset_tokens WHERE token=?", (req.token,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=400, detail="Token inválido")
    user_id, expires_at = row
    if datetime.utcnow() > datetime.fromisoformat(expires_at):
        cursor.execute("DELETE FROM reset_tokens WHERE token=?", (req.token,))
        conn.commit()
        conn.close()
        raise HTTPException(status_code=400, detail="Token expirado")
    # Actualizar contraseña
    hashed_pw = hash_password(req.newPassword)
    cursor.execute("UPDATE users SET password=? WHERE id=?", (hashed_pw, user_id))
    cursor.execute("DELETE FROM reset_tokens WHERE token=?", (req.token,))
    conn.commit()
    conn.close()
    return {"success": True, "message": "Contraseña actualizada correctamente"}

## Endpoint para verificar el email del usuario
@app.post("/verify-email")
def verify_email(req: VerifyEmailRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT user_id, expires_at FROM email_verifications WHERE token=?", (req.token,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=400, detail="Token inválido")
    user_id, expires_at = row
    if datetime.utcnow() > datetime.fromisoformat(expires_at):
        cursor.execute("DELETE FROM email_verifications WHERE token=?", (req.token,))
        conn.commit()
        conn.close()
        raise HTTPException(status_code=400, detail="Token expirado")
    # Marcar email como verificado
    cursor.execute("UPDATE users SET email_verified=1 WHERE id=?", (user_id,))
    cursor.execute("DELETE FROM email_verifications WHERE token=?", (req.token,))
    conn.commit()
    conn.close()
    return {"success": True, "message": "Email verificado correctamente"}

## Endpoint para obtener el número total de usuarios registrados
@app.get("/count-members")
def count_members():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM users")
    count = cursor.fetchone()[0]
    conn.close()
    return {"count": count}

## Endpoints para planes
@app.get("/planes")
def get_planes():
    """Obtener todos los planes activos ordenados por orden_display"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, nombre, descripcion, precio_mensual, precio_anual, 
                   duracion_meses, caracteristicas, limite_clases, 
                   acceso_nutricionista, acceso_entrenador_personal, 
                   acceso_areas_premium, popular, activo, color_tema, 
                   orden_display, created_at, updated_at
            FROM planes 
            WHERE activo = 1 
            ORDER BY orden_display ASC
        """)
        
        planes = []
        for row in cursor.fetchall():
            # Parsear características JSON
            import json
            try:
                caracteristicas = json.loads(row[6])
            except:
                caracteristicas = []
            
            plan = {
                "id": row[0],
                "nombre": row[1],
                "descripcion": row[2],
                "precio_mensual": float(row[3]),
                "precio_anual": float(row[4]) if row[4] else None,
                "duracion_meses": row[5],
                "caracteristicas": caracteristicas,
                "limite_clases": row[7],
                "acceso_nutricionista": bool(row[8]),
                "acceso_entrenador_personal": bool(row[9]),
                "acceso_areas_premium": bool(row[10]),
                "popular": bool(row[11]),
                "activo": bool(row[12]),
                "color_tema": row[13],
                "orden_display": row[14],
                "created_at": row[15],
                "updated_at": row[16]
            }
            planes.append(plan)
        
        conn.close()
        return {"planes": planes}
        
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Error al obtener planes: {str(e)}")

@app.get("/planes/{plan_id}")
def get_plan_by_id(plan_id: int):
    """Obtener un plan específico por ID"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, nombre, descripcion, precio_mensual, precio_anual, 
                   duracion_meses, caracteristicas, limite_clases, 
                   acceso_nutricionista, acceso_entrenador_personal, 
                   acceso_areas_premium, popular, activo, color_tema, 
                   orden_display, created_at, updated_at
            FROM planes 
            WHERE id = ? AND activo = 1
        """, (plan_id,))
        
        row = cursor.fetchone()
        if not row:
            conn.close()
            raise HTTPException(status_code=404, detail="Plan no encontrado")
        
        # Parsear características JSON
        import json
        try:
            caracteristicas = json.loads(row[6])
        except:
            caracteristicas = []
        
        plan = {
            "id": row[0],
            "nombre": row[1],
            "descripcion": row[2],
            "precio_mensual": float(row[3]),
            "precio_anual": float(row[4]) if row[4] else None,
            "duracion_meses": row[5],
            "caracteristicas": caracteristicas,
            "limite_clases": row[7],
            "acceso_nutricionista": bool(row[8]),
            "acceso_entrenador_personal": bool(row[9]),
            "acceso_areas_premium": bool(row[10]),
            "popular": bool(row[11]),
            "activo": bool(row[12]),
            "color_tema": row[13],
            "orden_display": row[14],
            "created_at": row[15],
            "updated_at": row[16]
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
        cursor.execute("SELECT id, name, email, role FROM users WHERE id = ?", (req.user_id,))
        user = cursor.fetchone()
        
        if not user:
            conn.close()
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        if user[3] != "usuario":
            conn.close()
            raise HTTPException(status_code=400, detail="Solo los usuarios pueden contratar planes")
        
        # 2. Verificar que el plan existe
        cursor.execute("SELECT id, nombre FROM planes WHERE id = ? AND activo = 1", (req.plan_id,))
        plan = cursor.fetchone()
        
        if not plan:
            conn.close()
            raise HTTPException(status_code=404, detail="Plan no encontrado o inactivo")
        
        # 3. Actualizar el rol del usuario de 'usuario' a 'cliente'
        cursor.execute("UPDATE users SET role = 'cliente' WHERE id = ?", (req.user_id,))
        
        # 4. Crear registro en la tabla clientes
        cursor.execute("""
            INSERT INTO clientes (
                id_usuario, dni, numero_telefono, plan_id, fecha_nacimiento, 
                genero, num_tarjeta, fecha_tarjeta, cvv, fecha_inscripcion, estado
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), 'activo')
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
            FROM clientes WHERE id = ?
        """, (cliente_id,))
        cliente_data = cursor.fetchone()
        
        conn.close()
        
        # 7. Retornar datos actualizados del usuario
        updated_user = {
            "id": user[0],
            "name": user[1],
            "email": user[2],
            "role": "cliente",
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
            "message": f"Plan {plan[1]} contratado exitosamente",
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
                    WHERE id_usuario = ?
                """, (user_row[0],))
                cliente_data = cursor.fetchone()
                
                if cliente_data:
                    # Obtener nombre del plan
                    cursor.execute("SELECT nombre FROM planes WHERE id = ?", (cliente_data[3],))
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
            "admin": len([u for u in users_list if u["role"] in ["admin", "administrador"]]),
            "entrenador": len([u for u in users_list if u["role"] == "entrenador"]),
            "cliente": len([u for u in users_list if u["role"] == "cliente"]),
            "clientepro": len([u for u in users_list if u["role"] == "clientepro"]),
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
            WHERE id = ?
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
                       fecha_inscripcion, estado, created_at, updated_at
                FROM clientes 
                WHERE id_usuario = ?
            """, (user_id,))
            cliente_data = cursor.fetchone()
            
            if cliente_data:
                # Obtener nombre del plan
                cursor.execute("SELECT nombre FROM planes WHERE id = ?", (cliente_data[3],))
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
        cursor.execute("SELECT id, role FROM users WHERE id = ?", (user_id,))
        user_data = cursor.fetchone()
        
        if not user_data:
            conn.close()
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        current_role = user_data[1]
        
        # Actualizar datos básicos del usuario
        cursor.execute("""
            UPDATE users 
            SET name = ?, email = ?, role = ?
            WHERE id = ?
        """, (req.name, req.email, req.role, user_id))
        
        # Si el usuario es cliente y tenemos datos de cliente para actualizar
        if req.role == "cliente" and any([req.dni, req.numero_telefono, req.fecha_nacimiento, req.genero]):
            # Verificar si ya existe un registro de cliente
            cursor.execute("SELECT id FROM clientes WHERE id_usuario = ?", (user_id,))
            cliente_exists = cursor.fetchone()
            
            if cliente_exists:
                # Actualizar datos existentes del cliente (solo los campos proporcionados)
                update_fields = []
                update_values = []
                
                if req.dni:
                    update_fields.append("dni = ?")
                    update_values.append(req.dni)
                
                if req.numero_telefono:
                    update_fields.append("numero_telefono = ?")
                    update_values.append(req.numero_telefono)
                
                if req.fecha_nacimiento:
                    update_fields.append("fecha_nacimiento = ?")
                    update_values.append(req.fecha_nacimiento)
                
                if req.genero:
                    update_fields.append("genero = ?")
                    update_values.append(req.genero)
                
                if update_fields:
                    update_fields.append("updated_at = CURRENT_TIMESTAMP")
                    update_values.append(user_id)
                    
                    update_query = f"UPDATE clientes SET {', '.join(update_fields)} WHERE id_usuario = ?"
                    cursor.execute(update_query, update_values)
        
        conn.commit()
        print(f"[DEBUG] Datos actualizados en BD para usuario {user_id}")
        
        # Obtener los datos actualizados del usuario
        cursor.execute("""
            SELECT id, name, email, role, email_verified, created_at, updated_at
            FROM users 
            WHERE id = ?
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
                       fecha_inscripcion, estado, created_at, updated_at
                FROM clientes 
                WHERE id_usuario = ?
            """, (user_id,))
            cliente_data = cursor.fetchone()
            
            if cliente_data:
                # Obtener nombre del plan
                cursor.execute("SELECT nombre FROM planes WHERE id = ?", (cliente_data[3],))
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
                    "updated_at": cliente_data[9]
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
                cursor.execute("SELECT id FROM users WHERE name = ? AND role = 'entrenador'", (clase.instructor,))
                instructor_result = cursor.fetchone()
                
                if not instructor_result:
                    clases_con_error.append({
                        "clase": f"{clase.fecha} {clase.hora} - ID:{clase.idClase}",
                        "error": f"Instructor '{clase.instructor}' no encontrado"
                    })
                    continue
                
                id_instructor = instructor_result[0]
                
                # Obtener información de capacidad desde gym_clases usando ID
                cursor.execute("SELECT max_participantes, nombre FROM gym_clases WHERE id = ?", (clase.idClase,))
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
                    WHERE fecha = ? AND hora = ? AND id_instructor = ? AND estado = 'programada'
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
                    VALUES (?, ?, ?, ?, ?)
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
        
        # Obtener todas las clases programadas activas con JOIN a gym_clases y users
        # Incluir el conteo real de reservas activas calculado dinámicamente
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
            WHERE cp.estado IN ('activa', 'programada', 'completada')
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
        cursor.execute("SELECT id, fecha, hora, id_clase FROM clases_programadas WHERE id = ?", (clase_id,))
        clase_existente = cursor.fetchone()
        
        if not clase_existente:
            conn.close()
            raise HTTPException(status_code=404, detail=f"Clase programada con ID {clase_id} no encontrada")
        
        # Eliminar la clase programada
        cursor.execute("DELETE FROM clases_programadas WHERE id = ?", (clase_id,))
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
        cursor.execute("SELECT id FROM clientes WHERE id = ?", (request.id_cliente,))
        cliente_existente = cursor.fetchone()
        if not cliente_existente:
            conn.close()
            raise HTTPException(status_code=404, detail="Cliente no encontrado")
        
        # Verificar que la clase existe y obtener información
        cursor.execute("""
            SELECT cp.id, cp.capacidad_maxima, gc.nombre as tipo_clase, cp.fecha, cp.hora
            FROM clases_programadas cp
            JOIN gym_clases gc ON cp.id_clase = gc.id
            WHERE cp.id = ? AND cp.estado IN ('activa', 'programada')
        """, (request.id_clase_programada,))
        clase_existente = cursor.fetchone()
        
        if not clase_existente:
            conn.close()
            raise HTTPException(status_code=404, detail="Clase programada no encontrada")
        
        # Contar reservas actuales para esta clase
        cursor.execute("""
            SELECT COUNT(*) FROM reservas 
            WHERE id_clase_programada = ? AND estado = 'activa'
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
            WHERE id_cliente = ? AND id_clase_programada = ? AND estado = 'activa'
        """, (request.id_cliente, request.id_clase_programada))
        reserva_existente = cursor.fetchone()
        
        if reserva_existente:
            conn.close()
            raise HTTPException(status_code=400, detail="Ya tienes una reserva activa para esta clase")
        
        # Crear la reserva
        cursor.execute("""
            INSERT INTO reservas (id_cliente, id_clase_programada, estado)
            VALUES (?, ?, 'activa')
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
    Obtener todas las reservas de un cliente
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
            WHERE r.id_cliente = ?
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
            WHERE r.id = ? AND r.estado = 'activa'
        """, (reserva_id,))
        reserva_existente = cursor.fetchone()
        
        if not reserva_existente:
            conn.close()
            raise HTTPException(status_code=404, detail="Reserva no encontrada o ya cancelada")
        
        # Eliminar la reserva completamente
        cursor.execute("""
            DELETE FROM reservas WHERE id = ?
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