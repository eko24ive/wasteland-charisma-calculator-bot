

const achievementsText = `
✅*Достижения* дают за определенные действия в игре:

▫️за употребление ❤️*Веществ* 
▫️за употребление 🍗*Еды* 
▫️в ⛺️*Лагере* 
▫️за 🎓*Обучение* 
▫️в 🍺*Баре* 
▫️в 👣*Пустоши* 
▫️в ⚔️*Бою*
`;

const educationText = `
*Достижения* получаемые за *🎓Обучение*: 

✅*E=mc^2а* 
   Изучить 3 навыка 

✅*Вжух!* 
   Приобрести очки ловкости 

✅*Не мешки ворочать* 
   Приобрести очки красноречия 

✅*Крепыш* 
   Приобрести очки силы
`;

const campText = `
*Достижения* получаемые в *⛺️Лагере*: 

*✅Лакшери лайф* 
   Приобрести свое собственное жилье 

*✅Наклей пленочку* 
   Купить самый дорогой предмет у торговца 

*✅Пупсоголик* 
   Поддержать проект материально. Спасибо!
`;

const chemsText = `
*Достижения* получаемые за употребление *❤️Веществ*: 

✅*Быстрее. Выше. Быстрее.*
   Употребить стероиды 

✅*Кривая дорожка*
   Использовать стимулятор 5 раз 

✅*Мне это нужно*
   Вколоть себе самопальный стимулятор 

✅*Шустрик*
   Использовать самодельные Speed-ы 

✅*Дисквалифицируй это*
   Употребить мельдоний.
`;

const fightText = `
*Достижения* получаемые в *⚔️Бою*: 

✅*С почином!* 
   Одержать победу над враждебным персонажем 

✅*Или ты, или тебя* 
   Напасть на другого игрока и одержать победу. 

✅*Французская тактика* 
   Убежать от противника. 

✅*Неудержимый* 
   Победить другого игрока 5 раз подряд 

✅*WH OFF!* 
   Одержать победу над игроком, выстрелив в него из винтовки 

✅*Буду гангстером* 
   Создать свою собственную банду.
`;

const wastelandText = `
*Достижения* получаемые в *👣Пустоши*: 

✅Дамский угодник 
   Пройти сюжетную линию "Спасение девушки" 

✅То, что нас не убивает 
   Пройти сюжетную линию "История о друге" 

✅4 8 15 16 23 42 
   Пробраться внутрь бункера  

✅Ой. Блять. 
   Попытаться вернуться в лагерь, потратив всю выносливость в Пустоши 

✅Потный 
   Пройти все испытания Пещеры Ореола и забрать свою награду 

✅Альтруист 
   Пройти сюжетную линию "Таинственный незнакомец" 

✅Кредитное рабство 
   Пройти сюжетную линию "Неожиданная находка"
`;

const barText = `
*Достижения* получаемые в *🍺Баре*: 

✅*Играй пока фартит*
   Набрать больше очков в дартс, чем твой оппонент 

✅*Уринотерапия*
   Впервые попробовать настоящее пиво. 

✅*Культурный отдых*
   Попробовать алкоголь в баре. 

✅*Стратег*
   Победить в шахматах.
`;

const foodText = `
*Достижения* получаемые за употребление *🍗Еды*: 

✅*Корейская кухня* 
   Попробовать собачатину. 

✅*И щепотку базилика!* 
   Съесть живого хомячка. Ну ты и сволочь 

✅*Волшебный вкус* 
   Съесть живого смурфика, приправленного щепоткой сильной радиации 

✅*Любитель птиц* 
   Съесть живого голубя
`;

const achievementsMenu = {
    config: {
        parseMode: 'markdown'
    },
    name: 'achievements',
    title: '✅Достижения',
    text: achievementsText,
    content: [
        {
            name: 'education',
            title: '🎓Обучение',
            text: educationText,
            content: []
        },
        {
            name: 'camp',
            title: '⛺️Лагерь',
            text: campText,
            content: []
        },
        {
            name: 'chems',
            title: '❤️Вещества',
            text: chemsText,
            content: []
        },
        {
            name: 'fight',
            title: '⚔️Бой',
            text: fightText,
            content: []
        },
        {
            name: 'wasteland',
            title: '👣Пустошь',
            text: wastelandText,
            content: []
        },
        {
            name: 'bar',
            title: '🍺Бар',
            text: barText,
            content: []
        },
        {
            name: 'food',
            title: '🍗Еда',
            text: foodText,
            content: []
        } 
    ]
};

module.exports = achievementsMenu;