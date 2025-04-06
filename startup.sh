#!/bin/bash

echo "🚀 Starting EXP0S3D platform..."

# Check if MongoDB is running
if ! pgrep mongod > /dev/null; then
    echo "📦 Starting MongoDB..."
    mkdir -p ~/data/db
    mongod --dbpath ~/data/db &
    sleep 3  # Give MongoDB time to start
fi

# Kill any existing processes on port 3000
echo "🧹 Cleaning up port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Start the development server
echo "🌟 Starting development server..."
npm run dev 