#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

export DOCKER_REGISTRY=${DOCKER_REGISTRY:-}
export PUBLISH=${PUBLISH:-false}
export PROJECT_ROOT=$DIR/..