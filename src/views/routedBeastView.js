const _ = require('underscore');

const routedBeastView = (Beast, seachParams, route) => {
    return new Promise((resolve, reject) => {
        Beast.findOne(seachParams).then(fBeast => {
            if (fBeast !== null) {
                const beast = fBeast.toJSON();
        
        
                const minMax = (array) => {
                    const min = _.min(array);
                    const max = _.max(array);
        
                    if (min !== max) {
                        return `${min}-${max}`;
                    }
        
                    return `${min}`;
                }
        
                const getDrop = (capsReceived, materialsReceived) => {
                    if (_.isEmpty(capsReceived) && _.isEmpty(materialsReceived)) {
                        return 'Нет данных';
                    }
        
                    return `🕳${minMax(capsReceived)} крышек
📦${minMax(materialsReceived)} материалов
        `;
        
                }
        
                const getItems = items => {
                    if (_.isEmpty(items)) {
                        return 'Неизвестно'
                    }
        
                    return Object.keys(items).map(key => {
                        const drops = _.flatten(items[key]);
                        const dropAmount = minMax(drops);

                        return `${key}: x${dropAmount}`;
                    }).join('\n');
                }
        
                const getFlees = flees => {
                    if (_.isEmpty(flees)) {
                        return {
                            successFlees: 'Нет данных об удачных побегах',
                            failFlees: 'Нет данных о неудачных побегах'
                        }
                    }
        
                    let successFlees = [];
                    let failFlees = [];
        
                    flees.forEach(flee => {
                        if (flee.outcome === 'win') {
                            successFlees.push(`▫️ Успешно при 🤸🏽‍♂️${flee.stats.agility || flee.agility}\n`);
                        } else {
                            failFlees.push(`▫️ Не успешно при 🤸🏽‍♂️${flee.stats.agility  || flee.agility}, урон - 💔${flee.damageReceived}`);
                        }
                    });
        
                    if (successFlees.length > 5) {
                        successFlees = successFlees.slice(0, 5);
                    }
        
                    if (failFlees.length > 5) {
                        failFlees = failFlees.slice(0, 5);
                    }
        
                    return {
                        successFlees: _.isEmpty(successFlees) ? 'Нет данных об удачных побегах' : successFlees.join('\n'),
                        failFlees: _.isEmpty(failFlees) ? 'Нет данных о неудачных побегах' : failFlees.join('\n')
                    }
                }
        
                const getConcussions = concussions => {
                    if (_.isEmpty(concussions)) {
                        return 'Нет данных';
                    }
        
                    const mappedConcussions = concussions.map(concussion => {
                        // TODO: Fix concussion parse
                        if (concussion.stats !== undefined) {
                            return `▫️ ${concussion.amount} 💫оглушений при 🤸🏽‍♂️${concussion.stats.agility}`;
                        }
        
                        return false
                    }).filter(concussion => concussion !== false);
        
                    if (_.isEmpty(mappedConcussions)) {
                        return 'Нет данных';
                    }
        
                    return mappedConcussions.join('\n');
                }
        
                const getBattles = (battles, trim) => {
                    if (_.isEmpty(battles)) {
                        return {
                            successBattles: 'Нет данных об удачных битвах',
                            failBattles: 'Нет данных о неудачных битвах'
                        }
                    }
        
                    let successBattles = [];
                    let failBattles = [];
        
                    battles.forEach(battle => {
                        if (battle.outcome === 'win') {
                            // TODO: Fix battle parse
                            if (battle.stats !== undefined) {
                                const battleReply = `▫️ Успешно при уроне мобу ${battle.totalDamageGiven}.\nСтаты игрока: ⚔️Урон: ${battle.stats.damage} 🛡Броня: ${battle.stats.armor}.\nВсего урона от моба получено - 💔${battle.totalDamageReceived}\n`;
                                successBattles.push({battleReply, totalDamageGiven: battle.totalDamageGiven})
                            }
                        } else {
                            if (battle.stats !== undefined) {
                                const battleReply = `▫️ Неудача при уроне мобу ${battle.totalDamageGiven}.\nСтаты игрока:⚔️Урон: ${battle.stats.damage} 🛡Броня: ${battle.stats.armor}.\nВсего урона от моба получено - 💔${battle.totalDamageReceived}\n`;
                                failBattles.push({battleReply, totalDamageReceived: battle.totalDamageReceived})
                            }
                        }
                    });
        
                    if (successBattles.length > trim) {
                        successBattles = _.first(_.sortBy(successBattles, 'totalDamageGiven'),trim).map(battle => battle.battleReply);
                    }
        
                    if (failBattles.length > trim) {
                        failBattles = _.last(_.sortBy(failBattles, 'totalDamageReceived'),trim).map(battle => battle.battleReply);
                    }
        
                    return {
                        successBattles: _.isEmpty(successBattles) ? 'Нет данных об удачных битвах' : successBattles.join('\n'),
                        failBattles: _.isEmpty(failBattles) ? 'Нет данных о неудачных битвах' : failBattles.join('\n')
                    }
                };
        
                const {
                    successBattles: successBattlesLong,
                    failBattles: failBattlesLong
                } = getBattles(beast.battles,5);

                const {
                    successBattles: successBattlesShort,
                    failBattles: failBattlesShort
                } = getBattles(beast.battles,1);

                const processedFlees = getFlees(beast.flees);

                
const lootReply = `
*[ДРОП]*
${getDrop(beast.capsReceived, beast.materialsReceived)}

*[ВОЗМОЖНЫЙ ЛУТ]*
${getItems(beast.receivedItems)}
`;

const shortBattlesReply = `
*Бои с мобом при наименьшем уроне ему, и от него*:

${successBattlesShort}
---
${failBattlesShort}
`;

const longBattlesReply = `
*[СТЫЧКИ]*
${successBattlesLong}

---

${failBattlesLong}
`;

const concussionsReply = `
*[ОГЛУШЕНИЯ]*
${getConcussions(beast.concussions)}
`;

const fleesReply = `
*[ПОБЕГ]*
${processedFlees.successFlees}
---
${processedFlees.failFlees}
`;

const headerReply = `
*${beast.name}*
Был замечен на ${minMax(beast.distanceRange)}км
`;
 
        switch(route) {
            case 'info':
                resolve({
                    reply: `${headerReply}\n${shortBattlesReply}\n${fleesReply}`,
                    beast
                });
            break;
            case 'loot':
                resolve({
                    reply: `${headerReply}\n${lootReply}`,
                    beast
                });
            break;
            case 'battles':
                resolve({
                    reply: `${headerReply}\n${longBattlesReply}`,
                    beast
                });
            break;
            case 'concussions':
                resolve({
                    reply: `${headerReply}\n${concussionsReply}`,
                    beast
                });
            break;
            default:
                resolve({
                    reply: `${headerReply}\n${shortBattlesReply}\n${fleesReply}`,
                    beast
                });
            break;
        }
            } else {
                resolve(false);
            }
        }).catch(e => console.log(e));
    });
}

module.exports = routedBeastView;