.PHONY: up down build rebuild logs ps shell-api shell-db migrate reset

# Start all containers in the background
up:
	docker compose up -d

# Stop and remove containers (data volumes are preserved)
down:
	docker compose down

# Build images without starting
build:
	docker compose build

# Rebuild images and restart everything
rebuild:
	docker compose up --build -d

# Stream logs from all services (Ctrl+C to stop)
logs:
	docker compose logs -f

# Show running containers
ps:
	docker compose ps

# Open a shell inside the API container
shell-api:
	docker compose exec backend sh

# Open a psql shell inside the database container
shell-db:
	docker compose exec postgres psql -U $${DB_USER:-easytrust} -d easytrust_bank

# Run pending Prisma migrations manually
migrate:
	docker compose exec backend npx prisma migrate deploy

# ⚠ Destroy everything including data volumes
reset:
	docker compose down -v
