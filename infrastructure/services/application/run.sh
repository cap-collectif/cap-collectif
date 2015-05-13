#!/bin/bash

VOLUME_JWT="/var/jwt"

# Docker in Docker
wrapdocker
chmod 666 /var/run/docker.sock

if [[ ! -d $VOLUME_JWT ]]; then
    echo "=> An empty or uninitialized JWT volume is detected in $VOLUME_JWT"
    echo "=> Generating ssh keys..."
    mkdir /var/jwt
    openssl genrsa -passout pass:${SYMFONY_PASS_PHRASE} -out /var/jwt/private.pem -aes256 4096
    openssl rsa -in /var/jwt/private.pem -passin pass:${SYMFONY_PASS_PHRASE} -pubout -out /var/jwt/public.pem
    echo "=> Done!"
else
    echo "=> Using an existing volume of MariaDB"
fi

# Brunch generation / Bower
cd frontend && npm install
cd frontend && bower install
cd frontend && node_modules/brunch/bin/brunch build --production

/usr/bin/runsvdir -P /etc/service
