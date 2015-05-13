#!/bin/bash

rm -rf /var/www/app/cache/*
/bin/bash -l -c "$*"
