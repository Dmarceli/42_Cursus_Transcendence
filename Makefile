include .env
DB_DATA	= $(DB_VOL_LOC)
POSTGRES_USER=${DB_USER}
POSTGRES_PASSWORD=${DB_PASS}
APP_DATABASE=${DB_NAME}

# Functions
all: dev	


$(DB_DATA):
	mkdir $(DB_DATA)

up: $(DB_DATA)
	docker compose up -d --build

down:
	docker compose down

dev: $(DB_DATA)
	@docker compose up --build

exec_frontend:
				docker exec -ti frontend bash

exec_backend:
				docker exec -ti backend bash

exec_db:
	docker exec -ti db  psql postgresql://$(POSTGRES_USER):$(POSTGRES_PASSWORD)@localhost/$(APP_DATABASE)

logs_frontend:
	docker logs frontend

logs_backend:
	docker logs backend

logs_db:
		docker logs db

deep_clean:
			docker compose down
			docker system prune -a
			docker volume rm $(docker volume ls -q)
			sudo rm -rf $(DB_DATA)

clean:
	docker compose down -v --rmi all

re: clean all