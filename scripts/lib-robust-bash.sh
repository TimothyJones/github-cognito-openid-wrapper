#!/bin/bash -eu

# Check to see that we have a required binary on the path
function require_binary {
  if [ -z "${1:-}" ]; then
    error "${FUNCNAME[0]} requires an argument"
    exit 1
  fi

  if ! [ -x "$(command -v "$1")" ]; then
    error "The required executable '$1' is not on the path."
    exit 1
  fi
}
