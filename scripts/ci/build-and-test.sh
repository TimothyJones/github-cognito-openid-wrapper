#!/bin/bash

set -e
set -u


npm ci
npm run format:check
npm run lint
npm run build
npm run test