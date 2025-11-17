FROM docker.elastic.co/elasticsearch/elasticsearch:7.17.27

COPY --chown=elasticsearch:elasticsearch elasticsearch.yml /usr/share/elasticsearch/config/

RUN /usr/share/elasticsearch/bin/elasticsearch-plugin install --batch analysis-icu

USER elasticsearch
