require('dotenv').config({ path: '../../.env' });
const _ = require('underscore');

const actualDataThreshold = Number(process.env.DATA_THRESHOLD);

const INFO_ABSENT = -1;
const INFO_ACTUAL = 0;
const INFO_MIXED = 1;
const INFO_DEPRECATED = 2;

const detectInromationPrecision = (informationStatuses) => {
  const allDeprecated = informationStatuses.every(status => status === INFO_DEPRECATED || status === INFO_ABSENT);
  const allActual = informationStatuses.every(status => status === INFO_ACTUAL || status === INFO_ABSENT);
  const allAbsent = informationStatuses.every(status => status === INFO_ABSENT);

  if (allAbsent) {
    return INFO_ACTUAL;
  } if (allDeprecated) {
    return INFO_DEPRECATED;
  } if (allActual) {
    return INFO_ACTUAL;
  }

  return INFO_MIXED;
};

const routedBeastView = (Beast, seachParams, route = null, config) => new Promise((resolve) => {
  const { VERSION } = config;

  Beast.findOne(seachParams).then((fBeast) => {
    if (fBeast !== null) {
      console.log('==================');
      console.log(`Browsing: ${fBeast._id.toJSON()} `);
      console.log('==================');

      let isRangeDeprecated = INFO_ABSENT;
      let isLootDeprecated = INFO_ABSENT;
      const isBattlesDeprecated = {
        success: INFO_ABSENT,
        fail: INFO_ABSENT,
      };
      const isFleesDeprecated = {
        success: INFO_ABSENT,
        fail: INFO_ABSENT,
      };
      let isConcussionsDeprecated = INFO_ABSENT;

      const beast = fBeast.toJSON();

      const getDeprecatedFlair = (dataStatus, tiny = true, forceActualDisaplay = false) => {
        switch (dataStatus) {
          case INFO_ACTUAL:
            if (forceActualDisaplay) {
              return tiny ? '✅' : '✅ <b>Актуальные данные</b> ✅\n';
            }

            return '';
          case INFO_DEPRECATED:
            return tiny ? ' ‼️' : '‼️ <b>Устаревшие данные</b> ‼️\n';
          case INFO_ABSENT:
            return '';
          case INFO_MIXED:
          default:
            return tiny ? ' ⚠️' : '⚠️ <b>Смешанные данные</b> ⚠️\n';
        }
      };

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
            outdatedDistanceRange.push(value);
          }
        });

        if (actualDistanceRange.length > 0) {
          if (actualDistanceRange.length >= actualDataThreshold || outdatedDistanceRange.length === 0) {
            isRangeDeprecated = INFO_ACTUAL;

            return minMax(actualDistanceRange);
          }
          if (actualDistanceRange.length <= actualDataThreshold && outdatedDistanceRange.length > 0) {
            isRangeDeprecated = INFO_MIXED;

            return minMax([
              ...actualDistanceRange,
              ...outdatedDistanceRange,
            ]);
          }
        } if (outdatedDistanceRange.length > 0) {
          isRangeDeprecated = INFO_DEPRECATED;

          return minMax(outdatedDistanceRange);
        }

        return 'Нет данных о местоположении';
      };

      const getCaps = (caps) => {
        const actualCaps = [];
        const outdatedCaps = [];

        caps.forEach(({ version, value }) => {
          if (version === VERSION) {
            actualCaps.push(value);
          } else {
            outdatedCaps.push(value);
          }
        });

        if (actualCaps.length > 0) {
          if (actualCaps.length >= actualDataThreshold || outdatedCaps.length === 0) {
            isLootDeprecated = INFO_ACTUAL;

            return minMax(actualCaps);
          }
          if (actualCaps.length <= actualDataThreshold && outdatedCaps.length > 0) {
            isLootDeprecated = INFO_MIXED;

            return minMax([
              ...actualCaps,
              ...outdatedCaps,
            ]);
          }
        } if (outdatedCaps.length > 0) {
          isLootDeprecated = INFO_DEPRECATED;

          return minMax(outdatedCaps);
        }

        return null;
      };

      const getMaterials = (materials) => {
        const actualMaterials = [];
        const outdatedMaterials = [];

        materials.forEach(({ version, value }) => {
          if (version === VERSION) {
            actualMaterials.push(value);
          } else {
            outdatedMaterials.push(value);
          }
        });

        if (actualMaterials.length > 0) {
          if (actualMaterials.length >= actualDataThreshold || outdatedMaterials.length === 0) {
            isLootDeprecated = INFO_ACTUAL;

            return minMax(actualMaterials);
          }
          if (actualMaterials.length <= actualDataThreshold && outdatedMaterials.length > 0) {
            isLootDeprecated = INFO_MIXED;

            return minMax([
              ...actualMaterials,
              ...outdatedMaterials,
            ]);
          }
        } if (outdatedMaterials.length > 0) {
          isLootDeprecated = INFO_DEPRECATED;

          return minMax(outdatedMaterials);
        }

        return null;
      };

      const getDrop = (capsReceived, materialsReceived) => {
        let reply = '';

        if (_.isEmpty(capsReceived) && _.isEmpty(materialsReceived)) {
          return 'Нет данных';
        }

        const capsInformation = getCaps(capsReceived);
        const materialsInformation = getMaterials(materialsReceived);

        if (capsInformation === null) {
          reply += 'Нет данных о дропе крышек\n';
        } else {
          reply += `🕳${capsInformation} крышек\n`;
        }

        if (materialsInformation === null) {
          reply += 'Нет данных о дропе материалов\n';
        } else {
          reply += `📦${materialsInformation} крышек\n`;
        }

        return reply;
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

        flees.forEach((_flee) => {
          const { stats, agility, ...flee } = _flee;

          const parsedFlee = {
            stats: {
              agility: agility || (stats ? stats.agility : agility),
            },
            ...flee,
          };

          if (parsedFlee.stats.agility) {
            if (parsedFlee.outcome === 'win') {
              if (parsedFlee.version === VERSION) {
                actualSuccessFlees.push(parsedFlee);
              } else {
                outdatedSuccessFlees.push(parsedFlee);
              }
            } else if (parsedFlee.version === VERSION) {
              actualFailFlees.push(parsedFlee);
            } else {
              outdatedFailFlees.push(parsedFlee);
            }
          }
        });

        if (actualSuccessFlees.length > 0) {
          if (actualSuccessFlees.length >= actualDataThreshold || outdatedSuccessFlees.length === 0) {
            isFleesDeprecated.success = INFO_ACTUAL;

            successFlees = actualSuccessFlees;
          } else if (actualSuccessFlees.length <= actualDataThreshold && outdatedSuccessFlees.length > 0) {
            isFleesDeprecated.success = INFO_MIXED;

            successFlees = [
              ...actualSuccessFlees,
              ...outdatedSuccessFlees,
            ];
          }
        } else if (outdatedSuccessFlees.length > 0) {
          isFleesDeprecated.success = INFO_DEPRECATED;

          successFlees = outdatedSuccessFlees;
        }

        if (actualFailFlees.length > 0) {
          if (actualFailFlees.length >= actualDataThreshold || outdatedFailFlees.length === 0) {
            isFleesDeprecated.fail = INFO_ACTUAL;

            failFlees = actualFailFlees;
          } else if (actualFailFlees.length <= actualDataThreshold && outdatedFailFlees.length > 0) {
            isFleesDeprecated.fail = INFO_MIXED;

            failFlees = [
              ...actualFailFlees,
              ...outdatedFailFlees,
            ];
          }
        } else if (outdatedFailFlees.length > 0) {
          isFleesDeprecated.fail = INFO_DEPRECATED;

          failFlees = outdatedFailFlees;
        }

        const successFleesText = _.sortBy(successFlees, flee => flee.stats.agility).map(flee => `Успешно при 🤸‍♂️&gt; ${flee.stats.agility || flee.agility}`).shift();
        const failFleesText = _.sortBy(failFlees, flee => -flee.stats.agility).map(flee => `Неудача при 🤸‍♂️&lt; ${flee.stats.agility || flee.agility} (-💔${flee.damageReceived})`).shift();

        return {
          successFlees: _.isEmpty(successFlees) ? 'Нет данных об удачных побегах' : successFleesText,
          failFlees: _.isEmpty(failFlees) ? 'Нет данных о неудачных побегах' : failFleesText,
        };
      };

      const getConcussions = (concussions) => {
        if (_.isEmpty(concussions)) {
          return 'Нет данных';
        }

        const filterdConcussions = concussions.filter(({ stats }) => stats !== undefined);

        const actualConcussions = [];
        const outdatedConcussions = [];
        let existingConcussions = [];


        filterdConcussions.forEach((concussion) => {
          if (concussion.version === VERSION) {
            actualConcussions.push(`▫️ ${concussion.amount} 💫оглушений при 🤸🏽‍♂️${concussion.stats.agility}`);
          } else {
            outdatedConcussions.push(`▫️ ${concussion.amount} 💫оглушений при 🤸🏽‍♂️${concussion.stats.agility}`);
          }
        });

        if (actualConcussions.length > 0) {
          if (actualConcussions.length >= actualDataThreshold || outdatedConcussions.length === 0) {
            isConcussionsDeprecated = INFO_ACTUAL;

            existingConcussions = actualConcussions;
          } else if (actualConcussions.length <= actualDataThreshold && outdatedConcussions.length > 0) {
            isConcussionsDeprecated = INFO_MIXED;

            existingConcussions = [
              ...actualConcussions,
              ...outdatedConcussions,
            ];
          }
        } else if (outdatedConcussions.length > 0) {
          isConcussionsDeprecated = INFO_DEPRECATED;

          existingConcussions = outdatedConcussions;
        }

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
          if (actualSuccessBattles.length >= actualDataThreshold || outdatedSuccessBattles.length === 0) {
            isBattlesDeprecated.success = INFO_ACTUAL;

            successBattles = actualSuccessBattles;
          } else if (actualSuccessBattles.length <= actualDataThreshold && outdatedSuccessBattles.length > 0) {
            isBattlesDeprecated.success = INFO_MIXED;

            successBattles = [
              ...actualSuccessBattles,
              ...outdatedSuccessBattles,
            ];
          }
        } else if (outdatedSuccessBattles.length > 0) {
          isBattlesDeprecated.success = INFO_DEPRECATED;

          successBattles = outdatedSuccessBattles;
        }

        if (actualFailBattles.length > 0) {
          if (actualFailBattles.length >= actualDataThreshold || outdatedFailBattles.length === 0) {
            isBattlesDeprecated.fail = INFO_ACTUAL;

            failBattles = actualFailBattles;
          } else if (actualFailBattles.length <= actualDataThreshold && outdatedFailBattles.length > 0) {
            isBattlesDeprecated.fail = INFO_MIXED;

            failBattles = [
              ...actualFailBattles,
              ...outdatedFailBattles,
            ];
          }
        } else if (outdatedFailBattles.length > 0) {
          isBattlesDeprecated.fail = INFO_DEPRECATED;

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
      } = getBattles(beast.battles, 5, false, (config.env === 'STAGING' || config.env === 'LOCAL'));

      const {
        successBattles: successBattlesShort,
        failBattles: failBattlesShort,
      } = getBattles(beast.battles, 1, false, (config.env === 'STAGING' || config.env === 'LOCAL'));

      const processedFlees = getFlees(beast.flees);

      const lootReply = `<b>[ДРОП]</b>
${getDrop(beast.capsReceived, beast.materialsReceived)}

<b>[ВОЗМОЖНЫЙ ЛУТ]</b>
${getItems(beast.receivedItems)}
`;

      const shortBattlesReply = `<b>[ПОБЕДА]</b>${getDeprecatedFlair(isBattlesDeprecated.success)}
${successBattlesShort}

<b>[НЕУДАЧА]</b>${getDeprecatedFlair(isBattlesDeprecated.fail)}
${failBattlesShort}
`;

      const longBattlesReply = `<b>[ПОБЕДА]</b>${getDeprecatedFlair(isBattlesDeprecated.success)}
${successBattlesLong}


<b>[НЕУДАЧА]</b>${getDeprecatedFlair(isBattlesDeprecated.fail)}
${failBattlesLong}
`;

      const concussionsReply = `<b>[ОГЛУШЕНИЯ]</b>
${getConcussions(beast.concussions)}
`;

      const fleesReply = `<b>[ПОБЕГ]</b>
<i>=УСПЕШНЫЕ=</i>${getDeprecatedFlair(isFleesDeprecated.success)}
${processedFlees.successFlees}
---
<i>=НЕУДАЧА=</i>${getDeprecatedFlair(isFleesDeprecated.fail)}
${processedFlees.failFlees}
`;

      const headerReply = `<b>${beast.name}</b>
👣${beast.type === 'DarkZone' ? '🚷' : '💀'} ${getDistanceRange(beast.distanceRange)}км ${getDeprecatedFlair(isRangeDeprecated, true, true)}
`;

      const infoFooterReply = '———————————\nЧто значат иконки ⚠️/✅/‼️? Жми /help_icons';
      switch (route) {
        case 'info':
          resolve({
            reply: `${headerReply}\n${shortBattlesReply}\n${fleesReply}\n${infoFooterReply}`,
            beast,
          });
          break;
        case 'loot':
          resolve({
            reply: `${getDeprecatedFlair(isLootDeprecated, false)}${headerReply}\n${lootReply}`,
            beast,
          });
          break;
        case 'battles':
          resolve({
            reply: `${headerReply}\n${longBattlesReply}`,
            beast,
          });
          break;
        case 'concussions':
          resolve({
            reply: `${getDeprecatedFlair(isConcussionsDeprecated, false)}${headerReply}\n${concussionsReply}`,
            beast,
          });
          break;
        default:
          resolve({
            reply: `${headerReply}\n${shortBattlesReply}\n${fleesReply}`,
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
