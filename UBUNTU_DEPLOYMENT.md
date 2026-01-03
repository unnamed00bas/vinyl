# Развертывание на Ubuntu Server

Полное руководство по установке и настройке Vinyl на Ubuntu Server.

## Быстрый старт

### 1. Подготовка сервера

Подключитесь к вашему Ubuntu серверу и выполните:

```bash
# Клонируйте репозиторий (или загрузите файлы проекта)
git clone <your-repo-url> vinyl
cd vinyl

# Сделайте скрипты исполняемыми
chmod +x scripts/*.sh
```

### 2. Первоначальная установка

Запустите скрипт установки:

```bash
sudo ./scripts/ubuntu-setup.sh --domain your-domain.com --port 3000
```

**Параметры:**
- `--domain` - ваш домен (опционально, для продакшена)
- `--port` - порт приложения (по умолчанию 3000)
- `--node-version` - версия Node.js (по умолчанию 20)

**Что делает скрипт:**
- ✅ Обновляет систему
- ✅ Устанавливает Node.js 20
- ✅ Устанавливает FFmpeg
- ✅ Создает пользователя для приложения
- ✅ Устанавливает зависимости npm
- ✅ Создает .env файл с шаблоном
- ✅ Настраивает базу данных
- ✅ Создает systemd service для автозапуска

### 3. Настройка переменных окружения

Отредактируйте файл `.env`:

```bash
sudo nano .env
```

