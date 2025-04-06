#!/bin/bash

# Get the directory where the script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Change to project root directory
cd "$DIR/.."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Run backup script
echo "Starting scheduled backup at $(date)"
node scripts/backup.js >> logs/backup.log 2>&1

# Check exit status
if [ $? -eq 0 ]; then
    echo "Backup completed successfully at $(date)" >> logs/backup.log
else
    echo "Backup failed at $(date)" >> logs/backup.log
fi 
 
 
 
 
 
 
 