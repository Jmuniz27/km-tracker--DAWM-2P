#!/bin/bash

echo "Starting KmTracker API deployment..."

# Aplicar migraciones
echo "Running migrations..."
python manage.py migrate --noinput

# Recolectar archivos estáticos
echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

# Iniciar Gunicorn
echo "Starting Gunicorn..."
gunicorn --bind=0.0.0.0:8000 --timeout 600 --workers 2 kmtracker_api.wsgi:application
