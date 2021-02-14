# syntax=docker/dockerfile:experimental

## Stage 1 (production deps)
FROM node:12.19.0-alpine3.11 as base
RUN mkdir /rsa

# TODO: decide if RSA pair should be loaded from SSM
RUN --mount=type=cache,id=apk,target=/var/cache/apk ln -vs /var/cache/apk /etc/apk/cache && \
    apk add --update python3 bash openssh-keygen openssl && \
    ssh-keygen -t rsa -b 4096 -m PEM -f /rsa/jwtRS256.key -N '' && \
    openssl rsa -in /rsa/jwtRS256.key -pubout -outform PEM -out /rsa/jwtRS256.key.pub

## Stage 2 (dev dependencies)
FROM base AS npm-dev
WORKDIR /opt
RUN --mount=type=cache,id=npm-dev,target=/root/.npm \
    --mount=type=bind,source=package.json,target=package.json,ro \
    --mount=type=bind,source=package-lock.json,target=package-lock.json,ro \
    npm ci --ignore-scripts

## Stage 3 (prod dependencies)
FROM base AS npm-prod
WORKDIR /opt
RUN --mount=type=cache,id=npm-prod,target=/root/.npm \
    --mount=type=bind,source=package.json,target=package.json,ro \
    --mount=type=bind,source=package-lock.json,target=package-lock.json,ro \
    npm ci --only=production --ignore-scripts

# Stage 4 (build)
FROM npm-dev AS build
WORKDIR /opt
RUN mkdir ./src
RUN --mount=type=bind,source=src,target=./src,ro \
    --mount=type=cache,from=base,id=apk,source=/rsa/jwtRS256.key,target=/opt/jwtRS256.key \
    --mount=type=cache,from=base,id=apk,source=/rsa/jwtRS256.key.pub,target=/opt/jwtRS256.key.pub \
    --mount=type=cache,id=npm-prod,target=/root/.npm \
    --mount=type=bind,source=webpack.config.js,target=webpack.config.js,ro \
    --mount=type=bind,source=package.json,target=package.json,ro \
    --mount=type=bind,source=package-lock.json,target=package-lock.json,ro \
    npm run build

# Stage 5 (final)
FROM node:12.19.0-alpine3.11
COPY --from=npm-prod --chown=node:node /opt/node_modules /opt/node_modules
COPY --from=build --chown=node:node /opt/dist-web /opt/dist-web
COPY --from=base --chown=node:node /rsa/jwtRS256.key /opt/jwtRS256.key
COPY --from=base --chown=node:node /rsa/jwtRS256.key.pub /opt/jwtRS256.key.pub

ENV PORT=${PORT}
ENV NODE_LOG_LEVEL=${NODE_LOG_LEVEL}
ENV GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID}
ENV GITHUB_CLIENT_SECRET=${GITHUB_CLIENT_SECRET}
ENV COGNITO_REDIRECT_URI=${COGNITO_REDIRECT_URI}

USER node
ENTRYPOINT ["node", "/opt/dist-web/server.js"]
