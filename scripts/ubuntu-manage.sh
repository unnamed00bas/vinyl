#!/bin/bash

# Скрипт управления Vinyl на Ubuntu
# Использование: ./scripts/ubuntu-manage.sh [start|stop|restart|status|logs|webhook]

SERVICE_NAME="vinyl"
APP_URL="${NEXT_PUBLIC_APP_URL:-http://localhost:3000}"

case "$1" in
  start)
    echo "Запуск сервиса..."
    sudo systemctl start $SERVICE_NAME
    sudo systemctl status $SERVICE_NAME
    ;;
  stop)
    echo "Остановка сервиса..."
    sudo systemctl stop $SERVICE_NAME
    ;;
  restart)
    echo "Перезапуск сервиса..."
    sudo systemctl restart $SERVICE_NAME
    sudo systemctl status $SERVICE_NAME
    ;;
  status)
    sudo systemctl status $SERVICE_NAME
    ;;
  logs)
    if [ -z "$2" ]; then
      sudo journalctl -u $SERVICE_NAME -f
    else
      sudo journalctl -u $SERVICE_NAME -n $2
    fi
    ;;
  webhook)
    echo "Установка webhook..."
    curl -X POST "$APP_URL/api/telegram/setup-webhook"
    echo ""
    echo "Проверка статуса webhook..."
    curl "$APP_URL/api/telegram/setup-webhook"
    ;;
  enable)
    echo "Включение автозапуска..."
    sudo systemctl enable $SERVICE_NAME
    ;;
  disable)
    echo "Отключение автозапуска..."
    sudo systemctl disable $SERVICE_NAME
    ;;
  *)
    echo "Использование: $0 {start|stop|restart|status|logs|webhook|enable|disable}"
    echo ""
    echo "Команды:"
    echo "  start     - Запустить сервис"
    echo "  stop      - Остановить сервис"
    echo "  restart   - Перезапустить сервис"
    echo "  status    - Показать статус сервиса"
    echo "  logs      - Показать логи (следить за изменениями)"
    echo "  logs N    - Показать последние N строк логов"
    echo "  webhook   - Установить Telegram webhook"
    echo "  enable    - Включить автозапуск при загрузке"
    echo "  disable   - Отключить автозапуск"
    exit 1
    ;;
esac
