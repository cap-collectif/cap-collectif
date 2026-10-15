#!/usr/bin/env bash
set -euo pipefail

project_directory=$(cd "$(dirname "$0")/.." && pwd)
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
mkdir "$work/bin"
cat > "$work/bin/curl" <<'SH'
#!/usr/bin/env bash
set -euo pipefail
attempt=$(cat "$READINESS_ATTEMPT_FILE")
echo "$((attempt + 1))" > "$READINESS_ATTEMPT_FILE"
case "$READINESS_SCENARIO" in
    startup)
        case "$attempt" in
            0) exit 7 ;;
            1|2) printf '502' ;;
            *) printf '200' ;;
        esac
        ;;
    redirect) printf '307' ;;
    failure) printf '502' ;;
esac
SH
chmod +x "$work/bin/curl"
export PATH="$work/bin:$PATH"
export READINESS_ATTEMPT_FILE="$work/attempt"
export ADMIN_NEXT_READY_POLL_INTERVAL=0
export ADMIN_NEXT_READY_TIMEOUT_SECONDS=5
export READINESS_SCENARIO=startup
echo 0 > "$READINESS_ATTEMPT_FILE"
bash "$project_directory/.circleci/wait-for-admin-next.sh" > "$work/output"
[[ $(cat "$READINESS_ATTEMPT_FILE") == 4 ]]
rg -q 'HTTP 000' "$work/output"
rg -q 'HTTP 502' "$work/output"
rg -q 'ready \(HTTP 200\)' "$work/output"

export READINESS_SCENARIO=redirect
bash "$project_directory/.circleci/wait-for-admin-next.sh" > "$work/output"
rg -q 'ready \(HTTP 307\)' "$work/output"

export READINESS_SCENARIO=failure
export ADMIN_NEXT_READY_TIMEOUT_SECONDS=0
if bash "$project_directory/.circleci/wait-for-admin-next.sh" > "$work/output" 2>&1; then
    echo 'A persistent 502 was accepted.' >&2
    exit 1
fi
rg -q 'did not become ready.*502' "$work/output"
echo 'Admin Next readiness checks passed.'
