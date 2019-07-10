#!/bin/bash -eu
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd)" # Figure out where the script is running
. "$SCRIPT_DIR"/lib-robust-bash.sh # load the robust bash library
PROJECT_ROOT="$SCRIPT_DIR"/.. # Figure out where the project directory is

require_binary ssh-keygen
require_binary openssl

KEY_FILE="$PROJECT_ROOT"/jwtRS256.key

if [ ! -f "$KEY_FILE" ]; then
  echo "  --- Creating private key, as it does not exist ---"
  ssh-keygen -t rsa -b 4096 -m PEM -f "$KEY_FILE" -N ''
  openssl rsa -in "$KEY_FILE" -pubout -outform PEM -out "$KEY_FILE".pub
fi
