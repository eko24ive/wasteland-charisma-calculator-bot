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
                        if(flee.stats) {
                            if (flee.outcome === 'win') {
                                successFlees.push(`Успешно при 🤸‍♂️${flee.stats.agility || flee.agility}\n`);
                            } else {
                                failFlees.push(`Неудача при 🤸‍♂️${flee.stats.agility  || flee.agility} (-💔${flee.damageReceived})`);
                            }
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

                const getBattles = (battles, trim, small) => {
                    if (_.isEmpty(battles)) {
                        return {
                            successBattles: 'Нет данных об удачных битвах',
                            failBattles: 'Нет данных о неудачных битвах'
                        }
                    }

                    let successBattles = [];
                    let failBattles = [];

                    const damageReceived = battle => {
                        if(battle.damagesReceived[0] !== 0) {
                            return `💔${battle.totalDamageReceived} за ${battle.damagesReceived.length} удар(а)`;
                        }

                        return `💔${battle.totalDamageReceived}`;
                    }

                    battles.forEach(battle => {
                        if (battle.outcome === 'win') {
                            // TODO: Fix battle parse
                            if (battle.stats !== undefined) {
                                let battleReply;
                                if(small) {
                                    battleReply = `💔${battle.totalDamageReceived} урона за ${battle.damagesGiven.length} удар(а)`;
                                } else {
                                    battleReply = `▫️ Успешно при уроне мобу ${battle.totalDamageGiven}.\nСтаты игрока: ⚔️Урон: ${battle.stats.damage} 🛡Броня: ${battle.stats.armor}.\nВсего урона от моба получено -${damageReceived(battle)}`;
                                }
                                successBattles.push({battleReply, totalDamageGiven: battle.totalDamageGiven})
                            }
                        } else {
                            if (battle.stats !== undefined) {
                                let battleReply;
                                if(small) {
                                    battleReply = `💥${battle.totalDamageGiven} не хватило мобу за ${battle.damagesGiven.length} удар(а)`;
                                } else {
                                    battleReply = `▫️ Неудача при уроне мобу ${battle.totalDamageGiven}.\nСтаты игрока:⚔️Урон: ${battle.stats.damage} 🛡Броня: ${battle.stats.armor}.\nВсего урона от моба получено -${damageReceived(battle)}`;
                                }

                                failBattles.push({battleReply, totalDamageReceived: battle.totalDamageReceived})
                            }
                        }
                    });

                    if (successBattles.length > trim) {
                        successBattles = _.first(_.sortBy(successBattles, 'totalDamageGiven'),trim);
                    }

                    if (failBattles.length > trim) {
                        failBattles = _.last(_.sortBy(failBattles, 'totalDamageReceived'),trim);
                    }

                    successBattles = successBattles.map(battle => battle.battleReply);
                    failBattles = failBattles.map(battle => battle.battleReply);

                    return {
                        successBattles: _.isEmpty(successBattles) ? 'Нет данных об удачных битвах' : successBattles.join('\n\n'),
                        failBattles: _.isEmpty(failBattles) ? 'Нет данных о неудачных битвах' : failBattles.join('\n\n')
                    }
                };

                const {
                    successBattles: successBattlesLong,
                    failBattles: failBattlesLong
                } = getBattles(beast.battles,5, false);

                const {
                    successBattles: successBattlesShort,
                    failBattles: failBattlesShort
                } = getBattles(beast.battles, 1, false);

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
👣${beast.type === 'DarkZone' ? '🚷' : '💀'} ${minMax(beast.distanceRange)}км
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
                resolve({
                    reply: false
                });
            }
        }).catch(e => console.log(e));
    });
}

module.exports = routedBeastView;