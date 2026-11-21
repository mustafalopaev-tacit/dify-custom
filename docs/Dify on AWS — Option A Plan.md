# Dify on AWS — Option A Plan

Nov 21, 2026 · @Mustafa

## Summary

We will self-host the open-source Dify on one EC2 server in eu-west-2 (London), running Docker Compose, for an internal pilot. It costs about $190/month before Bedrock usage, and our AWS credits should cover it. Once Dify is in production, we move to ECS Fargate with managed Postgres and Redis (Option B).

## Server specs and cost

The recommended server is an m7i.xlarge: 4 vCPU and 16 GiB RAM. Dify's minimum is 2 vCPU / 4 GiB, but Dify 1.20 starts about 15 containers by default, which use 6–8 GiB at idle, before document-indexing spikes.

| Item | Spec | Cost (USD/month) |
| --- | --- | --- |
| Instance | m7i.xlarge — 4 vCPU (Intel Sapphire Rapids), 16 GiB RAM | 170 ($0.2331/hr) |
| Disk | 100 GB gp3 SSD | 9.28 |
| Public IPv4 | 1 Elastic IP | \~3.65 |
| Other | EBS snapshots, `pg_dump` files in S3, CloudWatch, Secrets Manager, ECR storage, data transfer | \~5–10 |
| OS | Ubuntu 24.04 LTS or Amazon Linux 2023 + Docker Compose | — |
| **Total** |  | **≈ 190** + Bedrock tokens |

If needs change: t3.xlarge (same size, burstable CPU) is $138/month; m7i.2xlarge (8 vCPU / 32 GiB) is $340/month. To resize, stop the instance, change its type and start it again (a few minutes of downtime). Adding an ALB later costs about $20/month more. Prices are AWS on-demand rates for eu-west-2, as of the date above.

## Setup

All of Dify runs on the one server except file storage (S3) and the LLMs (Bedrock), which the server reaches through an IAM role with no stored keys.

| Component | Where it runs | Notes |
| --- | --- | --- |
| Dify app (api, worker, worker beat, web, nginx, plugin daemon, sandbox, ssrf proxy) | EC2, Docker Compose | Official `docker/docker-compose.yaml` from our fork, plus a `docker-compose.override.yaml` that points to our ECR images |
| Dify agent services (agent backend, local sandbox, agent ssrf proxy) and collaboration websocket (`api_websocket`) | EC2, Docker Compose | Started by default in Dify 1.20; upstream images unless we re-brand them too |
| PostgreSQL, Redis | EC2, Docker Compose | Data lives on the EBS disk |
| Vector DB (Weaviate) | EC2, Docker Compose | Default in Dify's compose file (`VECTOR_STORE=weaviate`) |
| File storage | S3, a new bucket in eu-west-2 | `STORAGE_TYPE=s3`, `S3_USE_AWS_MANAGED_IAM=true` (uses the instance role) |
| LLMs | Amazon Bedrock, EU cross-region inference profiles (`eu.anthropic.…`) | Already enabled on the account; keeps data in the EU. Confirm the exact model IDs in the Bedrock console (they include a version suffix) |
| Access | IAM instance role | See "Secure it" for the exact permissions |
| HTTPS | nginx + Let's Encrypt (the compose file's `certbot` profile) | Cheapest for a pilot. Needs a domain and a DNS record pointing to the Elastic IP; no Route 53 zones exist yet |
| Email | Amazon SES (`MAIL_TYPE`) | Needed for invitations and password resets |
| Backups | Daily EBS snapshots (Data Lifecycle Manager) + daily `pg_dump` to S3 | Snapshots of a running database are only crash-consistent, so the `pg_dump` is the reliable Postgres restore |

Keep it on its own instance, separate from the tacit servers, in the existing default VPC.

## Deployment

We need three things: create the AWS services, lock them down, and add a GitHub pipeline so every merge to `main` in our Dify fork deploys automatically.

This is implemented in [`deploy/tacit-aws/`](../deploy/tacit-aws/README.md) (CloudFormation stack `tacit-dify` and the host scripts) and [`.github/workflows/tacit-deploy.yml`](../.github/workflows/tacit-deploy.yml).

### 1. Create the AWS services (eu-west-2)

