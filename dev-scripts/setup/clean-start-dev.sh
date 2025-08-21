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
pkill -f "turbopack" 2>/dev/null || true
pkill -f "node.*next" 2>/dev/null || true

# Kill any node processes running on dev ports specifically
echo "🔍 Checking for any node processes using dev ports..."
for port in 3000 3001 3002 3003; do
  # Get process using port and kill the parent node process
  PID=$(lsof -ti:$port 2>/dev/null)
  if [ ! -z "$PID" ]; then
    # Get the parent process (usually node)
    PARENT_PID=$(ps -o ppid= -p $PID 2>/dev/null | tr -d ' ')
    if [ ! -z "$PARENT_PID" ] && [ "$PARENT_PID" != "1" ]; then
      echo "⚡ Killing parent process $PARENT_PID for port $port"
      kill -9 $PARENT_PID 2>/dev/null || true
    fi
    echo "⚡ Killing process on port $port (PID: $PID)"
    kill -9 $PID 2>/dev/null || true
  fi
done

# Force kill any remaining Next.js related processes
echo "🔍 Force cleanup of any remaining Next.js processes..."
ps aux | grep -E '(next|npm.*dev|turbopack)' | grep -v grep | awk '{print $2}' | xargs -r kill -9 2>/dev/null || true

# Wait a moment for cleanup
sleep 2

# Verify ports are clear
echo "✅ Port cleanup verification..."
PORTS_CLEAR=true
for port in 3000 3001 3002 3003; do
  PID=$(lsof -ti:$port 2>/dev/null)
  if [ ! -z "$PID" ]; then
    echo "⚠️  Warning: Port $port still occupied (PID: $PID)"
    PORTS_CLEAR=false
  fi
done

# If ports are still occupied, try one more aggressive cleanup
if [ "$PORTS_CLEAR" = false ]; then
  echo "🔥 Performing aggressive cleanup..."
  for port in 3000 3001 3002 3003; do
    PID=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$PID" ]; then
      echo "🔥 Force killing stubborn process on port $port (PID: $PID)"
      kill -9 $PID 2>/dev/null || true
      # Also kill any child processes
      pkill -P $PID 2>/dev/null || true
    fi
  done
  sleep 1
  
  # Final verification
  echo "🔍 Final port verification..."
  for port in 3000 3001 3002 3003; do
    PID=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$PID" ]; then
      echo "❌ ERROR: Port $port still occupied after aggressive cleanup (PID: $PID)"
      echo "   You may need to manually kill this process or restart your system"
    else
      echo "✅ Port $port is clear"
    fi
  done
fi

echo ""
echo "🚀 Starting clean development server..."
echo "📡 Server will be available at http://localhost:3000"
echo "🔄 Cross-tab synchronization should work properly"
echo ""

# Start the development server
npm run dev