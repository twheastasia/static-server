FROM node:10.11-slim

WORKDIR /app

COPY package.json /app
RUN npm install
COPY . /app

CMD node serve-index.js

EXPOSE 3000
