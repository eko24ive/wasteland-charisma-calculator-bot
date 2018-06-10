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

*Бейсбольная бита* (🕳30)
     💪Урон: +1

*Ржавый нож* (🕳30)
     💪Урон: +3

*Разводной ключ* (🕳30)
     💪Урон: +5

*Топор* (🕳30)
     💪Урон: +7

*Кинжал* (🕳30)
     💪Урон: +9

*Мачете* (🕳30)
     💪Урон: +11

*Хлыст* (🕳30)
     💪Урон: +13

*Стальная бита* (🕳30)
     💪Урон: +16

-----

🔫Стрелковое оружие:
*Старая винтовка*
*Лазерный карабин*
*Двуствольное ружье*
*Радиевый карабин*
`;

const vendorArmor = `
*🛡️Броня у 🏚Торгаша:*

*Плотная куртка* (🕳30)
  🛡Защита: +1

*Комбинезон убежища* (🕳30)
  🛡Защита: +3

*Комбинезон убежища* (🕳30)
  🛡Защита: +3

*Кожанный нагрудник* (🕳30)
  🛡Защита: +6

*Мото-защита* (🕳30)
  🛡Защита: +9

*Легкий кевлар* (🕳30)
  🛡Защита: +10

*Крепкий кевлар* (🕳30)
  🛡Защита: +10

*Броня братства* (🕳30)
  🛡Защита: +15

*Боевая броня* (🕳680)
  🛡Защита: +25

*Броня Когтей* (🕳1580)
  🛡Защита: +32
`;

const vendorHelmets = `
*🛡️Шлемы у 🏚Торгаша:*

*Вязаная шапка* (🕳30)
  🛡Защита: +1

*Ушанка* (🕳30)
  🛡Защита: +1

*Боевой шлем* (🕳30)
  🛡Защита: +5

*Деловая шляпа* (🕳480)
  🛡Защита: +1

*Берет* (🕳40)
  🛡Защита: +1

*Колпак повара* (🕳880)
  🛡Защита: +1

*Шляпа минитмена* (🕳980)
  🛡Защита: +15

*Противогаз* (🕳1620)
  🛡Защита: +15

*Плотный капюшон* (🕳1510)
  🛡Защита: +9
`;

const workbenchText = `
Выберите тип вещей на *🛠Верстаке*:
 ▫️*Оружие* - дает прирост к урону
 ▫️*Броня* - дает прирост к защите
 ▫️*Аптечка* - дает возможность восстановить здоровье в пустоши
 `;

const workbenchWeapon = `
*⚔️Оружие на верстаке:*

*⚡️Прочная бита* — 📦200
     💪Урон: +2

*⚡️Копье* — 📦600
     💪Урон: +4

*⚡️Кистень* — 📦1300
     💪Урон: +6

*⚡️Электромеч* — 📦3900
     💪Урон: +9

*💥Лазерный тесак* — 📦5600, 🔹4
     💪Урон: +12

*💥BFGzzv-4000* — 📦12000, 🔹30
     💪Урон: +20

*🔗Силовой кастет* — 📦14000, 🔹20, 💡5
     💪Урон: +25

*💥Колыбель Пустоши* — 📦19990, 🔹35, 💡5
     💪Урон: +29

*💥Tyrant-PDR* — 📦29990, 🔹60, 💡25
     💪Урон: +38

*☄️Огнемёд* — 📦45900, 🔹90, 💡75, 💾5
     💪Урон: +49

*☄️Больверизатор* — 📦59990, 🔹100, 💡90, 💾45
     💪Урон: +56

*🔮Энергосфера* — 📦78990, 💡120, 💾60, 🔩20
     💪Урон: +65

*🌟Армагеддец* — 📦129990, 💡150, 💾70, 🔩40
     💪Урон: +79

Все оружие, начиная с *💥BFGzzv-4000* не ломается от времени и может использоваться вечно
`;

const workbenchArmor = `
*🛡Броня на верстаке:*

*👕Портупея* — 📦390
     🛡Защита: +3

*👕Кожаный жилет* — 📦890
     🛡Защита: +6

*👕Титановые щитки* — 📦5200
     🛡Защита: +16

*⚙️Силовая броня* — 📦12990, 💡5
     🛡Защита: +25

