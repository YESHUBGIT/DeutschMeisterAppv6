# Deployment (AWS + Docker)

## Overview

This app runs with three containers: Next.js, Postgres, and Nginx. Cognito
handles authentication.

## DNS and Cognito

- Point `thecloudtitan.de` and `www.thecloudtitan.de` to the server IP
  `3.94.163.196` in GoDaddy.
- In Cognito, set callback URL:
  - `https://thecloudtitan.de/api/auth/callback/cognito`
- Set sign-out URL (optional):
  - `https://thecloudtitan.de/auth/signin`

## Environment

Copy `.env.example` to `.env` on the server and fill in values.

Required:
- `NEXTAUTH_URL=https://thecloudtitan.de`
- `NEXTAUTH_SECRET=...`
- `COGNITO_CLIENT_ID=...`
- `COGNITO_CLIENT_SECRET=...`
- `COGNITO_ISSUER=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_NLWDaRRCx`
- `POSTGRES_PASSWORD=...`

## Start

```bash
docker compose up -d
```

## GitHub Actions (Docker Hub)

1) Create Docker Hub access token.
2) Add repo secrets:
   - `DOCKERHUB_USERNAME`
   - `DOCKERHUB_TOKEN`
3) Push to `main` and the workflow will build and push:
   - `${DOCKERHUB_USERNAME}/deutschmeister:latest`

## HTTPS (Let's Encrypt)

1) Ensure ports 80/443 are open in AWS security group.
2) Issue the first certificate:

```bash
docker compose stop nginx
docker compose run --rm --service-ports --entrypoint certbot certbot certonly --standalone \
  -d thecloudtitan.de -d www.thecloudtitan.de \
  --email you@thecloudtitan.de --agree-tos --no-eff-email
```

3) Reload Nginx:

```bash
docker compose exec nginx nginx -s reload
```

Certbot will auto-renew every 12 hours via the `certbot` service.

Manual renewal (if needed):

```bash
docker compose stop nginx
docker compose run --rm --service-ports --entrypoint certbot certbot renew
docker compose up -d
```

## Migrations

The app container runs `pnpm prisma migrate deploy` on start.

## TLS

TLS is handled by Nginx + Certbot in Docker.
