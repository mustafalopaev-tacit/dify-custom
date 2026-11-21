#!/usr/bin/env bash
# Dump the Dify Postgres database to S3. Daily from cron, and before each deploy.
#   backup.sh [label]
set -euo pipefail
export HOME=/root
# shellcheck disable=SC1091
source /opt/dify/host.env

LABEL="${1:-daily}"
KEY="backups/postgres/$(date -u +%Y%m%dT%H%M%SZ)-$LABEL.dump"

cd /opt/dify/docker
docker compose exec -T db_postgres pg_dump -U postgres -d dify -Fc \
  | aws s3 cp - "s3://$TACIT_BUCKET/$KEY" --sse AES256
echo "Backed up Postgres to s3://$TACIT_BUCKET/$KEY"
