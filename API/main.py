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