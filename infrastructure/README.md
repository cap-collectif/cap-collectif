# Infrastructure

- install docker and/or boot2docker
- add a default parameters.yml at infrastructure/services/web/parameters.yml
- add a default sites.csv at infrastructure/sites.csv

cd infrastructure
docker-compose build
docker-compose up -d

docker exec -ti infrastructure_demo_1 bash

app/console capco:reinit --force
php app/console cache:warmup --env=prod --no-debug
