#!/bin/bash

# Exit immediately if any command fails
set -e

# Absolute path to the git repo root on the host machine (e.g. /Users/arthurfp/code/platform)
HOST_DIR="$(git rev-parse --show-toplevel)"

# Path where the project is mounted inside the Docker container
CONTAINER_DIR="/var/www"

# Docker container name — can be overridden via the DOCKER_PHP_CONTAINER env var
CONTAINER="${DOCKER_PHP_CONTAINER:-capco_application_1}"

# Accumulate translated arguments in an array.
# The command to run is passed as the first argument(s), followed by the files staged by lint-staged.
ARGS=()
for arg in "$@"; do
    if [[ "$arg" == "$HOST_DIR"* ]]; then
        # Argument is an absolute host file path — replace the host prefix with the container prefix
        # e.g. /Users/arthurfp/code/platform/src/Foo.php -> /var/www/src/Foo.php
        ARGS+=("${CONTAINER_DIR}${arg#$HOST_DIR}")
    else
        # Argument is a command, flag, or relative path — pass it through unchanged
        ARGS+=("$arg")
    fi
done

# Replace the current process with docker exec so the command's exit code propagates directly.
# -w sets the working directory inside the container.
exec docker exec -w "$CONTAINER_DIR" "$CONTAINER" "${ARGS[@]}"
