#!/usr/bin/env bash
# Agent integration check for the PHPUnit runner in the application container; no application data is changed.
set -euo pipefail

project_directory="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$project_directory"
test_directory="$(mktemp -d "$project_directory/var/phpunit-runner.XXXXXX")"
trap 'rm -rf "$test_directory"' EXIT
chmod 755 "$test_directory"
mkdir -p "$test_directory/fixtures" "$test_directory/reports"
chmod 755 "$test_directory/fixtures"
chmod 777 "$test_directory/reports"
relative_directory="${test_directory#"$project_directory/"}"

cat > "$test_directory/fixtures/RunnerFirstTest.php" <<'PHP'
<?php
class RunnerFirstTest extends \PHPUnit\Framework\TestCase
{
    public function testFirstSelection(): void { self::assertTrue(true); }
}
PHP
cat > "$test_directory/fixtures/RunnerSecondTest.php" <<'PHP'
<?php
class RunnerSecondTest extends \PHPUnit\Framework\TestCase
{
    public function testSecondSelection(): void { self::assertTrue(true); }
}
PHP

check_report() {
    docker exec -w /var/www capco_application_1 php -r '
        $xml = new DOMDocument();
        if (!$xml->load($argv[1]) || $xml->getElementsByTagName("testcase")->length !== (int) $argv[2]) {
            fwrite(STDERR, "Unexpected test count in JUnit report.\n"); exit(1);
        }
        foreach ($xml->getElementsByTagName("testcase") as $test) {
            if (!$test->hasAttribute("file") || !is_file($test->getAttribute("file"))) {
                fwrite(STDERR, "JUnit report is missing file metadata for CircleCI timing splits.\n"); exit(1);
            }
        }
    ' "$relative_directory/reports/junit.xml" "$1"
}

for namespace in local ci; do
    castor "$namespace:qa:phpunit" \
        --tests="/var/www/$relative_directory/fixtures/RunnerFirstTest.php /var/www/$relative_directory/fixtures/RunnerSecondTest.php" \
        --log-junit="$relative_directory/reports/junit.xml" > "$test_directory/output" 2>&1
    check_report 2
    castor "$namespace:qa:phpunit" --tests="$relative_directory/fixtures" \
        --filter=testSecondSelection --log-junit="$relative_directory/reports/junit.xml" > "$test_directory/output" 2>&1
    check_report 1
done

for selection in ' ' "$relative_directory/missing.php"; do
    if castor ci:qa:phpunit --tests="$selection" > "$test_directory/output" 2>&1; then
        printf 'Invalid PHPUnit selection was accepted.\n' >&2; exit 1
    fi
done

# A passing first file must not hide a failing second file.
sed 's/assertTrue(true)/assertTrue(false)/' "$test_directory/fixtures/RunnerSecondTest.php" > "$test_directory/second.tmp"
mv "$test_directory/second.tmp" "$test_directory/fixtures/RunnerSecondTest.php"
if castor ci:qa:phpunit \
    --tests="$relative_directory/fixtures/RunnerFirstTest.php $relative_directory/fixtures/RunnerSecondTest.php" \
    --log-junit="$relative_directory/reports/junit.xml" > "$test_directory/output" 2>&1; then
    printf 'Failure in the second PHPUnit file was ignored.\n' >&2; exit 1
fi
check_report 2

# A missing report must not be mistaken for a successful run.
mkdir "$test_directory/readonly"
chmod 555 "$test_directory/readonly"
if castor ci:qa:phpunit --tests="$relative_directory/fixtures/RunnerFirstTest.php" \
    --log-junit="$relative_directory/readonly/junit.xml" > "$test_directory/output" 2>&1; then
    printf 'An unwritable JUnit report was accepted.\n' >&2; exit 1
fi
chmod 755 "$test_directory/readonly"

if compgen -G "$project_directory/.phpunit-selected-*" > /dev/null; then
    printf 'Temporary PHPUnit configuration was not cleaned up.\n' >&2; exit 1
fi
printf 'PHPUnit selection, filtering, failure propagation and JUnit checks passed.\n'
