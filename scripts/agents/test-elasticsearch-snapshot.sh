#!/usr/bin/env bash
# Agent regression check for snapshot commands; PHP runs in Docker and HTTP responses are mocked.
set -euo pipefail
project_directory="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$project_directory"
work=$(mktemp -d "$project_directory/.snapshot-check-XXXXXX")
trap 'rm -rf "$work"' EXIT
chmod 755 "$work"
mkdir "$work/bin"
record="$work/record"
touch "$record"
chmod 666 "$record"
container_work="/var/www/${work##*/}"
cat > "$work/bin/curl" <<'MOCK'
#!/bin/sh
printf '%s\n' "$*" >> "$SNAPSHOT_RECORD"
case "$*" in
    *'snap_qa?pretty'*)
        case "$SNAPSHOT_MODE" in
            missing) echo 'curl: (22) The requested URL returned error: 404' >&2; exit 22 ;;
            unavailable) echo 'curl: (22) The requested URL returned error: 500' >&2; exit 22 ;;
            empty) echo '{"snapshots":[]}' ;;
            no_analytics) echo '{"snapshots":[{"indices":["capco_20260101"]}]}' ;;
            *) echo '{"snapshots":[{"indices":["capco_20260101","analytics_test"]}]}' ;;
        esac ;;
    *'_cat/indices'*) echo '[{"index":"capco_legacy"},{"index":"castor_restore_legacy"},{"index":"analytics_test"},{"index":"unrelated"}]' ;;
    *'_restore?'*)
        if [ "$SNAPSHOT_MODE" = failed ]; then
            echo '{"snapshot":{"shards":{"failed":1}}}'
        else
            echo '{"snapshot":{"shards":{"failed":0}}}'
        fi ;;
    *'snap_qa?wait_for_completion'*)
        if [ "$SNAPSHOT_MODE" = failed ]; then
            echo '{"snapshot":{"state":"PARTIAL","indices":["capco_20260101","analytics_test"]}}'
        else
            echo '{"snapshot":{"state":"SUCCESS","indices":["capco_20260101","analytics_test"]}}'
        fi ;;
    *) echo '{"acknowledged":true}' ;;
esac
MOCK
chmod +x "$work/bin/curl"
run_snapshot() {
    : > "$record"
    docker exec -u capco -w /var/www \
        -e "PATH=$container_work/bin:/usr/local/bin:/usr/bin:/bin" \
        -e "SNAPSHOT_RECORD=$container_work/record" -e "SNAPSHOT_MODE=$mode" \
        capco_application_1 php scripts/qa/elasticsearch-snapshot.php "$@" > "$work/output" 2>&1
}
mode=valid
run_snapshot save --shared
grep -Fq 'capco_*,analytics_test' "$record"
run_snapshot restore --shared --confirm
grep -Fq '"readonly":true' "$record"
grep -Fq -- '-X DELETE http://elasticsearch:9200/castor_restore_legacy' "$record"
grep -Fq '"rename_pattern":"^capco_(.+)$"' "$record"
grep -Fq '"alias":"capco_indexing","is_write_index":true' "$record"
! grep -Fq -- '-X DELETE http://elasticsearch:9200/unrelated' "$record"
grep -Fq 'CI_RESTORE_TIMING es_restore_snapshot_ms=' "$work/output"
run_snapshot restore --confirm
grep -Fq '/capco/_close' "$record"
grep -Fq '/capco/_open' "$record"
! grep -Fq -- '-X DELETE' "$record"
for mode in missing unavailable empty no_analytics; do
    if run_snapshot restore --shared --confirm; then
        echo "Invalid snapshot accepted: $mode" >&2; exit 1
    fi
    ! grep -Fq -- '-X DELETE' "$record"
    ! grep -Fq '/_restore?' "$record"
done
mode=failed
if run_snapshot restore --shared --confirm; then echo 'Failed restoration accepted.' >&2; exit 1; fi
! grep -Fq '/_aliases' "$record"
if run_snapshot save --shared; then echo 'Partial snapshot accepted.' >&2; exit 1; fi
mode=valid
if run_snapshot restore --shared; then echo 'Missing confirmation accepted.' >&2; exit 1; fi
test ! -s "$record"
printf 'Elasticsearch local/shared snapshots, validation, cleanup and failure checks passed.\n'
