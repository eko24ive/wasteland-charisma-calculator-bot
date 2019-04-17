const descriptions = [
  {
    label: '🏃СкинутьЛог',
    description: 'Запуск режима "ЛОГ". В этом режиме ты можешь переслать сюда сообщения от игрового бота. Также этот режим ты можешь запустить если отправишь боту комманду <b>/go</b>',
  },
  {
    label: '🎓Скилокчтр',
    description: 'Запуск «<b>Скилокачатора</b>» - анализатора в прокачке твоих скилов',
  },
  {
    label: '📔Энциклпдия',
    description: 'Полезная информация о мире пустоши, и что в нём можно сделать/получить',
  },
  {
    label: '⚙️Настройки',
    description: 'Кастомизация отображения информации',
  },
  {
    label: '💀Мобы',
    description: 'Информация об <b>обычных</b> мобах',
  },
  {
    label: '🚷Мобы ТЗ',
    description: 'Информация о мобах из <b>Тёмной Зоны</b>',
  },
  {
    label: '📯Мобы',
    description: 'Информация о мобах из <b>подземельей</b>',
  },
  {
    label: '🦂Гиганты',
    description: 'Состояние гигантов',
  },
  {
    label: '🏆Зал Славы',
    description: 'Благодарности всем тем кто когда-либо оказалась поддержку в работе над ботом',
  },
  {
    label: '⚙️Настройки',
    description: 'Персонализация отображения информации в Ассистенте',
  },
  {
    label: '💬Помощь',
    description: 'Ну ты сам понял',
  },
  {
    label: '🏜Все локации',
    description: 'Список всех игровых локаций',
  },
  {
    label: '🤘Рейдовые локации',
    description: 'Список всех рейдовых локаций',
  },
  {
    label: '📯Входы в подземелья',
    description: 'Список локаций, где можно войти в подземелье',
  },
  {
    label: '🎒Экипировка',
    description: 'Информация о всех предметах пустоши - где их найти, стоимость и характеристики',
  },
  {
    label: '🗃Припасы',
    description: 'Еда и баффы что встречаются в Пустоши',
  },
  {
    label: '✅Достижения',
    description: 'Ачивки и вот это вот всё',
  },
  {
    label: '🛰Дроны',
    description: 'Информация о единственных спутниках в игре',
  },
  {
    label: '⚠️Подземелья',
    description: 'Данные о минимальных статах для прохода подземелья, также список наград',
  },
  {
    label: '🔄Команды при лагах',
    description: 'Полезные комманды на случай если игровой бот будет зависать',
  },
  {
    label: '📈 Прогресс',
    description: 'График, на котором отображаеться прогресс твоей прокачки за последние 10 пип-боев',
  },
  {
    label: '📊 Статистика',
    description: 'Информация о твоих форвардах, что обработал асистент',
  },
];


const getButtonDescriptions = (buttons, menu) => {
  const buttonsFilter = menu === 'start' ? 'true' : 'false';

  const filteredButtons = buttons.filter(({ state }) => state === buttonsFilter)
    .map(({ label }) => descriptions.find(description => description.label === label))
    .map((description) => {
      if (description) {
        return `<code>[${description.label}]</code> - ${description.description}`;
      }

      return null;
    })
    .filter(description => description !== null)
    .join('\n\n');

  return filteredButtons;
};

module.exports = getButtonDescriptions;
