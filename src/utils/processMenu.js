const processMenu = menu => {
    const buttons = menu.content.map(menuItem => {
        const {title, name} = menuItem;
        
        return {title, name};
    });

    return buttons;
};

module.exports = processMenu;