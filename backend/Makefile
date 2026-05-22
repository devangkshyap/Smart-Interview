# Makefile for common development tasks

.PHONY: help install dev test lint format clean db-init db-migrate db-upgrade docker-up docker-down

help:
	@echo "Smart Interview Backend - Available Commands"
	@echo "=============================================="
	@echo "make install        - Install dependencies"
	@echo "make dev           - Run development server"
	@echo "make test          - Run tests"
	@echo "make lint          - Run code linting"
	@echo "make format        - Format code with black"
	@echo "make clean         - Clean up temporary files"
	@echo "make db-init       - Initialize database"
	@echo "make docker-up     - Start docker containers"
	@echo "make docker-down   - Stop docker containers"

install:
	pip install -r requirements.txt

dev:
	python run.py

test:
	pytest -v

lint:
	flake8 app/
	pylint app/

format:
	black app/ run.py config.py

clean:
	find . -type f -name '*.pyc' -delete
	find . -type d -name '__pycache__' -delete
	find . -type d -name '.pytest_cache' -exec rm -rf {} +
	find . -type d -name '.coverage' -delete

db-init:
	flask init-db

db-migrate:
	flask db migrate

db-upgrade:
	flask db upgrade

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f backend
