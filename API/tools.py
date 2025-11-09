import sqlite3
import bcrypt
import requests
import os

def get_db_connection():
    """Obtiene la conexión a la base de datos PostgreSQL"""
    import psycopg2
    
    # Conexión SQLite (comentada)
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    db_path = os.path.join(project_root, "users.db")
    return sqlite3.connect(db_path)
    """
    
    # Conexión PostgreSQL
    return psycopg2.connect(
        host="192.168.0.201",
        database="infosis_db",
        user="icelorrio",
        password="y^FL^@2KDqDv%H&x"
    )

def borrar_usuarios():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM users")
    conn.commit()
    conn.close()
    print("Todos los usuarios han sido eliminados.")

def borrar_reset_tokens():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM reset_tokens")
    conn.commit()
    conn.close()
    print("Todos los reset_tokens han sido eliminados.")

def is_bcrypt_hash(pw: str) -> bool:
    return pw.startswith("$2b$") or pw.startswith("$2a$") or pw.startswith("$2y$")

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def encriptar_passwords():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, password FROM users")
    users = cursor.fetchall()
    updated = 0
    for user_id, pw in users:
        if not is_bcrypt_hash(pw):
            new_hashed = hash_password(pw)
            cursor.execute("UPDATE users SET password%s WHERE id%s", (new_hashed, user_id))
            updated += 1
    conn.commit()
    conn.close()
    print(f"Contraseñas actualizadas: {updated}")

def contar_usuarios_via_api():
    url = "http://localhost:8000/count-members"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        print(f"Número de usuarios registrados (API): {data['count']}")
    except Exception as e:
        print("Error al consultar el endpoint /count-members:", e)

def generar_usuarios_demo():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Verificar que la tabla users existe
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users';")
    if not cursor.fetchone():
        print("Error: La tabla 'users' no existe en la base de datos.")
        conn.close()
        return
    
    # Lista de nombres comunes españoles
    nombres_usuarios = [
        "Carlos García",
        "María López",
        "Juan Martínez", 
        "Ana Rodríguez",
        "Pedro Sánchez",
        "Laura Fernández",
        "Miguel González",
        "Carmen Ruiz",
        "Antonio Jiménez",
        "Isabel Moreno"
    ]
    
    usuarios_creados = 0
    
    for nombre in nombres_usuarios:
        # Generar email basado en el nombre (primera parte del nombre + @email.com)
        email = nombre.lower().split()[0] + "@email.com"
        password_hash = hash_password("123456")
        
        try:
            # Insertar usuario con email_verified = 1
            cursor.execute(
                "INSERT INTO users (name, email, password, email_verified, role) VALUES (?, ?, ?, ?, ?)",
                (nombre, email, password_hash, 1, "usuario")
            )
            usuarios_creados += 1
            print(f"Usuario creado: {nombre} ({email})")
        except sqlite3.IntegrityError:
            print(f"El usuario {email} ya existe, omitiendo...")
    
    conn.commit()
    conn.close()
    print(f"\nTotal de usuarios demo creados: {usuarios_creados}")

def menu():
    while True:
        print("\nHerramientas de administración:")
        print("1. Borrar todos los usuarios")
        print("2. Borrar todos los reset_tokens")
        print("3. Encriptar contraseñas de usuarios (bcrypt)")
        print("4. Mostrar número de usuarios (vía endpoint /count-members)")
        print("5. Generar 10 usuarios demo")
        print("0. Salir")
        opcion = input("Selecciona una opción: ")
        if opcion == "1":
            borrar_usuarios()
        elif opcion == "2":
            borrar_reset_tokens()
        elif opcion == "3":
            encriptar_passwords()
        elif opcion == "4":
            contar_usuarios_via_api()
        elif opcion == "5":
            generar_usuarios_demo()
        elif opcion == "0":
            print("Saliendo...")
            break
        else:
            print("Opción no válida.")

if __name__ == "__main__":
    menu()
