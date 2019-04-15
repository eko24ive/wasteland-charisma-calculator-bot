# Wasteland Wars Assistant[![Build Status](https://travis-ci.com/eko24ive/wasteland-wars-assistant-bot.svg?branch=master)](https://travis-ci.com/eko24ive/wasteland-wars-assistant-bot)
Looking for english readme? It's here [README-en.md](https://github.com/eko24ive/wasteland-wars-assistant-bot/blob/master/README_en.md)

Этот проект содержит исходники для телеграм-бота [@WastelandWarsAssistantBot](https://t.me/WastelandWarsAssistantBot) "Ассистент"

### Требования к системе
MongoDB должна быть установленна на вашей машине

### Установка проекта
1. Убедитесь что у вас установленна последня версия NodeJS и Yarn
2. Склонируйте этот репозиторий
3. Установите Cairo ([гайд](https://github.com/Automattic/node-canvas#compiling))
4. Выполните команду `yarn`

### Запуск проекта
1. Создатей `.env` файл в корневой папке проекта
2. Скопируйте в неё следующий текст:
```
BOT_TOKEN=<ТОКЕН ВАШЕГО БОТА>
MONGODB_URI=<АДРЕС К ВАШЕЙ MONGO БАЗЕ>
ENV=LOCAL
VERSION=<ТЕКУЩАЯ ВЕРСИЯ WW>
DATA_THRESHOLD=<ПРИЕМЛИМОЕ КОЛИЧЕСТВО ДАННЫХ ТЕКУЩЕЙ ВЕРСИИ>
```
3. Напишите [@botfater](https://t.me/botfather/) и создайте токен для вашего бота
4. Замените `<ТОКЕН ВАШЕГО БОТА>` на только что сгенерированный токен
5. Замените `<АДРЕС К ВАШЕЙ MONGO БАЗЕ>` на адресс к вашей MongoDB (обычно это mongodb://localhost/wwa)

6. Запустите проект используя комманду `node ./index -D`

Если вы хотите запустить бота в режиме WebHook, замените значение `ENV` на `PRODUCTION` также добавьте переменные `PORT` и `BOT_WEBHOOK_URL` с соотвествующими значениями.

### Отладка
Данный проект поддерживает возможность отладки через VSCode. Воспользуйтесь конфигурацией `Dev`.

### Куда задавать вопросы
Присойденяйтесь в уютный чат [@wwAssistantChat](https://t.me/wwAssistantChat)
