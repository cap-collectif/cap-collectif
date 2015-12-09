FROM debian:jessie

MAINTAINER Aurélien David <adavid@jolicode.com>

# Install fake user 1000
RUN groupadd --gid=1000 capco && \
    /usr/sbin/useradd --system --uid=1000 --home /home/capco --shell /bin/bash -g capco capco

RUN mkdir -p /var/www/web/media && \
    chown -R capco:capco /var/www/web/media

CMD ["echo", "Data container for application"]
