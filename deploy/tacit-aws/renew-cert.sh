#!/usr/bin/env bash
# Renew the Let's Encrypt certificate when it is due, then reload nginx (weekly cron).
set -euo pipefail
export HOME=/root
cd /opt/dify/docker
docker compose run --rm --entrypoint certbot certbot renew --noninteractive \
  --webroot --webroot-path /var/www/html
docker compose exec -T nginx nginx -s reload
