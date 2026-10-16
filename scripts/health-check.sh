#!/bin/sh
set -eu

echo "Checking TaskBoard API health..."
curl --fail --silent --show-error http://localhost:8000/health
echo

echo "Checking database readiness..."
curl --fail --silent --show-error http://localhost:8000/ready
echo

echo "Health checks passed."
