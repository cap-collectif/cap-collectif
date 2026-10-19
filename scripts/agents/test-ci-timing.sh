#!/usr/bin/env bash
# Agent regression check for CI timing logs, command failures and output preservation; no services required.
set -euo pipefail

project_directory="$(cd "$(dirname "$0")/../.." && pwd)"
timing_script="$project_directory/.circleci/timing.sh"
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

CIRCLE_JOB=timing-check CIRCLE_NODE_INDEX=3 bash "$timing_script" arguments \
    bash -c 'printf "%s\n" "$1"; printf "command stderr\n" >&2' _ 'argument with spaces' \
    > "$work/stdout" 2> "$work/stderr"
grep -Fxq 'argument with spaces' "$work/stdout"
[[ $(wc -l < "$work/stdout") -eq 1 ]]
grep -Fxq 'command stderr' "$work/stderr"
grep -Eq '^CI_TIMING event=start phase=arguments job=timing-check node=3 at=' "$work/stderr"
grep -Eq '^CI_TIMING event=end phase=arguments job=timing-check node=3 duration_ms=[0-9]+ exit_code=0 at=' "$work/stderr"

status=0
bash "$timing_script" failing_command bash -e -c 'exit 7; echo unreachable' \
    > "$work/stdout" 2> "$work/stderr" || status=$?
[[ "$status" -eq 7 ]]
[[ ! -s "$work/stdout" ]]
grep -Eq 'phase=failing_command .*exit_code=7 ' "$work/stderr"

status=0
bash -euo pipefail -c '
    source "$1"
    trap '\''ci_timing_finish "$?"'\'' EXIT
    ci_timing_begin first_phase
    printf "first output\n"
    ci_timing_begin failing_pipeline
    false | cat
    ci_timing_begin unreachable
' _ "$timing_script" > "$work/stdout" 2> "$work/stderr" || status=$?
[[ "$status" -eq 1 ]]
grep -Fxq 'first output' "$work/stdout"
grep -Eq 'event=end phase=first_phase .*exit_code=0 ' "$work/stderr"
grep -Eq 'event=end phase=failing_pipeline .*exit_code=1 ' "$work/stderr"
! grep -q 'phase=unreachable' "$work/stderr"

# Missing shared artifacts must still stop preparation before contacting services.
mkdir "$work/empty-project"
status=0
(
    cd "$work/empty-project"
    bash "$project_directory/.circleci/test-data.sh" restore
) > "$work/stdout" 2> "$work/stderr" || status=$?
[[ "$status" -eq 1 ]]
grep -q 'Shared test data file is missing' "$work/stderr"
grep -Eq 'event=end phase=restore_validate_artifacts .*exit_code=1 ' "$work/stderr"
! grep -q 'phase=restore_wait_mysql' "$work/stderr"

printf 'CI timing checks passed; no external service was used.\n'
