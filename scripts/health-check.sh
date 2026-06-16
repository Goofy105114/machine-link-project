#!/bin/bash
# ============================================================
# MachineLink – Health Check & Auto-Recovery Script
# Usage: bash scripts/health-check.sh
# Schedule with cron: */5 * * * * bash /home/ubuntu/machinelink/scripts/health-check.sh
# ============================================================

APP_DIR="/home/ubuntu/machinelink"
LOG_FILE="/var/log/machinelink-health.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
ALERT_EMAIL="admin@machinelink.io"  # Change to your email

echo "[$TIMESTAMP] Running health checks..." >> $LOG_FILE

# Check backend API
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/health 2>/dev/null || echo "000")

if [ "$BACKEND_STATUS" != "200" ]; then
  echo "[$TIMESTAMP] ❌ ALERT: Backend down (HTTP $BACKEND_STATUS). Restarting..." >> $LOG_FILE
  cd $APP_DIR && docker restart machinelink_backend
  sleep 5
  RETRY=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/health 2>/dev/null || echo "000")
  if [ "$RETRY" == "200" ]; then
    echo "[$TIMESTAMP] ✅ Backend recovered after restart." >> $LOG_FILE
  else
    echo "[$TIMESTAMP] ❌ CRITICAL: Backend still down after restart. Manual intervention required." >> $LOG_FILE
  fi
else
  echo "[$TIMESTAMP] ✅ Backend: OK (HTTP 200)" >> $LOG_FILE
fi

# Check frontend
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 2>/dev/null || echo "000")
if [ "$FRONTEND_STATUS" == "200" ]; then
  echo "[$TIMESTAMP] ✅ Frontend: OK (HTTP 200)" >> $LOG_FILE
else
  echo "[$TIMESTAMP] ⚠️  Frontend: Not responding (HTTP $FRONTEND_STATUS). Restarting..." >> $LOG_FILE
  cd $APP_DIR && docker restart machinelink_frontend
fi

# Check MySQL container
DB_STATUS=$(docker inspect -f '{{.State.Running}}' machinelink_db 2>/dev/null || echo "false")
if [ "$DB_STATUS" == "true" ]; then
  echo "[$TIMESTAMP] ✅ Database container: Running" >> $LOG_FILE
else
  echo "[$TIMESTAMP] ❌ ALERT: Database container stopped. Restarting..." >> $LOG_FILE
  cd $APP_DIR && docker start machinelink_db
fi

# System resource checks
CPU=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1 2>/dev/null || echo "N/A")
MEM=$(free -m | awk 'NR==2{printf "%.1f%%", $3*100/$2}' 2>/dev/null || echo "N/A")
DISK=$(df -h / | awk 'NR==2{print $5}' 2>/dev/null || echo "N/A")

echo "[$TIMESTAMP] 📊 System — CPU: ${CPU}% | Memory: ${MEM} | Disk: ${DISK}" >> $LOG_FILE
echo "[$TIMESTAMP] Health check completed." >> $LOG_FILE
echo "---" >> $LOG_FILE
