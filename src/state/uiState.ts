/**
 * An immediately invoked function expression that returns an object with
 * actions that operate on closed-over state.
 *
 * State in this file corresponds to UI properties.
 * See return object for action functions.
 */
export default (() => {
    type ModalType = (
        'none' |
        'addChild' |
        'addSibling' |
        'editNode' |
        'fileSave' |
        'fileOpen'
    );
    type MenuType = 'edit' | 'file';

    interface State {
        currentMenu: MenuType,
        currentModal: ModalType,
        sidebarIsVisible: boolean,
    }

    const state: State = {
        currentMenu: 'edit',
        currentModal: 'none',
        sidebarIsVisible: false,
    };

    return {
        getCurrentMenu: () => state.currentMenu,
        setCurrentMenu: (menu: MenuType) => { state.currentMenu = menu;  },

        getCurrentModal: () => state.currentModal,
        setCurrentModal: (modal: ModalType) => { state.currentModal = modal; },

        getSidebarIsVisible: () => state.sidebarIsVisible,
        setSidebarVisibility: (visible: boolean) => {
            state.sidebarIsVisible = visible;
        },

    };
})();
