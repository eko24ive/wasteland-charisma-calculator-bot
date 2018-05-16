const _ = require('underscore');

const regularBeastView = (Beast, seachParams) => {
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
        
                    return `
🕳${minMax(capsReceived)} крышек
📦${minMax(materialsReceived)} материалов
        `;
        
                }
        
                const getItems = items => {
                    if (_.isEmpty(items)) {
                        return 'Неизвестно'
                    }
        
                    return Object.keys(items).join(', ');
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
        
                const getBattles = battles => {
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
                                successBattles.push(`▫️ Успешно при уроне мобу ${battle.totalDamageGiven}.\nСтаты игрока: ⚔️Урон: ${battle.stats.damage} 🛡Броня: ${battle.stats.armor}.\nВсего урона от моба получено - 💔${battle.totalDamageReceived}\n`)
                            }
                        } else {
                            if (battle.stats !== undefined) {
                                failBattles.push(`▫️ Неудача при уроне мобу ${battle.totalDamageGiven}.\nСтаты игрока:⚔️Урон: ${battle.stats.damage} 🛡Броня: ${battle.stats.armor}.\nВсего урона от моба получено - 💔${battle.totalDamageReceived}\n`)
                            }
                        }
                    });
        
                    if (successBattles.length > 5) {
                        successBattles = successBattles.slice(0, 5);
                    }
        
                    if (failBattles.length > 5) {
                        failBattles = failBattles.slice(0, 5);
                    }
        
                    return {
                        successBattles: _.isEmpty(successBattles) ? 'Нет данных об удачных битвах' : successBattles.join('\n'),
                        failBattles: _.isEmpty(failBattles) ? 'Нет данных о неудачных битвах' : failBattles.join('\n')
                    }
                };
        
                const processedBattles = getBattles(beast.battles);
                const processedFlees = getFlees(beast.flees);
        
                let reply = `
*${beast.name}*
Был замечен на ${minMax(beast.distanceRange)}км

*[ДРОП]*
${getDrop(beast.capsReceived, beast.materialsReceived)}

*[ЛУТ]*
${getItems(beast.receivedItems)}

*[ПОБЕГ]*
${processedFlees.successFlees}

---

${processedFlees.failFlees}

*[ОГЛУШЕНИЯ]*
${getConcussions(beast.concussions)}

*[СТЫЧКИ]*
${processedBattles.successBattles}

---

${processedBattles.failBattles}
        `;

        resolve(reply);
            } else {
                reject(false);
            }
        }).catch(e => console.log(e));
    });
}

module.exports = regularBeastView;