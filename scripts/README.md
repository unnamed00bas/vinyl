# Скрипты для Ubuntu Server

Набор скриптов для автоматической установки и управления Vinyl на Ubuntu Server.

## Скрипты

### 1. `ubuntu-setup.sh` - Первоначальная установка

Полная установка всех зависимостей и настройка приложения.

**Использование:**
```bash
sudo ./scripts/ubuntu-setup.sh [--domain your-domain.com] [--port 3000] [--node-version 20]
```

**Что делает:**
- Обновляет систему
- Устанавливает Node.js, FFmpeg и другие зависимости
- Создает пользователя для приложения
- Устанавливает npm зависимости
- Создает .env файл с шаблоном
- Настраивает базу данных
- Создает systemd service

**Пример:**
```bash
sudo ./scripts/ubuntu-setup.sh --domain vinyl.example.com --port 3000
```

### 2. `ubuntu-deploy.sh` - Деплой обновлений

Обновление кода и перезапуск приложения.

**Использование:**
```bash
./scripts/ubuntu-deploy.sh
```

**Что делает:**
- Останавливает сервис
- Обновляет код (если используется git)
- Устанавливает новые зависимости
- Применяет миграции БД
- Собирает приложение
- Запускает сервис

### 3. `ubuntu-nginx.sh` - Настройка Nginx

Установка и настройка Nginx с SSL сертификатом.

**Использование:**
```bash
sudo ./scripts/ubuntu-nginx.sh --domain your-domain.com [--port 3000] [--email your@email.com]
```

**Что делает:**
- Устанавливает Nginx
- Устанавливает Certbot
- Создает конфигурацию Nginx
- Получает SSL сертификат (если указан email)

**Пример:**
```bash
sudo ./scripts/ubuntu-nginx.sh --domain vinyl.example.com --port 3000 --email admin@example.com
```

### 4. `ubuntu-manage.sh` - Управление приложением

Удобные команды для управления сервисом.

**Использование:**
```bash
./scripts/ubuntu-manage.sh [команда]
```

**Команды:**
- `start` - Запустить сервис
- `stop` - Остановить сервис
- `restart` - Перезапустить сервис
- `status` - Показать статус
- `logs` - Показать логи (следить)
- `logs N` - Показать последние N строк
- `webhook` - Установить Telegram webhook
- `enable` - Включить автозапуск
- `disable` - Отключить автозапуск

**Примеры:**
```bash
# Перезапуск
./scripts/ubuntu-manage.sh restart

# Просмотр логов
./scripts/ubuntu-manage.sh logs

# Последние 50 строк
./scripts/ubuntu-manage.sh logs 50

# Установка webhook
./scripts/ubuntu-manage.sh webhook
```

## Быстрый старт

### Полная установка на чистом сервере

```bash
# 1. Клонируйте репозиторий
git clone <your-repo-url> vinyl
cd vinyl

# 2. Сделайте скрипты исполняемыми
chmod +x scripts/*.sh

# 3. Запустите установку
sudo ./scripts/ubuntu-setup.sh --domain your-domain.com

# 4. Настройте .env
sudo nano .env
# Заполните TELEGRAM_BOT_TOKEN, TELEGRAM_BOT_USERNAME, KIE_AI_API_KEY

# 5. Запустите приложение
sudo systemctl start vinyl

# 6. Настройте Nginx (если есть домен)
sudo ./scripts/ubuntu-nginx.sh --domain your-domain.com --email your@email.com

# 7. Установите webhook
./scripts/ubuntu-manage.sh webhook
```

## Требования

- Ubuntu 20.04 или новее
- Права sudo
- Домен (для продакшена с SSL)
- Telegram Bot Token
- KIE AI API Key

## Дополнительная информация

Подробная документация: [UBUNTU_DEPLOYMENT.md](../UBUNTU_DEPLOYMENT.md)
