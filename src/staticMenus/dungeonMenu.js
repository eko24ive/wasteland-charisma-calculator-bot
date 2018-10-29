const suppliesText = `
Приветствую, путник. Данные собраны по всем подземельям, в том числе минимальные статы для прохода. Награды также могут варьироваться.

Вход в подземелье требует 2 единицы выносливости 🔋
Подземелья со значком 🚷 доступны только в Тёмной Зоне.
Подземелья со значком 📯 доступны только в обычной пустоши, в ТЗ их нет.

<a href="https://medium.com/@rey.wolf/%D0%B3%D0%B0%D0%B9%D0%B4-%D0%BF%D0%BE-%D0%BF%D0%BE%D0%B4%D0%B7%D0%B5%D0%BC%D0%B5%D0%BB%D1%8C%D1%8F%D0%BC-712d15cbc804">Оригинальный гайд</a>
Авторы: @ICallThePolice, @rey_wolf, @Asmody и @adgvkty.

<b>Важное примечание.</b>
В гайде не учтено использование оверхила и бафов, в частности на дальних данжах.
Не рекомендован спуск в подземелья без полного набора медикаментов.

Характеристика ⚔️Урон складывается из: 💪Сила + ⚔️Урон от оружия.
Характеристика ❤️Здоровье указывается изначальная, без оверхила.
Редкость предметов: ▫️Обычное, 🔹Необычное, 🔸Редкое, 🔺Особое, 💎Уникальное
`;

const oldMineText = `
<b>📯11км (Старая шахта)</b>
Для захвата необходимо: 2👤 Человека

[ХАРАКТЕРИСТИКИ]
❤️Здоровье: 20
⚔️Урон: 20

[МОБЫ]
👁Мутант (Голодный)
👁Мутант (❗️Огромный)
🐲Трог (❗️Огромный)

[НАГРАДА]
(1–2)Разновидность Хлама по 1–5 шт.
(1)🔹Кварц: 1–14 шт.
(2) Крышки / Материалы по 500–600 ед.
Предмет из списка:
▫️ Шипастая бита +2⚔️
▫️ Мачете +11⚔️  
🔹 Фалмерский клинок +8⚔️
🔺 Мото-защита +9🛡
💎 Электромеч +9⚔️
 
`;

const haloCave = `
<b>📯19км (Пещера Ореола)</b>
Для захвата бандой: 1 безумец
Совершенно рандомный данж. 4–7 случайных мобов, мобы попадаются с 1 до 90+ км.

[ХАРАКТЕРИСТИКИ]
❤️Здоровье: 250+
⚔️Урон: 250+

[МОБЫ]
???

[НАГРАДА]
(2)Разновидностей Хлама
(3)🔹Кварц / 💡Генератор / 💾Микрочип / 🔩Иридия: 1–20 шт.
Предмет из списка:
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
`;

const sewerPipe = `
<b>🚷23км (🚽Сточная труба)</b>
Для захвата необходимо: 4👤 Человека

[ХАРАКТЕРИСТИКИ]
❤️Здоровье: 50
🛡Броня: 30+
⚔️Урон: 50

[МОБЫ]
🐲Трог (💙Леонардо)
🐲Трог (💛Микеланджело)
🐲Трог (💜Донателло)
🐲Трог (❤️Рафаэль)
💙Леонардо 💛Микеланджело 🐁Крыса 💜Донателло ❤️Рафаэль

[НАГРАДА]
(1–2)Разновидность Хлама по 1–5 шт.
(1)🔹Кварц: 1–6 шт.
(1)Батарейка BIOS
(2) Крышки / Материалы по 100–200 ед.
`;

const openVault = `
<b>📯29км (⚙️Открытое убежище)</b>
Для захвата необходимо: 6👤 Человек

[ХАРАКТЕРИСТИКИ]
❤️Здоровье: 70
⚔️Урон: 100
🛡Броня: 30+ 

[МОБЫ]
🦎Геккон (🏵🎖Огненный)
👽Чужой (🏵🎖Капитан)
🐜Человек-муравей (Где он блядь?!)
🐙Туманник (🏵🎖🎖Убийца)

[НАГРАДА]
(1–2)Разновидности Хлама по 1–5 шт.
(1)💡Генератор/💾Микрочип: 1–15 шт.
(2) Крышки / Материалы по 1400 ед.
Предмет из списка
▫️ Броня братства +15🛡
▫️ Электромеч +9⚔️ 
▫️ BFGzzv-4000 +20⚔️
🔹 Боевой шлем +5🛡
🔸 💥Фусронет +55⚔️
`;

