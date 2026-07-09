FROM php:8.3-fpm-alpine

RUN apk add --no-cache \
    git curl libpng-dev libonig-dev libxml2-dev zip unzip \
    libzip-dev libpq-dev icu-dev libjpeg-turbo-dev libwebp-dev \
    freetype-dev openssl-dev oniguruma-dev nodejs npm \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j$(nproc) \
    pdo_mysql mbstring exif pcntl bcmath gd zip intl opcache

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

RUN composer install --no-interaction --optimize-autoloader --no-dev

RUN chown -R www-data:www-data /var/www \
    && chmod -R 755 /var/www/storage \
    && chmod -R 755 /var/www/bootstrap/cache

RUN echo "memory_limit=256M" > /usr/local/etc/php/conf.d/memory-limit.ini \
    && echo "upload_max_filesize=100M" > /usr/local/etc/php/conf.d/upload.ini \
    && echo "post_max_size=100M" > /usr/local/etc/php/conf.d/post.ini \
    && echo "max_execution_time=300" > /usr/local/etc/php/conf.d/timeout.ini

RUN echo "opcache.enable=1" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.memory_consumption=128" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.interned_strings_buffer=8" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.max_accelerated_files=10000" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.revalidate_freq=2" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.fast_shutdown=1" >> /usr/local/etc/php/conf.d/opcache.ini

EXPOSE 9000

CMD ["php-fpm"]