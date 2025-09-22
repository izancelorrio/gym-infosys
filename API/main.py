from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
import sqlite3
import bcrypt
import uuid
import smtplib
from email.mime.text import MIMEText
from datetime import datetime, timedelta
import socket

app = FastAPI()

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
# ----------------------------------------------------

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))

# Inicializar la base de datos y crear la tabla si no existe
def init_db():
    conn = sqlite3.connect("users.db")
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
    # Agregar fecha y hora actual al log
    current_time = datetime.utcnow().isoformat()
    
    body = await request.body()
    print(f"{current_time} INFO: {request.client.host} - \"{request.method} {request.url.path}\" Body: {body.decode('utf-8')}")
    response = await call_next(request)
    return response

@app.post("/login")
def login(req: LoginRequest):
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, password, email_verified FROM users WHERE email=?", (req.email,))
    user = cursor.fetchone()
    conn.close()
    if user and verify_password(req.password, user[3]):
        if not user[4]:
            raise HTTPException(status_code=403, detail="Debes verificar tu email antes de iniciar sesión")
        return {
            "success": True,
            "message": "Login exitoso",
            "user": {"id": user[0], "email": user[2], "name": user[1]}
        }
    else:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

@app.post("/register")
def register(req: RegisterRequest):
    print(f"[DEBUG] Intentando registrar usuario: {req.email}")
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    hashed_pw = hash_password(req.password)
    try:
        cursor.execute(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
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

@app.post("/change-password")
def change_password(req: ChangePasswordRequest):
    if not req.email or not req.current_password or not req.new_password:
        raise HTTPException(status_code=400, detail="Todos los campos son requeridos")
    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="La nueva contraseña debe tener al menos 6 caracteres")
    conn = sqlite3.connect("users.db")
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

@app.post("/send-reset-email")
def send_reset_email_endpoint(req: SendResetEmailRequest):
    conn = sqlite3.connect("users.db")
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

@app.post("/reset-password")
def reset_password(req: ResetPasswordRequest):
    conn = sqlite3.connect("users.db")
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

@app.post("/verify-email")
def verify_email(req: VerifyEmailRequest):
    conn = sqlite3.connect("users.db")
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

@app.get("/count-members")
def count_members():
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM users")
    count = cursor.fetchone()[0]
    conn.close()
    return {"count": count}