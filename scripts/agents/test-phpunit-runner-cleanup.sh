#!/usr/bin/env bash
# Check runner cleanup with real Linux file ownership; PHPUnit execution is mocked.
set -euo pipefail

docker exec -i -u root -w /var/www capco_application_1 bash -s <<'SH'
set -euo pipefail
# /tmp may be a macOS bind mount that does not enforce Linux ownership.
work=$(mktemp -d /var/tmp/phpunit-cleanup-XXXXXX)
trap 'rm -rf "$work"' EXIT
mkdir -p "$work/project/.circleci" "$work/bin" "$work/staged/.phpunit.cache"
cp /var/www/.circleci/test-phpunit.sh "$work/project/.circleci/"
touch "$work/staged/.phpunit.cache/test-results" "$work/staged/junit.xml"
chown -R nobody:nogroup "$work"
chown capco:capco "$work/staged/.phpunit.cache/test-results" "$work/staged/junit.xml"
chmod 644 "$work/staged/.phpunit.cache/test-results" "$work/staged/junit.xml"

# Move files without changing their owner, then fail while a directory is still read-only.
cat > "$work/bin/docker" <<'MOCK'
#!/usr/bin/env bash
set -euo pipefail
runner=$(find "$RUNNER_WORK/project" -maxdepth 1 -type d -name '.phpunit-runner-*')
mkdir "$runner/readonly-project"
mv "$RUNNER_WORK/staged/.phpunit.cache" "$runner/readonly-project/"
mv "$RUNNER_WORK/staged/junit.xml" "$runner/reports/"
chmod 555 "$runner/readonly-project"
printf 'Expected runner failure.\n'
exit 97
MOCK
chmod 755 "$work/bin/docker"

status=0
runuser -u nobody -- env PATH="$work/bin:$PATH" RUNNER_WORK="$work" \
    bash "$work/project/.circleci/test-phpunit.sh" > "$work/output" 2>&1 || status=$?
if [[ "$status" -ne 97 ]]; then
    cat "$work/output" >&2
    printf 'Cleanup replaced the runner exit status: expected 97, got %s.\n' "$status" >&2
    exit 1
fi
if find "$work/project" -type d -name '.phpunit-runner-*' | read -r _; then
    cat "$work/output" >&2
    printf 'Cleanup left the mixed-owner workspace behind.\n' >&2
    exit 1
fi
grep -q 'Expected runner failure.' "$work/output"
printf 'PHPUnit runner mixed-owner cleanup and failure propagation checks passed.\n'
SH
