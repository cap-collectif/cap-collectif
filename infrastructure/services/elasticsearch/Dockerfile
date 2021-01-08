FROM docker.elastic.co/elasticsearch/elasticsearch-oss:7.0.0

COPY --chown=elasticsearch:elasticsearch elasticsearch.yml /usr/share/elasticsearch/config/

RUN /usr/share/elasticsearch/bin/elasticsearch-plugin install --batch analysis-icu

USER elasticsearch
