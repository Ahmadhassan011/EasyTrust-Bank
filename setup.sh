#!/bin/bash
# EasyTrust Bank - Database Setup Script
# Run this script when PostgreSQL is installed and running

set -e

echo "🏦 EasyTrust Bank - Database Setup"
echo "=================================="

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running on localhost:5432"
    echo "   Start PostgreSQL first:"
    echo "   - Ubuntu/Debian: sudo service postgresql start"
    echo "   - macOS: brew services start postgresql"
    echo "   - Docker: docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres"
    exit 1
fi

echo "✅ PostgreSQL is running"

# Database name
DB_NAME="easytrust_bank"
DB_USER="postgres"  # Change if needed

echo ""
echo "📦 Creating database: $DB_NAME"

# Create database if it doesn't exist
psql -U $DB_USER -h localhost -c "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || psql -U $DB_USER -h localhost -c "CREATE DATABASE $DB_NAME"

echo "✅ Database created/exists"

echo ""
echo "📄 Running schema SQL..."

# Run the schema SQL file
psql -U $DB_USER -h localhost -d $DB_NAME -f setup-database.sql

echo "✅ Schema created with 'created_at' convention"

echo ""
echo "🎉 Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your database credentials"
echo "2. Run: cd project/backend && npm run prisma:generate"
echo "3. Run: npm run dev"
echo ""
echo "To seed data (from external directory):"
echo "  cd /tmp/easytrust-seed"
echo "  DATABASE_URL=\"postgresql://user:password@localhost:5432/$DB_NAME\" npx ts-node seed.ts"
