const _ = require('underscore');

const routedBeastView = (Beast, seachParams, route = null, config) => new Promise((resolve) => {
  const { VERSION } = config;

  Beast.findOne(seachParams).then((fBeast) => {
    if (fBeast !== null) {
      let isInfoDeprecated = false;
      let isLootDeprecated = false;
      let isBattlesDeprecated = false;
      let isFleesDeprecated = false;
      let isConcussionsDeprecated = false;

      const beast = fBeast.toJSON();

      const getDeprecatedFlair = isDepricated => (isDepricated ? '‼️ <b>Отображаються устаревшие данные</b> ‼️\n' : '');

      const minMax = (array) => {
        const min = _.min(array);
        const max = _.max(array);

        if (min !== max) {
          return `${min}-${max}`;
        }

        return `${min}`;
      };

      const getDistanceRange = (distanceRange) => {
        const actualDistanceRange = [];
        const outdatedDistanceRange = [];

        distanceRange.forEach(({ version, value }) => {
          if (version === VERSION) {
            actualDistanceRange.push(value);
          } else {
            isInfoDeprecated = true;
            outdatedDistanceRange.push(value);
          }
        });

        const existingDistanceRange = actualDistanceRange.length > 0 ? actualDistanceRange : outdatedDistanceRange;

        return minMax(existingDistanceRange);
      };

      const getCaps = (caps) => {
        const actualCaps = [];
        const outdatedCaps = [];

        caps.forEach(({ version, value }) => {
          if (version === VERSION) {
            actualCaps.push(value);
          } else {
            isLootDeprecated = true;
            outdatedCaps.push(value);
          }
        });

        const existingCaps = actualCaps.length > 0 ? actualCaps : outdatedCaps;

        return minMax(existingCaps);
      };

      const getMaterials = (materials) => {
        const actualMaterials = [];
        const outdatedMaterials = [];

        materials.forEach(({ version, value }) => {
          if (version === VERSION) {
            actualMaterials.push(value);
          } else {
            isLootDeprecated = true;
            outdatedMaterials.push(value);
          }
        });

        const existingMaterials = actualMaterials.length > 0 ? actualMaterials : outdatedMaterials;

        return minMax(existingMaterials);
      };

      const getDrop = (capsReceived, materialsReceived) => {
        if (_.isEmpty(capsReceived) && _.isEmpty(materialsReceived)) {
          return 'Нет данных';
        }

        return `🕳${getCaps(capsReceived)} крышек
📦${getMaterials(materialsReceived)} материалов
        `;
      };

      const getItems = () => 'Раздел находится на тех-профилактике';

      /* if (_.isEmpty(items)) {
          return 'Неизвестно';
        }

        return Object.keys(items).map((key) => {
          const drops = _.flatten(items[key]);
          const dropAmount = minMax(drops);

          return `${key}: x${dropAmount}`;
        }).join('\n'); */

      const getFlees = (flees) => {
        if (_.isEmpty(flees)) {
          return {
            successFlees: 'Нет данных об удачных побегах',
            failFlees: 'Нет данных о неудачных побегах',
          };
        }

        let successFlees = [];
        let failFlees = [];

        const actualSuccessFlees = [];
        const actualFailFlees = [];

        const outdatedSuccessFlees = [];
        const outdatedFailFlees = [];

        flees.forEach((flee) => {
          if (flee.stats) {
            if (flee.outcome === 'win') {
              if (flee.version === VERSION) {
                actualSuccessFlees.push(`Успешно при 🤸‍♂️${flee.stats.agility || flee.agility}\n`);
              } else {
                outdatedSuccessFlees.push(`Успешно при 🤸‍♂️${flee.stats.agility || flee.agility}\n`);
              }
            } else if (flee.version === VERSION) {
              actualFailFlees.push(`Неудача при 🤸‍♂️${flee.stats.agility || flee.agility} (-💔${flee.damageReceived})`);
            } else {
              outdatedFailFlees.push(`Неудача при 🤸‍♂️${flee.stats.agility || flee.agility} (-💔${flee.damageReceived})`);
            }
          }
        });

        if (actualSuccessFlees.length > 0) {
          successFlees = actualSuccessFlees;
        } else {
          isFleesDeprecated = true;
          isInfoDeprecated = true;
          successFlees = outdatedSuccessFlees;
        }
        if (actualFailFlees.length > 0) {
          failFlees = actualFailFlees;
        } else {
          isFleesDeprecated = true;
          isInfoDeprecated = true;
          failFlees = outdatedFailFlees;
        }

        if (successFlees.length > 5) {
          successFlees = successFlees.slice(0, 5);
        }

        if (failFlees.length > 5) {
          failFlees = failFlees.slice(0, 5);
        }

        return {
          successFlees: _.isEmpty(successFlees) ? 'Нет данных об удачных побегах' : successFlees.join('\n'),
          failFlees: _.isEmpty(failFlees) ? 'Нет данных о неудачных побегах' : failFlees.join('\n'),
        };
      };

      const getConcussions = (concussions) => {
        if (_.isEmpty(concussions)) {
          return 'Нет данных';
        }

        const filterdConcussions = concussions.filter(({ stats }) => stats !== undefined);

        const actualConcussions = [];
        const outdatedConcussions = [];

        filterdConcussions.forEach((concussion) => {
          if (concussion.version === VERSION) {
            actualConcussions.push(`▫️ ${concussion.amount} 💫оглушений при 🤸🏽‍♂️${concussion.stats.agility}`);
          } else {
            isConcussionsDeprecated = true;
            outdatedConcussions.push(`▫️ ${concussion.amount} 💫оглушений при 🤸🏽‍♂️${concussion.stats.agility}`);
          }
        });

        const existingConcussions = actualConcussions.length > 0 ? actualConcussions : outdatedConcussions;

        return existingConcussions.join('\n');
      };

      const getBattles = (battles, trim, small, withLinks = false) => {
        if (_.isEmpty(battles)) {
          return {
            successBattles: 'Нет данных об удачных битвах',
            failBattles: 'Нет данных о неудачных битвах',
          };
        }

        let successBattles = [];
        let failBattles = [];

        const actualSuccessBattles = [];
        const actualFailBattles = [];

        const outdatedSuccessBattles = [];
        const outdatedFailBattles = [];

        const damageReceived = (battle) => {
          if (battle.damagesReceived[0] !== 0) {
            return `💔${battle.totalDamageReceived} за ${battle.damagesReceived.length} удар(а)`;
          }

          return `💔${battle.totalDamageReceived}`;
        };

        battles.forEach((battle) => {
          let battleReply;
          const battleLink = withLinks ? `\n/battle_${battle._id}` : '';

          if (battle.outcome === 'win') {
            // TODO: Fix battle parse
            if (battle.stats !== undefined) {
              if (small) {
                battleReply = `💔${battle.totalDamageReceived} урона за ${battle.damagesGiven.length} удар(а)${battleLink}`;
              } else {
                battleReply = `▫️ Успешно при уроне мобу ${battle.totalDamageGiven}.\nСтаты игрока: ⚔️Урон: ${battle.stats.damage} 🛡Броня: ${battle.stats.armor}.\nВсего урона от моба получено -${damageReceived(battle)}${battleLink}`;
              }

              if (battle.version === VERSION) {
                actualSuccessBattles.push({ battleReply, totalDamageGiven: battle.totalDamageGiven });
              } else {
                outdatedSuccessBattles.push({ battleReply, totalDamageGiven: battle.totalDamageGiven });
              }
            }
          } else if (battle.stats !== undefined) {
            if (small) {
              battleReply = `💥${battle.totalDamageGiven} не хватило мобу за ${battle.damagesGiven.length} удар(а)${battleLink}`;
            } else {
              battleReply = `▫️ Неудача при уроне мобу ${battle.totalDamageGiven}.\nСтаты игрока:⚔️Урон: ${battle.stats.damage} 🛡Броня: ${battle.stats.armor}.\nВсего урона от моба получено -${damageReceived(battle)}${battleLink}`;
            }

            if (battle.version === VERSION) {
              actualFailBattles.push({ battleReply, totalDamageGiven: battle.totalDamageGiven });
            } else {
              outdatedFailBattles.push({ battleReply, totalDamageGiven: battle.totalDamageGiven });
            }
          }
        });

        if (actualSuccessBattles.length > 0) {
          successBattles = actualSuccessBattles;
        } else {
          isBattlesDeprecated = true;
          isInfoDeprecated = true;
          successBattles = outdatedSuccessBattles;
        }
        if (actualFailBattles.length > 0) {
          failBattles = actualFailBattles;
        } else {
          isBattlesDeprecated = true;
          isInfoDeprecated = true;
          failBattles = outdatedFailBattles;
        }

        if (successBattles.length > trim) {
          successBattles = _.first(_.sortBy(successBattles, 'totalDamageGiven'), trim);
        }

        if (failBattles.length > trim) {
          failBattles = _.last(_.sortBy(failBattles, 'totalDamageReceived'), trim);
        }

        successBattles = successBattles.map(battle => battle.battleReply);
        failBattles = failBattles.map(battle => battle.battleReply);

        return {
          successBattles: _.isEmpty(successBattles) ? 'Нет данных об удачных битвах' : successBattles.join('\n\n'),
          failBattles: _.isEmpty(failBattles) ? 'Нет данных о неудачных битвах' : failBattles.join('\n\n'),
        };
      };

      const {
        successBattles: successBattlesLong,
        failBattles: failBattlesLong,
      } = getBattles(beast.battles, 5, false, config.env === 'STAGING');

      const {
        successBattles: successBattlesShort,
        failBattles: failBattlesShort,
      } = getBattles(beast.battles, 1, false, config.env === 'STAGING');

      const processedFlees = getFlees(beast.flees);

      const lootReply = `<b>[ДРОП]</b>
${getDrop(beast.capsReceived, beast.materialsReceived)}

<b>[ВОЗМОЖНЫЙ ЛУТ]</b>
${getItems(beast.receivedItems)}
`;

      const shortBattlesReply = `<b>[ПОБЕДА]</b>
${successBattlesShort}

<b>[НЕУДАЧА]</b>
${failBattlesShort}
`;

      const longBattlesReply = `<b>[СТЫЧКИ]</b>
${successBattlesLong}

---

${failBattlesLong}
`;

      const concussionsReply = `<b>[ОГЛУШЕНИЯ]</b>
${getConcussions(beast.concussions)}
`;

      const fleesReply = `<b>[ПОБЕГ]</b>
${processedFlees.successFlees}
---
${processedFlees.failFlees}
`;

      const headerReply = `<b>${beast.name}</b>
👣${beast.type === 'DarkZone' ? '🚷' : '💀'} ${getDistanceRange(beast.distanceRange)}км
`;

      const isTotalDeprecated = isInfoDeprecated || isLootDeprecated || isBattlesDeprecated || isFleesDeprecated;

      switch (route) {
        case 'info':
          resolve({
            reply: `${getDeprecatedFlair(isTotalDeprecated)}${headerReply}\n${shortBattlesReply}\n${fleesReply}`,
            beast,
          });
          break;
        case 'loot':
          resolve({
            reply: `${getDeprecatedFlair(isLootDeprecated)}${headerReply}\n${lootReply}`,
            beast,
          });
          break;
        case 'battles':
          resolve({
            reply: `${getDeprecatedFlair(isBattlesDeprecated)}${headerReply}\n${longBattlesReply}`,
            beast,
          });
          break;
        case 'concussions':
          resolve({
            reply: `${getDeprecatedFlair(isConcussionsDeprecated)}${headerReply}\n${concussionsReply}`,
            beast,
          });
          break;
        default:
          resolve({
            reply: `${getDeprecatedFlair(isInfoDeprecated)}${headerReply}\n${shortBattlesReply}\n${fleesReply}`,
            beast,
          });
          break;
      }
    } else {
      resolve({
        reply: false,
      });
    }
  }).catch(e => console.log(e));
});

module.exports = routedBeastView;
