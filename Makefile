SHELL := /bin/bash

PATH := $(CURDIR)/node_modules/.bin:$(PATH)
export PATH

.PHONY: format
format:	## Format all typescript source files
	prettier -w src/*

.PHONY: lint
lint: ## Lint all typescript source files
	eslint src/*

.PHONY: build-server
build-server: ## Build the node.js server only
	tsc

.PHONY: build-client
build-client: ## Build the react client app only
	vite build

.PHONY: build-artifacts
build-artifacts: ## Prepare additional artifacts for use
	./scripts/build.sh

.PHONY: build
build: build-server build-client build-artifacts ## Build the full stack
	@echo "Ready to go!"

.PHONY: run-client
run-client: build-client build-artifacts ## Run the client application only
	vite

run-server: build-server build-artifacts ## Run the express server only
	nodemon --inspect dist/js/server.js

.PHONY: run
run: build-artifacts ## Run the full server and client application stack
	concurrently "tsc -w" "vite build --watch" "nodemon --inspect dist/js/server.js"

.PHONY: deploy
deploy: ## Build a docker image for deployment
	docker build -t giga-server:latest .

.PHONY: help
help: ## Show this help
	@grep -E '^[a-z.A-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
