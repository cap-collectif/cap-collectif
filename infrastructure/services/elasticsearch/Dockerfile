FROM docker.elastic.co/elasticsearch/elasticsearch:5.6.8

ADD elasticsearch.yml /usr/share/elasticsearch/config/

USER root

RUN chown elasticsearch:elasticsearch config/elasticsearch.yml

RUN /usr/share/elasticsearch/bin/elasticsearch-plugin install --batch analysis-icu

USER elasticsearch
