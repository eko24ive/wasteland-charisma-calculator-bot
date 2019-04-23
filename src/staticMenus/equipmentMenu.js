const {
  getArmorsByPlace,
  getHelmetsByPlace,
  getMedsByPlace,
  getWeaponsByPlace,
  getWeaponInventionsByPlace,
  getArmorInventionsByPlace,
} = require('./items/itemsFunctions.js');

const {
  merchant,
  engineer,
  workbench,
  core,
  basement,
  madman,
  wasteland,
} = require('./places.js');

const uniqueAccessoriesText = require('./items/accessories.js');

const equipmentText = `
Выберите тип вещей:
▫️ У *🏚Торгаша* вещи покупаются за крышки, дают небольшой прирост, срок службы небольшой

▫️ На *🛠Верстаке* вещи изготавливаются из материалов, дают больший прирост, срок службы дольше, вплоть до бесконечного

▫️ У *👓Инженера* вещи изготавливаются из материалов, по характеристикам выше чем на верстаке

▫️ Вещи у *👴Безумного старика* (👣8км)

▫️ Вещи в *🕎Ядре* (👣30км)

▫️ Вещи в *🚪Уютном подвальчике* (👣43км)

▫️ *🏺Аксессуары* можно получить убив некоторых мобов, либо купив у Старьёвщика во время встречи его в Пустоши

▫️ Вещи в *⚠️Подземельях* можно получить после успешного прохождения всех мобов в них

▫ ️Вещи из *⚡️ Купола Грома* (👣13км), можно получить став победителем сезона

▫ *🛰Дроны* можно найти в пустоши
`;

const vendorText = `
Выберите тип вещей у *🏚Торгаша*:
▫️ *🔫Оружие* - дает прирост к урону
▫ *🛡️Броня* - дает прирост к защите
▫ *🛡️Шлемы* - дают прирост к защите

Стоимость вещей у торгаша зависит от прокачки харизмы, указаны базовые значения
`;

const vendorWeapon = `
*⚔️ Оружие у 🏚Торгаша:*
${getWeaponsByPlace(merchant)}
-----

🔫Стрелковое оружие:
*Старая винтовка*
🕳317
*Лазерный карабин*
🕳617
*Двуствольное ружье*
🕳1027
*Радиевый карабин*
🕳5027
`;

const vendorArmor = `
*🛡️Броня у 🏚Торгаша:*
${getArmorsByPlace(merchant)}
`;

const vendorHelmets = `
*🛡️Шлемы у 🏚Торгаша:*
${getHelmetsByPlace(merchant)}
`;

const workbenchText = `
Выберите тип вещей на *🛠Верстаке*:
 ▫️*Оружие* - дает прирост к урону
 ▫️*Броня* - дает прирост к защите
 ▫️*Аптечка* - дает возможность восстановить здоровье в пустоши
 `;

const workbenchWeapon = `
*⚔️Оружие на верстаке:*
${getWeaponsByPlace(workbench)}
`;

const workbenchArmor = `
*🛡Броня на верстаке:*
${getArmorsByPlace(workbench)}
`;

const workbenchFirstAid = `
*⛑Аптечка на верстаке:*
${getMedsByPlace(workbench)}

`;

const engineerText = `
Выберите тип вещей у *👓Инженера*:
 ▫️*Оружие* - дает прирост к урону
 ▫️*Броня* - дает прирост к защите
 ▫️*Шлемы* - дают прирост к защите
 ▫️*Модули* - дают различные бонусы к характеристикам
 ▫️*Аптечка* - дает возможность восстановить здоровье в пустоши
 `;


const engineerWeapon = `
*⚔️Оружие у 👓Инженера:*
${getWeaponsByPlace(engineer)}
`;

const engineerArmor = `
*🛡Броня у 👓Инженера:*
${getArmorsByPlace(engineer)}
`;

const engineerHelmets = `
*🛡Шлемы у 👓Инженера:*
${getHelmetsByPlace(engineer)}
`;

const engineerModules = `
*📥Модули для Пип-боя*
Дают бонус если активны. Активным может быть только один, сменить эффект можно только находясь в 🏘Нью-Рино.

*📥Модули* у *👓Инженера*:

📥 *Модуль энергощита* (🛡+30)
- Фалмерский клинок (⛰Старая шахта, 11км)
- Батарейка BIOS (🚽Сточная труба, 23км)

📥 *Модуль реакции* (🤸🏽‍♂️+50)
- 🍾 Ядер-Кола (с монстров)
- 🔬 Чертеж улучшения (в Пустоши)

📥 *Модуль регенерации* (+❤️5% за каждый км, дает оверхил)
- Скума (🌁Высокий Хротгар, 45км)
- 📥 Модуль энергощита


Прочие *📥Модули*, добываемые в Пустоши:

📥 *Модуль коммегции* (Бонус: ⚖️Скидки у торговцев)
- Выпадает в 🔬Научной лаборатории, 56км

📥 *Модуль нанополя* (+🛡1.5 за каждый км)
- Выдает 👴Безумный старик на 8км. Седьмой предмет по очереди сборки.

📥 *Импульсный модуль* (+⚔️1 за каждый км)
- Уникальный модуль, иногда можно получить, активировав 🔳Гиперкуб, находясь в городе Ореол.
`;

