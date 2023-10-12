#!/bin/sh

yarn install || echo 'Erreur de yarn install'

yarn relay && yarn dev
