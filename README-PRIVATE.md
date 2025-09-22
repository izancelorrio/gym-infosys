# 🔐 Gym Management System - Repositorio Privado

## 🚀 Para repositorio privado de GitHub

### 📋 Pasos en tu servidor Linux Debian:

### 1. **Crear Personal Access Token en GitHub:**
1. Ve a: https://github.com/settings/tokens
2. **Generate new token (classic)**
3. **Selecciona permisos**: `repo` (Full control of private repositories)
4. **Copia el token** (empieza con `ghp_`)

### 2. **En tu servidor Debian, crear archivo .env:**
```bash
# Crear archivo de environment
nano .env

# Agregar tu token:
GITHUB_TOKEN=ghp_tu_token_aqui_muy_largo
```

### 3. **Desplegar con docker-compose:**
```bash
# Usar el compose para repo privado
docker-compose -f docker-compose.private.yml up -d

# O si quieres renombrar:
mv docker-compose.private.yml docker-compose.yml
docker-compose up -d
```

## 🔐 **Alternativa: SSH Keys (Más seguro)**

### 1. **Generar SSH key en el servidor:**
```bash
ssh-keygen -t rsa -b 4096 -C "tu-email@ejemplo.com"
cat ~/.ssh/id_rsa.pub
```

### 2. **Agregar la clave pública a GitHub:**
- Ve a GitHub > Settings > SSH and GPG keys
- Add new SSH key
- Pega el contenido de `id_rsa.pub`

### 3. **Usar SSH en docker-compose:**
```yaml
# Cambiar esta línea:
RUN git clone https://${GITHUB_TOKEN}@github.com/izancelorrio/gym-infosys.git repo

# Por esta (requiere SSH agent forwarding):
RUN git clone git@github.com:izancelorrio/gym-infosys.git repo
```

## 🌐 **Para Portainer Stack:**

### Opción 1: Variables de entorno
1. **Portainer > Stacks > Add Stack**
2. **Environment variables > Add variable:**
   - Name: `GITHUB_TOKEN`
   - Value: `ghp_tu_token_aqui`
3. **Usar `docker-compose.private.yml`** como contenido del stack

### Opción 2: Token en URL (menos seguro)
```yaml
RUN git clone https://ghp_TU_TOKEN_AQUI@github.com/izancelorrio/gym-infosys.git repo
```

## ⚠️ **Importante:**
- **Nunca** commitees el token en el repositorio
- Agrega `.env` al `.gitignore`
- Los tokens tienen fecha de expiración
- Usa los permisos mínimos necesarios

## 🚀 **Comandos para tu Debian:**

```bash
# 1. Crear el archivo .env
echo "GITHUB_TOKEN=ghp_tu_token_aqui" > .env

# 2. Desplegar
docker-compose -f docker-compose.private.yml up -d

# 3. Ver logs si hay problemas
docker-compose logs -f

# 4. Ver estado
docker ps
```

**¡Tu app estará disponible en http://tu-servidor:3000!** 🎉