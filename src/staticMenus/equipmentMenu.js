const {
  getArmorsByPlace,
  getHelmetsByPlace,
  getMedsByPlace,
  getWeaponsByPlace
} = require('./items/itemsFunctions.js');

const {
    merchant,
    engineer,
    workbench,
    core,
    basement
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
`;

const vendorWeapon = `
*⚔️ Оружие у 🏚Торгаша:*

${getWeaponsByPlace(merchant)}
-----

🔫Стрелковое оружие:
*Старая винтовка*
*Лазерный карабин*
*Двуствольное ружье*
*Радиевый карабин*
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

Все оружие, начиная с *💥BFGzzv-4000* не ломается от времени и может использоваться вечно
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
- Уникальный модуль, можно было получить при активации 🔳Гиперкуба.
`;

const engineerFirstAid = `
*⛑Аптечка* у 👓Инженера. Дает возможность восстановить здоровье в пустоши:

${getMedsByPlace(engineer)}
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

В игре есть уникальные локации, в которые игрок может зайти и, победив всех монстров внутри, забрать награду: это рандомный ресурс + оружие + хлам. Здесь будет написаны только уникальные награды, без учета ресурсов.

"Врагов будет несколько и победить нужно будет всех, а возможности отступить не будет."

В игре обнаружено 9 подземелий:

*🏔 Старая шахта*, 11км
Награда: Фалмерский клинок ⚔️+8

*⚠️ Пещера Ореола*, 19км
Награда: Рандомная экипировка + 💈Пупсы

*🚽 Сточная труба*, 23км
Награда: Батарейка BIOS

*⚙️ Открытое убежище*, 29км
Награда: 💥Фусронет ⚔️+55

*🦇Бэт-пещера*, 34км
Награда: ☣️Потрошитель  ⚔️+92

*🦆 Перевал Уткина*, 39км
Награда: 💌Медпак

*🌁 Высокий Хротгар*, 45км
Награда: 📯Даэдрический меч ⚔️+216, 🍸Скума

*🛑 Руины Гексагона*, 50км
Награда: 💠Алмазная броня (+149🛡) или Ⓜ️Модульная броня (+149🛡)

*🔬 Научная лаборатория*, 56км
Награда: ⚡️Тесла-мех🏅(+187🛡),  📥Модуль коммегции (\`Бонус: ⚖️Скидки у торговцев\`)

*⛩ Храм Мудрости*, 69км
Награда: +30 🤸🏽‍♂️Ловкости, ❇️Плазмакастер🏅(314⚔️)

*👁‍🗨 Чёрная Меза*, 74км
Награда: ❇️Плазмакастер🔆(329⚔️), 💪Сила +40, ❤️Живучесть +30

*🔥 Огненные недра*, 80км
Награда: Барракуда(360⚔️), 🗣Харизма +40, 🤸‍♀️Ловкость +30
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

▫️*Электромеч* (9⚔️)
🏅 (15⚔️) - Провода(7);
🔆 (21⚔️) - Провода(17);

▫️*Лазерный тесак* (12⚔️)
🏅 (20⚔️) - Минизаряд(7);  Провода(5);
🔆 (28⚔️) - Минизаряд(17);  Провода(15);

▫️*BFGzzv-4000* (20⚔️)
🏅 (29⚔️) - Транзистор(5);  Изолента(6);
🔆 (??⚔️) - ???

▫️*Силовой кастет* (25⚔️)
🏅 (25⚔️) - Минизаряд(4);  Изолента(6);  Топаз(5);  
🔆 (32⚔️) - Минизаряд(14);  Изолента(16);  Топаз(15);

▫️*💥Колыбель Пустоши* (29⚔️)
🏅 (29⚔️)- Транзистор(9);  Что-то чугунное(10);
🔆 (??⚔️) - ???

▫️*💥Tyrant-PDR* (38⚔️)
🏅 (46⚔️) - Вольфрам(9);  Тряпка(12);
🔆 (51⚔️) - Вольфрам(19);  Тряпка(22);

▫️☄️*Огнемёд* (49⚔️)
🏅 (58⚔️) - Фольга!(2);  Сердце трога(11);  Потенциометр(3);  Сталь(4);
🔆 (65⚔️) - Фольга!(12);  Сердце трога(21);  Потенциометр(13);  Сталь(14);

▫️*☄️Больверизатор* (56⚔️)
🏅 (69⚔️) - Фольга!(3);  Изолента(12);  Провода(15);
🔆 (76⚔️) - Фольга!(19);  Изолента(28);  Провода(25);  

▫️*🔮Энергосфера* (65⚔️)
🏅 (78⚔️) - Сердце трога(20);  Детская кукла(3);
🔆 (??⚔️) - ???

▫️*🌟Армагеддец* (79⚔️)
🏅 (90⚔️) - Что-то чугунное(9);  Изолента(25);  Провода(30);
🔆 (??⚔️) - ???

*ИНЖЕНЕР:*

▫️*☣️Потрошитель* (92⚔️)
🏅 (122⚔️) - Минизаряд(11);  Потенциометр(14);  Сталь(5);
🔆 (141⚔️) - Минизаряд(23);  Потенциометр(24);  Сталь(15);

▫️*☣️Жиробас* (125⚔️)
🏅 (155⚔️) - Минизаряд(10);  Плазма(8);  Изолента(4);
🔆 (163⚔️) - Минизаряд(23);  Плазма(21);  Изолента(24);

▫️*🌟Гравипушка* (159⚔️)
🏅 (189⚔️) - Фольга!(2);  Сердце трога(11);  Потенциометр(6);  Сталь(7);
🔆 (194⚔️) - Фольга!(12);  Сердце трога(21);  Потенциометр(26);  Сталь(17);

▫️*💿DVD-VCH* (187⚔️)
🏅 (207⚔️) - Тряпка(30);
🔆 (???⚔️) - Тряпка(50);

▫️*♻️Рандомган* (206⚔️)
🏅 (231⚔️) Фольга!(3);  Вольфрам(13);  Изолента(12);  Провода(15);
🔆 (242⚔️) Фольга!(13);  Вольфрам(19);  Изолента(32);  Провода(25);

▫️*🐱Ракетенок☄️* (266⚔️)
🏅 (284⚔️) - Фольга!(12);  Плазма(14);  Сердце трога(21);  Потенциометр(21);  Сталь(24);
🔆 (298⚔️) - Фольга!(32);  Плазма(44);  Сердце трога(31);  Потенциометр(31);  Сталь(44);

*ЯДРО:*

 ▫️*❇️Плазмакастер* (291⚔️)
🏅 (314⚔️) - Фольга!(23);  Изолента(22);  Провода(25);
🔆 (329⚔️) - Фольга!(43);  Изолента(49);  Провода(55);`;

const inventionsArmor = `
Улучшение *Брони*

▫️*⚙️Броня Безумца* (58🛡)
🏅 (75🛡) - Фольга!(2);  Сердце трога(11);  Потенциометр(3);  Сталь(4);
🔆 (??🛡) - Фольга!(12);  Сердце трога(21);  Потенциометр(13);  Сталь(14);

▫️*Броня Геенна* (66🛡)
🏅 (87🛡) - Вольфрам(9);  Тряпка(12);
🔆 (96🛡) - Вольфрам(19);  Тряпка(22);

▫️*⚛️Экзокостюм* (68🛡)
🏅 (89🛡) - Минизаряд(4);  Изолента(6);  Топаз(5);
🔆 (95🛡) - Минизаряд(14);  Изолента(16);  Топаз(15);

▫️*🦇Бэткостюм* (76🛡)
🏅 (95🛡) - Фольга!(3);  Изолента(12);  Провода(15);
🔆 (103🛡) - ???

▫️*⚛️Нановолокно* (89🛡)
🏅 (113🛡) - Фольга!(3);  Вольфрам(13);  Изолента(12);  Провода(16);
🔆 (126🛡) - ???

▫️*🛠Мультизащита* (127🛡)
🏅 (157🛡) - Фольга!(12);  Плазма(14);  Сердце трога(11);  Потенциометр(23);  Сталь(24);
🔆 (???🛡) - Фольга!(32);  Плазма(29);  Сердце трога(21);  Потенциометр(33);  Сталь(39);

▫️*⚡️Тесла-мех* (161🛡)
🏅 (187🛡) - Минизаряд(31);  Батарейка BIOS(4);  Магнит(5);  Подорожник(16);
🔆 (198🛡) - Минизаряд(46);  Батарейка BIOS(15);  Магнит(35);  Подорожник(36);`;

const dronesText = `
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
`;

const domOfThunderText = `
*⚡️Купол Грома*

Этот переходящий трофей можно получить на время, став победилем сезона в Куполе. Сезон закрывается каждую неделю. 

▫️ 👑 Шлем мастера (199🛡)

Удачи, и да смилуеться над вами *Господь (🚬🏆Вышка)*
`;

const equipmentMenu = {
  config: {
    parseMode: 'markdown'
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
          text: vendorWeapon
        },
        {
          name: 'vendor_armor',
          title: '🛡️Броня',
          text: vendorArmor
        },
        {
          name: 'vendor_helmets',
          title: '🛡️️Шлемы',
          text: vendorHelmets
        },
        {
          title: 'Назад',
          name: 'equipment'
        }
      ]
    },
    {
      name: 'workbench',
      title: '🛠Верстак',
      text: workbenchText,
      content: [{
          name: 'workbench_weapon',
          title: '🔫Оружие',
          text: workbenchWeapon
        },
        {
          name: 'workbench_armor',
          title: '🛡️Броня',
          text: workbenchArmor
        },
        {
          name: 'workbench_firstAid',
          title: '⛑️Аптечка',
          text: workbenchFirstAid
        },
        {
          title: 'Назад',
          name: 'equipment'
        }
      ]
    },
    {
      name: 'engineer',
      title: '👓Инженер',
      text: engineerText,
      content: [{
          name: 'engineer_weapon',
          title: '🔫Оружие',
          text: engineerWeapon
        },
        {
          name: 'engineer_armor',
          title: '🛡️Броня',
          text: engineerArmor
        },
        {
          name: 'engineer_helmets',
          title: '️🛡️Шлемы',
          text: engineerHelmets
        },
        {
          name: 'engineer_modules',
          title: '📥️Модули',
          text: engineerModules
        },
        {
          name: 'engineer_firstAid',
          title: '⛑️Аптечка',
          text: engineerFirstAid
        },
        {
          title: 'Назад',
          name: 'equipment'
        }
      ]
    },
    {
      name: 'basement',
      title: '🚪Уютный подвальчик',
      text: basementText,
      content: [{
        title: 'Назад',
        name: 'equipment'
      }]
    },
    {
      name: 'madman',
      title: '👴Безумный старик',
      text: madmanText,
      content: [{
        title: 'Назад',
        name: 'equipment'
      }]
    },
    {
      name: 'core',
      title: '🕎Ядро',
      text: coreText,
      content: [{
        title: 'Назад',
        name: 'equipment'
      }]
    },
    {
      name: 'dungeons',
      title: '⚠️Подземелья',
      text: dungeonText,
      content: [{
        title: 'Назад',
        name: 'equipment'
      }]
    },
    {
      name: 'accessory',
      title: '🏺Аксессуары',
      text: accessoryText,
      content: [{
        title: 'Назад',
        name: 'equipment'
      }]
    },
    {
      name: 'inventions',
      title: '🔆Изобретения',
      text: inventionsText,
      content: [{
          name: 'inventions_weapon',
          title: '🔫Оружие',
          text: inventionsWeapon
        },
        {
          name: 'inventions_armor',
          title: '🛡️Броня',
          text: inventionsArmor,
          content: []
        },
        {
          title: 'Назад',
          name: 'equipment'
        }
      ]
    },
    {
      name: 'drones',
      title: '🛰Дроны',
      text: dronesText,
      content: [{
        title: 'Назад',
        name: 'equipment'
      }]
    },
    {
      name: 'domeOfThunder',
      title: '⚡️Купол Грома',
      text: domOfThunderText,
      content: [{
        title: 'Назад',
        name: 'equipment'
      }]
    }
  ]
};

module.exports = equipmentMenu;
