#!/bin/bash

# Clean Start Development Server Script
# 
# Purpose: Prevents multiple npm dev server instances that split session data
# across different backend instances (ports 3000, 3001, 3002), causing
# Active Stackers and cross-tab synchronization issues.
#
# Usage: ./dev-scripts/clean-start-dev.sh
# Alternative: npm run clean-dev (if added to package.json scripts)

echo "🧹 Clean Dev Server Startup"
echo "=========================="

# Kill any existing dev servers on common ports
echo "🔍 Checking for existing dev servers..."

# Check and kill processes on ports 3000-3003
for port in 3000 3001 3002 3003; do
  PID=$(lsof -ti:$port 2>/dev/null)
  if [ ! -z "$PID" ]; then
    echo "⚡ Killing process on port $port (PID: $PID)"
    kill -9 $PID 2>/dev/null
    sleep 0.5
  fi
done

# Additional cleanup - kill any npm/node processes that might be lingering
echo "🔍 Cleaning up any lingering npm/node processes..."
pkill -f "npm.*run.*dev" 2>/dev/null || true
pkill -f "next.*dev" 2>/dev/null || true

# Wait a moment for cleanup
sleep 1

# Verify ports are clear
echo "✅ Port cleanup verification..."
for port in 3000 3001 3002 3003; do
  PID=$(lsof -ti:$port 2>/dev/null)
  if [ ! -z "$PID" ]; then
    echo "⚠️  Warning: Port $port still occupied (PID: $PID)"
  fi
done

echo ""
echo "🚀 Starting clean development server..."
echo "📡 Server will be available at http://localhost:3000"
echo "🔄 Cross-tab synchronization should work properly"
echo ""

# Start the development server
npm run dev