# Wasteland Wars Assistant

This project contains source files for telegram bot called [@WastelandWarsAssistantBot](https://t.me/WastelandWarsAssistantBot) "Assistant"

### Prerequisites
MongoDB should be installed at your machine

### Setting up the project
1. Ensure you have the latest NodeJS and NPM installed
2. Clone this repo
3. Install Cairo dependencies ([instruction](https://github.com/Automattic/node-canvas#compiling))
4. After successfull instalment of Cairo dependencies run `yarn`

### Running the project
1. Create `.env` file at the root level of the project
2. Populate it with following text:
```
BOT_TOKEN=<YOUR_BOT_TOKEN>
MONGODB_URI=<YOUR_MONGO_DB_ADDRESS>
ENV=LOCAL
VERSION=<CURRENT_WW_VERSION>
DATA_THRESHOLD=<ACCEPTABLE_AMOUNT_OF_DATA_OF_CURRENT_VERSION>
```
3. Visit [@botfater](https://t.me/botfather/) and generate yourself a bot token
4. Replace `<YOUR_BOT_TOKEN>` with just generated token
5. Replace `<YOUR_MONGO_DB_ADDRESS>` with your MongoDB address (probably its mongodb://localhost/wwa)

6. Run the project using `node ./index -D` command

If wan't to run bot with webhook, change `ENV` to `PRODUCTION` and add `PORT` and `BOT_WEBHOOK_URL` variables with correspodning values.

### Debugging
It is possible to debug this solution using VSCode debug tools. After you put your breakpoints run the debug mode using `Dev` configuration.
