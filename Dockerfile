FROM node:20-slim

WORKDIR /app

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