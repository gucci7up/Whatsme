FROM node:18-alpine

# Install Chromium and dependencies
# CACHEBUST: 2026-02-13-v2 (Force Rebuild)
RUN apk add --no-cache \
    git \
    chromium

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
