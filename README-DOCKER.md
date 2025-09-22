# 🏋️ Gym Management System - Docker

Sistema de gestión de gimnasio con FastAPI + Next.js que se despliega automáticamente desde GitHub.

## 🚀 Despliegue con Portainer

### Opción 1: Portainer Stack (Recomendado)

1. **Ve a Portainer > Stacks > Add Stack**
2. **Nombre**: `gym-management`
3. **Copia el contenido de `docker-compose.yml`** de este repositorio
4. **Deploy the stack**

### Opción 2: Docker Compose local

```bash
# Clonar y desplegar
git clone https://github.com/izancelorrio/gym-infosys.git
cd gym-infosys
docker-compose up -d
```

## 🌐 Accesos

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentación**: http://localhost:8000/docs

## 👤 Usuarios de prueba

- **Admin**: admin@email.com / 123456
- **Entrenador**: entrenador@email.com / 123456  
- **Cliente**: cliente@email.com / 123456

## 📊 Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │────│    Backend      │────│   Database      │
│   Next.js:3000  │    │   FastAPI:8000  │    │   SQLite        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Características

✅ **Auto-clone desde GitHub**  
✅ **Base de datos SQLite persistente**  
✅ **Autenticación y autorización**  
✅ **Dashboard para admin y entrenadores**  
✅ **Gestión de usuarios y clases**  
✅ **API RESTful documentada**

## 📝 Comandos útiles

```bash
# Ver logs
docker logs gym-frontend
docker logs gym-backend

# Parar servicios
docker-compose down

# Actualizar desde GitHub
docker-compose build --no-cache
docker-compose up -d
```