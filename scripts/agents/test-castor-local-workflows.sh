#!/usr/bin/env bash
# Primarily an agent regression check for Castor workflows; external tools are mocked.
set -euo pipefail

project_directory="$(cd "$(dirname "$0")/../.." && pwd)"
castor_binary="$(command -v castor)"
test_directory="$(mktemp -d)"
trap 'rm -rf "$test_directory"' EXIT
mkdir -p "$test_directory/bin"

cat > "$test_directory/bin/docker" <<'SH'
#!/bin/sh
printf '%s\n' "$*" >> "$CASTOR_WORKFLOW_RECORD"
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

run_castor "app:console" --command-name=cache:clear --environment=test -- --no-warmup
grep -Fq "'cache:clear' '--no-warmup'" "$CASTOR_WORKFLOW_RECORD"
grep -Fq "'--env=test'" "$CASTOR_WORKFLOW_RECORD"

run_castor "app:console" --command-name=doctrine:query:sql --environment=test -- 'SELECT 1 AS value'
grep -Fq "'doctrine:query:sql' 'SELECT 1 AS value'" "$CASTOR_WORKFLOW_RECORD"

for task in restore-db restore-es-snapshot purge-rabbitmq; do
    : > "$CASTOR_WORKFLOW_RECORD"
    if "$castor_binary" --castor-file="$project_directory/castor.php" \
        "qa:$task" --no-interaction > "$test_directory/output" 2>&1; then
        printf '%s accepted a missing --confirm.\n' "qa:$task" >&2
        exit 1
    fi
    grep -Fq 'pass --confirm' "$test_directory/output"
    test ! -s "$CASTOR_WORKFLOW_RECORD"
done

run_castor "qa:restore-db" --confirm
grep -Fq 'mysql -h database -u root symfony < var/db.backup' "$CASTOR_WORKFLOW_RECORD"
run_castor "qa:purge-rabbitmq" --confirm
grep -Fq 'rabbitmqctl purge_queue elasticsearch_indexation --vhost=capco' "$CASTOR_WORKFLOW_RECORD"

run_castor "qa:phpunit" --filter=MigrationCommandTest --tests=tests/Command --log-junit=results.xml
grep -Fq "'scripts/qa/phpunit.php' '--testsuite=default' '--filter=MigrationCommandTest' '--tests=tests/Command' '--log-junit=results.xml'" "$CASTOR_WORKFLOW_RECORD"
run_castor "qa:phpunit" --testsuite="Unit Tests"
grep -Fq -- "'--testsuite=Unit Tests'" "$CASTOR_WORKFLOW_RECORD"


CI_SHARED_TEST_DATA=1 run_castor qa:restore-db --confirm
grep -Fq 'bash .circleci/profile-mysql-restore.sh' "$CASTOR_WORKFLOW_RECORD"

run_castor app:composer -- require vendor/package
grep -Fq "composer 'require' 'vendor/package'" "$CASTOR_WORKFLOW_RECORD"
run_castor app:install-assets --environment=test
grep -Fq "assets:install public --symlink --env='test'" "$CASTOR_WORKFLOW_RECORD"

: > "$CASTOR_WORKFLOW_RECORD"
if "$castor_binary" --castor-file="$project_directory/castor.php" \
    qa:regenerate-test-data --no-interaction > "$test_directory/output" 2>&1; then
    printf 'qa:regenerate-test-data accepted a missing --confirm.\n' >&2
    exit 1
fi
grep -Fq 'pass --confirm' "$test_directory/output"
test ! -s "$CASTOR_WORKFLOW_RECORD"

run_castor qa:regenerate-test-data --confirm
grep -Fq "capco:reinit --force --env='test'" "$CASTOR_WORKFLOW_RECORD"
grep -Fq 'mysqldump --opt -h database -u root symfony > var/db.backup' "$CASTOR_WORKFLOW_RECORD"
grep -Fq 'php scripts/qa/elasticsearch-snapshot.php save' "$CASTOR_WORKFLOW_RECORD"

run_castor database:reset
grep -Fq "capco:reinit --force --env='dev'" "$CASTOR_WORKFLOW_RECORD"
if grep -Fq 'mysqldump --opt -h database -u root symfony > var/db.backup' "$CASTOR_WORKFLOW_RECORD"; then
    printf 'Database reset unexpectedly regenerated QA data.\n' >&2
    exit 1
fi

run_castor qa:restore-es-snapshot --confirm
grep -Fq 'php scripts/qa/elasticsearch-snapshot.php restore --confirm' "$CASTOR_WORKFLOW_RECORD"

run_castor "app:generate-graphql" --backend-only --environment=test
grep -Fq "graphql:compile --no-debug --env='test'" "$CASTOR_WORKFLOW_RECORD"
grep -Fq 'composer dump-autoload' "$CASTOR_WORKFLOW_RECORD"

run_castor "qa:reset-feature-flags" '--overrides={"calendar":false,"shield_mode":true}'
grep -Fq 'php features/graphql-api/feature-flags-resetter.php' "$CASTOR_WORKFLOW_RECORD"
grep -Fq '{"calendar":false,"shield_mode":true}' "$CASTOR_WORKFLOW_RECORD"

printf 'Local workflow checks passed; no real Docker command was executed.\n'