*⚙️Силовая броня🎖* — 📦22990, 💡15
     🛡Защита: +35

*⚙️Силовая броня🎖🎖* — 📦35990, 💡35
     🛡Защита: +45

*⚙️Броня 'Тесла'* — 📦40990, 💡40, 💾10
     🛡Защита: +55

*⚙️Броня 'Геенна'* — 📦52990, 💡80, 💾21
     🛡Защита: +66
`;

const workbenchFirstAid = `
*⛑Аптечка на верстаке:*

💧 *Чистая вода* (❤️+3)
  ▫️ 📦30;

💊 *Speed-ы* (+5 🔋 на время)
  ▫️ 📦200;
  ▫️ Эфедрин х1

💉 *Стимулятор* (❤️+30)
  ▫️ 📦80;

💉*++ Суперстим* (полное здоровье + 20%)
  ▫️ Необходимое колчичество 📦Материалов = \`Уровень вашего ❤️Здоровья * 7.2\`
  ▫️ Эфедрин х1
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

*☣️Потрошитель* - 📦158990, 💡220, 💾99, 🔩88
     💪Урон: +92

*☣️Жиробас* - 📦191000, 💡250, 💾135, 🔩112
     💪Урон: +125

*🌟Гравипушка* - 📦241900, 💡310, 💾185, 🔩145
     💪Урон: +159

*💿DVD-VCH* - 📦269000, 💡330, 💾200, 🔩180
     💪Урон: +187

*♻️Рандомган* - 📦281300, 💡350, 💾223, 🔩197
     💪Урон: +__

*🐱Ракетенок☄️* - 📦349900, 💡410, 💾299, 🔩250
     💪Урон: +266
`;

const engineerArmor = `
*🛡Броня у 👓Инженера:*

*🦇Бэткостюм* - 📦72900, 💡120, 💾54, 🔩25
     🛡Защита: +76

*⚛️Нановолокно* - 📦98000, 💡150, 💾85, 🔩46
     🛡Защита: +89

*🛠Мультизащита* - 📦141900, 💡190, 💾125, 🔩69
     🛡Защита: +127

*⚡️Тесла-мех* - 📦179990, 💡210, 💾145, 🔩116
     🛡Защита: +161
`;

const engineerHelmets = `
*🛡Шлемы у 👓Инженера:*

*⚙️Шлем синта* - 📦21990, 🔹250, 💡90, 💾20
     🛡Защита: +25

*⚙️Шлем Рейдер-пес* - 📦45990, 🔹330, 💡140, 💾60
     🛡Защита: +40

*⚙️Шлем Тесла* - 📦87990, 💡450, 💾210, 🔩130
     🛡Защита: +68

*🛠Костяной шлем* - 📦157990, 💡590, 💾345, 🔩320
     🛡Защита: +92
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

💌 *Медпак* (❤️+60)
    ▫️ 📦630;
    ▫️ Эфедрин х1;
    Можно носить только 1 шт
    При наличии *👝 Сумки под медпаки*, в нее помещается дополнительно 2 шт

💉 *Мед-Х детский* (❤️+30)
    ▫️ 📦410;
    Можно носить по 2 шт

❣️* Баффаут* (❤️+17)
    ▫️ 📦280;
    Можно носить по 2 шт
`;

const basementText = `
Вещи в *🚪Уютном подвальчике*, который расположен на расстоянии 👣43км от лагеря:

*🧠Брейналайзер* - 📦656900, 🔗Кубонит x38990
     💪Урон: +344

*🌡Плюмбус* - 📦957900, 🔗Кубонит x54990, 🔗Осмий х30290
     💪Урон: +416

*💢Плазмолив* - 📦1135900, 🔗Кубонит x68490, 🔗Осмий х45590;🔗β-Ti3Au x43930;
     💪Урон: ?

*❇️γ-Дезинтегратор* - 📦1426900, 🔗Кубонит x99990, 🔗Осмий х79560, 🔗β-Ti3Au x66980
     💪Урон: +507
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

*✳️Протонный топор* - 📦359900, 🔹2990, 💾289, 🔩275
     💪Урон: ???

*❇️Плазмакастер* - 📦349900, 💡410, 💾359, 🔩310
     💪Урон: +291

*💣Судный день* - 📦325900, 💡680, 💾399, 🔩390
     💪Урон: ???

*✝️Святое пламя* - 📦385900, 💡720, 💾419, 🔩300
     💪Урон: +318

*💥Маленький друг* - 📦399400, 💡750, 💾435, 🔩329
     💪Урон: +325`;

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
Награда: 💠Алмазная броня (+149🛡) или Ⓜ️Модульная броня (+130🛡)

