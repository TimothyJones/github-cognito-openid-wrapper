# syntax=docker/dockerfile:experimental
FROM node:12.19.0-alpine3.11 as base
WORKDIR /tmp
RUN apk add --update python3 bash openssh-keygen openssl

WORKDIR /opt
RUN --mount=type=bind,source=package.json,target=package.json,ro \
    --mount=type=bind,source=package-lock.json,target=package-lock.json,ro \
    npm ci --ignore-scripts

RUN mkdir ./src
RUN --mount=type=bind,source=src,target=./src,ro \
    --mount=type=bind,source=webpack.config.js,target=webpack.config.js,ro \
    --mount=type=bind,source=package.json,target=package.json,ro \
    --mount=type=bind,source=package-lock.json,target=package-lock.json,ro \
    npm run build

FROM node:12.19.0-alpine3.11
COPY --from=base --chown=node:node /opt/node_modules /opt/node_modules
COPY --from=base --chown=node:node /opt/dist-web /opt/dist-web

ENV PORT=${PORT}
ENV NODE_LOG_LEVEL=${NODE_LOG_LEVEL}
ENV GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID}
ENV GITHUB_CLIENT_SECRET=${GITHUB_CLIENT_SECRET}
ENV COGNITO_REDIRECT_URI=${COGNITO_REDIRECT_URI}
ENV JWT_RSA_KEY=${JWT_RSA_KEY}
ENV JWT_RSA_PUB=${JWT_RSA_PUB}
USER node
ENTRYPOINT ["node", "/opt/dist-web/server.js"]
