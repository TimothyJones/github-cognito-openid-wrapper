#!/bin/bash
set -euxo pipefail

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

source $DIR/_common.sh

APP="identity-server"
case $PUBLISH in
    true)
        PUBLISH_TO_REGISTRY="true"
        ;;
    local)
        PUBLISH_TO_REGISTRY="false"
        ;;
    *)
        # Just build the container but do not publish it to the registry
        PUBLISH_TO_REGISTRY="false"
        ;;

esac

docker build -f $PROJECT_ROOT/src/Dockerfile -t ${DOCKER_REGISTRY}${APP}:${DOCKER_TAG} $PROJECT_ROOT/src
if [ "$PUBLISH_TO_REGISTRY" = "true" ]; then
    docker push ${DOCKER_REGISTRY}${APP}:${DOCKER_TAG}
fi