Заполните обязательные переменные:
- `TELEGRAM_BOT_TOKEN` - токен бота от @BotFather
- `TELEGRAM_BOT_USERNAME` - username вашего бота
- `KIE_AI_API_KEY` - API ключ от KIE AI
- `NEXT_PUBLIC_APP_URL` - URL вашего приложения (https://your-domain.com)

### 4. Запуск приложения

```bash
# Запуск
sudo systemctl start vinyl

# Проверка статуса
sudo systemctl status vinyl

# Просмотр логов
sudo journalctl -u vinyl -f
```

### 5. Настройка Nginx (для продакшена)

Если у вас есть домен, настройте Nginx:

```bash
sudo ./scripts/ubuntu-nginx.sh --domain your-domain.com --port 3000 --email your@email.com
```

Это установит Nginx, настроит проксирование и получит SSL сертификат через Let's Encrypt.

### 6. Установка Telegram Webhook

После запуска приложения установите webhook:

```bash
./scripts/ubuntu-manage.sh webhook
```

Или вручную:

```bash
curl -X POST "https://your-domain.com/api/telegram/setup-webhook"
```

## Управление приложением

Используйте скрипт управления:

```bash
./scripts/ubuntu-manage.sh [команда]
```

**Доступные команды:**

- `start` - Запустить сервис
- `stop` - Остановить сервис
- `restart` - Перезапустить сервис
- `status` - Показать статус
- `logs` - Показать логи (следить)
- `logs 100` - Показать последние 100 строк
- `webhook` - Установить Telegram webhook
- `enable` - Включить автозапуск
- `disable` - Отключить автозапуск

**Примеры:**

```bash
# Перезапуск приложения
./scripts/ubuntu-manage.sh restart

# Просмотр последних 50 строк логов
./scripts/ubuntu-manage.sh logs 50

# Проверка статуса
./scripts/ubuntu-manage.sh status
```

## Деплой обновлений

Для деплоя обновлений используйте:

```bash
./scripts/ubuntu-deploy.sh
```

**Что делает скрипт:**
- ✅ Останавливает сервис
- ✅ Обновляет код (если используется git)
- ✅ Устанавливает новые зависимости
- ✅ Применяет миграции базы данных
- ✅ Собирает приложение
- ✅ Запускает сервис

## Ручная установка (без скриптов)

Если вы предпочитаете установку вручную:

### 1. Установка зависимостей

```bash
# Обновление системы
sudo apt-get update && sudo apt-get upgrade -y

# Установка Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установка FFmpeg
sudo apt-get install -y ffmpeg

# Установка других зависимостей
sudo apt-get install -y build-essential git
```

### 2. Настройка приложения

```bash
# Установка зависимостей npm
npm install

# Настройка базы данных
npm run db:generate
npm run db:migrate
npm run setup

# Сборка приложения
npm run build
```

### 3. Создание systemd service

Создайте файл `/etc/systemd/system/vinyl.service`:

```ini
[Unit]
Description=Vinyl Telegram Mini App
After=network.target

[Service]
Type=simple
User=vinyl
WorkingDirectory=/path/to/vinyl
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

Активируйте сервис:

```bash
sudo systemctl daemon-reload
sudo systemctl enable vinyl
sudo systemctl start vinyl
```

## Настройка Nginx

Создайте файл `/etc/nginx/sites-available/vinyl`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
}
```

Активируйте конфигурацию:

```bash
sudo ln -s /etc/nginx/sites-available/vinyl /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Получите SSL сертификат:

```bash
sudo certbot --nginx -d your-domain.com
```

## Мониторинг и логи

### Просмотр логов

```bash
# Все логи
sudo journalctl -u vinyl

# Последние 100 строк
sudo journalctl -u vinyl -n 100

# Следить за логами в реальном времени
sudo journalctl -u vinyl -f

# Логи за сегодня
sudo journalctl -u vinyl --since today
```

### Проверка статуса

```bash
# Статус сервиса
sudo systemctl status vinyl

# Проверка порта
sudo netstat -tlnp | grep 3000

# Проверка процессов
ps aux | grep node
```

## Безопасность

### Firewall

```bash
# Установка UFW
sudo apt-get install -y ufw

# Разрешить SSH
sudo ufw allow 22/tcp

# Разрешить HTTP и HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Включить firewall
sudo ufw enable
```

### Обновление системы

```bash
# Регулярно обновляйте систему
sudo apt-get update && sudo apt-get upgrade -y

# Настройте автоматические обновления безопасности
sudo apt-get install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## Резервное копирование

### База данных

```bash
# Создать резервную копию
cp prisma/dev.db prisma/dev.db.backup.$(date +%Y%m%d_%H%M%S)

# Восстановить из резервной копии
cp prisma/dev.db.backup.YYYYMMDD_HHMMSS prisma/dev.db
```

### Автоматическое резервное копирование

Создайте скрипт `/usr/local/bin/vinyl-backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backups/vinyl"
mkdir -p $BACKUP_DIR
cp /path/to/vinyl/prisma/dev.db "$BACKUP_DIR/dev.db.$(date +%Y%m%d_%H%M%S)"
find $BACKUP_DIR -name "dev.db.*" -mtime +7 -delete
```

Добавьте в crontab:

```bash
# Ежедневное резервное копирование в 2:00
0 2 * * * /usr/local/bin/vinyl-backup.sh
```

## Устранение неполадок

### Приложение не запускается

```bash
# Проверьте логи
sudo journalctl -u vinyl -n 50

# Проверьте переменные окружения
sudo systemctl show vinyl | grep Environment

# Проверьте права доступа
ls -la /path/to/vinyl
```

### Проблемы с базой данных

```bash
# Проверьте файл базы данных
ls -la prisma/dev.db

# Пересоздайте миграции
npm run db:migrate reset
npm run db:migrate
npm run setup
```

### Проблемы с FFmpeg

```bash
# Проверьте установку
ffmpeg -version

# Переустановите при необходимости
sudo apt-get remove ffmpeg
sudo apt-get install ffmpeg
```

### Проблемы с Nginx

```bash
# Проверьте конфигурацию
sudo nginx -t

# Проверьте логи
sudo tail -f /var/log/nginx/vinyl-error.log

# Перезагрузите Nginx
sudo systemctl reload nginx
```

## Дополнительные ресурсы

- [SETUP.md](./SETUP.md) - Общая инструкция по установке
- [QUICKSTART.md](./QUICKSTART.md) - Быстрый старт
- [TELEGRAM_PAYMENTS.md](./TELEGRAM_PAYMENTS.md) - Настройка платежей
- [DOCKER.md](./DOCKER.md) - Развертывание через Docker

## Поддержка

При возникновении проблем:
1. Проверьте логи: `sudo journalctl -u vinyl -n 100`
2. Убедитесь, что все переменные окружения заполнены
3. Проверьте, что порт не занят другим приложением
4. Убедитесь, что firewall разрешает подключения
