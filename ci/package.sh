#!/bin/bash
set -euxo pipefail

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# shellcheck source=src/util.sh
source "$DIR/_common.sh"

APP="github-oidc"
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

DOCKER_BUILDKIT=docker build -f "$PROJECT_ROOT/Dockerfile" \
-t "${DOCKER_REGISTRY}${APP}:${DOCKER_TAG}" \
"$PROJECT_ROOT/"

if [ "$PUBLISH_TO_REGISTRY" = "true" ]; then
    docker push "${DOCKER_REGISTRY}${APP}:${DOCKER_TAG}"
fi