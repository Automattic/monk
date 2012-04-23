
TESTS = test/*.js
REPORTER = dot

test:
	@./node_modules/.bin/mocha \
		--require test/common.js \
		--reporter $(REPORTER) \
		--growl \
		--bail \
		--slow 1000 \
		$(TESTS)

.PHONY: test bench
