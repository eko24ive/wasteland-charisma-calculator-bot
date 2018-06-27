const suppliesText = `
🗃<b>Припасы</b> можно найти в пустоши, получить победив мобов, пройдя квестовые локации и т.д.

🍱<b>Еда</b>: уменьшает процент 🍗Голода, добавляет либо отнимает ❤️Здоровье.

🍹<b>Баффы</b>: дают временный прирост Навыков
`;

const foodText = `
🍱<b>Еда</b> уменьшает процент 🍗Голода. От некоторой еды дополнительно повышается или понижается оставшееся здоровье. Еда +2❤️ и более дает оверхил.

▫️ <b>Луковица</b> 5%🍗
▫️ <b>Помидор</b> 8%🍗
▫️ <b>Конфета</b> 11%🍗 
▫️ <b>Булочка</b> 13-14%🍗 
▫️ <b>Морковь</b> 13-14%🍗 
▫️ <b>Человечина</b> 13-14%🍗 
▫️ <b>Эдыгейский сыр</b> 13-14%🍗 
▫️ <b>Мясо белки</b> 16%🍗 
▫️ <b>Собачатина</b> 16%🍗 
▫️ <b>Абрик*с</b> 17-18%🍗 
▫️ <b>Сухари</b> 20%🍗 
▫️ <b>Чипсы</b> 20%🍗 
▫️ <b>Голубь</b> 22-23%🍗 
▫️ <b>Сырое мясо</b> 24-25%🍗 
▫️ <b>Мясо утки</b> 24-25%🍗 
▫️ <b>Хомячок</b> 24-25%🍗 

▫️ <b>Красная слизь</b> 2-3%🍗, +8❤️
▫️ <b>Луковица</b> 18%🍗, +2❤️ 
▫️ <b>Сухофрукты</b> 23%🍗, +2❤️ 
▫️ <b>Молоко брамина</b> 23-24%🍗, +3❤️ 
▫️ <b>Вяленое мясо</b> 26-27🍗, +2❤️ 
▫️ <b>Тесто в мясе</b> 27%🍗, +2❤️ 
▫️ <b>Сахарные бомбы</b> 28-29%🍗, +1❤️ 
▫️ <b>Консервы</b> 33-34%🍗, +1❤️ 
▫️ <b>Радсмурф</b> 35%🍗, +3❤️ 
▫️ <b>Мутафрукт</b> 36%🍗, +2❤️ 

▫️ <b>Что-то тухлое</b> 5%🍗, -1💔 
▫️ <b>Гнилой апельсин</b> 11-12%🍗, -1💔 
▫️ <b>Гнилое мясо</b> 16%🍗, -2💔 
▫️ <b>Не красная слизь</b> 34%🍗, -4💔
`;

const buffText = `
🍹<b>Баффы</b> дают временный прирост Навыков 

<b>Холодное пиво</b> - на 10 минут 
   💪Сила +2, 🗣Харизма +2 

<b>Виски</b> - на 10 минут 
   💪Сила +3, 🗣Харизма +5 

<b>Бурбон</b> - на 10 минут 
   💪Сила +4, 🗣Харизма +6 

<b>Абсент</b> - на 42 минут 
   💪Сила +25, 🗣Харизма +15

<b>Глюконавт</b> - на 10 минут 
   🗣Харизма +4, 🤸🏽‍♂️Ловкость +10 

<b>Психонавт</b> - на 35 минут 
   🗣Харизма +15, 🤸🏽‍♂️Ловкость +24

<b>Ментаты</b> - на 10 минут 
   🗣Харизма +7, 🤸🏽‍♂️Ловкость +3 

<b>Психо</b> - на 10 минут 
   💪Сила +10, 🤸🏽‍♂️Ловкость +6 

<b>Винт</b> - на 20 минут 
   💪Сила +5, 🤸🏽‍♂️Ловкость +3 

<b>Ультравинт</b> - на 30 минут 
   💪Сила +20, 🤸🏽‍♂️Ловкость +20

-----

<b>Скума</b> - на 10 минут 
   Неизвестные параметры +20, +15
`;

const suppliesMenu = {
    config: {
        parseMode: 'html'
    },
    name: 'supplies',
    title: '🗃Припасы',
    text: suppliesText,
    content: [{
            name: 'suppliesFood',
            title: '🍱Еда',
            text: foodText,
            content: []
        },
        {
            name: 'suppliesBuffs',
            title: '🍹Баффы',
            text: buffText,
            content: []
        }
    ]
};

module.exports = suppliesMenu;
