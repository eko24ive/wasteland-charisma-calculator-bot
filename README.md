# Wasteland Wars Assistant
Looking for english readme? It's here [README-en.md](https://github.com/eko24ive/wasteland-wars-assistant-bot/blob/master/README_en.md)
Этот проект содержит исходники для телеграм-бота [@WastelandWarsAssistantBot](https://t.me/WastelandWarsAssistantBot) "Ассистент"

### Prerequisites
MongoDB должна быть установленна на вашей машине

### Setting up the project
1. Убедитесь что у вас установленна последня версия NodeJS и Yarn
2. Склонируйте этот репозиторий
3. Установите Cairo ([instruction](https://github.com/Automattic/node-canvas#compiling))
4. Выполните команду `yarn`

### Running the project
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

### Debugging
Данный проект поддерживает возможность отладки через VSCode. Воспользуйтесь конфигурацией `Dev`.
