# Dockerfile
FROM ubuntu:22.04
EXPOSE 6000 80

# Читаем переменные среды из .env
ARG DOMAIN_EMAIL
ARG DOMAIN_URL

# Устанавливаем переменные среды в переменные
ENV DOMAIN_EMAIL=$DOMAIN_EMAIL
ENV DOMAIN_URL=$DOMAIN_URL

WORKDIR /certbot
COPY . /certbot

RUN apt-get update
RUN apt-get install -y gnupg
RUN apt-key adv --refresh-keys --keyserver keyserver.ubuntu.com
RUN apt-get install -y certbot

# Запускаем скрипт генерации
CMD ["sh", "generate-certificate.sh"]