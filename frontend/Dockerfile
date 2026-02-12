FROM node:18-alpine

RUN apk add --no-cache git

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
