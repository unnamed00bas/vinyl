# Vinyl

**Мини-приложение Telegram: человек описывает словами, какую музыку хочет, и получает свою виниловую пластинку — с треком, обложкой и вращением.**

[![Telegram Mini App](https://img.shields.io/badge/Telegram-Mini_App-0573B8?style=flat-square&labelColor=0C0F13)](https://core.telegram.org/bots/webapps)
[![Next.js](https://img.shields.io/badge/Next.js-14-0573B8?style=flat-square&labelColor=0C0F13)](https://nextjs.org)
[![Prisma](https://img.shields.io/badge/Prisma-SQLite-0573B8?style=flat-square&labelColor=0C0F13)](https://www.prisma.io)
[![Автор](https://img.shields.io/badge/Автор-PROMAREN-E8A33B?style=flat-square&labelColor=0C0F13)](https://promaren.ru)

---

## Что это

Подарок, который собирается за минуту прямо в переписке. Человек пишет, о чём и для кого песня, выбирает настроение — приложение генерирует трек, рисует центральную наклейку и показывает готовую пластинку, которую можно крутить пальцем и слушать.

Одна и та же сборка открывается тремя способами: как мини-приложение внутри Telegram, как обычный сайт и как приложение на телефоне.

## Что умеет

- **Собирает трек по описанию.** Текст пользователя уходит в Suno через KIE AI и возвращается готовой песней.
- **Делает пластинку.** Наклейка в центре либо генерируется, либо загружается своей картинкой; пластинка вращается, дорожка играет.
- **Принимает оплату звёздами Telegram.** Покупка внутри мессенджера, без внешних платёжных форм.
- **Даёт админскую часть.** Заказы, пользователи, состояние генераций видны в отдельном разделе с входом по паролю.

## Как запустить

```bash
npm install
cp .env.example .env      # ключи KIE AI и токен бота
npx prisma migrate dev    # база
npm run dev               # экран на localhost:3000
npm run server:dev        # серверная часть рядом
```

Для боевого запуска в репозитории лежат `Dockerfile`, `Caddyfile` и разбор развёртывания на Ubuntu.

## Как устроено

| Часть | Чем сделана |
| -- | -- |
| Экран | Next.js 14, React, TypeScript, Tailwind |
| Мост в Telegram | `@twa-dev/sdk` |
| Серверная часть | Node.js и Express рядом с Next |
| База | SQLite через Prisma |
| Музыка | Suno через KIE AI |
| Звук и видео | FFmpeg |
| Оплата | Telegram Stars |

Подробные разборы лежат отдельными файлами: развёртывание, интеграция с KIE AI, платежи, быстрый старт.

## Состояние

Прототип, доведённый до рабочего состояния в январе 2026 года. Генерация, пластинка и оплата работают; развитие остановлено.

---

Сделано в [PROMAREN](https://promaren.ru). Мини-приложения для Telegram и MAX под задачу бизнеса: [promaren.ru/products](https://promaren.ru/products/).
