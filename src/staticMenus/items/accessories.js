const _ = require('underscore');

const header = '*Уникальные 🏺Аксессуары*, которые можно получить за заслуги в игре, видимых эффектов не дают:';
const accessories = [
  {
    icon: '🎸',
    title: 'Радиоактивная гитара',
    comment: false,
  }, {
    icon: '👓',
    title: 'Очки без линз',
    comment: false,
  }, {
    icon: '🎧',
    title: 'Китайские Beats',
    comment: false,
  }, {
    icon: '👓',
    title: 'Очки Кларка К.',
    comment: false,
  }, {
    icon: '📃',
    title: 'Сертификат долбаеба',
    comment: false,
  }, {
    icon: '💠',
    title: 'Немного кристаллов',
    comment: false,
  }, {
    icon: '🐞',
    title: 'Божья коровка',
    comment: false,
  }, {
    icon: '🗳',
    title: 'Коробка с Мисиксами',
    comment: false,
  }, {
    icon: '🍫',
    title: 'Шоколадка без фольги',
    comment: false,
  }, {
    icon: '🎂',
    title: 'Торт - это ложь',
    comment: false,
  }, {
    icon: '🦆',
    title: 'Просто утка',
    comment: false,
  }, {
    icon: '⭕️',
    title: 'Покебол',
    comment: false,
  }, {
    icon: '🍷',
    title: 'Винишко из мутафруктов',
    comment: false,
  }, {
    icon: '🎟',
    title: 'Талончик на нихуя',
    comment: false,
  }, {
    icon: '🚀',
    title: 'Межпланетный экспресс',
    comment: false,
  }, {
    icon: '🍀',
    title: 'Клевер-мутант',
    comment: false,
  }, {
    icon: '💧',
    title: 'Слеза котосвина',
    comment: false,
  }, {
    icon: '🌐',
    title: 'ShitCoin',
    comment: false,
  }, {
    icon: '⚖️',
    title: 'Право на бунд',
    comment: false,
  }, {
    icon: '🐼',
    title: 'Карманная панда',
    comment: false,
  }, {
    icon: '🖋',
    title: 'Перо Ванаминго',
    comment: 'выдано в единичном экземпляре лучшему охотнику на Ванаминго',
  }, {
    icon: '🍄',
    title: 'Вдохновение стартапов',
    comment: false,
  }, {
    icon: '🥄',
    title: 'There is no spoon',
    comment: false,
  }, {
    icon: '👂',
    title: 'Качественное ухо',
    comment: false,
  }, {
    icon: '🌝',
    title: 'Лицо альбиноса',
    comment: false,
  }, {
    icon: '📖',
    title: 'ММОРПГ для чайников',
    comment: false,
  }, {
    icon: '👻',
    title: 'Каспер, мертвый подросток',
    comment: false,
  }, {
    icon: '🥔',
    title: 'Картоху сам выкопал',
    comment: false,
  }, {
    icon: '🦄',
    title: 'Единорог поневоле',
    comment: false,
  }, {
    icon: '📖',
    title: 'Делаем баг фичей. Том 3.',
    comment: false,
  }, {
    icon: '📖',
    title: 'Баланс - это легко!',
    comment: false,
  }, {
    icon: '🕳',
    title: 'Это дыра, а не крышка',
    comment: false,
  }, {
    icon: '📞',
    title: 'Номер бывшей',
    comment: false,
  }, {
    icon: '🐁',
    title: 'Вот и Брейн',
    comment: false,
  }, {
    icon: '♿️',
    title: 'Обруч в заднице',
    comment: false,
  }, {
    icon: '🏐',
    title: 'Уилсон',
    comment: false,
  }, {
    icon: '👢',
    title: 'Болотные сапоги',
    comment: 'личный аксессуар @vulfrick',
  }, {
    icon: '💍',
    title: 'Перстень VIP клуба',
    comment: 'за участие в бэта-тестировании @WastelandWarsBot',
  }, {
    icon: '💈',
    title: 'Псевдопупс',
    comment: false,
  }, {
    icon: '👑',
    title: 'Потускневшая корона',
    comment: false,
  }, {
    icon: '🍾',
    title: 'Сувенир из РОВД',
    comment: false,
  }, {
    icon: '🎈',
    title: 'Веселящий газ',
    comment: false,
  }, {
    icon: '🖕',
    title: 'Хуй на воротник',
    comment: false,
  }, {
    icon: '📙',
    title: 'Выгодный свиток Гольдмана',
    comment: 'личный аксессуар',
  }, {
    icon: '👻',
    title: 'Друг детства',
    comment: 'выдано в единичном экземпляре лучшему искателю кукол',
  }, {
    icon: '🎖',
    title: 'Лидер 1-го сезона',
    comment: 'выдано смотрителям убежищ 1-го сезона',
  }, {
    icon: '🏋️‍♀️',
    title: 'Карликовый атлет',
    comment: false,
  }, {
    icon: '💩',
    title: 'Выбрось бяку',
    comment: false,
  }, {
    icon: '🔦',
    title: 'Фонарик',
    comment: false,
  },
];

const uniqueAccessories = _.sortBy(accessories, accessory => accessory.title).map(({
  icon,
  title,
  comment,
}) => `${icon} *${title}* ${comment ? `(${comment})` : ''}`).join('\n');

const uniqueAccessoriesText = `${header}

${uniqueAccessories}`;

module.exports = uniqueAccessoriesText;
