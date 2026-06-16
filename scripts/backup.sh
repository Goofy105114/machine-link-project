#!/bin/bash
# ============================================================
# MachineLink – Automated Database Backup Script
# Usage: bash scripts/backup.sh
# Schedule with cron: 0 2 * * * bash /home/ubuntu/machinelink/scripts/backup.sh
# ============================================================

set -e

# Configuration — edit these for your environment
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-rootpassword}"
DB_NAME="${DB_NAME:-machinelink}"
BACKUP_DIR="/home/ubuntu/machinelink-backups"
RETENTION_DAYS=7   # Keep backups for 7 days
TIMESTAMP=$(date '+%Y-%m-%d_%H-%M-%S')
BACKUP_FILE="$BACKUP_DIR/machinelink_backup_$TIMESTAMP.sql"
LOG_FILE="/var/log/machinelink-backup.log"

echo "[$TIMESTAMP] Starting database backup..." | tee -a $LOG_FILE

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Run mysqldump
echo "[$TIMESTAMP] Dumping database '$DB_NAME'..." | tee -a $LOG_FILE
mysqldump \
  -h $DB_HOST \
  -P $DB_PORT \
  -u $DB_USER \
  -p$DB_PASSWORD \
  --single-transaction \
  --routines \
  --triggers \
  $DB_NAME > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE
echo "[$TIMESTAMP] ✅ Backup created: ${BACKUP_FILE}.gz" | tee -a $LOG_FILE

# Delete backups older than RETENTION_DAYS
echo "[$TIMESTAMP] Cleaning backups older than $RETENTION_DAYS days..." | tee -a $LOG_FILE
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
echo "[$TIMESTAMP] Old backups cleaned." | tee -a $LOG_FILE

# List current backups
echo "[$TIMESTAMP] Current backups in $BACKUP_DIR:" | tee -a $LOG_FILE
ls -lh $BACKUP_DIR | tee -a $LOG_FILE

echo "[$TIMESTAMP] Backup completed successfully." | tee -a $LOG_FILE
