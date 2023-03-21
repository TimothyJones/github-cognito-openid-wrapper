#!/bin/bash

set -eu


yarn install --frozen-lockfile
yarn run format:check
yarn run lint
yarn run build
yarn run test