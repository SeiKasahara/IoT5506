#!/bin/bash

DJANGO_ROOT=${DJANGO_ROOT:-"/app"}
echo "Get Django Root"

MEDIA_DIR="$DJANGO_ROOT/media"

echo "Located Media directiory"

DELAY=3600

(
  sleep $DELAY
  find "$MEDIA_DIR" -type f -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.gif" -delete
  echo "Media File has been deleted"
) &

echo "Applying database migrations"
python manage.py migrate --noinput

echo "Collecting static files"
python manage.py collectstatic --noinput

# Create Django Superuser
echo "Creating Django Superuser"
python manage.py createsuperuser --noinput

echo "Make migrations..."
python manage.py makemigrations
python manage.py migrate

# Run inbuilt Django server if ENV is development
if [ "${APP_ENV^^}" = "DEVELOPMENT" ]; then

    # Install extra non-prod packages
    printf "\n" && echo "Installing dev dependencies for $APP_ENV"
    poetry install

    # Run developments
    printf "\n" && echo "Starting inbuilt django webserver"
    echo "Running: python manage.py runserver 0.0.0.0:8000"
    python manage.py runserver 0.0.0.0:8000
    exit
fi

# ===================
# Run Django/Gunicorn
# ===================
if [ "${APP_ENV^^}" = "PRODUCTION" ]; then

    # Run Gunicorn / Django
    printf "\n" && echo " Running Gunicorn / Django"
    echo "Running: gunicorn api.wsgi -b 0.0.0.0:8000 --workers=6 --keep-alive 20 --log-file=- --log-level debug --access-logfile=/var/log/accesslogs/gunicorn --capture-output --timeout 50"
    gunicorn api.wsgi -b 0.0.0.0:8000 --workers=6 --keep-alive 20 --log-file=- --log-level debug --access-logfile=/var/log/accesslogs/gunicorn --capture-output --timeout 50
fi
