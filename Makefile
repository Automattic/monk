
TESTS = test/*.test.js
REPORTER = dot

test:
	@make --no-print-directory test-unit
	@echo "testing promises-A+ implementation ..."
	@make --no-print-directory test-promises-A

test-unit:
	@DEBUG=$DEBUG,monk,monk:queries ./node_modules/.bin/mocha \
		--require test/common.js \
		--reporter $(REPORTER) \
		--growl \
		--bail \
		--slow 1000 \
		$(TESTS)

test-promises-A:
	@./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--growl \
		--bail \
		--slow 1000 \
		test/promises-A.js

.PHONY: test test-unit test-promises-A
