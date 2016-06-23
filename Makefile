BIN_DIR ?= node_modules/.bin

SRC_DIR ?= src
TEST_TARGET ?= tests/

lint:
	echo "  $(P) Linting"
	$(BIN_DIR)/eslint $(SRC_DIR) && $(BIN_DIR)/eslint $(TEST_TARGET)

test: lint
	echo "  $(P) Testing"
	NODE_ENV=test $(BIN_DIR)/nyc --all $(BIN_DIR)/ava $(TEST_TARGET)

test-watch:
	echo "  $(P) Testing forever"
	NODE_ENV=test $(BIN_DIR)/ava --watch $(TEST_TARGET)

.PHONY: lint test test-watch
