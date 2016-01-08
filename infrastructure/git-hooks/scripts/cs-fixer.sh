#!/bin/bash

RESULT=0

# Iterate on all files impacted in the staging area
for file in $(git diff --cached --name-only)
do
    echo $file
    # Check the file still exists (ie. was not removed in the staging area)
    if [ -e "$file" ] && [ ${file: -4} == ".php" ]
    then
        php-cs-fixer fix --config-file=.php_cs --dry-run --diff $file
        EXIT=$?
        RESULT=$((RESULT + EXIT))
    fi
done

exit $RESULT
