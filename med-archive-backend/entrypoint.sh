#!/bin/sh

php artisan config:clear
php artisan cache:clear

php artisan migrate --force
php artisan db:seed --force
#  php artisan migrate:fresh --seed --force

exec php artisan serve --host=0.0.0.0 --port=${PORT}