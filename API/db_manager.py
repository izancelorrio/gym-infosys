#!/usr/bin/env python3
"""
Script para manejar la base de datos SQLite usando Python
No requiere instalación separada de SQLite3
"""

import sqlite3
import sys
import os
from pathlib import Path

def get_db_path():
    """Obtiene la ruta de la base de datos"""
    api_dir = Path(__file__).parent
    return api_dir / "users.db"

def execute_sql_file(sql_file_path):
    """Ejecuta un archivo SQL"""
    db_path = get_db_path()
    
    if not os.path.exists(sql_file_path):
        print(f"❌ Archivo SQL no encontrado: {sql_file_path}")
        return False
    
    try:
        with sqlite3.connect(db_path) as conn:
            with open(sql_file_path, 'r', encoding='utf-8') as f:
                sql_content = f.read()
                conn.executescript(sql_content)
                conn.commit()
        print(f"✅ Archivo SQL ejecutado correctamente: {sql_file_path}")
        return True
    except Exception as e:
        print(f"❌ Error ejecutando SQL: {e}")
        return False

def execute_query(query):
    """Ejecuta una consulta SQL y muestra los resultados"""
    db_path = get_db_path()
    
    try:
        with sqlite3.connect(db_path) as conn:
            conn.row_factory = sqlite3.Row  # Para acceder por nombre de columna
            cursor = conn.cursor()
            cursor.execute(query)
            
            if query.strip().upper().startswith('SELECT'):
                results = cursor.fetchall()
                if results:
                    # Mostrar headers
                    headers = list(results[0].keys())
                    print(" | ".join(headers))
                    print("-" * (len(" | ".join(headers))))
                    
                    # Mostrar datos
                    for row in results:
                        print(" | ".join(str(row[col]) for col in headers))
                    
                    print(f"\n📊 {len(results)} fila(s) encontrada(s)")
                else:
                    print("📭 No se encontraron resultados")
            else:
                conn.commit()
                print(f"✅ Consulta ejecutada. Filas afectadas: {cursor.rowcount}")
                
    except Exception as e:
        print(f"❌ Error ejecutando consulta: {e}")

def show_tables():
    """Muestra todas las tablas de la base de datos"""
    query = "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
    print("📋 Tablas en la base de datos:")
    execute_query(query)

def show_table_info(table_name):
    """Muestra información de una tabla específica"""
    print(f"📋 Información de la tabla '{table_name}':")
    query = f"PRAGMA table_info({table_name});"
    execute_query(query)
    
    print(f"\n📊 Contenido de la tabla '{table_name}':")
    query = f"SELECT * FROM {table_name} LIMIT 10;"
    execute_query(query)

def backup_database():
    """Crea un backup de la base de datos"""
    from datetime import datetime
    
    db_path = get_db_path()
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_path = db_path.parent / f"backup_users_{timestamp}.db"
    
    try:
        import shutil
        shutil.copy2(db_path, backup_path)
        print(f"✅ Backup creado: {backup_path}")
    except Exception as e:
        print(f"❌ Error creando backup: {e}")

def main():
    if len(sys.argv) < 2:
        print("🗃️  Utilidad de base de datos SQLite - Gym InfoSys")
        print("\n📖 Uso:")
        print("  python db_manager.py query \"SELECT * FROM users;\"")
        print("  python db_manager.py file schema.sql")
        print("  python db_manager.py tables")
        print("  python db_manager.py info <nombre_tabla>")
        print("  python db_manager.py backup")
        print("\n📝 Ejemplos:")
        print("  python db_manager.py tables")
        print("  python db_manager.py query \"SELECT COUNT(*) FROM users;\"")
        print("  python db_manager.py info users")
        return
    
    command = sys.argv[1].lower()
    
    if command == "query" and len(sys.argv) > 2:
        query = sys.argv[2]
        execute_query(query)
    
    elif command == "file" and len(sys.argv) > 2:
        sql_file = sys.argv[2]
        execute_sql_file(sql_file)
    
    elif command == "tables":
        show_tables()
    
    elif command == "info" and len(sys.argv) > 2:
        table_name = sys.argv[2]
        show_table_info(table_name)
    
    elif command == "backup":
        backup_database()
    
    else:
        print("❌ Comando no reconocido o faltan argumentos")
        print("Usa: python db_manager.py (sin argumentos) para ver la ayuda")

if __name__ == "__main__":
    main()