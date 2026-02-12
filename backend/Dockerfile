FROM php:8.2-apache

RUN docker-php-ext-install pdo pdo_mysql

RUN a2enmod rewrite

# Allow .htaccess overrides
# AllowOverride handled by VirtualHost
# RUN sed -i 's/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

# Copy custom VirtualHost
COPY 000-default.conf /etc/apache2/sites-available/000-default.conf

COPY . /var/www/html/

WORKDIR /var/www/html

EXPOSE 80
