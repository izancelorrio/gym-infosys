FROM node:20-slim

WORKDIR /app

# Ensure Next build gets the Docker API URL at build time so server-side fetches
# inside the built app use the correct service address instead of localhost.
ENV NEXT_PUBLIC_API_URL=http://api:8000
ENV NEXT_PUBLIC_DOCKER=true

# Copiar package.json y package-lock.json primero para aprovechar la caché
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de los archivos del frontend
COPY . .

# Construir la aplicación Next.js para producción
RUN npm run build

# Exponer el puerto que usa Next.js
EXPOSE 3000

# Comando para iniciar el servidor Next.js
CMD ["npm", "start"]