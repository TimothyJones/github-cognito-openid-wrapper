## Stage 1 (production deps)
FROM node:12.19.0-alpine3.11 as base
RUN mkdir /rsa
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
    npm install --ignore-scripts

## Stage 3 (prod dependencies)
FROM base AS npm-prod
WORKDIR /opt
RUN --mount=type=cache,id=npm-prod,target=/root/.npm \
    --mount=type=bind,source=package.json,target=package.json,ro \
    --mount=type=bind,source=package-lock.json,target=package-lock.json,ro \
    npm install --only=production --ignore-scripts

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
ARG PORT=3000
ARG NODE_LOG_LEVEL="info"
ARG GITHUB_CLIENT_ID
ARG GITHUB_CLIENT_SECRET
ARG COGNITO_REDIRECT_URI

COPY --from=npm-prod --chown=node:node /opt/node_modules /opt/node_modules
COPY --chown=node:node package.json /opt/package.json
COPY --from=build --chown=node:node /opt/dist-web /opt/dist-web
ENV PORT=${PORT}
ENV NODE_LOG_LEVEL=${NODE_LOG_LEVEL}
ENV GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID}
ENV GITHUB_CLIENT_SECRET=${GITHUB_CLIENT_SECRET}
ENV COGNITO_REDIRECT_URI=${COGNITO_REDIRECT_URI}

USER node
CMD ["npm", "run", "docker:start"]
