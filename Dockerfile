FROM node:20

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build
ENV NODE_ENV=production

CMD ["npm", "run", "start"]