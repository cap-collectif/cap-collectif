#!/usr/bin/env bash
# Agent diagnostic comparing MySQL restore modes in a temporary database.
# Run in the application container; only a temporary database is modified.
set -euo pipefail
cd /var/www

database="ci_restore_benchmark_$$"
work=$(mktemp -d)
mysql=(mysql -h database -u root)
cleanup() {
    "${mysql[@]}" -e "DROP DATABASE IF EXISTS \`$database\`"
    rm -rf "$work"
}
trap cleanup EXIT
"${mysql[@]}" -e "CREATE DATABASE \`$database\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
"${mysql[@]}" "$database" < var/db.backup

# Exercise foreign keys, binary/text escaping, empty tables and ID counters above MAX(id).
"${mysql[@]}" "$database" <<'SQL'
CREATE TABLE ci_restore_parent (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, payload BLOB) ENGINE=InnoDB;
CREATE TABLE ci_restore_child (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, parent_id INT, label TEXT, FOREIGN KEY (parent_id) REFERENCES ci_restore_parent(id)) ENGINE=InnoDB;
CREATE TABLE ci_restore_empty (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY) ENGINE=InnoDB AUTO_INCREMENT=42;
INSERT INTO ci_restore_parent VALUES (7, X'000a275cffe9');
INSERT INTO ci_restore_child VALUES (3, 7, CONCAT('line one', CHAR(10), 'quote', CHAR(39), 'slash', CHAR(92)));
ALTER TABLE ci_restore_parent AUTO_INCREMENT=42;
ALTER TABLE ci_restore_child AUTO_INCREMENT=24;
SQL
mysqldump --opt -h database -u root "$database" > "$work/full.sql"
bash .circleci/save-mysql-data.sh "$database" "$work/data.sql"

snapshot() {
    mysqldump --skip-comments --skip-dump-date --skip-add-locks --order-by-primary \
        -h database -u root "$database"
}
snapshot > "$work/expected.sql"
for mode in full data; do
    for iteration in 1 2 3; do
        "${mysql[@]}" "$database" <<'SQL'
SET FOREIGN_KEY_CHECKS=0;
DELETE FROM fos_user;
UPDATE ci_restore_parent SET payload='changed';
DELETE FROM ci_restore_child;
INSERT INTO ci_restore_parent VALUES (1000, 'extra row');
INSERT INTO ci_restore_child VALUES (1000, 1000, 'extra row');
INSERT INTO ci_restore_empty VALUES (1000);
SQL
        bash .circleci/profile-mysql-restore.sh "$database" "$mode" "$work/$mode.sql" \
            | sed "s/^/$mode iteration=$iteration /"
        snapshot > "$work/actual.sql"
        cmp "$work/expected.sql" "$work/actual.sql"
    done
done

# A missing artifact must fail rather than silently leave dirty data in place.
if bash .circleci/profile-mysql-restore.sh "$database" data "$work/missing.sql"; then
    echo 'Missing restore artifact was accepted.' >&2
    exit 1
fi
"${mysql[@]}" "$database" -e "INSERT INTO ci_restore_empty VALUES (NULL)"
next_id=$("${mysql[@]}" -N "$database" -e 'SELECT id FROM ci_restore_empty')
[[ "$next_id" == 42 ]] || { echo "Unexpected next ID: $next_id" >&2; exit 1; }
echo 'Full and data restores produce identical rows, schemas and AUTO_INCREMENT counters.'
