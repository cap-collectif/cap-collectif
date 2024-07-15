#!/bin/sh

# Récupère les fichiers PHP ajoutés, copiés ou modifiés qui sont prêts à être commités
FILES=$(git diff --cached --name-only --diff-filter=ACM | grep '\.php$' | grep -v '^spec/')

if [ "$FILES" ]; then
    echo "Analyse PHPStan des fichiers PHP modifiés..."
    php -dmemory_limit=-1 bin/phpstan analyse -c phpstan.neon $FILES
    if [ $? != 0 ]; then
        echo "PHPStan a détecté des problèmes."
        exit 1
    fi
fi

exit 0
