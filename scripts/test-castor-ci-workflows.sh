#!/usr/bin/env bash
# Primarily an agent regression check for Castor workflows; external tools are mocked.
set -euo pipefail

project_directory="$(cd "$(dirname "$0")/.." && pwd)"
castor_binary="$(command -v castor)"
test_directory="$(mktemp -d)"
trap 'rm -rf "$test_directory"' EXIT
mkdir -p "$test_directory/bin"

cat > "$test_directory/bin/docker" <<'SH'
#!/bin/sh
printf '%s\n' "$*" >> "$CASTOR_WORKFLOW_RECORD"
case "$*" in
    *"/_snapshot/repository_qa/snap_qa?pretty"*)
        if [ "${CASTOR_ES_SNAPSHOT_MODE:-empty}" = missing ]; then
            printf '%s\n' 'curl: (22) The requested URL returned error: 404' >&2
            exit 22
        elif [ "${CASTOR_ES_SNAPSHOT_MODE:-empty}" = valid ]; then
            printf '%s\n' '{"snapshots":[{"indices":["capco_20260101000000"]}]}'
        else
            printf '%s\n' '{"snapshots":[]}'
        fi
        ;;
    *"/snap_qa/_restore?wait_for_completion=true"*)
        printf '%s\n' '{"snapshot":{"shards":{"failed":0}}}'
        ;;
    *"snap_qa?wait_for_completion=true"*)
        printf '%s\n' '{"snapshot":{"state":"SUCCESS","indices":["capco"]}}'
        ;;
esac
SH
chmod +x "$test_directory/bin/docker"
export PATH="$test_directory/bin:$PATH"
export CASTOR_WORKFLOW_RECORD="$test_directory/record"
export XDG_CACHE_HOME="$test_directory/cache"
unset CI_SHARED_TEST_DATA

run_castor() {
    : > "$CASTOR_WORKFLOW_RECORD"
    if ! "$castor_binary" --castor-file="$project_directory/castor.php" \
        "$@" --no-interaction > "$test_directory/output" 2>&1; then
        cat "$test_directory/output"
        return 1
    fi
}

for namespace in local ci; do
    run_castor "$namespace:app:console" --command-name=cache:clear --environment=test -- --no-warmup
    grep -Fq "'cache:clear' '--no-warmup'" "$CASTOR_WORKFLOW_RECORD"
    grep -Fq "'--env=test'" "$CASTOR_WORKFLOW_RECORD"

    run_castor "$namespace:app:console" --command-name=doctrine:query:sql --environment=test -- 'SELECT 1 AS value'
    grep -Fq "'doctrine:query:sql' 'SELECT 1 AS value'" "$CASTOR_WORKFLOW_RECORD"

    for task in restore-db restore-es-snapshot purge-rabbitmq; do
        : > "$CASTOR_WORKFLOW_RECORD"
        if "$castor_binary" --castor-file="$project_directory/castor.php" \
            "$namespace:qa:$task" --no-interaction > "$test_directory/output" 2>&1; then
            printf '%s accepted a missing --confirm.\n' "$namespace:qa:$task" >&2
            exit 1
        fi
        grep -Fq 'pass --confirm' "$test_directory/output"
        test ! -s "$CASTOR_WORKFLOW_RECORD"
    done

    run_castor "$namespace:qa:restore-db" --confirm
    grep -Fq 'mysql -h database -u root symfony < var/db.backup' "$CASTOR_WORKFLOW_RECORD"
    run_castor "$namespace:qa:purge-rabbitmq" --confirm
    grep -Fq 'rabbitmqctl purge_queue elasticsearch_indexation --vhost=capco' "$CASTOR_WORKFLOW_RECORD"

    run_castor "$namespace:qa:phpunit" --filter=MigrationCommandTest --tests=tests/Command --log-junit=results.xml
    grep -Fq -- "--filter='MigrationCommandTest' 'tests/Command' --log-junit='results.xml'" "$CASTOR_WORKFLOW_RECORD"
done

CI_SHARED_TEST_DATA=1 run_castor ci:qa:restore-db --confirm
grep -Fq 'bash .circleci/profile-mysql-restore.sh' "$CASTOR_WORKFLOW_RECORD"

run_castor local:app:composer -- require vendor/package
grep -Fq "composer 'require' 'vendor/package'" "$CASTOR_WORKFLOW_RECORD"
run_castor local:app:install-assets --environment=test
grep -Fq "assets:install public --symlink --env='test'" "$CASTOR_WORKFLOW_RECORD"

: > "$CASTOR_WORKFLOW_RECORD"
if "$castor_binary" --castor-file="$project_directory/castor.php" \
    local:qa:regenerate-test-data --no-interaction > "$test_directory/output" 2>&1; then
    printf 'local:qa:regenerate-test-data accepted a missing --confirm.\n' >&2
    exit 1
