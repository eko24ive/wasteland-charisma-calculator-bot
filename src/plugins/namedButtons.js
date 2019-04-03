module.exports = {
  id: 'namedButtons',
  defaultConfig: {
    buttons: {},
  },

  plugin(bot, pluginConfig) {
    const buttons = pluginConfig.buttons || {};

    bot.on('text', (msg, props) => {
      const { text } = msg;
      Object.keys(buttons).forEach((key) => {
        const {
          label,
          command,
          contains,
          icon,
        } = buttons[key];

        if (label === text || icon === text || text.indexOf(contains) !== -1) {
          return bot.event(command, msg, props);
        }

        return null;
      });
    });
  },
};
