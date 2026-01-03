#!/bin/bash

# Скрипт для деплоя обновлений на Ubuntu Server
# Использование: ./scripts/ubuntu-deploy.sh

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

APP_DIR=$(pwd)
SERVICE_NAME="vinyl"

echo -e "${GREEN}=== Деплой Vinyl ===${NC}\n"

# Проверка, что мы в правильной директории
if [ ! -f "package.json" ]; then
  echo -e "${RED}Ошибка: package.json не найден. Запустите скрипт из корня проекта.${NC}"
  exit 1
fi

# Остановка сервиса
echo -e "${YELLOW}[1/5] Остановка сервиса...${NC}"
sudo systemctl stop $SERVICE_NAME || true

# Обновление кода (если используется git)
if [ -d ".git" ]; then
  echo -e "${YELLOW}[2/5] Обновление кода из git...${NC}"
  git pull origin main || git pull origin master || echo "Не удалось обновить код из git"
fi

# Установка зависимостей
echo -e "${YELLOW}[3/5] Установка зависимостей...${NC}"
npm install

# Обновление базы данных
echo -e "${YELLOW}[4/5] Обновление базы данных...${NC}"
npm run db:generate
npm run db:migrate || echo "Миграции уже применены"

# Сборка приложения
echo -e "${YELLOW}[5/5] Сборка приложения...${NC}"
npm run build

# Запуск сервиса
echo -e "${GREEN}Запуск сервиса...${NC}"
sudo systemctl start $SERVICE_NAME

# Проверка статуса
sleep 2
if sudo systemctl is-active --quiet $SERVICE_NAME; then
  echo -e "${GREEN}✅ Сервис успешно запущен!${NC}"
  echo -e "\nПроверьте статус: ${YELLOW}sudo systemctl status $SERVICE_NAME${NC}"
  echo -e "Просмотр логов: ${YELLOW}sudo journalctl -u $SERVICE_NAME -f${NC}"
else
  echo -e "${RED}❌ Ошибка при запуске сервиса${NC}"
  echo -e "Проверьте логи: ${YELLOW}sudo journalctl -u $SERVICE_NAME -n 50${NC}"
  exit 1
fi
