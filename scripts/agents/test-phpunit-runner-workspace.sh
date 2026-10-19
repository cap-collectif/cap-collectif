#!/usr/bin/env bash
# Agent regression check for a PHPUnit runner workspace with read-only var; external tools are mocked.
set -euo pipefail

project_directory="$(cd "$(dirname "$0")/../.." && pwd)"
work=$(mktemp -d)
cleanup() {
    chmod u+w "$work/project/var"
    rm -rf "$work"
}
trap cleanup EXIT
mkdir -p "$work/project/.circleci" "$work/project/var" "$work/bin"
cp "$project_directory/.circleci/test-castor-phpunit.sh" "$work/project/.circleci/"
chmod 555 "$work/project/var"
if [[ -w "$work/project/var" ]]; then
    echo 'This permission regression check requires a non-root user.' >&2
    exit 1
fi

# Stop at the first Castor call: reaching it proves fixture setup succeeded.
cat > "$work/bin/castor" <<'SH'
#!/usr/bin/env bash
printf 'runner reached Castor\n' > "$RUNNER_PROBE_RECORD"
exit 97
SH
chmod +x "$work/bin/castor"
status=0
PATH="$work/bin:$PATH" RUNNER_PROBE_RECORD="$work/reached-castor" \
    bash "$work/project/.circleci/test-castor-phpunit.sh" > "$work/output" 2>&1 || status=$?
if [[ "$status" -ne 97 || ! -f "$work/reached-castor" ]]; then
    cat "$work/output" >&2
    echo 'The PHPUnit runner could not prepare fixtures with a read-only var directory.' >&2
    exit 1
fi
if find "$work/project" -type d -name '*phpunit-runner*' | read -r _; then
    echo 'The PHPUnit runner did not clean its temporary workspace after a failure.' >&2
    exit 1
fi
printf 'PHPUnit runner read-only workspace and failure cleanup checks passed.\n'
