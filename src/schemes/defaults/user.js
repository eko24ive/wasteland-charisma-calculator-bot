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
    buttonsAmount: 3,
    buttons: [
      {
        index: 0,
        label: '🏃СкинутьЛог',
        command: '/journeyforwardstart',
        state: true,
        order: 0,
      },
      {
        index: 1,
        label: '🎓Скилокчтр',
        command: '/skill_upgrade',
        state: true,
        order: 1,
      },
      {
        index: 2,
        label: '📔Энциклпдия',
        command: '/show_encyclopedia',
        state: true,
        order: 2,
      },
      {
        index: 3,
        label: '💀Мобы',
        command: '/show_beasts(regular)',
        state: true,
        order: 3,
      }, {
        index: 4,
        label: '🚷Мобы ТЗ',
        command: '/show_beasts(darkzone)',
        state: true,
        order: 4,
      },
      {
        index: 5,
        label: '🦂Гиганты',
        command: '/show_giants',
        state: true,
        order: 5,
      },
      {
        index: 6,
        label: '🏆Зал Славы',
        command: '/show_hall_of_fame',
        state: true,
        order: 6,
      },
      {
        index: 7,
        label: '💬Помощь',
        command: '/help',
        state: true,
        order: 7,
      },
      {
        index: 8,
        label: '⚙️Настройки',
        command: '/show_settings',
        state: true,
        order: 8,
      }, {
        index: 9,
        label: '🏜Все локации',
        command: '/locs_text',
        state: false,
        order: 9,
      }, {
        index: 10,
        label: '🤘Рейдовые локации',
        command: '/raids_text',
        state: false,
        order: 10,
      }, {
        index: 11,
        label: '🏜️Локации',
        command: '/locations',
        state: false,
        order: 11,
      }, {
        index: 12,
        label: '🎒Экипировка',
        command: '/eqp',
        state: false,
        order: 12,
      }, {
        index: 13,
        label: '🗃Припасы',
        command: '/sppl',
        state: false,
        order: 13,
      }, {
        index: 14,
        label: '✅Достижения',
        command: '/achv',
        state: false,
        order: 16,
      }, {
        index: 15,
        label: '🛰Дроны',
        command: '/show_drones',
        state: false,
        order: 14,
      }, {
        index: 16,
        label: '⚠️Подземелья',
        command: '/dng',
        state: false,
        order: 15,
      }, {
        index: 17,
        label: '🔄Команды при лагах',
        command: '/commands_for_lag',
        state: false,
        order: 17,
      }],
  },
};
