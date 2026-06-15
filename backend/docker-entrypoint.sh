#!/bin/sh
set -e

echo "▶ Running Prisma migrations..."
node node_modules/prisma/build/index.js migrate deploy

echo "▶ Seeding initial data..."
node prisma/seed.js

echo "▶ Starting EasyTrust Bank API..."
exec node dist/server.js
