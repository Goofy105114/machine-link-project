#!/bin/bash
# ============================================================
# MachineLink – Automated Deployment Script
# Usage: bash scripts/deploy.sh
# Run on EC2 instance after SSH login
# ============================================================

set -e  # Exit immediately on any error

APP_DIR="/home/ubuntu/machinelink"
LOG_FILE="/var/log/machinelink-deploy.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$TIMESTAMP] ========================================" | tee -a $LOG_FILE
echo "[$TIMESTAMP] Starting MachineLink Deployment..." | tee -a $LOG_FILE

# Step 1: Pull latest code from Git
echo "[$TIMESTAMP] [1/5] Pulling latest code from Git..." | tee -a $LOG_FILE
cd $APP_DIR
git fetch origin
git reset --hard origin/main
echo "[$TIMESTAMP] Code updated successfully." | tee -a $LOG_FILE

# Step 2: Stop running containers
echo "[$TIMESTAMP] [2/5] Stopping existing containers..." | tee -a $LOG_FILE
docker compose down --remove-orphans || true

# Step 3: Pull latest base images
echo "[$TIMESTAMP] [3/5] Pulling latest Docker base images..." | tee -a $LOG_FILE
docker pull node:20-alpine
docker pull mysql:8.0

# Step 4: Build and start containers
echo "[$TIMESTAMP] [4/5] Building and starting containers..." | tee -a $LOG_FILE
docker compose up --build -d

# Step 5: Health check
echo "[$TIMESTAMP] [5/5] Running health check..." | tee -a $LOG_FILE
sleep 10
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/health || echo "000")

if [ "$HTTP_STATUS" == "200" ]; then
  echo "[$TIMESTAMP] ✅ Deployment SUCCESSFUL — Backend responding (HTTP 200)" | tee -a $LOG_FILE
else
  echo "[$TIMESTAMP] ❌ Deployment WARNING — Backend not responding (HTTP $HTTP_STATUS)" | tee -a $LOG_FILE
  echo "[$TIMESTAMP] Check logs: docker logs machinelink_backend" | tee -a $LOG_FILE
fi

# Show running containers
echo "[$TIMESTAMP] Running containers:" | tee -a $LOG_FILE
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | tee -a $LOG_FILE

echo "[$TIMESTAMP] Deployment script completed." | tee -a $LOG_FILE
echo "[$TIMESTAMP] ========================================" | tee -a $LOG_FILE
