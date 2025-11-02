FROM node:20-alpine AS builder

ARG OAUTH_URL
ARG API_URL
ARG OAUTH_CLIENT_ID
ARG OAUTH_SCOPE
ARG BUILD_DATE

ENV OAUTH_URL=$OAUTH_URL
ENV API_URL=$API_URL
ENV OAUTH_CLIENT_ID=$OAUTH_CLIENT_ID
ENV OAUTH_SCOPE=$OAUTH_SCOPE
ENV BUILD_DATE=$BUILD_DATE

WORKDIR /app

COPY package*.json ./
RUN rm -f package-lock.json

RUN yarn install

COPY . .

RUN yarn web:build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]