const betCave = `
<b>🚷34км (🦇Бэт-пещера)</b>
Для захвата необходимо: 6👤 Человек

[ХАРАКТЕРИСТИКИ]
❤️Здоровье: 300
⚔️Урон: 350
🛡Броня: 150

[МОБЫ]
🦇Мышь (Человек)
🤡Жокей (Чего ты такой серьезный?)
🐊Крокс (Крокодил-мутант)
🐱Баба-кот (Не представляй)
🤵🏻Томас 👰🏻Марта 👦🏻Сирота

[НАГРАДА]
(1–2)Разновидности Хлама под 1–5 шт.
(1)💾Микрочип 1–12 шт.
(2)Крышки / Материалы по 1600ед.
Предмет из списка:
▫️ 🔮Энергосфера +65⚔️
▫️ 🌟Армагеддец +79⚔️
▫️ ☣️Потрошитель +92⚔️
🔹 ☣️Жиробас +125⚔️
🔸 🌟Гравипушка +159⚔️
🔺 💿DVD-VCH +187⚔️
`;

const utkinPass = `
<b>📯39км (🦆Перевал Уткина)</b>
Для захвата необходимо: 6👤 Человек

[ХАРАКТЕРИСТИКИ]
❤️Здоровье: 150
🛡Броня: 120
⚔️Урон: 200

[МОБЫ]
🤖Киборг (🏵🏵🎖Мифический)
🦅Касадор (🏵🏵🎖Особь 185)
🐲Трог (🏵🏵🎖Мифический)

[НАГРАДА]
(1–2)Разновидности Хлама по 1–5 шт.
(1)💾Микрочип 1–15 шт.
(1)💌Медпак (Если на руках меньше 3 💌Медпаков)
(2) Крышки / Материалы по 1900 ед.
`;

const hroshgarHigh = `
<b>📯45км (🌁Высокий Хротгар)</b>
Для захвата необходимо: 6👤 Человек

[ХАРАКТЕРИСТИКИ]
❤️Здоровье: 350
🛡Броня: 200
⚔️Урон: 400
🤸🏽‍♂️Ловкость: 150

[МОБЫ]
🦀Краб (Грязевой)
🌞Атронах (🔥Огненный)
㊙️Дремора (🔥Даэдра)
🐲Алдуин (🔥Пожиратель Мира)

[НАГРАДА]
(1–2)Разновидности Хлама по 1–5 шт.
(1)💾Микрочип 1–12 шт.
(1)🍸Скума
(2)Крышки / материалы по 2100 ед.
Предмет из списка:
▫️ 🛠Мультизащита +127🛡
▫️ 💿DVD-VCH +187⚔️
▫️ ♻️Рандомган +206⚔️
🔹 📯Даэдрический меч +216⚔️
🔹 💿DVD-VCH🏅 +207⚔️
🔺 🛠Мультизащита 🏅 +157🛡
💎 Рогатый шлем +115🛡
`;

const ruinsOfHexagon = `
<b>📯50км (🛑 Руины Гексагона)</b>
Для захвата необходимо: 8👤 Человек

[ХАРАКТЕРИСТИКИ]
❤️Здоровье: 500
🛡Броня: 320
⚔️Урон: 650
🤸🏽‍♂️Ловкость: 260

[МОБЫ]
🐕Киберпес (🏆Исключительный)
🚨Анклав (🏆🏆Главнокомандующий)
🐜Человек-муравей (⭐️)
👽Чужой (⭐️🌟⭐️)
🦆Ванаминго (До последней крови, сука!)

[НАГРАДА]
(1–2) Разновидность Хлама по 1–5 шт.
(1)💾Микрочип 1–6 шт.
(2) Крышки / Материалы по 2400 шт.
`;

const scientificComplex = `
<b>🚷56км (🔬Научный комплекс)</b>
Для захвата необходимо: 8👤 Человек

[ХАРАКТЕРИСТИКИ]
❤️Здоровье: 700
🛡Броня: 300
⚔️Урон: 900
🤸🏽‍♂️Ловкость: 350

[МОБЫ]
🚨Анклав (🚬Солдат)
🤖Киборг (🔱🔱🔱Центурион)
🦆Ванаминго (Поднимает связи криминального прошлого)
🚨Анклав (🚬Элита🚬)
🚨Анклав (🚬🔱🔱Единичный)

[НАГРАДА]
(1)💾Микрочип по 1–6 шт.
(1–2)Разновидности Хлама по 1–5 шт.
(2) Крышки / Материалы по 2700 ед.
Предмет из списка:
▫️ 🛠Мультизащита +127🛡
▫️ 🛠Мультизащита 🏅 +157🛡 
▫️ 🐱Ракетенок☄️ +266⚔️
▫️ ⚡️Тесла-меx +161🛡
🔹 ⚡️Тесла-меx🏅 +187🛡
💎 ❔❔❔❔❔ +195🛡
`;

const templeOfKnowledge = `
<b>📯69км (⛩Храм Знаний)</b>
Для захвата необходимо: 8👤 Человек

[ХАРАКТЕРИСТИКИ]
❤️Здоровье: 1100
🛡Броня: 290
⚔️Урон: 1200
🤸🏽‍♂️Ловкость: 450

[МОБЫ]
🐜Муравей (🚬Гигант)
🐜Человек-муравей (Это птица? Это самолет? Это муравей!)
🦆Ванаминго (Прикидывается королем муравьев)
🚨Муравей-Анклав (🚬Элита🚬)
☯️Мыслитель (Тысячелетний)

[НАГРАДА]
Бонус за первое прохождение: 🤸🏽‍♂️Ловкость +30.
(1–2)Разновидности Хлама по 1–5 шт.
(1)💾Микрочип / 🔩Иридий 1–12
(2) Крышки / Материалы по 3300 шт.
(1–2)Разновидности Хлама по 1–5 шт.
Предмет из списка:
▫️ 🐱Ракетенок☄️ +266⚔️
▫️ 🐱Ракетенок☄️🏅 +284⚔️ 
▫️ ❇️Плазмакастер +334⚔️
🔹 ❇️Плазмакастер🏅 +314⚔️
🔸 ❇️Плазмакастер🔆 +329⚔️
🔺 ❔❔❔❔ +195🛡
`;

