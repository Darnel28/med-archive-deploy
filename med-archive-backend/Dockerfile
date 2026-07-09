FROM php:8.2-cli

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    zip \
    libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY entrypoint.sh /entrypoint.sh

WORKDIR /app

COPY . .

RUN mkdir -p bootstrap/cache
RUN mkdir -p storage/framework/cache
RUN mkdir -p storage/framework/sessions
RUN mkdir -p storage/framework/views
RUN mkdir -p storage/logs

RUN chmod -R 777 storage bootstrap/cache
RUN chmod +x /entrypoint.sh

RUN composer install --no-dev --optimize-autoloader

EXPOSE 10000

ENTRYPOINT ["/entrypoint.sh"]