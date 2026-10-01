FROM docker.elastic.co/elasticsearch/elasticsearch:7.17.27

COPY --chown=elasticsearch:elasticsearch elasticsearch.yml /usr/share/elasticsearch/config/

RUN /usr/share/elasticsearch/bin/elasticsearch-plugin install --batch analysis-icu

# The CI snapshot directory is owned by the application (1000:1000).
# Run Elasticsearch as UID 1001 in CI, but keep GID 1000 so both can write to it.
# Fail the build if the base image changes that GID; local builds keep the default UID.
ARG ELASTICSEARCH_UID=1000
USER root
RUN test "$(id -g elasticsearch)" = 1000 || { echo 'Expected elasticsearch GID 1000' >&2; exit 1; }; \
    if [ "$(id -u elasticsearch)" != "$ELASTICSEARCH_UID" ]; then \
        old_uid=$(id -u elasticsearch) && \
        usermod --uid "$ELASTICSEARCH_UID" elasticsearch && \
        find /usr/share/elasticsearch -uid "$old_uid" -exec chown -h elasticsearch {} +; \
    fi

USER elasticsearch
