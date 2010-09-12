PARTS= \
  parts/lalr-header.js \
  parts/lalr-parser.js \
  parts/lalr-compiler.js \
  parts/lalr-tables.js \
  parts/lalr-footer.js \
  $(NULL)

RESULT=processing.lalr.js

.SILENT: $(RESULT)

combine: $(RESULT)

$(RESULT): $(PARTS)
	cat $(PARTS) > $(RESULT)
	echo "$(RESULT) was built"

