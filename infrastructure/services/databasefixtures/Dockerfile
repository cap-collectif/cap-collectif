FROM zanox/mysql:latest

COPY dump.sql /

RUN start-mysql && \
    mysql -e "CREATE DATABASE symfony" && \
    mysql symfony < dump.sql && \
    echo "status" | mysql && \
    stop-mysql
