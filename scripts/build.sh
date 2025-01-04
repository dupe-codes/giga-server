#!/usr/bin/env bash

SRC_DIR=src/
OUT_DIR=dist/js/

# cp artifacts
ARTIFACTS=("config.yml")
for ARTIFACT in "${ARTIFACTS[@]}"; do
    echo "Copying $SRC_DIR$ARTIFACT to $OUT_DIR"
    cp "${SRC_DIR}${ARTIFACT}" "${OUT_DIR}"
done
