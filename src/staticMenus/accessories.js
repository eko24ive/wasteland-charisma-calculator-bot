const Description = "*Уникальные 🏺Аксессуары*, которые можно получить за заслуги в игре, видимых эффектов не дают:"
const accs = [
  {
  icon: "🎸",
  title: "Радиоактивная гитара",
  },{
  icon: "👓",
  title: "Очки без линз",
  },{
  icon: "🎧",
  title: "Китайские Beats",
  },{
  icon: "👓",
  title: "Очки Кларка К.",
  },{
  icon: "📃",
  title: "Сертификат долбаеба",
  },{
  icon: "💠",
  title: "Немного кристаллов",
  },{
  icon: "🐞",
  title:"Божья коровка",
  },{
  icon: "🗳",
  title: "Коробка с Мисиксами",
  },{
  icon: "🔦",
  title: "Фонарик",
  },{
  icon: "🍫",
  title: "Шоколадка без фольги",
  },{
  icon: "🎂",
  title: "Торт - это ложь",
  },{
  icon: "🦆",
  title: "Просто утка",
  },{
  icon: "⭕️",
  title: "Покебол",
  },{
  icon: "🍷",
  title: "Винишко из мутафруктов",
  },{
  icon: "🎟",
  title: "Талончик на нихуя",
  },{
  icon: "🚀",
  title: "Межпланетный экспресс",
  },{
  icon: "🍀",
  title: "Клевер-мутант",
  },{
  icon: "💧",
  title: "Слеза котосвина",
  },{
  icon: "🌐",
  title: "ShitCoin",
  },{
  icon: "⚖️",
  title: "Право на бунд",
  },{
  icon: "🐼",
  title: "Карманная панда",
  },{
  icon: "🖋",
  title: "Перо Ванаминго",
  comment: "Выдано в единичном экземпляре лучшему охотнику на Ванаминго",
  },{
  icon: "🍄",
  title: "Вдохновение стартапов",
  },{
  icon: "🥄",
  title: "There is no spoon",
  },{
  icon: "👂",
  title: "Качественное ухо",
  },{
  icon: "🌝",
  title: "Лицо альбиноса",
  },{
  icon: "📖",
  title: "ММОРПГ для чайников",
  },{
  icon: "👻",
  title: "Каспер, мертвый подросток",
  }
]

accs.sort(function (a, b) {
  if (a.title > b.title) {
    return 1;
  }
  if (a.title < b.title) {
    return -1;
  }
  return 0;
});

var unic = Description + "</br>";
accs.forEach(function(element) {
  unic += element.icon + element.title + '</br>';
});
