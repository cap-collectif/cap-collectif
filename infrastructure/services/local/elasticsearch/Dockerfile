FROM docker.elastic.co/elasticsearch/elasticsearch:5.5.1

ADD capco.yml /usr/share/elasticsearch/config/elasticsearch.yml

USER root

RUN chown elasticsearch:elasticsearch config/elasticsearch.yml
RUN /usr/share/elasticsearch/bin/elasticsearch-plugin install --batch analysis-icu

USER elasticsearch

CMD ["elasticsearch"]
