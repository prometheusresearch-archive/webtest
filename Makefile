FRAMEWORK_BUNDLE = src/framework/jasmine/bundle.js
BIN = ./node_modules/.bin
SRC = $(shell find src -name '*.js') $(FRAMEWORK_BUNDLE)
LIB = $(SRC:src/%=lib/%)

BABEL_OPTS = \
	--optional runtime  \
	--stage 0

build: $(LIB)

install link:
	@npm $@

release-patch: test lint
	@$(call release,patch)

release-minor: test lint
	@$(call release,minor)

release-major: test lint
	@$(call release,major)

publish:
	git push --tags origin HEAD:master
	npm publish

$(FRAMEWORK_BUNDLE):
	@touch $@

$(FRAMEWORK_BUNDLE:src/%=lib/%): $(FRAMEWORK_BUNDLE)
	@echo "building $@ (webpack)"
	@$(BIN)/webpack \
		--context src/framework/jasmine \
		--config src/framework/jasmine/webpack.config.js \
		-p \
		--output-path $(@D)

lib/%.js: src/%.js
	@echo "building $@"
	@mkdir -p $(@D)
	@$(BIN)/babel $(BABEL_OPTS) --source-maps-inline -o $@ $<

clean:
	@rm -rf lib/
	@rm -f $(FRAMEWORK_BUNDLE)
	@rm -f $(FRAMEWORK_BUNDLE).map

define release
	npm version $(1)
endef
