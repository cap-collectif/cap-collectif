#!/bin/sh

corepack yarn install || echo 'Erreur de yarn install'

corepack yarn relay && corepack yarn dev