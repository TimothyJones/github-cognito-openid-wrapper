#!/bin/bash -eu

FILENAME=jwtRS256.key

echo "Creating"

ssh-keygen -t rsa -b 4096 -f "$FILENAME"
# Don't add passphrase
openssl rsa -in "$FILENAME" -pubout -outform PEM -out "$FILENAME".pub
