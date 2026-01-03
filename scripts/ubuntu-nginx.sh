#!/bin/bash

# Скрипт настройки Nginx для Vinyl на Ubuntu
# Использование: ./scripts/ubuntu-nginx.sh --domain your-domain.com --port 3000

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

DOMAIN=""
PORT=3000
EMAIL=""

# Парсинг аргументов
while [[ $# -gt 0 ]]; do
  case $1 in
    --domain)
      DOMAIN="$2"
      shift 2
      ;;
    --port)
      PORT="$2"
      shift 2
      ;;
    --email)
      EMAIL="$2"
      shift 2
      ;;
    *)
      echo -e "${RED}Неизвестный параметр: $1${NC}"
      exit 1
      ;;
  esac
done

if [ -z "$DOMAIN" ]; then
  echo -e "${RED}Ошибка: необходимо указать домен (--domain your-domain.com)${NC}"
  exit 1
fi

echo -e "${GREEN}=== Настройка Nginx для Vinyl ===${NC}\n"

# Проверка прав root
if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}Пожалуйста, запустите скрипт с правами sudo${NC}"
  exit 1
fi

# Установка Nginx
if ! command -v nginx &> /dev/null; then
  echo -e "${YELLOW}[1/4] Установка Nginx...${NC}"
  apt-get update
  apt-get install -y nginx
else
  echo "Nginx уже установлен"
fi

# Установка Certbot для SSL
if ! command -v certbot &> /dev/null; then
  echo -e "${YELLOW}[2/4] Установка Certbot...${NC}"
  apt-get install -y certbot python3-certbot-nginx
else
  echo "Certbot уже установлен"
fi

# Создание конфигурации Nginx
echo -e "${YELLOW}[3/4] Создание конфигурации Nginx...${NC}"
cat > /etc/nginx/sites-available/vinyl << EOF
server {
    listen 80;
    server_name $DOMAIN;

    # Логи
    access_log /var/log/nginx/vinyl-access.log;
    error_log /var/log/nginx/vinyl-error.log;

    # Максимальный размер загружаемого файла
    client_max_body_size 50M;

    # Проксирование на Next.js приложение
    location / {
        proxy_pass http://localhost:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Таймауты для длительных запросов (генерация видео)
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    # Статические файлы
    location /_next/static {
        proxy_pass http://localhost:$PORT;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }

    # Генерированные файлы
    location /generated {
        proxy_pass http://localhost:$PORT;
        proxy_cache_valid 200 24h;
        add_header Cache-Control "public";
    }
}
EOF

# Активация конфигурации
if [ ! -L /etc/nginx/sites-enabled/vinyl ]; then
  ln -s /etc/nginx/sites-available/vinyl /etc/nginx/sites-enabled/
  echo "Конфигурация активирована"
fi

# Проверка конфигурации
echo -e "${YELLOW}[4/4] Проверка конфигурации Nginx...${NC}"
nginx -t

# Перезагрузка Nginx
systemctl reload nginx

# Получение SSL сертификата
if [ ! -z "$EMAIL" ]; then
  echo -e "${GREEN}Получение SSL сертификата...${NC}"
  certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect
else
  echo -e "${YELLOW}Для получения SSL сертификата запустите:${NC}"
  echo -e "${YELLOW}sudo certbot --nginx -d $DOMAIN${NC}"
fi

echo -e "\n${GREEN}=== Nginx настроен! ===${NC}\n"
echo -e "Проверьте конфигурацию: ${YELLOW}sudo nginx -t${NC}"
echo -e "Перезагрузите Nginx: ${YELLOW}sudo systemctl reload nginx${NC}"
echo -e "Проверьте статус: ${YELLOW}sudo systemctl status nginx${NC}"