| Service | What we create | Purpose |
| --- | --- | --- |
| EC2 | m7i.xlarge, 100 GB encrypted gp3, Elastic IP; IMDSv2 required with hop limit 2 | Runs Dify with Docker Compose |
| ECR | `tacit-dify-web`, `tacit-dify-api` repos | Our re-branded Dify images (the api image also runs worker and worker beat) |
| S3 | Private bucket for Dify files; a `backups/` prefix for `pg_dump` files | Uploads, knowledge-base documents, database dumps |
| IAM | Instance role; GitHub OIDC provider + deploy role | Server access to Bedrock/S3/ECR/SSM; keyless CI access |
| Secrets Manager | One secret holding only Dify's secret values | `SECRET_KEY`, DB, Redis and SES SMTP passwords |
| Systems Manager (SSM) | Session Manager, Run Command, Patch Manager; a custom `tacit-dify-deploy` document | Shell access and deploys without SSH; OS patching |
| SES | Verified sending domain | Dify invitation and password-reset emails |
| Backups and alerts | Data Lifecycle Manager snapshots; cron `pg_dump` to S3; CloudWatch alarms | Daily backups; CPU, disk and health alerts |

### 2. Secure it

- Do all work through an IAM user or SSO role, never the root account; turn on MFA
- Security group: only 443 (and 80 for redirects and Let's Encrypt renewal) open to the internet; no SSH port, shell access through SSM Session Manager only. If we later add an ALB, the instance accepts traffic from the ALB's security group only
- Require IMDSv2 on the instance with a hop limit of 2. With the default hop limit of 1, Docker containers can't reach the metadata service, so the api, worker and plugin daemon would get no role credentials for S3 or Bedrock
- Encrypt the EBS disk and the S3 bucket; block all public access on the bucket
- Least-privilege instance role:
  - `bedrock:InvokeModel` / `InvokeModelWithResponseStream` on the EU inference profiles only
  - Read/write on the Dify bucket only
  - Pull from our two ECR repos only
  - Read its one secret
  - `AmazonSSMManagedInstanceCore`, without which Session Manager, Run Command and Patch Manager don't work
- Least-privilege GitHub role: push to the two ECR repos, and `ssm:SendCommand` only for the `tacit-dify-deploy` document on this one instance. Never allow `AWS-RunShellScript`, which would let the role run any command as root
- Bedrock credentials: configure the Bedrock plugin in Dify with the access-key fields left blank so it uses the instance role. Test this in the pilot; if the plugin can't use the role, decide between a dedicated IAM user's keys (stored in Dify, rotated) and a different provider setup before going further
- No secrets in the repo or in GitHub: the server reads secret values from Secrets Manager at deploy time; non-secret settings stay in the repo's `docker/envs/*` files
- Dify settings: disable public sign-up (`ALLOW_REGISTER=false`, invite only), keep the code sandbox and SSRF proxy enabled, set a strong `SECRET_KEY`
- Keep GuardDuty, AWS Config and CloudTrail on (already running in the account); patch the OS monthly with Patch Manager; turn on Docker log rotation so logs can't fill the disk

### 3. Auto-deploy from GitHub on `main`

A GitHub Actions workflow in the Dify fork runs on every push to `main`:

1. **Check**: lint, type-check, unit tests and production build for `web/` (and `api/` if changed)
2. **Authenticate**: sign in to AWS with GitHub OIDC; no stored AWS keys
3. **Build and push**: build the `web` and `api` images, tag them with the commit SHA, push to ECR
4. **Deploy**: SSM Run Command runs the `tacit-dify-deploy` document on the instance, which:
   1. checks out the `docker/` directory at the same commit SHA (so compose changes from upstream arrive with the images)
   2. runs `pg_dump` to S3 as a pre-deploy backup
   3. writes the secret values from Secrets Manager into `.env`
   4. sets the image tag in `docker-compose.override.yaml` for `api`, `worker`, `worker_beat` and `web` (all on the same SHA)
   5. runs `docker compose pull && docker compose up -d`
5. **Verify**: hit the health endpoint. If it fails and the deploy ran no database migrations, redeploy the previous SHA automatically. If migrations ran (the api runs them on startup, `MIGRATION_ENABLED=true`), don't roll back automatically: the old image may not work with the new schema. Alert instead, and roll back by hand by restoring the pre-deploy `pg_dump` with the previous SHA
6. **Notify**: post the result (and the deployed SHA) to Slack or the PR

Protect `main` with required reviews and passing checks, and use a GitHub `production` environment so deploys need the workflow to pass first. Upstream Dify releases come in through a merge PR into `main`, which then deploys the same way; check that PR for new or renamed compose services and env settings.

## License

We hold a commercial license from LangGenius, which covers full re-branding (logo, name and copyright in Dify's frontend) on top of the modified Apache 2.0 ([LICENSE](https://github.com/langgenius/dify/blob/main/LICENSE)). The Tacit re-brand can ship in the deployed `web` image. Contract reference: _add link or contract number_.