const engineerFirstAid = `
*⛑Аптечка* у 👓Инженера. Дает возможность восстановить здоровье в пустоши:
${getMedsByPlace(engineer)}

Указаны базовые значения. Зависит от прокачки 🎗Трофеями бонуса "Первая помощь" в 📍Штабе
`;

const basementText = `
Вещи в *🚪Уютном подвальчике*, который расположен на расстоянии 👣43км от лагеря:
${getWeaponsByPlace(basement)}
`;

const madmanText = `Вещи у *👴Безумного старика*, который живет на расстоянии 👣8км от лагеря. Все вещи у него делаются по "цепочке":

1 - *Броня Безумца* — 17 проводов, 7 ед. плазмы и 9 мотков изоленты
     🛡Защита: +58

2 - *Психо(x3), Глюконавт, Ментаты, Виски* — 6 сердец трога, 7 ядерных минизарядов и 5 кусочков вольфрама

3 - *🕹Портальная пушка* — 4 ядерных минизаряда и 7 пластов меха
     🗣Харизма: +20

4 - *🎃Декоративная тыква* — 5 конфет
     ❤️Здоровье: +5

5 - *⚛️Экзокостюм* — 6 упаковок крахмала, 5 воздушных фильтров и 15 эфедрина
     🛡Защита: +68

6 - *🖲Паладиевый кардиостимулятор* — 10 транзисторов, 8 кусочков фольги, 9 потенциометров и 12 палладия
     ❤️Здоровье: +60

7 - *📥Модуль нанополя* — 9 магнитов, 15 листов подорожника, 19 проводов и 16 минизарядов
     +🛡1.5 за каждый км, пройденный от лагеря`;

const coreText = `⚔️Оружие в *🕎Ядре*, который расположен на расстоянии 👣30км от лагеря:
${getWeaponsByPlace(core)}
`;

const dungeonText = `
*⚠️Подземелья⚠️*

В игре есть уникальные локации, в которые игрок может зайти и, победив всех монстров внутри, забрать награду: это рандомный ресурс + оружие/броня + хлам. Здесь будут перечислены только предметы, без учета ресурсов.

"Врагов будет несколько и победить нужно будет всех, а возможности отступить не будет."

В игре обнаружено 12 подземелий:

*🏔 Старая шахта*, 11км
▫️ Шипастая бита +2⚔️
▫️ Мачете +11⚔️
🔹 Фалмерский клинок +8⚔️
🔺 Мото-защита +9🛡
🔺 Электромеч +9⚔️

*⚠️ Пещера Ореола*, 19км
▫️ 🔮Энергосфера +65⚔️
▫️ 🌟Армагеддец +79⚔️
▫️ ☣️Потрошитель +92⚔️
▫️ ☣️Жиробас +125⚔️
▫️ 🦇Бэткостюм+76🛡
🔹 💿DVD-VCH +187⚔️
🔹 ⚙️Шлем “Тесла” +68🛡
🔸 ♻️Рандомган +206⚔️
🔺 ✳️Galachi Lite +230🛡
🔺 🐱Ракетенок☄️🏅 +284⚔️
🔺 💥Маленький друг +372⚔️
💎 ❔❔❔❔❔ +240🛡

*🚽 Сточная труба*, 23км
Вещи не падают, только Батарейка BIOS

*⚙️ Открытое убежище*, 29км
▫️ Броня братства +15🛡
▫️ Электромеч +9⚔️
▫️ BFGzzv-4000 +20⚔️
🔹 Боевой шлем +5🛡
🔸 💥Фусронет +55⚔️

*🦇Бэт-пещера*, 34км
▫️ 🔮Энергосфера +65⚔️
▫️ 🌟Армагеддец +79⚔️
▫️ ☣️Потрошитель +92⚔️
🔹 ☣️Жиробас +125⚔️
🔸 🌟Гравипушка +159⚔️
🔺 💿DVD-VCH +187⚔️

*🦆 Перевал Уткина*, 39км
Вещи не падают, только 💌Медпак

*🌁 Высокий Хротгар*, 45км
▫️ 🛠Мультизащита +127🛡
▫️ 💿DVD-VCH +187⚔️
▫️ ♻️Рандомган +206⚔️
🔹 📯Даэдрический меч +216⚔️
🔹 💿DVD-VCH🏅 +207⚔️
🔺 🛠Мультизащита 🏅 +157🛡
💎 Рогатый шлем +115🛡

*🛑 Руины Гексагона*, 50км
Вещи не падают, только крышки и материалы

*🔬 Научная лаборатория*, 56км
▫️ 🛠Мультизащита +127🛡
▫️ 🛠Мультизащита 🏅 +157🛡
▫️ 🐱Ракетенок☄️ +266⚔️
▫️ ⚡️Тесла-меx +161🛡
🔹 ⚡️Тесла-меx🏅 +187🛡
💎 ❔❔❔❔❔ +195🛡

*⛩ Храм Мудрости*, 69км
▫️ 🐱Ракетенок☄️ +266⚔️
▫️ 🐱Ракетенок☄️🏅 +284⚔️
▫️ ❇️Плазмакастер +334⚔️
🔹 ❇️Плазмакастер🏅 +348⚔️
🔸 ❇️Плазмакастер🔆 +359⚔️
🔺 ❔❔❔❔ +195🛡

*👁‍🗨 Чёрная Меза*, 74км
▫️ 💣Судный день +300⚔️
▫️ ❇️ Плазмакастер🏅 +314⚔️
🔹 ✝️Святое пламя +356⚔️
🔸 ⚡️Тесла-мех🔆 +198🛡
🔺 ✳️Galachi Lite +230🛡
🔺 💥Маленький друг +372⚔️
💎 ❔❔❔❔❔ +1⚔️
💎 ❔❔❔❔❔ +240🛡

*🔥 Огненные недра*, 80км
▫️ 💣Судный день +300⚔️
▫️ ✝️Святое пламя +356⚔️
🔹 💥Маленький друг +372⚔️
🔸 🦈Барракуда +390⚔️
🔺 ❔❔❔❔❔ +255🛡
💎 ❔❔❔❔❔ +275🛡
💎 ❔❔❔❔❔ +610⚔️
`;

