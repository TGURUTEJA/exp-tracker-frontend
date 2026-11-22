#!/usr/bin/env bash
set -e

ENV_FILE="../.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: $ENV_FILE not found."
  exit 1
fi

sed -i 's/\r$//' "$ENV_FILE"

set -a
source "$ENV_FILE"
set +a

if [ -n "$1" ]; then
  export UI_PORT="$1"
else
  export UI_PORT="${UI_PORT:-3030}"
fi

npm run dev -- -p "$UI_PORT"