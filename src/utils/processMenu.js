const processMenu = menu => {
    if (menu.content === undefined) {
        return [{
            title: 'Назад',
            name: 'equipment_menu-back'
        }];
    }

    const buttons = menu.content.map(menuItem => {
        const {title, name} = menuItem;
        
        return {title, name};
    });

    return buttons;
};

module.exports = processMenu;