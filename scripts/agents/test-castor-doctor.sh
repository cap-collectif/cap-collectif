#!/usr/bin/env bash
# Primarily an agent regression check for Castor's local environment doctor; tools are mocked.
set -euo pipefail

project_directory="$(cd "$(dirname "$0")/../.." && pwd)"
castor_binary="$(command -v castor)"
test_directory="$(mktemp -d)"
trap 'rm -rf "$test_directory"' EXIT

mkdir -p "$test_directory/bin"
cp "$project_directory/package.json" "$project_directory/.nvmrc" "$project_directory/.castor-version" "$test_directory/"

cat > "$test_directory/castor.php" <<'PHP'
<?php
defined('CASTOR_USE_CHDIR') || define('CASTOR_USE_CHDIR', true);
Castor\import(getenv('DOCTOR_TEST_SOURCE'));
PHP

cat > "$test_directory/tool" <<'SH'
#!/bin/sh
tool="${0##*/}"
printf '%s|%s|%s\n' "$tool" "$*" "${COREPACK_ENABLE_NETWORK:-unset}" >> "$DOCTOR_TEST_LOG"

case "$tool" in
    docker)
        if [ "$DOCTOR_TEST_MODE" = docker-fails ]; then exit 7; fi
        if [ "$1" = info ] && [ "$DOCTOR_TEST_MODE" = daemon-stopped ]; then exit 7; fi
        printf 'Docker 27.0.0\n'
        ;;
    node)
        if [ "$DOCTOR_TEST_MODE" = wrong-node ]; then
            printf 'v0.0.0\n'
        else
            printf '%s\n' "$DOCTOR_TEST_NODE_VERSION"
        fi
        ;;
    corepack)
        if [ "$1" = yarn ]; then
            printf '%s\n' "$DOCTOR_TEST_YARN_VERSION"
        else
            printf '0.34.0\n'
        fi
        ;;
    castor) printf 'Castor %s\n' "$DOCTOR_TEST_CASTOR_VERSION" ;;
    *) printf '%s 1.0.0\n' "$tool" ;;
esac
SH

for tool in git docker node corepack castor mkcert curl symfony; do
    cp "$test_directory/tool" "$test_directory/bin/$tool"
    chmod +x "$test_directory/bin/$tool"
done

node_version="$(tr -d '[:space:]' < "$project_directory/.nvmrc")"
castor_version="$(tr -d '[:space:]' < "$project_directory/.castor-version")"
yarn_version="$(sed -n 's/.*"packageManager": "yarn@\([^"]*\)".*/\1/p' "$project_directory/package.json")"

run_doctor() {
    local mode="$1" expected_status="$2" actual_status=0
    : > "$test_directory/commands"

    if PATH="$test_directory/bin" \
        DOCTOR_TEST_SOURCE="$project_directory/.castor/system.php" \
        DOCTOR_TEST_LOG="$test_directory/commands" \
        DOCTOR_TEST_MODE="$mode" \
        DOCTOR_TEST_NODE_VERSION="$node_version" \
        DOCTOR_TEST_CASTOR_VERSION="$castor_version" \
        DOCTOR_TEST_YARN_VERSION="$yarn_version" \
        XDG_CACHE_HOME="$test_directory/cache" \
        "$castor_binary" --castor-file="$test_directory/castor.php" \
            local:system:doctor --no-ansi --no-interaction > "$test_directory/output" 2>&1; then
        actual_status=0
    else
        actual_status="$?"
    fi

    if [ "$actual_status" -ne "$expected_status" ]; then
        cat "$test_directory/output"
        printf 'Unexpected status for %s: %s\n' "$mode" "$actual_status" >&2
        exit 1
    fi

    # Every run must reach the later checks, even after an earlier failure.
    grep -Fq 'node|--version|' "$test_directory/commands"
    grep -Fq 'curl|--version|' "$test_directory/commands"
    grep -Fq 'corepack|yarn --version|0' "$test_directory/commands"
    if grep -Eq '^(php|composer|yarn)\|' "$test_directory/commands"; then
        printf 'Doctor invoked an unsupported host dependency.\n' >&2
        exit 1
    fi
}

run_doctor ready 0
grep -Fq 'All local prerequisites are ready.' "$test_directory/output"

run_doctor docker-fails 1
grep -Fq '[ERROR] Docker CLI' "$test_directory/output"

run_doctor daemon-stopped 1
grep -Fq '[OK] Docker CLI' "$test_directory/output"
grep -Fq 'daemon is stopped or inaccessible' "$test_directory/output"

run_doctor wrong-node 1
grep -Fq '[VERSION] Node.js' "$test_directory/output"

rm "$test_directory/bin/mkcert"
run_doctor missing-tool 1
grep -Fq '[MISSING] mkcert' "$test_directory/output"

printf 'Doctor regression checks passed; only simulated tools were used.\n'
