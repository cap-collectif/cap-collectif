FROM capco_builder

LABEL maintainer "Cap Collectif <tech@cap-collectif.com>"

RUN pip install pycodestyle

COPY capco.ini /usr/local/etc/php/conf.d/capco.ini

# Install fake user 1000
RUN mkdir -m 777 -p /home/capco
RUN groupadd --gid=1000 capco && \
    /usr/sbin/useradd --system --uid=1000 --home /home/capco --shell /bin/bash -g capco capco

# Add composer global binaries to $PATH
ENV PATH $PATH:/home/capco/.composer/vendor/bin/

WORKDIR /var/www

USER capco

CMD ["echo", "QA runner container for application"]
