# Tests du routage Nginx de production

Depuis la racine du dépôt, avec le conteneur applicatif démarré :

```bash
docker exec -u root -w /var/www capco_application_1 node --test infrastructure/services/remote/nginx/tests/media-routing.test.cjs
```

Le test utilise Node (sans dépendance npm), Nginx, PHP-FPM et l'utilisateur `capco`
de l'image applicative. Il démarre ses propres processus sur des sockets Unix dans
un répertoire temporaire, puis les arrête et supprime ses fichiers. Il ne recharge
pas le Nginx existant et ne touche ni aux médias ni aux bases de l'application.

La configuration `nginx.conf` du dépôt et ses includes sont chargés en conservant
tous les blocs `location` et toutes les réécritures. Seuls les chemins, sockets et
ressources des processus sont adaptés ; GeoIP et les variables de déploiement sont
écartés. Un contrôleur PHP synthétique vérifie le passage par FastCGI, les contenus
binaires, les réponses GET/HEAD, les refus et les fichiers absents. Les permissions
Symfony restent couvertes par les suites applicatives.

Les assertions couvrent notamment les polices sous `/media/`, les miniatures SVG
et le maintien du cache des fichiers JS/CSS et des polices intégrées. La CI exécute
ce test une fois dans `prepare-test-data`, avant la préparation des données.

Pour vérifier une autre révision de la configuration, fournir un chemin accessible
dans le conteneur avec `docker exec -e NGINX_TEST_CONFIG=/tmp/nginx-before.conf …`.
Le test doit échouer avec la configuration antérieure au correctif de #20713.
