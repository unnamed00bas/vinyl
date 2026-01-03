#!/bin/bash

# Скрипт установки и настройки Vinyl на Ubuntu Server
# Использование: ./scripts/ubuntu-setup.sh [--domain your-domain.com] [--port 3000]

set -e  # Остановка при ошибке

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Параметры по умолчанию
DOMAIN=""
PORT=3000
APP_DIR=$(pwd)
SERVICE_USER="vinyl"
NODE_VERSION="20"

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
    --node-version)
      NODE_VERSION="$2"
      shift 2
      ;;
    *)
      echo -e "${RED}Неизвестный параметр: $1${NC}"
      exit 1
      ;;
  esac
done

echo -e "${GREEN}=== Установка Vinyl на Ubuntu ===${NC}\n"

# Проверка прав root
if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}Пожалуйста, запустите скрипт с правами sudo${NC}"
  exit 1
fi

# Обновление системы
echo -e "${YELLOW}[1/10] Обновление системы...${NC}"
apt-get update
apt-get upgrade -y

# Установка базовых пакетов
echo -e "${YELLOW}[2/10] Установка базовых пакетов...${NC}"
apt-get install -y curl wget git build-essential

# Установка Node.js через NodeSource
echo -e "${YELLOW}[3/10] Установка Node.js ${NODE_VERSION}...${NC}"
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
  apt-get install -y nodejs
else
  echo "Node.js уже установлен: $(node --version)"
fi

# Установка FFmpeg
echo -e "${YELLOW}[4/10] Установка FFmpeg...${NC}"
if ! command -v ffmpeg &> /dev/null; then
  apt-get install -y ffmpeg
else
  echo "FFmpeg уже установлен: $(ffmpeg -version | head -n 1)"
fi

# Создание пользователя для приложения
echo -e "${YELLOW}[5/10] Создание пользователя для приложения...${NC}"
if ! id "$SERVICE_USER" &>/dev/null; then
  useradd -r -s /bin/bash -d "$APP_DIR" "$SERVICE_USER"
  echo "Пользователь $SERVICE_USER создан"
else
  echo "Пользователь $SERVICE_USER уже существует"
fi

# Установка зависимостей npm
echo -e "${YELLOW}[6/10] Установка зависимостей npm...${NC}"
cd "$APP_DIR"
npm install

# Настройка переменных окружения
echo -e "${YELLOW}[7/10] Настройка переменных окружения...${NC}"
if [ ! -f .env ]; then
  # Генерация JWT секрета
  JWT_SECRET=$(openssl rand -hex 32)
  
  # Определение URL приложения
  if [ -z "$DOMAIN" ]; then
    APP_URL="http://localhost:${PORT}"
  else
    APP_URL="https://${DOMAIN}"
  fi
  
  cat > .env << EOF
# Database
DATABASE_URL="file:./prisma/dev.db"

# JWT Secret
JWT_SECRET=${JWT_SECRET}

# Telegram Bot (заполните вручную!)
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
TELEGRAM_BOT_USERNAME=your_bot_username

# KIE AI Integration (заполните вручную!)
KIE_AI_API_KEY=your_kie_ai_api_key
KIE_AI_API_URL=https://api.kie.ai

# App URL
NEXT_PUBLIC_APP_URL=${APP_URL}

# Telegram Web App Secret (опционально)
TELEGRAM_BOT_SECRET=
EOF
  echo -e "${GREEN}Файл .env создан. Не забудьте заполнить TELEGRAM_BOT_TOKEN, TELEGRAM_BOT_USERNAME и KIE_AI_API_KEY!${NC}"
else
  echo "Файл .env уже существует, пропускаем создание"
fi

# Настройка базы данных
echo -e "${YELLOW}[8/10] Настройка базы данных...${NC}"
npm run db:generate
npm run db:migrate
npm run setup

# Установка прав доступа
echo -e "${YELLOW}[9/10] Установка прав доступа...${NC}"
chown -R $SERVICE_USER:$SERVICE_USER "$APP_DIR"
chmod +x "$APP_DIR/scripts/"*.sh

# Создание systemd service
echo -e "${YELLOW}[10/10] Создание systemd service...${NC}"
cat > /etc/systemd/system/vinyl.service << EOF
[Unit]
Description=Vinyl Telegram Mini App
After=network.target

[Service]
Type=simple
User=$SERVICE_USER
WorkingDirectory=$APP_DIR
Environment=NODE_ENV=production
Environment=PORT=$PORT
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable vinyl.service

echo -e "\n${GREEN}=== Установка завершена! ===${NC}\n"
echo -e "Следующие шаги:"
echo -e "1. Отредактируйте файл .env и заполните необходимые переменные:"
echo -e "   ${YELLOW}sudo nano $APP_DIR/.env${NC}"
echo -e ""
echo -e "2. Запустите приложение:"
echo -e "   ${YELLOW}sudo systemctl start vinyl${NC}"
echo -e ""
echo -e "3. Проверьте статус:"
echo -e "   ${YELLOW}sudo systemctl status vinyl${NC}"
echo -e ""
echo -e "4. Установите webhook (после запуска):"
echo -e "   ${YELLOW}curl -X POST \"http://localhost:${PORT}/api/telegram/setup-webhook\"${NC}"
echo -e ""
echo -e "5. Просмотр логов:"
echo -e "   ${YELLOW}sudo journalctl -u vinyl -f${NC}"
echo -e ""
echo -e "${RED}⚠️  Не забудьте изменить пароль админа после первого входа!${NC}"
echo -e "   Email: admin@vinyl.app"
echo -e "   Пароль: admin123"
