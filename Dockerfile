# syntax = docker/dockerfile:experimental
ARG PORT=3000
ARG NODE_LOG_LEVEL="info"
ARG GITHUB_CLIENT_ID
ARG GITHUB_CLIENT_SECRET
ARG COGNITO_REDIRECT_URI

## Stage 1 (production deps)
FROM node:alpine as base
RUN --mount=type=cache,target=/var/cache/apk ln -vs /var/cache/apk /etc/apk/cache && \
    apk add --update python3 bash openssh-keygen openssl

## Stage 2 (dev dependencies)
FROM base AS npm-dev
WORKDIR /opt
RUN --mount=type=cache,id=npm-dev,target=/root/.npm \
    --mount=type=bind,source=package.json,target=package.json,rw \
    --mount=type=bind,source=package-lock.json,target=package-lock.json,rw \
    npm install --ignore-scripts

## Stage 3 (prod dependencies)
FROM base AS npm-prod
WORKDIR /opt
RUN --mount=type=cache,id=npm-prod,target=/root/.npm \
    --mount=type=bind,source=package.json,target=package.json,rw \
    --mount=type=bind,source=package-lock.json,target=package-lock.json,rw \
    npm install --only=production --ignore-scripts
RUN ls -hlart /opt

# Stage 4 (build)
FROM npm-dev AS build
WORKDIR /opt
COPY . .
RUN ssh-keygen -t rsa -b 4096 -m PEM -f jwtRS256.key -N '' && openssl rsa -in jwtRS256.key -pubout -outform PEM -out jwtRS256.key.pub
RUN npm run build

# Stage 5 (final)
FROM base as server
COPY --from=build --chown=node:node /opt/config /opt/config
COPY --from=build --chown=node:node /opt/dist-web /opt/dist-web
COPY --from=npm-prod --chown=node:node /opt/node_modules /opt/node_modules
USER node
ENV PORT=${PORT}
ENV NODE_LOG_LEVEL=${NODE_LOG_LEVEL}
ENV GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID}
ENV GITHUB_CLIENT_SECRET=${GITHUB_CLIENT_SECRET}
ENV COGNITO_REDIRECT_URI=${COGNITO_REDIRECT_URI}
CMD ["node", "/opt/dist-web/server.js"]
