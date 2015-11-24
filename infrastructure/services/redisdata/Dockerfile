FROM debian:jessie
MAINTAINER Aurélien David <adavid@jolicode.com>

ENV DEBIAN_FRONTEND noninteractive

RUN addgroup --gid=1000 capco && \
    adduser --system --uid=1000 --home /home/capco --shell /bin/bash capco

CMD ["echo", "Data container for application"]
