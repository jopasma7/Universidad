# Usa una imagen base de Node.js
FROM node:18-bullseye-slim

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /tweets

# Copia los archivos de configuración necesarios
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia todo el código de tu proyecto al contenedor
COPY . .

# Expone el puerto que utiliza el servidor
EXPOSE 8085

# Comando para ejecutar el servidor
CMD ["npm", "run", "server"]