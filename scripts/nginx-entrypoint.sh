#!/usr/bin/env sh
set -e

DOMAIN="${NGINX_DOMAIN:-thecloudtitan.de}"
CERT="/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"
TEMPLATE_DIR="/etc/nginx/conf.d-templates"
TARGET="/etc/nginx/conf.d/thecloudtitan.de.conf"

if [ -f "$CERT" ]; then
  cp "$TEMPLATE_DIR/https.conf" "$TARGET"
else
  cp "$TEMPLATE_DIR/http.conf" "$TARGET"
fi

nginx -g "daemon off;"
