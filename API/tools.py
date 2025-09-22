import sqlite3
import bcrypt
import requests

def borrar_usuarios():
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    cursor.execute("DELETE FROM users")
    conn.commit()
    conn.close()
    print("Todos los usuarios han sido eliminados.")

def borrar_reset_tokens():
    conn = sqlite3.connect("users.db")
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
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, password FROM users")
    users = cursor.fetchall()
    updated = 0
    for user_id, pw in users:
        if not is_bcrypt_hash(pw):
            new_hashed = hash_password(pw)
            cursor.execute("UPDATE users SET password=? WHERE id=?", (new_hashed, user_id))
            updated += 1
    conn.commit()
    conn.close()
    print(f"Contraseñas actualizadas: {updated}")

def add_email_verified_column():
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    # Añade la columna solo si no existe
    cursor.execute("PRAGMA table_info(users)")
    columns = [col[1] for col in cursor.fetchall()]
    if "email_verified" not in columns:
        cursor.execute("ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0")
        conn.commit()
        print("Columna email_verified añadida a la tabla users.")
    else:
        print("La columna email_verified ya existe en la tabla users.")
    conn.close()

def contar_usuarios_via_api():
    url = "http://localhost:8000/count-members"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        print(f"Número de usuarios registrados (API): {data['count']}")
    except Exception as e:
        print("Error al consultar el endpoint /count-members:", e)

def menu():
    while True:
        print("\nHerramientas de administración:")
        print("1. Borrar todos los usuarios")
        print("2. Borrar todos los reset_tokens")
        print("3. Encriptar contraseñas de usuarios (bcrypt)")
        print("4. Mostrar número de usuarios (vía endpoint /count-members)")
        print("5. Añadir columna email_verified a users")
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
            add_email_verified_column()
        elif opcion == "0":
            print("Saliendo...")
            break
        else:
            print("Opción no válida.")

if __name__ == "__main__":
    menu()
