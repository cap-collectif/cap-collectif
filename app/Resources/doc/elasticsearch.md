# Elasticsearch

## I changed the mapping, what do I do!?

Mapping edition is a big thing, if you ship the code, you need to re-index all the data.

You have to add this command at the end of the deploy:

```
php app/console fos:elastica:populate --env=prod --no-debug
```
