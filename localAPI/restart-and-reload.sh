#!/bin/sh
# restart-and-reload.sh - rebuilds api and dashboard
# serve data

set -e

echo "docker-compose down --remove-orphans"
echo `docker-compose down --remove-orphans`
sleep 20
echo "npm run start-earthdata-pub-api"
echo `npm run start-earthdata-pub-api`
sleep 25
echo "npm run start-dashboard"
echo `npm run start-dashboard`
sleep 30
echo "npm run seed-database"
echo `npm run seed-database`
exit