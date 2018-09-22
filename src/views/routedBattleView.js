const moment = require('moment-timezone');
const _ = require('underscore');

const routedBattleView = (Beast, {
  battleId,
}) => new Promise((resolve) => {
  Beast.findOne({
    'battles._id': battleId,
  }).then((fBeast) => {
    if (fBeast !== null) {
      const beast = fBeast.toJSON();
      const bId = battleId.toJSON();
      let battleReply;

      const battle = beast.battles.filter(beastBattle => beastBattle._id.toJSON() === bId).pop();

      const minMax = (array) => {
        const min = _.min(array);
        const max = _.max(array);

        if (min !== max) {
          return `${min}-${max}`;
        }

        return `${min}`;
      };

      const damageReceived = (beastBattle) => {
        if (beastBattle.damagesReceived[0] !== 0) {
          return `💔${beastBattle.totalDamageReceived} за ${beastBattle.damagesReceived.length} удар(а)`;
        }

        return `💔${beastBattle.totalDamageReceived}`;
      };


      if (battle.outcome === 'win') {
        if (battle.stats !== undefined) {
          battleReply = `▫️ Успешно при уроне мобу ${battle.totalDamageGiven}.\nСтаты игрока: ⚔️Урон: ${battle.stats.damage} 🛡Броня: ${battle.stats.armor}.\nВсего урона от моба получено -${damageReceived(battle)}`;
        }
      } else if (battle.stats !== undefined) {
        battleReply = `▫️ Неудача при уроне мобу ${battle.totalDamageGiven}.\nСтаты игрока:⚔️Урон: ${battle.stats.damage} 🛡Броня: ${battle.stats.armor}.\nВсего урона от моба получено -${damageReceived(battle)}`;
      } else {
        battleReply = 'У этой битвы почему-то нет характеристик брони и урона игрока - ничего не могу вывести.';
      }

      const hitsByPlayer = battle.damagesGiven.length;
      const hitsByBeast = battle.damagesReceived[0] === 0 ? 0 : battle.damagesReceived.length;

      const meta = `Здоровье игрока пред боем: ${battle.healthOnStart}`;
      let dateInfo = 'У этой битвы нет штампа времени.';

      if (battle.stamp) {
        dateInfo = moment(Number(battle.stamp.slice(0, 13))).format('DD/MM/YYYY, hh:mm:ss');
      }


      const headerReply = `<b>${beast.name}</b>
👣${beast.type === 'DarkZone' ? '🚷' : '💀'} ${minMax(beast.distanceRange)}км
`;
      resolve({
        reply: `${headerReply}\n${battleReply}\n\nВремя битвы: ${dateInfo}\n\n${meta}\n\nИгрок ударил моба ${hitsByPlayer} раз\nМоба ударил игрока ${hitsByBeast} раз`,
        beast,
      });
    } else {
      resolve({
        reply: false,
      });
    }
  }).catch(e => console.log(e));
});

module.exports = routedBattleView;
