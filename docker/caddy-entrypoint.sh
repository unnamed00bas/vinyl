#!/bin/sh
# Entrypoint скрипт для генерации Caddyfile на основе переменных окружения

set -e

CADDYFILE="/etc/caddy/Caddyfile"
DOMAIN="${CADDY_DOMAIN:-}"
EMAIL="${CADDY_EMAIL:-admin@localhost}"

# Если домен не указан, используем простую конфигурацию без SSL
if [ -z "$DOMAIN" ] || [ "$DOMAIN" = "localhost" ]; then
    cat > "$CADDYFILE" <<EOF
{
    email ${EMAIL}
}

:80 {
    reverse_proxy vinyl:3001
}
EOF
else
    # Если домен указан, используем автоматический SSL
    cat > "$CADDYFILE" <<EOF
{
    email ${EMAIL}
}

${DOMAIN} {
    reverse_proxy vinyl:3001
    
    log {
        output file /var/log/caddy/access.log
        format json
    }
}
EOF
fi

echo "Generated Caddyfile for domain: ${DOMAIN:-localhost:80}"
cat "$CADDYFILE"

# Запускаем Caddy
exec caddy run --config "$CADDYFILE" --adapter caddyfile
