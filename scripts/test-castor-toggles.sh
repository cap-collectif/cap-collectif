#!/usr/bin/env bash
# Primarily an agent regression check for Castor feature toggles; Docker is mocked.
set -euo pipefail

project_directory="$(cd "$(dirname "$0")/.." && pwd)"
castor_binary="$(command -v castor)"
test_directory="$(mktemp -d)"
trap 'rm -rf "$test_directory"' EXIT
mkdir -p "$test_directory/bin"

cat > "$test_directory/castor.php" <<'PHP'
<?php
defined('CASTOR_USE_CHDIR') || define('CASTOR_USE_CHDIR', true);
require_once getenv('TOGGLE_TEST_SOURCE') . '/helpers.php';
require_once getenv('TOGGLE_TEST_SOURCE') . '/shared/app.php';
Castor\import(getenv('TOGGLE_TEST_SOURCE') . '/app.php');
Castor\import(getenv('TOGGLE_TEST_SOURCE') . '/ci_app.php');
PHP

cat > "$test_directory/bin/docker" <<'SH'
#!/bin/sh
printf '%s\n' "$*" > "$TOGGLE_TEST_RECORD"
SH
chmod +x "$test_directory/bin/docker"
export PATH="$test_directory/bin:$PATH"
export TOGGLE_TEST_SOURCE="$project_directory/.castor"
export TOGGLE_TEST_RECORD="$test_directory/record"
export XDG_CACHE_HOME="$test_directory/cache"

for action in enable disable; do
    for command in "$action" "local:app:toggle-$action" "ci:app:toggle-$action"; do
        "$castor_binary" --castor-file="$test_directory/castor.php" \
            "$command" multilangue --environment=dev --no-interaction > "$test_directory/output" 2>&1
        grep -Fq "capco:toggle:$action multilangue --no-interaction --env='dev'" "$TOGGLE_TEST_RECORD"

        rm -f "$TOGGLE_TEST_RECORD"
        if "$castor_binary" --castor-file="$test_directory/castor.php" \
            "$command" --no-interaction > "$test_directory/output" 2>&1; then
            printf 'Missing toggle was accepted by %s.\n' "$command" >&2
            exit 1
        fi
        grep -Fq 'Not enough arguments' "$test_directory/output"
        test ! -e "$TOGGLE_TEST_RECORD"
    done
done

printf 'Toggle argument checks passed; no real Docker command was executed.\n'
