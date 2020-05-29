#!/bin/bash

set -e

# ignore errors in CI environments
ln -sf $(pwd)/bin/cli.js /usr/local/bin/earthdata-pub-api || true