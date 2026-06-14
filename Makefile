# Makefile for common development tasks

.PHONY: help install dev backend mobile test lint format clean docker-up docker-down

# Colors
GREEN  := \033[0;32m
YELLOW := \033[0;33m
NC     := \033[0m

help: ## Show this help message
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Install all dependencies
install: ## Install all dependencies for backend and mobile
	@echo "$(YELLOW)Installing backend dependencies...$(NC)"
	@cd backend && npm install
	@echo "$(YELLOW)Installing mobile dependencies...$(NC)"
	@cd mobile && npm install

# Development
dev: ## Start all services in development mode
	docker-compose up -d mysql redis
	@echo "$(GREEN)Starting backend dev server...$(NC)"
	@cd backend && npm run dev
