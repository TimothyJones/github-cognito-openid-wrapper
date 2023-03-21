FROM node:18.15.0-alpine3.17 as base
WORKDIR /tmp
RUN apk add --update python3 bash openssh-keygen openssl
WORKDIR /opt
RUN --mount=type=bind,source=package.json,target=package.json,ro \
    --mount=type=bind,source=yarn.lock,target=yarn.lock,ro \
    yarn install --frozen-lockfile

ENV NODE_ENV=production
RUN mkdir ./src
RUN --mount=type=bind,source=src,target=./src,ro \
    --mount=type=bind,source=webpack.config.js,target=webpack.config.js,ro \
    --mount=type=bind,source=package.json,target=package.json,ro \
    --mount=type=bind,source=yarn.lock,target=yarn.lock,ro \
    yarn build

FROM node:18.15.0-alpine3.17

COPY --from=base --chown=node:node /opt/node_modules /opt/node_modules
COPY --from=base --chown=node:node /opt/dist-web /opt/dist-web

USER node
ENTRYPOINT ["node", "/opt/dist-web/server.js"]
