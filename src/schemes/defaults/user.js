module.exports = {
  restricted: false,
  telegram: null,
  pip: {
    version: 0,
    faction: 'Нет данных',
    squad: 'Нет данных',
    name: 'Нет данных',
    health: 0,
    strength: 0,
    precision: 0,
    charisma: 0,
    agility: 0,
    endurance: 0,
    damage: 0,
    armor: 0,
    timeStamp: 0,
  },
  points: {
    score: 0,
    forwards: {
      beast: {
        wins: 0,
        loss: 0,
        flee: 0,
      },
      locations: 0,
      giants: 0,
    },
  },
  history: {
    pip: [],
  },
  settings: {
    buttons: [
      {
        label: '🏃СкинутьЛог',
        command: '/journeyforwardstart',
        main: true,
        order: 0,
      },
      {
        label: '🎓Скилокчтр',
        command: '/skill_upgrade',
        main: true,
        order: 1,
      },
      {
        label: '📔Энциклпдия',
        command: '/show_encyclopedia',
        main: true,
        order: 2,
      },
      {
        label: '💀Мобы',
        command: '/show_beasts(regular)',
        main: true,
        order: 3,
      }, {
        label: '🚷Мобы ТЗ',
        command: '/show_beasts(darkzone)',
        main: true,
        order: 4,
      },
      {
        label: '🏆Зал Славы',
        command: '/show_hall_of_fame',
        main: true,
        order: 6,
      }, {
        label: '🦂Гиганты',
        command: '/show_giants',
        main: true,
        order: 5,
      },
      {
        label: '💬Помощь',
        command: '/help',
        main: true,
        order: 7,
      },
      {
        label: '⚙️Настройки',
        command: '/show_settings',
        main: true,
        order: 8,
      }, {
        label: '🏜Все локации',
        command: '/locs_text',
        main: false,
        order: 9,
      }, {
        label: '🤘Рейдовые локации',
        command: '/raids_text',
        main: false,
        order: 10,
      }, {
        label: '🏜️Локации',
        command: '/locations',
        main: false,
        order: 11,
      }, {
        label: '🎒Экипировка',
        command: '/eqp',
        main: false,
        order: 12,
      }, {
        label: '🗃Припасы',
        command: '/sppl',
        main: false,
        order: 13,
      }, {
        label: '✅Достижения',
        command: '/achv',
        main: false,
        order: 16,
      }, {
        label: '🛰Дроны',
        command: '/show_drones',
        main: false,
        order: 14,
      }, {
        label: '⚠️Подземелья',
        command: '/dng',
        main: false,
        order: 15,
      }, {
        label: '🔄Команды при лагах',
        command: '/commands_for_lag',
        main: false,
        order: 17,
      }],
  },
};
