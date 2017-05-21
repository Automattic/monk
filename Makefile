BIN_DIR ?= node_modules/.bin
P="\\033[34m[+]\\033[0m"

SRC_DIR ?= src
TEST_TARGET ?= test/

lint:
	echo "  $(P) Linting"
	$(BIN_DIR)/eslint lib && $(BIN_DIR)/eslint test && $(BIN_DIR)/eslint middlewares

test: lint
	echo "  $(P) Testing"
	NODE_ENV=test $(BIN_DIR)/nyc --all $(BIN_DIR)/ava

test-watch:
	echo "  $(P) Testing forever"
	NODE_ENV=test $(BIN_DIR)/ava --watch

docs-clean:
	echo "  $(P) Cleaning gitbook"
	rm -rf _book

docs-prepare: docs-clean
	echo "  $(P) Preparing gitbook"
	$(BIN_DIR)/gitbook install

docs-build: docs-prepare
	echo "  $(P) Building gitbook"
	$(BIN_DIR)/gitbook build -g Automattic/monk

docs-watch: docs-prepare
	echo "  $(P) Watching gitbook"
	$(BIN_DIR)/gitbook serve

docs-publish: docs-build
	echo "  $(P) Publishing gitbook"
	cd _book && \
	git init && \
	git commit --allow-empty -m 'update book' && \
	git checkout -b gh-pages && \
	touch .nojekyll && \
	git add . && \
	git commit -am 'update book' && \
	git push https://github.com/Automattic/monk gh-pages --force

.PHONY: lint test test-watch docs-clean docs-prepare docs-build docs-watch docs-publish
.SILENT: lint test test-watch docs-clean docs-prepare docs-build docs-watch docs-publish