const accessoryText = `*🏺Аксессуары*, которые можно купить у *Старьёвщика*, встретив его в Пустоши:

👔*Костюм-тройка* — 🕳2500
     🗣Красноречие: +10

👟*Кеды* — 🕳3500
     🔋Выносливость: +2

👑*Ржавая корона*  — 🕳6500
     Видимого эффекта нет

-----

🏺*Аксессуары*, которые можно найти в пустоши:

👝 *Сумка под медпаки*
     Дает возможность носить с собой 3 💌Медпака

-----

🏺*Аксессуары*, которые можно получить у *👴Безумного старика*:

*🕹Портальная пушка*
     🗣Харизма: +20

*🎃Декоративная тыква*
     ❤️Здоровье: +5

*🖲Паладиевый кардиостимулятор*
     ❤️Здоровье: +60

-----

${uniqueAccessoriesText}`;

const inventionsText = `
Улучшить оружие и броню можно в *⛺️Лагере* на *🛠Верстаке*.

В списке приводится список самой ходовой экипировки.

Имейте ввиду, что цифры после улучшения приведены для базовых характеристик (т.е. до передачи другим игрокам):`;

const inventionsWeapon = `
Улучшение *Оружия*
*ВЕРСТАК:*
${getWeaponInventionsByPlace(workbench)}
*ИНЖЕНЕР:*
${getWeaponInventionsByPlace(engineer)}
*ЯДРО:*
${getWeaponInventionsByPlace(core)}
`;

const inventionsArmor = `
Улучшение *Брони*
*ВЕРСТАК:*
${getArmorInventionsByPlace(workbench)}
*ИНЖЕНЕР:*
${getArmorInventionsByPlace(engineer)}
*БЕЗУМНЫЙ СТАРИК:*
${getArmorInventionsByPlace(madman)}
`;

/* const dronesText = `
🛰Барахло ⚙️Универсальный
⚔️10 🛡50/50 ⚡️6%

🛰Малыш ⚙️Универсальный
⚔️18 🛡80/80 ⚡️10%

🛰Дефолт ⚙️Универсальный
⚔️28 🛡120/120 ⚡️12%

🛰Шерлокдрон ⚙️Универсальный
⚔️12 🛡130/130 ⚡️3%
Имеет модуль Радар, позволяющий получать больше ресурсов.
---------------------------------------
🛰Robot Rock 🔫Боевой
⚔️46 🛡150/150 ⚡️14%

🛰Рад-дрон 🔫Боевой
⚔️68 🛡180/180 ⚡️14%
---------------------------------------
🛰Протекдрон 🛡Обороняющий
⚔️14 🛡270/270 ⚡️14%

🛰AWESOM-O 🛡Обороняющий
⚔️23 🛡420/420 ⚡️16%
---------------------------------------
По статам:
⚔️ - урон дрона
🛡- прочность, уменьшается при попадание монстров по дрону.
⚡️- шанс вступить в бой.
`; */

