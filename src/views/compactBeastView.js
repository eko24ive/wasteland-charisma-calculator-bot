require('dotenv').config({ path: '../../.env' });
const _ = require('underscore');

const actualDataThreshold = Number(process.env.DATA_THRESHOLD);

const INFO_ABSENT = -1;
const INFO_ACTUAL = 0;
const INFO_MIXED = 1;
const INFO_DEPRECATED = 2;

const compactBeastView = (Beast, seachParams, route = null, config) => new Promise((resolve) => {
  const { VERSION } = config;

  Beast.findOne(seachParams).then((fBeast) => {
    if (fBeast !== null) {
      console.log(`Browsing in compact view: ${fBeast._id.toJSON()} `);
      
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

      const getItems = () => 'Раздел находится на тех-профилактике';

      const minMax = (array) => {
        const min = _.min(array);
        const max = _.max(array);

        if (min !== max) {
          return `${min}-${max}`;
        }

        return `${min}`;
      };
      const averageValue = (array) =>{
        const min = _.min(array);
        const max = _.max(array);
        let av = 0;
        if (min !== max) {
          av=Math.floor(min+max/2);
          return `${av}`;
        }

        return `${min}`;

      }
      const getMobHealth = (beast) => {
        var lostBattleDealtDamage = [];
        var wonBattleDealtDamage = [];
        
        beast.battles.forEach((battle)=>{
          if(battle.outcome==='lost'){
            lostBattleDealtDamage.push(battle.totalDamageGiven);
          }else if(battle.outcome==='win'){
            wonBattleDealtDamage.push(battle.totalDamageGiven);
          }
        })

        return `[ХП]❤️\n ▫️ ${_.max(lostBattleDealtDamage)}-${_.min(wonBattleDealtDamage)}`;

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
          reply += `📦${materialsInformation} материалов\n`;
        }

        return reply;
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
      const getBattles =(beast) =>{
        var lostBattlesReceivedDamage = [];
        var lostBattleArmor=[];
        var wonBattlesReceivedDamage = [];
        var wonBattleArmor=[];
        beast.battles.forEach((battle)=>{
            if(battle.outcome==='lost'){
              
                lostBattlesReceivedDamage.push(battle.totalDamageReceived);
                lostBattleArmor.push(battle.stats.armor);
            }else if(battle.outcome==='win'){
             
                wonBattlesReceivedDamage.push(battle.totalDamageReceived);
              wonBattleArmor.push(battle.stats.armor);
              }
      
            })
        return `️ ▫️ 💔(-${minMax(lostBattlesReceivedDamage)}) при средней 🛡${averageValue(lostBattleArmor)} \n `;
      }

      const getBattlesLong = (battles, trim, small, withLinks = false) => {
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

      const getFlees = (beast)=>{
              let failedFleesAgility = [];
              let failedFleesDmg = [];
              let successFleesAgility = [];
              beast.flees.forEach((flee)=>{
                if(flee.outcome==='lose'){
                  
                  failedFleesAgility.push(flee.stats.agility);
                  failedFleesDmg.push(flee.damageReceived);
                   
                }else if(flee.outcome==='win')
                  
                    successFleesAgility.push(flee.stats.agility);
                  
                  
                  return `У этого побега почему-то нет характеристик брони и урона игрока - ничего не могу вывести.`;
                  
              })
              let ind = failedFleesAgility.indexOf(_.max(failedFleesAgility));
              if(successFleesAgility.length>0){

                return `[Побег] 🏃\n ▫️ ❌ при 🤸‍♀️${_.max(failedFleesAgility)} 💔(-${failedFleesDmg[ind]})\n ▫️ ✅ при 🤸‍♀️${_.min(successFleesAgility)}`;
              }else{
                return `[Побег] 🏃\n ▫️ ❌ при 🤸‍♀️${_.max(failedFleesAgility)} 💔(-${failedFleesDmg[ind]})\n ▫️ ✅ удачных побегов еще нету :( 🤸‍♀️`;
              }
              
        }
      const {
        successBattles: successBattlesLong,
        failBattles: failBattlesLong,
      } = getBattlesLong(beast.battles, 5, false, (config.env === 'STAGING' || config.env === 'LOCAL'));


      const concussionsReply = `<b>[ОГЛУШЕНИЯ]</b>
${getConcussions(beast.concussions)}
`;

const lootReply = `<b>[ДРОП]</b>
${getDrop(beast.capsReceived, beast.materialsReceived)}

<b>[ВОЗМОЖНЫЙ ЛУТ]</b>
${getItems(beast.receivedItems)}
`;

const longBattlesReply = `<b>[ПОБЕДА]</b>${getDeprecatedFlair(isBattlesDeprecated.success)}
${successBattlesLong}
<b>[НЕУДАЧА]</b>${getDeprecatedFlair(isBattlesDeprecated.fail)}
${failBattlesLong}
`;


      
      let beastMarker;

      if (beast.isDungeon) {
        beastMarker = '📯';
      } else {
        beastMarker = beast.type === 'DarkZone' ? '🚷' : '💀';
      }
      
    
      const headerReply = `<b>${beast.name}</b>
👣${beastMarker} Был замечен на ${getDistanceRange(beast.distanceRange)} км`;    
      const battleDamage = `${getBattles(beast)}`;
      const fleess = `${getFlees(beast)}`;
      const infoFooterReply = '———————————\nЧто значат иконки ⚠️/✅/‼️? Жми /help_icons';
      switch (route) {
        case 'info':
          resolve({
            reply: `${headerReply}\n${getMobHealth(beast)}\n[Урон]⚔️\n${battleDamage}${fleess}\n${infoFooterReply}`,
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
            reply: `${headerReply}\n${getMobHealth(beast)}\n[Урон]⚔️\n${battleDamage}\n${fleess}\n${infoFooterReply}`,
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

module.exports = compactBeastView;
