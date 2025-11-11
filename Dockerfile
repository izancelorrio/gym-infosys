FROM node:20-slim

WORKDIR /app

# Build argument to inject API URL at build time (useful when building inside Compose)
ARG NEXT_PUBLIC_API_URL=http://api:8000
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Copiar package.json y package-lock.json primero para aprovechar la caché
COPY package*.json ./

# Instalar dependencias de producción (usa npm ci si tienes package-lock)
RUN npm ci --production=false

# Copiar el resto de los archivos del frontend
COPY . .

# Construir la aplicación Next.js para producción
RUN npm run build

# Exponer el puerto que usa Next.js
EXPOSE 3000

# Comando para iniciar el servidor Next.js
CMD ["npm", "start"]