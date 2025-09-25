# 🏋️ Gym-InfoSys

Sistema de información integral para gimnasios desarrollado con Next.js y FastAPI.

## 🚀 Tecnologías

- **Frontend**: Next.js 13+ con TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: FastAPI (Python)
- **Base de Datos**: SQLite
- **Autenticación**: Context API personalizado

## 📁 Estructura del Proyecto

```
├── app/                     # Páginas de la aplicación (Next.js App Router)
│   ├── admin/              # Panel de administrador
│   ├── cliente/            # Panel de cliente
│   ├── entrenador/         # Panel de entrenador
│   └── page.tsx           # Página principal
├── components/             # Componentes reutilizables
│   ├── ui/                # Componentes base (shadcn/ui)
│   ├── header.tsx         # Navegación principal
│   ├── hero-section.tsx   # Sección principal con botones por rol
│   └── footer.tsx         # Pie de página
├── contexts/              # Contextos de React
│   └── auth-context.tsx   # Gestión de autenticación
├── API/                   # Backend FastAPI
│   ├── main.py           # Servidor principal
│   ├── db_manager.py     # Gestor de base de datos
│   
|── users.db               # Base de datos SQLite 
└── sqlite-tools/          # Scripts SQL para BD
```

## 👥 Roles de Usuario

- **👤 Cliente**: Registrar actividades, ver estadísticas, gestionar agenda
- **👨‍🏫 Entrenador**: Asignar entrenamientos, ver progreso de clientes
- **🔧 Admin**: Gestionar usuarios, programar clases, estadísticas globales

## 🏃‍♂️ Inicio Rápido

```bash
# Instalar dependencias
npm install

# Iniciar aplicación (Frontend + Backend)
./run

# Solo frontend
npm run dev

# Solo backend
cd API && python main.py
```

La aplicación estará disponible en:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:8000

## 📱 Funcionalidades Principales

- **Gestión de usuarios** por roles
- **Registro de actividades** (clases y ejercicios)
- **Estadísticas personalizadas** por usuario
- **Programación de clases** 
- **Dashboard específico** para cada rol
- **Sistema de autenticación** completo

## 🗂️ Archivos Clave

- `app/page.tsx` - Página principal con diferentes vistas por rol
- `contexts/auth-context.tsx` - Manejo de sesiones y roles
- `API/main.py` - Endpoints del backend
- `components/hero-section.tsx` - Lógica de navegación principal
- `sqlite-tools/*.sql` - Estructura de base de datos

---

**Desarrollado para el curso de Sistemas de Información - EINA**