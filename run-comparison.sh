#!/bin/bash

# SDK Comparison Runner
# Runs both Pi Agent SDK and Claude Agent SDK tests, then compares results

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=============================================="
echo "SDK Comparison: Pi Agent SDK vs Claude Agent SDK"
echo "=============================================="
echo ""

# Check for required AWS environment
if [ -z "$AWS_PROFILE" ] && [ -z "$AWS_ACCESS_KEY_ID" ]; then
    echo "Warning: No AWS credentials found. Set AWS_PROFILE or AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY."
    echo "Tests use AWS Bedrock and require valid AWS credentials."
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install
fi

# Create results directory
mkdir -p results

# Run Pi SDK tests
echo ""
echo "=============================================="
echo "Running Pi Agent SDK Tests..."
echo "=============================================="
npm run test:pi

# Run Anthropic SDK tests
echo ""
echo "=============================================="
echo "Running Anthropic Python SDK Tests..."
echo "=============================================="
source .venv/bin/activate
python3 tests/anthropic-bedrock-tests.py

# Compare results
echo ""
echo "=============================================="
echo "Generating Comparison Report..."
echo "=============================================="
npm run compare

echo ""
echo "Done! Check results/ directory for detailed output."
