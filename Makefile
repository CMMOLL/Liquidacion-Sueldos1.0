
SHELL := /bin/bash
.DEFAULT_GOAL := help

.PHONY: help dev db-up db-down db-reset migrate seed lint fmt typecheck test test-int test-e2e bench prisma-studio clean

help: ## Mostrar ayuda
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS := ":.*?## "}; {printf "\033[36m%-18s\033[0m %s\n", $$1, $$2}'

dev: db-up migrate ## Levantar API en modo desarrollo
	pnpm dev

db-up: ## Levantar Postgres y Redis
	docker compose up -d

db-down: ## Bajar Postgres y Redis
	docker compose down -v

db-reset: db-down db-up migrate seed ## Resetear base de datos y datos mínimos
	@echo "DB reseteada"

migrate: ## Ejecutar migraciones de Prisma
	pnpm prisma:migrate:dev

seed: ## Cargar datos semilla
	pnpm seed

lint: ## Linter
	pnpm lint

fmt: ## Formatear con Prettier
	pnpm fmt

typecheck: ## Verificación de tipos
	pnpm typecheck

test: ## Tests unitarios
	pnpm test

test-int: ## Tests de integración
	pnpm test:int

test-e2e: ## Tests end-to-end
	pnpm test:e2e

bench: ## Benchmarks de reglas y engine
	pnpm bench

prisma-studio: ## Abrir Prisma Studio
	pnpm prisma:studio

clean: ## Limpiar artefactos
	rm -rf node_modules dist .turbo .cache
