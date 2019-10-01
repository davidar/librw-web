PREFIX = $(CURDIR)

CXXFLAGS = -Iglm -Ilibrw -Ilibrwgta/src -std=c++14 -fno-exceptions \
	   -Os -g2 \
	   -Wno-parentheses \
	   -s ALLOW_MEMORY_GROWTH=1 \
	   -s EXPORTED_FUNCTIONS='["_malloc","_free"]' \
	   -s FILESYSTEM=0 \
	   -s MODULARIZE=1 \
	   -s STRICT=1

LIBRW_SOURCES = $(shell ls librw/src/*.cpp librw/src/*/*.cpp librwgta/src/*.cpp)

$(PREFIX)/librw.js: $(LIBRW_SOURCES) bindings.cc
	mkdir -p $(PREFIX)
	$(CXX) $(CXXFLAGS) $^ -o $@
