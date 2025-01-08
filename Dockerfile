FROM node:23-alpine

WORKDIR /deploy

RUN apk update && apk add --no-cache bash

COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build

EXPOSE 4000
CMD ["node", "dist/js/server.js"]
