# Infrastructure

- install docker and/or boot2docker
- add a default parameters.yml at infrastructure/services/web/parameters.yml
- add a default VERSION at infrastructure/services/web/VERSION
- add a default sites.csv at infrastructure/sites.csv

```
master;49078;
demo;49079;
bastien;49080;bastien.toto.fr
```

cd infrastructure
docker-compose build
docker-compose up -d

docker exec -ti infrastructure_demo_1 bash

app/console capco:reinit --force
php app/console cache:warmup --env=prod --no-debug
