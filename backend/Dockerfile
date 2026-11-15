FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
COPY prisma ./prisma/
RUN npm install
ENV DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/shopping_mall
ENV DIRECT_URL=postgresql://postgres:postgres@127.0.0.1:5432/shopping_mall
RUN npx prisma generate
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["node", "dist/src/index.js"]
