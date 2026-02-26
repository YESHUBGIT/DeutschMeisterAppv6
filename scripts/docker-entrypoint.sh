#!/usr/bin/env sh
set -e

pnpm prisma migrate deploy

exec pnpm start
