#!/usr/bin/env bash
# Publish Tacit/Dify Healthy=1|0 to CloudWatch every 5 minutes (cron).
# The `tacit-dify-unhealthy` alarm fires when it is 0 or missing.
set -uo pipefail
export HOME=/root
# shellcheck disable=SC1091
source /opt/dify/host.env

value=0
curl -fsS --max-time 10 "https://$TACIT_HOST/console/api/ping" >/dev/null 2>&1 && value=1
aws cloudwatch put-metric-data --namespace Tacit/Dify --metric-name Healthy \
  --dimensions "InstanceId=$TACIT_INSTANCE_ID" --value "$value"
