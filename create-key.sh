#!/bin/bash -eu

FILENAME=./jwtRS256.key

if [ ! -f "$FILENAME" ]; then
  echo "  --- Creating private key, as it does not exist ---"
  ssh-keygen -t rsa -b 4096 -f "$FILENAME" -N ''
  openssl rsa -in "$FILENAME" -pubout -outform PEM -out "$FILENAME".pub
fi