const blackMesa = `
<b>📯74км (🗨Черная Меза)</b>
Для захвата необходимо: 10👤 Человек

[ХАРАКТЕРИСТИКИ]
❤️Здоровье: 1300
🛡Броня: 290
⚔️Урон: 1500
🤸🏽‍♂️Ловкость: 700

[МОБЫ]
🐙Хедкраб (Ламарр)
🐙Хедкраб (Гонарч)
🐜Муравьиный лев (Обычный)
🚨Альянс (🚬Солдат)
👁‍🗨G-man (Ноунейм с кейсом)

[НАГРАДА]
Бонус за первое прохождение: 💪Сила +40 ❤️Живучесть +30.
(1–2)Разновидности Хлама по 1–5 шт.
(1)💾Микрочип / 🔩Иридий по 1–15 шт.
(2) Крышки / Материалы по 3600 шт.
Предмет из списка:
▫️ 💣Судный день +300⚔️
▫️ ❇️ Плазмакастер🏅 +314⚔️
🔹 ✝️Святое пламя +356⚔️
🔸 ⚡️Тесла-мех🔆 +198🛡
🔺 ✳️Galachi Lite +230🛡
🔺 💥Маленький друг +372⚔️
💎 ❔❔❔❔❔ +1⚔️
💎 ❔❔❔❔❔ +240🛡
`;

const moltenСore = `
<b>🚷80км (🔥Огненные недра)</b>
Для захвата необходимо: 10👤 Человек

[ХАРАКТЕРИСТИКИ]
❤️Здоровье: 1550
🛡Броня: 390
⚔️Урон: 1700
🤸🏽‍♂️Ловкость: 1200

[МОБЫ]
🐕Магмадар (Гончая недр)
🔥Геддон (Барон)
🐲Сульфурион (Предвестник)
🐲Мажордом (Экзекутос)
👹Рагнарос (Дитя Вита и повелитель Огня)

[НАГРАДА]
Бонус за первое прохождение: 🗣Харизма +40 🤸🏽‍♂️Ловкость +30.
(1–2) Разновидности Хлама по 1–5 шт.
(1) 🔥Сердце пламени
(1) 💾Микрочип / 🔩Иридий по 1–20 шт.
(2) Крышки / Материалы по 3900 шт.
Предмет из списка:
▫️ 💣Судный день +300⚔️
▫️ ✝️Святое пламя +356⚔️
🔹 💥Маленький друг +372⚔️
🔸 🦈Барракуда +390⚔️
🔺 ❔❔❔❔❔ +255🛡
💎 ❔❔❔❔❔ +275🛡
💎 ❔❔❔❔❔ +610⚔️
`;

const dungeonMenu = {
  config: {
    parseMode: 'html',
  },
  name: 'dungeons',
  title: '⚠️Подземелья',
  text: suppliesText,
  content: [{
    name: 'oldMine',
    title: '⛰ Старая шахта',
    text: oldMineText,
    content: [],
  },
  {
    name: 'haloCave',
    title: '⚠️ Пещера Ореола',
    text: haloCave,
    content: [],
  },
  {
    name: 'sewerPipe',
    title: '🚽 Сточная труба',
    text: sewerPipe,
    content: [],
  },
  {
    name: 'openVault',
    title: '⚙️Открытое убежище',
    text: openVault,
    content: [],
  },
  {
    name: 'betCave',
    title: '🦇Бэт-пещера',
    text: betCave,
    content: [],
  },
  {
    name: 'utkinPass',
    title: '🦆Перевал Уткина',
    text: utkinPass,
    content: [],
  },
  {
    name: 'hroshgarHigh',
    title: '🌁Высокий Хротгар',
    text: hroshgarHigh,
    content: [],
  },
  {
    name: 'ruinsOfHexagon',
    title: '🛑 Руины Гексагона',
    text: ruinsOfHexagon,
    content: [],
  },
  {
    name: 'scientificComplex',
    title: '🔬Научный комплекс',
    text: scientificComplex,
    content: [],
  },
  {
    name: 'templeOfKnowledge',
    title: '⛩Храм Знаний',
    text: templeOfKnowledge,
    content: [],
  },
  {
    name: 'blackMesa',
    title: '🗨Черная Меза',
    text: blackMesa,
    content: [],
  },
  {
    name: 'moltenСore',
    title: '🔥Огненные недра',
    text: moltenСore,
    content: [],
  },
  ],
};

module.exports = dungeonMenu;
