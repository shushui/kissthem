#!/bin/bash

# 🧪 Kiss them! Backend Test Runner
# This script runs all backend tests with proper formatting and coverage

echo "🧪 Starting Backend Test Suite..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to run tests with proper formatting
run_tests() {
    local test_type=$1
    local test_command=$2
    
    echo -e "\n${BLUE}🔍 Running $test_type...${NC}"
    echo "----------------------------------------"
    
    if eval $test_command; then
        echo -e "\n${GREEN}✅ $test_type completed successfully!${NC}"
        return 0
    else
        echo -e "\n${RED}❌ $test_type failed!${NC}"
        return 1
    fi
}

# Check if we're in the backend directory
if [ ! -f "package.json" ] || [ ! -f "src/app.module.ts" ]; then
    echo -e "${RED}❌ Error: Please run this script from the backend directory${NC}"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Run different types of tests
echo -e "\n${BLUE}🚀 Test Suite Options:${NC}"
echo "1. Unit Tests (fast)"
echo "2. Unit Tests with Coverage"
echo "3. E2E Integration Tests"
echo "4. All Tests"
echo "5. Watch Mode (development)"

read -p "Choose test type (1-5): " choice

case $choice in
    1)
        echo -e "\n${BLUE}🧪 Running Unit Tests...${NC}"
        run_tests "Unit Tests" "npm test"
        ;;
    2)
        echo -e "\n${BLUE}📊 Running Unit Tests with Coverage...${NC}"
        run_tests "Unit Tests with Coverage" "npm run test:cov"
        ;;
    3)
        echo -e "\n${BLUE}🔗 Running E2E Integration Tests...${NC}"
        run_tests "E2E Tests" "npm run test:e2e"
        ;;
    4)
        echo -e "\n${BLUE}🎯 Running All Tests...${NC}"
        
        # Run unit tests first
        if run_tests "Unit Tests" "npm test"; then
            echo -e "\n${GREEN}✅ Unit tests passed, running E2E tests...${NC}"
            
            # Then run E2E tests
            if run_tests "E2E Tests" "npm run test:e2e"; then
                echo -e "\n${GREEN}🎉 All tests passed! 🎉${NC}"
            else
                echo -e "\n${RED}❌ E2E tests failed!${NC}"
                exit 1
            fi
        else
            echo -e "\n${RED}❌ Unit tests failed, skipping E2E tests${NC}"
            exit 1
        fi
        ;;
    5)
        echo -e "\n${BLUE}👀 Starting Watch Mode...${NC}"
        echo "Press Ctrl+C to stop watching"
        npm run test:watch
        ;;
    *)
        echo -e "${RED}❌ Invalid choice. Please run the script again.${NC}"
        exit 1
        ;;
esac

echo -e "\n${GREEN}✨ Test runner completed!${NC}" 