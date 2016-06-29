BIN_DIR ?= node_modules/.bin
P="\\033[34m[+]\\033[0m"

SRC_DIR ?= src
TEST_TARGET ?= test/

lint:
	echo "  $(P) Linting"
	$(BIN_DIR)/eslint $(SRC_DIR) && $(BIN_DIR)/eslint $(TEST_TARGET)

test-docs:
	echo "  $(P) Testing doc"
	DOC=$($(BIN_DIR)/documentation readme -dgs API)
	if [ $($(DOC) | grep -vF 'up to date') ]; then echo 'Must run: npm run docs'; exit 1; fi;

test: lint test-docs
	echo "  $(P) Testing"
	NODE_ENV=test $(BIN_DIR)/nyc --all $(BIN_DIR)/ava

test-watch:
	echo "  $(P) Testing forever"
	NODE_ENV=test $(BIN_DIR)/ava --watch

.PHONY: lint test-docs test test-watch
.SILENT: lint test-docs test test-watch
