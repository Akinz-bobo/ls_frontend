FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm config set fetch-timeout 600000 && npm config set fetch-retry-mintimeout 10000 && npm config set fetch-retry-maxtimeout 60000 && npm install --legacy-peer-deps

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]