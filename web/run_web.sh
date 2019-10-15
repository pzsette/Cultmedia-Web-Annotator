#!/bin/bash

# wait for db server to start

while ! mysqladmin ping -h"$DB_HOST" --silent; do
  echo "Database not ready. Waiting 5 seconds...."
  sleep 5

done
echo "Database ready. Starting app"
sleep 3

# Apply database migrations
echo "Apply database migrations"
python manage.py migrate


echo "Creating default admin"
python manage.py initadmin

#echo "Creating demo data"
python manage.py loaddata frontend/fixtures/initial_data.json

# Start server
echo "Starting server"
python manage.py runserver 0.0.0.0:8000