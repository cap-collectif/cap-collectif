FROM docker.elastic.co/elasticsearch/elasticsearch:7.16.3

COPY --chown=elasticsearch:elasticsearch elasticsearch.yml /usr/share/elasticsearch/config/

RUN /usr/share/elasticsearch/bin/elasticsearch-plugin install --batch analysis-icu

USER elasticsearch
