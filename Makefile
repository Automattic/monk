BIN_DIR ?= node_modules/.bin

SRC_DIR ?= src
TEST_TARGET ?= tests/

clean:
	rm -rf lib

build:
	BABEL_ENV=production $(BIN_DIR)/babel $(SRC_DIR) --out-dir lib

lint:
	echo "  $(P) Linting"
	$(BIN_DIR)/eslint $(SRC_DIR) && $(BIN_DIR)/eslint $(TEST_TARGET)

test: lint
	echo "  $(P) Testing"
	NODE_ENV=test $(BIN_DIR)/nyc $(BIN_DIR)/ava $(TEST_TARGET) --require=babel-register

test-watch:
	echo "  $(P) Testing forever"
	NODE_ENV=test $(BIN_DIR)/ava --watch $(TEST_TARGET) --require=babel-register

.PHONY: test
