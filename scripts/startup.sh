#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting EXP0S3D platform...${NC}"
echo "----------------------------------------"

# Kill any existing processes
pkill -f nodemon || true
pkill -f "lt --port 3000" || true

# Start MongoDB if not running
if ! pgrep mongod > /dev/null; then
    echo -e "${BLUE}Starting MongoDB...${NC}"
    brew services start mongodb-community
fi

# Start the application with clean logs
export DEBUG=false
export NODE_ENV=production

# Clear terminal and start services
clear
echo -e "${BLUE}Starting services...${NC}"
echo "----------------------------------------"

# Function to check service status
check_service() {
    case $1 in
        "mongodb")
            if pgrep mongod > /dev/null; then
                echo -e "${GREEN}✓ MongoDB is running${NC}"
                return 0
            else
                echo -e "${RED}✗ MongoDB failed to start${NC}"
                return 1
            fi
            ;;
        "server")
            if curl -s http://localhost:3000 > /dev/null; then
                echo -e "${GREEN}✓ Server is running on http://localhost:3000${NC}"
                return 0
            else
                echo -e "${RED}✗ Server failed to start${NC}"
                return 1
            fi
            ;;
        "tunnel")
            if curl -s https://exp0s3d-agent.loca.lt > /dev/null; then
                echo -e "${GREEN}✓ Tunnel is running on https://exp0s3d-agent.loca.lt${NC}"
                return 0
            else
                echo -e "${RED}✗ Tunnel failed to start${NC}"
                return 1
            fi
            ;;
    esac
}

# Start application and tunnel
npm run dev & 
lt --port 3000 --subdomain exp0s3d-agent &

# Wait for services to start
sleep 3

# Check services status
echo "----------------------------------------"
echo -e "${BLUE}Checking services status:${NC}"
check_service "mongodb"
check_service "server"
check_service "tunnel"
echo "----------------------------------------"

# Keep script running and show only important logs
echo -e "${BLUE}Monitoring logs (showing only important messages):${NC}"
tail -f ~/.pm2/logs/app-out.log | grep -v -E "CSRF|\.identity|favicon" 
 
 
 
 
 
 
 