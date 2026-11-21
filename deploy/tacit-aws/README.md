# Tacit Dify on AWS (Option A)

One EC2 host in eu-west-2 runs Dify with Docker Compose. The plan and its reasoning are in
[`docs/Dify on AWS — Option A Plan.md`](../../docs/Dify%20on%20AWS%20—%20Option%20A%20Plan.md).

| File                  | What it does                                                                                                                                                                                                                                             |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cloudformation.yaml` | Stack `tacit-dify`: S3 bucket, ECR repos, secret, IAM roles, security group, Elastic IP, EC2 host (user data installs Docker, AWS CLI, CloudWatch agent, cron), SSM deploy document, snapshot policy, alarms                                             |
| `deploy.sh`           | Runs on the host for each deploy: syncs `docker/`, backs up Postgres, writes `docker/.env` (settings + Secrets Manager values), pulls the images, starts the stack, gets the Let's Encrypt certificate on first run, checks health, rolls back when safe |
| `backup.sh`           | `pg_dump` to `s3://<bucket>/backups/postgres/` (daily at 02:15 UTC and before each deploy)                                                                                                                                                               |
| `healthcheck.sh`      | Publishes `Tacit/Dify Healthy` every 5 minutes for the `tacit-dify-unhealthy` alarm                                                                                                                                                                      |
| `renew-cert.sh`       | Weekly certificate renewal and nginx reload                                                                                                                                                                                                              |

The pipeline is `.github/workflows/tacit-deploy.yml`. It runs on every push to `main`:
checks, builds `tacit-dify-web` and `tacit-dify-api` tagged with the commit SHA, uploads
`docker/` and this folder to `s3://<bucket>/deploy/<sha>/release.tgz`, then runs the
`tacit-dify-deploy` SSM document on the host.

## Everyday tasks

Open a shell on the host (no SSH; needs the Session Manager plugin):

```bash
aws ssm start-session --region eu-west-2 --target <instance-id>
```

Redeploy a commit by hand (its images must already be in ECR):

```bash
aws ssm send-command --region eu-west-2 --document-name tacit-dify-deploy --instance-ids <instance-id> --parameters Sha=<full-sha>
```

Read the first-login password (`INIT_PASSWORD`, asked for on `/install`):

```bash
aws secretsmanager get-secret-value --region eu-west-2 --secret-id tacit-dify/env --query SecretString --output text | jq -r .INIT_PASSWORD
```

Restore Postgres from a dump (on the host, in `/opt/dify/docker`):

```bash
aws s3 cp s3://<bucket>/backups/postgres/<file>.dump - | docker compose exec -T db_postgres pg_restore -U postgres -d dify --clean --if-exists
```

Get alarm emails: subscribe an address to the `tacit-dify-alerts` SNS topic.

## Changing the infrastructure

Edit `cloudformation.yaml`, run `cfn-lint`, then update the `tacit-dify` stack with a change
set. The instance, its disk, the bucket, the ECR repos, the secret and the Elastic IP are
protected (termination protection, `Retain` policies), so a bad change cannot delete data.
User data only runs on first boot; change the host by hand through Session Manager, or in
`deploy.sh`.
