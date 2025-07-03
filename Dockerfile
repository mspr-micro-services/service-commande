# Étape 1 : choisir l'image officielle Node.js (version LTS)
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3001

CMD ["node", "src/server.js"]