const domOfThunderText = `
*⚡️Купол Грома*

Этот переходящий трофей можно получить на время, став победилем сезона в Куполе. Сезон закрывается каждую неделю.

▫️ 👑 Шлем мастера (199🛡)

Удачи, и да смилуеться над вами *Господь (🚬🏆Вышка)*
`;

const wastelandText = `
*👣Пустошь*

Эти вещи рандомно выпадают в только в пустоши, купить или скрафтить их нельзя
${getWeaponsByPlace(wasteland)}
${getHelmetsByPlace(wasteland)}
`;

const equipmentMenu = {
  config: {
    parseMode: 'markdown',
  },
  name: 'equipment',
  title: 'Экиперовка',
  text: equipmentText,
  content: [{
    name: 'vendor',
    title: '🏚Торгаш',
    text: vendorText,
    content: [{
      name: 'vendor_weapon',
      title: '🔫Оружие',
      text: vendorWeapon,
    },
    {
      name: 'vendor_armor',
      title: '🛡️Броня',
      text: vendorArmor,
    },
    {
      name: 'vendor_helmets',
      title: '🛡️️Шлемы',
      text: vendorHelmets,
    },
    {
      title: 'Назад',
      name: 'equipment',
    },
    ],
  },
  {
    name: 'workbench',
    title: '🛠Верстак',
    text: workbenchText,
    content: [{
      name: 'workbench_weapon',
      title: '🔫Оружие',
      text: workbenchWeapon,
    },
    {
      name: 'workbench_armor',
      title: '🛡️Броня',
      text: workbenchArmor,
    },
    {
      name: 'workbench_firstAid',
      title: '⛑️Аптечка',
      text: workbenchFirstAid,
    },
    {
      title: 'Назад',
      name: 'equipment',
    },
    ],
  },
  {
    name: 'engineer',
    title: '👓Инженер',
    text: engineerText,
    content: [{
      name: 'engineer_weapon',
      title: '🔫Оружие',
      text: engineerWeapon,
    },
    {
      name: 'engineer_armor',
      title: '🛡️Броня',
      text: engineerArmor,
    },
    {
      name: 'engineer_helmets',
      title: '️🛡️Шлемы',
      text: engineerHelmets,
    },
    {
      name: 'engineer_modules',
      title: '📥️Модули',
      text: engineerModules,
    },
    {
      name: 'engineer_firstAid',
      title: '⛑️Аптечка',
      text: engineerFirstAid,
    },
    {
      title: 'Назад',
      name: 'equipment',
    },
    ],
  },
  {
    name: 'basement',
    title: '🚪Уютный подвальчик',
    text: basementText,
    content: [{
      title: 'Назад',
      name: 'equipment',
    }],
  },
  {
    name: 'madman',
    title: '👴Безумный старик',
    text: madmanText,
    content: [{
      title: 'Назад',
      name: 'equipment',
    }],
  },
  {
    name: 'core',
    title: '🕎Ядро',
    text: coreText,
    content: [{
      title: 'Назад',
      name: 'equipment',
    }],
  },
  {
    name: 'dungeons',
    title: '⚠️Подземелья',
    text: dungeonText,
    content: [{
      title: 'Назад',
      name: 'equipment',
    }],
  },
  {
    name: 'accessory',
    title: '🏺Аксессуары',
    text: accessoryText,
    content: [{
      title: 'Назад',
      name: 'equipment',
    }],
  },
  {
    name: 'inventions',
    title: '🔆Улучшения',
    text: inventionsText,
    content: [{
      name: 'inventions_weapon',
      title: '🔫Оружие',
      text: inventionsWeapon,
    },
    {
      name: 'inventions_armor',
      title: '🛡️Броня',
      text: inventionsArmor,
      content: [],
    },
    {
      title: 'Назад',
      name: 'equipment',
    },
    ],
  },
  {
    name: 'domeOfThunder',
    title: '⚡️Купол Грома',
    text: domOfThunderText,
    content: [{
      title: 'Назад',
      name: 'equipment',
    }],
  },
  {
    name: 'wasteland',
    title: '👣Пустошь',
    text: wastelandText,
    content: [{
      title: 'Назад',
      name: 'equipment',
    }],
  },
  ],
};

module.exports = equipmentMenu;