fi
grep -Fq 'pass --confirm' "$test_directory/output"
test ! -s "$CASTOR_WORKFLOW_RECORD"

run_castor local:qa:regenerate-test-data --confirm
grep -Fq "capco:reinit --force --env='test'" "$CASTOR_WORKFLOW_RECORD"
grep -Fq 'mysqldump --opt -h database -u root symfony > var/db.backup' "$CASTOR_WORKFLOW_RECORD"
grep -Fq 'repository_qa' "$CASTOR_WORKFLOW_RECORD"
grep -Fq 'snap_qa?wait_for_completion=true' "$CASTOR_WORKFLOW_RECORD"

run_castor ci:database:reset
grep -Fq "capco:reinit --force --env='test'" "$CASTOR_WORKFLOW_RECORD"
if grep -Fq -- '--migrate' "$CASTOR_WORKFLOW_RECORD"; then
    printf 'Reset unexpectedly applies migrations.\n' >&2
    exit 1
fi

run_castor local:database:reset
grep -Fq "capco:reinit --force --env='dev'" "$CASTOR_WORKFLOW_RECORD"
if grep -Fq 'mysqldump --opt -h database -u root symfony > var/db.backup' "$CASTOR_WORKFLOW_RECORD"; then
    printf 'Database reset unexpectedly regenerated QA data.\n' >&2
    exit 1
fi

: > "$CASTOR_WORKFLOW_RECORD"
CASTOR_ES_SNAPSHOT_MODE=valid "$castor_binary" --castor-file="$project_directory/castor.php" \
    local:qa:restore-es-snapshot --confirm --no-interaction > "$test_directory/output" 2>&1
grep -Fq 'snap_qa/_restore?wait_for_completion=true' "$CASTOR_WORKFLOW_RECORD"
grep -Fq 'http://elasticsearch:9200/_aliases' "$CASTOR_WORKFLOW_RECORD"

: > "$CASTOR_WORKFLOW_RECORD"
if "$castor_binary" --castor-file="$project_directory/castor.php" \
    local:qa:restore-es-snapshot --confirm --no-interaction > "$test_directory/output" 2>&1; then
    printf 'restore-es-snapshot accepted a missing snapshot.\n' >&2
    exit 1
fi
grep -Fq 'The Elasticsearch test snapshot is missing or empty' "$test_directory/output"

: > "$CASTOR_WORKFLOW_RECORD"
if CASTOR_ES_SNAPSHOT_MODE=missing "$castor_binary" --castor-file="$project_directory/castor.php" \
    local:qa:restore-es-snapshot --confirm --no-interaction > "$test_directory/output" 2>&1; then
    printf 'restore-es-snapshot accepted an HTTP 404 snapshot response.\n' >&2
    exit 1
fi
tr -d '[:space:]' < "$test_directory/output" | grep -Fq 'local:qa:regenerate-test-data--confirm'

: > "$CASTOR_WORKFLOW_RECORD"
if "$castor_binary" --castor-file="$project_directory/castor.php" \
    ci:qa:restore-es-snapshot --confirm --no-interaction > "$test_directory/output" 2>&1; then
    printf 'CI restore-es-snapshot accepted a missing snapshot.\n' >&2
    exit 1
fi
grep -Fq 'ci:qa:save-es-snap' "$test_directory/output"

run_castor ci:app:dump-graphql-schemas
for schema in public preview internal dev; do
    grep -Fq "graphql:dump-schema --env 'test' --schema '$schema'" "$CASTOR_WORKFLOW_RECORD"
done
if grep -Fq 'graphql:compile' "$CASTOR_WORKFLOW_RECORD"; then
    printf 'Schema export unexpectedly compiles GraphQL.\n' >&2
    exit 1
fi

for namespace in local ci; do
    run_castor "$namespace:app:generate-graphql" --backend-only --environment=test
    grep -Fq "graphql:compile --no-debug --env='test'" "$CASTOR_WORKFLOW_RECORD"
    grep -Fq 'composer dump-autoload' "$CASTOR_WORKFLOW_RECORD"
done

run_castor ci:infrastructures:build --no-cache
grep -Fq 'infrastructure/environments/testing.yml build --no-cache' "$CASTOR_WORKFLOW_RECORD"
run_castor ci:infrastructures:up --force-recreate --no-cache --build-at-up
grep -Fq 'infrastructure/environments/testing.yml build --no-cache' "$CASTOR_WORKFLOW_RECORD"
grep -Fq 'infrastructure/environments/testing.yml up --remove-orphans -d --force-recreate' "$CASTOR_WORKFLOW_RECORD"

printf 'CI workflow checks passed; no real Docker command was executed.\n'
