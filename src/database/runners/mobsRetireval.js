require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const async = require('async');
const _ = require('underscore');

const beastSchema = require('../../schemes/beast');

const Beast = mongoose.model('Beast', beastSchema);

mongoose.connect('mongodb://heroku_1q54zt8s:8kbg65u9g98hol9dgithpujahv@ds119490.mlab.com:19490/heroku_1q54zt8s');

const minMax = (array) => {
  const min = _.min(array);
  const max = _.max(array);

  if (min !== max) {
    return `${min}-${max}`;
  }

  return `${min}`;
};

const beastList = [
  '😈Кровосос (Новообращенный)',
  '🦇Вампир (Синт)',
  '🦇Вампир (Вынужден сосать)',
  '👻Призрак (Нажал Alt+F4)',
  '👻Призрак (🔱Дух мародёра)',
  '👻Призрак (Понял, что его наебали)',
  '💀Рейдер без головы (Примерял бы твою)',
  '🤠Ван-Хельсинг (В поисках чудищ)',
  '�Мертвец (🏵Бледный)',
  '🧟‍♂️Зомби (🏵🏵Рейдер к успеху шёл)',
  '?‍♂️Дракула (Хозяин Генри Эдема)',
  '🦋Блуждающий огонёк (Манит к себе)',
  '🇻🇦Воин Жёлтого замка (Что он здесь забыл, блядь?)',
  '🐱Нечто (Мимикрирует под котёнка)',
  '🦉Сова-людоед (Целится в глаза)',
  '🤹🏼‍♀️Карлик (Сбежал из цирка)',
  '🎭Коллекционер (🔱🔱Ценит твою жизнь больше чем ты)',
  '👨🏻‍🏫Доктор Джекилл (Приятный молодой человек)',
  '🐵Мистер Хайд (🔱Неприятный молодой человек)',
  '👦🏻Дэмиен (🔱Открывает врата в ад)',
  '💩Дерьмодемон (Делает сущее зловонной клоакой)',
  '🔪Джейсон (🏵🏵Намеревается отомстить)',
  '👺Маска (Звонит на твой пип-бой)',
  '👺Маска (Ищет Сидни Прескотт)',
  '🦈Мегалодон (Барахтается в песке)',
  '👹Хищник (Ищет чужого)',
  '🐛Чужой (Ищет хищника)',
  '🍴Фредди Крюггер (Ищет улицу Вязов)',
  '👤Майкл Майерс (Виновник этого торжества)',
  '🤖Альтрон (Поселился в твоем пип-бое)',
  '🤕Кожаное лицо (🔱🔱Приветливо машет бензопилой)',
  '🤡Пеннивайз (Съел твоего брата)',
];

console.log('===START===');

async.forEach(beastList, (name, next) => {
  Beast.find({
    name,
    subType: 'regular',
  }).then((beasts) => {
    if (beasts.length === 0) {
      console.log(`${name} - не найден в базе`);
      console.log('===========================');
      next();
    } else {
      console.log(`${name}:`);

      async.forEach(beasts, (beast, _next) => {
        const ranges = `${beast.type === 'DarkZone' ? '🚷' : '💀'} ${minMax(beast.distanceRange.map(({ value }) => value))}`;
        console.log(ranges.length > 0 ? ranges : 'Нет данных о диапазоне');
        _next();
      }, () => {
        next();
        console.log('===========================');
      });
    }
  });
}, () => {
  mongoose.disconnect();
  console.log('===END===');
});
