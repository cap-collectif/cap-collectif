#!/usr/bin/env bash
# Primarily an agent regression check for Castor terminal output; Docker is mocked.
set -euo pipefail

project_directory="$(cd "$(dirname "$0")/../.." && pwd)"
castor_binary="$(command -v castor)"
test_directory="$(mktemp -d)"
trap 'rm -rf "$test_directory"' EXIT

mkdir -p "$test_directory/bin"
cat > "$test_directory/castor.php" <<'PHP'
<?php
defined('CASTOR_USE_CHDIR') || define('CASTOR_USE_CHDIR', true);
require_once getenv('COMPOSE_TEST_SOURCE') . '/helpers.php';
require_once getenv('COMPOSE_TEST_SOURCE') . '/shared/infrastructures.php';
Castor\import(getenv('COMPOSE_TEST_SOURCE') . '/infrastructures.php');
PHP

cat > "$test_directory/bin/docker" <<'SH'
#!/bin/sh
stdout_tty=no
stderr_tty=no
if [ -t 1 ]; then stdout_tty=yes; fi
if [ -t 2 ]; then stderr_tty=yes; fi
printf 'stdout=%s stderr=%s\n' "$stdout_tty" "$stderr_tty" > "$COMPOSE_TEST_RECORD"
printf '%s\n' "$*" >> "$COMPOSE_TEST_RECORD"
exit "${COMPOSE_TEST_EXIT_CODE:-0}"
SH
chmod +x "$test_directory/bin/docker"

export PATH="$test_directory/bin:$PATH"
export COMPOSE_TEST_SOURCE="$project_directory/.castor"
export COMPOSE_TEST_RECORD="$test_directory/record"
export XDG_CACHE_HOME="$test_directory/cache"
unset CI

cat > "$test_directory/run-castor" <<'SH'
#!/bin/sh
"$COMPOSE_TEST_CASTOR" --castor-file="$COMPOSE_TEST_FILE" \
    local:infrastructures:restart --environment="$1" --no-interaction
printf '%s\n' "$?" > "$COMPOSE_TEST_STATUS"
SH
chmod +x "$test_directory/run-castor"
export COMPOSE_TEST_CASTOR="$castor_binary"
export COMPOSE_TEST_FILE="$test_directory/castor.php"
export COMPOSE_TEST_STATUS="$test_directory/status"

run_in_terminal() {
    local environment="$1"
    if [ "$(uname -s)" = Darwin ]; then
        script -q "$test_directory/transcript" "$test_directory/run-castor" "$environment" \
            < /dev/null > "$test_directory/output" 2>&1
    else
        script -q -e -c "\"$test_directory/run-castor\" $environment" \
            "$test_directory/transcript" < /dev/null > "$test_directory/output" 2>&1
    fi
}

run_in_terminal local
grep -Fxq '0' "$test_directory/status"
if ! grep -Fq 'stdout=yes stderr=yes' "$test_directory/record"; then
    cat "$test_directory/record"
    printf 'Local Compose did not receive the terminal.\n' >&2
    exit 1
fi

run_in_terminal ci
grep -Fxq '0' "$test_directory/status"
grep -Fq 'stderr=no' "$test_directory/record"
grep -Fq 'infrastructure/environments/testing.yml' "$test_directory/record"

CI=1 run_in_terminal local
grep -Fxq '0' "$test_directory/status"
grep -Fq 'stderr=no' "$test_directory/record"

"$castor_binary" --castor-file="$test_directory/castor.php" \
    local:infrastructures:restart < /dev/null > "$test_directory/output" 2>&1
grep -Fq 'stderr=no' "$test_directory/record"

# A failing Compose command must still fail Castor after changing its context.
COMPOSE_TEST_EXIT_CODE=7 run_in_terminal local
grep -Fq 'stdout=yes stderr=yes' "$test_directory/record"
if grep -Fxq '0' "$test_directory/status"; then
    printf 'Interactive Compose failure was swallowed.\n' >&2
    exit 1
fi

if COMPOSE_TEST_EXIT_CODE=7 "$castor_binary" --castor-file="$test_directory/castor.php" \
    local:infrastructures:restart --no-interaction < /dev/null > "$test_directory/output" 2>&1; then
    printf 'Compose failure was swallowed.\n' >&2
    exit 1
fi

printf 'Compose terminal checks passed; no real Docker command was executed.\n'
