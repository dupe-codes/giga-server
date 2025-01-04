.PHONY: format
format: ## Format code source files with prettier
	./node_modules/prettier/bin/prettier.cjs -w src/**/*

.PHONY: lint
lint: ## Lint code source files
	./node_modules/eslint/bin/eslint.js

.PHONY: run
run: ## Run the main application server
	yarn start

.PHONY: help
help: ## Show this help
	@grep -E '^[a-z.A-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