*🔬 Научная лаборатория*, 56км
Награда: ⚡️Тесла-мех🏅(+187🛡),  📥Модуль коммегции (\`Бонус: ⚖️Скидки у торговцев\`)

*⛩ Храм Мудрости*, 69км
Награда: +30 🤸🏽‍♂️Ловкости, ❇️Плазмакастер🏅(314⚔️)

*👁‍🗨 Чёрная Меза*, 74км
Награда: ❇️Плазмакастер🔆(329⚔️), 💪Сила +40, ❤️Живучесть +30
`;

const accessories = require('./accessories.js');
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
${accessories.unic}`;

const inventionsText = `
Улучшить оружие и броню можно в *⛺️Лагере* на *🛠Верстаке*.

В списке приводится список самой ходовой экипировки.

Имейте ввиду, что цифры после улучшения приведены для базовых характеристик (т.е. до передачи другим игрокам):`;

const inventionsWeapon = `
Улучшение *Оружия*

 ▫️*Лазерный тесак*
🏅 - Минизаряд(7);  Провода(5);

 ▫️*BFGzzv-4000*
🏅 (29⚔️) - Транзистор(5);  Изолента(6);

 ▫️*💥Колыбель Пустоши*
🏅 - Транзистор(9);  Что-то чугунное(10);

 ▫️*💥Tyrant-PDR*
🏅 (46⚔️) - Вольфрам(9);  Тряпка(12);

 ▫️*☄️Больверизатор*
🏅 - Фольга!(3);  Изолента(12);  Провода(15);

 ▫️*🌟Армагеддец*
🏅 (90⚔️) - Что-то чугунное(9);  Изолента(25);  Провода(30);

 ▫️*☣️Потрошитель*
🏅 (122⚔️) - Минизаряд(11);  Потенциометр(14);  Сталь(5);

 ▫️*☣️Жиробас*
🏅 - Минизаряд(10);  Плазма(8);  Изолента(4);

 ▫️* 💿DVD-VCH*
🏅 - Тряпка(30);

 ▫️*🐱Ракетенок☄️*
🏅 (266⚔️) - Фольга!(12);  Плазма(14);  Сердце трога(21);  Потенциометр(21);  Сталь(24);
🔆 - Фольга!(32);  Плазма(44);  Сердце трога(31);  Потенциометр(31);  Сталь(44);

 ▫️*❇️Плазмакастер*
🏅 (314⚔️) - ?
🔆 (329⚔️) - Фольга!(43);  Изолента(49);  Провода(55);`;

const inventionsArmor = `
Улучшение *Брони*

 ▫️*Броня Геенна*
🏅 (87🛡) - Вольфрам(9);  Тряпка(12);
🔆 (96🛡) - Вольфрам(19);  Тряпка(22);

 ▫️*⚙️Броня Безумца*
🏅 (75🛡) - Фольга!(2);  Сердце трога(11);  Потенциометр(3);  Сталь(4);
🔆 - Фольга!(12);  Сердце трога(21);  Потенциометр(13);  Сталь(14);

 ▫️*⚛️Экзокостюм*
🏅 (89🛡) - Минизаряд(4);  Изолента(6);  Топаз(5);
🔆 (95🛡) - Минизаряд(14);  Изолента(16);  Топаз(15);

 ▫️*🦇Бэткостюм*
🏅 (95🛡) - Фольга!(3);  Изолента(12);  Провода(15);
🔆 (103🛡) - ???

 ▫️*🛠Мультизащита*
🏅 (157🛡) - Фольга!(12);  Плазма(14);  Сердце трога(11);  Потенциометр(23);  Сталь(24);
🔆 - Фольга!(32);  Плазма(29);  Сердце трога(21);  Потенциометр(33);  Сталь(39);

 ▫️*⚡️Тесла-мех*
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

Эту экиперовку пожно получить став победилем сезона в Куполе. Сезон закрывается каждую неделю.

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
