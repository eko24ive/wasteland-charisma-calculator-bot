async function typingAction(bot, id) {
  await bot.sendAction(id, 'typing');
}

module.exports = typingAction;
