FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production DATA_DIR=/data TZ=America/New_York
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
VOLUME /data
EXPOSE 4000
CMD ["npm", "start"]
